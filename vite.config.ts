import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function normalizeSetCookieHeader(
  proxyRes: { headers: Record<string, string | string[] | undefined> },
  _req: unknown,
  res: { setHeader: (name: string, value: string | string[]) => void },
) {
  const header = proxyRes.headers['set-cookie']

  if (typeof header !== 'string') {
    return
  }

  const normalized = header.split(/,(?=[^;,]+?=)/)
  proxyRes.headers['set-cookie'] = normalized
  res.setHeader('set-cookie', normalized)
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devProxyTarget = env.DEV_PROXY_TARGET

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      allowedHosts: [
        'rank-nonapplicative-fluidly.ngrok-free.dev',
      ],
      proxy: devProxyTarget
        ? {
            '/api': {
              target: devProxyTarget,
              changeOrigin: true,
              configure(proxy) {
                proxy.on('proxyRes', normalizeSetCookieHeader)
              },
            },
            '/oauth2': {
              target: devProxyTarget,
              changeOrigin: true,
              configure(proxy) {
                proxy.on('proxyRes', normalizeSetCookieHeader)
              },
            },
            '/login/oauth2/code': {
              target: devProxyTarget,
              changeOrigin: true,
              configure(proxy) {
                proxy.on('proxyRes', normalizeSetCookieHeader)
              },
            },
          }
        : undefined,
    },
  }
})
