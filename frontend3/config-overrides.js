const path = require('path');

module.exports = {
  webpack: (config, env) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'three/examples/js/controls/OrbitControls': path.resolve(
        __dirname,
        'node_modules/three/examples/js/controls/OrbitControls.js'
      ),
    };
    return config;
  }
};
