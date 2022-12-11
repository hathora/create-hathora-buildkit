#!/usr/bin/env node
'use strict';

import prompts from 'prompts';
import shell from 'shelljs';
import axios from 'axios';
import chalk from 'chalk';
import fs from 'fs/promises';

const log = console.log;

let projectName = "";

log(chalk.magenta(`
, σ╦,
δφ╓╙╚▒╦░╚▒╦,
  '╙▒╦╓╙╚φ╓"╚φ≡
    ⁿ╓░╙δ≡,"≥⌐
 ,ⁿ≥░"    ''
ⁿσ'
`));

log(chalk.bgMagenta(`Bootstrapping new Hathora project...`));

bootstrapProject();

async function bootstrapProject() {
  // Sanity checks for required utils (git, node / npm)
  if (!shell.which('git')) {
    log(chalk.bgRed.bold('Sorry, this script requires git.'));
    log('You can install it at: https://git-scm.com/');
    shell.exit(1);
  }

  if (!shell.which('npm')) {
    log(chalk.bgRed.bold('Sorry, this script requires npm.'));
    log('You can install it at: https://nodejs.org/en/');
    shell.exit(1);
  }

  projectName = await prompts({
    type: 'text',
    name: 'value',
    message: 'New project name?',
    validate: value => !value.match(/^[a-z]+(-[a-z]+)*$/) ? `Lowercase letters interspaced with dashes only.` : true
  });

  projectName = projectName.value;

  // We have a projectName, try to create a directory
  log(chalk.green(`Cloning template into "${projectName}"...`));

  shell.exec(`git clone git@github.com:hathora/buildkits-hello-world.git ${projectName}`);

  log(chalk.black.bgGreen(`Done.`));

  log(chalk.green(`Removing and reinitializing git repo.`));

  shell.cd(`./${projectName}`);

  shell.rm('-rf', './.git');

  shell.exec('git init');

  log(chalk.black.bgGreen(`Done.`));

  log(chalk.green(`Installing dependencies via npm...`));

  shell.exec('npm install');

  log(chalk.black.bgGreen(`Done.`));

  log(chalk.green(`Registering app with Hathora Coordinator...`));

  let appId = '';
  let appSecret = '';

  try {
    const response = await axios.post('https://coordinator.hathora.dev/registerApp');

    appId = response.data.appId;
    appSecret = response.data.appSecret;
  }
  catch (e) {
    console.log('Failed to reach Hathora Coordinator.');
    console.log('Please check your internet connection and try again.');
    shell.exit(1);
  }

  log(chalk.black.bgGreen(`Done.`));

  log(chalk.green(`Saving app information to .env file...`));

  try {
    await fs.writeFile('./.env', `APP_SECRET=${appSecret}\nAPP_ID=${appId}\n`);
  }
  catch (e) {
    log(chalk.red(`Error writing .env file`));
    shell.exit(1);
  }

  log(chalk.black.bgGreen(`Done.`));

  log();

  log(chalk.bgMagenta(`                                      `));
  log(chalk.bgMagenta(`  `) + chalk.magenta(` Welcome to your new Hathora app. `) + chalk.bgMagenta(`  `));
  log(chalk.bgMagenta(`                                      `));

  log();

  log(`First run: ` + chalk.black.bgWhite(`cd ${projectName}`) + ', then...');

  log();

  log(chalk.black.bgWhite(`Available commands:`));
  log(`npm run server # Starts the server only`);
  log(`npm run client # Starts the client only`);
  log(`npm run all # Concurrently runs the server and client as one`);

  log();

  log(`Happy hacking!`);

  shell.exit(0);
}
