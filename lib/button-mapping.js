export const ButtonNames = [
  'button-a', 'button-b', 'button-x', 'button-y',
  'shoulder-left', 'shoulder-right', 'trigger-left', 'trigger-right',
  'button-select', 'button-start',
  'left-stick-in', 'right-stick-in',
  'button-dpad-up', 'button-dpad-down', 'button-dpad-left', 'button-dpad-right',
  'vendor'
];

/**
 * get name of axis from input value
 * @param {number} axis axis id
 * @param {number} value current input value
 * @param {number} [threshold=1] dead zone of the analog
 */
export function getAxisName(axis, value, threshold = 1) {
  if (value >= threshold) {
    if (axis === 0) return 'left-analog-right';
    else if (axis === 1) return 'left-analog-down';
    else if (axis === 2) return 'right-analog-right';
    else if (axis === 3) return 'right-analog-down';
  }
  else if (value <= -(threshold)) {
    if (axis === 0) return 'left-analog-left';
    else if (axis === 1) return 'left-analog-up';
    else if (axis === 2) return 'right-analog-left';
    else if (axis === 3) return 'right-analog-up';
  }

  return undefined;
}