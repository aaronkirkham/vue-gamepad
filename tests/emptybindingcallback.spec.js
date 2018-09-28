const component = {
  template: `<button v-gamepad:button-a @click="click">{{ text }}</button>`,
  data: () => ({
    text: 'not pressed',
  }),
  methods: {
    click() {
      this.text = 'pressed';
    },
  },
};

describe('EmptyBindingCallback', () => {
  const wrapper = shallowMount(component);
  const gamepad = wrapper.vm.$gamepad;

  const button = wrapper.find('button');
  const directives = button.vnode.data.directives;
  const directive = directives.find(d => d.rawName === 'v-gamepad:button-a');

  test('directive was registered', () => {
    expect(directive).toBeDefined();
  })

  test('directive doesn\'t pass a callback', () => {
    expect(directive.value).toBeUndefined();
  })

  test('binding event was registered', () => {
    expect(gamepad.events[0]['button-a']).toHaveLength(1);
  })

  test('inherits v-on:click callback', () => {
    expect(gamepad.events[0]['button-a'][0].callback).toEqual(button.vnode.data.on.click);
  })

  test('binding callback was fired', async () => {
    gamepad.events[0]['button-a'][0].callback();
    await flushPromises();

    expect(button.text()).toEqual('pressed');
  })

  test('binding was cleaned up after component was destroyed', () => {
    wrapper.destroy();
    expect(gamepad.events[gamepad.layer]['button-a']).toEqual([]);
  })
})