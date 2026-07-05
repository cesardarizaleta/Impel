import React, { useState, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, ActivityIndicator, useWindowDimensions, Platform } from 'react-native';
import { useVault, Account } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import {
  WarningIcon,
  CheckIcon,
  ShieldIcon,
  HomeIcon,
  KeyIcon,
  UnlockIcon,
  PlusIcon,
  LockIcon,
  CopyIcon,
} from './icons';

// --- Score Ring (Pure View, no SVG) ---
function ScoreRing({ score, size = 110, strokeWidth = 12 }: { score: number; size?: number; strokeWidth?: number }) {
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      {/* Outer circle track */}
      <View style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: strokeWidth,
        borderColor: '#E5E5EA',
        justifyContent: 'center',
        alignItems: 'center',
      }}>
        {/* We overlay a black arc effect using quarter-circle clipping */}
      </View>
      {/* Score overlay in center */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 22, fontFamily: Fonts.bold, color: '#000000' }}>{score}%</Text>
        <Text style={{ fontSize: 9, fontFamily: Fonts.bold, color: '#8E8E93', letterSpacing: 0.5 }}>SEGURIDAD</Text>
      </View>
      {/* Score fill indicator - top right arc overlay */}
      {score > 0 && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: 'transparent',
          borderTopColor: '#000000',
          borderRightColor: score > 25 ? '#000000' : 'transparent',
          borderBottomColor: score > 50 ? '#000000' : 'transparent',
          borderLeftColor: score > 75 ? '#000000' : 'transparent',
          transform: [{ rotate: '-45deg' }],
        }} />
      )}
    </View>
  );
}

// --- Horizontal bar chart ---
function BarRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <View style={barStyles.row}>
      <View style={barStyles.labelCol}>
        <View style={[barStyles.dot, { backgroundColor: color }]} />
        <Text style={barStyles.label}>{label}</Text>
      </View>
      <View style={barStyles.trackContainer}>
        <View style={barStyles.track}>
          <View style={[barStyles.fill, { width: `${Math.max(pct, 2)}%`, backgroundColor: color }]} />
        </View>
      </View>
      <Text style={barStyles.value}>{value}</Text>
    </View>
  );
}

const barStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  labelCol: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  label: { fontSize: 11, fontFamily: Fonts.bold, color: '#3A3A3C' },
  trackContainer: { flex: 1 },
  track: { height: 6, borderRadius: 3, backgroundColor: '#F2F2F7' },
  fill: { height: 6, borderRadius: 3 },
  value: { fontSize: 12, fontFamily: Fonts.bold, color: '#000000', width: 24, textAlign: 'right' },
});

