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

declare type ListenerCallback = () => any;

interface ListenerEvent {
  callback?: ListenerCallback;
}

interface VueGamepadEvents {
  [layer: string]: {
    [action: string]: {
      [event: string]: VueGamepadEvent[];
    };
  };
}

interface VueGamepadEvent {
  vnode: any;
  repeat: boolean;
  callback: ListenerCallback;
}