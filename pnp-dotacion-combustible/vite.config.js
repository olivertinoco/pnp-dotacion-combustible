import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  return{
    root: resolve(__dirname, "src"),
    plugins: [react(), tailwindcss()],
    build: {
      outDir: resolve(__dirname, "../wwwroot/js/home"),
      cssCodeSplit: true,
      emptyOutDir: true,
      rollupOptions: {
        input: resolve(__dirname, "src/home/index.jsx"),
        output: {
          entryFileNames: isDev ? "[name].js" : "[name].[hash].js",
          chunkFileNames: isDev
            ? "chunks/[name].js"
            : "chunks/[name].[hash].js",
          assetFileNames: isDev
            ? "assets/[name].[ext]"
            : "assets/[name].[hash].[ext]",
        },
      },
    },
    server: {
      port: 5101,
      strictPort: true,
      hmr: {
        host: "localhost",
        protocol: "ws",
      },
    },
    base: isDev ? "/" : "/js/home/",
  };
});
