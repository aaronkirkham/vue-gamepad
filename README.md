<p align="center"><img width="128px" src="./assets/logo.svg" alt="Vue Gamepad logo"></p>
<h1 align="center">vue-gamepad</h1>

<p align="center">
  <img src="https://img.shields.io/travis/com/aaronkirkham/vue-gamepad.svg" />
  <img src="https://img.shields.io/github/size/aaronkirkham/vue-gamepad/dist/vue-gamepad.min.js.svg" />
  <img src="https://img.shields.io/github/license/aaronkirkham/vue-gamepad.svg" />
</p>

A Vue.js plugin to add gamepad support. Bind any element to trigger a callback when a gamepad button is pressed.

## Installation
### npm/yarn
```bash
$ npm/yarn install vue-gamepad
```

### CDN
https://unpkg.com/vue-gamepad/dist/vue-gamepad.min.js

## Usage
Tell Vue to use the plugin
```js
import Vue from 'vue';
import VueGamepad from 'vue-gamepad';

Vue.use(VueGamepad);
```

Example usage inside templates:
```html
<button v-gamepad:button-a="callback">Press me!</button>
```

## Constructor Options
|Key|Description|Default|Type|
|:---|---|---|---|
|`analogThreshold`|Threshold before analog events are triggered. Low values may cause false positives|`0.5`|`Number`|
|`buttonMapping`|List of strings containing button indices|[Mapping](lib/button-mapping.js#L1)|`Array`|
|`buttonRepeatTimeout`|Time (in milliseconds) until the repeat event is triggered when holding a button|`200`|`Number`|
|`injectClasses`|Add classes to elements which have a gamepad binding|`true`|`Boolean`|
|`silent`|Suppress debug info|`true`|`Boolean`|

## Directives
- `v-gamepad` - Bind an element to a gamepad action which will fire a callback
  - `released` modifier - Only fire the callback when the button is released
  - `repeat` modifier - Repeatedly fire the callback when the button is held
- ~~`v-gamepad-layer` - TODO~~
- ~~`v-gamepad-json` - Pass a raw object of buttons, actions and callbacks to bind~~

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details