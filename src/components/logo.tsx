import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface LogoProps {
  size?: number;
  light?: boolean;
  style?: ViewStyle;
}

export function ImpelLogo({ size = 80, light = false, style }: LogoProps) {
  const containerBg = light ? '#FFFFFF' : '#000000';
  const innerBg = light ? '#000000' : '#FFFFFF';
  const strokeColor = light ? '#FFFFFF' : '#000000';

  const pad = size * 0.12;
  const contentSize = size - pad * 2;
  const cellSize = contentSize / 3;
  const strokeWidth = Math.max(1.5, size * 0.03);

  // Helper lines
  const Line = ({ top, left, width, height, rotate }: { top: number; left: number; width: number; height: number; rotate?: string }) => (
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

  const Circle = ({ top, left, r }: { top: number; left: number; r: number }) => (
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
        <Line
          top={cellSize * 0.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="45deg"
        />
        <Line
          top={cellSize * 0.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="-45deg"
        />

        {/* ROW 1, COL 2: Vertical Line and Left Chevron | < */}
        <Line
          top={cellSize * 0.15}
          left={cellSize * 1.3}
          width={strokeWidth}
          height={cellSize * 0.7}
        />
        <Line
          top={cellSize * 0.25}
          left={cellSize * 1.6}
          width={strokeWidth}
          height={cellSize * 0.35}
          rotate="40deg"
        />
        <Line
          top={cellSize * 0.4}
          left={cellSize * 1.6}
          width={strokeWidth}
          height={cellSize * 0.35}
          rotate="-40deg"
        />

        {/* ROW 1, COL 3: Star with Circle in Middle */}
        <Circle top={cellSize * 0.5} left={cellSize * 2.5} r={cellSize * 0.15} />
        {/* Star spokes */}
        <Line top={cellSize * 0.15} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} />
        <Line top={cellSize * 0.65} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} />
        <Line top={cellSize * 2.5 - strokeWidth / 2} left={cellSize * 2.15} width={cellSize * 0.2} height={strokeWidth} />
        <Line top={cellSize * 2.5 - strokeWidth / 2} left={cellSize * 2.65} width={cellSize * 0.2} height={strokeWidth} />
        {/* Diagonals */}
        <Line top={cellSize * 0.25} left={cellSize * 2.35} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" />
        <Line top={cellSize * 0.55} left={cellSize * 2.65} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" />
        <Line top={cellSize * 0.25} left={cellSize * 2.65} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" />
        <Line top={cellSize * 0.55} left={cellSize * 2.35} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" />


        {/* ROW 2, COL 1: Star with Circle (same as col 3) */}
        <Circle top={cellSize * 1.5} left={cellSize * 0.5} r={cellSize * 0.15} />
        <Line top={cellSize * 1.15} left={cellSize * 0.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} />
        <Line top={cellSize * 1.65} left={cellSize * 0.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.2} />
        <Line top={cellSize * 1.5 - strokeWidth / 2} left={cellSize * 0.15} width={cellSize * 0.2} height={strokeWidth} />
        <Line top={cellSize * 1.5 - strokeWidth / 2} left={cellSize * 0.65} width={cellSize * 0.2} height={strokeWidth} />
        <Line top={cellSize * 1.25} left={cellSize * 0.35} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" />
        <Line top={cellSize * 1.55} left={cellSize * 0.65} width={strokeWidth} height={cellSize * 0.18} rotate="-45deg" />
        <Line top={cellSize * 1.25} left={cellSize * 0.65} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" />
        <Line top={cellSize * 1.55} left={cellSize * 0.35} width={strokeWidth} height={cellSize * 0.18} rotate="45deg" />

        {/* ROW 2, COL 2: Intersecting Hourglass Lines (Double Hourglass X) */}
        <Line top={cellSize * 1.15} left={cellSize * 1.2} width={cellSize * 0.6} height={strokeWidth} />
        <Line top={cellSize * 1.85} left={cellSize * 1.2} width={cellSize * 0.6} height={strokeWidth} />
        <Line top={cellSize * 1.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="25deg" />
        <Line top={cellSize * 1.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="-25deg" />
        <Line top={cellSize * 1.2} left={cellSize * 1.3} width={strokeWidth} height={cellSize * 0.6} rotate="-65deg" />
        <Line top={cellSize * 1.2} left={cellSize * 1.7} width={strokeWidth} height={cellSize * 0.6} rotate="65deg" />

        {/* ROW 2, COL 3: Stylized H */}
        <Line top={cellSize * 1.2} left={cellSize * 2.2} width={strokeWidth} height={cellSize * 0.6} />
        <Line top={cellSize * 1.2} left={cellSize * 2.8} width={strokeWidth} height={cellSize * 0.6} />
        <Line top={cellSize * 1.5 - strokeWidth / 2} left={cellSize * 2.2} width={cellSize * 0.6} height={strokeWidth} />
        <Line top={cellSize * 1.35} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.3} />


        {/* ROW 3, COL 1: Diagonal X (same as col 1) */}
        <Line
          top={cellSize * 2.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="45deg"
        />
        <Line
          top={cellSize * 2.2}
          left={cellSize * 0.5 - strokeWidth / 2}
          width={strokeWidth}
          height={cellSize * 0.6}
          rotate="-45deg"
        />

        {/* ROW 3, COL 2: Horizontal Bow-tie / Hourglass |><| */}
        <Line top={cellSize * 2.2} left={cellSize * 1.2} width={strokeWidth} height={cellSize * 0.6} />
        <Line top={cellSize * 2.2} left={cellSize * 1.8} width={strokeWidth} height={cellSize * 0.6} />
        <Line top={cellSize * 2.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="60deg" />
        <Line top={cellSize * 2.2} left={cellSize * 1.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.6} rotate="-60deg" />

        {/* ROW 3, COL 3: Y symbol with branches */}
        <Line top={cellSize * 2.45} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.4} />
        <Line top={cellSize * 2.2} left={cellSize * 2.35} width={strokeWidth} height={cellSize * 0.35} rotate="-35deg" />
        <Line top={cellSize * 2.2} left={cellSize * 2.65} width={strokeWidth} height={cellSize * 0.35} rotate="35deg" />
        <Line top={cellSize * 2.2} left={cellSize * 2.5 - strokeWidth / 2} width={strokeWidth} height={cellSize * 0.3} />
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
