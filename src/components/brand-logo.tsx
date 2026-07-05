import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Image } from 'expo-image';
import { Fonts } from '@/constants/theme';

export interface BrandLogoProps {
  logoKey: string;
  char: string;
  bgColor: string;
  color: string;
  size?: number;
  logoUrl?: string;
}

export function BrandLogo({ logoKey, char, bgColor, color, size = 44, logoUrl }: BrandLogoProps) {
  const [loadError, setLoadError] = useState(false);

  // 1. Try to load the custom SVGL logoUrl first
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

  // 2. Fallback to Clearbit logo for predefined static brands
  const domainMap: Record<string, string> = {
    netflix: 'netflix.com',
    google: 'google.com',
    github: 'github.com',
    spotify: 'spotify.com',
    adobe: 'adobe.com',
    epicgames: 'epicgames.com',
  };

  const domain = domainMap[logoKey];
  const logoUrlClearbit = domain ? `https://logo.clearbit.com/${domain}` : null;

  if (logoUrlClearbit && !loadError) {
    return (
      <Image
        source={{ uri: logoUrlClearbit }}
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

  // 3. Fallback to letter initials
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bgColor,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <Text style={{ color, fontSize: size * 0.4, fontFamily: Fonts.bold }}>
        {char}
      </Text>
    </View>
  );
}
