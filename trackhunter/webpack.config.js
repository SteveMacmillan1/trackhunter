const path = require('path');

module.exports = {
  entry: './src/main.ts',

  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },

  resolve: {
    alias: {
      jquery: 'jquery/dist/jquery.slim.min.js',
    },
  },

  module: {
    rules: [
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: {
              exposes: ['$', 'jQuery'],
            },
          },
        ],
      },
    ],
  },
  optimization: {
    usedExports: true,
  },
};
