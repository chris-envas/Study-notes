var HtmlWebpackPlugin = require('html-webpack-plugin');
var path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'index_bundle.js',
  },
  devServer: {
    contentBase: path.resolve(__dirname, './dist'),
    open: true
  },
  plugins: [new HtmlWebpackPlugin()],
} 