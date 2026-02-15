import { createInterface } from "node:readline";
import pc from "picocolors";

/**
 * Ask a yes/no confirmation question.
 * Returns true for "y"/"yes", false for anything else.
 */
export function confirm(message: string): Promise<boolean> {
	return new Promise((resolve) => {
		const rl = createInterface({
			input: process.stdin,
			output: process.stdout,
		});

		rl.question(`  ${message} ${pc.dim("(y/n)")} `, (answer) => {
			rl.close();
			const normalized = answer.trim().toLowerCase();
			resolve(normalized === "y" || normalized === "yes");
		});
	});
}
