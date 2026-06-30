const path = require("path");

/**
 * Configuração do Metro (bundler do React Native) da aplicação móvel.
 * Mapeia os alias de importação para as respetivas pastas via `extraNodeModules`, define o
 * caminho dos `node_modules` e inclui a pasta `../commons` em `watchFolders` para o código
 * partilhado ser vigiado em modo de desenvolvimento.
 * O Metro faz o bundle do código.
 */
module.exports = {
  resolver: {
    extraNodeModules: {
      "@commons": path.resolve(__dirname, "../commons"),
      "@components": path.resolve(__dirname, "./components"),
      "@contexts": path.resolve(__dirname, "./contexts"),
      "@hooks": path.resolve(__dirname, "./hooks"),
      "@infrastructure": path.resolve(__dirname, "./infrastructure"),
      "@utils": path.resolve(__dirname, "./utils"),
    },
    nodeModulesPaths: [path.resolve(__dirname, "node_modules")],
  },
  watchFolders: [path.resolve(__dirname, "../commons")],
};
