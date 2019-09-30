const path = require('path');

module.exports = {
  entry: {
    background: './src/js/background',
    content: './src/js/content',
    devTools: './src/js/devTools',
    options: './src/js/options',
    popup: './src/js/popup',
    fontAwesomeKit: './src/js/fontAwesomeKit',
    'materialize.min': './src/js/materialize.min'
  },
  output: {
    filename: './js/[name].js'
  },
  resolve: {
    modules: [path.join(__dirname, 'src'), 'node_modules']
  },
  module: {
    rules: [{
      test: /\.js$/,
      loaders: ['babel-loader'],
      include: path.resolve(__dirname, '../src/js')
    }]
  }
};
