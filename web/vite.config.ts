import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev` proxies the API to the service (dotnet run, port 8742) or to the mock (npm run mock).
// `npm run build` writes straight into the service's wwwroot so one process serves everything.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: { '/api': process.env.API_URL ?? 'http://127.0.0.1:8742' },
  },
  build: {
    outDir: '../src/SeedboxSync.Service/wwwroot',
    emptyOutDir: true,
  },
});
