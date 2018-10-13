jest.spyOn(global.console, 'log').mockImplementation(jest.fn);
jest.spyOn(global.console, 'warn').mockImplementation(jest.fn);
jest.spyOn(global.console, 'error').mockImplementation(jest.fn);

import Vue from 'vue';
import VueGamepad from '../lib';

navigator.getGamepads = () => [];

Vue.use(VueGamepad);