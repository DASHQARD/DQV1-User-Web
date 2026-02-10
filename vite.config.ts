import path from 'node:path'
import { defineConfig } from 'vite'
import type { InlineConfig } from 'vitest'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'

// https://vite.dev/config/
export default defineConfig({
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
      },
      sass: {
        api: 'modern-compiler',
        silenceDeprecations: ['legacy-js-api'],
      },
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        exportType: 'default',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['**/node_modules/**', '**/dist/**', '**/e2e/**', '**/*.config.{ts,js}'],
    // Reduce parallelism under coverage to avoid OOM (single fork = one process)
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: true,
        maxForks: 1,
      },
    },
    coverage: {
      reporter: ['text', 'json', 'html'],
      include: [
        'src/components/**',
        'src/features/**',
        'src/utils/helpers/**',
        'src/utils/format.ts',
      ],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/hooks/**',
        '**/assets/**',
        '**/services/**',
        '**/routes/**',
        '**/schemas/**',
        '**/__tests__/**',
        '**/stores/**',
        '**/features/dashboard/vendor/pages/compliance/**',
      ],
    },
  },
} as import('vite').UserConfig & { test: InlineConfig })
