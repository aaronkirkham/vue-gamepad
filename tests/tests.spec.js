import Vue from 'vue';
import VueGamepad from '../lib';
import { shallowMount } from '@vue/test-utils';
import flushPromises from 'flush-promises';

// templates
import EmptyBindingCallback from './templates/EmptyBindingCallback';

Vue.use(VueGamepad);

describe('vue-gamepad.js', () => {
  test('was installed', () => {
    const vm = new Vue();
    expect(vm.$gamepad).toBeDefined();
  })
})

describe('EmptyBindingCallback', () => {
  const wrapper = shallowMount(EmptyBindingCallback);
  const gamepad = wrapper.vm.$gamepad;
  const button = wrapper.find('button');

  const directives = button.vnode.data.directives;
  const directive = directives.find(d => d.rawName === 'v-gamepad:button-a');

  test('directive was registered', () => {
    expect(directive).toBeDefined();
  })

  test('directive doesn\'t pass a callback', () => {
    expect(directive.value).toBeUndefined();
  })

  test('binding event was registered', () => {
    expect(gamepad.events[0]['button-a']).toHaveLength(1);
  })

  test('inherits v-on:click callback', () => {
    expect(gamepad.events[0]['button-a'][0].callback).toEqual(button.vnode.data.on.click);
  })

  test('binding callback was fired', async () => {
    gamepad.events[0]['button-a'][0].callback();
    await flushPromises();

    expect(wrapper.find('h1').text()).toEqual('pressed');
  })
})