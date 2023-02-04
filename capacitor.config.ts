import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yorha.muffintube',
  appName: 'MuffinTube Mobile',
  webDir: 'build',
  bundledWebRuntime: false,
  server: {
    "hostname": "youtube.com",
    "androidScheme": "https"
}
};

export default config;
