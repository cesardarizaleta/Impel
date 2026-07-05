import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, Pressable, Platform, ActivityIndicator } from 'react-native';
import Animated from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { Spacing, Fonts } from '@/constants/theme';
import { Account } from '@/hooks/use-vault';
import { buildEncryptedZip } from '@/utils/zip-backup';
import { CopyIcon } from '../icons';

interface ExportSheetProps {
  exportBottomSheetAnimatedStyle: any;
  exportPanHandlers: any;
  isExportOpen: boolean;
  setIsExportOpen: (isOpen: boolean) => void;
  accounts: Account[];
  triggerToast: (msg: string) => void;
}

const PASSWORD_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';

function generateExportPassword(): string {
  const segment = (len: number) => {
    let s = '';
    for (let i = 0; i < len; i++) {
      s += PASSWORD_CHARS[Math.floor(Math.random() * PASSWORD_CHARS.length)];
    }
    return s;
  };
  return `IMPEL-${segment(4)}-${segment(4)}-${segment(4)}-${segment(4)}`;
}

export function ExportSheet({
  exportBottomSheetAnimatedStyle,
  exportPanHandlers,
  isExportOpen,
  setIsExportOpen,
  accounts,
  triggerToast,
}: ExportSheetProps) {
  const [exportPassword, setExportPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    if (isExportOpen) {
      setExportPassword(generateExportPassword());
    }
  }, [isExportOpen]);

  const handleCopyPassword = async () => {
    await Clipboard.setStringAsync(exportPassword);
    triggerToast('Clave copiada al portapapeles');
  };

  const handleDownloadBackup = async () => {
    try {
      setIsExporting(true);

      // Copy password to clipboard before anything else
      await Clipboard.setStringAsync(exportPassword);

      // Build the text payload
      const now = new Date();
      const dateStr = now.toLocaleDateString('es-VE', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
      const timeStr = now.toLocaleTimeString('es-VE', {
        hour: '2-digit',
        minute: '2-digit',
      });

      let filePayload = '========================================\n';
      filePayload += '       IMPEL SECURITY BACKUP\n';
      filePayload += '========================================\n';
      filePayload += `Fecha: ${dateStr} ${timeStr}\n`;
      filePayload += `Total de cuentas: ${accounts.length}\n`;
      filePayload += '========================================\n\n';

      accounts.forEach((account, index) => {
        filePayload += `--- Cuenta ${index + 1} ---\n`;
        filePayload += `Plataforma: ${account.name}\n`;
        filePayload += `Usuario: ${account.username}\n`;
        if (account.password) {
          filePayload += `Contraseña: ${account.password}\n`;
        }
        filePayload += `Seguridad: ${account.strengthText}\n`;
        if (account.customFields && account.customFields.length > 0) {
          account.customFields.forEach((field) => {
            filePayload += `${field.label}: ${field.value}\n`;
          });
        }
        filePayload += '\n';
      });

      filePayload += '========================================\n';
      filePayload += '  Este archivo fue generado por Impel.\n';
      filePayload += '========================================\n';

      const { dataUri, base64 } = await buildEncryptedZip(filePayload, exportPassword);
      const fileName = `impel_backup_${now.getTime()}.zip`;

      if (Platform.OS === 'web') {
        // Web: create download link
        const link = document.createElement('a');
        link.href = dataUri;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else if (Platform.OS === 'android') {
        // Android: use Storage Access Framework
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            fileName,
            'application/zip'
          );
          await FileSystem.writeAsStringAsync(fileUri, base64, {
            encoding: FileSystem.EncodingType.Base64,
          });
        }
      } else {
        // iOS: write to cache then share
        const fileUri = FileSystem.cacheDirectory + fileName;
        await FileSystem.writeAsStringAsync(fileUri, base64, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await Sharing.shareAsync(fileUri, {
          mimeType: 'application/zip',
          dialogTitle: 'Guardar respaldo de Impel',
        });
      }

      triggerToast('Respaldo descargado. La clave fue copiada.');
      setIsExportOpen(false);
    } catch (error) {
      triggerToast('Error al generar el respaldo.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Animated.View style={[styles.exportBottomSheet, exportBottomSheetAnimatedStyle]}>
      <View style={styles.bottomSheetHandleContainer} {...exportPanHandlers}>
        <View style={styles.bottomSheetHandle} />
      </View>

      <View style={styles.sheetContent}>
        <Text style={styles.sheetTitle}>Exportar Respaldo</Text>
        <Text style={styles.sheetSubtitle}>
          Se generara un archivo ZIP encriptado con todas tus credenciales.
        </Text>

        <View style={styles.passwordCard}>
          <Text style={styles.passwordLabel}>Clave de encriptacion:</Text>
          <View style={styles.passwordRow}>
            <Text style={styles.passwordValue} numberOfLines={1}>
              {exportPassword}
            </Text>
            <Pressable style={styles.copyBtn} onPress={handleCopyPassword}>
              <CopyIcon size={16} color="#8E8E93" />
            </Pressable>
          </View>
        </View>

        <Text style={styles.warningText}>
          Guarda esta clave en un lugar seguro. Sin ella no podras desencriptar el respaldo.
        </Text>

        <View style={styles.btnRow}>
          <Pressable
            style={[styles.btn, styles.btnCancel]}
            onPress={() => setIsExportOpen(false)}
            disabled={isExporting}
          >
            <Text style={styles.btnCancelText}>Cancelar</Text>
          </Pressable>
          <Pressable
            style={[styles.btn, styles.btnSave]}
            onPress={handleDownloadBackup}
            disabled={isExporting}
          >
            {isExporting ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.btnSaveText}>Descargar ZIP</Text>
            )}
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  exportBottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 380,
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
  sheetContent: {
    paddingHorizontal: Spacing.four,
  },
  sheetTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: Spacing.one,
  },
  sheetSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: Fonts.regular,
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  passwordCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: Spacing.three,
    marginBottom: Spacing.two,
  },
  passwordLabel: {
    fontSize: 11,
    fontFamily: Fonts.bold,
    color: '#000000',
    marginBottom: 4,
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  passwordValue: {
    fontSize: 13,
    fontFamily: Fonts.mono,
    color: '#000000',
    flex: 1,
  },
  copyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.two,
  },
  warningText: {
    fontSize: 11,
    fontFamily: Fonts.regular,
    color: '#FF9500',
    textAlign: 'center',
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
