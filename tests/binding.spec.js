describe('Binding', () => {
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

  // it('does not allow expressions as a callback', () => {
  //   const vm = createLocalVue();
  //   const wrapper = shallowMount({ vm, template: `<button v-gamepad:button-a="1+1"></button>` });
  //   const gamepad = wrapper.vm.$gamepad;

  //   expect(false).toBe(true);
  // })
})