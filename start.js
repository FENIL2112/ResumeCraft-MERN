import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isWindows = process.platform === 'win32';
const npmCmd = isWindows ? 'npm.cmd' : 'npm';

console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[35m%s\x1b[0m', '   🚀 Starting ResumeCraft MERN Application (Full Stack)');
console.log('\x1b[36m%s\x1b[0m', '=======================================================');
console.log('\x1b[33m%s\x1b[0m', '   • Backend API: http://localhost:5000');
console.log('\x1b[33m%s\x1b[0m', '   • Frontend App: http://localhost:5173');
console.log('\x1b[36m%s\x1b[0m', '=======================================================\n');

// 1. Start Server in Background (Silently running API & DB)
const server = spawn(npmCmd, ['run', 'start'], {
  cwd: path.join(__dirname, 'server'),
  stdio: 'pipe',
  shell: true
});

server.stdout.on('data', (data) => {
  const msg = data.toString().trim();
  if (msg.includes('MongoDB') || msg.includes('API running')) {
    console.log('\x1b[32m[Backend]\x1b[0m ' + msg);
  }
});

server.stderr.on('data', (data) => {
  const errStr = data.toString().trim();
  if (errStr && !errStr.includes('DEP0190') && !errStr.includes('npm notice')) {
    console.error('\x1b[31m[Backend Error]\x1b[0m ' + errStr);
  }
});

server.on('error', (err) => {
  console.error('\x1b[31mFailed to start backend server:\x1b[0m', err);
});

// 2. Start Client Process (Opens Browser & Shows UI dev server)
const client = spawn(npmCmd, ['run', 'dev'], {
  cwd: path.join(__dirname, 'client'),
  stdio: 'inherit',
  shell: true
});

client.on('error', (err) => {
  console.error('\x1b[31mFailed to start frontend client:\x1b[0m', err);
});

// Graceful exit handler
const shutdown = () => {
  console.log('\n\x1b[33mStopping ResumeCraft application...\x1b[0m');
  try {
    server.kill();
    client.kill();
  } catch (e) {}
  process.exit();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
