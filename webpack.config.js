const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const webpack = require('webpack');
const FriendlyErrorsWebpackPlugin = require('friendly-errors-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const pkg = require('./package.json');
const { getConfig, plugins } = require('./scripts/webpack');
const baseWebpackConfig = getConfig({ baseOnly: true });

const isProduction = process.env.NODE_ENV === 'production';
console.log(`${pkg.version}${isProduction ? '' : '-dev'}`);

const devServerPort = parseInt(process.env.NETLIFY_CMS_DEV_SERVER_PORT || `${8080}`);

const baseConfig = {
  ...baseWebpackConfig,
  plugins: [
    ...Object.entries(plugins)
      .filter(([key]) => key !== 'friendlyErrors')
      .map(([, plugin]) => plugin()),
    new webpack.DefinePlugin({
      NETLIFY_CMS_VERSION: JSON.stringify(`${pkg.version}${isProduction ? '' : '-dev'}`),
    }),
    new FriendlyErrorsWebpackPlugin({
      compilationSuccessInfo: {
        messages: [`Netlify CMS is now running at http://localhost:${devServerPort}`],
      },
    }),
    new CopyWebpackPlugin({ patterns: [{ from: './shims/cms.css', to: './' }] }),
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    }),
  ],
  devServer: {
    hot: true,
    static: [
      {
        directory: '../../dev-test',
      },
      {
        directory: 'dist/',
        publicPath: '/dist',
        watch: true
      },
    ],
    host: '0.0.0.0',
    port: devServerPort,
  },
  resolve: {
    fallback: {
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify'),
      buffer: require.resolve('buffer'),
    },
  },
};

if (isProduction) {
  module.exports = [
    baseConfig,

    /**
     * Output the same script a second time, but named `cms.js`, and with a
     * deprecation notice.
     */
    {
      ...baseConfig,
      entry: ['./shims/deprecate-old-dist.js', baseConfig.entry],
      output: {
        ...baseConfig.output,
        filename: 'cms.js',
      },
    },
  ];
} else {
  module.exports = baseConfig;
}
