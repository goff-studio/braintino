import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  children: React.ReactNode;
  gradient: readonly [string, string, ...string[]] | readonly string[];
};

export function ScreenBackground({ children, gradient }: Props) {
  return (
    <View style={{ flex: 1 }}>
      <LinearGradient colors={[...gradient] as [string, string, ...string[]]} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
}
