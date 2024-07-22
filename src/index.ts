import express from "express";
import cors from "cors";
import fileSystem from "node:fs";
import { getNumberData } from "./scripts/DataFunctions";
import { compileModel, trainModel } from "./scripts/TensorflowFunctions";
import * as tf from "@tensorflow/tfjs-node";
import { convertCompilerSettings, convertLayers } from "./scripts/nnscripts";

const app = express();
app.use(cors());
app.use(express.json());

const rawNumberData = getNumberData("./data/num_train_small.csv");
const dataSize = rawNumberData.y.length;

const numberData = tf.tidy(() => {
	const tensorX = tf.tensor(rawNumberData.x).reshape([dataSize, 28, 28, 1]);
	const tensorY = tf.tensor1d(rawNumberData.y);

	return { tensorX, tensorY };
});

//for testing, wont use in final product since all data should be processes in the backend
app.get("/number-data", async (req, res) => {
	try {
		const random = Math.random() * 10000;
		res.send({
			type: "number_test",
			xShape: numberData.tensorX.shape,
			yShape: numberData.tensorY.shape,
			randomSample: { x: rawNumberData.x[dataSize - 1], y: rawNumberData.y[dataSize - 1], length: rawNumberData.y.length },
		});
	} catch (error) {
		res.status(500).send({ error: "Failed to retrieve number data" });
	}
});
////////////////////////////////////////////////////////////////////////////////////////////
//https://axios-http.com/docs/post_example -- how to post using axios!!!! send data over res.body instead of url!
//https://www.geeksforgeeks.org/difference-between-app-get-and-app-post-in-express-js/ -- for the difference between get and post!

//for tf.vis i think it works by rendering the ts.vis() in the dom and then further calls just update it!
//maybe dont use tf vis and use d3.js for visualization, idk
//check maybe sending tf.show()? maybe it returns html?

//compiles model and sends it back will most likely use post
app.post("/compile", async (req, res) => {
	try {
		const { layers, compilerSettings } = req.body;
		const layerArr = convertLayers(layers);
		const compSet = convertCompilerSettings(compilerSettings);
		if (Object.keys(compSet).length === 0) {
			throw new Error("COMPILER SETTING ERROR: Please stop trying to break my site, I'm broken and can barely afford this server :(");
		}
		if (layerArr.length === 0) {
			throw new Error("LAYER ERROR: Please stop trying to break my site, I'm broken and can barely afford this server :(");
		}
		const model = await compileModel(layerArr, compSet);

		const history = await trainModel(model, compSet, numberData);
		//res.json({ Working: "No errors" });
		res.send({ history: history });
	} catch (error) {
		res.send("My guy, I'm am broken there are limits on the settings for a reason, please stop trying to break my site");
	}
});

app.post("/train", (req, res) => {});

//returns a random value from the dataset
app.get("/data/:dataset-name/:index", (req, res) => {});

//trains model and sends it back, look into post-training quantization for optimizing preformance, will most likely use post

app.listen(8804, () => {
	console.log("Backend Connection Established");
});
