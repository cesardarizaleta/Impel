import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useVault } from '@/hooks/use-vault';
import { Spacing } from '@/constants/theme';
import {
  WarningIcon,
  CheckIcon,
  ShieldIcon,
  HomeIcon,
  KeyIcon,
  UnlockIcon,
  PlusIcon
} from './icons';

export function ScreenAudit() {
  const {
    accounts,
    fixAllRisks,
    fixSingleAccount,
    securityScore,
    setActiveTab,
    lock,
    setIsAddOpen,
  } = useVault();

  const [isFixing, setIsFixing] = useState(false);
  const [fixProgress, setFixProgress] = useState(0);
  const [fixingAccountId, setFixingAccountId] = useState<string | null>(null);

  // Responsive dimensions
  const { width } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && width >= 1120;

  // Derive real metrics from active accounts
  const leakedAccounts = accounts.filter(a => a.strength === 'leaked');
  const weakAccounts = accounts.filter(a => a.strength === 'weak');
  const safeAccounts = accounts.filter(a => a.strength === 'safe');
  
  const vulnerableAccounts = accounts.filter(a => a.strength !== 'safe');

  const handleFixAll = async () => {
    setIsFixing(true);
    setFixProgress(0.1);

    const interval = setInterval(() => {
      setFixProgress((prev) => {
        if (prev >= 1) {
          clearInterval(interval);
          return 1;
        }
        return prev + 0.15;
      });
    }, 250);

    await fixAllRisks();
    clearInterval(interval);
    setFixProgress(1);
    
    setTimeout(() => {
      setIsFixing(false);
      setFixProgress(0);
    }, 800);
  };

  const handleFixSingle = async (accountId: string) => {
    setFixingAccountId(accountId);
    // Simulate short encryption sequence
    await new Promise(resolve => setTimeout(resolve, 600));
    fixSingleAccount(accountId);
    setFixingAccountId(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Auditoría de Seguridad</Text>
        <Text style={styles.headerSubtitle}>Escaneo en tiempo real de vulnerabilidades</Text>
      </View>

      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={[styles.scrollContent, !isLargeScreen && { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Dynamic Security Score Card */}
        <View style={styles.dashboardCard}>
          <View style={styles.scoreRow}>
            <View style={[
              styles.scoreCircle,
              { borderColor: securityScore === 100 ? '#34C759' : securityScore > 50 ? '#FF9500' : '#FF3B30' }
            ]}>
              <Text style={styles.scoreText}>{securityScore}%</Text>
            </View>
            <View style={styles.scoreTextCol}>
              <Text style={styles.scoreStatusTitle}>
                {securityScore === 100 ? 'Bóveda Blindada' : 'Acción Sugerida'}
              </Text>
              <Text style={styles.scoreStatusDesc}>
                {securityScore === 100
                  ? 'Todas tus claves son seguras y no aparecen en filtraciones conocidas.'
                  : `Tienes ${vulnerableAccounts.length} credenciales en riesgo de seguridad.`}
              </Text>
            </View>
          </View>

          {/* Real Metrics Row */}
          <View style={styles.metricsGrid}>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNum, { color: '#FF3B30' }]}>{leakedAccounts.length}</Text>
              <Text style={styles.metricLabel}>Filtradas</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNum, { color: '#FF9500' }]}>{weakAccounts.length}</Text>
              <Text style={styles.metricLabel}>Débiles</Text>
            </View>
            <View style={styles.metricBox}>
              <Text style={[styles.metricNum, { color: '#34C759' }]}>{safeAccounts.length}</Text>
              <Text style={styles.metricLabel}>Seguras</Text>
            </View>
          </View>
        </View>

        {/* Inline Fix All Button */}
        {vulnerableAccounts.length > 0 && (
          <Pressable
            style={({ pressed }) => [
              styles.fixAllBtn,
              pressed && { opacity: 0.9 },
              isFixing && { backgroundColor: '#2C2C2E' }
            ]}
            onPress={handleFixAll}
            disabled={isFixing}
          >
            {isFixing ? (
              <View style={styles.fixingProgressRow}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.fixAllBtnText}>
                  Actualizando credenciales... {Math.round(fixProgress * 100)}%
                </Text>
              </View>
            ) : (
              <Text style={styles.fixAllBtnText}>Reparar Todas las Vulnerabilidades</Text>
            )}
          </Pressable>
        )}

        {/* Vulnerable Passwords List */}
        <Text style={styles.sectionTitle}>Análisis de Credenciales</Text>

        {vulnerableAccounts.length === 0 ? (
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckIcon size={24} color="#34C759" />
            </View>
            <Text style={styles.successTitle}>¡Bóveda Segura!</Text>
            <Text style={styles.successSubtitle}>
              No se detectaron contraseñas vulnerables en tu llavero.
            </Text>
          </View>
        ) : (
          <View style={styles.vulnerableList}>
            {vulnerableAccounts.map((account) => {
              const isLeaked = account.strength === 'leaked';
              const isFixingThis = fixingAccountId === account.id;

              return (
                <View key={account.id} style={styles.vulnerableCard}>
                  <View style={styles.vulnerableCardHeader}>
                    <Text style={styles.vulnerableCardName}>{account.name}</Text>
                    <View style={[
                      styles.vulnerableBadge,
                      { backgroundColor: isLeaked ? '#FFECEB' : '#FFF9E6' }
                    ]}>
                      <Text style={[
                        styles.vulnerableBadgeText,
                        { color: isLeaked ? '#FF3B30' : '#FF9500' }
                      ]}>
                        {isLeaked ? 'Filtrada' : 'Débil'}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.vulnerableCardUser}>{account.username}</Text>

                  <View style={styles.vulnerableCardReasonBox}>
                    <Text style={styles.vulnerableCardReasonText}>
                      {isLeaked
                        ? 'Esta clave se detectó en una brecha de datos pública en internet. Cambia esta contraseña de inmediato.'
                        : 'Esta clave es corta o fácil de adivinar. Recomendamos generar una clave aleatoria fuerte.'}
                    </Text>
                  </View>

                  <Pressable
                    style={({ pressed }) => [
                      styles.fixButton,
                      pressed && { opacity: 0.8 },
                      isFixingThis && { backgroundColor: '#E5E5EA' }
                    ]}
                    onPress={() => handleFixSingle(account.id)}
                    disabled={isFixingThis || isFixing}
                  >
                    {isFixingThis ? (
                      <ActivityIndicator size="small" color="#000000" />
                    ) : (
                      <Text style={styles.fixButtonText}>Reparar Contraseña</Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Tab Bar for mobile navigation (With Plus in the Center) */}
      {!isLargeScreen && (
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBarCapsule}>
            <Pressable
              style={styles.bottomTabItem}
              onPress={() => setActiveTab('unlock')}
            >
              <HomeIcon size={18} color="#8E8E93" />
            </Pressable>

            <Pressable
              style={styles.bottomTabItem}
              onPress={() => setActiveTab('vault')}
            >
              <KeyIcon size={18} color="#8E8E93" />
            </Pressable>

            {/* Plus Tab Button */}
            <Pressable
              style={styles.bottomTabItem}
              onPress={() => {
                setActiveTab('vault');
                setIsAddOpen(true);
              }}
            >
              <PlusIcon size={18} color="#8E8E93" />
            </Pressable>

            <Pressable
              style={[styles.bottomTabItem, styles.bottomTabItemActive]}
              onPress={() => setActiveTab('audit')}
            >
              <ShieldIcon size={16} color="#FFFFFF" />
            </Pressable>

            <Pressable
              style={styles.bottomTabItem}
              onPress={lock}
            >
              <UnlockIcon size={18} color="#8E8E93" />
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Soft light gray background
    position: 'relative',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: 2,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.two,
    paddingBottom: 120,
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  scoreCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#000000',
  },
  scoreTextCol: {
    flex: 1,
  },
  scoreStatusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
  },
  scoreStatusDesc: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
    lineHeight: 14,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  metricBox: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  metricNum: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  fixAllBtn: {
    height: 48,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.four,
  },
  fixAllBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  fixingProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#000000',
    marginBottom: Spacing.three,
  },
  successCard: {
    backgroundColor: '#EAFDF0',
    borderRadius: 8,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#34C759',
    marginTop: Spacing.two,
  },
  successIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C5E28',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 12,
    color: '#1C5E28',
    textAlign: 'center',
    opacity: 0.8,
    marginTop: Spacing.one,
    lineHeight: 16,
  },
  vulnerableList: {
    gap: Spacing.two,
  },
  vulnerableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  vulnerableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vulnerableCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#000000',
  },
  vulnerableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vulnerableBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  vulnerableCardUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 2,
  },
  vulnerableCardReasonBox: {
    backgroundColor: '#F2F2F7',
    padding: 8,
    borderRadius: 6,
    marginTop: Spacing.two,
  },
  vulnerableCardReasonText: {
    fontSize: 11,
    color: '#3A3A3C',
    lineHeight: 14,
    fontWeight: '500',
  },
  fixButton: {
    height: 36,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  fixButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  tabBarContainer: {
    position: 'absolute',
    bottom: 24,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 99999, // Layered on top of everything
    elevation: 99,
  },
  tabBarCapsule: {
    flexDirection: 'row',
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1C1C1E', // Black capsule bar
    alignItems: 'center',
    paddingHorizontal: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
    gap: 4,
  },
  bottomTabItem: {
    width: 44,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomTabItemActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
});
