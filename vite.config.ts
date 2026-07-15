import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  // Avoid eager dependency crawling so Vite also runs cleanly in restricted workspaces.
  optimizeDeps: {
    noDiscovery: true,
    include: [],
  },
});
