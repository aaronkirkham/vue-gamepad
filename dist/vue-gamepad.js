/*!
 * vue-gamepad v1.0.0
 * (c) 2018 Aaron Kirkham <aaron@kirkh.am>
 * Released under the MIT License.
 */
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.VueGamepad = factory());
}(this, (function () { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function set$1(obj, keys, value) {
    obj[keys[0]] = obj[keys[0]] || {};
    var tmp = obj[keys[0]];
    if (keys.length > 1) {
      keys.shift();
      set$1(tmp, keys, value);
    } else {
      obj[keys[0]] = value;
    }
    return obj;
  }
  function get(obj, keys) {
    var def = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;
    var tmp = obj[keys[0]];
    if (keys.length > 1 && tmp) {
      keys.shift();
      return get(tmp, keys) || def;
    }
    return tmp || def;
  }

  var ButtonNames = ['button-a', 'button-b', 'button-x', 'button-y', 'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right', 'button-select', 'button-start', 'left-stick-in', 'right-stick-in', 'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right', 'vendor'];
  function getAxisName(axis, value) {
    var threshold = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
    if (value >= threshold) {
      if (axis === 0) return 'left-analog-right';else if (axis === 1) return 'left-analog-down';else if (axis === 2) return 'right-analog-right';else if (axis === 3) return 'right-analog-down';
    } else if (value <= -threshold) {
      if (axis === 0) return 'left-analog-left';else if (axis === 1) return 'left-analog-up';else if (axis === 2) return 'right-analog-left';else if (axis === 3) return 'right-analog-up';
    }
    return undefined;
  }

  function GamepadFactory (Vue) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    return (
      function () {
        function Gamepad() {
          _classCallCheck(this, Gamepad);
          this.holding = {};
          this.events = {};
          this.layer = 0;
          this.layers = {};
          window.addEventListener('gamepadconnected', this.padConnected.bind(this));
          window.addEventListener('gamepaddisconnected', this.padDisconnected.bind(this));
          this.animationFrame = requestAnimationFrame(this.run.bind(this));
        }
        _createClass(Gamepad, [{
          key: "padConnected",
          value: function padConnected(event) {
            document.body.classList.add('gamepad-connected');
          }
        }, {
          key: "padDisconnected",
          value: function padDisconnected(event) {
            if (this.getGamepads().length === 0) {
              document.body.classList.remove('gamepad-connected');
            }
          }
        }, {
          key: "addListener",
          value: function addListener(event, modifiers, callback) {
            var vnode = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : null;
            var action = modifiers.released ? 'released' : 'pressed';
            var repeat = !!modifiers.repeat;
            this.debug("listening for '".concat(event, "' '").concat(action, "' (repeat? ").concat(repeat, ") on layer ").concat(this.layer, "..."));
            var events = get(this.events, [this.layer, action, event], []);
            if (events.length === 0) {
              set$1(this.events, [this.layer, action, event], []);
            }
            this.events[this.layer][action][event].push({
              vnode: vnode,
              repeat: repeat,
              callback: callback
            });
            if (options.injectClasses && vnode && vnode.elm) {
              vnode.elm.classList.add('v-gamepad', "v-gamepad--".concat(event));
            }
          }
        }, {
          key: "removeListener",
          value: function removeListener(event, modifiers, callback) {
            var action = modifiers.released ? 'released' : 'pressed';
            this.debug("removing listener for '".concat(event, "' '").concat(action, "' on layer ").concat(this.layer, "..."));
            var events = get(this.events, [this.layer, action, event], []);
            if (events.length > 0) {
              events = events.filter(function (event) {
                return event.callback !== callback;
              });
              if (events.length > 0) {
                set$1(this.events, [this.layer, action, event], events);
              } else {
                delete this.events[this.layer][action][event];
              }
            }
          }
        }, {
          key: "switchToLayer",
          value: function switchToLayer(layer) {
            if (this.layer != layer) {
              this.layers[layer] = this.layer;
              this.layer = layer;
              this.debug("switched to layer ".concat(this.layer, "."));
            }
          }
        }, {
          key: "removeLayer",
          value: function removeLayer(layer) {
            this.layer = this.layers[layer];
            delete this.layers[layer];
            delete this.events[layer];
            this.debug("switched back to layer ".concat(this.layer, "."));
          }
        }, {
          key: "run",
          value: function run() {
            var _this = this;
            this.getGamepads().forEach(function (pad) {
              pad.buttons.forEach(function (button, index) {
                var name = options.buttonNames[index];
                if (button.pressed) {
                  var now = Date.now();
                  var events = get(_this.events, [_this.layer, 'pressed', name], []);
                  if (events.length > 0) {
                    var event = events[events.length - 1];
                    if (typeof _this.holding[name] === 'undefined' || event.repeat && now - _this.holding[name] >= options.buttonRepeatTimeout) {
                      _this.holding[name] = now;
                      event.callback.call();
                    }
                  }
                }
                else if (!button.pressed && typeof _this.holding[name] !== 'undefined') {
                    delete _this.holding[name];
                    var _events = get(_this.events, [_this.layer, 'released', name], []);
                    if (_events.length > 0) {
                      var _event = _events[_events.length - 1];
                      _event.callback.call();
                    }
                  }
              });
              pad.axes.forEach(function (value, index) {
                if (value >= options.analogThreshold || value <= -options.analogThreshold) {
                  var name = getAxisName(index, value, options.analogThreshold);
                  var events = get(_this.events, [_this.layer, 'pressed', name], []);
                  if (events.length > 0) {
                    var event = events[events.length - 1];
                    var now = Date.now();
                    if (typeof _this.holding[name] === 'undefined' || event.repeat && now - _this.holding[name] >= options.buttonRepeatTimeout) {
                      _this.holding[name] = now;
                      event.callback.call();
                    }
                  }
                }
              });
            });
            this.animationFrame = requestAnimationFrame(this.run.bind(this));
          }
        }, {
          key: "getGamepads",
          value: function getGamepads() {
            return Array.from(navigator.getGamepads()).filter(function (pad) {
              return pad !== null;
            });
          }
        }, {
          key: "isValidBinding",
          value: function isValidBinding(binding) {
            return typeof binding.arg !== 'undefined' && (typeof binding.value === 'function' || typeof binding.value === 'undefined' && typeof binding.expression === 'undefined');
          }
        }, {
          key: "debug",
          value: function debug() {
            if (!options.silent) {
              var _console;
              for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
                args[_key] = arguments[_key];
              }
              (_console = console).log.apply(_console, ['%cvue-gamepad', 'background:#fc0;color:#000'].concat(args));
            }
          }
        }, {
          key: "error",
          value: function error() {
            var _console2;
            for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
              args[_key2] = arguments[_key2];
            }
            (_console2 = console).error.apply(_console2, ['%cvue-gamepad', 'background:#fc0;color:#000'].concat(args));
          }
        }]);
        return Gamepad;
      }()
    );
  }

  var index = {
    install: function install(Vue) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      if (!('getGamepads' in navigator)) {
        console.error("vue-gamepad: your browser does not support the Gamepad API!");
        return false;
      }
      var DefaultOptions = {
        analogThreshold: 0.5,
        buttonNames: ButtonNames,
        buttonRepeatTimeout: 200,
        injectClasses: true,
        silent: true
      };
      var Gamepad = GamepadFactory(Vue, _objectSpread({}, DefaultOptions, options));
      var gamepad = new Gamepad();
      Vue.prototype.$gamepad = gamepad;
      Vue.directive('gamepad', {
        bind: function bind(el, binding, vnode) {
          if (gamepad.isValidBinding(binding)) {
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.addListener(binding.arg, binding.modifiers, callback, vnode);
          } else {
            gamepad.error("invalid binding. '".concat(binding.arg, "' was not bound."));
          }
        },
        unbind: function unbind(el, binding, vnode) {
          if (gamepad.isValidBinding(binding)) {
            var callback = typeof binding.value !== 'undefined' ? binding.value : vnode.data.on.click;
            gamepad.removeListener(binding.arg, binding.modifiers, callback);
          } else {
            gamepad.error("invalid binding. '".concat(binding.arg, "' was not unbound."));
          }
        }
      });
      Vue.directive('gamepad-layer', {
        bind: function bind(el, binding, vnode) {
          return gamepad.switchToLayer(binding.value);
        },
        unbind: function unbind(el, binding) {
          return gamepad.removeLayer(binding.value);
        }
      });
    }
  };

  return index;

})));
//# sourceMappingURL=vue-gamepad.js.map
