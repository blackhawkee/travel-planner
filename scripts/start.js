const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const chalk = require('chalk') || { green: s => s, blue: s => s, yellow: s => s };

// Utility to handle paths across OS
const rootDir = path.resolve(__dirname, '..');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// Check for .env file
const envFile = path.join(backendDir, '.env');
const envExampleFile = path.join(backendDir, '.env.example');

if (!fs.existsSync(envFile) && fs.existsSync(envExampleFile)) {
  console.log(chalk.blue('Creating .env file from example...'));
  fs.copyFileSync(envExampleFile, envFile);
  console.log(chalk.green('Created .env file. Please edit it with your API keys.'));
}

// Helper to start a process
function startProcess(command, args, options, name) {
  console.log(chalk.blue(`Starting ${name}...`));
  
  const proc = spawn(command, args, {
    ...options,
    stdio: 'inherit',
    shell: true
  });
  
  proc.on('error', (error) => {
    console.error(chalk.yellow(`Error starting ${name}:`, error.message));
  });
  
  return proc;
}

// Start backend
const isWindows = process.platform === 'win32';
const pythonCmd = isWindows ? 'python' : 'python3';
const backend = startProcess(
  pythonCmd, 
  ['-m', 'uvicorn', 'main:app', '--reload', '--host', '0.0.0.0', '--port', '8000'],
  { cwd: backendDir },
  'backend'
);

// Wait a bit for backend to start up
setTimeout(() => {
  // Start frontend
  const frontend = startProcess(
    isWindows ? 'npm.cmd' : 'npm',
    ['start'],
    { cwd: frontendDir },
    'frontend'
  );

  console.log(chalk.green(`
=================================================
Travel Planner Application is running:
- Backend server: http://localhost:8000
  API documentation: http://localhost:8000/docs
- Frontend: http://localhost:3000
=================================================
Press Ctrl+C to stop all services
`));

  // Handle exit
  process.on('SIGINT', () => {
    console.log(chalk.blue('\nShutting down services...'));
    backend.kill();
    frontend.kill();
    process.exit(0);
  });
}, 2000); 