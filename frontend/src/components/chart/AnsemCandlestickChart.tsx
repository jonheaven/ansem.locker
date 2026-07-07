import { useEffect, useRef } from 'react';
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts';
import type { AsterKlineBar } from '@/lib/aster/aster-client';
import { cn } from '@/lib/cn';

const CHART_UP = '#059669';
const CHART_DOWN = '#dc2626';
const CHART_TEXT = '#6b7280';
const CHART_GRID = 'rgba(15, 23, 42, 0.06)';

type AnsemCandlestickChartProps = {
  bars: AsterKlineBar[];
  className?: string;
};

function toCandle(bar: AsterKlineBar): CandlestickData {
  return {
    time: bar.time as UTCTimestamp,
    open: bar.open,
    high: bar.high,
    low: bar.low,
    close: bar.close,
  };
}

export function AnsemCandlestickChart({ bars, className }: AnsemCandlestickChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = createChart(container, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: CHART_TEXT,
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: CHART_GRID },
        horzLines: { color: CHART_GRID },
      },
      crosshair: {
        mode: CrosshairMode.Magnet,
        vertLine: {
          width: 1,
          color: 'rgba(15, 23, 42, 0.18)',
          labelBackgroundColor: '#0f172a',
        },
        horzLine: {
          width: 1,
          color: 'rgba(15, 23, 42, 0.18)',
          labelBackgroundColor: '#0f172a',
        },
      },
      rightPriceScale: {
        borderVisible: false,
        scaleMargins: { top: 0.12, bottom: 0.08 },
      },
      timeScale: {
        borderVisible: false,
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 6,
        barSpacing: 7,
        minBarSpacing: 3,
      },
      handleScroll: { vertTouchDrag: false },
    });

    const series = chart.addSeries(CandlestickSeries, {
      upColor: CHART_UP,
      downColor: CHART_DOWN,
      borderVisible: false,
      wickUpColor: CHART_UP,
      wickDownColor: CHART_DOWN,
    });

    chartRef.current = chart;
    seriesRef.current = series;

    return () => {
      chart.remove();
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, []);

  useEffect(() => {
    const series = seriesRef.current;
    const chart = chartRef.current;
    if (!series || !chart || bars.length === 0) return;

    series.setData(bars.map(toCandle));
    chart.timeScale().fitContent();
  }, [bars]);

  return (
    <div
      ref={containerRef}
      className={cn('h-full min-h-[320px] w-full', className)}
      aria-hidden
    />
  );
}
