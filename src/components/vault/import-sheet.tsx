import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, ScrollView, TextInput } from 'react-native';
import Animated from 'react-native-reanimated';
import { useVault, CustomField } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';

interface ImportSheetProps {
  importBottomSheetAnimatedStyle: any;
  importPanHandlers: any;
  isImportOpen: boolean;
  setIsImportOpen: (isOpen: boolean) => void;
  triggerToast: (msg: string) => void;
}

export function ImportSheet({
  importBottomSheetAnimatedStyle,
  importPanHandlers,
  isImportOpen,
  setIsImportOpen,
  triggerToast,
}: ImportSheetProps) {
  const { addAccount } = useVault();
  const [importText, setImportText] = useState('');

  // Reset text when sheet opens
  useEffect(() => {
    if (isImportOpen) {
      setImportText('');
    }
  }, [isImportOpen]);

  const handleImportText = () => {
    if (!importText.trim()) return;

    const lines = importText.replace(/\r\n/g, '\n').split('\n');
    let importCount = 0;

    let currentPlatform = '';
    let currentUsername = '';
    let currentPassword = '';
    let currentCustom: CustomField[] = [];

    const savePendingAccount = () => {
      if (currentPlatform && (currentUsername || currentPassword)) {
        let strength: 'safe' | 'weak' | 'leaked' = 'safe';
        let strengthText = 'Segura';
        const checkPass = currentPassword || '123456';

        if (checkPass.length < 8) {
          strength = 'leaked';
          strengthText = 'Filtrada';
        } else if (checkPass.length < 12) {
          strength = 'weak';
          strengthText = 'Débil';
        }

        addAccount(
          currentPlatform,
          currentUsername || 'Importado',
          strength,
          strengthText,
          currentCustom.length > 0 ? currentCustom : undefined,
          currentPassword
        );
        importCount++;
      }
      currentPlatform = '';
      currentUsername = '';
      currentPassword = '';
      currentCustom = [];
    };

    lines.forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed) return;

      // Platform Header Line (no space/separator)
      if (!trimmed.startsWith('-') && !trimmed.includes(':') && !trimmed.toLowerCase().startsWith('usuario') && !trimmed.toLowerCase().startsWith('contraseña') && !trimmed.toLowerCase().startsWith('clave')) {
        savePendingAccount();
        currentPlatform = trimmed;
      }
      // Formats like: - username : password
      else if (trimmed.startsWith('-')) {
        const cleanLine = trimmed.substring(1).trim();
        const parts = cleanLine.split(':');
        if (parts.length >= 2) {
          const userVal = parts[0].trim();
          const passVal = parts.slice(1).join(':').trim();
          if (currentUsername) {
            currentCustom.push({ label: userVal || 'Campo', value: passVal });
          } else {
            currentUsername = userVal;
            currentPassword = passVal;
          }
        }
      }
      // Formats like: Usuario: value / Contraseña: value
      else if (trimmed.includes(':')) {
        const parts = trimmed.split(':');
        const key = parts[0].trim().toLowerCase();
        const val = parts.slice(1).join(':').trim();

        if (key.includes('usuario') || key.includes('user') || key.includes('correo') || key.includes('email')) {
          currentUsername = val;
        } else if (key.includes('contraseña') || key.includes('pass') || key.includes('clave') || key.includes('password')) {
          currentPassword = val;
        } else {
          currentCustom.push({ label: parts[0].trim(), value: val });
        }
      }
    });

    savePendingAccount(); // Save last pending account

    if (importCount > 0) {
      triggerToast(`¡Se importaron ${importCount} cuentas!`);
      setImportText('');
      setIsImportOpen(false);
    } else {
      triggerToast('No se detectaron formatos de cuentas válidos.');
    }
  };

  return (
    <Animated.View style={[styles.importBottomSheet, importBottomSheetAnimatedStyle]}>
      <View style={styles.bottomSheetHandleContainer} {...importPanHandlers}>
        <View style={styles.bottomSheetHandle} />
      </View>

      <View style={styles.addSheetContent}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.addSheetScrollContent}
        >
          <Text style={styles.addSheetTitle}>Importar Credenciales</Text>
          <Text style={styles.addSheetSubtitle}>Pega bloques de texto con tus cuentas. Detectaremos el formato automáticamente.</Text>

          <View style={styles.importInfoCard}>
            <Text style={styles.importInfoTitle}>Formatos Soportados:</Text>
            <Text style={styles.importInfoBody}>
              • Playstation{"\n"}  - usuario : clave{"\n"}{"\n"}
              • Acrópolis UJAP{"\n"}  Usuario: correo@gmail.com{"\n"}  Contraseña: 1234
            </Text>
          </View>

          <TextInput
            style={styles.importAreaInput}
            multiline
            numberOfLines={8}
            placeholder="Pega tus credenciales aquí..."
            placeholderTextColor="#8E8E93"
            value={importText}
            onChangeText={setImportText}
          />

          <View style={styles.btnRow}>
            <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setIsImportOpen(false)}>
              <Text style={styles.btnCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnSave]} onPress={handleImportText}>
              <Text style={styles.btnSaveText}>Importar</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  importBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 420,
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
  importInfoCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  importInfoTitle: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#000000',
    marginBottom: 4,
  },
  importInfoBody: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#555559',
    lineHeight: 15,
  },
  importAreaInput: {
    height: 120,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#000000',
    textAlignVertical: 'top',
    marginBottom: Spacing.four,
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
});
