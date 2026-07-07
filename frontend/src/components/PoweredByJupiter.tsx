import { useI18n } from '@/lib/i18n/i18n-context';
import { JUPITER_LOCK_UI } from '@/lib/jupiter-lock/constants';
import { X_SYMBOL } from '@/config/constants';
import { cn } from '@/lib/cn';

const JUPITER_LOGO_SRC = '/juplogo.png';
const SOLANA_LOGO_SRC = '/solana.png';
const X_LOGO_SRC = '/xai.svg';

type PoweredByJupiterProps = {
  /** Larger logos for trust blocks; compact for header/footer */
  variant?: 'compact' | 'wordmark';
  className?: string;
};

type PartnerBadgeProps = {
  href: string;
  label: string;
  logoSrc: string;
  logoClassName?: string;
  large?: boolean;
  ariaLabel: string;
};

function PartnerBadge({
  href,
  label,
  logoSrc,
  logoClassName,
  large,
  ariaLabel,
}: PartnerBadgeProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-90"
    >
      <img
        src={logoSrc}
        alt=""
        draggable={false}
        aria-hidden
        className={cn(
          'shrink-0 object-contain',
          large ? 'h-8 w-8 sm:h-9 sm:w-9' : 'h-4 w-4',
          logoClassName,
        )}
      />
      <span
        className={cn(
          'font-semibold text-foreground',
          large ? 'text-sm sm:text-base' : 'text-[11px]',
        )}
      >
        {label}
      </span>
    </a>
  );
}

export function PoweredByJupiter({
  variant = 'compact',
  className,
}: PoweredByJupiterProps) {
  const { t } = useI18n();
  const large = variant === 'wordmark';

  return (
    <span
      className={cn(
        'jupiter-brand inline-flex',
        large ? 'flex-col items-start gap-2' : 'flex-wrap items-center gap-x-2.5 gap-y-1.5',
        className,
      )}
    >
      <span
        className={cn(
          'font-medium text-muted-foreground',
          large ? 'text-[10px] font-semibold uppercase tracking-[0.18em]' : 'text-[11px]',
        )}
      >
        {t('common.poweredByJupiter')}
      </span>
      <span
        className={cn(
          'inline-flex flex-wrap items-center',
          large ? 'gap-x-4 gap-y-2' : 'gap-x-2.5 gap-y-1.5',
        )}
      >
        <PartnerBadge
          href={JUPITER_LOCK_UI}
          logoSrc={JUPITER_LOGO_SRC}
          label={t('common.jupiter')}
          large={large}
          ariaLabel={t('powered.jupiterAria')}
        />
        <PartnerBadge
          href="https://solana.com"
          logoSrc={SOLANA_LOGO_SRC}
          label={t('common.solana')}
          large={large}
          ariaLabel={t('powered.solanaAria')}
        />
        <PartnerBadge
          href="https://x.com"
          logoSrc={X_LOGO_SRC}
          logoClassName="invert"
          label={X_SYMBOL}
          large={large}
          ariaLabel={t('powered.xAria')}
        />
      </span>
    </span>
  );
}
