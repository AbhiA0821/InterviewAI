import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
// InterviewAI frontend Vite configuration.
// The "@" alias maps to /src so imports can use e.g. "@/components/...".
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        port: 5173,
    },
});
