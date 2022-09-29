const path = require('path');
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const { flatMap } = require('lodash');

const { toGlobalName } = require('./externals');
const pkg = require(path.join(process.cwd(), 'package.json'));

const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.NODE_ENV === 'test';

function moduleNameToPath(libName) {
  return path.resolve(__dirname, '..', 'node_modules', libName);
}

function rules() {
  return {
    js: () => ({
      test: /\.(ts|js)x?$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
        options: {
          rootMode: 'upward',
        },
      },
    }),
    css: () => [
      {
        test: /\.css$/,
        include: ['ol'].map(moduleNameToPath),
        use: ['to-string-loader', 'css-loader'],
      },
    ],
    svg: () => ({
      test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
      exclude: [/node_modules/],
      use: [
        {
          loader: 'babel-loader',
          options: {
            rootMode: 'upward',
          },
        },
        {
          loader: 'react-svg-loader',
          options: {
            jsx: true, // true outputs JSX tags
          },
        },
      ],
    }),
  };
}

function plugins() {
  return {
    ignoreEsprima: () => new webpack.IgnorePlugin(/^esprima$/, /js-yaml/),
    ignoreMomentOptionalDeps: () => new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
    friendlyErrors: () => new FriendlyErrorsWebpackPlugin(),
  };
}

function stats() {
  if (isProduction) {
    return {
      builtAt: false,
      chunks: false,
      colors: true,
      entrypoints: false,
      errorDetails: false,
      hash: false,
      modules: false,
      timings: false,
      version: false,
      warnings: false,
    };
  }
  return {
    all: false,
  };
}

const umdPath = path.resolve(process.cwd(), 'dist');
const umdDirPath = path.resolve(process.cwd(), 'dist/umd');
const cjsPath = path.resolve(process.cwd(), 'dist/cjs');

function targetOutputs() {
  console.info(`Building [${pkg.name}, library: ${toGlobalName(pkg.name)}]`);
  return {
    umd: {
      path: umdPath,
      filename: `${pkg.name}.js`,
      library: toGlobalName(pkg.name),
      libraryTarget: 'umd',
      libraryExport: toGlobalName(pkg.name),
      umdNamedDefine: true,
      globalObject: 'window',
    },
    umddir: {
      path: umdDirPath,
      filename: `index.js`,
      library: toGlobalName(pkg.name),
      libraryTarget: 'umd',
      libraryExport: toGlobalName(pkg.name),
      umdNamedDefine: true,
      globalObject: 'window',
    },
    cjs: {
      path: cjsPath,
      filename: 'index.js',
      library: toGlobalName(pkg.name),
      libraryTarget: 'window',
    },
  };
}

/**
 * Use [getConfig({ target:'umd' }), getConfig({ target:'cjs' })] for
 *  getting multiple configs and add the new output in targetOutputs if needed.
 * Default: umd
 */
function baseConfig({ target = isProduction ? 'umd' : 'umddir' } = {}) {
  return {
    context: process.cwd(),
    mode: isProduction ? 'production' : 'development',
    entry: './src',
    output: targetOutputs()[target],
    module: {
      rules: flatMap(Object.values(rules()), rule => rule()),
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      alias: {
        moment$: 'moment/moment.js',
        'react-dom': '@hot-loader/react-dom',
      },
    },
    plugins: Object.values(plugins()).map(plugin => plugin()),
    devtool: isTest ? '' : 'source-map',
    target: 'web',
    stats: stats(),
  };
}

function getConfig({ baseOnly = false } = {}) {
  if (baseOnly) {
    // netlify-cms build
    return baseConfig({ target: 'umd' });
  }
  return [baseConfig({ target: 'umd' })];
}

module.exports = {
  getConfig,
  rules: rules(),
  plugins: plugins(),
};
