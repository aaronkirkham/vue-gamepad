import VueGamepadFactory, { BindingResult } from '../src/gamepad';
import { DefaultOptions } from '../src/options';

const testCallbackEventListener = jest.fn();
let vuegamepad = new (VueGamepadFactory(DefaultOptions));

function mockVNode() {
  // @ts-ignore
  return {} as VNode;
}

describe('Gamepad', () => {
  it('does not allow invalid bindings', () => {
    // missing directive arg (v-gamepad:XXXX)
    const invalidArgBinding = vuegamepad.validBinding({
      instance: null,
      value: undefined,
      oldValue: undefined,
      arg: undefined,
      modifiers: {},
      dir: {},
    }, mockVNode());

    expect(invalidArgBinding).toEqual(BindingResult.InvalidArg);

    // missing directive callback (v-gamepad:button-a="")
    const invalidCallbackBinding = vuegamepad.validBinding({
      instance: null,
      value: undefined,
      oldValue: undefined,
      arg: 'button-a',
      modifiers: {},
      dir: {},
    }, mockVNode());

    expect(invalidCallbackBinding).toEqual(BindingResult.InvalidCallback);

    // valid binding, has arg and callback
    const validBinding = vuegamepad.validBinding({
      instance: null,
      value: () => {},
      oldValue: undefined,
      arg: 'button-a',
      modifiers: {},
      dir: {},
    }, mockVNode());
    
    expect(validBinding).toEqual(BindingResult.Ok);
  });

  it('registered an event listener', () => {
    vuegamepad.addListener('button-a', {}, testCallbackEventListener, mockVNode());
    expect(vuegamepad.events['']['pressed']['button-a']).toBeDefined();
    expect(vuegamepad.events['']['pressed']['button-a'][0].callback).toEqual(testCallbackEventListener);
  });

  it('event listener callback was fired', () => {
    // @ts-ignore
    const nullGamepad: Gamepad = null;
    vuegamepad.runPressedCallbacks('button-a', nullGamepad);
    expect(testCallbackEventListener).toHaveBeenCalled();
  });

  it('unregistered an event listener', () => {
    vuegamepad.removeListener('button-a', {}, testCallbackEventListener, mockVNode());
    expect(vuegamepad.events['']['pressed']['button-a']).toBeUndefined();
  });

  it('can switch layers', () => {
    vuegamepad.switchToLayer('test');
    expect(vuegamepad.currentLayer).toEqual('test');
    expect(vuegamepad.prevLayers['test']).toEqual('');

    vuegamepad.switchToLayer('newlayer');
    expect(vuegamepad.currentLayer).toEqual('newlayer');
    expect(vuegamepad.prevLayers['newlayer']).toEqual('test');
    expect(vuegamepad.prevLayers['test']).toEqual('');

    vuegamepad.destroyLayer('newlayer');
    expect(vuegamepad.currentLayer).toEqual('test');

    vuegamepad.destroyLayer('test');
    expect(vuegamepad.currentLayer).toEqual('');
  });
});