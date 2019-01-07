const path = require('path');
const rollup = require('rollup');
const babel = require('rollup-plugin-babel');
const cleanup = require('rollup-plugin-cleanup');
const uglify = require('rollup-plugin-uglify');
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
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

    await bundle.write({
      file: `./dist/${filename}`,
      format: 'umd',
      name: 'VueGamepad',
      sourcemap: true,
      banner,
    });

    console.log(`🎉  Built '${filename}'`);
  } catch (error) {
    console.error(`😭  Failed to build! Error: ${error.message}`);
  }
}

build();
build(true);
