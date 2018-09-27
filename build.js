const fs = require('fs');
const path = require('path');
const rollup = require('rollup');

async function build() {
  try {
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, 'lib/index.js'),
      plugins: [],
    });

    const { code, map } = await bundle.generate({
      format: 'umd',
      name: 'VueGamepad',
      sourcemap: true,
    });

    await write(path.resolve(__dirname, 'dist/vue-gamepad.js'), code);
    await write(path.resolve(__dirname, 'dist/vue-gamepad.js.map'), map);

    console.log(`Built. Size=${(code.length / 1024).toFixed(2)}kb.`);
  } catch (e) {
    console.error(e);
  }
}

function write(dest, code) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, code, (err) => {
      if (err) return reject(err);
      resolve();
    });
  });
}

build();