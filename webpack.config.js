const path = require('path');
const { VueLoaderPlugin } = require('vue-loader');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { DefinePlugin } = require('webpack');

// Подкаталог публикации, например /ArbatGames/ для GitHub Pages. По умолчанию — корень домена.
const BASE_URL = (process.env.BASE_URL || '/').replace(/\/?$/, '/');

module.exports = (env, argv) => {
  const prod = argv.mode === 'production';
  return {
    entry: './src/entry-client.js',
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: prod ? '[name].[contenthash:8].js' : '[name].js',
      publicPath: BASE_URL,
      clean: true,
    },
    resolve: {
      extensions: ['.js', '.vue'],
      alias: { '@': path.resolve(__dirname, 'src') },
    },
    module: {
      rules: [
        { test: /\.vue$/, loader: 'vue-loader' },
        {
          test: /\.css$/,
          use: [
            prod ? MiniCssExtractPlugin.loader : 'style-loader',
            'css-loader',
          ],
        },
        { test: /\.(woff2?|ttf|eot|svg|png|jpe?g)$/, type: 'asset' },
      ],
    },
    plugins: [
      new VueLoaderPlugin(),
      new DefinePlugin({ 'process.env.BASE_URL': JSON.stringify(BASE_URL) }),
      new HtmlWebpackPlugin({ template: './public/index.html' }),
      // Статический хостинг (GitHub Pages) отдаёт 404.html на неизвестные пути — SPA открывается по прямой ссылке.
      new HtmlWebpackPlugin({ template: './public/index.html', filename: '404.html' }),
      ...(prod ? [new MiniCssExtractPlugin({ filename: '[name].[contenthash:8].css' })] : []),
    ],
    devServer: { historyApiFallback: { index: BASE_URL }, port: 8080, hot: true },
    performance: { hints: false },
    // vue-loader 15 реэкспортирует стили через `export *` — webpack 5 ругается на отсутствие default; стили применяются.
    ignoreWarnings: [{ message: /export 'default' \(imported as 'style\d+'\) was not found/ }],
    devtool: prod ? false : 'eval-cheap-module-source-map',
  };
};
