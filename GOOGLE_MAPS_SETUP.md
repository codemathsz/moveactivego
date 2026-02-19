# 🗺️ Configuração do Google Maps API

## Configuração Atual

A API Key do Google Maps está configurada em **dois lugares**:

### 1. Para desenvolvimento local (npx expo run:android)
**Arquivo:** `android/app/src/main/AndroidManifest.xml`
```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY"/>
```

### 2. Para builds com EAS
**Arquivo:** `app.json`
```json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY"
      }
    }
  },
  "ios": {
    "config": {
      "googleMapsApiKey": "AIzaSyDGoW4cdlktD9eW-P49WpPedlDIHEt1HEY"
    }
  }
}
```

## 🔒 Melhor Prática para Produção (Recomendado)

Para maior segurança, use **EAS Secrets** ao invés de colocar a chave direto no código:

### Passo 1: Adicionar secret no EAS
```bash
eas secret:create --scope project --name GOOGLE_MAPS_API_KEY --value YOUR_API_KEY_HERE
```

### Passo 2: Criar `app.config.js` (substitui app.json)
```javascript
export default {
  expo: {
    // ... configurações existentes do app.json
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY
        }
      }
    },
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY
      }
    }
  }
};
```

### Passo 3: Atualizar eas.json
```json
{
  "build": {
    "production": {
      "env": {
        "GOOGLE_MAPS_API_KEY": "$(GOOGLE_MAPS_API_KEY)"
      }
    }
  }
}
```

## 📱 Comandos de Build

### Build de desenvolvimento
```bash
eas build --profile development --platform android
```

### Build de produção
```bash
eas build --profile production --platform android
```

## ⚠️ Importante

1. **Nunca commite API keys** no git (já configurado no .gitignore)
2. Para produção, **sempre use EAS Secrets**
3. Restrinja a API key no Google Cloud Console:
   - Acesse [Google Cloud Console](https://console.cloud.google.com/)
   - Vá em "Credenciais"
   - Configure restrições por app (SHA-1 fingerprint)
   - Ative apenas as APIs necessárias: Maps SDK for Android/iOS

## 📚 Links Úteis

- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [EAS Secrets](https://docs.expo.dev/build-reference/variables/#using-secrets-in-environment-variables)
- [Google Maps Setup](https://docs.expo.dev/versions/latest/sdk/map-view/)
