const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const { performance } = require('perf_hooks');

async function build() {
  try {
    const start = performance.now();

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

    const took = Math.floor(performance.now() - start) + 'ms';
    const size = (code.length / 1024).toFixed(2) + 'kb';

    console.log(`Built in ${took}, size=${size}.`);
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