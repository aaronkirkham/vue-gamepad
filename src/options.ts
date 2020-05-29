// All bindable button names
export const ButtonNames = [
  'button-a', 'button-b', 'button-x', 'button-y',
  'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right',
  'button-select', 'button-start',
  'left-stick-in', 'right-stick-in',
  'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right',
  'vendor',
];

// All bindable positive axis names
export const PositiveAxisNames = [
  'left-analog-right', 'left-analog-down',
  'right-analog-right', 'right-analog-down',
];

// All bindable negative axis names
export const NegativeAxisNames = [
  'left-analog-left', 'left-analog-up',
  'right-analog-left', 'right-analog-up',
];

// Default options
export const DefaultOptions: VueGamepadOptions = {
  // Threshold before analog events are triggered. Low values may cause false positives
  analogThreshold: 0.5,

  // List of strings containing button indices
  buttonNames: ButtonNames,

  // Time (in milliseconds) until the button will start repeating when held down
  buttonInitialTimeout: 200,

  // Time (in milliseconds) between each button repeat event when held down
  buttonRepeatTimeout: 200,

  // Add classes to elements which have a gamepad binding
  injectClasses: true,

  // String which will be prefixed to all injected classes
  classPrefix: 'v-gamepad',
};

/**
 * Get name of axis from input value
 * @param {number} axis axis id
 * @param {number} value current input value
 * @return {string} string representing the axis name
 */
export function getAxisNameFromValue(axis: number, value: number): string {
  if (value > 0) return PositiveAxisNames[axis];
  return NegativeAxisNames[axis];
}

/**
 * Get the name of both position and negative names from an axis
 * @param {number} axis axis id
 * @return {array} array containing both position and negative axis names
 */
export function getAxisNames(axis: number): Array<string> {
  return [PositiveAxisNames[axis], NegativeAxisNames[axis]];
}
