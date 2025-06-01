#!/usr/bin/env node

/**
 * npm-uninstall-unused
 * A CLI tool to detect and uninstall unused npm dependencies
 *
 * @author Shivanshu Pathak
 * @license MIT
 */

import depcheck from "depcheck";
import { exec } from "child_process";
import inquirer from "inquirer";
import chalk from "chalk";
import path from "path";
import fs from "fs";
import { promisify } from "util";

const execAsync = promisify(exec);

/**
 * Recursively finds all directories containing package.json files
 * @param {string} dir - The directory to start searching from
 * @returns {string[]} Array of directory paths containing package.json
 */
function findPackageJsonFolders(dir) {
  const results = [];
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file === "node_modules") continue;
      if (fs.existsSync(path.join(fullPath, "package.json"))) {
        results.push(fullPath);
      }
      results.push(...findPackageJsonFolders(fullPath));
    }
  }
  return results;
}

/**
 * Gets the relative path from current working directory
 * @param {string} folder - The folder path
 * @returns {string} Relative path
 */
function getRelativePath(folder) {
  return path.relative(process.cwd(), folder);
}

/**
 * Uninstalls packages from a directory
 * @param {string} folder - The directory containing package.json
 * @param {string[]} packages - Array of package names to uninstall
 * @param {boolean} isDev - Whether these are devDependencies
 */
async function uninstallPackages(folder, packages, isDev = false) {
  if (packages.length === 0) return;

  const flag = isDev ? "--save-dev" : "";
  const uninstallCmd = `npm uninstall ${flag} --no-audit ${packages.join(" ")}`;
  console.log(chalk.blue(`\n🧹 Running: ${uninstallCmd}\n`));

  try {
    const { stdout } = await execAsync(uninstallCmd, { cwd: folder });
    console.log(
      chalk.green(
        `✅ Unused ${
          isDev ? "devDependencies" : "dependencies"
        } uninstalled successfully!\n`
      )
    );
    if (stdout) console.log(stdout);
  } catch (error) {
    console.error(
      chalk.red(
        `❌ Error uninstalling ${isDev ? "devDependencies" : "dependencies"}:`
      ),
      error.message
    );
  }
}

/**
 * Checks and uninstalls unused dependencies in a directory
 * @param {string} folder - The directory to check
 */
async function checkAndUninstall(folder) {
  // Configure depcheck options
  const options = {
    ignoreDirs: ["sandbox", "dist", "build", "node_modules"],
    ignoreMatches: ["eslint", "babel-*", "typescript"],
  };

  const relativePath = getRelativePath(folder);
  console.log(
    chalk.cyan(
      `\n🚀 Scanning folder: ${relativePath} for unused dependencies...\n`
    )
  );

  return new Promise((resolve) => {
    depcheck(folder, options, async (unused) => {
      const unusedDeps = unused.dependencies;
      const unusedDevDeps = unused.devDependencies;

      // If no unused dependencies found, exit early
      if (unusedDeps.length === 0 && unusedDevDeps.length === 0) {
        console.log(
          chalk.green(`✅ No unused dependencies found in ${relativePath}!`)
        );
        resolve();
        return;
      }

      // Display unused dependencies
      if (unusedDeps.length > 0) {
        console.log(
          chalk.yellow(`⚠️  Unused Dependencies Found in ${relativePath}:\n`)
        );
        unusedDeps.forEach((dep) => console.log(chalk.red(`- ${dep}`)));
      }

      // Display unused devDependencies
      if (unusedDevDeps.length > 0) {
        console.log(
          chalk.yellow(`⚠️  Unused DevDependencies Found in ${relativePath}:\n`)
        );
        unusedDevDeps.forEach((dep) => console.log(chalk.blue(`- ${dep}`)));
      }

      // Skip confirmation in CI mode
      const isCI = process.env.CI === "true";
      if (isCI) {
        console.log(
          chalk.gray("\n🛑 Running in CI mode - skipping uninstall prompt\n")
        );
        resolve();
        return;
      }

      // Ask for confirmation
      const { confirm } = await inquirer.prompt([
        {
          type: "confirm",
          name: "confirm",
          message: `Do you want to uninstall these unused packages in ${relativePath}?`,
          default: false,
        },
      ]);

      if (confirm) {
        // Run uninstall commands sequentially
        await uninstallPackages(folder, unusedDeps, false);
        await uninstallPackages(folder, unusedDevDeps, true);
      } else {
        console.log(chalk.gray("\n🛑 No packages were uninstalled.\n"));
      }
      resolve();
    });
  });
}

/**
 * Main function to run the tool
 */
async function main() {
  const rootDir = process.cwd();
  const folders = findPackageJsonFolders(rootDir);
  console.log(chalk.cyan(`Found ${folders.length} folders with package.json`));
  for (const folder of folders) {
    await checkAndUninstall(folder);
  }
}

// Run the tool
main().catch(console.error);
