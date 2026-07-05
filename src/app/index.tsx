import React from 'react';
import { View, StyleSheet, useWindowDimensions, Platform, Text, useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { VaultProvider, useVault } from '@/hooks/use-vault';
import { IPhoneFrame } from '@/components/iphone-frame';
import { ScreenUnlock } from '@/components/screen-unlock';
import { ScreenVault } from '@/components/screen-vault';
import { ScreenAudit } from '@/components/screen-audit';
import { ScreenLogin } from '@/components/screen-login';
import { Spacing } from '@/constants/theme';
import { ImpelLogo } from '@/components/logo';
import { LockIcon, ShieldIcon } from '@/components/icons';

function MainAppContent() {
  const { width } = useWindowDimensions();
  const { isUnlocked, activeTab, isLoggedIn } = useVault();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  // Desktop Side-by-Side Layout
  const isLargeScreen = Platform.OS === 'web' && width >= 1120;

  // Session guard check
  if (!isLoggedIn) {
    if (isLargeScreen) {
      return (
        <View style={styles.desktopContainer}>
          {/* Desktop Header */}
          <View style={styles.desktopHeader}>
            <View style={styles.logoRow}>
              <ImpelLogo size={36} />
              <Text style={styles.logoText}>IMPEL</Text>
            </View>
            <View style={styles.securityStatus}>
              <View style={[styles.statusDot, { backgroundColor: '#FF3B30' }]} />
              <Text style={styles.statusText}>Sesión Bloqueada</Text>
            </View>
          </View>

          {/* Three iPhones Simulator Showcase */}
          <View style={styles.showcaseGrid}>
            {/* PHONE 1: Initial Login lock screen */}
            <IPhoneFrame>
              <ScreenLogin />
            </IPhoneFrame>

            {/* PHONE 2: Vault lock overlay */}
            <IPhoneFrame>
              <View style={{ flex: 1, backgroundColor: '#000000' }}>
                <View style={styles.frostedLockOverlay}>
                  <LockIcon size={48} color="#FFFFFF" style={styles.overlayLockIcon} />
                  <Text style={styles.overlayLockTitle}>Sesión Cerrada</Text>
                  <Text style={styles.overlayLockSubtitle}>
                    Inicia sesión biométrica en el iPhone izquierdo para descifrar y activar las pantallas.
                  </Text>
                </View>
              </View>
            </IPhoneFrame>

            {/* PHONE 3: Audit lock overlay */}
            <IPhoneFrame>
              <View style={{ flex: 1, backgroundColor: '#000000' }}>
                <View style={styles.frostedLockOverlay}>
                  <LockIcon size={48} color="#FFFFFF" style={styles.overlayLockIcon} />
                  <Text style={styles.overlayLockTitle}>Sesión Cerrada</Text>
                  <Text style={styles.overlayLockSubtitle}>
                    Inicia sesión biométrica en el iPhone izquierdo para descifrar y activar las pantallas.
                  </Text>
                </View>
              </View>
            </IPhoneFrame>
          </View>

          {/* Desktop Footer Instructions */}
          <View style={styles.desktopFooter}>
            <Text style={styles.footerText}>
              Impel utiliza dos niveles de biometría. Haz clic en "Desbloquear con Biometría" en el teléfono izquierdo para iniciar tu sesión de 12 horas.
            </Text>
          </View>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <View style={styles.mobileWebWrapper}>
          <IPhoneFrame>
            <ScreenLogin />
          </IPhoneFrame>
        </View>
      );
    }

    return (
      <SafeAreaProvider>
        <View style={styles.nativeContainer}>
          <ScreenLogin />
        </View>
      </SafeAreaProvider>
    );
  }

  // Active view when logged in
  if (isLargeScreen) {
    return (
      <View style={styles.desktopContainer}>
        {/* Desktop Header */}
        <View style={styles.desktopHeader}>
          <View style={styles.logoRow}>
            <ImpelLogo size={36} />
            <Text style={styles.logoText}>IMPEL</Text>
          </View>
          <View style={styles.securityStatus}>
            <View style={[styles.statusDot, { backgroundColor: isUnlocked ? '#34C759' : '#FF9500' }]} />
            <Text style={styles.statusText}>
              {isUnlocked ? 'Bóveda Desbloqueada' : 'Bóveda Cerrada (Sesión Activa)'}
            </Text>
          </View>
        </View>

        {/* Three iPhones Side-by-Side */}
        <View style={styles.showcaseGrid}>
          {/* PHONE 1: Welcome & Unlock */}
          <IPhoneFrame>
            <ScreenUnlock />
          </IPhoneFrame>

          {/* PHONE 2: Vault Accounts */}
          <IPhoneFrame>
            <View style={{ flex: 1 }}>
              <ScreenVault />
              {/* Frosted lock screen if locked */}
              {!isUnlocked && (
                <View style={styles.frostedLockOverlay}>
                  <LockIcon size={48} color="#FFFFFF" style={styles.overlayLockIcon} />
                  <Text style={styles.overlayLockTitle}>Bóveda Bloqueada</Text>
                  <Text style={styles.overlayLockSubtitle}>
                    Autentícate en el panel principal (Teléfono Izquierdo) para ver tus credenciales.
                  </Text>
                </View>
              )}
            </View>
          </IPhoneFrame>

          {/* PHONE 3: Security Audit */}
          <IPhoneFrame>
            <View style={{ flex: 1 }}>
              <ScreenAudit />
              {/* Frosted lock screen if locked */}
              {!isUnlocked && (
                <View style={styles.frostedLockOverlay}>
                  <ShieldIcon size={48} color="#FFFFFF" style={styles.overlayLockIcon} />
                  <Text style={styles.overlayLockTitle}>Reporte Bloqueado</Text>
                  <Text style={styles.overlayLockSubtitle}>
                    El informe de auditoría se generará una vez descifrada la bóveda.
                  </Text>
                </View>
              )}
            </View>
          </IPhoneFrame>
        </View>

        {/* Desktop Footer Instructions */}
        <View style={styles.desktopFooter}>
          <Text style={styles.footerText}>
            Sesión iniciada. Haz clic en "Toca para desbloquear" (Llave) en el teléfono izquierdo para simular la lectura de FaceID del vault.
          </Text>
        </View>
      </View>
    );
  }

  // Mobile / Narrow Layout (Single screen navigation)
  const renderActiveScreen = () => {
    switch (activeTab) {
      case 'unlock':
        return <ScreenUnlock />;
      case 'vault':
        return isUnlocked ? <ScreenVault /> : <ScreenUnlock />;
      case 'audit':
        return isUnlocked ? <ScreenAudit /> : <ScreenUnlock />;
      default:
        return <ScreenUnlock />;
    }
  };

  if (Platform.OS === 'web') {
    return (
      <View style={styles.mobileWebWrapper}>
        <IPhoneFrame>
          {renderActiveScreen()}
        </IPhoneFrame>
      </View>
    );
  }

  // Pure Native Mobile View
  return (
    <SafeAreaProvider>
      <View style={styles.nativeContainer}>
        {renderActiveScreen()}
      </View>
    </SafeAreaProvider>
  );
}

export default function HomeScreen() {
  return (
    <VaultProvider>
      <MainAppContent />
    </VaultProvider>
  );
}

const styles = StyleSheet.create({
  desktopContainer: {
    flex: 1,
    backgroundColor: '#E5E5EA', // Soft gray background of the showroom
    justifyContent: 'space-between',
    paddingVertical: Spacing.four,
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  desktopHeader: {
    width: '90%',
    maxWidth: 1200,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  logoText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#000000',
    letterSpacing: 2,
  },
  securityStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    backgroundColor: '#FFFFFF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#000000',
  },
  showcaseGrid: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: Spacing.six,
    flex: 1,
    marginVertical: Spacing.four,
  },
  desktopFooter: {
    width: '90%',
    maxWidth: 800,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '600',
  },
  mobileWebWrapper: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  nativeContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  frostedLockOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    zIndex: 999,
  },
  overlayLockIcon: {
    marginBottom: Spacing.three,
  },
  overlayLockTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: Spacing.two,
  },
  overlayLockSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
  },
});
