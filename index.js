#!/usr/bin/env node
'use strict';

const readline = require('readline');
const fs = require('fs').promises;
const prompts = require('prompts');
const { spawn } = require('node:child_process');

let projectName = "";

console.log(`
, σ╦,
δφ╓╙╚▒╦░╚▒╦,
  '╙▒╦╓╙╚φ╓"╚φ≡
    ⁿ╓░╙δ≡,"≥⌐
 ,ⁿ≥░"    ''
ⁿσ'

Bootstrapping new Hathora project...
`);

promptProjectName();

async function promptProjectName() {
  projectName = await prompts({
    type: 'text',
    name: 'value',
    message: 'New project name?',
    validate: value => !value.match(/^[a-z]+(-[a-z]+)*$/) ? `Lowercase letters interspaced with dashes only.` : true
  });

  projectName = projectName.value;

  // We have a projectName, try to create a directory
  console.log(`Creating project directory "${projectName}"...`);

  try {
    await fs.mkdir(`./${projectName}`);
  }
  catch (e) {
    console.log(`
Failed to create directory "${projectName}".
Does it already exist?
    `);
    process.exit(0);
  }

  console.log(`Done.`);

  // Create subdirs
  console.log(`Creating required project subdirectories...`);

  try {
    await fs.mkdir(`./${projectName}/client`);
    await fs.mkdir(`./${projectName}/common`);
    await fs.mkdir(`./${projectName}/server`);
  }
  catch (e) {
    console.log(`
Failed to create required subdirectories.
(./${projectName}/client, ./${projectName}/common, ./${projectName}/server)
`);
    process.exit(0);
  }

  console.log(`Done.`);

  // Write package.json files to each dir
  console.log(`Writing package.json files...`);

  try {
    await fs.writeFile(`./${projectName}/client/package.json`, `{
  "type": "module",
  "scripts": {
    "start": "npx vite",
    "build": "npx vite build"
  },
  "dependencies": {
    "@hathora/client-sdk": "*",
    "interpolation-buffer": "*"
  },
  "devDependencies": {
    "@types/node": "*",
    "typescript": "*",
    "vite": "*"
  }
}
`);
await fs.writeFile(`./${projectName}/common/package.json`, `{
  "type": "module"
}
`);
await fs.writeFile(`./${projectName}/server/package.json`, `{
  "type": "module",
  "scripts": {
    "start": "npx ts-node-esm --experimental-specifier-resolution=node server.ts"
  },
  "dependencies": {
    "@hathora/server-sdk": "*",
    "dotenv": "*"
  },
  "devDependencies": {
    "@types/node": "*",
    "ts-node": "*",
    "typescript": "*"
  }
}
`);
  }
  catch (e) {
    console.log(`
Failed to write package.json files.
`);
    process.exit(0);
  }

  console.log(`Done.`);

  console.log(`Writing install shell script...`);

  try {
    await fs.writeFile(`./${projectName}/install.sh`, `#!/bin/bash
cd ./${projectName}/client
npm install
cd ../server
npm install
`);
  }
  catch (e) {
    console.log(`
Failed to write install.sh script.
`);
    process.exit(0);
  }

  console.log('Modifying install script permission...');

  try {
    await fs.chmod(`./${projectName}/install.sh`, '555');
  }
  catch (e) {
    console.log(`
Failed to grant 555 permissions to install.sh script.
`);
    process.exit(0);
  }

  console.log(`Installing dependencies via NPM...`);
  
  const runInstall = spawn(`./${projectName}/install.sh`);

  runInstall.on('close', async () => {
    console.log(`Done.`);

    console.log(`Registering app on Hathora Coordinator...`);

    

    process.exit(0);
  });

}
