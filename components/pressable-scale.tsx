import React from 'react';
import { Pressable, type PressableProps, type StyleProp, type ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

type PressableScaleProps = PressableProps & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  children,
  style,
  pressedScale = 0.96,
  onPressIn,
  onPressOut,
  ...props
}: PressableScaleProps) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      {...props}
      style={[style, animatedStyle]}
      onPressIn={(event) => {
        scale.value = withSpring(pressedScale, {
          stiffness: 500,
          damping: 28,
        });
        onPressIn?.(event);
      }}
      onPressOut={(event) => {
        scale.value = withSpring(1, {
          stiffness: 500,
          damping: 28,
        });
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
}
