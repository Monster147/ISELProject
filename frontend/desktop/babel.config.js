/**
 * Configuração do Babel para a versão *desktop*.
 * Usa o preset `babel-preset-expo` e o plugin `module-resolver` para resolver os alias de
 * importação (@commons, @components, @contexts, @hooks, @infrastructure, @utils).
 * O Babel transpila o código TypeScript para JavaScript.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      [
        "module-resolver",
        {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
          alias: {
            "@commons": "../commons",
            "@components": "./components",
            "@contexts": "./contexts",
            "@hooks": "./hooks",
            "@infrastructure": "./infrastructure",
            "@utils": "./utils",
          },
        },
      ],
    ],
  };
};
