import fs from "fs";
import path from "path";
import { exec } from "child_process";
import chalk from "chalk";
import { promisify } from "util";

const execAsync = promisify(exec);

const testDir = path.join(process.cwd(), "test-complex-monorepo");
if (!fs.existsSync(testDir)) {
  fs.mkdirSync(testDir);
}

// Create a complex monorepo structure
const packages = [
  {
    name: "apps/web",
    dependencies: {
      express: "^4.17.1",
      "body-parser": "^1.20.2",
      "left-pad": "^1.3.0", // unused package
    },
  },
  {
    name: "apps/mobile",
    dependencies: {
      axios: "^1.6.0",
      moment: "^2.29.4",
      "is-positive": "^1.0.0", // unused package
    },
  },
  {
    name: "packages/shared",
    dependencies: {
      typescript: "^5.0.0",
      "tiny-tfidf": "^0.9.0", // unused package
    },
  },
];

// Setup test environment
async function setupTestEnvironment() {
  console.log(
    chalk.cyan("🚀 Setting up complex monorepo test environment...\n")
  );

  // Create root package.json
  const rootPackageJson = {
    name: "test-complex-monorepo",
    private: true,
    workspaces: ["apps/*", "packages/*"],
  };

  fs.writeFileSync(
    path.join(testDir, "package.json"),
    JSON.stringify(rootPackageJson, null, 2)
  );

  // Setup test packages
  for (const pkg of packages) {
    const pkgDir = path.join(testDir, pkg.name);
    const pkgDirParts = pkg.name.split("/");

    // Create nested directories
    let currentPath = testDir;
    for (const part of pkgDirParts) {
      currentPath = path.join(currentPath, part);
      if (!fs.existsSync(currentPath)) {
        fs.mkdirSync(currentPath);
      }
    }

    // Create package.json
    fs.writeFileSync(
      path.join(pkgDir, "package.json"),
      JSON.stringify(
        {
          name: pkgDirParts[pkgDirParts.length - 1],
          dependencies: pkg.dependencies,
        },
        null,
        2
      )
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
      chalk.cyan("\n🚀 Running npm-uninstall-unused on complex monorepo...\n")
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
