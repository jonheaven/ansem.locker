import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export const BULL_SLIDER_THUMB_SRC = '/blackbull4.png';

type BullSliderProps = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  disabled?: boolean;
  ariaLabel: string;
  className?: string;
  /** Shorter track on mobile to save vertical space. */
  compact?: boolean;
  /** 0–1 — longer lock = more shake, scale, and speed. */
  bullishness?: number;
};

export function BullSlider({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  disabled,
  ariaLabel,
  className,
  compact = false,
  bullishness = 0,
}: BullSliderProps) {
  const span = max - min;
  const percent = span > 0 ? ((value - min) / span) * 100 : 0;
  const intensity = Math.min(1, Math.max(0, bullishness));
  /** Push CSS past 1.0 at max so the bull goes extra feral */
  const cssIntensity = intensity <= 0 ? 0 : intensity * (1 + intensity * 0.85);

  return (
    <div className={cn('bull-slider', disabled && 'pointer-events-none opacity-50', className)}>
      <div
        className={cn(
          'relative mx-7 sm:mx-8',
          compact ? 'h-10 sm:h-16' : 'h-14 sm:h-16',
        )}
      >
        <div
          className="absolute top-1/2 right-0 left-0 h-1 -translate-y-1/2 rounded-full bg-border"
          aria-hidden
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-75"
            style={{ width: `${percent}%` }}
          />
        </div>

        <div
          className="pointer-events-none absolute bottom-0 -translate-x-[42%]"
          style={{ left: `${percent}%` }}
        >
          <img
            src={BULL_SLIDER_THUMB_SRC}
            alt=""
            draggable={false}
            className={cn(
              compact ? 'h-8 w-auto sm:h-12' : 'h-10 w-auto sm:h-12',
              intensity > 0.03 && 'bull-thumb-charge',
              intensity > 0.72 && 'bull-thumb-rage',
            )}
            style={
              {
                '--bull-intensity': cssIntensity,
              } as CSSProperties
            }
          />
        </div>

        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          disabled={disabled}
          aria-label={ariaLabel}
          onChange={(e) => onChange(Number(e.target.value))}
          className="absolute inset-0 z-10 h-full w-full cursor-grab appearance-none bg-transparent active:cursor-grabbing disabled:cursor-not-allowed [&::-moz-range-thumb]:size-12 [&::-moz-range-thumb]:cursor-grab [&::-moz-range-thumb]:rounded-none [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:bg-transparent [&::-webkit-slider-thumb]:size-12 [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-transparent"
        />
      </div>
    </div>
  );
}
