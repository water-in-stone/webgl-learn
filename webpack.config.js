const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  mode: 'development',
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', "@babel/preset-typescript"]
          }
        }
      },
      {
        test: /\.glsl$/,
        use: 'raw-loader'
      }
    ]
  },
  plugins: [new HtmlWebpackPlugin({
    template: './public/index.html'
  })],
};