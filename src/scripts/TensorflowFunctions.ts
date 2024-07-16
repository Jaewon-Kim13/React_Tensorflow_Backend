import * as tf from "@tensorflow/tfjs-node";
import { convertLayers } from "./nnscripts";
//main functions
export const compileModel = async (layers: any[], loss: string) => {
	try {
		const layerArr = convertLayers(layers);
		const model = tf.sequential();
		if (layers[0].type == "Conv2D") {
			layers[0].inputShape = [28, 28, 1];
		}

		layerArr?.forEach((layer: any, index: any) => {
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
			loss: loss,
			optimizer: tf.train.adam(0.01),
			metrics: ["accuracy"],
		});

		return model;
	} catch (error) {}
};

export const train = async (model: tf.LayersModel, dataName: string, index: number) => {};

export const predict = (data: number[], model: any) => {
	const tensor = tf.tensor(data);
};
