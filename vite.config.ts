import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { viteSingleFile } from "vite-plugin-singlefile"

const defaultBasePath =
    process.env.NODE_ENV === "demo" ? "/starred_repos_organizer" : "/"

const ReactCompilerConfig = { target: "18" }

// https://vitejs.dev/config/
export default defineConfig({
    base: process.env.VITE_BASE_PATH || defaultBasePath,
    plugins: [
        react({
            babel: {
                plugins: [["babel-plugin-react-compiler", ReactCompilerConfig]],
            },
        }),
        viteSingleFile(),
    ],
    server: { host: "0.0.0.0", port: 5173 },
})
