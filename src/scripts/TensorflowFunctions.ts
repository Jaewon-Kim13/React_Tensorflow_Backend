import * as tf from "@tensorflow/tfjs-node";
import {
	activationList,
	Conv2DLayer,
	DenseLayer,
	Flatten,
	kernelInitializerList,
	lambdaList,
	Layer,
	MaxPooling2D,
	regularizerList,
} from "./InterfacesAndConsts";
import { error } from "console";

//main functions
export const compileDense = async (layers: any[], loss: string, shape: any): Promise<tf.LayersModel> => {
	const newLayers: any = layers.map((layer) => ({
		activation: layer.activation,
		units: layer.units,
		kernelRegularizer: regularizerToFunction(layer.regularizer),
	}));
	newLayers[0].inputShape = shape;
	const model = tf.sequential();
	newLayers.forEach((layer: any, index: any) => {
		model.add(tf.layers.dense(layer));
	});

	model.compile({
		loss: loss,
		optimizer: tf.train.adam(0.01),
		metrics: ["accuracy"],
	});

	return model;
};

export const compileConv2d = async () => {};

export const train = async (model: tf.LayersModel, dataName: string, index: number) => {};

export const predict = (data: number[], model: any) => {
	const tensor = tf.tensor(data);
};

//helper functions
function regularizerToFunction(reg: { regularizer: string; lambda: number }) {
	let regularizerFunction;
	switch (reg.regularizer) {
		case "l1":
			regularizerFunction = tf.regularizers.l1({ l1: reg.lambda });
			break;
		case "l2":
			regularizerFunction = tf.regularizers.l2({ l2: reg.lambda });
			break;
		case "l1l2":
			regularizerFunction = tf.regularizers.l1l2({ l1: reg.lambda, l2: reg.lambda });
			break;
	}

	return regularizerFunction;
}

const convertLayers = (layers: any[]) => {
	try {
		const layerCheck: Layer[] = layers;
		const fixedLayers = layers.map((layerObj, index) => {
			switch (layerObj.type) {
				case "Flatten":
					validateFlatten(layerObj.layer);
					return layerObj.layer;
				case "MaxPooling2D":
					validateMaxPooling2D(layerObj.layer);
					return layerObj.layer;
				case "Dense":
					validateDense(layerObj.layer);
					const copy: any = { ...layerObj };
					copy.layer.kernelRegularizer = regularizerToFunction(copy.layer.kernelRegularizer);
					return copy.layer;
				case "Conv2D":
					validateConv2D(layerObj.layer);
					const copy2: any = { ...layerObj };
					copy2.layer.kernelRegularizer = regularizerToFunction(copy2.layer.kernelRegularizer);
					return copy.layer;
				default:
					throw new Error("Invaild Layer");
			}
		});
		return fixedLayers;
	} catch (error) {
		//here instead save it to an error log
	}
};

const validateDense = (layer: any) => {
	try {
		if (layer.units > 10 || layer.units < 1) throw new Error("Invaild Units");
		if (activationList.find((element) => element == layer.activation) == undefined) {
			throw new Error("Invaild Activation");
		}
		if (regularizerList.find((element) => element == layer.kernelRegularizer.regularizer) == undefined) {
			throw new Error("Invaild regularizer");
		}
		if (lambdaList.find((element) => element == layer.kernelRegularizer.lambda) == undefined) {
			throw new Error("Invaild lambda");
		}
		if (kernelInitializerList.find((element) => element == layer.kernelInitializer) == undefined) {
			throw new Error("Invaild kernelInitializer");
		}
	} catch (error) {
		//send error to backend error log
	}
};

const validateConv2D = (layer: any) => {
	try {
		if (layer.units > 10 || layer.units < 1) throw new Error("Invaild kerenelSize");
		if (layer.units > 10 || layer.units < 1) throw new Error("Invaild filters");
		if (layer.units > 10 || layer.units < 1) throw new Error("Invaild strides");
		if (activationList.find((element) => element == layer.activation) == undefined) {
			throw new Error("Invaild Activation");
		}
		if (regularizerList.find((element) => element == layer.kernelRegularizer.regularizer) == undefined) {
			throw new Error("Invaild regularizer");
		}
		if (lambdaList.find((element) => element == layer.kernelRegularizer.lambda) == undefined) {
			throw new Error("Invaild lambda");
		}
		if (kernelInitializerList.find((element) => element == layer.kernelInitializer) == undefined) {
			throw new Error("Invaild kernelInitializer");
		}
	} catch (error) {
		//send error to backend error log
	}
};

const validateMaxPooling2D = (layer: any) => {
	//if pool size is invalid is could crash the backend
	try {
		const pool = layer.poolSize[0] * layer.poolSize[1];
		const strides = layer.strides[0] * layer.strides[1];
		if (pool > 100 || layer.units < 1) throw new Error("Invaild poolSize");
		if (layer.units > 100 || layer.units < 1) throw new Error("Invaild poolSize");
	} catch (error) {
		//send error to backend error log
	}
};

const validateFlatten = (layer: any) => {
	try {
		if (Object.keys(layer).length === 0) throw new Error("Invaild Flatten Layer");
	} catch (error) {
		//send error to backend error log
	}
};
