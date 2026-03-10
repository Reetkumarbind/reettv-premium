import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0",
    port: 3000,
    strictPort: true,
    hmr: {
      overlay: false,
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: 'ES2020',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Core vendor chunk
          if (id.includes('node_modules/react')) {
            return 'react-core';
          }
          // Router chunk
          if (id.includes('react-router-dom')) {
            return 'router';
          }
          // Query chunk
          if (id.includes('@tanstack/react-query')) {
            return 'query';
          }
          // UI components - split into smaller chunks to enable partial loading
          if (id.includes('@radix-ui')) {
            return 'ui-radix';
          }
          if (id.includes('lucide-react')) {
            return 'icons';
          }
          // Utilities
          if (id.includes('recharts') || id.includes('date-fns') || id.includes('zod')) {
            return 'utils';
          }
        },
      },
    },
    chunkSizeWarningLimit: 300,
  },
}));
