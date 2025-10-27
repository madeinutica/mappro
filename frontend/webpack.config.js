const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'],
          },
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'postcss-loader',
            options: {
              postcssOptions: {
                plugins: [
                  require('tailwindcss'),
                  require('autoprefixer'),
                ],
              },
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },
  optimization: {
    minimize: false,
  },
  plugins: [
    new webpack.DefinePlugin({
      SUPABASE_URL: JSON.stringify(process.env.REACT_APP_SUPABASE_URL || 'https://fvrueabzpinhlzyrnhne.supabase.co'),
      SUPABASE_ANON_KEY: JSON.stringify(process.env.REACT_APP_SUPABASE_ANON_KEY || ''),
    }),
    new CopyPlugin({
      patterns: [
        { from: 'public', to: '' },
      ],
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3010,
    host: '127.0.0.1', // Use 127.0.0.1 instead of localhost for better Chrome compatibility
    hot: true,
    client: {
      overlay: false, // Disable error overlay to reduce console noise
    },
    server: 'http', // Explicitly set to http to avoid WebSocket issues
    allowedHosts: ['localhost', '127.0.0.1'], // Allow both localhost and 127.0.0.1
  },
};
