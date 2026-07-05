import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, TextInput, PanResponder } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { useVault, Account } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import { BrandLogo } from './brand-logo';
import {
  HomeIcon,
  KeyIcon,
  ShieldIcon,
  UnlockIcon,
  LockIcon,
  PlusIcon,
  CopyIcon
} from './icons';

import { Chatbot } from './chatbot';

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
    chatMessages,
    setChatMessages: setChatMessagesWrapper,
    selectedDetailAccount,
    setSelectedDetailAccount,
    updateAccount,
  } = useVault();

  // Edit account states inside detail view
  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editCustomFields, setEditCustomFields] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    if (selectedDetailAccount) {
      setEditName(selectedDetailAccount.name);
      setEditUsername(selectedDetailAccount.username);
      setEditPassword(selectedDetailAccount.password || '');
      setEditCustomFields(selectedDetailAccount.customFields || []);
      setIsEditingDetail(false);
    }
  }, [selectedDetailAccount]);

  const handleSaveEdit = async () => {
    if (!selectedDetailAccount) return;
    if (!editName.trim() || !editUsername.trim()) {
      triggerToast('Nombre y usuario requeridos.');
      return;
    }

    const updated: Account = {
      ...selectedDetailAccount,
      name: editName.trim(),
      username: editUsername.trim(),
      password: editPassword,
      customFields: editCustomFields.length > 0 ? editCustomFields : undefined,
    };

    await updateAccount(updated);
    setIsEditingDetail(false);
    triggerToast('¡Credencial actualizada!');
  };

  // Drag-to-close PanResponder for details sheet
  const detailPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          bottomSheetTranslation.value = gestureState.dy;
        } else {
          bottomSheetTranslation.value = gestureState.dy * 0.15; // Elastic pull-up bouncy resistance
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeDetailDrawer();
        } else {
          bottomSheetTranslation.value = withTiming(0, { duration: 200 });
        }
      },
    })
  ).current;

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Reanimated Translation for custom bottom sheet drawer
  const bottomSheetTranslation = useSharedValue(450);

  // Sync drawer animation with selectedDetailAccount
  useEffect(() => {
    if (selectedDetailAccount) {
      bottomSheetTranslation.value = withTiming(0, { duration: 300 });
    } else {
      bottomSheetTranslation.value = withTiming(450, { duration: 250 });
    }
  }, [selectedDetailAccount]);

  const closeDetailDrawer = () => {
    bottomSheetTranslation.value = withTiming(450, { duration: 250 });
    setTimeout(() => {
      setSelectedDetailAccount(null);
    }, 250);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = bottomSheetTranslation.value === 450 ? 0 : 0.4;
    return {
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const bottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomSheetTranslation.value }],
  }));

  // Helper for brand colors
  const getLogoStyle = (key: string) => {
    const styles: Record<string, { bg: string; color: string; char: string }> = {
      netflix: { bg: '#E50914', color: '#FFFFFF', char: 'N' },
      google: { bg: '#4285F4', color: '#FFFFFF', char: 'G' },
      github: { bg: '#24292F', color: '#FFFFFF', char: 'G' },
      spotify: { bg: '#1DB954', color: '#FFFFFF', char: 'S' },
      adobe: { bg: '#FF0000', color: '#FFFFFF', char: 'A' },
      epicgames: { bg: '#000000', color: '#FFFFFF', char: 'E' },
    };
    return styles[key] || { bg: '#8E8E93', color: '#FFFFFF', char: key.charAt(0).toUpperCase() };
  };

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
    <>
      <View style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeTitle}>Mi Bóveda</Text>
          <Text style={styles.welcomeSubtitle}>Impel</Text>
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

      {/* Sequential Assist Chatbot */}
      <Chatbot />

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

      {/* Details Bottom Drawer */}
      {selectedDetailAccount && (
        <>
          {/* Backdrop overlay */}
          <Animated.View
            onTouchStart={closeDetailDrawer}
            style={[StyleSheet.absoluteFill, styles.backdrop, backdropAnimatedStyle]}
          />
          
          <Animated.View
            style={[
              styles.bottomSheet,
              bottomSheetAnimatedStyle,
            ]}
          >
            {/* Handle bar */}
            <View style={styles.bottomSheetHandleContainer} {...detailPanResponder.panHandlers}>
              <View style={styles.bottomSheetHandle} />
            </View>

            <View style={styles.detailSheetContent}>
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.detailSheetScrollContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.detailHeaderCard}>
                  <View style={styles.detailLogoCircle}>
                    <BrandLogo
                      logoKey={selectedDetailAccount.logo}
                      char={getLogoStyle(selectedDetailAccount.logo).char}
                      bgColor={getLogoStyle(selectedDetailAccount.logo).bg}
                      color={getLogoStyle(selectedDetailAccount.logo).color}
                      size={48}
                      logoUrl={selectedDetailAccount.logoUrl}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    {isEditingDetail ? (
                      <TextInput
                        style={styles.detailEditInputName}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="Plataforma"
                        placeholderTextColor="#8E8E93"
                      />
                    ) : (
                      <Text style={styles.detailAccountName}>{selectedDetailAccount.name}</Text>
                    )}
                    <Text style={styles.detailAccountTag}>AES-256 Descifrado • Seguro</Text>
                  </View>
                </View>

                {isEditingDetail ? (
                  <View style={styles.detailFields}>
                    {/* Edit Username */}
                    <View style={styles.detailFieldGroup}>
                      <Text style={styles.detailFieldLabel}>USUARIO / CORREO</Text>
                      <TextInput
                        style={styles.detailEditInput}
                        value={editUsername}
                        onChangeText={setEditUsername}
                        placeholder="Usuario"
                        placeholderTextColor="#8E8E93"
                        autoCapitalize="none"
                      />
                    </View>

                    {/* Edit Password */}
                    <View style={styles.detailFieldGroup}>
                      <Text style={styles.detailFieldLabel}>CONTRASEÑA</Text>
                      <TextInput
                        style={styles.detailEditInput}
                        value={editPassword}
                        onChangeText={setEditPassword}
                        placeholder="Contraseña"
                        placeholderTextColor="#8E8E93"
                        autoCapitalize="none"
                      />
                    </View>

                    {/* Edit Custom Fields */}
                    {editCustomFields.map((field, idx) => (
                      <View key={`edit-custom-${idx}`} style={styles.detailFieldGroup}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <TextInput
                            style={[styles.detailFieldLabel, { flex: 1, backgroundColor: 'transparent', borderBottomWidth: 1, borderColor: '#C7C7CC', color: '#000000', paddingVertical: 2, marginRight: 8, textTransform: 'none' }]}
                            value={field.label}
                            placeholder="Etiqueta"
                            onChangeText={(text) => {
                              setEditCustomFields((prev) =>
                                prev.map((f, i) => (i === idx ? { ...f, label: text } : f))
                              );
                            }}
                          />
                          <Pressable
                            onPress={() => {
                              setEditCustomFields((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            style={{ padding: 4 }}
                          >
                            <Text style={{ color: '#FF3B30', fontSize: 12, fontFamily: Fonts.bold }}>Eliminar</Text>
                          </Pressable>
                        </View>
                        <TextInput
                          style={styles.detailEditInput}
                          value={field.value}
                          placeholder="Valor"
                          placeholderTextColor="#8E8E93"
                          onChangeText={(text) => {
                            setEditCustomFields((prev) =>
                              prev.map((f, i) => (i === idx ? { ...f, value: text } : f))
                            );
                          }}
                        />
                      </View>
                    ))}

                    {/* Add Custom Field Button */}
                    <Pressable
                      style={styles.detailAddCustomFieldBtn}
                      onPress={() => {
                        setEditCustomFields((prev) => [...prev, { label: 'Nuevo Campo', value: '' }]);
                      }}
                    >
                      <Text style={styles.detailAddCustomFieldBtnText}>+ Agregar Campo</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.detailFields}>
                    {/* Username Field */}
                    <View style={styles.detailFieldGroup}>
                      <Text style={styles.detailFieldLabel}>USUARIO / CORREO</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={styles.detailFieldValue}>{selectedDetailAccount.username}</Text>
                        <Pressable
                          onPress={() => {
                            Clipboard.setStringAsync(selectedDetailAccount.username);
                            triggerToast('¡Usuario copiado!');
                          }}
                        >
                          <CopyIcon size={16} color="#8E8E93" />
                        </Pressable>
                      </View>
                    </View>

                    {/* Password Field */}
                    <View style={styles.detailFieldGroup}>
                      <Text style={styles.detailFieldLabel}>CONTRASEÑA</Text>
                      <View style={styles.detailValueBox}>
                        <Text style={styles.detailFieldValue}>
                          {selectedDetailAccount.password || (selectedDetailAccount.name.toLowerCase().includes('netflix') || selectedDetailAccount.name.toLowerCase().includes('epicgames')
                            ? 'op_pirates_99'
                            : 'strong_secret_hash_2026!')}
                        </Text>
                        <Pressable
                          onPress={() => {
                            const pass = selectedDetailAccount.password ||
                              (selectedDetailAccount.name.toLowerCase().includes('netflix') || selectedDetailAccount.name.toLowerCase().includes('epicgames')
                                ? 'op_pirates_99'
                                : 'strong_secret_hash_2026!');
                            Clipboard.setStringAsync(pass);
                            triggerToast('¡Contraseña copiada!');
                          }}
                        >
                          <CopyIcon size={16} color="#8E8E93" />
                        </Pressable>
                      </View>
                    </View>

                    {/* Custom Fields */}
                    {selectedDetailAccount.customFields &&
                      selectedDetailAccount.customFields.map((field, idx) => (
                        <View key={`chatbot-custom-${idx}`} style={styles.detailFieldGroup}>
                          <Text style={styles.detailFieldLabel}>{field.label.toUpperCase()}</Text>
                          <View style={styles.detailValueBox}>
                            <Text style={styles.detailFieldValue}>{field.value}</Text>
                            <Pressable
                              onPress={() => {
                                Clipboard.setStringAsync(field.value);
                                triggerToast(`¡${field.label} copiado!`);
                              }}
                            >
                              <CopyIcon size={16} color="#8E8E93" />
                            </Pressable>
                          </View>
                        </View>
                      ))}
                  </View>
                )}

                {isEditingDetail ? (
                  <View style={styles.detailBtnRow}>
                    <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setIsEditingDetail(false)}>
                      <Text style={styles.btnCancelText}>Cancelar</Text>
                    </Pressable>
                    <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSaveEdit}>
                      <Text style={styles.btnSaveText}>Guardar</Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.detailBtnRow}>
                    <Pressable style={[styles.btn, styles.btnEdit]} onPress={() => setIsEditingDetail(true)}>
                      <Text style={styles.btnEditText}>Editar</Text>
                    </Pressable>
                    <Pressable
                      style={[styles.btn, styles.btnCancel]}
                      onPress={closeDetailDrawer}
                    >
                      <Text style={styles.btnCancelText}>Cerrar</Text>
                    </Pressable>
                  </View>
                )}
              </ScrollView>
            </View>
          </Animated.View>
        </>
      )}

      {/* Local floating toast */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}
    </>
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
  // Bottom sheet styling
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 99999,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    zIndex: 100000,
    paddingBottom: 24,
    maxHeight: '85%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 20,
  },
  bottomSheetHandleContainer: {
    width: '100%',
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomSheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#C7C7CC',
  },
  detailSheetContent: {
    flex: 1,
  },
  detailSheetScrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 110,
  },
  detailHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  detailLogoCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailAccountName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  detailAccountTag: {
    fontSize: 11,
    color: '#8E8E93',
    fontFamily: Fonts.bold,
    marginTop: 2,
  },
  detailFields: {
    gap: Spacing.three,
  },
  detailFieldGroup: {
    gap: Spacing.one,
  },
  detailFieldLabel: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    letterSpacing: 1,
    paddingLeft: Spacing.one,
  },
  detailValueBox: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.three,
  },
  detailFieldValue: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancel: {
    backgroundColor: '#F2F2F7',
  },
  btnCancelText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
  },
  detailEditInput: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  detailEditInputName: {
    height: 36,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E5EA',
    paddingHorizontal: Spacing.two,
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  detailBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  btnEdit: {
    backgroundColor: '#000000',
  },
  btnEditText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  detailAddCustomFieldBtn: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000000',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  detailAddCustomFieldBtnText: {
    fontSize: 13,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  btnSave: {
    backgroundColor: '#34C759', // Green save button
  },
  btnSaveText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
  toastContainer: {
    position: 'absolute',
    bottom: 120,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999999,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.bold,
  },
});
