import React from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, View } from 'react-native';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { Reveal } from './Reveal';

type Props = {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
};

export function PauseModal({ visible, onResume, onRestart, onExit }: Props) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <View
        style={{
          flex: 1,
          backgroundColor: colors.overlay,
          alignItems: 'center',
          justifyContent: 'center',
          padding: spacing.xl,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 380,
            backgroundColor: colors.card,
            borderRadius: radius.card,
            padding: spacing.xl,
            alignItems: 'center',
            gap: spacing.md,
          }}
        >
          <Reveal index={0}>
            <AppText variant="title" center>
              {t('pause.title')}
            </AppText>
          </Reveal>
          <Reveal index={1}>
            <AppText variant="body" color={colors.textSoft} center>
              {t('pause.saved')}
            </AppText>
          </Reveal>
          <Reveal index={2} style={{ alignSelf: 'stretch', gap: spacing.md, marginTop: spacing.sm }}>
            <AppButton title={t('pause.resume')} icon="play" onPress={onResume} />
            <AppButton title={t('pause.restart')} icon="refresh" variant="secondary" onPress={onRestart} />
            <AppButton title={t('pause.end')} variant="ghost" onPress={onExit} />
          </Reveal>
        </View>
      </View>
    </Modal>
  );
}
