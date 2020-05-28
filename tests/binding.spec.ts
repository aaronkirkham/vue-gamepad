import { mount } from '@vue/test-utils';
import VueGamepadFactory from '../src/gamepad';

function getGamepad(wrapper: any) {
  const T = new (VueGamepadFactory()); // hack for type info
  return wrapper['__app'].config.globalProperties.$gamepad as typeof T;
}

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

  it('v-gamepad callback was triggered', () => {
    const callback = jest.fn();
    const wrapper = mount({
      template: '<button v-gamepad:button-a="callback">Hello</button>',
      methods: {
        callback,
      },
    });

    const gamepad = getGamepad(wrapper);
    gamepad.runPressedCallbacks('button-a');

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

    const gamepad = getGamepad(wrapper);
    gamepad.runPressedCallbacks('button-a');

    expect(callback).toHaveBeenCalled();
  });

  it('v-gamepad bindings were registered on correct layer', () => {
    const callback = jest.fn();
    const wrapper = mount({
      template: `<div v-gamepad-layer="'test'">
          <button v-gamepad:button-a="callback">Hello</button>
        </div>`,
      methods: {
        callback,
      },
    });

    const gamepad = getGamepad(wrapper);

    expect(gamepad.currentLayer).toEqual('');
    expect(gamepad.events['']).toBeUndefined();
    expect(gamepad.events['test']['pressed']['button-a']).toBeDefined();
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

    const gamepad = getGamepad(wrapper);
    gamepad.runPressedCallbacks('button-a');
    gamepad.runReleasedCallbacks('button-a');

    // testLayerCallback should not run because we are on the default layer
    expect(defaultLayerCallback).toHaveBeenCalledTimes(1);
    expect(testLayerCallback).toHaveBeenCalledTimes(0);

    gamepad.switchToLayer('test');
    gamepad.runPressedCallbacks('button-a');
    gamepad.runReleasedCallbacks('button-a');
    
    // testLayerCallback should now have been called
    // defaultLayerCallback should not have been called any more times
    expect(defaultLayerCallback).toHaveBeenCalledTimes(1);
    expect(testLayerCallback).toHaveBeenCalledTimes(1);
  });
});