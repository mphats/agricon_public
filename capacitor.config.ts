
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.83e79694b8d3412d8dee1c60a5ba9f11',
  appName: 'agri-connect-malawi',
  webDir: 'dist',
  server: {
    url: 'https://83e79694-b8d3-412d-8dee-1c60a5ba9f11.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'Camera access is required to take photos of your crops',
        photos: 'Photo library access is required to select crop images'
      }
    }
  }
};

export default config;
