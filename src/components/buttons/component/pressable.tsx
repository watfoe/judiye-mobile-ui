import {forwardRef} from 'react';
import {Pressable as Touchable, View} from 'react-native';
import {PressableProps} from '../types';
import {useStyles, useTheme} from 'hooks';
import wrapper from 'hoc/wrapper';
import Animated from 'react-native-reanimated';

export const AnimatedPressable = Animated.createAnimatedComponent(Touchable);

const Pressable = wrapper(
  forwardRef<View, PressableProps>(
    (
      {
        android_ripple,
        direction,
        align,
        justify,
        self,
        content,
        style,
        ...rest
      },
      ref,
    ) => {
      const {colors} = useTheme();
      const compStyles = useStyles(
        {
          alignItems: align || 'center',
          alignContent: content,
          alignSelf: self || 'stretch',
          flexDirection: direction,
          justifyContent: justify || 'center',
          zIndex: 999,
          overflow: 'hidden',
        },
        style,
      );

      return (
        <AnimatedPressable
          android_ripple={{
            color: colors.ripple,
            foreground: false,
            ...android_ripple,
          }}
          ref={ref}
          style={compStyles}
          {...rest}
        />
      );
    },
  ),
);

export default Pressable;
