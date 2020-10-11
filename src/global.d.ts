declare interface VueGamepadOptions {
  analogThreshold: number;
  buttonNames: Array<string>;
  buttonInitialTimeout: number;
  buttonRepeatTimeout: number;
  injectClasses: boolean;
  classPrefix: string;
}

declare interface ListenerModifiers {
  released?: boolean;
  repeat?: boolean;
}

declare interface VueGamepadEvents {
  [layer: string]: {
    [action: string]: {
      [event: string]: VueGamepadEvent[];
    };
  };
}

declare interface ListenerCallbackEvent {
  buttonName: string;
  gamepad: Gamepad;
}

declare type ListenerCallback = (event: ListenerCallbackEvent) => any;

declare interface VueGamepadEvent {
  vnode: any;
  repeat: boolean;
  callback: ListenerCallback;
}