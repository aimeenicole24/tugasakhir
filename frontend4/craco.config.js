// craco.config.js
module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      webpackConfig.module.rules.push({
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader'],
        exclude: [
          /node_modules\/@react-three\/drei\/node_modules\/@mediapipe\/tasks-vision/  // Mengecualikan direktori ini agar tidak muncul warning source map
        ],
      });

      return webpackConfig;
    },
  },
  eslint: {
    enable: true,
    configure: {
      rules: {
        'no-unused-vars': 'warn',  // Hanya memberikan peringatan, bukan error
      },
    },
  },
};
