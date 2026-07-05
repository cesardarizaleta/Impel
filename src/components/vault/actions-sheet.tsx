import React from 'react';
import { View, StyleSheet, Text, Pressable } from 'react-native';
import Animated from 'react-native-reanimated';
import { Spacing, Fonts } from '@/constants/theme';
import { UserIcon, KeyIcon, CopyIcon, TrashIcon } from '../icons';

interface ActionsSheetProps {
  bottomSheetAnimatedStyle: any;
  actionPanHandlers: any;
  selectedAccount: any;
  handleCopyUser: () => void;
  handleCopyPass: () => void;
  openDetail: () => void;
  handleDeletePress: () => void;
  closeBottomSheet: () => void;
}

export function ActionsSheet({
  bottomSheetAnimatedStyle,
  actionPanHandlers,
  selectedAccount,
  handleCopyUser,
  handleCopyPass,
  openDetail,
  handleDeletePress,
  closeBottomSheet,
}: ActionsSheetProps) {
  if (!selectedAccount) return null;

  return (
    <Animated.View style={[styles.bottomSheet, bottomSheetAnimatedStyle]}>
      <View style={styles.bottomSheetHandleContainer} {...actionPanHandlers}>
        <View style={styles.bottomSheetHandle} />
      </View>

      <View style={styles.bottomSheetContent}>
        <View style={styles.bottomSheetHeader}>
          <Text style={styles.bottomSheetTitle}>{selectedAccount.name}</Text>
          <Text style={styles.bottomSheetSubtitle}>{selectedAccount.username}</Text>
        </View>

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
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  bottomSheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 480,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    zIndex: 99999,
    paddingTop: 10,
    paddingHorizontal: Spacing.four,
    paddingBottom: 90,
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
  bottomSheetContent: {
    marginTop: Spacing.three,
  },
  bottomSheetHeader: {
    marginBottom: Spacing.four,
    alignItems: 'center',
  },
  bottomSheetTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  bottomSheetSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    fontFamily: Fonts.regular,
    marginTop: 2,
  },
  actionsList: {
    gap: Spacing.two,
  },
  actionItem: {
    flexDirection: 'row',
    height: 48,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  actionItemDelete: {
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  actionItemCancel: {
    backgroundColor: 'transparent',
    justifyContent: 'center',
    marginTop: Spacing.one,
  },
  actionIcon: {
    width: 16,
    height: 16,
  },
  actionText: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#000000',
  },
  actionTextDelete: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#FF3B30',
  },
  actionTextCancel: {
    fontSize: 14,
    fontFamily: Fonts.bold,
    color: '#8E8E93',
  },
});
