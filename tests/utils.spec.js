const utils = require('../lib/utils');

describe('Utils', () => {
  describe('set', () => {
    it('should build the nested object properties', () => {
      const obj = {};
      utils.set(obj, ['x', 'y', 'z'], { key: 'value' });
      expect(obj.x.y.z.key).toEqual('value');
    })
  })

  describe('get', () => {
    it('should return an empty array', () => {
      expect(utils.get({}, ['a', 'b', 'c'], [])).toHaveLength(0);
    })
  })
})