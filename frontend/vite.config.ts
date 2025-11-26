import path from "path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { visualizer } from "rollup-plugin-visualizer";

// const analyze = process.env.ANALYZE === "true";

function manualChunks(id: string) {
    if (!id.includes("node_modules")) return;

    if (
        id.includes("react") ||
        id.includes("react-dom") ||
        id.includes("react-router")
    )
        return "react-vendor";

    if (id.includes("@tanstack")) return "tanstack"; // react-query, react-table

    if (
        id.includes("chart.js") ||
        id.includes("echarts") ||
        id.includes("uplot")
    )
        return "charts-vendor";

    if (id.includes("xlsx") || id.includes("papaparse")) return "data-tools";

    if (id.includes("lucide-react")) return "icons";
}

export default defineConfig({
    plugins: [
        react(),
        tailwindcss(),
        visualizer({
            filename: "dist/stats.html",
            open: false,
            gzipSize: true,
            brotliSize: true,
            template: "treemap",
        }),
    ],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    build: {
        target: "es2020",
        sourcemap: false,
        minify: "esbuild",
        cssMinify: true,
        chunkSizeWarningLimit: 1200,
        rollupOptions: {
            output: {
                manualChunks,
            },
        },
    },
    // wywal console/debugger w prod
    esbuild: { drop: ["console", "debugger"] },
});

