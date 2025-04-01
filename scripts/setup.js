const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk') || { green: s => s, blue: s => s, red: s => s, yellow: s => s };

// Utility to handle paths across OS
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

console.log(chalk.blue('Setting up Travel Planner application...'));

// Check for .env file
const envFile = path.join(backendDir, '.env');
const envExampleFile = path.join(backendDir, '.env.example');

if (!fs.existsSync(envFile) && fs.existsSync(envExampleFile)) {
  console.log(chalk.blue('Creating .env file from example...'));
  fs.copyFileSync(envExampleFile, envFile);
  console.log(chalk.green('Created .env file. Please edit it with your API keys.'));
}

// Setup Python environment
console.log(chalk.blue('\nSetting up Python virtual environment...'));
try {
  const isWindows = process.platform === 'win32';
  const pythonCmd = isWindows ? 'python' : 'python3';
  
  // Check if venv exists
  const venvPath = path.join(backendDir, 'venv');
  if (!fs.existsSync(venvPath)) {
    console.log('Creating virtual environment...');
    execSync(`${pythonCmd} -m venv venv`, { cwd: backendDir, stdio: 'inherit' });
  }

  // Install Python dependencies
  console.log(chalk.blue('Installing backend dependencies...'));
  const activateCmd = isWindows ? 
    `${path.join(venvPath, 'Scripts', 'activate')} && pip install -r requirements.txt` : 
    `. ${path.join(venvPath, 'bin', 'activate')} && pip install -r requirements.txt`;
  
  execSync(activateCmd, { cwd: backendDir, stdio: 'inherit', shell: true });
  console.log(chalk.green('Backend dependencies installed successfully.'));
} catch (error) {
  console.error(chalk.red('Failed to set up Python environment:'), error.message);
}

// Setup Node.js/frontend environment
console.log(chalk.blue('\nSetting up frontend dependencies...'));
try {
  execSync('npm install', { cwd: frontendDir, stdio: 'inherit' });
  console.log(chalk.green('Frontend dependencies installed successfully.'));
} catch (error) {
  console.error(chalk.red('Failed to install frontend dependencies:'), error.message);
}

console.log(chalk.green(`
=================================================
Setup complete! You can now start the application:

${isWindows ? '> start.bat' : '$ bash start.sh'}

Or using npm:

$ npm start
=================================================
`)); 