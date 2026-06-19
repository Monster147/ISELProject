const path = require("path");

module.exports = {
  resolver: {
    extraNodeModules: {
      "@common": path.resolve(__dirname, "../commons"),
    },
    nodeModulesPaths: [path.resolve(__dirname, "node_modules")],
  },
  watchFolders: [path.resolve(__dirname, "../commons")],
};
