import { createInterface } from "node:readline";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { confirm } from "../prompt.js";

vi.mock("node:readline", () => ({
	createInterface: vi.fn(),
}));

const mockedCreateInterface = vi.mocked(createInterface);

beforeEach(() => {
	vi.clearAllMocks();
});

function mockReadline(answer: string) {
	const mockRl = {
		question: vi.fn((_prompt: string, cb: (answer: string) => void) => {
			cb(answer);
		}),
		close: vi.fn(),
	};

	mockedCreateInterface.mockReturnValue(mockRl as never);
	return mockRl;
}

describe("confirm", () => {
	it('returns true for "y"', async () => {
		mockReadline("y");
		expect(await confirm("Kill?")).toBe(true);
	});

	it('returns true for "yes"', async () => {
		mockReadline("yes");
		expect(await confirm("Kill?")).toBe(true);
	});

	it('returns true for "Y" (case insensitive)', async () => {
		mockReadline("Y");
		expect(await confirm("Kill?")).toBe(true);
	});

	it('returns true for "YES" (case insensitive)', async () => {
		mockReadline("YES");
		expect(await confirm("Kill?")).toBe(true);
	});

	it('returns false for "n"', async () => {
		mockReadline("n");
		expect(await confirm("Kill?")).toBe(false);
	});

	it('returns false for "no"', async () => {
		mockReadline("no");
		expect(await confirm("Kill?")).toBe(false);
	});

	it("returns false for empty input", async () => {
		mockReadline("");
		expect(await confirm("Kill?")).toBe(false);
	});

	it("returns false for random text", async () => {
		mockReadline("maybe");
		expect(await confirm("Kill?")).toBe(false);
	});

	it("handles whitespace around answer", async () => {
		mockReadline("  y  ");
		expect(await confirm("Kill?")).toBe(true);
	});

	it("closes readline after answer", async () => {
		const mockRl = mockReadline("y");
		await confirm("Kill?");
		expect(mockRl.close).toHaveBeenCalledOnce();
	});
});
