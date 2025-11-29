import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig(({ command }) => {
  const isDev = command === "serve";
  const outDir = resolve(__dirname, "../wwwroot/js/home");

  return {
    root: resolve(__dirname, "src"),
    publicDir: false,
    plugins: [
      react({
        reactCompiler: true,
      }),
      tailwindcss(),
      {
        name: "move-manifest",
        closeBundle: async () => {
          const fs = await import("fs");
          const manifestSrc = resolve(outDir, ".vite/manifest.json");
          const manifestDest = resolve(outDir, "manifest.json");
          try {
            if (fs.existsSync(manifestSrc)) {
              const data = fs.readFileSync(manifestSrc, "utf-8");
              fs.mkdirSync(outDir, { recursive: true });
              fs.writeFileSync(manifestDest, data);
              console.log(`manifest.json copiado a ${manifestDest}`);
            }
          } catch (e) {
            console.warn("No se pudo mover manifest:", e.message);
          }
        },
      },
      {
        name: "mark-fonts-external",
        enforce: "pre",
        resolveId(source) {
          if (source.startsWith("/fonts/")) {
            return { id: source, external: true };
          }
          return null;
        },
      },
    ],
    build: {
      outDir,
      manifest: true,
      cssCodeSplit: true,
      emptyOutDir: false,
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
      port: 5102,
      strictPort: true,
      hmr: {
        host: "localhost",
        protocol: "ws",
      },
    },
    base: isDev ? "/" : "/js/home/",
  };
});
