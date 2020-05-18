/*!
 * vue-gamepad v2.0.0
 * (c) 2020 Aaron Kirkham <aaron@kirkh.am>
 * Released under the MIT License.
 */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = global || self, global.VueGamepad = factory());
}(this, (function () { 'use strict';

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };
    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    function set(obj, keys, value) {
        obj[keys[0]] = obj[keys[0]] || {};
        var tmp = obj[keys[0]];
        if (keys.length > 1) {
            keys.shift();
            set(tmp, keys, value);
        }
        else {
            obj[keys[0]] = value;
        }
        return obj;
    }
    function get(obj, keys, def) {
        if (def === void 0) { def = undefined; }
        var tmp = obj[keys[0]];
        if (keys.length > 1 && tmp) {
            keys.shift();
            return get(tmp, keys) || def;
        }
        return tmp || def;
    }

    var ButtonNames = [
        'button-a', 'button-b', 'button-x', 'button-y',
        'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right',
        'button-select', 'button-start',
        'left-stick-in', 'right-stick-in',
        'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right',
        'vendor',
    ];
    var PositiveAxisNames = [
        'left-analog-right', 'left-analog-down',
        'right-analog-right', 'right-analog-down',
    ];
    var NegativeAxisNames = [
        'left-analog-left', 'left-analog-up',
        'right-analog-left', 'right-analog-up',
    ];
    function getAxisNameFromValue(axis, value) {
        if (value > 0)
            return PositiveAxisNames[axis];
        return NegativeAxisNames[axis];
    }
    function getAxisNames(axis) {
        return [PositiveAxisNames[axis], NegativeAxisNames[axis]];
    }

    function GamepadFactory (app, options) {
        return (function () {
            function VueGamepad() {
                var _this = this;
                this.events = [];
                this.holding = {};
                this.layer = 0;
                window.addEventListener('gamepadconnected', function () {
                    document.body.classList.add('gamepad-connected');
                });
                window.addEventListener('gamepaddisconnected', function () {
                    var gamepads = _this.getGamepads();
                    if (gamepads.length === 0) {
                        document.body.classList.remove('gamepad-connected');
                    }
                });
                requestAnimationFrame(this.update.bind(this));
            }
            VueGamepad.prototype.getGamepads = function () {
                var gamepads = navigator.getGamepads();
                return __spreadArrays(gamepads).filter(function (pad) { return pad !== null; });
            };
            VueGamepad.prototype.validBinding = function (binding) {
                var hasArg = typeof binding.arg !== 'undefined';
                var isFunctionOrEmpty = (typeof binding.value === 'function' || typeof binding.value === 'undefined');
                return (hasArg && isFunctionOrEmpty);
            };
            VueGamepad.prototype.addListener = function (event, modifiers, callback, vnode) {
                var action = modifiers.released ? 'released' : 'pressed';
                var repeat = !!modifiers.repeat;
                var events = get(this.events, [this.layer, action, event], []);
                if (events.length === 0) {
                    set(this.events, [this.layer, action, event], []);
                }
                this.events[this.layer][action][event].push({ vnode: vnode, repeat: repeat, callback: callback });
                if (options.injectClasses && vnode && vnode.el) {
                    vnode.el.classList.add('v-gamepad', "v-gamepad--" + event);
                }
            };
            VueGamepad.prototype.removeListener = function (event, modifiers, callback) {
                var action = modifiers.released ? 'released' : 'pressed';
                var events = get(this.events, [this.layer, action, event], []);
                if (events.length > 0) {
                    events = events.filter(function (e) { return e.callback !== callback; });
                    if (events.length > 0) {
                        set(this.events, [this.layer, action, event], events);
                    }
                    else {
                        delete this.events[this.layer][action][event];
                    }
                }
            };
            VueGamepad.prototype.runPressedCallbacks = function (buttonName) {
                var firstPress = typeof this.holding[buttonName] === 'undefined';
                var currentTime = Date.now();
                var events = get(this.events, [this.layer, 'pressed', buttonName], []);
                if (events.length > 0) {
                    var event_1 = events[events.length - 1];
                    if (firstPress || (event_1.repeat && (currentTime - this.holding[buttonName]) >= options.buttonRepeatTimeout)) {
                        this.holding[buttonName] = currentTime;
                        if (firstPress) {
                            this.holding[buttonName] += (options.buttonInitialTimeout - options.buttonRepeatTimeout);
                        }
                        event_1.callback();
                    }
                }
            };
            VueGamepad.prototype.runReleasedCallbacks = function (buttonName) {
                delete this.holding[buttonName];
                var events = get(this.events, [this.layer, 'released', buttonName], []);
                if (events.length > 0) {
                    var event_2 = events[events.length - 1];
                    event_2.callback();
                }
            };
            VueGamepad.prototype.update = function () {
                var _this = this;
                var gamepads = this.getGamepads();
                gamepads.forEach(function (gamepad) {
                    gamepad.buttons.forEach(function (button, index) {
                        var buttonName = options.buttonNames[index];
                        if (button.pressed) {
                            _this.runPressedCallbacks(buttonName);
                        }
                        else if (typeof _this.holding[buttonName] !== 'undefined') {
                            _this.runReleasedCallbacks(buttonName);
                        }
                    });
                    gamepad.axes.forEach(function (value, index) {
                        if (value >= options.analogThreshold || value <= -(options.analogThreshold)) {
                            var axisName = getAxisNameFromValue(index, value);
                            _this.runPressedCallbacks(axisName);
                        }
                        else {
                            var axisNames = getAxisNames(index);
                            axisNames.filter(function (axisName) { return _this.holding[axisName]; })
                                .forEach(function (axisName) { return _this.runReleasedCallbacks(axisName); });
                        }
                    });
                });
                requestAnimationFrame(this.update.bind(this));
            };
            return VueGamepad;
        }());
    }

    var DEFAULT_OPTIONS = {
        analogThreshold: 0.5,
        buttonNames: ButtonNames,
        buttonRepeatTimeout: 200,
        buttonInitialTimeout: 200,
        injectClasses: true,
    };
    var index = {
        install: function (app, options) {
            if (options === void 0) { options = {}; }
            if (!('getGamepads' in navigator)) {
                return console.error('vue-gamepad: your browser does not support the Gamepad API!');
            }
            var VueGamepad = GamepadFactory(app, __assign(__assign({}, DEFAULT_OPTIONS), options));
            var gamepad = new VueGamepad();
            app.config.globalProperties.$gamepad = gamepad;
            app.directive('gamepad', {
                beforeMount: function (el, binding, vnode) {
                    var _a;
                    if (!gamepad.validBinding(binding)) {
                        return console.error("vue-gamepad: invalid binding. '" + binding.arg + "' was not bound.");
                    }
                    var callback = typeof binding.value !== 'undefined' ? binding.value : (_a = vnode === null || vnode === void 0 ? void 0 : vnode.props) === null || _a === void 0 ? void 0 : _a.onClick;
                    gamepad.addListener(binding.arg, binding.modifiers, callback, vnode);
                },
                beforeUnmount: function (el, binding, vnode) {
                    var _a;
                    if (!gamepad.validBinding(binding)) {
                        return;
                    }
                    var callback = typeof binding.value !== 'undefined' ? binding.value : (_a = vnode === null || vnode === void 0 ? void 0 : vnode.props) === null || _a === void 0 ? void 0 : _a.onClick;
                    gamepad.removeListener(binding.arg, binding.modifiers, callback);
                },
            });
        },
    };

    return index;

})));
