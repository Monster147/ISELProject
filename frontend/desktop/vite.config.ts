import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from "path";
import { API_URL } from '../commons/constants/apiurl';

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    base: './',
    build: {
        outDir: 'dist-react'
    },
    server: {
        port: 5123,
        strictPort: true,
        proxy: {
            '/api': {
                target: API_URL,
                changeOrigin: true,
                headers: {
                    'ngrok-skip-browser-warning': 'true',
                },
                configure: (proxy) => {
                    proxy.on("error", (err, req, res) => {
                        console.log("error connection upstream")
                        res.writeHead(502)
                        res.end()
                    })
                    proxy.on("proxyRes", (proxyRes, _, res) => {
                        const upstreamSocket = proxyRes.socket
                        console.log("upstream connected")
                        if (upstreamSocket) {
                            upstreamSocket.once('close', () => {
                                console.log("upstream closed")
                                if (!res.writableFinished) {
                                    console.log("destroying downstream")
                                    res.destroy()
                                }
                            })
                        }
                    })
                },
            }
        }
    },
    resolve: {
        alias: {
            '@commons': path.resolve(__dirname, '../commons'),
            'react-native': 'react-native-web',
        }
    },
    optimizeDeps: {
        exclude: ["react-native"],
    },
})
