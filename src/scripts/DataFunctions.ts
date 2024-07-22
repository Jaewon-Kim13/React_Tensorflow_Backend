import { slice } from "@tensorflow/tfjs-node";
import { TFEOpAttr } from "@tensorflow/tfjs-node/dist/tfjs_binding";
import fileSystem from "node:fs";

import * as tf from "@tensorflow/tfjs-node";

export function getNumberData(): { x: number[][]; y: number[] } {
	try {
		const fileContent = fileSystem.readFileSync("./data/num_train_small.csv", "utf8");
		const result = numCSVtoJSON(fileContent.split("\r\n"));
		return result;
	} catch (err) {
		console.error(err);
		throw err;
	}
}

function numCSVtoJSON(strArr: string[]): { x: number[][]; y: number[] } {
	const x: number[][] = [];
	const y: number[] = [];

	strArr.forEach((string) => {
		let data = string.split(",").map(Number);
		x.push(data.slice(1));
		y.push(data.shift() ?? -1);
	});

	x.shift();
	y.shift();

	return { x, y };
}
