const path = require('path');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const fileLoader = {
  loader: 'file-loader',
  options: {
    name: '[path]/[name].[ext]',
  }
};

const optimization = () => {
  const config = {};

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsPlugin(),
      new TerserPlugin(),
    ];
  }

  return config;
};

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'project.min.js',
  },
  devServer: {
    contentBase: path.join(__dirname, 'dist'),
    compress: true,
    port: 4100,
  },
  optimization: optimization(),
  resolve: {
    alias: { // На случай, если придется прописывать длинные пути
      '@scripts': path.resolve(__dirname, 'src/assets/scripts/'),
      '@styles': path.resolve(__dirname, 'src/assets/styles/'),
      '@img': path.resolve(__dirname, 'src/assets/media/img/'),
      '@files': path.resolve(__dirname, 'src/assets/media/files/'),
    }
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
    }),
    new CleanWebpackPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [autoprefixer()],
      },
    }),
    new HtmlWebpackPlugin({
      template: 'index.html',
      minify: false,
    }),
  ],
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          'css-loader?url=false',
          'postcss-loader',
        ],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          {
            loader: MiniCssExtractPlugin.loader,
            options: {},
          },
          'css-loader',
          'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.(png|jpe?g|gif|webp|svg|)$/i,
        use: [
          fileLoader,
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 80,
              }, // optipng.enabled: false will disable optipng
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [
                  0.9,
                  1,
                ],
                speed: 10,
              },
              gifsicle: {
                interlaced: false,
              }, // the webp option will enable WEBP
              webp: {
                quality: 75,
              },
            },
          },
        ],
      },
      {
        test: /\.(ttf|woff|woff2|eot|otf)$/i,
        use: [fileLoader],
      },
      {
        test: /\.(pdf)$/i,
        use: [fileLoader],
      },
    ],
  },
};
