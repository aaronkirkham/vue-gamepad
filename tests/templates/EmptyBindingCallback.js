export default {
  template: `
    <div>
      <h1>{{ text }}</h1>
      <button v-gamepad:button-a @click="click">Hello</button>
    </div>`,
  data: () => ({
    text: 'not pressed',
  }),
  methods: {
    click() {
      this.text = 'pressed';
    },
  },
}