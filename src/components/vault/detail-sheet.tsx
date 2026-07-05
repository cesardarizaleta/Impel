import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { Account, CustomField, useVault } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import { BrandLogo } from '../brand-logo';
import { CopyIcon } from '../icons';
import * as Clipboard from 'expo-clipboard';

interface DetailSheetProps {
  detailBottomSheetAnimatedStyle: any;
  detailPanHandlers: any;
  selectedAccount: Account | null;
  closeDetail: () => void;
  triggerToast: (msg: string) => void;
}

const getLogoStyle = (logo: string) => {
  switch (logo) {
    case 'netflix': return { bg: '#F5E6E6', color: '#E50914', char: 'N' };
    case 'google': return { bg: '#E6F0FA', color: '#4285F4', char: 'G' };
    case 'github': return { bg: '#ECECEC', color: '#24292E', char: 'G' };
    case 'spotify': return { bg: '#EBF7EE', color: '#1DB954', char: 'S' };
    case 'adobe': return { bg: '#FAEBF0', color: '#FF0000', char: 'A' };
    case 'epicgames': return { bg: '#ECEEF1', color: '#000000', char: 'E' };
    default: return { bg: '#F2F2F7', color: '#000000', char: 'P' };
  }
};

export function DetailSheet({
  detailBottomSheetAnimatedStyle,
  detailPanHandlers,
  selectedAccount,
  closeDetail,
  triggerToast,
}: DetailSheetProps) {
  const { updateAccount } = useVault();

  const [isEditingDetail, setIsEditingDetail] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editCustomFields, setEditCustomFields] = useState<CustomField[]>([]);

  useEffect(() => {
    if (selectedAccount) {
      setEditName(selectedAccount.name);
      setEditUsername(selectedAccount.username);
      setEditPassword(selectedAccount.password ?? '');
      setEditCustomFields(selectedAccount.customFields ? [...selectedAccount.customFields] : []);
      setIsEditingDetail(false);
    }
  }, [selectedAccount]);

  const handleSaveEdit = async () => {
    if (!editName.trim() || !editUsername.trim()) {
      triggerToast('Nombre y usuario requeridos.');
      return;
    }

    if (!selectedAccount) return;

    const updated: Account = {
      ...selectedAccount,
      name: editName.trim(),
      username: editUsername.trim(),
      password: editPassword,
      customFields: editCustomFields.length > 0 ? editCustomFields : undefined,
    };

    await updateAccount(updated);
    setIsEditingDetail(false);
    triggerToast('Credencial actualizada.');
  };

  const handleCopy = async (value: string, label: string) => {
    await Clipboard.setStringAsync(value);
    triggerToast(`${label} copiado.`);
  };

  const handleRemoveCustomField = (idx: number) => {
    setEditCustomFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleAddCustomField = () => {
    setEditCustomFields((prev) => [...prev, { label: '', value: '' }]);
  };

  const handleUpdateCustomFieldLabel = (idx: number, label: string) => {
    setEditCustomFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, label } : f))
    );
  };

  const handleUpdateCustomFieldValue = (idx: number, value: string) => {
    setEditCustomFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, value } : f))
    );
  };

  if (!selectedAccount) return null;

  const logoStyle = getLogoStyle(selectedAccount.logo);
  const displayPassword = selectedAccount.password || 'strong_secret_hash_2026!';

  return (
    <Animated.View style={[styles.detailBottomSheet, detailBottomSheetAnimatedStyle]}>
      <View style={styles.bottomSheetHandleContainer} {...detailPanHandlers}>
        <View style={styles.bottomSheetHandle} />
      </View>

      <View style={styles.detailSheetContent}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.detailSheetScrollContent}
        >
          {/* Header Card */}
          <View style={styles.detailHeaderCard}>
            <BrandLogo
              logoKey={selectedAccount.logo}
              char={logoStyle.char}
              bgColor={logoStyle.bg}
              color={logoStyle.color}
              size={48}
              logoUrl={selectedAccount.logoUrl}
            />
            <View style={{ flex: 1 }}>
              {isEditingDetail ? (
                <TextInput
                  style={styles.detailEditInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Nombre"
                  placeholderTextColor="#8E8E93"
                />
              ) : (
                <Text style={styles.detailHeaderName}>{selectedAccount.name}</Text>
              )}
              <Text style={styles.detailHeaderTag}>AES-256 Descifrado • Sin Ocultar</Text>
            </View>
          </View>

          {/* Fields Section */}
          <View style={styles.detailFieldsSection}>
            {isEditingDetail ? (
              <>
                {/* Edit Mode */}
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

                {/* Custom Fields */}
                {editCustomFields.length > 0 && (
                  <View style={styles.detailCustomFieldsSection}>
                    <Text style={styles.detailFieldLabel}>CAMPOS ADICIONALES</Text>
                    {editCustomFields.map((field, idx) => (
                      <View key={`edit-cf-${idx}`} style={styles.detailCustomFieldEditRow}>
                        <View style={{ flex: 1, gap: Spacing.one }}>
                          <TextInput
                            style={[styles.detailEditInput, { height: 38 }]}
                            value={field.label}
                            onChangeText={(val) => handleUpdateCustomFieldLabel(idx, val)}
                            placeholder="Nombre del campo"
                            placeholderTextColor="#8E8E93"
                          />
                          <TextInput
                            style={[styles.detailEditInput, { height: 38 }]}
                            value={field.value}
                            onChangeText={(val) => handleUpdateCustomFieldValue(idx, val)}
                            placeholder="Valor"
                            placeholderTextColor="#8E8E93"
                          />
                        </View>
                        <Pressable
                          style={styles.detailRemoveFieldBtn}
                          onPress={() => handleRemoveCustomField(idx)}
                        >
                          <Text style={styles.detailRemoveFieldBtnText}>X</Text>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                )}

                <Pressable style={styles.detailAddCustomFieldBtn} onPress={handleAddCustomField}>
                  <Text style={styles.detailAddCustomFieldBtnText}>+ Agregar Campo</Text>
                </Pressable>
              </>
            ) : (
              <>
                {/* View Mode */}
                <View style={styles.detailFieldGroup}>
                  <Text style={styles.detailFieldLabel}>USUARIO / CORREO</Text>
                  <View style={styles.detailFieldValueRow}>
                    <Text style={styles.detailFieldValue}>{selectedAccount.username}</Text>
                    <Pressable
                      style={styles.detailCopyBtn}
                      onPress={() => handleCopy(selectedAccount.username, 'Usuario')}
                    >
                      <CopyIcon size={14} color="#8E8E93" />
                    </Pressable>
                  </View>
                </View>

                <View style={styles.detailFieldGroup}>
                  <Text style={styles.detailFieldLabel}>CONTRASEÑA</Text>
                  <View style={styles.detailFieldValueRow}>
                    <Text style={styles.detailFieldValue}>{displayPassword}</Text>
                    <Pressable
                      style={styles.detailCopyBtn}
                      onPress={() => handleCopy(displayPassword, 'Contraseña')}
                    >
                      <CopyIcon size={14} color="#8E8E93" />
                    </Pressable>
                  </View>
                </View>

                {/* Custom Fields */}
                {selectedAccount.customFields && selectedAccount.customFields.length > 0 && (
                  selectedAccount.customFields.map((field, idx) => (
                    <View key={`view-cf-${idx}`} style={styles.detailFieldGroup}>
                      <Text style={styles.detailFieldLabel}>{field.label.toUpperCase()}</Text>
                      <View style={styles.detailFieldValueRow}>
                        <Text style={styles.detailFieldValue}>{field.value}</Text>
                        <Pressable
                          style={styles.detailCopyBtn}
                          onPress={() => handleCopy(field.value, field.label)}
                        >
                          <CopyIcon size={14} color="#8E8E93" />
                        </Pressable>
                      </View>
                    </View>
                  ))
                )}
              </>
            )}
          </View>

          {/* Button Row */}
          <View style={styles.detailBtnRow}>
            {isEditingDetail ? (
              <>
                <Pressable
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => {
                    setIsEditingDetail(false);
                    setEditName(selectedAccount.name);
                    setEditUsername(selectedAccount.username);
                    setEditPassword(selectedAccount.password ?? '');
                    setEditCustomFields(
                      selectedAccount.customFields ? [...selectedAccount.customFields] : []
                    );
                  }}
                >
                  <Text style={styles.btnCancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSaveEdit}>
                  <Text style={styles.btnSaveText}>Guardar</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Pressable
                  style={[styles.btn, styles.btnEdit]}
                  onPress={() => setIsEditingDetail(true)}
                >
                  <Text style={styles.btnEditText}>Editar</Text>
                </Pressable>
                <Pressable style={[styles.btn, styles.btnCancel]} onPress={closeDetail}>
                  <Text style={styles.btnCancelText}>Cerrar</Text>
                </Pressable>
              </>
            )}
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  detailBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 460,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 99999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  bottomSheetHandleContainer: {
    alignItems: 'center',
    width: '100%',
    paddingTop: 16,
    paddingBottom: 24,
  },
  bottomSheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E5EA',
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
  detailHeaderName: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  detailHeaderTag: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    marginTop: Spacing.half,
  },
  detailFieldsSection: {
    gap: Spacing.three,
  },
  detailFieldGroup: {
    gap: Spacing.one,
  },
  detailFieldLabel: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    letterSpacing: 1,
    paddingLeft: Spacing.one,
  },
  detailFieldValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    height: 46,
  },
  detailFieldValue: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  detailCopyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
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
  detailCustomFieldsSection: {
    gap: Spacing.two,
  },
  detailCustomFieldEditRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  detailRemoveFieldBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailRemoveFieldBtnText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#FF3B30',
  },
  detailAddCustomFieldBtn: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  detailAddCustomFieldBtnText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
  },
  detailBtnRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.four,
  },
  btn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnEdit: {
    backgroundColor: '#000000',
  },
  btnEditText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  btnCancel: {
    backgroundColor: '#F2F2F7',
  },
  btnCancelText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
  },
  btnSave: {
    backgroundColor: '#000000',
  },
  btnSaveText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
});
