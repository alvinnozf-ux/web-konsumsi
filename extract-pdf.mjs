import { readFileSync } from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// install if needed
try {
  require.resolve('pdf-parse');
} catch {
  const { execSync } = await import('child_process');
  execSync('npm install pdf-parse', { cwd: process.cwd(), stdio: 'inherit' });
}

const pdf = require('pdf-parse');
const buf = readFileSync('C:/Users/Alvino/Downloads/Data Guru Per Divisi 26 Agustus 2026.pdf');
const data = await pdf(buf);
console.log(data.text);
