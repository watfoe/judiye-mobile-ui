import {
  cloneElement,
  createRef,
  forwardRef,
  RefObject,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react';
import {LayoutChangeEvent, StyleProp, ViewStyle} from 'react-native';
import {Pressable} from 'components/buttons';
import {Flex, FlexProps} from 'components/layout';
import wrapper from 'hoc/wrapper';
import {useStyles, useTheme} from 'hooks';
import {Text} from 'components/typography';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

export interface ToggleButtonHandle {
  __setActive(): void;
  __setInactive(): void;
}
export interface ToggleButtonsProps extends FlexProps {
  onValueChange?(index: number): void;
}

const AnimatedFlex = Animated.createAnimatedComponent(Flex);
const AnimatedText = Animated.createAnimatedComponent(Text);

const ANIMATION_DURATION = 244;

export const ToggleButton = wrapper(
  forwardRef<ToggleButtonHandle, FlexProps>(
    ({style, children, ...rest}, ref) => {
      const {colors} = useTheme();
      const textRef = useRef(null);
      const color = useSharedValue(colors.text.primary);

      const __setActive = useCallback(() => {
        color.value = withTiming(colors.primary, {
          duration: ANIMATION_DURATION,
        });
      }, [color, colors.primary]);
      const __setInactive = useCallback(() => {
        color.value = colors.text.secondary;
      }, [color, colors.text]);

      useImperativeHandle(ref, () => ({
        __setActive,
        __setInactive,
      }));

      const tabCompStyles = useStyles(
        {
          height: '100%',
          flex: 1,
        },
        style,
      );
      const animTextStyle = useAnimatedStyle(() => {
        return {
          color: color.value,
        };
      });

      return (
        <Pressable style={tabCompStyles} {...rest}>
          <AnimatedText ref={textRef} size={14} style={animTextStyle}>
            {children}
          </AnimatedText>
        </Pressable>
      );
    },
  ),
);

const Indicator = ({
  noOfTbs,
  style,
}: {
  noOfTbs: number;
  style?: StyleProp<ViewStyle>;
}) => {
  const {colors} = useTheme();
  const compStyles = useStyles<ViewStyle>(
    {
      backgroundColor: colors.primary,
      borderRadius: 1000,
      height: '100%',
      position: 'absolute',
      top: 3,
      left: 3,
      width: `${100 / noOfTbs}%`,
    },
    style,
  );

  return <AnimatedFlex self="flex-start" style={compStyles} />;
};

export const ToggleButtons = wrapper(
  ({style, children, onValueChange, ...rest}: ToggleButtonsProps) => {
    const {colors, sizing} = useTheme();
    const activeTBIndex = useRef(0);
    let refs: RefObject<ToggleButtonHandle>[] = useMemo(() => [], []);
    const indicatorPosition = useSharedValue(3);
    const indicatorPositionMultiplier = useRef(0);
    const noOfTbs = useRef(0);

    useEffect(() => {
      if (refs[activeTBIndex.current] && refs[activeTBIndex.current].current) {
        refs[activeTBIndex.current].current?.__setActive();
      }
    });

    const handleTabPress = useCallback(
      (index: number) => {
        if (index !== activeTBIndex.current) {
          if (refs[activeTBIndex.current].current) {
            refs[activeTBIndex.current].current?.__setInactive();
          }
          if (refs[index].current) {
            refs[index].current?.__setActive();
            let position = indicatorPositionMultiplier.current * index;
            if (index === 0) {
              position += 3;
            } else if (index === noOfTbs.current - 1) {
              position -= 2;
            }
            indicatorPosition.value = withTiming(position, {
              duration: ANIMATION_DURATION,
            });

            if (onValueChange) {
              onValueChange(index);
            }
          }
          activeTBIndex.current = index;
        }
      },
      [indicatorPosition, onValueChange, refs],
    );

    const setContWidthOnLayoutChange = (e: LayoutChangeEvent) => {
      indicatorPositionMultiplier.current =
        e.nativeEvent.layout.width / noOfTbs.current;
    };

    children = useMemo(() => {
      const tabs = Array.isArray(children) ? children : [children];
      return tabs.map((child, index: number) => {
        const ref: RefObject<ToggleButtonHandle> = createRef();
        noOfTbs.current = index + 1;
        // Add value using index to overwrite previous refs in the previous
        // render
        refs[index] = ref;
        return cloneElement(child, {
          ref,
          key: `tb-${index}`,
          onPress: () => handleTabPress(index),
        });
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [children, handleTabPress]);

    const compStyles = useStyles(
      {
        borderColor: colors.primary,
        borderWidth: sizing.border.width,
        borderRadius: 1000,
        marginBottom: 13,
        height: sizing.height.nm,
        padding: 3,
      },
      style,
    );
    const indicatorAnimStyles = useAnimatedStyle(() => {
      return {
        left: indicatorPosition.value,
      };
    });

    return (
      <Flex
        direction="row"
        style={compStyles}
        onLayout={setContWidthOnLayoutChange}
        {...rest}>
        {noOfTbs.current > 0 && (
          <Indicator noOfTbs={noOfTbs.current} style={indicatorAnimStyles} />
        )}
        {children}
      </Flex>
    );
  },
);
