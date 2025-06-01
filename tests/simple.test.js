import fs from "fs";
import path from "path";
import { exec } from "child_process";
import chalk from "chalk";
import { promisify } from "util";

const execAsync = promisify(exec);

// Create a temporary test directory
const testDir = path.join(process.cwd(), "test-simple");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create a simple project structure
const project = {
  name: "simple-project",
  dependencies: {
    express: "^4.17.1",
    lodash: "^4.17.21",
    "left-pad": "^1.3.0",
    "is-positive": "^1.0.0",
  },
};

// Setup test environment
async function setupTestEnvironment() {
  console.log(chalk.cyan("🚀 Setting up simple project test environment...\n"));

  // Create package.json
  fs.writeFileSync(
    path.join(testDir, "package.json"),
    JSON.stringify(project, null, 2)
  );

  // Install dependencies
  console.log(chalk.yellow("📦 Installing dependencies..."));
  try {
    await execAsync("npm install", { cwd: testDir });
    console.log(chalk.green("✅ Dependencies installed"));
  } catch (error) {
    console.error(
      chalk.red("❌ Error installing dependencies:"),
      error.message
    );
    throw error;
  }
}

// Run the test
async function runTest() {
  try {
    // Setup test environment
    await setupTestEnvironment();

    console.log(
      chalk.cyan("\n🚀 Running npm-uninstall-unused on simple project...\n")
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
