describe('Binding', () => {
  it('does not allow invalid bindings', () => {
    const wrapper = shallowMount({});
    const gamepad = wrapper.vm.$gamepad;

    expect(gamepad.isValidBinding({})).toBe(false);
  })

  it('does not allow expressions as a binding callback', () => {
    const wrapper = shallowMount({});
    const gamepad = wrapper.vm.$gamepad;

    const binding = {
      arg: 'button-a',
      expression: '1 + 1',
    };

    expect(gamepad.isValidBinding(binding)).toBe(false);
  })

  it('successfully initialised the v-gamepad directive', () => {
    const vm = createLocalVue();
    const wrapper = shallowMount({ vm, template: `<button v-gamepad:button-a="click"></button>` });

    expect(wrapper.find('button').vnode.data.directives.find(d => d.rawName === 'v-gamepad:button-a')).toBeDefined();
  })

  it('inherited v-on:click callback', () => {
    const vm = createLocalVue();
    const wrapper = shallowMount({ vm, template: `<button v-gamepad:button-a @click="click"></button>` });
    const gamepad = wrapper.vm.$gamepad;

    expect(gamepad.events[0]['button-a'][0].callback).toEqual(wrapper.find('button').vnode.data.on.click);
  })
})