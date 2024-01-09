// webpack.config.js
const path = require('path');
const mode = process.env.NODE_ENV || 'development';

module.exports = {
  mode: mode,
  entry: './test/browsertest.ts',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
        
      },
      {
        test: /\.html$/i,
        loader: 'html-loader',
      }
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.html'],
  },
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'demo'),
  },
  devServer: {
    static: {
      directory: path.resolve(__dirname),
    },
    compress: true,
    // hot: true,
    liveReload: true,
    watchFiles: ['src/**/*', 'test/browsertest.ts', 'demo/index.html'],
    port: 9000,
    open: true,
    static:{
      directory: path.join(__dirname, 'demo'),
    }
  },
};