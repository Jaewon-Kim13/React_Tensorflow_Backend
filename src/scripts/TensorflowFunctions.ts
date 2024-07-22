import * as tf from "@tensorflow/tfjs-node";
import { convertCompilerSettings, convertLayers, convertOptimizer } from "./nnscripts";

//main functions
export const compileModel = async (layers: any[], compilerSettings: any) => {
	const model = tf.sequential();
	if (layers[0].type == "Conv2D") {
		layers[0].layer.inputShape = [28, 28, 1];
	}

	layers.forEach((layer: any, index: any) => {
		switch (layer.type) {
			case "Flatten":
				model.add(tf.layers.flatten());
				break;
			case "MaxPooling2D":
				model.add(tf.layers.maxPool2d(layer.layer));
				break;
			case "Dense":
				model.add(tf.layers.dense(layer.layer));
				break;
			case "Conv2D":
				model.add(tf.layers.conv2d(layer.layer));
				break;
			default:
				throw new Error("Invaild Layer");
		}
	});

	model.compile({
		loss: "sparseCategoricalCrossentropy",
		optimizer: compilerSettings.optimizer,
		metrics: ["accuracy"],
	});

	return model;
};

export const trainModel = async (model: tf.LayersModel, compilerSettings: any, data: { tensorX: tf.Tensor; tensorY: tf.Tensor }) => {
	const testingAmount = Math.ceil(compilerSettings.ratio * data.tensorX.shape[0]);
	const trainingAmount = data.tensorX.shape[0] - testingAmount;

	const [testX, trainX] = tf.split(data.tensorX, [testingAmount, trainingAmount]);
	const [testY, trainY] = tf.split(data.tensorY, [testingAmount, trainingAmount]);

	return model.fit(trainX, trainY, {
		batchSize: compilerSettings.batchSize,
		validationData: [testX, testY],
		epochs: compilerSettings.epochs,
		shuffle: true,
	});
};

export const predict = (data: number[], model: any) => {
	const tensor = tf.tensor(data);
};
