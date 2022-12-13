#!/usr/bin/env node
'use strict';

import prompts from 'prompts';
import shell from 'shelljs';
import axios from 'axios';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const log = console.log;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  // Dependency check
  if (!shell.which('npm')) {
    log(chalk.bgRed.bold('Sorry, this script requires npm.'));
    log('You can install it at: https://nodejs.org/en/');
    shell.exit(1);
  }

  // Get user's project name
  projectName = await prompts({
    type: 'text',
    name: 'value',
    message: 'New project name?',
    validate: value => !value.match(/^[a-z]+(-[a-z]+)*$/) ? `Lowercase letters interspaced with dashes only.` : true
  });

  projectName = projectName.value;

  // Recursively copy project_template into the user's project directory
  log(chalk.green(`Copying boilerplate project to ./${projectName}...`));

  shell.cp('-r', `${__dirname}/project_template`, `./${projectName}`);

  log(chalk.black.bgGreen(`Done.`));
  
  // Install npm dependencies
  log(chalk.green(`Installing root dependencies via npm...`));

  shell.cd(`./${projectName}`);

  shell.exec('npm install');

  log(chalk.black.bgGreen(`Done.`));
  log();

  log(chalk.green(`Installing client dependencies via npm...`));

  shell.cd('./client');

  shell.exec('npm install');

  log(chalk.black.bgGreen(`Done.`));
  log();

  log(chalk.green(`Installing server dependencies via npm...`));

  shell.cd('../server');

  shell.exec('npm install');

  log(chalk.black.bgGreen(`Done.`));
  log();

  // Make a post request to the coordinator & save the app ID and secret in the .env file
  log(chalk.green(`Registering app with Hathora Coordinator...`));

  shell.cd('..');

  let appId = '';
  let appSecret = '';

  try {
    const response = await axios.post('https://coordinator.hathora.dev/registerApp');

    appId = response.data.appId;
    appSecret = response.data.appSecret;
  }
  catch (e) {
    log(chalk.red('Failed to reach Hathora Coordinator.'));
    log('Please check your internet connection and try again.');
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
  log(chalk.white(`npm run server `) + chalk.gray(`# Starts the server`));
  log(chalk.white(`npm run client `) + chalk.gray(`# Starts the client`));

  log();

  log(`Happy hacking!`);

  shell.exit(0);
}
