import * as tf from "@tensorflow/tfjs-node";
import { convertLayers, convertOptimizer } from "./nnscripts";
import { getNumberData } from "./DataFunctions";
//main functions
export const compileModel = async (layers: any[], compilerSettings: any) => {
	if (layers[0].type == "Conv2D") {
		layers[0].layer.inputShape = [28, 28, 1];
	}
	const layerArr = convertLayers(layers);
	const model = tf.sequential();

	layerArr.forEach((layer: any, index: any) => {
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
		optimizer: tf.train.adam(),
		metrics: ["accuracy"],
	});

	return model;
};

export const trainModel = async (model: tf.LayersModel, compilerSettings: any, data: { tensorX: tf.Tensor; tensorY: tf.Tensor }) => {
	compilerSettings.optimizer = convertOptimizer(compilerSettings.optimizer);
	const dataSize = data.tensorX.shape[0] * (compilerSettings.ratio / 100);

	return model.fit(data.tensorX, data.tensorY, {
		epochs: compilerSettings.epochs,
		shuffle: true,
	});
};

export const predict = (data: number[], model: any) => {
	const tensor = tf.tensor(data);
};
