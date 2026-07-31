import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.civicintel.app',
  appName: 'Civic Intel',
  webDir: 'dist/client',
  server: {
    url: 'https://civicintelapp.lovable.app',
    cleartext: false,
  },
  android: {
    backgroundColor: '#050507',
  },
  ios: {
    backgroundColor: '#050507',
  },
};

export default config;
