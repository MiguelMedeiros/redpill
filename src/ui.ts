import pc from "picocolors";
import type { PortProcess } from "./process.js";

const VERSION = "1.0.0";

const LOGO = `
  ${pc.bold(pc.red("💊 redpill"))} ${pc.dim(`v${VERSION}`)}
  ${pc.dim('Kill "port already in use" forever.')}
`;

export function showLogo(): void {
	console.log(LOGO);
}

export function showVersion(): void {
	console.log(`redpill v${VERSION}`);
}

export function showHelp(): void {
	console.log(LOGO);
	console.log(`  ${pc.bold("Usage:")}`);
	console.log();
	console.log(
		`    ${pc.red("redpill")} ${pc.white("<port>")}            Check port & offer to kill`,
	);
	console.log(
		`    ${pc.red("redpill")} ${pc.white("free <port|range>")} Free ports (no prompt)`,
	);
	console.log(
		`    ${pc.red("redpill")} ${pc.white("list")} | ${pc.white("ls")}          List all listening ports`,
	);
	console.log(
		`    ${pc.red("redpill")} ${pc.dim("-h, --help")}         Show this help`,
	);
	console.log(
		`    ${pc.red("redpill")} ${pc.dim("-v, --version")}      Show version`,
	);
	console.log();
	console.log(`  ${pc.bold("Examples:")}`);
	console.log();
	console.log(
		`    ${pc.dim("$")} ${pc.white("redpill 3000")}         ${pc.dim("Who's using port 3000?")}`,
	);
	console.log(
		`    ${pc.dim("$")} ${pc.white("redpill free 3000")}    ${pc.dim("Kill it immediately")}`,
	);
	console.log(
		`    ${pc.dim("$")} ${pc.white("redpill free 3000-3010")} ${pc.dim("Free an entire range")}`,
	);
	console.log(
		`    ${pc.dim("$")} ${pc.white("redpill ls")}           ${pc.dim("Show all listening ports")}`,
	);
	console.log();
}

export function showProcessInfo(port: number, proc: PortProcess): void {
	console.log();
	console.log(`  ${pc.bold(pc.red("💊 redpill"))} ${pc.white(String(port))}`);
	console.log();
	console.log(`  ${pc.dim("PID")}   ${pc.bold(pc.white(String(proc.pid)))}`);
	console.log(`  ${pc.dim("Name")}  ${pc.white(proc.name)}`);
	console.log(`  ${pc.dim("Cmd")}   ${pc.white(proc.command)}`);
	console.log(`  ${pc.dim("User")}  ${pc.white(proc.user)}`);
	console.log();
}

export function showPortFree(port: number): void {
	console.log(`  ${pc.green("✓")} Port ${pc.bold(String(port))} is free`);
}

export function showKillSuccess(port: number, pid: number): void {
	console.log(
		`  ${pc.green("✓")} Killed process ${pc.bold(String(pid))} on port ${pc.bold(String(port))}`,
	);
}

export function showKillFailed(pid: number): void {
	console.log(
		`  ${pc.red("✗")} Failed to kill process ${pc.bold(String(pid))}. Try with ${pc.yellow("sudo")}.`,
	);
}

export function showSkipped(): void {
	console.log(`  ${pc.dim("Skipped.")}`);
}

export function showError(message: string): void {
	console.log(`  ${pc.red("✗")} ${message}`);
}

export function showListHeader(): void {
	console.log();
	console.log(`  ${pc.bold(pc.red("💊 redpill"))} ${pc.dim("ls")}`);
	console.log();
	console.log(
		`  ${pc.dim(pad("PORT", 8))}${pc.dim(pad("PID", 10))}${pc.dim(pad("NAME", 16))}${pc.dim("COMMAND")}`,
	);
	console.log(`  ${pc.dim("─".repeat(60))}`);
}

export function showListRow(port: number, proc: PortProcess): void {
	console.log(
		`  ${pc.cyan(pad(String(port), 8))}${pc.white(pad(String(proc.pid), 10))}${pc.white(pad(proc.name, 16))}${pc.dim(truncate(proc.command, 40))}`,
	);
}

export function showListEmpty(): void {
	console.log();
	console.log(`  ${pc.dim("No listening ports found.")}`);
	console.log();
}

export function showFreeingSummary(freed: number, total: number): void {
	console.log();
	if (freed === 0 && total === 0) {
		console.log(`  ${pc.dim("No processes found on the specified ports.")}`);
	} else {
		console.log(
			`  ${pc.green("✓")} Freed ${pc.bold(String(freed))}/${total} ports`,
		);
	}
	console.log();
}

function pad(str: string, len: number): string {
	return str.length >= len ? `${str} ` : str + " ".repeat(len - str.length);
}

function truncate(str: string, max: number): string {
	return str.length > max ? `${str.slice(0, max - 1)}…` : str;
}
