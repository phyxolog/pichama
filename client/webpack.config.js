var path = require('path')
var webpack = require('webpack')
var autoprefixer = require('autoprefixer')
var ExtractTextPlugin = require('extract-text-webpack-plugin')
var HtmlWebpackPlugin = require('html-webpack-plugin')

var config = {
  entry: {
    app: path.resolve(__dirname, 'app/index.js'),
    vendor: [
      'axios',
      'classnames',
      'cookie_js',
      'lodash',
      'query-string',
      'react',
      'react-dom',
      'react-helmet',
      'react-redux',
      'react-router',
      'react-router-redux',
      'redux',
      'redux-thunk'
    ]
  },
  output: {
    path: __dirname,
    filename: '/static/bundle.[hash].js'
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
        test: /\.(css)$/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss')
      },
      {
        test: /\.(scss|sass)$/,
        loader: ExtractTextPlugin.extract('style', 'css!postcss!sass')
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
          limit: 1000,
          name: '/static/[hash].[ext]'
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
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production')
      }
    }),

    new ExtractTextPlugin('/static/[hash].css'),

    // new HtmlWebpackPlugin({
    //   template: 'index.ejs',
    //   filename: 'index.tmpl.html',
    //   html: '${this.html}',
    //   extraScript: '${this.initialState}',
    //   title: '${this.title}',
    //   helmetMeta: '${this.helmetMeta}'
    // }),

    new webpack.optimize.UglifyJsPlugin({
      compress: {
        warnings: false
      },
      output: {
        comments: false
      }
    }),

    new webpack.optimize.OccurenceOrderPlugin(),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.CommonsChunkPlugin('vendor', '/static/vendor.[hash].js')
  ]
}

module.exports = config
