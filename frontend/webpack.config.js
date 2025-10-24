const path = require('path');
const webpack = require('webpack');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

module.exports = {
  entry: path.resolve(__dirname, 'index.js'),
  output: {
    path: path.resolve(__dirname, 'dist'),
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
  plugins: [
    new webpack.DefinePlugin({
      SUPABASE_URL: JSON.stringify(process.env.REACT_APP_SUPABASE_URL || 'https://fvrueabzpinhlzyrnhne.supabase.co'),
      SUPABASE_ANON_KEY: JSON.stringify(process.env.REACT_APP_SUPABASE_ANON_KEY || ''),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3010,
    historyApiFallback: true,
    // During local development Chrome DevTools may attempt to fetch
    // /.well-known/appspecific/com.chrome.devtools.json which can be
    // blocked by a strict Content Security Policy. Add a development-only
    // CSP header that explicitly allows connections to the local dev server
    // and to the Supabase origin configured in `frontend/.env` as well as
    // Mapbox assets and data: URIs used for inline images.
    headers: (() => {
      const supabaseRaw = process.env.REACT_APP_SUPABASE_URL || '';
      let supabaseOrigin = '';
      try {
        supabaseOrigin = supabaseRaw ? new URL(supabaseRaw).origin : '';
      } catch (e) {
        // If parsing fails, fall back to the raw value (best-effort for dev)
        supabaseOrigin = supabaseRaw;
      }
      // Build connect-src list
      const connectSrc = ["'self'", 'http://localhost:3010', 'ws://localhost:3010', 'http://localhost:7777', 'https://api.mapbox.com', 'https://events.mapbox.com'];
      if (supabaseOrigin) connectSrc.push(supabaseOrigin);

      // Build img-src list
      const imgSrc = ["'self'", 'data:', 'https://api.mapbox.com'];
      if (supabaseOrigin) imgSrc.push(supabaseOrigin);

      const csp = [
        `default-src 'self'`,
        `connect-src ${connectSrc.join(' ')}`,
        `script-src 'self' 'unsafe-eval' 'unsafe-inline'`,
        `worker-src blob:`,
        `style-src 'self' 'unsafe-inline' https://api.mapbox.com`,
        `img-src ${imgSrc.join(' ')}`,
      ].join('; ');
      return { 'Content-Security-Policy': csp };
    })(),
  },
};
