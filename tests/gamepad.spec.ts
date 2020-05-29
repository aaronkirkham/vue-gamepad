import VueGamepadFactory, { ValidBindingResult } from '../src/gamepad';
import { DefaultOptions } from '../src/options';

const testCallbackEventListener = jest.fn();
let gamepad = new (VueGamepadFactory(DefaultOptions));

describe('Gamepad', () => {
  it('does not allow invalid bindings', () => {
    // missing directive arg (v-gamepad:XXXX)
    const invalidArgBinding = gamepad.validBinding({
      instance: null,
      value: undefined,
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      dir: {},
    });
    expect(invalidArgBinding).toEqual(ValidBindingResult.E_INVALID_ARG);

    // missing directive callback (v-gamepad:button-a="")
    const invalidCallbackBinding = gamepad.validBinding({
      instance: null,
      value: undefined,
      oldValue: undefined,
      arg: 'button-a',
      modifiers: {},
      dir: {},
    });
    expect(invalidCallbackBinding).toEqual(ValidBindingResult.E_INVALID_CALLBACK);

    // valid binding, has arg and callback
    const validBinding = gamepad.validBinding({
      instance: null,
      value: () => console.log('callback'),
      oldValue: undefined,
      arg: 'button-a',
      modifiers: {},
      dir: {},
    });
    expect(validBinding).toEqual(ValidBindingResult.E_OK);
  });

  it('registered an event listener', () => {
    gamepad.addListener('button-a', {}, testCallbackEventListener);
    expect(gamepad.events['']['pressed']['button-a']).toBeDefined();
    expect(gamepad.events['']['pressed']['button-a'][0].callback).toEqual(testCallbackEventListener);
  });

  it('event listener callback was fired', () => {
    gamepad.runPressedCallbacks('button-a');
    expect(testCallbackEventListener).toHaveBeenCalled();
  });

  it('unregistered an event listener', () => {
    gamepad.removeListener('button-a', {}, testCallbackEventListener);
    expect(gamepad.events['']['pressed']['button-a']).toBeUndefined();
  });

  it('can switch layers', () => {
    gamepad.switchToLayer('test');
    expect(gamepad.currentLayer).toEqual('test');
    expect(gamepad.prevLayers['test']).toEqual('');

    gamepad.switchToLayer('newlayer');
    expect(gamepad.currentLayer).toEqual('newlayer');
    expect(gamepad.prevLayers['newlayer']).toEqual('test');
    expect(gamepad.prevLayers['test']).toEqual('');

    gamepad.destroyLayer('newlayer');
    expect(gamepad.currentLayer).toEqual('test');

    gamepad.destroyLayer('test');
    expect(gamepad.currentLayer).toEqual('');
  });
});