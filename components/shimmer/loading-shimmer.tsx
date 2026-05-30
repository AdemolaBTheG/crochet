import React from 'react';
import { View } from 'react-native';
import Shimmer from '@/components/shimmer';
import { theme } from '@/constants/Theme';

type LoadingShimmerProps = {
  width?: number;
  height?: number;
  color?: string;
  centered?: boolean;
};

export default function LoadingShimmer({
  width = 160,
  height = 6,
  color = theme.colors.primarySoft,
  centered = true,
}: LoadingShimmerProps) {
  const shimmer = (
    <Shimmer
      style={{
        width,
        height,
        borderRadius: 999,
        overflow: 'hidden',
      }}>
      <Shimmer.Overlay width={64} duration={1500} repeatDelay={800}>
        <View
          style={{
            width: 64,
            height: '100%',
            backgroundColor: color,
          }}
        />
      </Shimmer.Overlay>
      <View
        style={{
          width: '100%',
          height: '100%',
          borderRadius: 999,
          backgroundColor: theme.colors.primarySoft,
          opacity: 0.3,
        }}
      />
    </Shimmer>
  );

  if (!centered) return shimmer;

  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
      }}>
      {shimmer}
    </View>
  );
}
