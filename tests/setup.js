jest.spyOn(global.console, 'log').mockImplementation(jest.fn);
jest.spyOn(global.console, 'warn').mockImplementation(jest.fn);
jest.spyOn(global.console, 'error').mockImplementation(jest.fn);

const Vue = require('vue');
const VueGamepad = require('vue-gamepad');
const utils = require('@vue/test-utils');
const flushPromises = require('flush-promises');

global.Vue = Vue;
global.VueGamepad = VueGamepad;
global.createLocalVue = utils.createLocalVue;
global.shallowMount = utils.shallowMount;
global.flushPromises = flushPromises;
navigator.getGamepads = () => [];

Vue.use(VueGamepad);