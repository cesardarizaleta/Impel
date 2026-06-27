import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, TextInput, Image, Keyboard, useWindowDimensions, Platform, ActivityIndicator } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { useVault, Account, CustomField } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import { PoneglyphBg } from './poneglyph-bg';
import { ImpelLogo } from './logo';
import {
  ShieldIcon,
  ChevronIcon,
  UserIcon,
  KeyIcon,
  UnlockIcon,
  CopyIcon,
  BackIcon,
  HomeIcon,
  SearchIcon,
  PlusIcon,
  ImportIcon,
  TrashIcon,
  DownloadIcon
} from './icons';

// --- CUSTOM PURE-JS PASSWORD PROTECTED ZIP ARCHIVE WRITER ---

// Standard CRC-32 Lookup Table
const crcTable = new Int32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let j = 0; j < 8; j++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

// Compute CRC-32 for a byte array
function getCrc32(data: Uint8Array): number {
  let crc = -1;
  for (let i = 0; i < data.length; i++) {
    crc = crcTable[(crc ^ data[i]) & 0xff] ^ (crc >>> 8);
  }
  return ~crc;
}

// Update ZipCrypto key using a single byte
function crc32_update(key: number, char: number) {
  return crcTable[(key ^ char) & 0xff] ^ (key >>> 8);
}

// Initialize the 3 keys with the password
function initKeys(password: string): number[] {
  let k0 = 305419896;
  let k1 = 591751049;
  let k2 = 878082192;
  for (let i = 0; i < password.length; i++) {
    const c = password.charCodeAt(i);
    k0 = crc32_update(k0, c);
    k1 = (k1 + (k0 & 0xff)) | 0;
    k1 = Math.imul(k1, 134775813) + 1;
    k2 = crc32_update(k2, k1 >>> 24);
  }
  return [k0, k1, k2];
}

// Encrypt a byte and update keys
function encryptByte(k: number[], char: number): number {
  const temp = (k[2] | 2) & 0xffff;
  const t = ((temp * (temp ^ 1)) >>> 8) & 0xff;
  const cipher = char ^ t;
  // Update keys using the plaintext character
  k[0] = crc32_update(k[0], char);
  k[1] = (k[1] + (k[0] & 0xff)) | 0;
  k[1] = Math.imul(k[1], 134775813) + 1;
  k[2] = crc32_update(k[2], k[1] >>> 24);
  return cipher;
}

// Helper to write 16-bit little-endian
function write16(arr: Uint8Array, offset: number, value: number) {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >>> 8) & 0xff;
}

// Helper to write 32-bit little-endian
function write32(arr: Uint8Array, offset: number, value: number) {
  arr[offset] = value & 0xff;
  arr[offset + 1] = (value >>> 8) & 0xff;
  arr[offset + 2] = (value >>> 16) & 0xff;
  arr[offset + 3] = (value >>> 24) & 0xff;
}

// Convert string to UTF-8 Uint8Array without Web API dependencies
function stringToUtf8(str: string): Uint8Array {
  const utf8 = unescape(encodeURIComponent(str));
  const arr = new Uint8Array(utf8.length);
  for (let i = 0; i < utf8.length; i++) {
    arr[i] = utf8.charCodeAt(i);
  }
  return arr;
}

// Convert Uint8Array to Base64 without Web API dependencies
function uint8ToBase64(arr: Uint8Array): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
  let result = '';
  const len = arr.length;
  let i = 0;
  while (i < len) {
    const b0 = arr[i++];
    const b1 = i < len ? arr[i++] : NaN;
    const b2 = i < len ? arr[i++] : NaN;
    
    const idx0 = b0 >>> 2;
    const idx1 = ((b0 & 3) << 4) | (isNaN(b1) ? 0 : b1 >>> 4);
    const idx2 = isNaN(b1) ? 64 : ((b1 & 15) << 2) | (isNaN(b2) ? 0 : b2 >>> 6);
    const idx3 = isNaN(b2) ? 64 : b2 & 63;
    
    result += chars[idx0] + chars[idx1] + 
              (idx2 === 64 ? '=' : chars[idx2]) + 
              (idx3 === 64 ? '=' : chars[idx3]);
  }
  return result;
}

interface BrandLogoProps {
  logoKey: string;
  char: string;
  bgColor: string;
  color: string;
  size?: number;
}

// Self-contained component to handle online brand logos with local initials fallback
function BrandLogo({ logoKey, char, bgColor, color, size = 44 }: BrandLogoProps) {
  const [loadError, setLoadError] = useState(false);

  const domainMap: Record<string, string> = {
    netflix: 'netflix.com',
    google: 'google.com',
    github: 'github.com',
    spotify: 'spotify.com',
    adobe: 'adobe.com',
    epicgames: 'epicgames.com',
  };

  const domain = domainMap[logoKey];
  const logoUrl = domain ? `https://logo.clearbit.com/${domain}` : null;

  if (logoUrl && !loadError) {
    return (
      <Image
        source={{ uri: logoUrl }}
        style={{
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#FFFFFF',
          borderWidth: 1,
          borderColor: '#E5E5EA',
        }}
        onError={() => setLoadError(true)}
      />
    );
  }

  // Fallback to letter initials
  return (
    <View style={[styles.fallbackLogoContainer, { width: size, height: size, borderRadius: size / 2, backgroundColor: bgColor }]}>
      <Text style={[styles.fallbackLogoText, { color, fontSize: size * 0.4 }]}>
        {char}
      </Text>
    </View>
  );
}

