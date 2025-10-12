// Simple healthcheck script for Docker
import { spawn } from 'child_process';

const PORT = process.env.PORT || 3000;

const options = {
  hostname: 'localhost',
  port: PORT,
  path: '/',
  method: 'GET',
  timeout: 3000
};

// Simple HTTP check using curl
const curl = spawn('curl', ['-f', '-s', `http://localhost:${PORT}/`]);

curl.on('close', (code) => {
  process.exit(code);
});

curl.on('error', () => {
  process.exit(1);
});