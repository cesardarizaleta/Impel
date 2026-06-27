import React from 'react';
import { View, StyleSheet, Text, Dimensions, ViewStyle } from 'react-native';

interface PoneglyphBgProps {
  height?: number;
  style?: ViewStyle;
  children?: React.ReactNode;
  color?: 'red' | 'black';
}

const GLYPH_CHARS = [
  '╳', '｜', 'く', '✹', '⚙', '⧖', '⚔', '⚓',
  '𐎀', '𐎁', '𐎂', '𐎃', '𐎄', '𐎅', '𐎆', '𐎇',
  '𐎈', '𐎉', '𐎊', '𐎋', '𐎌', '𐎍', '𐎎', '𐎏',
];

export function PoneglyphBg({ height = 240, style, children, color = 'red' }: PoneglyphBgProps) {
  const isBlack = color === 'black';

  // Theme overrides
  const containerBg = isBlack ? '#121212' : '#3D0A0B';
  const stoneBaseBg = isBlack ? '#1A1A1A' : '#4A0D0E';
  const lineBg = isBlack ? '#2C2C2E' : '#8A1E20';
  const glyphColor = isBlack ? '#8E8E93' : '#FF6B6B';

  // Let's create a grid of symbols
  const rows = 4;
  const cols = 5;
  
  const gridCells = Array.from({ length: rows * cols }).map((_, i) => {
    const charIndex = (i * 7 + 3) % GLYPH_CHARS.length;
    return GLYPH_CHARS[charIndex];
  });

  return (
    <View style={[styles.container, { height, backgroundColor: containerBg }, style]}>
      {/* Stone Base */}
      <View style={[styles.stoneBase, { backgroundColor: stoneBaseBg }]} />
      
      {/* Stone Texture Lines / Cracks */}
      <View style={styles.crackContainer}>
        {/* Horizontal grid lines */}
        {Array.from({ length: rows - 1 }).map((_, i) => (
          <View
            key={`h-line-${i}`}
            style={[
              styles.stoneLine,
              {
                top: `${((i + 1) / rows) * 100}%`,
                width: '100%',
                height: 1,
                backgroundColor: lineBg,
              },
            ]}
          />
        ))}

        {/* Vertical grid lines */}
        {Array.from({ length: cols - 1 }).map((_, i) => (
          <View
            key={`v-line-${i}`}
            style={[
              styles.stoneLine,
              {
                left: `${((i + 1) / cols) * 100}%`,
                height: '100%',
                width: 1,
                backgroundColor: lineBg,
              },
            ]}
          />
        ))}
      </View>

      {/* Runic Carvings / Glyphs */}
      <View style={styles.glyphGrid}>
        {gridCells.map((char, index) => {
          const col = index % cols;
          const row = Math.floor(index / cols);
          
          // Random offset for weathered, natural look
          const offsetTop = (index * 3) % 15 - 5;
          const offsetLeft = (index * 11) % 15 - 5;
          const rotate = `${(index * 17) % 20 - 10}deg`;

          return (
            <View
              key={`glyph-${index}`}
              style={{
                position: 'absolute',
                top: `${(row / rows) * 100 + 10}%`,
                left: `${(col / cols) * 100 + 8}%`,
                transform: [{ translateY: offsetTop }, { translateX: offsetLeft }, { rotate }],
                opacity: 0.15,
              }}
            >
              <Text style={[styles.glyphText, { color: glyphColor }]}>{char}</Text>
            </View>
          );
        })}
      </View>

      {/* Shadow overlay at bottom for depth */}
      <View style={styles.shadowOverlay} />

      {/* Content over background */}
      {children && <View style={styles.content}>{children}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    position: 'relative',
  },
  stoneBase: {
    ...StyleSheet.absoluteFill,
    opacity: 0.95,
  },
  crackContainer: {
    ...StyleSheet.absoluteFill,
  },
  stoneLine: {
    position: 'absolute',
    opacity: 0.4,
  },
  glyphGrid: {
    ...StyleSheet.absoluteFill,
  },
  glyphText: {
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily: 'monospace',
  },
  shadowOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'transparent',
    // Gradient effect drawn with borders
    borderBottomWidth: 60,
    borderBottomColor: 'rgba(0,0,0,0.5)',
    opacity: 0.4,
  },
  content: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
