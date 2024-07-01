import fileSystem from "node:fs";

/* All three of fs.readFile(), fs.readFileSync() and fsPromises.readFile() read the full content of the file in memory before returning the data.

This means that big files are going to have a major impact on your memory consumption and speed of execution of the program.

In this case, a better option is to read the file content using streams. */

//For testing I'm using fs.readfile, but since the csv files are big, its better to use file streams

//Claude 3.5 changed the function to use promises!it works now!
export function getNumberData() {
    return new Promise((resolve, reject) => {
        fileSystem.readFile("./data/num_train_small.csv", "utf8", (err, data) => {
            if (err) {
                console.error(err);
                reject(err);
            } else {
                resolve(data.split("\n"));
            }
        });
    });
}

/* OLD CODE

export default function getNumberData() {
	const dataJSON = {};
	fileSystem.readFile("/data/num_train.csv", "utf8", (err, data) => {
		if (err) {
			console.error(err);
			return;
		}
		return data.split("\n");
	});
}
*/