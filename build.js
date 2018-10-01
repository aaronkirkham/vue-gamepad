const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const uglify = require('uglify-js');

async function minify(input) {
  const { code, map } = uglify.minify(input, {
    sourceMap: {
      filename: 'vue-gamepad.min.js.map',
      url: 'vue-gamepad.min.js.map',
    },
  });

  await write(path.resolve(__dirname, 'dist/vue-gamepad.min.js'), code);
  await write(path.resolve(__dirname, 'dist/vue-gamepad-min.js.map'), map);

  return code.length;
}

async function build() {
  try {
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, 'lib/index.js'),
      plugins: [
        babel(),
      ],
    });

    const { code, map } = await bundle.generate({
      format: 'umd',
      name: 'VueGamepad',
      sourcemap: true,
      sourcemapFile: 'dist/vue-gamepad.js.map',
    });

    await write(path.resolve(__dirname, 'dist/vue-gamepad.js'), code);
    await write(path.resolve(__dirname, 'dist/vue-gamepad.js.map'), map);

    const size = await minify(code);

    console.log(`🎉 Built. Size=${(code.length / 1024).toFixed(2)}kb, Minified=${(size / 1024).toFixed(2)}kb.`);
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