import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  style?: ViewStyle;
}

// 1. Search Icon (Magnifying Glass)
export function SearchIcon({ size = 16, color = '#000000', style }: IconProps) {
  const strokeWidth = Math.max(1.5, size * 0.11);
  const circleSize = size * 0.6;
  const handleHeight = size * 0.45;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ position: 'relative', width: size, height: size }}>
        {/* Glass Circle */}
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: circleSize,
            height: circleSize,
            borderRadius: circleSize / 2,
            borderWidth: strokeWidth,
            borderColor: color,
            backgroundColor: 'transparent',
          }}
        />
        {/* Handle */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.43,
            left: size * 0.6,
            width: strokeWidth,
            height: handleHeight,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            transform: [{ rotate: '-45deg' }],
          }}
        />
      </View>
    </View>
  );
}

// 2. Settings / Filter Icon (mockup style slider controls)
export function SettingsIcon({ size = 16, color = '#FFFFFF', style }: IconProps) {
  const barThickness = Math.max(1.5, size * 0.08);
  const knobSize = Math.max(4, size * 0.25);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', gap: size * 0.2 }, style]}>
      {/* Slide 1 */}
      <View style={{ height: barThickness, width: '100%', backgroundColor: color, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            top: -knobSize / 2 + barThickness / 2,
            left: '30%',
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            backgroundColor: color,
          }}
        />
      </View>
      {/* Slide 2 */}
      <View style={{ height: barThickness, width: '100%', backgroundColor: color, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            top: -knobSize / 2 + barThickness / 2,
            left: '70%',
            width: knobSize,
            height: knobSize,
            borderRadius: knobSize / 2,
            backgroundColor: color,
          }}
        />
      </View>
    </View>
  );
}

// 3. Menu Icon (Hamburger)
export function MenuIcon({ size = 16, color = '#FFFFFF', style }: IconProps) {
  const thickness = Math.max(1.5, size * 0.09);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'space-between', paddingVertical: size * 0.1 }, style]}>
      <View style={{ height: thickness, backgroundColor: color, borderRadius: thickness / 2 }} />
      <View style={{ height: thickness, backgroundColor: color, borderRadius: thickness / 2, width: '80%' }} />
      <View style={{ height: thickness, backgroundColor: color, borderRadius: thickness / 2 }} />
    </View>
  );
}

// 4. Back Icon (Arrow Left)
export function BackIcon({ size = 16, color = '#000000', style }: IconProps) {
  const thickness = Math.max(1.8, size * 0.1);
  const arrowHead = size * 0.45;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center' }}>
        {/* Main Stem */}
        <View style={{ height: thickness, backgroundColor: color, borderRadius: thickness / 2, width: '100%' }} />
        {/* Top Caret line */}
        <View
          style={{
            position: 'absolute',
            left: thickness / 2,
            width: arrowHead,
            height: thickness,
            backgroundColor: color,
            borderRadius: thickness / 2,
            transform: [{ rotate: '45deg' }, { translateY: -arrowHead / 2 }],
          }}
        />
        {/* Bottom Caret line */}
        <View
          style={{
            position: 'absolute',
            left: thickness / 2,
            width: arrowHead,
            height: thickness,
            backgroundColor: color,
            borderRadius: thickness / 2,
            transform: [{ rotate: '-45deg' }, { translateY: arrowHead / 2 }],
          }}
        />
      </View>
    </View>
  );
}

// 5. Heart Icon
export function HeartIcon({ size = 16, color = '#000000', style }: IconProps) {
  const lobeSize = size * 0.55;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ width: size, height: size, position: 'relative' }}>
        {/* Left Lobe */}
        <View
          style={{
            position: 'absolute',
            top: 2,
            left: 1,
            width: lobeSize,
            height: lobeSize,
            borderRadius: lobeSize / 2,
            backgroundColor: color,
          }}
        />
        {/* Right Lobe */}
        <View
          style={{
            position: 'absolute',
            top: 2,
            right: 1,
            width: lobeSize,
            height: lobeSize,
            borderRadius: lobeSize / 2,
            backgroundColor: color,
          }}
        />
        {/* Base Diamond */}
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.08,
            left: size * 0.22,
            width: size * 0.55,
            height: size * 0.55,
            backgroundColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    </View>
  );
}

