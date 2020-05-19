interface VueGamepadOptions {
  analogThreshold: number;
  buttonNames: Array<string>;
  buttonInitialTimeout: number;
  buttonRepeatTimeout: number;
  injectClasses: boolean;
}

interface ListenerModifiers {
  released?: boolean;
  repeat?: boolean;
}

declare type ListenerCallback = () => any;

interface ListenerEvent {
  callback?: ListenerCallback;
}

interface VueGamepadEvent {
  vnode: any;
  repeat: boolean;
  callback: ListenerCallback;
}