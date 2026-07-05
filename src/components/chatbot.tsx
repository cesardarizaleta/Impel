import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Keyboard,
  useWindowDimensions,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import * as Clipboard from 'expo-clipboard';
import { useVault, Account, Message } from '@/hooks/use-vault';
import { Spacing, Fonts } from '@/constants/theme';
import {
  LockIcon,
  ShieldIcon,
  CopyIcon,
  PlusIcon,
  ChevronIcon,
  KeyIcon,
} from './icons';

// 2. Custom Send Icon Component
function SendIcon({ size = 16, color = '#FFFFFF' }) {
  const thickness = Math.max(1.8, size * 0.1);
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <View style={{ width: size * 0.8, height: thickness, backgroundColor: color, borderRadius: thickness / 2, position: 'relative' }} />
      <View style={{
        position: 'absolute',
        right: size * 0.1,
        width: size * 0.4,
        height: thickness,
        backgroundColor: color,
        borderRadius: thickness / 2,
        transform: [{ rotate: '45deg' }, { translateY: -size * 0.12 }]
      }} />
      <View style={{
        position: 'absolute',
        right: size * 0.1,
        width: size * 0.4,
        height: thickness,
        backgroundColor: color,
        borderRadius: thickness / 2,
        transform: [{ rotate: '-45deg' }, { translateY: size * 0.12 }]
      }} />
    </View>
  );
}

