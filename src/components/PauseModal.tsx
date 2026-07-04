import React from 'react';
import { Modal, View } from 'react-native';
import { radius, spacing } from '@/constants/spacing';
import { useTheme } from '@/hooks/useTheme';
import { AppButton } from './AppButton';
import { AppText } from './AppText';
import { TinoMascot } from './TinoMascot';

type Props = {
  visible: boolean;
  onResume: () => void;
  onRestart: () => void;
  onExit: () => void;
};

export function PauseModal({ visible, onResume, onRestart, onExit }: Props) {
  const { colors } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onResume}>
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(16,42,67,0.55)',
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
          <TinoMascot size={84} mood="calm" />
          <AppText variant="title" center>
            Taking a breath
          </AppText>
          <AppText variant="body" color={colors.textSoft} center>
            The puzzle will wait for you.
          </AppText>
          <View style={{ alignSelf: 'stretch', gap: spacing.md, marginTop: spacing.sm }}>
            <AppButton title="Resume" icon="play" onPress={onResume} />
            <AppButton title="Restart" icon="refresh" variant="secondary" onPress={onRestart} />
            <AppButton title="Exit" icon="home" variant="ghost" onPress={onExit} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
