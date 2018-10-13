import { shallowMount } from '@vue/test-utils';

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

  it('created history of the previous layer', () => {
    expect(gamepad.layers).toEqual({ '1': 0 });
  })

  it('switched to the correct layer', () => {
    expect(gamepad.layer).toBe(1);
  })

  // it('highest layer has callback priority', async () => {
  //   gamepad.events[gamepad.layer]['button-a'][0].callback();
  //   await flushPromises();

  //   expect(wrapper.vm.happened).toBe(false);
  // })

  it('switched to the new layer', () => {
    gamepad.switchToLayer(1337);
    console.log(gamepad);
    expect(gamepad.layer).toBe(1337);
  })

  it('removed the layer', () => {
    gamepad.removeLayer(1337);
    expect(gamepad.layer).toBe(1);
  })
})