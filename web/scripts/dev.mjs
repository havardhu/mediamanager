// `npm start`: the backend under `dotnet watch` plus the Vite dev server, in one terminal.
// Open http://localhost:5173. Ctrl+C stops both. dotnet watch keeps the keyboard, so its
// "restart?" prompt (Ctrl+R) still works.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const service = path.resolve(web, '../src/SeedboxSync.Service');
const vite = path.join(web, 'node_modules', 'vite', 'bin', 'vite.js');

const children = [
  spawn('dotnet', ['watch', '--project', service], { cwd: path.resolve(web, '..'), stdio: 'inherit' }),
  spawn(process.execPath, [vite], { cwd: web, stdio: ['ignore', 'inherit', 'inherit'] }),
];

let stopping = false;
const stop = code => {
  if (stopping) return;
  stopping = true;
  for (const c of children) if (c.exitCode === null) c.kill();
  process.exitCode = code ?? 0;
};

for (const c of children) {
  c.on('error', e => {
    console.error(e.code === 'ENOENT' ? `Could not start ${c.spawnfile}. Is it installed and on PATH?` : e.message);
    stop(1);
  });
  // When either one stops, stop the other so nothing is left holding a port.
  c.on('exit', code => stop(code));
}
process.on('SIGINT', () => stop(0));
process.on('SIGTERM', () => stop(0));
