const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const autoprefixer = require('autoprefixer');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');
const styleLintWebpackPlugin = require('stylelint-webpack-plugin');

const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

/**
 * Для автоматической компиляции pug
 */
function generateHtmlPlugins(templateDir) {
  // Read files in template directory
  const templateFiles = fs.readdirSync(path.resolve(__dirname, templateDir));
  return templateFiles.map((item) => {
    // Split names and extension
    const parts = item.split('.');
    const name = parts[0];
    const extension = parts[1];

    // const filename = name === 'index' ? `${name}.html` : `${name}/index.html`;
    // Create new HTMLWebpackPlugin with options
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.resolve(__dirname, `${templateDir}/${name}.${extension}`),
      minify: {
        collapseWhitespace: false,
      },
    });
  });
}

const PugToHTMLPlugin = generateHtmlPlugins('./src/assets/pug/pages');

const fileLoader = {
  loader: 'file-loader',
  options: {
    name: '[path]/[name].[ext]',
  },
};

const optimization = () => {
  const config = {};

  if (isProd) {
    config.minimizer = [
      new OptimizeCssAssetsPlugin({
        cssProcessor: require('cssnano'),
        cssProcessorPluginOptions: {
          preset: [
            'default',
            {
              discardComments: {
                removeAll: true,
              },
            },
          ],
        },
      }),
      new TerserPlugin(),
    ];
  }

  return config;
};

module.exports = {
  mode: 'development',
  devtool: 'source-map',
  entry: [
    // '@babel/polyfill', // Временно отключил, чтобы не увеличивать размер файла
    // 'whatwg-fetch', // Временно отключил, чтобы не увеличивать размер файла
    './src/index.js'
  ],
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
    alias: {
      // На случай, если придется прописывать длинные пути
      '@scripts': path.resolve(__dirname, './src/assets/scripts/'),
      '@styles': path.resolve(__dirname, './src/assets/styles/'),
      '@img': path.resolve(__dirname, './src/assets/media/img/'),
      '@files': path.resolve(__dirname, './src/assets/files/'),
      '@fonts': path.resolve(__dirname, './src/assets/media/fonts/'),
    },
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
  },
  plugins: [
    new ImageMinimizerPlugin({
      minimizerOptions: {
        plugins: [
          ['gifsicle',
            {
              interlaced: true
            }],
          ['mozjpeg',
            {
              quality: 80
            }],
          ['pngquant',
            {
              quality: [0.6, 0.8],
            },],
          [
            'svgo',
            {
              plugins: [
                {
                  removeViewBox: false,
                },
              ],
            },
          ],
        ],
      },
    }),
    new MiniCssExtractPlugin({
      filename: '[name].min.css',
    }),
    new CleanWebpackPlugin(),
    new webpack.LoaderOptionsPlugin({
      options: {
        postcss: [autoprefixer()],
      },
    }),
    new styleLintWebpackPlugin({
      configFile: 'stylelint.config.js',
      files: 'src/**/*.(css|scss|sass)',
      fix: true
    }),
  ].concat(PugToHTMLPlugin),
  module: {
    rules: [
      {
        test: /.(js|jsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      {
        test: /\.pug$/,
        loader: 'pug-loader',
        options: {
          pretty: true,
        },
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
        test: /\.(png|jpe?g|gif|webp|svg)$/i,
        use: [
          fileLoader,
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
      {
        test: /\.json$/,
        type: 'javascript/auto',
        use: [fileLoader],
      },
      {
        test: /\.(ts|tsx)$/,
        loader: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-typescript'],
            plugins: [
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-transform-classes',
            ],
          },
        },
      },
    ],
  },
};
