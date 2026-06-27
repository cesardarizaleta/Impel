import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ActivityIndicator } from 'react-native';
import { useVault } from '@/hooks/use-vault';
import { Spacing } from '@/constants/theme';
import { ImpelLogo } from './logo';
import { UnlockIcon } from './icons';

export function ScreenLogin() {
  const { appLogin } = useVault();
  const [authenticating, setAuthenticating] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async () => {
    setAuthenticating(true);
    setErrorMsg(null);
    try {
      const success = await appLogin();
      if (!success) {
        setErrorMsg('Autenticación denegada. Intenta de nuevo.');
      }
    } catch (err) {
      setErrorMsg('Error al conectar con la seguridad biométrica.');
    } finally {
      setAuthenticating(false);
    }
  };

  useEffect(() => {
    handleLogin();
  }, []);

  return (
    <View style={styles.container}>
      {/* Centered Logo container */}
      <View style={styles.logoContainer}>
        <ImpelLogo size={72} />
      </View>

      {/* Bottom Actions section */}
      <View style={styles.bottomSection}>
        {errorMsg && (
          <Text style={styles.errorText}>{errorMsg}</Text>
        )}
        
        <Pressable
          style={({ pressed }) => [
            styles.loginBtn,
            pressed && { opacity: 0.9 },
            authenticating && { backgroundColor: '#2C2C2E' },
          ]}
          onPress={handleLogin}
          disabled={authenticating}
        >
          {authenticating ? (
            <ActivityIndicator size="small" color="#000000" />
          ) : (
            <View style={styles.btnRow}>
              <UnlockIcon size={16} color="#000000" />
              <Text style={styles.loginBtnText}>Desbloquear con Biometría</Text>
            </View>
          )}
        </Pressable>
        
        <Text style={styles.infoLabel}>La sesión durará 12 horas activa</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000', // Solid carbon black background
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 80,
    paddingHorizontal: Spacing.six,
  },
  pulseCircle: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: '#1C1C1E',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#3A3A3C',
    marginBottom: Spacing.three,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.2,
  },
  promptDesc: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '500',
    marginTop: Spacing.two,
    maxWidth: 260,
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSection: {
    width: '100%',
    alignItems: 'center',
    gap: Spacing.three,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  loginBtn: {
    width: '100%',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF', // High-contrast premium white
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  loginBtnText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '800',
  },
  infoLabel: {
    fontSize: 11,
    color: '#3A3A3C',
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 4,
  },
});
