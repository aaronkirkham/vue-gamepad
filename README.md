# Vue-Gamepad
A Vue.js plugin to add gamepad support

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
<button v-gamepad:button-a @click="callback">Press me!</button>
```

## Options
TODO

## Methods
`vm.$gamepad.binding`

`vm.$gamepad.forceLayer`


## License
MIT