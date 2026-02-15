import {
	findProcesses,
	isValidPort,
	killProcess,
	listAllListening,
	parsePorts,
} from "./process.js";
import { confirm } from "./prompt.js";
import {
	showError,
	showFreeingSummary,
	showHelp,
	showKillFailed,
	showKillSuccess,
	showListEmpty,
	showListHeader,
	showListRow,
	showPortFree,
	showProcessInfo,
	showSkipped,
	showVersion,
} from "./ui.js";

const args = process.argv.slice(2);
const command = args[0];

async function main(): Promise<void> {
	if (!command || command === "-h" || command === "--help") {
		showHelp();
	} else if (command === "-v" || command === "--version") {
		showVersion();
	} else if (command === "list" || command === "ls") {
		cmdList();
	} else if (command === "free") {
		await cmdFree(args.slice(1));
	} else if (/^\d+$/.test(command)) {
		await cmdCheck(parseInt(command, 10));
	} else {
		showError(`Unknown command: ${command}`);
		console.log();
		showHelp();
		process.exit(1);
	}
}

/**
 * port <number> — Check a single port, show info, offer to kill.
 */
async function cmdCheck(port: number): Promise<void> {
	if (!isValidPort(port)) {
		showError(`Invalid port: ${port}. Must be between 1 and 65535.`);
		process.exit(1);
	}

	const procs = findProcesses(port);

	if (procs.length === 0) {
		console.log();
		showPortFree(port);
		console.log();
		return;
	}

	for (const proc of procs) {
		showProcessInfo(port, proc);

		const shouldKill = await confirm("Kill this process?");

		if (shouldKill) {
			const ok = killProcess(proc.pid);
			if (ok) {
				showKillSuccess(port, proc.pid);
			} else {
				showKillFailed(proc.pid);
			}
		} else {
			showSkipped();
		}
		console.log();
	}
}

/**
 * port free <port|range...> — Free ports without asking.
 */
async function cmdFree(portArgs: string[]): Promise<void> {
	if (portArgs.length === 0) {
		showError("Please specify a port or range. Example: port free 3000-3010");
		process.exit(1);
	}

	const ports = parsePorts(portArgs);

	if (ports.length === 0) {
		showError("No valid ports in the specified range.");
		process.exit(1);
	}

	let freed = 0;
	let total = 0;

	for (const port of ports) {
		const procs = findProcesses(port);
		for (const proc of procs) {
			total++;
			const ok = killProcess(proc.pid);
			if (ok) {
				freed++;
				showKillSuccess(port, proc.pid);
			} else {
				showKillFailed(proc.pid);
			}
		}
	}

	showFreeingSummary(freed, total);
}

/**
 * port list / port ls — List all listening ports.
 */
function cmdList(): void {
	const entries = listAllListening();

	if (entries.length === 0) {
		showListEmpty();
		return;
	}

	showListHeader();

	for (const entry of entries) {
		showListRow(entry.port, entry.process);
	}

	console.log();
	console.log(
		`  ${entries.length} port${entries.length !== 1 ? "s" : ""} in use`,
	);
	console.log();
}

main().catch((err) => {
	showError(err instanceof Error ? err.message : String(err));
	process.exit(1);
});