export function Chatbot() {
  const {
    isUnlocked,
    accounts,
    unlock,
    setIsAddOpen,
    setActiveTab,
    chatMessages: messages,
    setChatMessages: setMessages,
    setSelectedDetailAccount,
  } = useVault();

  const { width } = useWindowDimensions();
  const isLargeScreen = Platform.OS === 'web' && width >= 1120;
  const [inputText, setInputText] = useState('');

  const scrollRef = useRef<ScrollView>(null);
  
  // Reanimated Translation for custom bottom sheet drawer
  const bottomSheetTranslation = useSharedValue(450);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  // Track virtual keyboard height dynamically
  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const showSubscription = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height);
    });

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);



  // Auto-scroll to bottom of chat
  useEffect(() => {
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 150);
  }, [messages]);



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

  // Handle send message logic
  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const query = text.trim();
    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Simulate bot delay
    setTimeout(() => {
      let sanitized = query.toLowerCase();
      // If query matches "platform (username)", extract username to make search exact
      const parenMatch = query.match(/\(([^)]+)\)/);
      if (parenMatch) {
        sanitized = parenMatch[1].trim().toLowerCase();
      }

      const matches = accounts.filter(
        (acc) =>
          acc.name.toLowerCase().includes(sanitized) ||
          acc.username.toLowerCase().includes(sanitized)
      );

      let botResponse: Message;

      if (matches.length === 1) {
        const match = matches[0];
        botResponse = {
          id: Math.random().toString(),
          sender: 'bot',
          text: `Aquí están tus credenciales de ${match.name}. He abierto la tarjeta de detalles para ti.`,
          timestamp: new Date(),
          accountId: match.id,
        };
        // Auto open drawer
        setSelectedDetailAccount(match);
      } else if (matches.length > 1) {
        botResponse = {
          id: Math.random().toString(),
          sender: 'bot',
          text: `Encontré ${matches.length} cuentas que coinciden. ¿A cuál de ellas te refieres?`,
          timestamp: new Date(),
          suggestions: matches.map((m) => `${m.name} (${m.username})`),
        };
      } else {
        botResponse = {
          id: Math.random().toString(),
          sender: 'bot',
          text: `No encontré ninguna cuenta que coincida con "${query}". ¿Deseas agregar una nueva credencial, o buscar otra?`,
          timestamp: new Date(),
          suggestions: ['Agregar nueva', 'netflix', 'google'],
        };
      }

      setMessages((prev) => [...prev, botResponse]);
    }, 600);
  };

  // Handle quick reply clicks
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestion === 'Agregar nueva') {
      setActiveTab('vault');
      setIsAddOpen(true);
    } else {
      handleSend(suggestion);
    }
  };

  // Animated styles for bottom drawer
  const bottomSheetAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: bottomSheetTranslation.value }],
  }));

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    const opacity = bottomSheetTranslation.value === 450 ? 0 : 0.4;
    return {
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });



  return (
    <View style={styles.container}>
      {/* Messages Scroll Area */}
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.chatContent,
          { paddingBottom: keyboardHeight === 0 ? 160 : keyboardHeight + 100 },
          !isUnlocked && styles.chatContentBlur,
        ]}
      >
        {messages.map((msg) => {
          const isBot = msg.sender === 'bot';
          return (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                isBot ? styles.botRow : styles.userRow,
              ]}
            >
              {/* Avatar indicator for bot */}
              {isBot && (
                <View style={styles.botAvatar}>
                  <KeyIcon size={14} color="#FFFFFF" />
                </View>
              )}
              
              <View style={{ flexShrink: 1 }}>
                <View
                  style={[
                    styles.bubble,
                    isBot ? styles.botBubble : styles.userBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      isBot ? styles.botText : styles.userText,
                    ]}
                  >
                    {msg.text}
                  </Text>
                  
                  {/* Account display helper button inside bot bubble */}
                  {isBot && msg.accountId && (
                    <Pressable
                      style={styles.bubbleActionBtn}
                      onPress={() => {
                        const acc = accounts.find((a) => a.id === msg.accountId);
                        if (acc) setSelectedDetailAccount(acc);
                      }}
                    >
                      <KeyIcon size={12} color="#007AFF" style={{ marginRight: 4 }} />
                      <Text style={styles.bubbleActionText}>Ver Credencial</Text>
                    </Pressable>
                  )}
                </View>

                {/* Suggestions Pills below the message */}
                {isBot && msg.suggestions && (
                  <View style={styles.suggestionContainer}>
                    {msg.suggestions.map((sug, i) => (
                      <Pressable
                        key={`${msg.id}-sug-${i}`}
                        style={styles.suggestionPill}
                        onPress={() => handleSuggestionClick(sug)}
                      >
                        <Text style={styles.suggestionPillText}>{sug}</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Input Row */}
      <View style={[styles.inputRow, { bottom: keyboardHeight === 0 ? 84 : keyboardHeight + 24 }]}>
        <TextInput
          style={styles.input}
          placeholder="Busca por plataforma (ej. Mercantil)..."
          placeholderTextColor="#8E8E93"
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSend(inputText)}
          editable={isUnlocked}
        />
        <Pressable
          style={[
            styles.sendBtn,
            (!inputText.trim() || !isUnlocked) && styles.sendBtnDisabled,
          ]}
          onPress={() => handleSend(inputText)}
          disabled={!inputText.trim() || !isUnlocked}
        >
          <SendIcon size={14} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Locked State Overlay */}
      {!isUnlocked && (
        <View style={styles.lockOverlay}>
          <LockIcon size={40} color="#FF3B30" style={{ marginBottom: Spacing.two }} />
          <Text style={[styles.lockTitle, { marginBottom: Spacing.three }]}>Asistente Bloqueado</Text>
          <Pressable style={styles.unlockBtn} onPress={unlock}>
            <Text style={styles.unlockBtnText}>Desbloquear</Text>
          </Pressable>
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    position: 'relative',
  },
  chatContent: {
    paddingVertical: Spacing.three,
    paddingBottom: 160, // Safe padding for input row + tab bar
    gap: Spacing.two,
  },
  chatContentBlur: {
    opacity: 0.15,
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    maxWidth: '85%',
  },
  botRow: {
    alignSelf: 'flex-start',
    alignItems: 'flex-end',
    gap: 8,
  },
  userRow: {
    alignSelf: 'flex-end',
    justifyContent: 'flex-end',
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bubble: {
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  botBubble: {
    backgroundColor: '#E5E5EA',
    borderBottomLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#000000',
    borderBottomRightRadius: 4,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 19,
  },
  botText: {
    color: '#000000',
    fontFamily: Fonts.regular,
  },
  userText: {
    color: '#FFFFFF',
    fontFamily: Fonts.regular,
  },
  bubbleActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,122,255,0.1)',
    borderRadius: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginTop: Spacing.two,
    alignSelf: 'flex-start',
  },
  bubbleActionText: {
    color: '#007AFF',
    fontSize: 11,
    fontFamily: Fonts.bold,
  },
  suggestionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 6,
    paddingLeft: 4,
  },
  suggestionPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#C7C7CC',
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  suggestionPillText: {
    fontSize: 11,
    color: '#3A3A3C',
    fontFamily: Fonts.bold,
  },
  inputRow: {
    flexDirection: 'row',
    padding: Spacing.two,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    position: 'absolute',
    bottom: 84,
    left: 0,
    right: 0,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    zIndex: 10,
  },
  input: {
    flex: 1,
    height: 36,
    paddingHorizontal: Spacing.two,
    fontSize: 13,
    fontFamily: Fonts.regular,
    color: '#000000',
  },
  sendBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  sendBtnDisabled: {
    backgroundColor: '#AEAEB2',
    opacity: 0.6,
  },
  lockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(242, 242, 247, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.six,
    paddingBottom: 120, // Push center up to clear bottom tab bar
    zIndex: 99,
  },
  lockTitle: {
    fontSize: 18,
    fontFamily: Fonts.bold,
    color: '#000000',
    marginBottom: 4,
  },
  lockSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: Fonts.regular,
    marginBottom: Spacing.four,
    maxWidth: 240,
  },
  unlockBtn: {
    backgroundColor: '#000000',
    borderRadius: 8,
    height: 44,
    paddingHorizontal: Spacing.four,
    justifyContent: 'center',
    alignItems: 'center',
  },
  unlockBtnText: {
    color: '#FFFFFF',
    fontFamily: Fonts.bold,
    fontSize: 13,
  },

});
