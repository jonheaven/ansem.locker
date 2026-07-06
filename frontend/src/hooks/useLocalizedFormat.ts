import { MIN_LOCK_MINUTES, MAX_LOCK_DAYS } from '@/config/constants';
import { useI18n } from '@/lib/i18n/i18n-context';

export function useLocalizedFormat() {
  const { t, intlLocale } = useI18n();

  const formatUnlockDate = (unixTs: number): string =>
    new Date(unixTs * 1000).toLocaleDateString(intlLocale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  const formatTimeRemaining = (
    unixTs: number,
    nowSec = Math.floor(Date.now() / 1000),
  ): string => {
    const sec = Math.max(0, unixTs - nowSec);
    if (sec < 60) return t('duration.under1m');
    if (sec < 3600) return t('duration.minutesLeft', { n: Math.ceil(sec / 60) });
    if (sec < 86_400) {
      const h = Math.floor(sec / 3600);
      const m = Math.ceil((sec % 3600) / 60);
      return m > 0 && h < 24
        ? t('duration.hoursMinutesLeft', { h, m })
        : t('duration.hoursLeft', { n: Math.ceil(sec / 3600) });
    }
    return t('duration.daysLeft', { n: Math.ceil(sec / 86_400) });
  };

  const formatDurationAhead = (
    unlockTs: number,
    nowSec = Math.floor(Date.now() / 1000),
  ): string => {
    const sec = Math.max(0, unlockTs - nowSec);
    if (sec < 60) return t('duration.inUnderMinute');

    const minutes = Math.floor(sec / 60);
    const hours = Math.floor(sec / 3600);
    const days = Math.floor(sec / 86_400);

    if (sec < 3600) return t('duration.inMinutes', { n: minutes });
    if (sec < 86_400) {
      const m = Math.floor((sec % 3600) / 60);
      if (m === 0) return t('duration.inHours', { n: hours });
      return t('duration.inHoursMinutes', { h: hours, m });
    }
    if (days < 30) {
      const h = Math.floor((sec % 86_400) / 3600);
      if (h === 0 || days >= 7) return t('duration.inDays', { n: days });
      return t('duration.inDaysHours', { d: days, h });
    }
    if (days < 365) {
      const months = Math.floor(days / 30);
      const remDays = days % 30;
      if (remDays === 0 || months >= 6) return t('duration.inMonths', { n: months });
      return t('duration.inMonthsDays', { m: months, d: remDays });
    }
    const years = Math.floor(days / 365);
    const remMonths = Math.floor((days % 365) / 30);
    if (remMonths === 0) return t('duration.inYears', { n: years });
    return t('duration.inYearsMonths', { y: years, m: remMonths });
  };

  const validateUnlockTs = (
    unlockTs: number,
    nowSec = Math.floor(Date.now() / 1000),
  ): string | null => {
    const minTs = nowSec + MIN_LOCK_MINUTES * 60;
    const maxTs = nowSec + MAX_LOCK_DAYS * 86_400;
    if (unlockTs < minTs) {
      return t('duration.minUnlock', { n: MIN_LOCK_MINUTES });
    }
    if (unlockTs > maxTs) {
      return t('duration.maxUnlock');
    }
    return null;
  };

  const getBullishFlexLabel = (slider: number): string | null => {
    const pos = Math.min(1, Math.max(0, slider / 1000));
    if (pos < 0.12) return null;
    if (pos < 0.28) return t('duration.warmingUp');
    if (pos < 0.45) return t('duration.gettingBullish');
    if (pos < 0.62) return t('duration.bullMode');
    if (pos < 0.78) return t('duration.diamondHooves');
    if (pos < 0.92) return t('duration.seriousConviction');
    return t('duration.flexCommitment');
  };

  return {
    formatUnlockDate,
    formatTimeRemaining,
    formatDurationAhead,
    validateUnlockTs,
    getBullishFlexLabel,
  };
}
