import React from 'react';
import { View, StyleSheet, ScrollView, Text, Pressable, Platform, useColorScheme } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Spacing, BottomTabInset } from '@/constants/theme';
import { ImpelLogo } from '@/components/logo';

export default function TabTwoScreen() {
  const safeAreaInsets = useSafeAreaInsets();
  const scheme = useColorScheme();
  const isDark = scheme === 'dark';

  const insets = {
    ...safeAreaInsets,
    bottom: safeAreaInsets.bottom + BottomTabInset + Spacing.three,
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={[styles.contentContainer, { paddingTop: insets.top || 40, paddingBottom: insets.bottom }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ImpelLogo size={70} />
        <Text style={styles.title}>Tecnología Impel</Text>
        <Text style={styles.subtitle}>Bóveda Criptográfica Local-First</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cifrado Kozuki (AES-256-GCM)</Text>
        <Text style={styles.paragraph}>
          Toda la información guardada en tu dispositivo está protegida con algoritmos de cifrado simétrico avanzado. Impel implementa AES-GCM de 256 bits, garantizando que nadie —ni siquiera los creadores de la app— pueda acceder a tus contraseñas sin tu clave principal.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Filosofía Local-First</Text>
        <Text style={styles.paragraph}>
          Tus contraseñas pertenecen únicamente a tu dispositivo. No hay servidores centrales, bases de datos en la nube ni APIs de terceros que puedan ser vulneradas. La base de datos local SQLite cifrada es la "Prisión de Máxima Seguridad" de tus credenciales.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Integridad Biométrica</Text>
        <Text style={styles.paragraph}>
          Impel utiliza el hardware de enclave seguro (Secure Enclave en iOS y Keystore en Android) para verificar tu identidad a través de FaceID o huella dactilar, liberando la llave criptográfica únicamente en memoria RAM por tiempo limitado.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Desarrollado en React Native</Text>
        <Text style={styles.paragraph}>
          Construido con componentes nativos fluidos y animaciones optimizadas a 60fps usando React Native Reanimated para una experiencia visual de primer nivel en todas las plataformas.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Impel Security Lab © 2026</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.four,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.five,
    marginTop: Spacing.two,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000000',
    marginTop: Spacing.three,
  },
  subtitle: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
    marginTop: Spacing.one,
  },
  section: {
    backgroundColor: '#F2F2F7',
    borderRadius: 20,
    padding: Spacing.three,
    marginBottom: Spacing.three,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000000',
    marginBottom: Spacing.one,
  },
  paragraph: {
    fontSize: 12,
    color: '#636366',
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    marginTop: Spacing.four,
    marginBottom: Spacing.two,
  },
  footerText: {
    fontSize: 10,
    color: '#AEAEB2',
    fontWeight: '600',
  },
});
