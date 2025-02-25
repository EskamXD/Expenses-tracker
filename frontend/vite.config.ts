import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    // build: {
    //     rollupOptions: {
    //         output: {
    //             manualChunks(id) {
    //                 if (id.includes("node_modules")) {
    //                     if (id.includes("react-router-dom"))
    //                         return "react-router-dom";
    //                     if (id.includes("react-dom")) return "react-dom";
    //                     if (id.includes("lucide-react")) return "lucide-react";
    //                     return "vendor";
    //                 }
    //             },
    //         },
    //     },
    // },
});

