const { contextBridge, ipcRenderer } = require('electron');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs');
const path = require('path');
const os = require('os');

const execAsync = promisify(exec);

// Expose protected methods that allow the renderer process to use
// specific node modules and system access
contextBridge.exposeInMainWorld('electronAPI', {
  // System info
  platform: process.platform,
  arch: process.arch,
  homedir: os.homedir(),
  
  // File system operations
  fs: {
    readFile: (filepath, options) => fs.promises.readFile(filepath, options),
    writeFile: (filepath, data) => fs.promises.writeFile(filepath, data),
    exists: (filepath) => fs.existsSync(filepath),
    readdir: (dirpath) => fs.promises.readdir(dirpath),
    mkdir: (dirpath) => fs.promises.mkdir(dirpath, { recursive: true }),
    stat: (filepath) => fs.promises.stat(filepath),
  },
  
  // Path utilities
  path: {
    join: (...args) => path.join(...args),
    resolve: (...args) => path.resolve(...args),
    dirname: (filepath) => path.dirname(filepath),
    basename: (filepath) => path.basename(filepath),
    extname: (filepath) => path.extname(filepath),
  },
  
  // System command execution
  execCommand: async (command, options = {}) => {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: options.cwd || os.homedir(),
        timeout: options.timeout || 30000,
        env: { ...process.env, ...options.env },
        maxBuffer: 1024 * 1024 * 10, // 10MB
      });
      return {
        success: true,
        stdout,
        stderr,
        exitCode: 0,
      };
    } catch (error) {
      return {
        success: false,
        stdout: error.stdout || '',
        stderr: error.stderr || error.message,
        exitCode: error.code || 1,
      };
    }
  },
  
  // Check if command is available
  checkCommand: async (command) => {
    try {
      const { stdout } = await execAsync(`which ${command}`);
      return stdout.trim().length > 0;
    } catch {
      return false;
    }
  },
  
  // Environment variables
  getEnv: (name) => process.env[name],
  setEnv: (name, value) => { process.env[name] = value; },
  
  // App info
  versions: {
    node: process.versions.node,
    electron: process.versions.electron,
    chrome: process.versions.chrome,
  },
});

// Notify when preload is ready
console.log('[Preload] Electron API exposed successfully');