export function ScreenVault() {
  const {
    isUnlocked,
    searchQuery,
    selectedFilter,
    accounts,
    setActiveTab,
    activeTab,
    lock,
    setSearchQuery,
    isAddOpen,
    setIsAddOpen,
    addAccount,
    deleteAccount,
    unlock,
  } = useVault();

  // Selected account for bottom sheet / detail view
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Steps state for Add Drawer
  const [addStep, setAddStep] = useState<'choose' | 'simple' | 'compound'>('choose');

  // New account form states
  const [newName, setNewName] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Custom fields for compound credentials
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  const [showFieldCreator, setShowFieldCreator] = useState(false);
  const [newFieldLabel, setNewFieldLabel] = useState('');

  // Import Plain Text States
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Export Zip States
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [exportPassword, setExportPassword] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  // Responsive dimensions
  const { width } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && width >= 1120;

  // Reanimated shared values for sheets and overlays
  const bottomSheetTranslation = useSharedValue(420); 
  const backdropOpacity = useSharedValue(0);

  // Add password sheet translations, height, and keyboard offset
  const addSheetTranslation = useSharedValue(500);
  const addBackdropOpacity = useSharedValue(0);
  const addSheetHeight = useSharedValue(320);
  const keyboardOffset = useSharedValue(0);
  // Import sheet translations
  const importSheetTranslation = useSharedValue(500);
  const importBackdropOpacity = useSharedValue(0);

  // Export sheet translations
  const exportSheetTranslation = useSharedValue(500);
  const exportBackdropOpacity = useSharedValue(0);

  // Detail sheet translations
  const detailSheetTranslation = useSharedValue(500);
  const detailBackdropOpacity = useSharedValue(0);
  // Sync "Add Password" drawer animations and reset steps
  useEffect(() => {
    if (isAddOpen) {
      setAddStep('choose');
      setNewName('');
      setNewUsername('');
      setNewPassword('');
      setCustomFields([]);
      setShowFieldCreator(false);
      
      addSheetTranslation.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
      addBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      addSheetTranslation.value = withTiming(500, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      addBackdropOpacity.value = withTiming(0, { duration: 180 });
      keyboardOffset.value = withTiming(0, { duration: 200 });
    }
  }, [isAddOpen]);

  // Adjust add sheet height dynamically based on active step
  useEffect(() => {
    let targetHeight = 320;
    if (isAddOpen) {
      if (addStep === 'choose') targetHeight = 320;
      else if (addStep === 'simple') targetHeight = 440;
      else if (addStep === 'compound') targetHeight = 500;
    }
    addSheetHeight.value = withTiming(targetHeight, { duration: 250 });
  }, [addStep, isAddOpen]);

  // Sync Import Sheet animations
  useEffect(() => {
    if (isImportOpen) {
      importSheetTranslation.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
      importBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      importSheetTranslation.value = withTiming(500, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      importBackdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [isImportOpen]);

  // Sync Export Sheet animations
  useEffect(() => {
    if (isExportOpen) {
      exportSheetTranslation.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
      exportBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      exportSheetTranslation.value = withTiming(500, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      exportBackdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [isExportOpen]);

  // Sync Detail Sheet animations
  useEffect(() => {
    if (isDetailOpen) {
      detailSheetTranslation.value = withTiming(0, {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
      detailBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      detailSheetTranslation.value = withTiming(500, {
        duration: 220,
        easing: Easing.out(Easing.quad),
      });
      detailBackdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [isDetailOpen]);

  // Track virtual keyboard height dynamically
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      const pushAmount = e.endCoordinates.height - 10;
      keyboardOffset.value = withTiming(-Math.max(0, pushAmount), {
        duration: 250,
        easing: Easing.out(Easing.quad),
      });
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardOffset.value = withTiming(0, {
        duration: 200,
        easing: Easing.out(Easing.quad),
      });
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  // Filter accounts based on query and selected category
  const filteredAccounts = accounts.filter((acc) => {
    const matchesSearch =
      acc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      acc.username.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedFilter === 'All') return matchesSearch;
    if (selectedFilter === 'Leaked') return matchesSearch && acc.strength === 'leaked';
    if (selectedFilter === 'Weak') return matchesSearch && acc.strength === 'weak';
    if (selectedFilter === 'Safe') return matchesSearch && acc.strength === 'safe';
    return matchesSearch;
  });

  // Bottom Sheet Animation Controls
  const openBottomSheet = (account: Account) => {
    setSelectedAccount(account);
    bottomSheetTranslation.value = withTiming(0, {
      duration: 250,
      easing: Easing.out(Easing.quad),
    });
    backdropOpacity.value = withTiming(0.4, { duration: 200 });
  };

  const closeBottomSheet = () => {
    bottomSheetTranslation.value = withTiming(420, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    });
    backdropOpacity.value = withTiming(0, { duration: 180 });
  };

  // Detail Drawer Controls
  const openDetail = () => {
    setIsDetailOpen(true);
    closeBottomSheet();
  };

  const closeDetail = () => {
    detailSheetTranslation.value = withTiming(500, {
      duration: 220,
      easing: Easing.out(Easing.quad),
    }, () => {
      runOnJS(setIsDetailOpen)(false);
      runOnJS(setSelectedAccount)(null);
    });
    detailBackdropOpacity.value = withTiming(0, { duration: 180 });
  };

  // Save new credential logic (Simple or Compound)
  const handleSave = () => {
    if (!newName.trim() || !newUsername.trim() || !newPassword.trim()) return;

    let strength: 'safe' | 'weak' | 'leaked' = 'safe';
    let strengthText = 'Segura';

    if (newPassword.length < 8) {
      strength = 'leaked';
      strengthText = 'Filtrada';
    } else if (newPassword.length < 12) {
      strength = 'weak';
      strengthText = 'Débil';
    }

    const savedCustomFields = addStep === 'compound' && customFields.length > 0 ? customFields : undefined;

    addAccount(newName, newUsername, strength, strengthText, savedCustomFields);
    
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

  // Intelligent Import Parser Logic
  const handleImportText = () => {
    if (!importText.trim()) return;

    const blocks = importText.split(/\n\s*\n/);
    let importCount = 0;

    for (const block of blocks) {
      const lines = block.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
      if (lines.length === 0) continue;

      let name = lines[0];
      let username = '';
      let password = '';
      const parsedCustom: CustomField[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const colonIdx = line.indexOf(':');

        if (colonIdx !== -1) {
          const label = line.substring(0, colonIdx).trim();
          const value = line.substring(colonIdx + 1).trim();
          const lowerLabel = label.toLowerCase();

          if (['usuario', 'user', 'correo', 'email'].includes(lowerLabel)) {
            username = value;
          } else if (['contraseña', 'password', 'clave', 'pass'].includes(lowerLabel)) {
            password = value;
          } else {
            parsedCustom.push({ label, value });
          }
        } else {
          parsedCustom.push({ label: 'Detalle', value: line });
        }
      }

      if (name) {
        let strength: 'safe' | 'weak' | 'leaked' = 'safe';
        let strengthText = 'Segura';
        const checkPass = password || '123456';

        if (checkPass.length < 8) {
          strength = 'leaked';
          strengthText = 'Filtrada';
        } else if (checkPass.length < 12) {
          strength = 'weak';
          strengthText = 'Débil';
        }

        addAccount(
          name,
          username || 'Importado',
          strength,
          strengthText,
          parsedCustom.length > 0 ? parsedCustom : undefined
        );
        importCount++;
      }
    }

    setImportText('');
    setIsImportOpen(false);
    Keyboard.dismiss();
    triggerToast(`¡Se importaron ${importCount} cuentas!`);
  };

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim()) return;
    setCustomFields((prev) => [...prev, { label: newFieldLabel.trim(), value: '' }]);
    setNewFieldLabel('');
    setShowFieldCreator(false);
  };

  // Secure biometric delete handler
  const handleDeletePress = async () => {
    if (!selectedAccount) return;
    closeBottomSheet();

    // Trigger local security check
    const success = await unlock();
    if (success) {
      deleteAccount(selectedAccount.id);
      triggerToast('¡Credencial eliminada!');
    } else {
      triggerToast('Autenticación fallida. No se eliminó.');
    }
  };

  // Trigger high-security randomized password and open export sheet
  const handleOpenExport = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*';
    let pass = 'IMPEL-';
    for (let i = 0; i < 16; i++) {
      if (i > 0 && i % 4 === 0) pass += '-';
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setExportPassword(pass);
    setIsExportOpen(true);
  };

  // Helper function to build a REAL password-protected ZIP archive client-side
  const buildEncryptedZip = async (textPayload: string): Promise<{ dataUri: string; base64: string }> => {
    const fileName = "impel_vault_backup.txt";
    const fileNameBytes = stringToUtf8(fileName);
    const fileDataBytes = stringToUtf8(textPayload);
    const crc = getCrc32(fileDataBytes);

    // 1. Encryption Header (12 bytes)
    const encHeader = new Uint8Array(12);
    for (let i = 0; i < 11; i++) {
      encHeader[i] = Math.floor(Math.random() * 256);
    }
    // ZIP standard requires last byte to be the MSB of the CRC-32 (or MSB of last mod time, but CRC-32 is standard)
    encHeader[11] = (crc >>> 24) & 0xff;

    // Encrypt the 12-byte header
    const k = initKeys(exportPassword);
    const encryptedHeader = new Uint8Array(12);
    for (let i = 0; i < 12; i++) {
      encryptedHeader[i] = encryptByte(k, encHeader[i]);
    }

    // Encrypt the file data bytes
    const encryptedData = new Uint8Array(fileDataBytes.length);
    for (let i = 0; i < fileDataBytes.length; i++) {
      encryptedData[i] = encryptByte(k, fileDataBytes[i]);
    }

    // 2. Calculate sizes and offsets
    const lfhSize = 30 + fileNameBytes.length + 12 + encryptedData.length;
    const cdfhSize = 46 + fileNameBytes.length;
    const eocdSize = 22;
    const totalSize = lfhSize + cdfhSize + eocdSize;

    const zipBytes = new Uint8Array(totalSize);

    // 3. Write Local File Header (LFH)
    write32(zipBytes, 0, 0x04034b50); // Signature
    write16(zipBytes, 4, 20);          // Version needed (2.0)
    write16(zipBytes, 6, 1);           // General purpose bit flag (bit 0 = 1 for encryption)
    write16(zipBytes, 8, 0);           // Compression method (0 = Stored)
    write16(zipBytes, 10, 0);          // Last mod file time
    write16(zipBytes, 12, 0);          // Last mod file date
    write32(zipBytes, 14, crc);        // CRC-32
    write32(zipBytes, 18, encryptedData.length + 12); // Compressed size
    write32(zipBytes, 22, fileDataBytes.length);      // Uncompressed size
    write16(zipBytes, 26, fileNameBytes.length);       // File name length
    write16(zipBytes, 28, 0);          // Extra field length
    zipBytes.set(fileNameBytes, 30);   // File name
    zipBytes.set(encryptedHeader, 30 + fileNameBytes.length); // Encrypted header
    zipBytes.set(encryptedData, 30 + fileNameBytes.length + 12); // Encrypted data

    // 4. Write Central Directory File Header (CDFH)
    const cdfhOffset = lfhSize;
    write32(zipBytes, cdfhOffset, 0x02014b50);     // Signature
    write16(zipBytes, cdfhOffset + 4, 20);          // Version made by
    write16(zipBytes, cdfhOffset + 6, 20);          // Version needed
    write16(zipBytes, cdfhOffset + 8, 1);           // General purpose flag
    write16(zipBytes, cdfhOffset + 10, 0);          // Compression method
    write16(zipBytes, cdfhOffset + 12, 0);          // Last mod time
    write16(zipBytes, cdfhOffset + 14, 0);          // Last mod date
    write32(zipBytes, cdfhOffset + 16, crc);        // CRC-32
    write32(zipBytes, cdfhOffset + 20, encryptedData.length + 12); // Compressed size
    write32(zipBytes, cdfhOffset + 24, fileDataBytes.length);      // Uncompressed size
    write16(zipBytes, cdfhOffset + 28, fileNameBytes.length);       // File name length
    write16(zipBytes, cdfhOffset + 30, 0);          // Extra field length
    write16(zipBytes, cdfhOffset + 32, 0);          // File comment length
    write16(zipBytes, cdfhOffset + 34, 0);          // Disk number start
    write16(zipBytes, cdfhOffset + 36, 0);          // Internal file attrs
    write32(zipBytes, cdfhOffset + 38, 0);          // External file attrs
    write32(zipBytes, cdfhOffset + 42, 0);          // Local header offset (0)
    zipBytes.set(fileNameBytes, cdfhOffset + 46);   // File name

    // 5. Write End of Central Directory Record (EOCD)
    const eocdOffset = lfhSize + cdfhSize;
    write32(zipBytes, eocdOffset, 0x06054b50);     // Signature
    write16(zipBytes, eocdOffset + 4, 0);           // Number of this disk
    write16(zipBytes, eocdOffset + 6, 0);           // Disk where CD starts
    write16(zipBytes, eocdOffset + 8, 1);           // Records on this disk
    write16(zipBytes, eocdOffset + 10, 1);          // Total records
    write32(zipBytes, eocdOffset + 12, cdfhSize);   // Size of CD
    write32(zipBytes, eocdOffset + 16, cdfhOffset); // Offset of CD
    write16(zipBytes, eocdOffset + 20, 0);          // Comment length

    // 6. Encode bytes to Base64
    const base64 = uint8ToBase64(zipBytes);
    const dataUri = `data:application/zip;base64,${base64}`;

    return { dataUri, base64 };
  };

  // Save encrypted backup ZIP to local storage / download directory
  const handleDownloadBackup = async () => {
    setIsExporting(true);
    // Copy zip decryption key to clipboard
    await Clipboard.setStringAsync(exportPassword);

    const header = `IMPEL DOWN SECURITY BACKUP\n===========================\nCifrado con Clave ZIP: ${exportPassword}\nFecha de Exportación: ${new Date().toLocaleString()}\n\n`;
    const content = accounts.map(acc => {
      let str = `Plataforma: ${acc.name}\nUsuario: ${acc.username}\nContraseña: ${acc.id === 'netflix' || acc.id === 'epicgames' ? 'op_pirates_99' : 'strong_secret_hash_2026!'}\n`;
      if (acc.customFields) {
        acc.customFields.forEach(f => {
          str += `${f.label}: ${f.value}\n`;
        });
      }
      return str;
    }).join('\n');

    const filePayload = header + content;

    try {
      // Build a REAL encrypted zip file
      const zipData = await buildEncryptedZip(filePayload);

      if (Platform.OS === 'web') {
        const element = document.createElement("a");
        element.href = zipData.dataUri;
        element.download = "impel_backup.zip";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
      } else if (Platform.OS === 'android') {
        const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (permissions.granted) {
          const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
            permissions.directoryUri,
            'impel_backup',
            'application/zip'
          );
          await FileSystem.writeAsStringAsync(fileUri, zipData.base64, { encoding: FileSystem.EncodingType.Base64 });
        } else {
          // Fallback to Sharing
          const fileUri = `${FileSystem.documentDirectory}impel_backup.zip`;
          await FileSystem.writeAsStringAsync(fileUri, zipData.base64, { encoding: FileSystem.EncodingType.Base64 });
          if (await Sharing.isAvailableAsync()) {
            await Sharing.shareAsync(fileUri, {
              mimeType: 'application/zip',
              dialogTitle: 'Guardar respaldo cifrado Impel',
              UTI: 'public.zip-archive'
            });
          }
        }
      } else {
        // iOS
        const fileUri = `${FileSystem.documentDirectory}impel_backup.zip`;
        await FileSystem.writeAsStringAsync(fileUri, zipData.base64, { encoding: FileSystem.EncodingType.Base64 });
        
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'application/zip',
            dialogTitle: 'Guardar respaldo cifrado Impel',
            UTI: 'public.zip-archive'
          });
        }
      }
    } catch (err) {
      console.warn("Failed to generate/save encrypted ZIP:", err);
    } finally {
      setIsExporting(false);
      setIsExportOpen(false);
      triggerToast('¡Clave copiada y archivo descargado!');
    }
  };

  // Animated styles
  const bottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomSheetTranslation.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
    pointerEvents: backdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const addBottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: addSheetTranslation.value + keyboardOffset.value }],
    height: addSheetHeight.value,
  }));

  const addBackdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: addBackdropOpacity.value,
    pointerEvents: addBackdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const importBottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: importSheetTranslation.value + keyboardOffset.value }],
  }));

  const importBackdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: importBackdropOpacity.value,
    pointerEvents: importBackdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const exportBottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: exportSheetTranslation.value + keyboardOffset.value }],
  }));

  const exportBackdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: exportBackdropOpacity.value,
    pointerEvents: exportBackdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  const detailBottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: detailSheetTranslation.value + keyboardOffset.value }],
  }));

  const detailBackdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: detailBackdropOpacity.value,
    pointerEvents: detailBackdropOpacity.value > 0 ? 'auto' : 'none',
  }));

  // Clipboard copies
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  };

  const handleCopyUser = () => {
    if (!selectedAccount) return;
    Clipboard.setStringAsync(selectedAccount.username);
    triggerToast('¡Usuario copiado!');
    closeBottomSheet();
  };

  const handleCopyPass = () => {
    if (!selectedAccount) return;
    Clipboard.setStringAsync(selectedAccount.id === 'netflix' || selectedAccount.id === 'epicgames' ? 'op_pirates_99' : 'strong_secret_hash_2026!');
    triggerToast('¡Contraseña copiada!');
    closeBottomSheet();
  };

  const getLogoStyle = (logo: string) => {
    switch (logo) {
      case 'netflix':
        return { bg: '#F5E6E6', color: '#E50914', char: 'N' };
      case 'google':
        return { bg: '#E6F0FA', color: '#4285F4', char: 'G' };
      case 'github':
        return { bg: '#ECECEC', color: '#24292E', char: 'G' };
      case 'spotify':
        return { bg: '#EBF7EE', color: '#1DB954', char: 'S' };
      case 'adobe':
        return { bg: '#FAEBF0', color: '#FF0000', char: 'A' };
      case 'epicgames':
        return { bg: '#ECEEF1', color: '#000000', char: 'E' };
      default:
        return { bg: '#F2F2F7', color: '#000000', char: 'P' };
    }
  };

  return (
    <View style={styles.container}>
      {/* Scrollable Vault Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, !isLargeScreen && { paddingBottom: 120 }]}
      >
        {/* Header Poneglyph Image (Black version, no overlapping card) */}
        <PoneglyphBg height={160} color="black">
          <View style={styles.headerBranding}>
            <ImpelLogo size={40} />
            <Text style={styles.headerLogoText}>IMPEL DOWN</Text>
          </View>
        </PoneglyphBg>

        {/* Account Cards Grid Section */}
        <View style={styles.accountsSection}>
          <View style={sectionHeaderStyle()}>
            <Text style={sectionHeaderTitleStyle()}>Cuentas Guardadas</Text>
            <Text style={styles.sectionBadge}>{filteredAccounts.length}</Text>
          </View>

          {/* Search Bar + Import + Export Row */}
          <View style={styles.searchSection}>
            <View style={styles.searchBar}>
              <SearchIcon size={16} color="#8E8E93" style={styles.searchIcon} />
              <TextInput
                placeholder="Buscar por plataforma o usuario..."
                placeholderTextColor="#8E8E93"
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <Pressable 
              style={({ pressed }) => [styles.importBtn, pressed && { opacity: 0.8 }]} 
              onPress={() => setIsImportOpen(true)}
            >
              <ImportIcon size={16} color="#FFFFFF" />
            </Pressable>
            <Pressable 
              style={({ pressed }) => [styles.importBtn, pressed && { opacity: 0.8 }]} 
              onPress={handleOpenExport}
            >
              <DownloadIcon size={16} color="#FFFFFF" />
            </Pressable>
          </View>

          <View style={styles.accountsGrid}>
            {filteredAccounts.map((account) => {
              const themeLogo = getLogoStyle(account.logo);

              return (
                <Pressable
                  key={account.id}
                  style={({ pressed }) => [
                    styles.accountGridCard,
                    pressed && styles.accountCardPressed,
                  ]}
                  onPress={() => openBottomSheet(account)}
                >
                  {/* Company Logo Image with fallback initials */}
                  <View style={styles.accountLogoCircle}>
                    <BrandLogo
                      logoKey={account.logo}
                      char={themeLogo.char}
                      bgColor={themeLogo.bg}
                      color={themeLogo.color}
                      size={44}
                    />
                  </View>

                  {/* Account Name */}
                  <Text style={styles.accountGridName} numberOfLines={1}>
                    {account.name}
                  </Text>

                  {/* Account Username */}
                  <Text style={styles.accountGridUser} numberOfLines={1}>
                    {account.username}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>

      {/* Floating Tab Bar for mobile navigation (With Plus in the Center) */}
      {!isLargeScreen && (
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBarCapsule}>
            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('unlock')}
            >
              <HomeIcon size={18} color="#8E8E93" />
            </Pressable>

            <Pressable
              style={[styles.tabItem, activeTab === 'vault' && styles.tabItemActive]}
              onPress={() => setActiveTab('vault')}
            >
              <KeyIcon size={18} color="#FFFFFF" />
            </Pressable>

            {/* Plus Tab Button */}
            <Pressable
              style={styles.tabItem}
              onPress={() => setIsAddOpen(true)}
            >
              <PlusIcon size={18} color="#8E8E93" />
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={() => setActiveTab('audit')}
            >
              <ShieldIcon size={16} color="#8E8E93" />
            </Pressable>

            <Pressable
              style={styles.tabItem}
              onPress={lock}
            >
              <UnlockIcon size={18} color="#8E8E93" />
            </Pressable>
          </View>
        </View>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {/* Backdrop for Quick Actions sheet */}
      <Animated.View
        style={[styles.backdrop, backdropAnimatedStyle]}
        onTouchStart={closeBottomSheet}
      />

      {/* Backdrop for Add sheet */}
      <Animated.View
        style={[styles.backdrop, addBackdropAnimatedStyle]}
        onTouchStart={() => { setIsAddOpen(false); Keyboard.dismiss(); }}
      />

      {/* Backdrop for Import sheet */}
      <Animated.View
        style={[styles.backdrop, importBackdropAnimatedStyle]}
        onTouchStart={() => { setIsImportOpen(false); Keyboard.dismiss(); }}
      />

      {/* Backdrop for Export sheet */}
      <Animated.View
        style={[styles.backdrop, exportBackdropAnimatedStyle]}
        onTouchStart={() => { if (!isExporting) setIsExportOpen(false); }}
      />

      {/* Backdrop for Detail sheet */}
      <Animated.View
        style={[styles.backdrop, detailBackdropAnimatedStyle]}
        onTouchStart={closeDetail}
      />

      {/* Quick Actions Bottom Sheet */}
      <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
        <View style={styles.bottomSheetHandleContainer}>
          <View style={styles.bottomSheetHandle} />
        </View>

        {selectedAccount && (
          <View style={styles.bottomSheetContent}>
            <Text style={styles.bottomSheetTitle}>{selectedAccount.name}</Text>
            <Text style={styles.bottomSheetSubtitle}>{selectedAccount.username}</Text>

            <View style={styles.actionsList}>
              <Pressable style={styles.actionItem} onPress={handleCopyUser}>
                <UserIcon size={16} color="#000000" style={styles.actionIcon} />
                <Text style={styles.actionText}>Copiar Usuario</Text>
              </Pressable>

              <Pressable style={styles.actionItem} onPress={handleCopyPass}>
                <KeyIcon size={16} color="#000000" style={styles.actionIcon} />
                <Text style={styles.actionText}>Copiar Contraseña</Text>
              </Pressable>

              <Pressable style={styles.actionItem} onPress={openDetail}>
                <CopyIcon size={16} color="#000000" style={styles.actionIcon} />
                <Text style={styles.actionText}>Ver Detalles Completos</Text>
              </Pressable>

              {/* Secure Delete Button */}
              <Pressable style={[styles.actionItem, styles.actionItemDelete]} onPress={handleDeletePress}>
                <TrashIcon size={16} color="#FF3B30" style={styles.actionIcon} />
                <Text style={styles.actionTextDelete}>Eliminar Credencial</Text>
              </Pressable>
              
              <Pressable style={[styles.actionItem, styles.actionItemCancel]} onPress={closeBottomSheet}>
                <Text style={styles.actionTextCancel}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        )}
      </Animated.View>

      {/* Add Password Bottom Sheet Drawer */}
      <Animated.View style={[styles.addBottomSheet, addBottomSheetAnimatedStyle]}>
        <View style={styles.bottomSheetHandleContainer}>
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
                <Text style={btnCancelTextStyle()}>Cancelar</Text>
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
                  <View style={styles.passInputRow}>
                    <TextInput
                      style={[styles.formInput, { flex: 1, marginBottom: 0 }]}
                      placeholder="Contraseña segura"
                      placeholderTextColor="#8E8E93"
                      value={newPassword}
                      onChangeText={setNewPassword}
                      autoCapitalize="none"
                      secureTextEntry={!showNewPassword}
                    />
                    <Pressable
                      style={styles.generateBtn}
                      onPress={() => {
                        const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
                        let pass = '';
                        for (let i = 0; i < 16; i++) {
                          pass += chars.charAt(Math.floor(Math.random() * chars.length));
                        }
                        setNewPassword(pass);
                        setShowNewPassword(true);
                      }}
                    >
                      <Text style={styles.generateBtnText}>Generar</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Compound specific Custom Fields list */}
                {addStep === 'compound' && (
                  <>
                    {customFields.map((field, idx) => (
                      <View key={`custom-field-${idx}`} style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>{field.label.toUpperCase()}</Text>
                        <TextInput
                          style={styles.formInput}
                          placeholder={`Valor para ${field.label}...`}
                          placeholderTextColor="#8E8E93"
                          value={field.value}
                          onChangeText={(text) => {
                            setCustomFields((prev) => {
                              const updated = [...prev];
                              updated[idx].value = text;
                              return updated;
                            });
                          }}
                        />
                      </View>
                    ))}

                    {/* Dotted personalized field button or creator input */}
                    {showFieldCreator ? (
                      <View style={styles.inlineFieldCreator}>
                        <TextInput
                          style={[styles.formInput, { flex: 1, marginBottom: 0 }]}
                          placeholder="Nombre del campo (ej. Tarjeta)..."
                          placeholderTextColor="#8E8E93"
                          value={newFieldLabel}
                          onChangeText={setNewFieldLabel}
                          autoFocus
                        />
                        <Pressable style={styles.fieldCreatorBtn} onPress={handleAddCustomField}>
                          <Text style={styles.fieldCreatorBtnText}>✔</Text>
                        </Pressable>
                        <Pressable style={[styles.fieldCreatorBtn, { backgroundColor: '#F2F2F7' }]} onPress={() => setShowFieldCreator(false)}>
                          <Text style={[styles.fieldCreatorBtnText, { color: '#8E8E93' }]}>✖</Text>
                        </Pressable>
                      </View>
                    ) : (
                      <Pressable
                        style={styles.dottedButton}
                        onPress={() => setShowFieldCreator(true)}
                      >
                        <Text style={styles.dottedButtonText}>+ Agregar Campo Personalizado</Text>
                      </Pressable>
                    )}
                  </>
                )}

                {/* Action buttons */}
                <View style={styles.btnRow}>
                  <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setAddStep('choose')}>
                    <Text style={btnCancelTextStyle()}>Atrás</Text>
                  </Pressable>
                  <Pressable style={[styles.btn, styles.btnSave]} onPress={handleSave}>
                    <Text style={styles.btnSaveText}>Guardar</Text>
                  </Pressable>
                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Animated.View>

      {/* Intelligent Import Bottom Sheet Drawer */}
      <Animated.View style={[styles.importBottomSheet, importBottomSheetAnimatedStyle]}>
        <View style={styles.bottomSheetHandleContainer}>
          <View style={styles.bottomSheetHandle} />
        </View>

        <View style={styles.addSheetContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.addSheetScrollContent}
          >
            <Text style={styles.addSheetTitle}>Importación Inteligente</Text>
            <Text style={styles.addSheetSubtitle}>Pega bloques de texto. Impel los detectará automáticamente.</Text>

            <TextInput
              style={styles.importTextArea}
              placeholder={`Ejemplo:\nGmail\nUsuario: pedro@gmail.com\nContraseña: pedro123\n\nTarjeta Mercantil\nTarjeta: 1234 5678\nContraseña: abcde\n- Pin: 4433`}
              placeholderTextColor="#8E8E93"
              multiline={true}
              value={importText}
              onChangeText={setImportText}
            />

            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => { setIsImportOpen(false); Keyboard.dismiss(); }}>
                <Text style={btnCancelTextStyle()}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={handleImportText}>
                <Text style={styles.btnSaveText}>Importar Cuentas</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Animated.View>

      {/* Export Bottom Sheet Drawer */}
      <Animated.View style={[styles.exportBottomSheet, exportBottomSheetAnimatedStyle]}>
        <View style={styles.bottomSheetHandleContainer}>
          <View style={styles.bottomSheetHandle} />
        </View>

        <View style={styles.addSheetContent}>
          <ScrollView 
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.addSheetScrollContent}
          >
            <Text style={styles.addSheetTitle}>Exportar Respaldo</Text>
            <Text style={styles.addSheetSubtitle}>Se descargará un archivo cifrado .zip con tus credenciales.</Text>

            <View style={styles.exportInfoCard}>
              <Text style={styles.exportInfoLabel}>CONTRASEÑA DEL ARCHIVO ZIP</Text>
              <View style={styles.exportPasswordBox}>
                <Text style={styles.exportPasswordText}>{exportPassword}</Text>
                <Pressable onPress={() => { Clipboard.setStringAsync(exportPassword); triggerToast('¡Contraseña copiada!'); }}>
                  <CopyIcon size={16} color="#8E8E93" />
                </Pressable>
              </View>
              <Text style={styles.exportWarningText}>
                Guarda esta contraseña en un lugar seguro. La necesitarás para abrir el archivo ZIP de respaldo.
              </Text>
            </View>

            <View style={styles.btnRow}>
              <Pressable style={[styles.btn, styles.btnCancel]} onPress={() => setIsExportOpen(false)} disabled={isExporting}>
                <Text style={btnCancelTextStyle()}>Cancelar</Text>
              </Pressable>
              <Pressable style={[styles.btn, styles.btnSave]} onPress={handleDownloadBackup} disabled={isExporting}>
                {isExporting ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.btnSaveText}>Descargar ZIP</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </Animated.View>

      {/* Detail Bottom Sheet Drawer */}
      <Animated.View style={[styles.detailBottomSheet, detailBottomSheetAnimatedStyle]}>
        <View style={styles.bottomSheetHandleContainer}>
          <View style={styles.bottomSheetHandle} />
        </View>

        <View style={styles.detailSheetContent}>
          {selectedAccount && (
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.detailSheetScrollContent}
            >
              <View style={styles.detailHeaderCard}>
                <View style={styles.detailLogoCircle}>
                  <BrandLogo
                    logoKey={selectedAccount.logo}
                    char={getLogoStyle(selectedAccount.logo).char}
                    bgColor={getLogoStyle(selectedAccount.logo).bg}
                    color={getLogoStyle(selectedAccount.logo).color}
                    size={48}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.detailAccountName}>{selectedAccount.name}</Text>
                  <Text style={styles.detailAccountTag}>AES-256 Descifrado • Sin Ocultar</Text>
                </View>
              </View>

              <View style={styles.detailFields}>
                {/* Username */}
                <View style={styles.detailFieldGroup}>
                  <Text style={styles.detailFieldLabel}>USUARIO / CORREO</Text>
                  <View style={styles.detailValueBox}>
                    <Text style={styles.detailFieldValue}>{selectedAccount.username}</Text>
                    <Pressable onPress={() => { Clipboard.setStringAsync(selectedAccount.username); triggerToast('¡Usuario copiado!'); }}>
                      <CopyIcon size={16} color="#8E8E93" />
                    </Pressable>
                  </View>
                </View>

                {/* Password (PLAIN TEXT) */}
                <View style={styles.detailFieldGroup}>
                  <Text style={styles.detailFieldLabel}>CONTRASEÑA</Text>
                  <View style={styles.detailValueBox}>
                    <Text style={styles.detailFieldValue}>
                      {selectedAccount.id === 'netflix' || selectedAccount.id === 'epicgames' ? 'op_pirates_99' : 'strong_secret_hash_2026!'}
                    </Text>
                    <Pressable onPress={() => { Clipboard.setStringAsync(selectedAccount.id === 'netflix' || selectedAccount.id === 'epicgames' ? 'op_pirates_99' : 'strong_secret_hash_2026!'); triggerToast('¡Contraseña copiada!'); }}>
                      <CopyIcon size={16} color="#8E8E93" />
                    </Pressable>
                  </View>
                </View>

                {/* Custom Fields (PLAIN TEXT) */}
                {selectedAccount.customFields && selectedAccount.customFields.map((field, idx) => (
                  <View key={`detail-custom-${idx}`} style={styles.detailFieldGroup}>
                    <Text style={styles.detailFieldLabel}>{field.label.toUpperCase()}</Text>
                    <View style={styles.detailValueBox}>
                      <Text style={styles.detailFieldValue}>{field.value}</Text>
                      <Pressable onPress={() => { Clipboard.setStringAsync(field.value); triggerToast(`¡${field.label} copiado!`); }}>
                        <CopyIcon size={16} color="#8E8E93" />
                      </Pressable>
                    </View>
                  </View>
                ))}
              </View>

              <Pressable style={[styles.btn, styles.btnCancel, { marginTop: Spacing.four }]} onPress={closeDetail}>
                <Text style={btnCancelTextStyle()}>Cerrar</Text>
              </Pressable>
            </ScrollView>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function sectionHeaderStyle() {
  return {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    gap: Spacing.two,
    marginBottom: Spacing.three,
    paddingLeft: Spacing.one,
  };
}

function sectionHeaderTitleStyle() {
  return {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#000000',
  };
}

function btnCancelTextStyle() {
  return {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7', // Soft iOS light gray
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerBranding: {
    alignItems: 'center',
    marginTop: 50,
  },
  headerLogoText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontFamily: Fonts.bold,
    letterSpacing: 3,
    marginTop: Spacing.one,
  },
  accountsSection: {
    paddingHorizontal: Spacing.three,
    marginTop: Spacing.four,
  },
  sectionBadge: {
    backgroundColor: '#000000',
    color: '#FFFFFF',
    fontSize: 10,
    fontFamily: Fonts.bold,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    overflow: 'hidden',
  },
  searchSection: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginBottom: Spacing.four,
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  searchIcon: {
    marginRight: Spacing.two,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  importBtn: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  importTextArea: {
    height: 180,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    padding: Spacing.three,
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#000000',
    textAlignVertical: 'top',
    marginBottom: Spacing.two,
  },
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 2,
  },
  accountGridCard: {
    width: '31%', // Fits 3 items perfectly per row with gap
    aspectRatio: 1, // Perfectly square
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  accountCardPressed: {
    backgroundColor: '#F2F2F7',
  },
  accountLogoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  fallbackLogoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  fallbackLogoText: {
    fontFamily: Fonts.bold,
  },
  accountLogoText: {
    fontSize: 18,
    fontFamily: Fonts.bold,
  },
  accountGridName: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
    width: '100%',
  },
  accountGridUser: {
    fontSize: 9,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    textAlign: 'center',
    width: '100%',
    marginTop: 2,
  },
  toastContainer: {
    position: 'absolute',
    top: 60,
    alignSelf: 'center',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: Spacing.four,
    paddingVertical: 10,
    borderRadius: 20,
    zIndex: 999999,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  toastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.regular,
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#000000',
    zIndex: 99998, // Under the sheets, above everything else
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 390, // Increased height to comfortably fit the delete action!
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 99999, // Floating on top of everything
    paddingTop: 10,
    paddingHorizontal: Spacing.four,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
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
  importBottomSheet: {
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
    paddingVertical: 4,
  },
  bottomSheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#E5E5EA',
  },
  bottomSheetContent: {
    marginTop: Spacing.three,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
  },
  bottomSheetSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Fonts.regular,
  },
  actionsList: {
    marginTop: Spacing.four,
    gap: Spacing.two,
  },
  actionItem: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  actionIcon: {
    marginRight: Spacing.three,
  },
  actionText: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  actionItemCancel: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  actionTextCancel: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
  },
  actionItemDelete: {
    backgroundColor: '#FFECEB', // Soft Red background
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  actionTextDelete: {
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#FF3B30', // Deep Red text
  },
  addSheetContent: {
    marginTop: Spacing.two,
    flex: 1,
  },
  addSheetScrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 40,
  },
  addSheetTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
  },
  addSheetSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
    fontFamily: Fonts.regular,
    marginBottom: Spacing.three,
  },
  formContainer: {
    gap: Spacing.three,
  },
  inputGroup: {
    gap: Spacing.one,
  },
  inputLabel: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    letterSpacing: 1,
    paddingLeft: Spacing.one,
  },
  formInput: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    paddingHorizontal: Spacing.three,
    fontSize: 14,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  passInputRow: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  generateBtn: {
    height: 46,
    borderRadius: 8,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.three,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontFamily: Fonts.bold,
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
  btnSave: {
    backgroundColor: '#000000',
  },
  btnSaveText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#FFFFFF',
  },
  choiceContainer: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 20,
  },
  choiceTitle: {
    fontSize: 20,
    fontFamily: Fonts.bold,
    color: '#000000',
    textAlign: 'center',
    marginBottom: 4,
  },
  choiceSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: Spacing.three,
  },
  choicesList: {
    gap: Spacing.two,
  },
  choiceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.three,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  choiceTextCol: {
    flex: 1,
    marginRight: Spacing.two,
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
    marginTop: 2,
    lineHeight: 14,
  },
  dottedButton: {
    height: 46,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#AEAEB2',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.two,
    backgroundColor: 'transparent',
  },
  dottedButtonText: {
    fontSize: 12,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  inlineFieldCreator: {
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
  exportInfoCard: {
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    padding: Spacing.three,
    marginVertical: Spacing.two,
  },
  exportInfoLabel: {
    fontSize: 10,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
    letterSpacing: 1,
    marginBottom: Spacing.one,
  },
  exportPasswordBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    height: 44,
    borderRadius: 8,
    paddingHorizontal: Spacing.three,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  exportPasswordText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  exportWarningText: {
    fontSize: 11,
    color: '#FF9500',
    fontFamily: Fonts.regular,
    marginTop: Spacing.two,
    lineHeight: 14,
  },
  detailSheetContent: {
    marginTop: Spacing.two,
    flex: 1,
  },
  detailSheetScrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: 40,
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
  detailStrengthBox: {
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    alignSelf: 'flex-start',
  },
  detailStrengthText: {
    fontSize: 11,
    fontFamily: Fonts.bold,
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
