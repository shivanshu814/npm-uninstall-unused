import fs from "fs";
import path from "path";
import { exec } from "child_process";
import chalk from "chalk";
import { promisify } from "util";

const execAsync = promisify(exec);

// Create a temporary test directory
const testDir = path.join(process.cwd(), "test-monorepo");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create a basic monorepo structure
const packages = [
  {
    name: "package-a",
    dependencies: {
      express: "^4.17.1",
      "left-pad": "^1.3.0",
    },
  },
  {
    name: "package-b",
    dependencies: {
      lodash: "^4.17.21",
      "is-positive": "^1.0.0",
    },
  },
];

// Setup test environment
async function setupTestEnvironment() {
  console.log(chalk.cyan("🚀 Setting up basic monorepo test environment...\n"));

  // Create root package.json
  const rootPackageJson = {
    name: "test-monorepo",
    private: true,
    workspaces: ["packages/*"],
  };

  fs.writeFileSync(
    path.join(testDir, "package.json"),
    JSON.stringify(rootPackageJson, null, 2)
  );

  // Create packages directory
  const packagesDir = path.join(testDir, "packages");
  if (!fs.existsSync(packagesDir)) {
    fs.mkdirSync(packagesDir);
  }

  // Setup test packages
  for (const pkg of packages) {
    const pkgDir = path.join(packagesDir, pkg.name);
    if (!fs.existsSync(pkgDir)) {
      fs.mkdirSync(pkgDir);
    }

    // Create package.json
    fs.writeFileSync(
      path.join(pkgDir, "package.json"),
      JSON.stringify(pkg, null, 2)
    );

    // Install dependencies
    console.log(chalk.yellow(`📦 Installing dependencies for ${pkg.name}...`));
    try {
      await execAsync("npm install", { cwd: pkgDir });
      console.log(chalk.green(`✅ Dependencies installed for ${pkg.name}`));
    } catch (error) {
      console.error(
        chalk.red(`❌ Error installing dependencies for ${pkg.name}:`),
        error.message
      );
      throw error;
    }
  }
}

// Run the test
async function runTest() {
  try {
    // Setup test environment
    await setupTestEnvironment();

    console.log(
      chalk.cyan("\n🚀 Running npm-uninstall-unused on basic monorepo...\n")
    );

    // Run the tool
    console.log(chalk.yellow("\n🔍 Running tool..."));
    const toolPath = path.join(process.cwd(), "src/index.js");

    const { stdout, stderr } = await execAsync(`node ${toolPath}`, {
      cwd: testDir,
      env: {
        ...process.env,
        FORCE_COLOR: true,
        CI: "true",
      },
    });

    if (stderr) {
      console.error(chalk.yellow("⚠️  Warnings/Errors:"), stderr);
    }

    console.log(chalk.green("\n✅ Tool output:"));
    console.log(stdout);
  } catch (error) {
    console.error(chalk.red("❌ Test failed:"), error.message);
    process.exit(1);
  }
}

// Cleanup function
function cleanup() {
  console.log(chalk.cyan("\n🧹 Cleaning up test environment..."));
  if (fs.existsSync(testDir)) {
    fs.rmSync(testDir, { recursive: true, force: true });
    console.log(chalk.green("✅ Test environment cleaned up"));
  }
}

// Handle cleanup on exit
process.on("SIGINT", () => {
  cleanup();
  process.exit(0);
});

// Run the test
runTest().finally(cleanup);
