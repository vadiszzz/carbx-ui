import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'
import { NodeGlobalsPolyfillPlugin } from '@esbuild-plugins/node-globals-polyfill'
import inject from '@rollup/plugin-inject'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const useMockAuth = env.VITE_DEV_MOCK_AUTH === 'true'

  return {
    plugins: [react(), tailwindcss()],
    define: {
      global: 'globalThis',
    },
    build: {
      rollupOptions: {
        plugins: [inject({ Buffer: ['buffer', 'Buffer'] })],
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis',
        },
        plugins: [
          NodeGlobalsPolyfillPlugin({
            process: true,
            buffer: true,
          }),
        ],
      },
    },
    resolve: {
      alias: [
        ...(useMockAuth
          ? [
              {
                find: '@privy-io/react-auth/solana',
                replacement: path.resolve(__dirname, './src/dev-mocks/privy-react-auth-solana.tsx'),
              },
              {
                find: '@privy-io/react-auth',
                replacement: path.resolve(__dirname, './src/dev-mocks/privy-react-auth.tsx'),
              },
            ]
          : []),
        { find: '@', replacement: path.resolve(__dirname, './src') },
        { find: 'buffer', replacement: 'buffer' },
      ],
    },
  }
})