// 6. Shield Icon (Security)
export function ShieldIcon({ size = 16, color = '#000000', style }: IconProps) {
  const w = size;
  const h = size * 1.1;

  return (
    <View style={[{ width: w, height: h, position: 'relative' }, style]}>
      {/* Top Banner */}
      <View style={{ height: '40%', width: '100%', borderTopLeftRadius: w * 0.2, borderTopRightRadius: w * 0.2, backgroundColor: color }} />
      {/* V shape Bottom */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '50%',
          height: '75%',
          backgroundColor: color,
          borderBottomLeftRadius: w * 0.5,
          borderTopRightRadius: 0,
          transform: [{ skewY: '25deg' }],
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: '50%',
          height: '75%',
          backgroundColor: color,
          borderBottomRightRadius: w * 0.5,
          borderTopLeftRadius: 0,
          transform: [{ skewY: '-25deg' }],
        }}
      />
    </View>
  );
}

// 7. Lock Icon
export function LockIcon({ size = 16, color = '#000000', style }: IconProps) {
  const baseH = size * 0.55;
  const shackleW = size * 0.55;
  const shackleH = size * 0.45;
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size + stroke, justifyContent: 'flex-end', alignItems: 'center' }, style]}>
      {/* Shackle */}
      <View
        style={{
          width: shackleW,
          height: shackleH,
          borderWidth: stroke,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: shackleW / 2,
          borderTopRightRadius: shackleW / 2,
          marginBottom: -stroke / 2,
        }}
      />
      {/* Lock Body */}
      <View
        style={{
          width: size,
          height: baseH,
          backgroundColor: color,
          borderRadius: size * 0.15,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {/* Keyhole */}
        <View style={{ width: stroke, height: stroke * 2.2, backgroundColor: '#FFFFFF', borderRadius: stroke / 2 }} />
      </View>
    </View>
  );
}

// 8. Unlock Icon
export function UnlockIcon({ size = 16, color = '#000000', style }: IconProps) {
  const baseH = size * 0.55;
  const shackleW = size * 0.55;
  const shackleH = size * 0.45;
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size + stroke, justifyContent: 'flex-end', alignItems: 'center' }, style]}>
      {/* Unlocked Shackle */}
      <View
        style={{
          width: shackleW,
          height: shackleH,
          borderWidth: stroke,
          borderColor: color,
          borderBottomWidth: 0,
          borderTopLeftRadius: shackleW / 2,
          borderTopRightRadius: shackleW / 2,
          marginBottom: -stroke / 2,
          transform: [{ translateX: -shackleW * 0.3 }], // Offset shackle to look open
        }}
      />
      {/* Lock Body */}
      <View
        style={{
          width: size,
          height: baseH,
          backgroundColor: color,
          borderRadius: size * 0.15,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: stroke, height: stroke * 2.2, backgroundColor: '#FFFFFF', borderRadius: stroke / 2 }} />
      </View>
    </View>
  );
}

// 9. Home Icon
export function HomeIcon({ size = 16, color = '#FFFFFF', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {/* Roof */}
      <View
        style={{
          position: 'absolute',
          top: size * 0.1,
          left: size * 0.15,
          width: size * 0.7,
          height: size * 0.7,
          borderTopWidth: stroke,
          borderLeftWidth: stroke,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
      {/* Body */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: size * 0.15,
          width: size * 0.7,
          height: size * 0.5,
          borderWidth: stroke,
          borderTopWidth: 0,
          borderColor: color,
          justifyContent: 'flex-end',
          alignItems: 'center',
        }}
      >
        {/* Door */}
        <View style={{ width: size * 0.22, height: size * 0.28, backgroundColor: color }} />
      </View>
    </View>
  );
}

// 10. Copy / Clipboard Icon
export function CopyIcon({ size = 16, color = '#000000', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);
  const w = size * 0.65;
  const h = size * 0.75;

  return (
    <View style={[{ width: size, height: size, position: 'relative' }, style]}>
      {/* Back Paper */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: w,
          height: h,
          borderRadius: size * 0.1,
          borderWidth: stroke,
          borderColor: color,
        }}
      />
      {/* Front Paper */}
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: w,
          height: h,
          borderRadius: size * 0.1,
          borderWidth: stroke,
          borderColor: color,
          backgroundColor: '#FFFFFF', // Hide background sheet
        }}
      />
    </View>
  );
}

