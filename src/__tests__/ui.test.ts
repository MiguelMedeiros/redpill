import { beforeEach, describe, expect, it, vi } from "vitest";
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
} from "../ui.js";

let output: string[];

beforeEach(() => {
	output = [];
	vi.spyOn(console, "log").mockImplementation((...args: unknown[]) => {
		output.push(args.map(String).join(" "));
	});
});

describe("showVersion", () => {
	it("prints the version string", () => {
		showVersion();
		expect(output.some((line) => line.includes("redpill v"))).toBe(true);
	});
});

describe("showHelp", () => {
	it("prints help with all commands", () => {
		showHelp();
		const text = output.join("\n");
		expect(text).toContain("redpill");
		expect(text).toContain("free");
		expect(text).toContain("list");
		expect(text).toContain("ls");
		expect(text).toContain("--help");
		expect(text).toContain("--version");
		expect(text).toContain("Examples");
	});
});

describe("showProcessInfo", () => {
	it("displays process details", () => {
		showProcessInfo(3000, {
			pid: 1234,
			name: "node",
			user: "neo",
			command: "next dev",
		});
		const text = output.join("\n");
		expect(text).toContain("3000");
		expect(text).toContain("1234");
		expect(text).toContain("node");
		expect(text).toContain("next dev");
		expect(text).toContain("neo");
	});
});

describe("showPortFree", () => {
	it("shows port is free message", () => {
		showPortFree(3000);
		const text = output.join("\n");
		expect(text).toContain("3000");
		expect(text).toContain("free");
	});
});

describe("showKillSuccess", () => {
	it("shows success message with port and pid", () => {
		showKillSuccess(3000, 1234);
		const text = output.join("\n");
		expect(text).toContain("Killed");
		expect(text).toContain("1234");
		expect(text).toContain("3000");
	});
});

describe("showKillFailed", () => {
	it("shows failure message with sudo hint", () => {
		showKillFailed(1234);
		const text = output.join("\n");
		expect(text).toContain("Failed");
		expect(text).toContain("1234");
		expect(text).toContain("sudo");
	});
});

describe("showSkipped", () => {
	it("shows skipped message", () => {
		showSkipped();
		expect(output.some((line) => line.includes("Skipped"))).toBe(true);
	});
});

describe("showError", () => {
	it("shows error message", () => {
		showError("Something went wrong");
		expect(output.some((line) => line.includes("Something went wrong"))).toBe(
			true,
		);
	});
});

describe("showListHeader", () => {
	it("shows column headers", () => {
		showListHeader();
		const text = output.join("\n");
		expect(text).toContain("PORT");
		expect(text).toContain("PID");
		expect(text).toContain("NAME");
		expect(text).toContain("COMMAND");
		expect(text).toContain("redpill");
	});
});

describe("showListRow", () => {
	it("shows a row with port and process info", () => {
		showListRow(3000, {
			pid: 1234,
			name: "node",
			user: "neo",
			command: "next dev",
		});
		const text = output.join("\n");
		expect(text).toContain("3000");
		expect(text).toContain("1234");
		expect(text).toContain("node");
		expect(text).toContain("next dev");
	});

	it("truncates long commands", () => {
		showListRow(3000, {
			pid: 1234,
			name: "node",
			user: "neo",
			command: "a".repeat(100),
		});
		const text = output.join("\n");
		expect(text).toContain("…");
	});
});

describe("showListEmpty", () => {
	it("shows empty message", () => {
		showListEmpty();
		expect(
			output.some((line) => line.includes("No listening ports found")),
		).toBe(true);
	});
});

describe("showFreeingSummary", () => {
	it("shows freed summary", () => {
		showFreeingSummary(3, 5);
		const text = output.join("\n");
		expect(text).toContain("Freed");
		expect(text).toContain("3");
		expect(text).toContain("5");
	});

	it("shows empty message when no processes found", () => {
		showFreeingSummary(0, 0);
		expect(output.some((line) => line.includes("No processes found"))).toBe(
			true,
		);
	});
});
