const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './src/global.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js']
  },
  output: {
    path: path.resolve(__dirname, 'public/dist'),
    filename: 'bundle.js',
    clean: true // Clean the output directory before build
  },
  plugins: [
    new webpack.ProvidePlugin({
      App: path.resolve(path.join(__dirname, 'src/global.ts'))
    })
  ],
  watchOptions: {
    poll: true,
    ignored: /node_modules/
  }
}
