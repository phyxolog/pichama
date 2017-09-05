var path = require('path')
var webpack = require('webpack')
var autoprefixer = require('autoprefixer')

var config = {
  entry: path.resolve(__dirname, 'app/index.js'),
  output: {
    path: __dirname,
    filename: 'bundle.js'
  },
  devtool: 'eval-source-map',
  devServer: {
    historyApiFallback: true,
    proxy: {
      '/api': {
        target: 'http://localhost:4000/',
        secure: false
      },
      '/assets': {
        target: 'http://localhost:4000/',
        secure: false
      }
    }
  },
  module: {
    loaders: [
      {
        test: /\.(jsx|js)$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015', 'react']
        }
      },
      {
        test: /\.(scss|sass)$/,
        loaders: ['style', 'css', 'postcss', 'sass']
      },
      {
        test: /\.(css)$/,
        loaders: ['style', 'css', 'postcss']
      },
      {
        test: /\.svg$/,
        include: [path.resolve(__dirname, 'app', 'images')],
        exclude: [path.resolve(__dirname, 'app', 'images', 'static')],
        loader: 'svg-inline'
      },
      {
        test: /\.(svg|woff|png)$/,
        include: [
          path.resolve(__dirname, 'app', 'images', 'static'),
          path.resolve(__dirname, 'app', 'fonts')
        ],
        loader: 'url',
        query: {
          limit: 100000
        }
      },
      {
        test: /\.json$/,
        loader: 'json'
      }
    ]
  },
  postcss() {
    return [autoprefixer({browsers: '> 1%'})];
  },
  resolve: {
    root: [
      path.resolve('./app')
    ],
    extensions: ['', '.js', '.jsx', '.scss', '.sass']
  },

  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ]
}

module.exports = config
