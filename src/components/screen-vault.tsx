import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, ScrollView, Pressable, TextInput, Keyboard, useWindowDimensions, Platform, PanResponder } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { useVault, Account } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import { PoneglyphBg } from './poneglyph-bg';
import { ImpelLogo } from './logo';
import { BrandLogo } from './brand-logo';
import {
  ShieldIcon,
  UserIcon,
  KeyIcon,
  UnlockIcon,
  LockIcon,
  CopyIcon,
  HomeIcon,
  SearchIcon,
  PlusIcon,
  ImportIcon,
  TrashIcon,
  DownloadIcon
} from './icons';

// Modular bottom sheet components
import { ActionsSheet } from './vault/actions-sheet';
import { AddSheet } from './vault/add-sheet';
import { ImportSheet } from './vault/import-sheet';
import { ExportSheet } from './vault/export-sheet';
import { DetailSheet } from './vault/detail-sheet';

// --- Logo Style Helper ---
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
    deleteAccount,
    unlock,
  } = useVault();

  // Selected account for bottom sheet / detail view
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Import / Export sheet states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Responsive dimensions
  const { width } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && width >= 1120;

  // --- Reanimated shared values ---
  const bottomSheetTranslation = useSharedValue(500);
  const backdropOpacity = useSharedValue(0);

  const addSheetTranslation = useSharedValue(500);
  const addBackdropOpacity = useSharedValue(0);
  const addSheetHeight = useSharedValue(320);
  const keyboardOffset = useSharedValue(0);

  const importSheetTranslation = useSharedValue(500);
  const importBackdropOpacity = useSharedValue(0);

  const exportSheetTranslation = useSharedValue(500);
  const exportBackdropOpacity = useSharedValue(0);

  const detailSheetTranslation = useSharedValue(500);
  const detailBackdropOpacity = useSharedValue(0);

  // --- Sheet Open/Close Sync Effects ---
  React.useEffect(() => {
    if (isAddOpen) {
      addSheetTranslation.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      addBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      addSheetTranslation.value = withTiming(500, { duration: 220, easing: Easing.out(Easing.quad) });
      addBackdropOpacity.value = withTiming(0, { duration: 180 });
      keyboardOffset.value = withTiming(0, { duration: 200 });
    }
  }, [isAddOpen]);

  React.useEffect(() => {
    if (isImportOpen) {
      importSheetTranslation.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      importBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      importSheetTranslation.value = withTiming(500, { duration: 220, easing: Easing.out(Easing.quad) });
      importBackdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [isImportOpen]);

  React.useEffect(() => {
    if (isExportOpen) {
      exportSheetTranslation.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      exportBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      exportSheetTranslation.value = withTiming(500, { duration: 220, easing: Easing.out(Easing.quad) });
      exportBackdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [isExportOpen]);

  React.useEffect(() => {
    if (isDetailOpen) {
      detailSheetTranslation.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
      detailBackdropOpacity.value = withTiming(0.4, { duration: 200 });
    } else {
      detailSheetTranslation.value = withTiming(500, { duration: 220, easing: Easing.out(Easing.quad) });
      detailBackdropOpacity.value = withTiming(0, { duration: 180 });
    }
  }, [isDetailOpen]);

  // Track virtual keyboard height dynamically
  React.useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      const pushAmount = e.endCoordinates.height - 10;
      keyboardOffset.value = withTiming(-Math.max(0, pushAmount), { duration: 250, easing: Easing.out(Easing.quad) });
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      keyboardOffset.value = withTiming(0, { duration: 200, easing: Easing.out(Easing.quad) });
    });

    return () => { showSubscription.remove(); hideSubscription.remove(); };
  }, []);

  // --- Filter accounts ---
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

  // --- Bottom Sheet Controls ---
  const openBottomSheet = (account: Account) => {
    setSelectedAccount(account);
    bottomSheetTranslation.value = withTiming(0, { duration: 250, easing: Easing.out(Easing.quad) });
    backdropOpacity.value = withTiming(0.4, { duration: 200 });
  };

  const closeBottomSheet = () => {
    bottomSheetTranslation.value = withTiming(500, { duration: 220, easing: Easing.out(Easing.quad) });
    backdropOpacity.value = withTiming(0, { duration: 180 });
  };

  const openDetail = () => {
    setIsDetailOpen(true);
    closeBottomSheet();
  };

  const closeDetail = () => {
    detailSheetTranslation.value = withTiming(500, { duration: 220, easing: Easing.out(Easing.quad) }, () => {
      runOnJS(setIsDetailOpen)(false);
      runOnJS(setSelectedAccount)(null);
    });
    detailBackdropOpacity.value = withTiming(0, { duration: 180 });
  };

  // --- Handlers ---
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2000);
  };

  const handleCopyUser = () => {
    if (!selectedAccount) return;
    Clipboard.setStringAsync(selectedAccount.username);
    triggerToast('¡Usuario copiado!');
    closeBottomSheet();
  };

  const handleCopyPass = () => {
    if (!selectedAccount) return;
    Clipboard.setStringAsync(selectedAccount.password || 'strong_secret_hash_2026!');
    triggerToast('¡Contraseña copiada!');
    closeBottomSheet();
  };

  const handleDeletePress = async () => {
    if (!selectedAccount) return;
    closeBottomSheet();
    const success = await unlock();
    if (success) {
      deleteAccount(selectedAccount.id);
      triggerToast('¡Credencial eliminada!');
    } else {
      triggerToast('Autenticación fallida. No se eliminó.');
    }
  };

  const handleOpenExport = () => {
    setIsExportOpen(true);
  };

  // --- PanResponders for fluid drag-to-close gestures ---
  const actionPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          bottomSheetTranslation.value = gestureState.dy;
        } else {
          bottomSheetTranslation.value = gestureState.dy * 0.15;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeBottomSheet();
        } else {
          bottomSheetTranslation.value = withTiming(0, { duration: 200 });
        }
      },
    })
  ).current;

  const detailPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          detailSheetTranslation.value = gestureState.dy;
        } else {
          detailSheetTranslation.value = gestureState.dy * 0.15;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          closeDetail();
        } else {
          detailSheetTranslation.value = withTiming(0, { duration: 200 });
        }
      },
    })
  ).current;

  const addPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          addSheetTranslation.value = gestureState.dy;
        } else {
          addSheetTranslation.value = gestureState.dy * 0.15;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          addSheetTranslation.value = withTiming(500, { duration: 200 }, () => {
            runOnJS(setIsAddOpen)(false);
          });
        } else {
          addSheetTranslation.value = withTiming(0, { duration: 200 });
        }
      },
    })
  ).current;

  const importPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          importSheetTranslation.value = gestureState.dy;
        } else {
          importSheetTranslation.value = gestureState.dy * 0.15;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          importSheetTranslation.value = withTiming(500, { duration: 200 }, () => {
            runOnJS(setIsImportOpen)(false);
          });
        } else {
          importSheetTranslation.value = withTiming(0, { duration: 200 });
        }
      },
    })
  ).current;

  const exportPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          exportSheetTranslation.value = gestureState.dy;
        } else {
          exportSheetTranslation.value = gestureState.dy * 0.15;
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.5) {
          exportSheetTranslation.value = withTiming(500, { duration: 200 }, () => {
            runOnJS(setIsExportOpen)(false);
          });
        } else {
          exportSheetTranslation.value = withTiming(0, { duration: 200 });
        }
      },
    })
  ).current;

  // --- Animated Styles ---
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
    transform: [{ translateY: exportSheetTranslation.value }],
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

  return (
    <View style={styles.container}>
      {/* Scrollable Vault Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, !isLargeScreen && { paddingBottom: 120 }]}
      >
        {/* Header Poneglyph Image */}
        <PoneglyphBg height={160} color="black">
          <View style={styles.headerBranding}>
            <ImpelLogo size={40} />
            <Text style={styles.headerLogoText}>IMPEL</Text>
          </View>
        </PoneglyphBg>

        {/* Account Cards Grid Section */}
        <View style={styles.accountsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionHeaderTitle}>Cuentas Guardadas</Text>
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
            {filteredAccounts.length === 0 ? (
              <View style={styles.emptyContainer}>
                <LockIcon size={32} color="#AEAEB2" style={styles.emptyIcon} />
                <Text style={styles.emptyTitle}>No hay credenciales por ahora</Text>
                <Text style={styles.emptySubtitle}>
                  Agrega tu primera contraseña tocando el botón de añadir.
                </Text>
              </View>
            ) : (
              filteredAccounts.map((account) => {
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
                    <View style={styles.accountLogoCircle}>
                      <BrandLogo
                        logoKey={account.logo}
                        char={themeLogo.char}
                        bgColor={themeLogo.bg}
                        color={themeLogo.color}
                        size={44}
                        logoUrl={account.logoUrl}
                      />
                    </View>
                    <Text style={styles.accountGridName} numberOfLines={1}>{account.name}</Text>
                    <Text style={styles.accountGridUser} numberOfLines={1}>{account.username}</Text>
                  </Pressable>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>

      {/* Floating Tab Bar */}
      {!isLargeScreen && (
        <View style={styles.tabBarContainer}>
          <View style={styles.tabBarCapsule}>
            <Pressable style={styles.tabItem} onPress={() => setActiveTab('unlock')}>
              <HomeIcon size={18} color="#8E8E93" />
            </Pressable>
            <Pressable style={[styles.tabItem, activeTab === 'vault' && styles.tabItemActive]} onPress={() => setActiveTab('vault')}>
              <KeyIcon size={18} color="#FFFFFF" />
            </Pressable>
            <Pressable style={styles.tabItem} onPress={() => setIsAddOpen(true)}>
              <PlusIcon size={18} color="#8E8E93" />
            </Pressable>
            <Pressable style={styles.tabItem} onPress={() => setActiveTab('audit')}>
              <ShieldIcon size={16} color="#8E8E93" />
            </Pressable>
            <Pressable style={styles.tabItem} onPress={lock}>
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

      {/* --- Backdrops --- */}
      <Animated.View style={[styles.backdrop, backdropAnimatedStyle]} onTouchStart={closeBottomSheet} />
      <Animated.View style={[styles.backdrop, addBackdropAnimatedStyle]} onTouchStart={() => { setIsAddOpen(false); Keyboard.dismiss(); }} />
      <Animated.View style={[styles.backdrop, importBackdropAnimatedStyle]} onTouchStart={() => { setIsImportOpen(false); Keyboard.dismiss(); }} />
      <Animated.View style={[styles.backdrop, exportBackdropAnimatedStyle]} onTouchStart={() => setIsExportOpen(false)} />
      <Animated.View style={[styles.backdrop, detailBackdropAnimatedStyle]} onTouchStart={closeDetail} />

      {/* --- Modular Bottom Sheets --- */}
      <ActionsSheet
        bottomSheetAnimatedStyle={bottomSheetAnimatedStyle}
        actionPanHandlers={actionPanResponder.panHandlers}
        selectedAccount={selectedAccount}
        handleCopyUser={handleCopyUser}
        handleCopyPass={handleCopyPass}
        openDetail={openDetail}
        handleDeletePress={handleDeletePress}
        closeBottomSheet={closeBottomSheet}
      />

      <AddSheet
        addBottomSheetAnimatedStyle={addBottomSheetAnimatedStyle}
        addPanHandlers={addPanResponder.panHandlers}
        isAddOpen={isAddOpen}
        setIsAddOpen={setIsAddOpen}
        addSheetHeight={addSheetHeight}
        triggerToast={triggerToast}
      />

      <ImportSheet
        importBottomSheetAnimatedStyle={importBottomSheetAnimatedStyle}
        importPanHandlers={importPanResponder.panHandlers}
        isImportOpen={isImportOpen}
        setIsImportOpen={setIsImportOpen}
        triggerToast={triggerToast}
      />

      <ExportSheet
        exportBottomSheetAnimatedStyle={exportBottomSheetAnimatedStyle}
        exportPanHandlers={exportPanResponder.panHandlers}
        isExportOpen={isExportOpen}
        setIsExportOpen={setIsExportOpen}
        accounts={accounts}
        triggerToast={triggerToast}
      />

      <DetailSheet
        detailBottomSheetAnimatedStyle={detailBottomSheetAnimatedStyle}
        detailPanHandlers={detailPanResponder.panHandlers}
        selectedAccount={selectedAccount}
        closeDetail={closeDetail}
        triggerToast={triggerToast}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    marginBottom: Spacing.three,
    paddingLeft: Spacing.one,
  },
  sectionHeaderTitle: {
    fontSize: 16,
    fontFamily: Fonts.bold,
    color: '#000000',
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
  accountsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 2,
  },
  accountGridCard: {
    width: '31%',
    aspectRatio: 1,
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
    zIndex: 99998,
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
  emptyContainer: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: Spacing.four,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: '#AEAEB2',
    marginTop: Spacing.two,
  },
  emptyIcon: {
    marginBottom: Spacing.two,
  },
  emptyTitle: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#3A3A3C',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtitle: {
    fontSize: 12,
    fontFamily: Fonts.regular,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
  },
});
