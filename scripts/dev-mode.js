const {spawn, spawnSync} = require('child_process');
const path = require('path');
const fs = require('fs');
const net = require('net');

const pkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf8'));
const orderedScriptNames = Object.keys(pkg.scripts);
const watchScripts = orderedScriptNames.filter(name => name.startsWith('libs:watch:'));

let current = 0;
let activeProcesses = [];
let hasStartedApp = false;

// Path to the single rebuild lock file
const rebuildLockFilePath = path.resolve(__dirname, '../.rebuilding.lock');

// Check if the initial build should be skipped (using an environment variable)
const skipInitialBuild = process.env.SKIP_BUILD === 'true';

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

function getLibraryNameFromScript(scriptName) {
  return scriptName.replace('libs:watch:', '');
}

function createRebuildLock() {
  if (!fs.existsSync(rebuildLockFilePath)) {
    fs.writeFileSync(rebuildLockFilePath, 'rebuilding');
  }
}

function removeRebuildLock() {
  if (fs.existsSync(rebuildLockFilePath)) {
    fs.rmSync(rebuildLockFilePath);
  }
}

function getChokidarCommand(libName) {
  const pathGlob = `projects/valtimo/${libName}/**/*`;

  const jsCode = `
    const { spawnSync } = require('child_process');
    const fs = require('fs');
    const path = require('path');

    const file = path.resolve(__dirname, '../.rebuilding.lock');
    if (fs.existsSync(file)) {
      console.log('⏳ Rebuild in progress. Skipping rebuild for: @valtimo/${libName}');
      process.exit(0);
    }

    fs.writeFileSync(file, 'rebuilding');
    console.log('🔁 Rebuilding @valtimo/${libName}');
    const result = spawnSync('ng', ['build', '@valtimo/${libName}'], { stdio: 'inherit', shell: true });

    if (fs.existsSync(file)) {
      fs.rmSync(file);
    }

    process.exit(result.status);
  `
    .trim()
    .replace(/\n/g, '')
    .replace(/"/g, '\\"');

  return `chokidar "${pathGlob}" --polling --await-write-finish --delay 300 -c "node -e \\"${jsCode}\\""`;
}

async function runNext() {
  if (current >= watchScripts.length) {
    if (!hasStartedApp) {
      console.log('\n✅ All libs are watching. Checking if app should start...\n');
      const inUse = await checkPortInUse(4200);

      if (!inUse) {
        console.log('🚀 Launching app with: npm run start\n');
        const startProc = spawn('npm run start', {
          stdio: 'inherit',
          shell: true,
        });
        activeProcesses.push(startProc);
        hasStartedApp = true;
      } else {
        console.log('⚠️ Port 4200 in use. Skipping npm start.\n');
        hasStartedApp = true;
      }
    }
    return;
  }

  const script = watchScripts[current];
  const libName = getLibraryNameFromScript(script);
  const chokidarCmd = getChokidarCommand(libName);
  const initialBuildCmd = `ng build @valtimo/${libName}`;

  if (!skipInitialBuild) {
    console.log(`\n🔧 Building initially: @valtimo/${libName}`);
    createRebuildLock(); // Create the rebuild lock file

    const buildProc = spawn(initialBuildCmd, {shell: true});

    buildProc.stdout.on('data', data => {
      const str = data.toString();
      process.stdout.write(str);

      if (str.includes('Built Angular Package')) {
        console.log(`✅ Initial build done for: @valtimo/${libName}\n`);
        buildProc.stdout.removeAllListeners();
        removeRebuildLock(); // Remove the rebuild lock file
        buildProc.kill();

        const watcherProc = spawn(chokidarCmd, {
          stdio: 'inherit',
          shell: true,
        });

        activeProcesses.push(watcherProc);
        current++;
        runNext();
      }
    });

    buildProc.stderr.on('data', data => {
      process.stderr.write(data.toString());
    });
  } else {
    // Skip initial build, just start the watcher
    console.log(`\n✅ Skipping initial build for: @valtimo/${libName}, starting watcher...\n`);
    const watcherProc = spawn(chokidarCmd, {
      stdio: 'inherit',
      shell: true,
    });

    activeProcesses.push(watcherProc);
    current++;
    runNext();
  }
}

function cleanup() {
  console.log('\n🛑 Cleaning up child processes and temp files...\n');
  activeProcesses.forEach(p => {
    try {
      p.kill();
    } catch (err) {
      console.error('Failed to kill process:', err);
    }
  });

  removeRebuildLock(); // Cleanup rebuild lock
  process.exit();
}

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);
process.on('exit', cleanup);

runNext();
