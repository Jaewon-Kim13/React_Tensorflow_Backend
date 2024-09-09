import express from "express";
import cors from "cors";
import fileSystem from "node:fs";
import { getNumberData } from "./scripts/DataFunctions";
import { compileModel, getModelWeights, trainModel } from "./scripts/TensorflowFunctions";
import * as tf from "@tensorflow/tfjs-node";
import { convertCompilerSettings, convertLayers } from "./scripts/nnscripts";
import e from "express";
const db = require("./scripts/db");
const crypto = require("crypto");
import { hash, compare, genSalt } from "bcryptjs";
const saltRounds = 10;

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
		const untrainedWeights = await getModelWeights(model, layers);

		const history = await trainModel(model, compSet, numberData);
		const trainedWeights = await getModelWeights(model, layers);

		//res.json({ Working: "No errors" });
		res.send({ history: history, model: model, trainedWeights: trainedWeights, untrainedWeights: untrainedWeights });
	} catch (error) {
		console.log(error);
		res.send({ error: "ERROR " + error?.toString() });
	}
});

//returns a random value from the dataset
app.get("/data/:dataset-name/:index", (req, res) => {});

//trains model and sends it back, look into post-training quantization for optimizing preformance, will most likely use post

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//create user
app.post("/create-user", async (req, res) => {
	try {
		const { username, password } = req.body;
		if (!username || !password) {
			return res.status(401).json({ error: "Username and password are required" });
		}

		const tempRand = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
		const sessionKey = await hash(tempRand, saltRounds);

		genSalt(10, function (err, salt) {
			hash(password, salt, async function (err, hash) {
				console.log(
					`--------\nUsername: ${username} \nPassword:${password} \nPassword Hash: ${hash + " " + hash.length}\nSession Key: ${sessionKey}`
				);
				const result = await db.query("INSERT INTO users (username, passwordHash, sessionkey) VALUES ($1, $2, $3)", [username, hash, sessionKey]);
				res.send({ sessionKey: sessionKey });
			});
		});
	} catch (error) {
		console.log(error);
		res.send(400);
	}
});

//the login function: Generates a new session key to validate other calls
app.get("/login/:username/:password", async (req, res) => {
	try {
		const { username, password } = req.params;
		if (!username || !password) {
			return res.status(401).json({ error: "Username and password are required" });
		}

		const tempRand = Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString();
		const sessionKey = await hash(tempRand, saltRounds);
		const hashP = await db.query("SELECT passwordhash FROM users WHERE username = $1", [username]);
		console.log("Login HASH: " + hashP.rows[0].passwordhash);

		await compare(password, hashP.rows[0].passwordhash, async (err, res) => {
			if (err) console.log("error");
			const result = await db.query("UPDATE users SET sessionkey = $1 WHERE username = $2", [sessionKey, username]);
			console.log("Login Working");
		});

		res.send({ sessionKey: sessionKey });
	} catch (error) {
		console.log(error);
		res.send(400);
	}
});

//saves the user model to db
app.post("/save-model", async (req, res) => {
	try {
		const { username, sessionKey, model, modelName } = req.body;
		const user = db.query(`SELECT id, modelCount FROM users WHERE username = ${username} AND sessionKey = ${sessionKey};`);

		if (user == null) throw new Error("ERROR SAVING MODEL");
		if (user.modelCount >= 10) throw new Error("model count too high");

		await db.query(`INSERT INTO models (userId, title, model) VALUES (${user.id}, ${modelName}, ${model}) RETURNING id, userId, title;`);
		await db.query(`UPDATE users SET modelCount = modelCount + 1 WHERE id = ${user.id} AND sessionKey = ${sessionKey};`);
		res.send(200);
	} catch (error) {
		console.log(error);
		res.send(400);
	}
});

//deletes the users model
app.get("/:username/:sessionKey/delete-model/:title", async (req, res) => {
	try {
		const { username, sessionKey, title } = req.params;
		const user = db.query(`SELECT id, sessionKey, modelCount FROM users WHERE username = ${username} AND sessionKey = ${sessionKey};`);

		if (user == null) throw new Error("ERROR DELETING MODEL");
		if (user.modelCount == 0) throw new Error("model count aleady zero");

		await db.query(`DELETE FROM models WHERE title = ${title};`);
		await db.query(`UPDATE users SET modelCount = modelCount - 1 WHERE id = ${user.id} AND sessionKey = ${sessionKey};`);
		res.send(200);
	} catch (error) {
		console.log(error);
		res.send(400);
	}
});

//gets the users model names
app.get("/:username/:sessionKey/titles", async (req, res) => {
	try {
		const { username, sessionKey } = req.params;
		const user = db.query(`SELECT id, username, model_count FROM users WHERE username = ${username} AND sessionKey = ${sessionKey};`);

		if (user == null) throw new Error("ERROR SAVING MODEL");
		if (user.sessionKey != sessionKey) throw new Error("ERROR FETCHING MODEL LIST");

		const models = await db.query(`SELECT title FROM models WHERE userId = ${user.id} ORDER BY id;`);
		res.send({ names: models });
	} catch (error) {
		console.log(error);
		res.send(400);
	}
});

//gets a specific model based on title name
app.get("/:username/:sessionKey/model/:title", async (req, res) => {
	try {
		const { username, sessionKey, title } = req.params;
		const user = db.query(`SELECT id, username, model_count FROM users WHERE username = ${username} AND sessionKey = ${sessionKey};`);

		if (user == null) throw new Error("ERROR FETCHING MODEL");
		if (user.sessionKey == sessionKey) throw new Error("INCORRECT PASSWORD! STOP TRYING TO HACK ME I AM POOR");

		const model = await db.query(`SELECT model FROM models WHERE title = ${title};`);
		res.send({ model: model });
	} catch (error) {
		console.log(error);
		res.send(400);
	}
});

app.listen(8804, () => {
	console.log("Backend Connection Established");
});
