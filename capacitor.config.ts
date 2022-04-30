import { CapacitorConfig } from '@capacitor/cli';
import { KeyboardResize } from '@capacitor/keyboard';

const config: CapacitorConfig = {
    appId: 'com.pinekown.we',
	appName: 'Wave',
	webDir: 'www',
	bundledWebRuntime: false,
    plugins: {
        Keyboard: {
          resize: ('body' as KeyboardResize),
          style: 'light',
          resizeOnFullScreen: true,
        },
    }
};

export default config;