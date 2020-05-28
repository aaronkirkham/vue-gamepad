import { config } from '@vue/test-utils';
import VueGamepad from '../src';

config.global.plugins = [
  VueGamepad,
];

// throw if console error occurred
global.console.error = (message: any) => {
  throw message;
}

// implement getGamepads
navigator.getGamepads = () => [];