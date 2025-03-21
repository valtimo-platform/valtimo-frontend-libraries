const {spawn} = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));

const orderedScriptNames = Object.keys(pkg.scripts);
const watchScripts = orderedScriptNames.filter(name => name.startsWith('libs:watch:'));

let current = 0;
let activeProcesses = [];
let hasStartedApp = false;

function checkPortInUse(port = 4200) {
  return new Promise(resolve => {
    const server = net.createServer();
    server.once('error', () => resolve(true));
    server.once('listening', () => {
      server.close();
      resolve(false);
    });
    server.listen(port);
  });
}

async function runNext() {
  if (current >= watchScripts.length) {
    if (!hasStartedApp) {
      console.log('\n✅ All watch scripts are watching. Checking if app should start...\n');

      const inUse = await checkPortInUse(4200);

      if (!inUse) {
        console.log('🚀 Launching app with: npm start\n');
        const startProc = spawn('CHOKIDAR_USEPOLLING=true npm run startPoll', {
          stdio: 'inherit',
          shell: true,
        });
        activeProcesses.push(startProc);
        hasStartedApp = true;
      } else {
        console.log(
          '⚠️ Port 4200 already in use. Skipping npm start. Assuming ng serve is running.\n'
        );
        hasStartedApp = true;
      }
    }
    return;
  }

  const script = watchScripts[current];
  console.log(`\n🟢 Starting: ${script}\n`);

  const command = `CHOKIDAR_USEPOLLING=true npm run ${script}`;
  const proc = spawn(command, {
    stdio: ['inherit', 'pipe', 'inherit'],
    shell: true, // needed for inline env vars
  });

  activeProcesses.push(proc);

  proc.stdout.on('data', async data => {
    const str = data.toString();
    process.stdout.write(str);

    if (str.includes('Compilation complete')) {
      console.log(`✅ ${script} is watching...\n`);
      proc.stdout.removeAllListeners(); // prevent multiple triggers
      current++;
      runNext();
    }
  });

  proc.on('exit', code => {
    if (code !== 0) {
      console.error(`❌ ${script} failed with code ${code}`);
    }
  });
}

function cleanup() {
  console.log('\n🛑 Cleaning up child processes...\n');
  activeProcesses.forEach(p => {
    try {
      p.kill();
    } catch (err) {
      console.error('Failed to kill process:', err);
    }
  });
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

runNext();
