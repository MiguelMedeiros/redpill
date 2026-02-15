import { execSync } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	findProcesses,
	isValidPort,
	killProcess,
	listAllListening,
	parsePorts,
} from "../process.js";

vi.mock("node:child_process", () => ({
	execSync: vi.fn(),
}));

const mockedExecSync = vi.mocked(execSync);

beforeEach(() => {
	vi.clearAllMocks();
});

// ---------------------------------------------------------------------------
// isValidPort
// ---------------------------------------------------------------------------
describe("isValidPort", () => {
	it("returns true for port 1", () => {
		expect(isValidPort(1)).toBe(true);
	});

	it("returns true for port 65535", () => {
		expect(isValidPort(65535)).toBe(true);
	});

	it("returns true for common dev ports", () => {
		expect(isValidPort(3000)).toBe(true);
		expect(isValidPort(8080)).toBe(true);
		expect(isValidPort(5432)).toBe(true);
	});

	it("returns false for port 0", () => {
		expect(isValidPort(0)).toBe(false);
	});

	it("returns false for negative port", () => {
		expect(isValidPort(-1)).toBe(false);
	});

	it("returns false for port above 65535", () => {
		expect(isValidPort(65536)).toBe(false);
		expect(isValidPort(99999)).toBe(false);
	});
});

// ---------------------------------------------------------------------------
// parsePorts
// ---------------------------------------------------------------------------
describe("parsePorts", () => {
	it("parses a single port", () => {
		expect(parsePorts(["3000"])).toEqual([3000]);
	});

	it("parses multiple ports", () => {
		expect(parsePorts(["3000", "8080", "5432"])).toEqual([3000, 8080, 5432]);
	});

	it("parses a port range", () => {
		expect(parsePorts(["3000-3003"])).toEqual([3000, 3001, 3002, 3003]);
	});

	it("parses mixed ports and ranges", () => {
		expect(parsePorts(["8080", "3000-3002"])).toEqual([8080, 3000, 3001, 3002]);
	});

	it("ignores invalid port strings", () => {
		expect(parsePorts(["abc", "xyz"])).toEqual([]);
	});

	it("ignores ports out of range", () => {
		expect(parsePorts(["0", "99999"])).toEqual([]);
	});

	it("ignores reversed ranges", () => {
		expect(parsePorts(["3010-3000"])).toEqual([]);
	});

	it("handles empty args", () => {
		expect(parsePorts([])).toEqual([]);
	});

	it("handles range with invalid bounds", () => {
		expect(parsePorts(["0-65536"])).toEqual([]);
	});

	it("handles single-port range", () => {
		expect(parsePorts(["3000-3000"])).toEqual([3000]);
	});
});

// ---------------------------------------------------------------------------
// findProcesses
// ---------------------------------------------------------------------------
describe("findProcesses", () => {
	it("parses lsof output correctly", () => {
		const lsofOutput = [
			"COMMAND   PID         USER   FD   TYPE             DEVICE SIZE/OFF NODE NAME",
			"node    12345 miguelmedeiros   22u  IPv6 0x1234567890abcdef      0t0  TCP *:3000 (LISTEN)",
		].join("\n");

		mockedExecSync
			.mockReturnValueOnce(lsofOutput) // lsof call
			.mockReturnValueOnce("next dev"); // ps call

		const result = findProcesses(3000);

		expect(result).toEqual([
			{
				pid: 12345,
				name: "node",
				user: "miguelmedeiros",
				command: "next dev",
			},
		]);
	});

	it("deduplicates processes with the same PID", () => {
		const lsofOutput = [
			"COMMAND   PID   USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME",
			"node    12345  miguel   22u  IPv6 0xabc      0t0  TCP *:3000 (LISTEN)",
			"node    12345  miguel   23u  IPv4 0xdef      0t0  TCP *:3000 (LISTEN)",
		].join("\n");

		mockedExecSync
			.mockReturnValueOnce(lsofOutput)
			.mockReturnValueOnce("next dev");

		const result = findProcesses(3000);
		expect(result).toHaveLength(1);
	});

	it("returns empty array when no processes found", () => {
		mockedExecSync.mockImplementation(() => {
			throw new Error("no output");
		});

		const result = findProcesses(9999);
		expect(result).toEqual([]);
	});

	it("falls back to process name when ps fails", () => {
		const lsofOutput = [
			"COMMAND   PID   USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME",
			"node    12345  miguel   22u  IPv6 0xabc      0t0  TCP *:3000 (LISTEN)",
		].join("\n");

		mockedExecSync
			.mockReturnValueOnce(lsofOutput)
			.mockImplementationOnce(() => {
				throw new Error("ps failed");
			});

		const result = findProcesses(3000);
		expect(result[0].command).toBe("node");
	});

	it("skips lines with insufficient columns", () => {
		const lsofOutput = [
			"COMMAND   PID   USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME",
			"short line",
			"node    12345  miguel   22u  IPv6 0xabc      0t0  TCP *:3000 (LISTEN)",
		].join("\n");

		mockedExecSync
			.mockReturnValueOnce(lsofOutput)
			.mockReturnValueOnce("next dev");

		const result = findProcesses(3000);
		expect(result).toHaveLength(1);
	});
});

