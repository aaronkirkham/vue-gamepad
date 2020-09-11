const path = require('path');
const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const cleanup = require('rollup-plugin-cleanup');
const terser = require('rollup-plugin-terser').terser;
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
 */`;

async function build({ minify = false } = {}) {
  const filename = `${pkg.name}.${minify ? 'min.' : ''}js`;

  const terserOpts = {
    compress: true,
    mangle: true,
  };

  try {
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, './src/index.ts'),
      plugins: [
        typescript(),
        cleanup({ comments: 'none' }),
        ...minify ? [terser(terserOpts)] : [],
      ]
    });

    await bundle.write({
      file: `./dist/${filename}`,
      format: 'umd',
      name: 'VueGamepad',
      banner,
    });

    console.log(`Built '${filename}'.`);
  } catch (e) {
    console.error(`Failed to build '${filename}'!`);
    console.error(e.message);
  }
}

build();
build({ minify: true });