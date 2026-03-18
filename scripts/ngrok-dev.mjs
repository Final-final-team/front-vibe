import { spawn } from 'node:child_process';
import process from 'node:process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import ngrok from 'ngrok';

const port = Number(process.env.PORT ?? '5190');
const host = process.env.HOST ?? '0.0.0.0';
const authtoken = process.env.NGROK_AUTHTOKEN;
const localNgrokBinary = resolve(process.cwd(), 'tools/ngrok-linux/ngrok');

if (existsSync(localNgrokBinary)) {
  process.env.NGROK_PATH = localNgrokBinary;
}

const vite = spawn('npm', ['run', 'dev:host'], {
  stdio: 'inherit',
  shell: true,
  env: {
    ...process.env,
    HOST: host,
    PORT: String(port),
  },
});

let tunnel;

async function startTunnel() {
  try {
    tunnel = await ngrok.connect({
      addr: port,
      proto: 'http',
      authtoken,
    });

    console.log(`\nngrok public URL: ${tunnel}\n`);
  } catch (error) {
    console.error('\nFailed to start ngrok tunnel.');
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
    vite.kill('SIGTERM');
  }
}

vite.on('exit', async (code) => {
  if (tunnel) {
    await ngrok.disconnect(tunnel);
    await ngrok.kill();
  }
  process.exit(code ?? 0);
});

process.on('SIGINT', async () => {
  vite.kill('SIGINT');
  if (tunnel) {
    await ngrok.disconnect(tunnel);
    await ngrok.kill();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  vite.kill('SIGTERM');
  if (tunnel) {
    await ngrok.disconnect(tunnel);
    await ngrok.kill();
  }
  process.exit(0);
});

setTimeout(() => {
  void startTunnel();
}, 1500);
