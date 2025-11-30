import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import path from 'path';
import { defineConfig } from 'vite';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';

import pkg from './package.json';

function getGitInfo() {
  let sha = 'unknown';
  let branch = 'unknown';

  try {
    sha = execSync('git rev-parse --short HEAD').toString().trim();
    branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  } catch {
    // idk
  }

  return { sha, branch };
}

const { sha, branch } = getGitInfo();
const version = pkg.version;

const channel = process.env.APP_CHANNEL ?? (process.env.NODE_ENV === 'production' ? 'production' : 'local');

const displayVersion =
  channel === 'production'
    ? version
    : channel === 'staging'
      ? `${version}-staging.${sha}`
      : channel === 'preview'
        ? `${version}-${branch}.${sha}`
        : `${version}-local.${sha}`;

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        quality: 80,
      },
      test: /\.(jpe?g|png|gif|tiff|webp|svg|avif)$/i,
      cache: true,
      cacheLocation: path.resolve(__dirname, 'node_modules/.vite-image-optimizer'),
    }),
  ],
  define: {
    __APP_VERSION__: JSON.stringify(version),
    __APP_GIT_SHA__: JSON.stringify(sha),
    __APP_BRANCH__: JSON.stringify(branch),
    __APP_CHANNEL__: JSON.stringify(channel),
    __APP_VERSION_DISPLAY__: JSON.stringify(displayVersion),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  preview: {
    allowedHosts: ['frontend-production-dc83.up.railway.app', 'zacktidwell.com', 'www.zacktidwell.com'],
  },
});
