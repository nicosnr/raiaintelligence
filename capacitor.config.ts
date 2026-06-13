import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourapp.id',
  appName: 'Your App',
  webDir: 'dist/client',  // ← point here directly
};

export default config;