<p align="center"><img width="128px" src="./assets/logo.svg" alt="Vue Gamepad logo"></p>
<h1 align="center">vue-gamepad</h1>

<p align="center">
  <img src="https://img.shields.io/travis/com/aaronkirkham/vue-gamepad.svg" />
  <img src="https://img.shields.io/github/size/aaronkirkham/vue-gamepad/dist/vue-gamepad.min.js.svg" />
  <img src="https://img.shields.io/github/license/aaronkirkham/vue-gamepad.svg" />
</p>

A Vue.js plugin to add gamepad support. Bind any element to trigger a callback when a gamepad button is pressed.

## Installation
#### npm/yarn
```bash
$ npm install vue-gamepad
# or with yarn
$ yarn add vue-gamepad
```

#### CDN
https://unpkg.com/vue-gamepad@beta/dist/vue-gamepad.min.js

## Usage
Tell Vue to use the plugin
```js
import { createApp } from 'vue';
import VueGamepad from 'vue-gamepad';

const app = createApp(...);
app.use(VueGamepad);
```

Example usage inside templates:
```html
<button v-gamepad:button-a="callback">Press me!</button>
```

See [Examples](examples/2.x/) for more.

## Constructor Options
|Key|Description|Default|Type|
|:---|---|---|---|
|`analogThreshold`|Threshold before analog events are triggered. Low values may cause false positives|`0.5`|`Number`|
|`buttonMapping`|List of strings containing button indices|[Mapping](src/options.ts#L2)|`Array`|
|`buttonInitialTimeout`|Time (in milliseconds) until the button will start repeating when held down|`200`|`Number`|
|`buttonRepeatTimeout`|Time (in milliseconds) between each button repeat event when held down|`200`|`Number`|
|`injectClasses`|Add classes to elements which have a gamepad binding|`true`|`Boolean`|
|`classPrefix`|String which will be prefixed to all injected classes|`v-gamepad`|`String`|

## Directives
- `v-gamepad` - Bind an element to a gamepad action which will fire a callback
  - `released` modifier - Only fire the callback when the button is released
  - `repeat` modifier - Repeatedly fire the callback when the button is held
- `v-gamepad-layer` - Bind gamepad actions to different layers ([See Examples](examples/2.x/layers/))

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
