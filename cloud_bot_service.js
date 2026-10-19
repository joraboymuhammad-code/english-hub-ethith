/**
 * ETHITH Cloud Bot Service (24/7 Always-On)
 * Runs both @ETHITH_testbot and @ETHITHCOINbot concurrently in the cloud.
 * Compatible with Render.com, Railway, Heroku, and Docker.
 */

const http = require('http');
const { fork } = require('child_process');
const path = require('path');

const PORT = process.env.PORT || 8080;

console.log('==================================================');
console.log('  ETHITH 24/7 CLOUD BOT SERVICE STARTING...      ');
console.log('==================================================');

// Start HTTP health-check server for Render/Railway liveness probes
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    status: 'ONLINE',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'ETHITH Cloud Bot Service 24/7',
    bots: ['@ETHITH_testbot', '@ETHITHCOINbot']
  }));
});

server.listen(PORT, () => {
  console.log(`[Cloud Service] HTTP Health Server listening on port ${PORT}`);
});

function launchWorker(scriptName) {
  const scriptPath = path.join(__dirname, scriptName);
  console.log(`[Cloud Service] Launching worker: ${scriptName}`);
  const child = fork(scriptPath, [], {
    stdio: 'inherit',
    env: { ...process.env, CLOUD_MODE: 'true' }
  });

  child.on('exit', (code, signal) => {
    console.warn(`[Cloud Service] Worker ${scriptName} exited (code ${code}, signal ${signal}). Restarting in 5s...`);
    setTimeout(() => {
      launchWorker(scriptName);
    }, 5000);
  });

  return child;
}

// Start both bots with auto-restart supervision
launchWorker('ethith_telegram_bot.js');
launchWorker('ethith_admin_bot.js');

process.on('SIGINT', () => {
  console.log('[Cloud Service] Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('[Cloud Service] Received SIGTERM...');
  process.exit(0);
});
