import type { APIRoute } from 'astro';
import { exec } from 'child_process';
import { promisify } from 'util';
import type { SystemCommandRequest, SystemCommandResponse } from '@/types';

const execAsync = promisify(exec);

// Whitelist of allowed commands for security
const DEFAULT_WHITELIST = [
  'ls', 'pwd', 'cd', 'cat', 'echo', 'mkdir', 'touch', 
  'rm', 'cp', 'mv', 'find', 'grep', 'head', 'tail',
  'wc', 'sort', 'uniq', 'curl', 'wget', 'git', 'npm',
  'node', 'python', 'python3', 'pip', 'brew'
];

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json() as SystemCommandRequest;
    const { command, cwd, timeout = 30000, env = {} } = body;

    if (!command || command.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Command is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Security check - extract command name
    const commandName = command.trim().split(' ')[0];
    
    // Check if command is in whitelist
    if (!DEFAULT_WHITELIST.includes(commandName)) {
      return new Response(
        JSON.stringify({ 
          error: `Command '${commandName}' is not in the whitelist. Allowed commands: ${DEFAULT_WHITELIST.join(', ')}` 
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const startTime = Date.now();
    
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: cwd || process.cwd(),
        timeout,
        env: { ...process.env, ...env },
        maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      });

      const response: SystemCommandResponse = {
        stdout: stdout || '',
        stderr: stderr || '',
        exitCode: 0,
        executedAt: startTime,
        duration: Date.now() - startTime,
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    } catch (execError: any) {
      // Command executed but returned error
      const response: SystemCommandResponse = {
        stdout: execError.stdout || '',
        stderr: execError.stderr || execError.message,
        exitCode: execError.code || 1,
        executedAt: startTime,
        duration: Date.now() - startTime,
      };

      return new Response(
        JSON.stringify(response),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }
  } catch (error) {
    console.error('System command error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Failed to execute command' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};

// GET endpoint to retrieve allowed commands
export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({ 
      whitelist: DEFAULT_WHITELIST,
      systemAccessEnabled: true 
    }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
