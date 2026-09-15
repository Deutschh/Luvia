import type { ConfigContext, ExpoConfig } from 'expo/config';

const isDevelopment = process.env.APP_VARIANT === 'development';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: isDevelopment ? 'Luvia Dev' : 'Luvia',
  slug: config.slug ?? 'Luvia',
  scheme: isDevelopment ? 'luvia-dev' : 'luvia',
  android: {
    ...config.android,
    package: isDevelopment ? 'com.joaopedro.luvia.dev' : 'com.joaopedro.luvia',
  },
});
