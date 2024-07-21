import { slice } from "@tensorflow/tfjs-node";
import { TFEOpAttr } from "@tensorflow/tfjs-node/dist/tfjs_binding";
import fileSystem from "node:fs";

import * as tf from "@tensorflow/tfjs-node";

/* All three of fs.readFile(), fs.readFileSync() and fsPromises.readFile() read the full content of the file in memory before returning the data.

This means that big files are going to have a major impact on your memory consumption and speed of execution of the program.

In this case, a better option is to read the file content using streams. */

//For testing I'm using fs.readfile, but since the csv files are big, its better to use file streams

// export async function getNumberData(): Promise<{ x: number[][]; y: number[] }> {
// 	return new Promise((resolve, reject) => {
// 		fileSystem.readFile("./data/num_train_small.csv", "utf8", (err: any, fileContent: string) => {
// 			if (err) {
// 				console.error(err);
// 				reject(err);
// 			} else {
// 				const result = numCSVtoJSON(fileContent.split("\r\n"));
// 				resolve(result);
// 			}
// 		});
// 	});
// }

// const numCSVtoJSON = (strArr: string[]): { x: number[][]; y: number[] } => {
// 	const x: number[][] = [];
// 	const y: number[] = [];
// 	strArr.map((string) => {
// 		let data = string.split(",").map(Number);
// 		x.push(data.slice(1));
// 		y.push(data.shift() ?? -1);
// 	});
// 	x.shift();
// 	y.shift();
// 	return { x: x, y: y };
// };

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
