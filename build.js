const path = require('path');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');
const uglify = require('rollup-plugin-uglify');
const package = require('./package.json');

const banner = `/*!
 * ${package.name} v${package.version}
 * (c) ${new Date().getFullYear()} ${package.author}
 * Released under the ${package.license} License.
 */`;

async function build(minify = false) {
  const filename = `vue-gamepad.${minify ? 'min.' : ''}js`;

  try {
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, 'lib/index.js'),
      plugins: [
        babel(),
        cleanup(),
        // allow comments when minifying to preserve banner, comments are removed by plugin-cleanup.
        minify ? uglify.uglify({ output: { comments: true } }) : () => {},
      ],
    });

    const { code } = await bundle.write({
      file: `./dist/${filename}`,
      format: 'umd',
      name: 'VueGamepad',
      sourcemap: true,
      banner
    });

    console.log(`🎉 Built '${filename}' (${(code.length / 1024).toFixed(2)}kb)`);
  } catch (error) {
    console.error(`😭 Failed to build! Error: ${error.message}`);
  }
}

build();
build(true);