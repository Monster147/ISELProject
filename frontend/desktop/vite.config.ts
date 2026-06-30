import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { API_URL } from "../commons/constants/apiurl";
import { isDev } from "./src/electron/utils"

/**
 * Configuração para a adaptação do `react-native` para `react-native-web`, e outras bibliotecas
 * que podem ter problemas de resolução de dependências em produção, como `i18next`, `react` e `react-dom`.
 * A configuração é escolhida, verificando se estamos em modo de desenvolvimento ou em modo de produção.
 */
const resolveAlias = isDev() ? {
  "react-native": "react-native-web",
} : {
  "react-native": path.resolve(__dirname, "node_modules/react-native-web"),
  "i18next": path.resolve(__dirname, "node_modules/i18next"),
  "react": path.resolve(__dirname, "node_modules/react"),
  "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
}

/**
 * Configuração do Vite para a interface desktop (React + Electron).
 * Define a saída de build, o servidor de desenvolvimento (porta fixa 5123) com proxy para a API
 * (`/api`), tratamento de erros/fecho de ligação do upstream, e os alias de importação, incluindo
 * o redireccionamento de `react-native` para `react-native-web`.
 *
 * @see https://vite.dev/config/
 */
export default defineConfig({
  plugins: [react()],
  base: "./",
  build: {
    outDir: "dist-react",
  },
  server: {
    port: 5123,
    strictPort: true,
    proxy: {
      "/api": {
        target: API_URL,
        changeOrigin: true,
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
        configure: (proxy) => {
          proxy.on("error", (err, req, res) => {
            console.log("error connection upstream");
            res.writeHead(502);
            res.end();
          });
          proxy.on("proxyRes", (proxyRes, _, res) => {
            const upstreamSocket = proxyRes.socket;
            console.log("upstream connected");
            if (upstreamSocket) {
              upstreamSocket.once("close", () => {
                console.log("upstream closed");
                if (!res.writableFinished) {
                  console.log("destroying downstream");
                  res.destroy();
                }
              });
            }
          });
        },
      },
    },
  },
  resolve: {
    alias: {
      "@commons": path.resolve(__dirname, "../commons"),
      "@components": path.resolve(__dirname, "./components"),
      "@contexts": path.resolve(__dirname, "./contexts"),
      "@hooks": path.resolve(__dirname, "./hooks"),
      "@infrastructure": path.resolve(__dirname, "./infrastructure"),
      "@utils": path.resolve(__dirname, "./utils"),
      ...resolveAlias,
    },
  },
  optimizeDeps: {
    exclude: ["react-native"],
  },
});
