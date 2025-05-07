const {spawnSync} = require('child_process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

function startPrompt(callback) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptMessage = `
Migrate Valtimo front-end from major version 12 to 13.

Make sure your repository is clean (no uncommitted changes) before continuing.

Checkout a new (temporary) branch for this upgrade. This script will automatically make commits.

Since every implementation project is different, these automatic steps might not work (completely).
If so, please follow the manual migration steps.

Do not enable the new application builder when asked.

It is recommended to enable all other optional migrations Angular suggests.


Press Y to continue, or N to abort:`;

  rl.question(promptMessage, answer => {
    const response = answer.trim().toLowerCase();

    if (response !== 'y') {
      console.log('Migration aborted.');
      rl.close();
      process.exit(0);
    }

    rl.close();
    callback();
  });
}

function runMigrationSteps() {
  const stepsDir = __dirname;
  const stepFiles = fs
    .readdirSync(stepsDir)
    .filter(f => /^\d{2}.*\.cjs$/.test(f))
    .sort();

  for (const step of stepFiles) {
    const stepPath = path.join(stepsDir, step);
    console.log(`Running step: ${step}`);

    const result = spawnSync('node', [stepPath], {stdio: 'inherit'});

    if (result.status !== 0) {
      console.error(`Migration stopped at ${step}`);
      process.exit(1);
    }
  }

  console.log('All migration steps completed successfully.');
}

startPrompt(runMigrationSteps);
