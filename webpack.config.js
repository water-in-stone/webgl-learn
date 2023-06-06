const fs = require('fs');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

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
      return new HtmlWebpackPlugin({
        inject: true,
        template: path.resolve(publicPath, 'index.html'),
        filename: `${page}.html`,
        chunks: [page],
      });
    })
  ),
};
