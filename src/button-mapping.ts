export const ButtonNames: Array<string> = [
  'button-a', 'button-b', 'button-x', 'button-y',
  'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right',
  'button-select', 'button-start',
  'left-stick-in', 'right-stick-in',
  'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right',
  'vendor',
];

export const PositiveAxisNames: Array<string> = [
  'left-analog-right', 'left-analog-down',
  'right-analog-right', 'right-analog-down',
];

export const NegativeAxisNames: Array<string> = [
  'left-analog-left', 'left-analog-up',
  'right-analog-left', 'right-analog-up',
];

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
