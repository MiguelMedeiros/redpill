import { execSync } from "node:child_process";

export interface PortProcess {
	pid: number;
	name: string;
	user: string;
	command: string;
}

/**
 * Find all processes listening on a given port.
 */
export function findProcesses(port: number): PortProcess[] {
	try {
		const output = execSync(`lsof -i :${port} -P -n -sTCP:LISTEN 2>/dev/null`, {
			encoding: "utf-8",
		});

		const lines = output.trim().split("\n").slice(1); // skip header
		const seen = new Set<number>();
		const results: PortProcess[] = [];

		for (const line of lines) {
			const parts = line.trim().split(/\s+/);
			if (parts.length < 9) continue;

			const name = parts[0];
			const pid = parseInt(parts[1], 10);
			const user = parts[2];

			if (Number.isNaN(pid) || seen.has(pid)) continue;
			seen.add(pid);

			const command = getCommand(pid) || name;
			results.push({ pid, name, user, command });
		}

		return results;
	} catch {
		return [];
	}
}

/**
 * List all processes listening on any port.
 */
export function listAllListening(): { port: number; process: PortProcess }[] {
	try {
		const output = execSync(`lsof -i -P -n -sTCP:LISTEN 2>/dev/null`, {
			encoding: "utf-8",
		});

		const lines = output.trim().split("\n").slice(1);
		const seen = new Set<string>();
		const results: { port: number; process: PortProcess }[] = [];

		for (const line of lines) {
			const parts = line.trim().split(/\s+/);
			if (parts.length < 9) continue;

			const name = parts[0];
			const pid = parseInt(parts[1], 10);
			const user = parts[2];
			const addrCol = parts[8]; // e.g. *:3000 or 127.0.0.1:8080

			if (Number.isNaN(pid)) continue;

			const portMatch = addrCol.match(/:(\d+)$/);
			if (!portMatch) continue;

			const port = parseInt(portMatch[1], 10);
			const key = `${pid}:${port}`;
			if (seen.has(key)) continue;
			seen.add(key);

			const command = getCommand(pid) || name;
			results.push({ port, process: { pid, name, user, command } });
		}

		// Sort by port number
		results.sort((a, b) => a.port - b.port);
		return results;
	} catch {
		return [];
	}
}

/**
 * Get the full command line of a process by PID.
 */
function getCommand(pid: number): string {
	try {
		return execSync(`ps -p ${pid} -o command= 2>/dev/null`, {
			encoding: "utf-8",
		}).trim();
	} catch {
		return "";
	}
}

/**
 * Kill a process by PID with SIGTERM, fallback to SIGKILL.
 */
export function killProcess(pid: number): boolean {
	try {
		process.kill(pid, "SIGTERM");

		// Wait briefly and check if still alive
		let alive = true;
		for (let i = 0; i < 10; i++) {
			try {
				process.kill(pid, 0); // check existence
				execSync("sleep 0.1");
			} catch {
				alive = false;
				break;
			}
		}

		// Force kill if still alive
		if (alive) {
			try {
				process.kill(pid, "SIGKILL");
			} catch {
				// already dead
			}
		}

		return true;
	} catch {
		return false;
	}
}

/**
 * Parse port arguments: supports single ports, ranges (3000-3010), and mixed.
 */
export function parsePorts(args: string[]): number[] {
	const ports: number[] = [];

	for (const arg of args) {
		if (arg.includes("-")) {
			const [startStr, endStr] = arg.split("-");
			const start = parseInt(startStr, 10);
			const end = parseInt(endStr, 10);

			if (Number.isNaN(start) || Number.isNaN(end) || start > end) continue;
			if (!isValidPort(start) || !isValidPort(end)) continue;

			for (let p = start; p <= end; p++) {
				ports.push(p);
			}
		} else {
			const p = parseInt(arg, 10);
			if (!Number.isNaN(p) && isValidPort(p)) {
				ports.push(p);
			}
		}
	}

	return ports;
}

export function isValidPort(port: number): boolean {
	return port >= 1 && port <= 65535;
}