// 11. Eye Icon (Show Password)
export function EyeIcon({ size = 16, color = '#000000', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);
  const ovalW = size;
  const ovalH = size * 0.6;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View
        style={{
          width: ovalW,
          height: ovalH,
          borderRadius: ovalW / 2,
          borderWidth: stroke,
          borderColor: color,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View style={{ width: size * 0.28, height: size * 0.28, borderRadius: size * 0.14, backgroundColor: color }} />
      </View>
    </View>
  );
}

// 12. Eye Off Icon (Hide Password)
export function EyeOffIcon({ size = 16, color = '#000000', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center', position: 'relative' }, style]}>
      <EyeIcon size={size} color={color} />
      {/* Slash line */}
      <View
        style={{
          position: 'absolute',
          width: size * 1.2,
          height: stroke * 1.3,
          backgroundColor: color,
          borderRadius: stroke / 2,
          transform: [{ rotate: '-45deg' }],
          borderWidth: 1,
          borderColor: '#FFFFFF', // Cut outline overlay
        }}
      />
    </View>
  );
}

// 13. Chevron Down / Up / Right Icon
export function ChevronIcon({ size = 12, color = '#8E8E93', direction = 'down', style }: IconProps & { direction?: 'down' | 'up' | 'right' | 'left' }) {
  const stroke = Math.max(1.5, size * 0.1);
  const w = size * 0.6;
  const h = size * 0.6;

  let rotate = '45deg';
  if (direction === 'up') rotate = '-135deg';
  if (direction === 'right') rotate = '-45deg';
  if (direction === 'left') rotate = '135deg';

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View
        style={{
          width: w,
          height: h,
          borderBottomWidth: stroke,
          borderRightWidth: stroke,
          borderColor: color,
          transform: [{ rotate }, { translateY: -w * 0.15 }],
        }}
      />
    </View>
  );
}

// 14. Key Icon (alternate tab icon)
export function KeyIcon({ size = 16, color = '#FFFFFF', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ width: size, height: size, position: 'relative', justifyContent: 'center' }}>
        {/* Ring */}
        <View
          style={{
            position: 'absolute',
            left: 0,
            width: size * 0.45,
            height: size * 0.45,
            borderRadius: (size * 0.45) / 2,
            borderWidth: stroke,
            borderColor: color,
          }}
        />
        {/* Stem */}
        <View
          style={{
            position: 'absolute',
            left: size * 0.4,
            width: size * 0.55,
            height: stroke * 1.5,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
        {/* Prongs */}
        <View
          style={{
            position: 'absolute',
            right: size * 0.12,
            top: '52%',
            width: stroke * 1.5,
            height: size * 0.28,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            top: '52%',
            width: stroke * 1.5,
            height: size * 0.28,
            backgroundColor: color,
            borderRadius: stroke / 2,
          }}
        />
      </View>
    </View>
  );
}

// 15. Success checkmark / alert icon
export function CheckIcon({ size = 16, color = '#34C759', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.09);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ width: size * 0.7, height: size * 0.4, position: 'relative' }}>
        <View
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: size * 0.25,
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '45deg' }, { translateX: stroke * 0.5 }],
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: 0,
            bottom: stroke * 0.5,
            width: size * 0.55,
            height: stroke,
            backgroundColor: color,
            borderRadius: stroke / 2,
            transform: [{ rotate: '-45deg' }, { translateY: -stroke * 0.5 }],
          }}
        />
      </View>
    </View>
  );
}

// 16. Alert Warning / Exclamation Icon
export function WarningIcon({ size = 16, color = '#FF9500', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View
        style={{
          width: size,
          height: size,
          borderWidth: stroke,
          borderColor: color,
          borderRadius: size / 2,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}
      >
        {/* Dot + Bar */}
        <View style={{ width: stroke, height: size * 0.35, backgroundColor: color, position: 'absolute', top: size * 0.18, borderRadius: stroke / 2 }} />
        <View style={{ width: stroke * 1.2, height: stroke * 1.2, backgroundColor: color, position: 'absolute', bottom: size * 0.18, borderRadius: stroke * 0.6 }} />
      </View>
    </View>
  );
}

// 17. User Profile Avatar outline Icon
export function UserIcon({ size = 16, color = '#000000', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }, style]}>
      <View style={{ width: size, height: size, borderRadius: size / 2, borderWidth: stroke, borderColor: color, position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
        {/* Head */}
        <View style={{ width: size * 0.35, height: size * 0.35, borderRadius: (size * 0.35) / 2, borderWidth: stroke, borderColor: color, position: 'absolute', top: size * 0.08 }} />
        {/* Shoulders */}
        <View style={{ width: size * 0.7, height: size * 0.35, borderTopLeftRadius: size * 0.3, borderTopRightRadius: size * 0.3, borderWidth: stroke, borderColor: color, position: 'absolute', bottom: -stroke }} />
      </View>
    </View>
  );
}

