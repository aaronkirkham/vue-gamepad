interface VueGamepadOptions {
  analogThreshold: number;
  buttonNames: Array<string>;
  buttonInitialTimeout: number;
  buttonRepeatTimeout: number;
  injectClasses: boolean;
  classPrefix: string;
}

interface ListenerModifiers {
  released?: boolean;
  repeat?: boolean;
}

interface VueGamepadEvents {
  [layer: string]: {
    [action: string]: {
      [event: string]: VueGamepadEvent[];
    };
  };
}

interface ListenerCallbackEvent {
  buttonName: string;
  gamepad: Gamepad;
}

declare type ListenerCallback = (event: ListenerCallbackEvent) => any;

interface VueGamepadEvent {
  vnode: any;
  repeat: boolean;
  callback: ListenerCallback;
}