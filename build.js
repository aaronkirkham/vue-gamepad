const path = require('path');
const rollup = require('rollup');
const typescript = require('@rollup/plugin-typescript');
const cleanup = require('rollup-plugin-cleanup');
const uglify = require('rollup-plugin-uglify');
const pkg = require('./package.json');

const banner = `/*!
 * ${pkg.name} v${pkg.version}
 * (c) ${new Date().getFullYear()} ${pkg.author}
 * Released under the ${pkg.license} License.
 */`;

function nullsub() {
  return {
    name: 'nullsub',
  };
}

async function build(minify = false) {
  const filename = `${pkg.name}.${minify ? 'min.' : ''}js`;

  try {
    const bundle = await rollup.rollup({
      input: path.resolve(__dirname, './src/index.ts'),
      plugins: [
        typescript(),
        cleanup({ comments: 'none' }),
        minify ? uglify.uglify({ output: { comments: true } }) : nullsub,
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
build(true);