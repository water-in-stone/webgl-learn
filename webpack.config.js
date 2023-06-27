const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { log } = require('console');

const publicPath = path.resolve(__dirname, 'public');
const pagePath = path.resolve(__dirname, 'src/pages');
const pages = fs.readdirSync(pagePath).map((page) => page.split('.')[0]);
const entry = pages.reduce((config, page) => {
  config[page] = `./src/pages/${page}.ts`;
  return config;
}, {});
module.exports = {
  mode: 'development',
  entry,
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
          },
        },
      },
      {
        test: /\.glsl$/,
        use: 'raw-loader',
      },
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
    },
  },
  plugins: [].concat(
    pages.map((page) => {
      // TODO 按照目录和 "/" 来进行真正的划分
      let realPath = path.resolve(publicPath, 'index.html');
      if (page.indexOf('texture') !== -1) {
        realPath = path.resolve(publicPath, 'texture/index.html');
      } else if (page.indexOf('transformation' !== -1)) {
        realPath = path.resolve(publicPath, 'transformation/index.html');
      }
      return new HtmlWebpackPlugin({
        inject: true,
        template: realPath,
        filename: `${page}.html`,
        chunks: [page],
      });
    })
  ),
};
