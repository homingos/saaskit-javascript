const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const pkg = require('./package.json');

module.exports = {
  entry: {
    'saasSdk': './src/index.ts',
    'saasSdk.min': './src/index.ts'
  },
  output: {
    path: path.resolve('./dist'),
    filename: '[name].js',
    libraryTarget: 'umd',
    globalObject: "typeof self !== 'undefined' ? self : this"
  },
  externals: []
    .concat(Object.keys(pkg.peerDependencies || {}))
    .concat(Object.keys(pkg.dependencies || {}))
    .concat(Object.keys(pkg.devDependencies || {})),
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        loader: "babel-loader",
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        include: /\.min\.js$/
      })
    ]
  }
};
