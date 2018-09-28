<p align="center"><img width="128px" src="./assets/logo.svg" alt="Vue Gamepad logo"></p>
<h1 align="center">vue-gamepad</h1>

A Vue.js plugin to add gamepad support. Bind any element to trigger a callback when a gamepad button is pressed.

## Usage
entry.js
```js
import Vue from 'vue';
import App from './App.vue';
import VueGamepad from 'vue-gamepad';

Vue.use(VueGamepad);
```

App.vue template:
```html
<button v-gamepad:button-a="callback">Press me!</button>
```

## Options
|key|description|default|type|
|:---|---|---|---|
|`buttonMapping`|list of strings containing button indices|[Map](lib/gamepad.js#L1)|`Array`|
|`injectClasses`|add classes to elements which have a gamepad binding|`true`|`Boolean`|
|`silent`|suppress debug info|`true`|`Boolean`|

## Methods
TODO

## License
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
