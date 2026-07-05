import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, TextInput, Keyboard } from 'react-native';
import Animated, { withTiming, SharedValue } from 'react-native-reanimated';
import { useVault, CustomField, PasswordStrength } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import { ChevronIcon, TrashIcon } from '../icons';

interface AddSheetProps {
  addBottomSheetAnimatedStyle: any;
  addPanHandlers: any;
  isAddOpen: boolean;
  setIsAddOpen: (isOpen: boolean) => void;
  addSheetHeight: SharedValue<number>;
  triggerToast: (msg: string) => void;
}

export function AddSheet({
  addBottomSheetAnimatedStyle,
  addPanHandlers,
  isAddOpen,
  setIsAddOpen,
  addSheetHeight,
  triggerToast,
}: AddSheetProps) {
  const { addAccount } = useVault();

  // Local Form States
  const [addStep, setAddStep] = useState<'choose' | 'simple' | 'compound'>('choose');
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showFieldCreator, setShowFieldCreator] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  // Reset form when drawer opens/closes
  useEffect(() => {
    if (isAddOpen) {
      setAddStep('choose');
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setCustomFields([]);
      setShowNewPassword(false);
      setShowFieldCreator(false);
      setNewFieldLabel('');
    }
  }, [isAddOpen]);

  // Animate sheet height based on step
  useEffect(() => {
    let targetHeight = 400;
    if (addStep === 'simple') targetHeight = 520;
    else if (addStep === 'compound') targetHeight = 620;
    
    addSheetHeight.value = withTiming(targetHeight, { duration: 250 });
  }, [addStep]);

  const handleSaveAccount = () => {
    if (!newName.trim() || !newUsername.trim()) {
      triggerToast('Nombre y usuario requeridos.');
      return;
    }

    let strength: PasswordStrength = 'safe';
    let strengthText = 'Segura';

    if (newPassword.length < 8) {
      strength = 'leaked';
      strengthText = 'Filtrada';
    } else if (newPassword.length < 12) {
      strength = 'weak';
      strengthText = 'Débil';
    }

    const savedCustomFields = addStep === 'compound' && customFields.length > 0 ? customFields : undefined;

    addAccount(newName, newUsername, strength, strengthText, savedCustomFields, newPassword);
    
    // Clear inputs and close
    setNewName('');
    setNewUsername('');
    setNewPassword('');
    setCustomFields([]);
    setShowNewPassword(false);
    setIsAddOpen(false);
    Keyboard.dismiss();
    triggerToast('¡Contraseña guardada!');
  };

  const handleAddField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields((prev) => [...prev, { label: newFieldLabel.trim(), value: '' }]);
    setNewFieldLabel('');
    setShowFieldCreator(false);
  };

  const handleRemoveField = (idx: number) => {
    setCustomFields((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateFieldValue = (idx: number, val: string) => {
    setCustomFields((prev) =>
      prev.map((f, i) => (i === idx ? { ...f, value: val } : f))
    );
  };

  return (
    <Animated.View style={[styles.addBottomSheet, addBottomSheetAnimatedStyle]}>
      <View style={styles.bottomSheetHandleContainer} {...addPanHandlers}>
        <View style={styles.bottomSheetHandle} />
      </View>

      <View style={styles.addSheetContent}>
        {addStep === 'choose' ? (
          <View style={styles.choiceContainer}>
            <Text style={styles.choiceTitle}>Tipo de Credencial</Text>
            <Text style={styles.choiceSubtitle}>Selecciona el formato para tu nueva contraseña.</Text>
            
            <View style={styles.choicesList}>
              <Pressable style={styles.choiceItemCard} onPress={() => setAddStep('simple')}>
                <View style={styles.choiceTextCol}>
                  <Text style={styles.choiceItemTitle}>Credencial Simple</Text>
                  <Text style={styles.choiceItemDesc}>Usuario y contraseña estándar para apps y webs.</Text>
                </View>
                <ChevronIcon size={12} color="#8E8E93" direction="right" />
              </Pressable>

              <Pressable style={styles.choiceItemCard} onPress={() => setAddStep('compound')}>
                <View style={styles.choiceTextCol}>
                  <Text style={styles.choiceItemTitle}>Credencial Compuesta</Text>
                  <Text style={styles.choiceItemDesc}>Cuentas bancarias, tarjetas o campos personalizados.</Text>
                </View>
                <ChevronIcon size={12} color="#8E8E93" direction="right" />
              </Pressable>
            </View>

            <Pressable style={[styles.btn, styles.btnCancel, { marginTop: Spacing.four }]} onPress={() => setIsAddOpen(false)}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </Pressable>
          </View>
        ) : (
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.addSheetScrollContent}
          >
            <Text style={styles.addSheetTitle}>
              {addStep === 'simple' ? 'Nueva Credencial' : 'Nueva Credencial Compuesta'}
            </Text>
            <Text style={styles.addSheetSubtitle}>Los datos se encriptan al instante localmente.</Text>

            <View style={styles.formContainer}>
              {/* Plataforma */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PLATAFORMA</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="Netflix, Google, Spotify..."
                  placeholderTextColor="#8E8E93"
                  value={newName}
                  onChangeText={setNewName}
                />
              </View>

              {/* Usuario */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>USUARIO / CORREO</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="luffy@onepiece.com"
                  placeholderTextColor="#8E8E93"
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize="none"
                />
              </View>

              {/* Contraseña */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>CONTRASEÑA</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="strong_secret"
                  placeholderTextColor="#8E8E93"
                  value={newPassword}
                  onChangeText={setNewPassword}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                />
                <Pressable style={styles.inputRightBtn} onPress={() => setShowNewPassword(!showNewPassword)}>
                  <Text style={styles.inputRightBtnText}>{showNewPassword ? 'Ocultar' : 'Mostrar'}</Text>
                </Pressable>
              </View>

              {/* Custom Fields section for compound accounts */}
              {addStep === 'compound' && (
                <View style={styles.customFieldsSection}>
                  <Text style={styles.customFieldsTitle}>CAMPOS ADICIONALES</Text>
                  
                  {customFields.map((field, idx) => (
                    <View key={`new-custom-${idx}`} style={styles.customFieldRow}>
                      <Text style={styles.customFieldLabel}>{field.label.toUpperCase()}</Text>
                      <View style={styles.customFieldValueRow}>
                        <TextInput
                          style={[styles.formInput, { flex: 1, height: 38 }]}
                          placeholder="Valor..."
                          placeholderTextColor="#8E8E93"
                          value={field.value}
                          onChangeText={(val) => handleUpdateFieldValue(idx, val)}
                        />
                        <Pressable style={styles.removeFieldBtn} onPress={() => handleRemoveField(idx)}>
                          <TrashIcon size={14} color="#FF3B30" />
                        </Pressable>
                      </View>
                    </View>
                  ))}

                  {showFieldCreator ? (
                    <View style={styles.fieldCreatorRow}>
                      <TextInput
                        style={[styles.formInput, { flex: 1, height: 38 }]}
                        placeholder="Ej. Pin, Pregunta secreta..."
                        placeholderTextColor="#8E8E93"
                        value={newFieldLabel}
                        onChangeText={setNewFieldLabel}
                      />
                      <Pressable style={styles.fieldCreatorBtn} onPress={handleAddField}>
                        <Text style={styles.fieldCreatorBtnText}>Ok</Text>
                      </Pressable>
                    </View>
                  ) : (
                    <Pressable style={styles.addFieldBtn} onPress={() => setShowFieldCreator(true)}>
                      <Text style={styles.addFieldBtnText}>+ Agregar Campo</Text>
                    </Pressable>
                  )}
                </View>
              )}
            </View>

            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setAddStep('choose')}>
                <Text style={styles.btnCancelText}>Atrás</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSaveAccount}>
                <Text style={styles.btnSaveText}>Guardar</Text>
              </Pressable>
            </View>
          </ScrollView>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  addBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
  addSheetContent: {
    flex: 1,
  },
  choiceContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 20,
  },
  choiceTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  choiceSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginBottom: Spacing.four,
  },
  choicesList: {
    gap: Spacing.two,
  },
  choiceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: Spacing.three,
    justifyContent: 'space-between',
  },
  choiceTextCol: {
    flex: 1,
    gap: 2,
  },
  choiceItemTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  choiceItemDesc: {
    fontSize: 11,
    color: '#8E8E93',
    fontFamily: Fonts.regular,
  },
  addSheetScrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 110,
  },
  addSheetTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  addSheetSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  formContainer: {
    gap: Spacing.three,
    marginBottom: Spacing.four,
  },
  inputGroup: {
    gap: Spacing.one,
    position: 'relative',
  },
  inputLabel: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    letterSpacing: 1,
    paddingLeft: Spacing.one,
  },
  formInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  inputRightBtn: {
    position: 'absolute',
    right: 12,
    bottom: 12,
  },
  inputRightBtnText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  btnRow: {
    flexDirection: 'row',
    gap: Spacing.three,
    marginTop: Spacing.two,
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
  btnSave: {
    backgroundColor: '#000000',
  },
  btnSaveText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  customFieldsSection: {
    marginTop: Spacing.two,
    gap: Spacing.two,
  },
  customFieldsTitle: {
    fontSize: 9,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    letterSpacing: 1,
    paddingLeft: Spacing.one,
  },
  customFieldRow: {
    gap: Spacing.one,
  },
  customFieldLabel: {
    fontSize: 8,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    paddingLeft: Spacing.one,
  },
  customFieldValueRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
  },
  removeFieldBtn: {
    width: 38,
    height: 38,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addFieldBtn: {
    height: 38,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.one,
  },
  addFieldBtnText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
  },
  fieldCreatorRow: {
    flexDirection: 'row',
    gap: Spacing.two,
    alignItems: 'center',
    marginTop: Spacing.two,
  },
  fieldCreatorBtn: {
    width: 46,
    height: 46,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fieldCreatorBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: Fonts.bold,
  },
});
