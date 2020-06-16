import { nextTick } from 'vue';
import { mount } from '@vue/test-utils';
import VueGamepadFactory from '../src/gamepad';
import { ButtonNames, PositiveAxisNames } from '../src/options';

function getVueGamepad(wrapper: any) {
  const T = new (VueGamepadFactory()); // hack for type info
  return wrapper['__app'].config.globalProperties.$gamepad as typeof T;
}

let mockGamepad: any = { buttons: [], axes: [] };

function mockGamepadReset() {
  const buttons = Array.from({ length: ButtonNames.length }, () => ({ value: 0, pressed: false }));
  const axes = new Array(PositiveAxisNames.length).fill(0);

  mockGamepad = { buttons, axes };
}

function mockGamepadButtonPress(vuegamepad: any, buttonName: string) {
  const idx = ButtonNames.indexOf(buttonName);

  mockGamepad.buttons[idx].value = 1;
  mockGamepad.buttons[idx].pressed = true;

  vuegamepad.update();
}

function mockGamepadButtonRelease(vuegamepad: any, buttonName: string) {
  const idx = ButtonNames.indexOf(buttonName);

  mockGamepad.buttons[idx].value = 0;
  mockGamepad.buttons[idx].pressed = false;

  vuegamepad.update();
}

beforeAll(() => navigator.getGamepads = () => [mockGamepad]); // route getGamepads to our mock gamepad
afterAll(() => navigator.getGamepads = () => []); // reset getGamepads after all tests
beforeEach(() => mockGamepadReset()); // reset all buttons/axex before each test

describe('Binding', () => {
  it('v-gamepad directive was bound', () => {
    const wrapper = mount({
      template: '<button v-gamepad:button-a="callback">Hello</button>',
      methods: {
        callback: () => {},
      },
    });

    expect(wrapper.html()).toEqual('<button class="v-gamepad v-gamepad--button-a">Hello</button>');
  });

  it('v-gamepad pressed callback was triggered', () => {
    const callback = jest.fn();
    const wrapper = mount({
      template: '<button v-gamepad:button-a="callback">Hello</button>',
      methods: {
        callback,
      },
    });
    
    const vuegamepad = getVueGamepad(wrapper);
    mockGamepadButtonPress(vuegamepad, 'button-a');

    expect(callback).toHaveBeenCalled();
  });

  it('v-gamepad released callback was triggered', () => {
    const callback = jest.fn();
    const wrapper = mount({
      template: '<button v-gamepad:button-a.released="callback">Hello</button>',
      methods: {
        callback,
      },
    });

    
    const vuegamepad = getVueGamepad(wrapper);
    mockGamepadButtonPress(vuegamepad, 'button-a');
    mockGamepadButtonRelease(vuegamepad, 'button-a');
    
    expect(callback).toHaveBeenCalled();
  });

  it('v-gamepad inherited v-on:click callback', () => {
    const callback = jest.fn();
    const wrapper = mount({
      template: '<button v-gamepad:button-a @click="callback">Hello</button>',
      methods: {
        callback,
      },
    });

    const vuegamepad = getVueGamepad(wrapper);
    mockGamepadButtonPress(vuegamepad, 'button-a');

    expect(callback).toHaveBeenCalled();
  });

  it('v-gamepad bindings were registered on the correct layer', () => {
    const callback = jest.fn();
    const wrapper = mount({
      template: `<div v-gamepad-layer="'test'">
          <button v-gamepad:button-a="callback">Hello</button>
        </div>`,
      methods: {
        callback,
      },
    });

    const vuegamepad = getVueGamepad(wrapper);

    expect(vuegamepad.currentLayer).toEqual('');
    expect(vuegamepad.events['']).toBeUndefined();
    expect(vuegamepad.events['test']['pressed']['button-a']).toBeDefined();
  });

  it('v-gamepad callback was triggered on the correct layer', () => {
    const defaultLayerCallback = jest.fn();
    const testLayerCallback = jest.fn();
    const wrapper = mount({
      template: `<button v-gamepad:button-a="defaultLayerCallback">Hello</button>
        <div v-gamepad-layer="'test'">
          <button v-gamepad:button-a="testLayerCallback">Hello</button>
        </div>`,
      methods: {
        defaultLayerCallback,
        testLayerCallback,
      },
    });

    const vuegamepad = getVueGamepad(wrapper);

    mockGamepadButtonPress(vuegamepad, 'button-a');
    mockGamepadButtonRelease(vuegamepad, 'button-a');

    // testLayerCallback should not run because we are on the default layer
    expect(defaultLayerCallback).toHaveBeenCalledTimes(1);
    expect(testLayerCallback).toHaveBeenCalledTimes(0);

    vuegamepad.switchToLayer('test');
    mockGamepadButtonPress(vuegamepad, 'button-a');
    
    // testLayerCallback should now have been called
    // defaultLayerCallback should not have been called any more times
    expect(defaultLayerCallback).toHaveBeenCalledTimes(1);
    expect(testLayerCallback).toHaveBeenCalledTimes(1);
  });

  it('v-gamepad-layer bindings will use the correct layer for nested vnodes', () => {
    const wrapper = mount({
      template: `<div v-gamepad-layer="'test'">
          <button v-gamepad:button-a="callback">Hello</button>
          <div class="child">
            <button v-gamepad:button-b="callback">Hello Again!</button>
            <div class="another-child">
              <button v-gamepad:button-x="callback">Hello Again... Again!</button>
            </div>
          </div>
        </div>`,
      methods: {
        callback: () => {},
      },
    });

    const vuegamepad = getVueGamepad(wrapper);

    expect(vuegamepad.events['']).toBeUndefined();
    expect(vuegamepad.events['test']['pressed']['button-a']).toBeDefined();
    expect(vuegamepad.events['test']['pressed']['button-b']).toBeDefined();
    expect(vuegamepad.events['test']['pressed']['button-x']).toBeDefined();
  });

  it('v-gamepad-layer is destroyed when element is unmounted and events are unbound', async () => {
    const wrapper = mount({
      template: `<div v-if="show" v-gamepad-layer="'test'">
          <button v-gamepad:button-a="callback"></button>
        </div>`,
      data: () => {
        return {
          show: true,
        };
      },
      methods: {
        callback: () => {}
      },
    });

    const vuegamepad = getVueGamepad(wrapper);

    expect(vuegamepad.events['test']).toBeDefined();
    vuegamepad.switchToLayer('test');

    wrapper.vm.show = false;
    await nextTick();

    expect(vuegamepad.currentLayer).toEqual('');
    expect(vuegamepad.events).toEqual({});
  });
});