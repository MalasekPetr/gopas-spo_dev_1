const path = require('path');
const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

// Writes temp/webpack/build.stats.html and build.stats.json on every production build.
module.exports = function (webpackConfig) {
  const projectPath = path.join(__dirname, './../..');
  const webpackStats = path.join(projectPath, 'temp', 'webpack');

  if (!webpackConfig.plugins) {
    webpackConfig.plugins = [];
  }

  webpackConfig.plugins.push(new BundleAnalyzerPlugin({
    analyzerMode: 'static',
    openAnalyzer: false,
    generateStatsFile: true,
    reportFilename: path.join(webpackStats, 'build.stats.html'),
    statsFilename: path.join(webpackStats, 'build.stats.json'),
    logLevel: 'error'
  }));

  return webpackConfig;
};
