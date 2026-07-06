// Polyfill 'process' for web compatibility (required by react-syntax-highlighter on Expo Web)
const anyGlobal = (typeof globalThis !== 'undefined' ? globalThis : window) as any;
if (typeof anyGlobal.process === 'undefined' || !anyGlobal.process.env) {
  anyGlobal.process = {
    ...anyGlobal.process,
    env: { NODE_ENV: 'development' },
  };
}

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
