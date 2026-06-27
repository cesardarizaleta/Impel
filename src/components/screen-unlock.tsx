import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import { useVault } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import {
  HomeIcon,
  KeyIcon,
  ShieldIcon,
  UnlockIcon,
  LockIcon,
  PlusIcon
} from './icons';

export function ScreenUnlock() {
  const {
    isUnlocked,
    accounts,
    activeTab,
    unlock,
    lock,
    setActiveTab,
    setIsAddOpen,
    appLogout,
    setLoginTime,
  } = useVault();

  const handleTabPress = async (targetTab: 'vault' | 'audit') => {
    if (isUnlocked) {
      setActiveTab(targetTab);
    } else {
      const success = await unlock();
      if (success) {
        setActiveTab(targetTab);
      }
    }
  };

  const handlePlusPress = async () => {
    if (isUnlocked) {
      setActiveTab('vault');
      setIsAddOpen(true);
    } else {
      const success = await unlock();
      if (success) {
        setActiveTab('vault');
        setIsAddOpen(true);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeTitle}>Mi Bóveda</Text>
          <Text style={styles.welcomeSubtitle}>Impel Down</Text>
        </View>
        <View style={styles.headerControls}>
          {/* Developer Expiration Test Button */}
          <Pressable
            style={styles.testBtn}
            onPress={() => {
              setLoginTime(Date.now() - 13 * 60 * 60 * 1000);
            }}
          >
            <Text style={styles.testBtnText}>Expirar 12h</Text>
          </Pressable>
          <Pressable style={styles.avatarContainer} onPress={appLogout}>
            <LockIcon size={18} color="#FF3B30" />
          </Pressable>
        </View>
      </View>

      {/* Centered Add Credentials Button Section */}
      <View style={styles.typographicBody}>
        <Pressable
          style={({ pressed }) => [
            styles.centerAddBtn,
            pressed && { opacity: 0.9 }
          ]}
          onPress={handlePlusPress}
        >
          <PlusIcon size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
          <Text style={styles.centerAddBtnText}>Agregar Credencial</Text>
        </Pressable>
        <Text style={styles.giantSubtext}>
          Tienes {accounts.length} contraseñas resguardadas con cifrado local de nivel militar en Impel Down.
        </Text>
      </View>

      {/* Floating Capsule Tab Bar (With Plus button in the center) */}
      <View style={styles.tabBarContainer}>
        <View style={styles.tabBarCapsule}>
          <Pressable
            style={[styles.tabItem, activeTab === 'unlock' && styles.tabItemActive]}
            onPress={() => setActiveTab('unlock')}
          >
            <HomeIcon size={18} color={activeTab === 'unlock' ? '#FFFFFF' : '#8E8E93'} />
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'vault' && styles.tabItemActive]}
            onPress={() => handleTabPress('vault')}
          >
            <KeyIcon size={18} color={activeTab === 'vault' ? '#FFFFFF' : '#8E8E93'} />
          </Pressable>

          {/* Plus Button in Center */}
          <Pressable
            style={styles.tabItem}
            onPress={handlePlusPress}
          >
            <PlusIcon size={18} color="#8E8E93" />
          </Pressable>

          <Pressable
            style={[styles.tabItem, activeTab === 'audit' && styles.tabItemActive]}
            onPress={() => handleTabPress('audit')}
          >
            <ShieldIcon size={16} color={activeTab === 'audit' ? '#FFFFFF' : '#8E8E93'} />
          </Pressable>

          <Pressable
            style={styles.tabItem}
            onPress={() => {
              if (isUnlocked) {
                lock();
              } else {
                unlock();
              }
            }}
          >
            {isUnlocked ? (
              <UnlockIcon size={18} color="#8E8E93" />
            ) : (
              <LockIcon size={18} color="#8E8E93" />
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Soft iOS light gray
    paddingTop: 60, // Account for status bar
    paddingHorizontal: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  welcomeTitle: {
    fontSize: 24,
    fontFamily: Fonts.bold,
    color: '#000000',
    letterSpacing: -0.5,
  },
  welcomeSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    fontFamily: Fonts.regular,
  },
  headerControls: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  testBtn: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  testBtnText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#555559',
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C7C7CC',
  },
  typographicBody: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 150, // Avoid overlapping with capsule tab bar
  },
  centerAddBtn: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 8,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.six,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: Spacing.three,
  },
  centerAddBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontFamily: Fonts.bold,
  },
  giantSubtext: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: Fonts.regular,
    maxWidth: 240,
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999,
    elevation: 99,
  },
  tabBarCapsule: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    gap: 4,
  },
  tabItem: {
    width: 44,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
