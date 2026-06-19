const path = require("path");

module.exports = {
  resolver: {
    extraNodeModules: {
      "@commons": path.resolve(__dirname, "../commons"),
      "@components" : path.resolve(__dirname, "./components"),
      "@contexts": path.resolve(__dirname, "./contexts"),
      "@hooks": path.resolve(__dirname, "./hooks"),
      "@infrastructure": path.resolve(__dirname, "./infrastructure"),
      "@utils" : path.resolve(__dirname, "./utils"),
    },
  },
  watchFolders: [path.resolve(__dirname, "../commons")],
};
