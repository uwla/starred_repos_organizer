import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

const ReactCompilerConfig = { target: "18" }
const ENV = process.env

const appPath = ENV['NODE_ENV'] === "demo" ? "/starred_repos_organizer" : "/"
const appPort = ENV['VITE_APP_PORT'] || "5173"
const appHost = ENV['VITE_APP_HOST'] || "localhost"

// https://vitejs.dev/config/
export default defineConfig({
    base: process.env.VITE_BASE_PATH || appPath,
    plugins: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
            },
        }),
        viteSingleFile(),
    ],
    server: {
        host: "0.0.0.0",
        port: parseInt(appPort),
        allowedHosts: [appHost],
        cors: true
    },
})
