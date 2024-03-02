import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

const defaultBasePath =
    process.env.NODE_ENV === "demo" ? "/starred_repos_organizer" : "/";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: process.env.VITE_BASE_PATH || defaultBasePath,
});