// ---------------------------------------------------------------------------
// listAllListening
// ---------------------------------------------------------------------------
describe("listAllListening", () => {
	it("parses multiple processes on different ports", () => {
		const lsofOutput = [
			"COMMAND   PID   USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME",
			"node    12345  miguel   22u  IPv6 0xabc      0t0  TCP *:3000 (LISTEN)",
			"postgres 6789  miguel   10u  IPv4 0xdef      0t0  TCP 127.0.0.1:5432 (LISTEN)",
		].join("\n");

		mockedExecSync
			.mockReturnValueOnce(lsofOutput)
			.mockReturnValueOnce("next dev")
			.mockReturnValueOnce("/usr/lib/postgresql/14/bin/postgres");

		const result = listAllListening();

		expect(result).toHaveLength(2);
		expect(result[0].port).toBe(3000);
		expect(result[1].port).toBe(5432);
	});

	it("sorts results by port number", () => {
		const lsofOutput = [
			"COMMAND   PID   USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME",
			"node    12345  miguel   22u  IPv6 0xabc      0t0  TCP *:8080 (LISTEN)",
			"node    12346  miguel   22u  IPv6 0xabc      0t0  TCP *:3000 (LISTEN)",
		].join("\n");

		mockedExecSync
			.mockReturnValueOnce(lsofOutput)
			.mockReturnValueOnce("vite")
			.mockReturnValueOnce("next dev");

		const result = listAllListening();

		expect(result[0].port).toBe(3000);
		expect(result[1].port).toBe(8080);
	});

	it("deduplicates by pid:port combo", () => {
		const lsofOutput = [
			"COMMAND   PID   USER   FD   TYPE   DEVICE SIZE/OFF NODE NAME",
			"node    12345  miguel   22u  IPv6 0xabc      0t0  TCP *:3000 (LISTEN)",
			"node    12345  miguel   23u  IPv4 0xdef      0t0  TCP *:3000 (LISTEN)",
		].join("\n");

		mockedExecSync
			.mockReturnValueOnce(lsofOutput)
			.mockReturnValueOnce("next dev");

		const result = listAllListening();
		expect(result).toHaveLength(1);
	});

	it("returns empty array on error", () => {
		mockedExecSync.mockImplementation(() => {
			throw new Error("no output");
		});

		expect(listAllListening()).toEqual([]);
	});
});

// ---------------------------------------------------------------------------
// killProcess
// ---------------------------------------------------------------------------
describe("killProcess", () => {
	it("sends SIGTERM and returns true on success", () => {
		let termCalled = false;
		const killSpy = vi
			.spyOn(process, "kill")
			.mockImplementation((_pid, signal) => {
				if (signal === "SIGTERM") {
					termCalled = true;
					return true;
				}
				if (signal === 0) {
					// Process is already dead after SIGTERM
					throw new Error("ESRCH");
				}
				return true;
			});

		mockedExecSync.mockReturnValue("");

		const result = killProcess(99999);
		expect(result).toBe(true);
		expect(termCalled).toBe(true);

		killSpy.mockRestore();
	});

	it("returns false when process.kill throws on SIGTERM", () => {
		const killSpy = vi.spyOn(process, "kill").mockImplementation(() => {
			throw new Error("EPERM");
		});

		const result = killProcess(99999);
		expect(result).toBe(false);

		killSpy.mockRestore();
	});
});
