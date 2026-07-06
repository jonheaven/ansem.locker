//! ansem.locker — non-custodial SPL token timelock for $ANSEM.
//!
//! Tokens are held in a program-derived vault until `unlock_ts` (Solana Clock).
//! No admin keys. No mint other than $ANSEM. Vault rent is returned on withdraw.

use anchor_lang::prelude::*;
use anchor_spl::token::{self, CloseAccount, Mint, Token, TokenAccount, Transfer};

declare_id!("9kUCT9jHMXyJ566P6LdBkjtivdMoQxVtshEM6hP5dwGS");

/// $ANSEM — The Black Bull (pump.fun SPL mint).
pub const ANSEM_MINT: Pubkey = pubkey!("9cRCn9rGT8V2imeM2BaKs13yhMEais3ruM3rPvTGpump");

pub const MIN_LOCK_SECONDS: i64 = 3_600;
pub const MAX_LOCK_SECONDS: i64 = 315_360_000;

#[program]
pub mod ansem_locker {
    use super::*;

    /// Move `amount` $ANSEM from the owner ATA into a vault until `unlock_ts`.
    pub fn create_lock(
        ctx: Context<CreateLock>,
        lock_id: u64,
        amount: u64,
        unlock_ts: i64,
    ) -> Result<()> {
        require!(amount > 0, LockerError::ZeroAmount);

        let clock = Clock::get()?;
        let now = clock.unix_timestamp;
        require!(unlock_ts > now, LockerError::UnlockInPast);

        let duration = unlock_ts
            .checked_sub(now)
            .ok_or(LockerError::MathOverflow)?;
        require!(duration >= MIN_LOCK_SECONDS, LockerError::LockTooShort);
        require!(duration <= MAX_LOCK_SECONDS, LockerError::LockTooLong);

        require_keys_eq!(ctx.accounts.mint.key(), ANSEM_MINT, LockerError::InvalidMint);
        require!(
            ctx.accounts.owner_token_account.amount >= amount,
            LockerError::InsufficientBalance
        );
        require!(
            ctx.accounts.owner_token_account.delegate.is_none(),
            LockerError::DelegatedAccount
        );

        let lock = &mut ctx.accounts.lock_state;
        lock.owner = ctx.accounts.owner.key();
        lock.mint = ANSEM_MINT;
        lock.amount = amount;
        lock.unlock_ts = unlock_ts;
        lock.created_ts = now;
        lock.lock_id = lock_id;
        lock.bump = ctx.bumps.lock_state;
        lock.vault_bump = ctx.bumps.vault_authority;
        lock.vault_ata_bump = ctx.bumps.vault;

        token::transfer(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.owner_token_account.to_account_info(),
                    to: ctx.accounts.vault.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
        )?;

        emit!(LockCreated {
            owner: lock.owner,
            lock_id,
            amount,
            unlock_ts,
            created_ts: now,
        });

        Ok(())
    }

    /// Return locked tokens after unlock time. Closes vault + lock accounts.
    pub fn withdraw(ctx: Context<Withdraw>) -> Result<()> {
        let lock = &ctx.accounts.lock_state;

        let clock = Clock::get()?;
        require!(
            clock.unix_timestamp >= lock.unlock_ts,
            LockerError::StillLocked
        );

        let amount = lock.amount;
        require!(ctx.accounts.vault.amount >= amount, LockerError::VaultBalanceMismatch);
        require!(amount > 0, LockerError::ZeroAmount);

        let lock_id_bytes = lock.lock_id.to_le_bytes();
        let vault_signer_seeds = &[
            b"vault",
            lock.owner.as_ref(),
            lock_id_bytes.as_ref(),
            &[lock.vault_bump],
        ];
        let vault_signer = &[&vault_signer_seeds[..]];

        token::transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.vault.to_account_info(),
                    to: ctx.accounts.owner_token_account.to_account_info(),
                    authority: ctx.accounts.vault_authority.to_account_info(),
                },
                vault_signer,
            ),
            amount,
        )?;

        let lock_key = lock.key();
        let vault_ata_seeds = &[
            b"vault-ata",
            lock_key.as_ref(),
            &[lock.vault_ata_bump],
        ];
        let vault_ata_signer = &[&vault_ata_seeds[..]];

        token::close_account(CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            CloseAccount {
                account: ctx.accounts.vault.to_account_info(),
                destination: ctx.accounts.owner.to_account_info(),
                authority: ctx.accounts.vault_authority.to_account_info(),
            },
            vault_signer,
        ))?;

        emit!(LockWithdrawn {
            owner: lock.owner,
            lock_id: lock.lock_id,
            amount,
        });

        Ok(())
    }
}

