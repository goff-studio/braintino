import React from 'react';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';
import { spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { currentWeekKeys, todayKey } from '@/utils/date';
import { AppText } from './AppText';

const MAX_MINUTES = 20;
const BAR_HEIGHT = 72;

/** Seven procedural bars of practice minutes for the current week. */
export function WeeklyChart({ minutesByDate }: { minutesByDate: Record<string, number> }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const today = todayKey();
  const keys = currentWeekKeys();

  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: spacing.sm }}>
      {keys.map((key, i) => {
        const minutes = minutesByDate[key] ?? 0;
        const ratio = Math.min(1, minutes / MAX_MINUTES);
        const fillHeight = Math.max(minutes > 0 ? 8 : 0, Math.round(ratio * BAR_HEIGHT));
        const isToday = key === today;
        return (
          <View
            key={key}
            style={{ flex: 1, alignItems: 'center', gap: spacing.xs }}
            accessibilityLabel={t('progress.weekdayMinutes', {
              day: t(`progress.weekdays.${i}`),
              minutes,
            })}
          >
            <View
              style={{
                width: '100%',
                maxWidth: 28,
                height: BAR_HEIGHT,
                borderRadius: 8,
                backgroundColor: colors.trackFaint,
                justifyContent: 'flex-end',
                overflow: 'hidden',
              }}
            >
              {fillHeight > 0 && (
                <View
                  style={{
                    height: fillHeight,
                    borderRadius: 8,
                    backgroundColor: isToday ? colors.primary : colors.accent,
                    borderWidth: isToday ? 0 : 1,
                    borderColor: 'rgba(11,31,53,0.2)',
                  }}
                />
              )}
            </View>
            <AppText variant="caption" color={isToday ? colors.text : colors.textMuted} weight={isToday ? 'bold' : 'medium'}>
              {t(`progress.weekdays.${i}`)}
            </AppText>
          </View>
        );
      })}
    </View>
  );
}
