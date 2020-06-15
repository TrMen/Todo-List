const path = require('path');

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader', // Note that this requires babel to be installed with: npm install @babel/core @babel/preset-env babel-loader --save-dev
          options: {
            presets: ['@babel/preset-env'],
          },
        },
      },
    ],
  },
};