// 18. Plus Icon
export function PlusIcon({ size = 16, color = '#000000', style }: IconProps) {
  const stroke = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center', position: 'relative' }, style]}>
      {/* Horizontal line */}
      <View style={{ width: size * 0.8, height: stroke, backgroundColor: color, borderRadius: stroke / 2, position: 'absolute' }} />
      {/* Vertical line */}
      <View style={{ width: stroke, height: size * 0.8, backgroundColor: color, borderRadius: stroke / 2, position: 'absolute' }} />
    </View>
  );
}

// 19. Import Icon (Arrow pointing right into a bracket tray)
export function ImportIcon({ size = 16, color = '#000000', style }: IconProps) {
  const strokeWidth = Math.max(1.5, size * 0.09);
  const arrowHead = size * 0.35;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Bracket Tray on the right side: ] */}
        <View
          style={{
            position: 'absolute',
            right: size * 0.15,
            top: size * 0.15,
            bottom: size * 0.15,
            width: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: size * 0.15,
            top: size * 0.15,
            width: size * 0.25,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
          }}
        />
        <View
          style={{
            position: 'absolute',
            right: size * 0.15,
            bottom: size * 0.15,
            width: size * 0.25,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
          }}
        />
        {/* Arrow Stem (Horizontal, pointing right) */}
        <View
          style={{
            position: 'absolute',
            left: size * 0.1,
            right: size * 0.3,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
          }}
        />
        {/* Arrow Head Top */}
        <View
          style={{
            width: arrowHead,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            right: size * 0.25,
            top: size * 0.32,
            transform: [{ rotate: '45deg' }, { translateY: -arrowHead * 0.15 }],
          }}
        />
        {/* Arrow Head Bottom */}
        <View
          style={{
            width: arrowHead,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            right: size * 0.25,
            bottom: size * 0.32,
            transform: [{ rotate: '-45deg' }, { translateY: arrowHead * 0.15 }],
          }}
        />
      </View>
    </View>
  );
}

// 20. Trash / Delete Icon (Trash Can outline)
export function TrashIcon({ size = 16, color = '#000000', style }: IconProps) {
  const strokeWidth = Math.max(1.5, size * 0.08);

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Lid bar */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.15,
            width: size * 0.8,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
          }}
        />
        {/* Handle */}
        <View
          style={{
            position: 'absolute',
            top: size * 0.05,
            width: size * 0.3,
            height: size * 0.12,
            borderWidth: strokeWidth,
            borderColor: color,
            borderBottomWidth: 0,
            borderTopLeftRadius: strokeWidth,
            borderTopRightRadius: strokeWidth,
          }}
        />
        {/* Can Body */}
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.05,
            width: size * 0.6,
            height: size * 0.65,
            borderWidth: strokeWidth,
            borderColor: color,
            borderBottomLeftRadius: size * 0.1,
            borderBottomRightRadius: size * 0.1,
            justifyContent: 'space-around',
            flexDirection: 'row',
            paddingHorizontal: size * 0.1,
            alignItems: 'center',
          }}
        >
          {/* Vertical rib lines */}
          <View style={{ width: strokeWidth, height: '70%', backgroundColor: color, opacity: 0.7 }} />
          <View style={{ width: strokeWidth, height: '70%', backgroundColor: color, opacity: 0.7 }} />
        </View>
      </View>
    </View>
  );
}

// 21. Download / Export Icon (Arrow pointing down onto a flat line)
export function DownloadIcon({ size = 16, color = '#000000', style }: IconProps) {
  const strokeWidth = Math.max(1.5, size * 0.09);
  const arrowHead = size * 0.35;

  return (
    <View style={[{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }, style]}>
      <View style={{ position: 'relative', width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
        {/* Flat Bottom Line */}
        <View
          style={{
            position: 'absolute',
            bottom: size * 0.15,
            left: size * 0.1,
            right: size * 0.1,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
          }}
        />
        {/* Arrow Stem (Vertical, pointing down) */}
        <View
          style={{
            width: strokeWidth,
            height: size * 0.5,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            top: size * 0.1,
          }}
        />
        {/* Arrow Head Left */}
        <View
          style={{
            width: arrowHead,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            bottom: size * 0.3,
            transform: [{ rotate: '45deg' }, { translateX: -arrowHead * 0.35 }],
          }}
        />
        {/* Arrow Head Right */}
        <View
          style={{
            width: arrowHead,
            height: strokeWidth,
            backgroundColor: color,
            borderRadius: strokeWidth / 2,
            position: 'absolute',
            bottom: size * 0.3,
            transform: [{ rotate: '-45deg' }, { translateX: arrowHead * 0.35 }],
          }}
        />
      </View>
    </View>
  );
}