#[derive(Accounts)]
#[instruction(lock_id: u64, amount: u64, unlock_ts: i64)]
pub struct CreateLock<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(address = ANSEM_MINT)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        constraint = owner_token_account.mint == ANSEM_MINT @ LockerError::InvalidMint,
        constraint = owner_token_account.owner == owner.key() @ LockerError::InvalidOwner,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    #[account(
        init,
        payer = owner,
        space = 8 + LockState::INIT_SPACE,
        seeds = [b"lock", owner.key().as_ref(), &lock_id.to_le_bytes()],
        bump,
    )]
    pub lock_state: Account<'info, LockState>,

    /// CHECK: PDA token authority for the vault ATA.
    #[account(
        seeds = [b"vault", owner.key().as_ref(), &lock_id.to_le_bytes()],
        bump,
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        init,
        payer = owner,
        token::mint = mint,
        token::authority = vault_authority,
        seeds = [b"vault-ata", lock_state.key().as_ref()],
        bump,
    )]
    pub vault: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Withdraw<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,

    #[account(
        mut,
        constraint = lock_state.owner == owner.key() @ LockerError::InvalidOwner,
        close = owner,
        seeds = [b"lock", owner.key().as_ref(), &lock_state.lock_id.to_le_bytes()],
        bump = lock_state.bump,
    )]
    pub lock_state: Account<'info, LockState>,

    /// CHECK: PDA token authority.
    #[account(
        seeds = [
            b"vault",
            lock_state.owner.as_ref(),
            &lock_state.lock_id.to_le_bytes(),
        ],
        bump = lock_state.vault_bump,
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(
        mut,
        seeds = [b"vault-ata", lock_state.key().as_ref()],
        bump = lock_state.vault_ata_bump,
        constraint = vault.mint == ANSEM_MINT @ LockerError::InvalidMint,
    )]
    pub vault: Account<'info, TokenAccount>,

    #[account(
        mut,
        constraint = owner_token_account.mint == ANSEM_MINT @ LockerError::InvalidMint,
        constraint = owner_token_account.owner == owner.key() @ LockerError::InvalidOwner,
    )]
    pub owner_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[account]
#[derive(InitSpace)]
pub struct LockState {
    pub owner: Pubkey,
    pub mint: Pubkey,
    pub amount: u64,
    pub unlock_ts: i64,
    pub created_ts: i64,
    pub lock_id: u64,
    pub bump: u8,
    pub vault_bump: u8,
    pub vault_ata_bump: u8,
}

#[event]
pub struct LockCreated {
    pub owner: Pubkey,
    pub lock_id: u64,
    pub amount: u64,
    pub unlock_ts: i64,
    pub created_ts: i64,
}

#[event]
pub struct LockWithdrawn {
    pub owner: Pubkey,
    pub lock_id: u64,
    pub amount: u64,
}

#[error_code]
pub enum LockerError {
    #[msg("Lock amount must be greater than zero")]
    ZeroAmount,
    #[msg("Unlock timestamp must be in the future")]
    UnlockInPast,
    #[msg("Lock duration must be at least 1 hour")]
    LockTooShort,
    #[msg("Lock duration cannot exceed 10 years")]
    LockTooLong,
    #[msg("Only $ANSEM (The Black Bull) can be locked")]
    InvalidMint,
    #[msg("Token account owner mismatch")]
    InvalidOwner,
    #[msg("Insufficient $ANSEM balance")]
    InsufficientBalance,
    #[msg("Cannot lock from a delegated token account")]
    DelegatedAccount,
    #[msg("Tokens are still locked")]
    StillLocked,
    #[msg("Vault balance does not match lock record")]
    VaultBalanceMismatch,
    #[msg("Arithmetic overflow")]
    MathOverflow,
}
