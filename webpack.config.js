const path = require('path');

module.exports = {
  entry: './src/index.js',
  output: {
    publicPath: '/bundle/',
    path: path.resolve(__dirname, 'dist'),
    filename: 'index.js'
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        query: {
            presets: ['env', 'es2015', 'stage-2']
        }
      }
    ]
  },
  stats: {
    colors: true
  },
  devtool: 'source-map'
};
