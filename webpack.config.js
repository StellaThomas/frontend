// webpack.config.js (partial)
const JavaScriptObfuscator = require('webpack-obfuscator');

module.exports = {
  // ... your existing config
  plugins: [
    // other plugins...
    new JavaScriptObfuscator({
      rotateStringArray: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      transformObjectKeys: true,
      // add options you need — see javascript-obfuscator docs
    }, ['excluded_bundle_name.js']) // optionally exclude some bundles
  ]
};
