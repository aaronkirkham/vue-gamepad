jest.spyOn(global.console, 'log').mockImplementation(jest.fn);
jest.spyOn(global.console, 'warn').mockImplementation(jest.fn);
jest.spyOn(global.console, 'error').mockImplementation(jest.fn);

import Vue from 'vue';
import VueGamepad from '../lib';
import { createLocalVue, shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';

global.Vue = Vue;
global.VueGamepad = VueGamepad;
global.createLocalVue = createLocalVue;
global.shallowMount = shallowMount;
global.flushPromises = flushPromises;
navigator.getGamepads = () => [];

Vue.use(VueGamepad);