// --- Duplicate detection ---
function findDuplicates(accounts: Account[]): Map<string, Account[]> {
  const passMap = new Map<string, Account[]>();
  for (const acc of accounts) {
    const pass = acc.password || '';
    if (!pass) continue;
    if (!passMap.has(pass)) passMap.set(pass, []);
    passMap.get(pass)!.push(acc);
  }
  // Keep only groups with 2+ accounts sharing same password
  const duplicates = new Map<string, Account[]>();
  passMap.forEach((group, pass) => {
    if (group.length >= 2) duplicates.set(pass, group);
  });
  return duplicates;
}

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

  const { width } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && width >= 1120;

  // Derived metrics
  const leakedAccounts = accounts.filter(a => a.strength === 'leaked');
  const weakAccounts = accounts.filter(a => a.strength === 'weak');
  const safeAccounts = accounts.filter(a => a.strength === 'safe');
  const vulnerableAccounts = accounts.filter(a => a.strength !== 'safe');

  // Duplicate passwords
  const duplicateGroups = useMemo(() => findDuplicates(accounts), [accounts]);
  const totalDuplicateAccounts = useMemo(() => {
    let count = 0;
    duplicateGroups.forEach(group => { count += group.length; });
    return count;
  }, [duplicateGroups]);

  // Password length stats
  const avgPasswordLength = useMemo(() => {
    const withPass = accounts.filter(a => a.password);
    if (withPass.length === 0) return 0;
    const sum = withPass.reduce((s, a) => s + (a.password?.length || 0), 0);
    return Math.round(sum / withPass.length);
  }, [accounts]);

  const handleFixAll = async () => {
    setIsFixing(true);
    setFixProgress(0.1);

    const interval = setInterval(() => {
      setFixProgress((prev) => {
        if (prev >= 1) { clearInterval(interval); return 1; }
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
    await new Promise(resolve => setTimeout(resolve, 600));
    fixSingleAccount(accountId);
    setFixingAccountId(null);
  };

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Auditoria</Text>
        <Text style={styles.headerSubtitle}>Escaneo en tiempo real de vulnerabilidades</Text>
      </View>

      <ScrollView
        style={styles.scrollList}
        contentContainerStyle={[styles.scrollContent, !isLargeScreen && { paddingBottom: 120 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* === MAIN DASHBOARD CARD === */}
        <View style={styles.dashboardCard}>
          <View style={styles.dashboardTopRow}>
            {/* Score Ring */}
            <ScoreRing score={securityScore} size={110} strokeWidth={12} />

            {/* Score info */}
            <View style={styles.dashboardInfo}>
              <Text style={styles.dashboardStatusTitle}>
                {securityScore === 100 ? 'Boveda Blindada' : securityScore > 70 ? 'Riesgo Moderado' : 'Riesgo Critico'}
              </Text>
              <Text style={styles.dashboardStatusDesc}>
                {securityScore === 100
                  ? 'Todas tus claves son seguras y no aparecen en filtraciones.'
                  : `${vulnerableAccounts.length} credencial${vulnerableAccounts.length !== 1 ? 'es' : ''} en riesgo.`}
              </Text>

              {/* Inline stats */}
              <View style={styles.inlineStats}>
                <View style={styles.inlineStat}>
                  <Text style={styles.inlineStatNum}>{accounts.length}</Text>
                  <Text style={styles.inlineStatLabel}>Total</Text>
                </View>
                <View style={styles.inlineStatDivider} />
                <View style={styles.inlineStat}>
                  <Text style={styles.inlineStatNum}>{avgPasswordLength}</Text>
                  <Text style={styles.inlineStatLabel}>Largo Prom.</Text>
                </View>
                <View style={styles.inlineStatDivider} />
                <View style={styles.inlineStat}>
                  <Text style={styles.inlineStatNum}>{duplicateGroups.size}</Text>
                  <Text style={styles.inlineStatLabel}>Repetidas</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Bar breakdown */}
          <View style={styles.barSection}>
            <BarRow label="Seguras" value={safeAccounts.length} total={accounts.length} color="#000000" />
            <BarRow label="Debiles" value={weakAccounts.length} total={accounts.length} color="#8E8E93" />
            <BarRow label="Filtradas" value={leakedAccounts.length} total={accounts.length} color="#C7C7CC" />
          </View>
        </View>

        {/* === FIX ALL BUTTON === */}
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

        {/* === DUPLICATE PASSWORDS SECTION === */}
        {duplicateGroups.size > 0 && (
          <>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Contrasenas Repetidas</Text>
              <View style={styles.sectionBadge}>
                <Text style={styles.sectionBadgeText}>{totalDuplicateAccounts}</Text>
              </View>
            </View>

            <Text style={styles.sectionDesc}>
              Reutilizar contrasenas expone multiples cuentas si una es comprometida.
            </Text>

            <View style={styles.duplicateList}>
              {Array.from(duplicateGroups.entries()).map(([pass, group], idx) => (
                <View key={`dup-${idx}`} style={styles.duplicateCard}>
                  <View style={styles.duplicateHeader}>
                    <View style={styles.duplicateIconCircle}>
                      <CopyIcon size={14} color="#000000" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.duplicateTitle}>{group.length} cuentas comparten esta clave</Text>
                      <Text style={styles.duplicatePass}>{'*'.repeat(Math.min(pass.length, 12))}</Text>
                    </View>
                  </View>
                  <View style={styles.duplicateAccounts}>
                    {group.map(acc => (
                      <View key={acc.id} style={styles.duplicateAccountChip}>
                        <Text style={styles.duplicateAccountText}>{acc.name}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ))}
            </View>
          </>
        )}

        {/* === VULNERABLE ACCOUNTS === */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Analisis de Credenciales</Text>
          <View style={styles.sectionBadge}>
            <Text style={styles.sectionBadgeText}>{vulnerableAccounts.length}</Text>
          </View>
        </View>

        {vulnerableAccounts.length === 0 ? (
          <View style={styles.successCard}>
            <View style={styles.successIconCircle}>
              <CheckIcon size={20} color="#000000" />
            </View>
            <Text style={styles.successTitle}>Boveda Segura</Text>
            <Text style={styles.successSubtitle}>
              No se detectaron contrasenas vulnerables en tu llavero.
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
                    <View style={styles.vulnerableCardLeft}>
                      <View style={[styles.severityDot, { backgroundColor: isLeaked ? '#000000' : '#8E8E93' }]} />
                      <View>
                        <Text style={styles.vulnerableCardName}>{account.name}</Text>
                        <Text style={styles.vulnerableCardUser}>{account.username}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.vulnerableBadge,
                      { backgroundColor: isLeaked ? '#000000' : '#E5E5EA' }
                    ]}>
                      <Text style={[
                        styles.vulnerableBadgeText,
                        { color: isLeaked ? '#FFFFFF' : '#3A3A3C' }
                      ]}>
                        {isLeaked ? 'Filtrada' : 'Debil'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.vulnerableCardReasonBox}>
                    <Text style={styles.vulnerableCardReasonText}>
                      {isLeaked
                        ? 'Esta clave se detecto en una brecha de datos publica en internet. Cambia esta contrasena de inmediato.'
                        : 'Esta clave es corta o facil de adivinar. Recomendamos generar una clave aleatoria fuerte.'}
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
                      <Text style={styles.fixButtonText}>Reparar Contrasena</Text>
                    )}
                  </Pressable>
                </View>
              );
            })}
          </View>
        )}

        {/* === SECURITY TIPS === */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Recomendaciones</Text>
        </View>
        <View style={styles.tipsContainer}>
          <View style={styles.tipCard}>
            <View style={styles.tipIconCircle}>
              <LockIcon size={14} color="#000000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Usa claves de 16+ caracteres</Text>
              <Text style={styles.tipDesc}>Combina mayusculas, numeros y simbolos para maxima entropia.</Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <View style={styles.tipIconCircle}>
              <ShieldIcon size={14} color="#000000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Nunca repitas contrasenas</Text>
              <Text style={styles.tipDesc}>Cada cuenta debe tener una clave unica e irrepetible.</Text>
            </View>
          </View>
          <View style={styles.tipCard}>
            <View style={styles.tipIconCircle}>
              <KeyIcon size={14} color="#000000" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.tipTitle}>Activa 2FA donde sea posible</Text>
              <Text style={styles.tipDesc}>Un segundo factor protege incluso si tu clave es comprometida.</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Floating Tab Bar */}
      {!isLargeScreen && (
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBarCapsule}>
            <Pressable style={styles.bottomTabItem} onPress={() => setActiveTab('unlock')}>
              <HomeIcon size={18} color="#8E8E93" />
            </Pressable>
            <Pressable style={styles.bottomTabItem} onPress={() => setActiveTab('vault')}>
              <KeyIcon size={18} color="#8E8E93" />
            </Pressable>
            <Pressable style={styles.bottomTabItem} onPress={() => { setActiveTab('vault'); setIsAddOpen(true); }}>
              <PlusIcon size={18} color="#8E8E93" />
            </Pressable>
            <Pressable style={[styles.bottomTabItem, styles.bottomTabItemActive]} onPress={() => setActiveTab('audit')}>
              <ShieldIcon size={16} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.bottomTabItem} onPress={lock}>
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
    backgroundColor: '#F2F2F7',
    position: 'relative',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    backgroundColor: '#F2F2F7',
  },
  headerTitle: {
    fontSize: 26,
    fontFamily: Fonts.bold,
    color: '#000000',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    fontFamily: Fonts.bold,
    marginTop: 2,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.one,
    paddingBottom: 120,
  },

  // --- Dashboard Card ---
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: Spacing.four,
    marginBottom: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  dashboardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
    marginBottom: Spacing.four,
  },
  dashboardInfo: {
    flex: 1,
  },
  dashboardStatusTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#000000',
    marginBottom: 4,
  },
  dashboardStatusDesc: {
    fontSize: 11,
    color: '#8E8E93',
    fontFamily: Fonts.regular,
    lineHeight: 15,
    marginBottom: Spacing.three,
  },
  inlineStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  inlineStat: {
    alignItems: 'center',
  },
  inlineStatNum: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  inlineStatLabel: {
    fontSize: 8,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 1,
  },
  inlineStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E5EA',
  },
  barSection: {
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    paddingTop: Spacing.three,
  },

  // --- Fix All ---
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
    fontFamily: Fonts.bold,
  },
  fixingProgressRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // --- Sections ---
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
    marginTop: Spacing.two,
  },
  sectionTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  sectionBadge: {
    backgroundColor: '#000000',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sectionBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  sectionDesc: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    lineHeight: 15,
    marginBottom: Spacing.three,
  },

  // --- Duplicates ---
  duplicateList: {
    gap: Spacing.two,
    marginBottom: Spacing.three,
  },
  duplicateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: Spacing.three,
    borderLeftWidth: 3,
    borderLeftColor: '#000000',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  duplicateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.two,
  },
  duplicateIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  duplicateTitle: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  duplicatePass: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    marginTop: 1,
  },
  duplicateAccounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  duplicateAccountChip: {
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  duplicateAccountText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#3A3A3C',
  },

  // --- Success ---
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginTop: Spacing.one,
  },
  successIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.two,
  },
  successTitle: {
    fontSize: 15,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
  },
  successSubtitle: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: Spacing.one,
    lineHeight: 15,
  },

  // --- Vulnerable List ---
  vulnerableList: {
    gap: Spacing.two,
  },
  vulnerableCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  vulnerableCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  vulnerableCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  vulnerableCardName: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  vulnerableCardUser: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    marginTop: 1,
  },
  vulnerableBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vulnerableBadgeText: {
    fontSize: 10,
    fontFamily: Fonts.bold,
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
    lineHeight: 15,
    fontFamily: Fonts.regular,
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
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },

  // --- Tips ---
  tipsContainer: {
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 3,
    elevation: 1,
  },
  tipIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  tipDesc: {
    fontSize: 10,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    lineHeight: 14,
    marginTop: 2,
  },

  // --- Tab Bar ---
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
