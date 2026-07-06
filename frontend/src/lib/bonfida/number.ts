import BN from 'bn.js';

/** Bonfida wire format: u64 little-endian */
export class Numberu64 extends BN {
  constructor(value?: BN | number | string) {
    super(value ?? 0);
  }

  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 8) return b;
    if (b.length > 8) throw new Error('Numberu64 too large');
    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }

  static fromBuffer(buffer: Buffer): BN {
    if (buffer.length !== 8) {
      throw new Error(`Invalid buffer length: ${buffer.length}`);
    }
    return new BN(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(''),
      16,
    );
  }
}

/** Bonfida wire format: u32 little-endian */
export class Numberu32 extends BN {
  constructor(value?: BN | number | string) {
    super(value ?? 0);
  }

  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 4) return b;
    if (b.length > 4) throw new Error('Numberu32 too large');
    const zeroPad = Buffer.alloc(4);
    b.copy(zeroPad);
    return zeroPad;
  }
}
