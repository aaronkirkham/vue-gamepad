const component = {
  template: `
    <div v-gamepad:button-a="should_not_happen">
      <button v-gamepad-layer="1" v-gamepad:button-a="should_happen"></button>
    </div>`,
  data: () => ({
    happened: false,
  }),
  methods: {
    should_not_happen() {
      this.happened = true;
    },
    should_happen() {
    },
  },
};

describe('Layers', () => {
  const wrapper = shallowMount(component);
  const gamepad = wrapper.vm.$gamepad;

  test('layer history was created', () => {
    expect(gamepad.layers).toEqual({ '1': 0 });
  })

  test('on the correct layer', () => {
    expect(gamepad.layer).toBe(1);
  })

  test('highest layer has callback priority', async () => {
    gamepad.events[gamepad.layer]['button-a'][0].callback();
    await flushPromises();

    expect(wrapper.vm.happened).toBe(false);
  })

  test('switchToLayer', () => {
    gamepad.switchToLayer(1337);
    console.log(gamepad);
    expect(gamepad.layer).toBe(1337);
  })

  test('removeLayer', () => {
    gamepad.removeLayer(1337);
    expect(gamepad.layer).toBe(1);
  })
})