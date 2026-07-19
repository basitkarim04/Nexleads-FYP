module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    // react-native-reanimated v4 moved its Babel plugin into
    // react-native-worklets. This plugin must be listed LAST.
    plugins: ['react-native-worklets/plugin'],
  };
};
