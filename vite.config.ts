import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { viteSingleFile } from "vite-plugin-singlefile"

const defaultBasePath =
    process.env.NODE_ENV === "demo" ? "/starred_repos_organizer" : "/";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), viteSingleFile()],
    base: process.env.VITE_BASE_PATH || defaultBasePath,
});
