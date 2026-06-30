<p align="center">
  <img src="./logo.png" alt="Impel" width="140" />
</p>

<h1 align="center">Impel</h1>

<p align="center">
  <strong>Gestor de contraseñas seguro con autenticación biométrica</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-0.85-blue?logo=react" alt="React Native" />
  <img src="https://img.shields.io/badge/Expo-SDK_56-black?logo=expo" alt="Expo SDK 56" />
  <img src="https://img.shields.io/badge/TypeScript-6.0-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-green" alt="Platform" />
</p>

---

## Acerca de

**Impel** es un gestor de credenciales móvil y web construido con React Native y Expo. Protege tus cuentas con dos capas de autenticación biométrica (FaceID/TouchID), exportación cifrada con ZipCrypto, y auditorías de seguridad en tiempo real.

### Características principales

- 🔐 **Doble biometría** — Sesión de 12 horas + desbloqueo de bóveda independiente con FaceID/TouchID
- 🛡️ **Auditoría de seguridad** — Puntuación en tiempo real, detección de contraseñas filtradas y débiles
- 📦 **Exportación cifrada** — Backup en archivo ZIP con cifrado ZipCrypto y clave aleatoria de alta entropía
- 📥 **Importación inteligente** — Parser flexible que detecta plataforma, usuario, contraseña y campos personalizados
- 🏷️ **Campos personalizados** — Almacena tokens 2FA, PINs, preguntas de seguridad y más por cuenta
- 📱 **Multiplataforma** — iOS nativo, Android nativo y Web responsive con layout adaptativo
- 🖥️ **Modo Desktop** — Showcase de 3 iPhones simulados lado a lado en pantallas grandes

---

## Tech Stack

| Capa | Tecnología |
|------|-----------|
| Framework | [Expo SDK 56](https://expo.dev) + [React Native 0.85](https://reactnative.dev) |
| Lenguaje | TypeScript 6.0 |
| Navegación | Expo Router (file-based) |
| Animaciones | React Native Reanimated 4 |
| Biometría | expo-local-authentication |
| Almacenamiento | expo-file-system + expo-clipboard |
| Compartir | expo-sharing |
| Cifrado | ZipCrypto (implementación pura JS, sin dependencias nativas) |

---

## Inicio Rápido

### Prerrequisitos

- Node.js 18+
- npm o yarn
- [Expo CLI](https://docs.expo.dev/get-started/installation/)

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/cesardarizaleta/Impel.git
cd Impel

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npm start
```

### Ejecutar en plataformas

```bash
# iOS (requiere macOS + Xcode)
npm run ios

# Android (requiere Android Studio)
npm run android

# Web
npm run web
```

---

## Estructura del Proyecto

```
src/
├── app/                    # Rutas (Expo Router)
│   ├── _layout.tsx         # Layout raíz
│   ├── index.tsx           # Pantalla principal con lógica de layout
│   └── explore.tsx         # Pantalla de exploración
├── components/
│   ├── screen-login.tsx    # Pantalla de login biométrico (sesión)
│   ├── screen-unlock.tsx   # Pantalla de desbloqueo de bóveda
│   ├── screen-vault.tsx    # Bóveda de credenciales
│   ├── screen-audit.tsx    # Auditoría de seguridad
│   ├── logo.tsx            # Logo generativo de Impel
│   ├── iphone-frame.tsx    # Frame de iPhone para showcase web
│   ├── poneglyph-bg.tsx    # Fondo decorativo
│   └── icons.tsx           # Iconos SVG custom
├── hooks/
│   └── use-vault.tsx       # Estado global (contexto de la bóveda)
└── constants/
    └── theme.ts            # Tokens de diseño
```

---

## Build & Deploy (EAS)

El proyecto está configurado con **Expo Application Services (EAS)** para builds de producción:

### Pre-requisitos
1. Cuenta en [Expo.dev](https://expo.dev)
2. Instalar EAS CLI: `npm install -g eas-cli` (ya incluido en devDependencies)
3. Login: `eas login`

### Comandos disponibles

```bash
# Instalar dependencias (incluye EAS CLI)
npm install

# Builds
npm run eas:preview        # APK para testing interno
npm run eas:production     # AAB para Play Store
npm run eas:dev            # Build de desarrollo

# Utilidades
npm run eas:status         # Ver últimos builds
npm run eas:submit         # Enviar build a Play Store

# Configuración inicial (solo primera vez)
eas build:configure        # Configurar proyecto en Expo
```

### Perfiles de Build
- **preview**: APK para distribución interna (testing)
- **production**: AAB (Android App Bundle) para Play Store
- **development**: Build con desarrollo habilitado

## Seguridad

| Capa | Descripción |
|------|-------------|
| Sesión | Autenticación biométrica con expiración automática a las 12 horas |
| Bóveda | Segundo factor biométrico independiente para acceder a credenciales |
| Exportación | Archivo ZIP cifrado con ZipCrypto y clave de 20+ caracteres aleatorios |
| Eliminación | Requiere confirmación biométrica antes de borrar cualquier credencial |

---

## Licencia

Este proyecto está bajo la licencia incluida en el archivo [LICENSE](./LICENSE).

---

<p align="center">
  Hecho con ☕ por <a href="https://github.com/cesardarizaleta">@cesardarizaleta</a>
</p>
