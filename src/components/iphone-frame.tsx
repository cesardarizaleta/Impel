import React from 'react';
import { View, StyleSheet, Text, Platform, useColorScheme } from 'react-native';
import { Spacing } from '@/constants/theme';

interface IPhoneFrameProps {
  children: React.ReactNode;
  isActive?: boolean;
}

export function IPhoneFrame({ children, isActive = false }: IPhoneFrameProps) {
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  return (
    <View style={styles.shadowContainer}>
      <View style={styles.phoneOuterBorder}>
        <View style={styles.phoneBezel}>
          {/* Screen Content Wrapper */}
          <View style={styles.screen}>
            {children}

            {/* iOS Status Bar */}
            <View style={styles.statusBar}>
              <Text style={styles.timeText}>9:41</Text>
              
              {/* Dynamic Island */}
              <View style={styles.dynamicIsland}>
                <View style={styles.cameraLens} />
              </View>

              <View style={styles.rightIndicators}>
                {/* Signal strength (3 bars) */}
                <View style={styles.signalIcon}>
                  <View style={[styles.signalBar, { height: 4 }]} />
                  <View style={[styles.signalBar, { height: 6 }]} />
                  <View style={[styles.signalBar, { height: 8 }]} />
                  <View style={[styles.signalBar, { height: 10 }]} />
                </View>
                
                {/* Wifi symbol (represented as arcs/lines) */}
                <Text style={styles.indicatorText}>5G</Text>

                {/* Battery */}
                <View style={styles.batteryContainer}>
                  <View style={styles.batteryBody}>
                    <View style={styles.batteryFill} />
                  </View>
                  <View style={styles.batteryCap} />
                </View>
              </View>
            </View>

            {/* iOS Home Indicator Bar */}
            <View style={styles.homeIndicatorContainer}>
              <View style={styles.homeIndicator} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  shadowContainer: {
    marginHorizontal: Spacing.three,
    marginVertical: Spacing.four,
    // Soft deep iOS shadow
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.18,
    shadowRadius: 25,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phoneOuterBorder: {
    borderRadius: 50,
    backgroundColor: '#333333', // Steel edge
    padding: 3, // Ring thickness
  },
  phoneBezel: {
    width: 360,
    height: 760,
    borderRadius: 47,
    backgroundColor: '#000000', // Black iPhone bezel
    padding: 11, // Bezel width
    justifyContent: 'center',
    alignItems: 'center',
  },
  screen: {
    width: '100%',
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 38,
    overflow: 'hidden',
    position: 'relative',
  },
  statusBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    zIndex: 9999, // Floating on top of screen content
    pointerEvents: 'none', // Touch events pass through to content
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: -0.2,
    width: 60,
  },
  dynamicIsland: {
    width: 100,
    height: 28,
    backgroundColor: '#000000',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: '50%',
    marginLeft: -50,
    top: 10,
  },
  cameraLens: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#111122',
    alignSelf: 'flex-end',
    marginRight: 16,
  },
  rightIndicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 60,
    justifyContent: 'flex-end',
  },
  indicatorText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#000000',
  },
  signalIcon: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 1.5,
  },
  signalBar: {
    width: 2.5,
    backgroundColor: '#000000',
    borderRadius: 0.5,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 20,
    height: 10,
    borderRadius: 2.5,
    borderWidth: 1,
    borderColor: '#000000',
    padding: 1,
    justifyContent: 'center',
  },
  batteryFill: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 1,
  },
  batteryCap: {
    width: 1.5,
    height: 4,
    backgroundColor: '#000000',
    borderTopRightRadius: 1,
    borderBottomRightRadius: 1,
  },
  homeIndicatorContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    pointerEvents: 'none',
  },
  homeIndicator: {
    width: 120,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#000000',
  },
});
