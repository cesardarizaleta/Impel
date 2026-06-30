import { StyleSheet, View, ViewStyle } from 'react-native';

interface LogoProps {
  size?: number;
  light?: boolean;
  style?: ViewStyle;
}

// Helper components defined OUTSIDE of the render function
const LogoLine = ({ 
  top, 
  left, 
  width, 
  height, 
  rotate, 
  strokeColor, 
  strokeWidth 
}: { 
  top: number; 
  left: number; 
  width: number; 
  height: number; 
  rotate?: string; 
  strokeColor: string;
  strokeWidth: number;
}) => (
  <View
    style={{
      position: 'absolute',
      top,
      left,
      width,
      height,
      backgroundColor: strokeColor,
      borderRadius: strokeWidth / 2,
      transform: rotate ? [{ rotate }] : undefined,
    }}
  />
);

const LogoCircle = ({ 
  top, 
  left, 
  r, 
  strokeColor, 
  strokeWidth 
}: { 
  top: number; 
  left: number; 
  r: number; 
  strokeColor: string;
  strokeWidth: number;
}) => (
  <View
    style={{
      position: 'absolute',
      top: top - r,
      left: left - r,
      width: r * 2,
      height: r * 2,
      borderRadius: r,
      borderWidth: strokeWidth,
      borderColor: strokeColor,
    }}
  />
);

export function ImpelLogo({ size = 80, light = false, style }: LogoProps) {
  const containerBg = light ? '#FFFFFF' : '#000000';
  const innerBg = light ? '#000000' : '#FFFFFF';
  const strokeColor = light ? '#FFFFFF' : '#000000';

  const pad = size * 0.12;
  const contentSize = size - pad * 2;
  const cellSize = contentSize / 3;
  const strokeWidth = Math.max(1.5, size * 0.03);

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          backgroundColor: containerBg,
          padding: pad,
          borderRadius: size * 0.15,
        },
        style,
      ]}
    >
      <View
        style={{
          width: contentSize,
          height: contentSize,
          backgroundColor: innerBg,
          borderRadius: size * 0.05,
          position: 'relative',
        }}
      >
        {/* ROW 1, COL 1: Diagonal X */}
        <LogoLine
          top={cellSize * 0.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="45deg"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
        <LogoLine
          top={cellSize * 0.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="-45deg"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* ROW 1, COL 2: Vertical Line and Left Chevron | < */}
        <LogoLine
          top={cellSize * 0.15}
          left={cellSize * 1.3}
          width={strokeWidth}
          height={cellSize * 0.7}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
        <LogoLine
          top={cellSize * 0.25}
          left={cellSize * 1.6}
          width={strokeWidth}
          height={cellSize * 0.35}
          rotate="40deg"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
        <LogoLine
          top={cellSize * 0.4}
          left={cellSize * 1.6}
          width={strokeWidth}
          height={cellSize * 0.35}
          rotate="-40deg"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* ROW 1, COL 3: Star with Circle in Middle */}
        <LogoCircle
          top={cellSize * 0.5}
          left={cellSize * 2.5}
          r={cellSize * 0.15}
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
        {/* Star spokes */}
        <LogoLine top={cellSize * 0.15} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 0.65} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.5 - strokeWidth / 2} left={cellSize * 2.15} width={cellSize * 0.2} height={strokeWidth} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.5 - strokeWidth / 2} left={cellSize * 2.65} width={cellSize * 0.2} height={strokeWidth} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        {/* Diagonals */}
        <LogoLine top={cellSize * 0.25} left={cellSize * 2.35} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 0.55} left={cellSize * 2.65} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 0.25} left={cellSize * 2.65} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 0.55} left={cellSize * 2.35} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />


        {/* ROW 2, COL 1: Star with Circle (same as col 3) */}
        <LogoCircle top={cellSize * 1.5} left={cellSize * 0.5} r={cellSize * 0.15} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.15} left={cellSize * 0.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.65} left={cellSize * 0.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.5 - strokeWidth / 2} left={cellSize * 0.15} width={cellSize * 0.2} height={strokeWidth} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.5 - strokeWidth / 2} left={cellSize * 0.65} width={cellSize * 0.2} height={strokeWidth} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.25} left={cellSize * 0.35} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.55} left={cellSize * 0.65} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.25} left={cellSize * 0.65} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.55} left={cellSize * 0.35} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />

        {/* ROW 2, COL 2: Intersecting Hourglass Lines (Double Hourglass X) */}
        <LogoLine top={cellSize * 1.15} left={cellSize * 1.2} width={cellSize * 0.6} height={strokeWidth} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.85} left={cellSize * 1.2} width={cellSize * 0.6} height={strokeWidth} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="25deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="-25deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.2} left={cellSize * 1.3} width={strokeWidth} height={cellSize * 0.6} rotate="-65deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.2} left={cellSize * 1.7} width={strokeWidth} height={cellSize * 0.6} rotate="65deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />

        {/* ROW 2, COL 3: Stylized H */}
        <LogoLine top={cellSize * 1.2} left={cellSize * 2.2} width={strokeWidth} height={cellSize * 0.6} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.2} left={cellSize * 2.8} width={strokeWidth} height={cellSize * 0.6} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.5 - strokeWidth / 2} left={cellSize * 2.2} width={cellSize * 0.6} height={strokeWidth} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 1.35} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.3} strokeColor={strokeColor} strokeWidth={strokeWidth} />


        {/* ROW 3, COL 1: Diagonal X (same as col 1) */}
        <LogoLine
          top={cellSize * 2.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="45deg"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />
        <LogoLine
          top={cellSize * 2.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="-45deg"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
        />

        {/* ROW 3, COL 2: Horizontal Bow-tie / Hourglass |><| */}
        <LogoLine top={cellSize * 2.2} left={cellSize * 1.2} width={strokeWidth} height={cellSize * 0.6} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.2} left={cellSize * 1.8} width={strokeWidth} height={cellSize * 0.6} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="60deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="-60deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />

        {/* ROW 3, COL 3: Y symbol with branches */}
        <LogoLine top={cellSize * 2.45} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.4} strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.2} left={cellSize * 2.35} width={strokeWidth} height={cellSize * 0.35} rotate="-35deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.2} left={cellSize * 2.65} width={strokeWidth} height={cellSize * 0.35} rotate="35deg" strokeColor={strokeColor} strokeWidth={strokeWidth} />
        <LogoLine top={cellSize * 2.2} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.3} strokeColor={strokeColor} strokeWidth={strokeWidth} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
});