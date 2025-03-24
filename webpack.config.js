const webpack = require('webpack');

module.exports = {
  plugins: [
    new webpack.WatchIgnorePlugin({
      paths: [/\.rebuilding\.lock/], // Ignore the rebuild lock file
    }),
  ],
};
