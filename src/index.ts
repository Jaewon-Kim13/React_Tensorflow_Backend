import express from "express";
import cors from "cors";
import fileSystem from "node:fs";
import { getNumberData } from "./scripts/DataFunctions";

const app = express();
app.use(cors());
app.use(express.json());

//for testing, wont use in final product since all data should be processes in the backend
app.get("/number-data", async (req, res) => {
	try {
		const numberData = await getNumberData();
		res.send({ type: "number_test", size: [numberData.x.length, numberData.y.length], data: numberData });
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
app.post("/compile", (req, res) => {
	const { layers, loss } = req.body;
});

app.post("/train", (req, res) => {});

//returns a random value from the dataset
app.get("/data/:dataset-name/:index", (req, res) => {});

//trains model and sends it back, look into post-training quantization for optimizing preformance, will most likely use post

app.listen(8800, () => {
	console.log("Backend Connection Established");
});
