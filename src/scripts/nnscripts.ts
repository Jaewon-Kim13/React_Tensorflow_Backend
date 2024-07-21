import * as tf from "@tensorflow/tfjs-node";

//Interfaces
export interface DenseLayer {
	activation: string;
	units: number;
	kernelRegularizer: { regularizer: string; lambda: number } | any;
	kernelInitializer: string;
}
export interface Conv2DLayer {
	kernelSize: number; //window size, so if 5, then the window is 5x5
	filters: number; //the number of kernelSize windows that is applied to the data
	strides: number; //the step size of window!
	activation: string;
	kernelRegularizer: { regularizer: string; lambda: number } | any;
	kernelInitializer: string;
}

export interface MaxPooling2D {
	poolSize: number[];
	strides: number[];
}

export interface Flatten {}

export interface Layer {
	type: string;
	layer: DenseLayer | Conv2DLayer | MaxPooling2D | Flatten; //adding any to call properties without errors
}

export const MNISTShape = [28, 28, 1];

//useful constants
export const lossList = [
	"meanSquaredError",
	"meanAbsoluteError",
	"meanAbsolutePercentageError",
	"meanSquaredLogarithmicError",
	"squaredHinge",
	"hinge",
	"categoricalHinge",
	"logcosh",
	"categoricalCrossentropy",
	"sparseCategoricalCrossentropy",
	"binaryCrossentropy",
	"kullbackLeiblerDivergence",
	"poisson",
	"cosineProximity",
];

export const regularizerList = ["l1", "l2", "l1l2"];

export const lambdaList = [0.0, 0.001, 0.01, 0.05, 0.1, 0.2, 0.3];

export const activationList = [
	"elu",
	"hardSigmoid",
	"linear",
	"relu",
	"relu6",
	"selu",
	"sigmoid",
	"softmax",
	"softplus",
	"softsign",
	"tanh",
	"swish",
	"mish",
	"gelu",
	"gelu_new",
];

export const kernelInitializerList = [
	"constant",
	"glorotNormal",
	"glorotUniform",
	"heNormal",
	"heUniform",
	"identity",
	"leCunNormal",
	"leCunUniform",
	"ones",
	"orthogonal",
	"randomNormal",
	"randomUniform",
	"truncatedNormal",
	"varianceScaling",
	"zeros",
];

//helper functions
export const convertLayers = (layers: any[]) => {
	//first check if the layers object has been mannipulated
	const layerCheck: Layer[] = layers;
	//validate the layers data
	let fixedLayers = layers.map((layerObj, index) => {
		switch (layerObj.type) {
			case "Flatten":
				validateFlatten(layerObj.layer);
				return layerObj;
			case "MaxPooling2D":
				validateMaxPooling2D(layerObj.layer);
				return layerObj;
			case "Dense":
				validateDense(layerObj.layer);
				const copy: any = { ...layerObj };
				copy.layer.kernelRegularizer = regularizerToFunction(copy.layer.kernelRegularizer);
				return copy;
			case "Conv2D":
				validateConv2D(layerObj.layer);
				const copy2: any = { ...layerObj };
				copy2.layer.kernelRegularizer = regularizerToFunction(copy2.layer.kernelRegularizer);
				return copy2;
			default:
				throw new Error("Invaild Layer");
		}
	});

	return fixedLayers;
};

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

export const convertOptimizer = (optimizer: { name: string; learningRate: number }) => {
	let optimizerFunction;
	switch (optimizer.name) {
		case "sdg":
			optimizerFunction = tf.train.sgd(optimizer.learningRate);
			break;
		case "adam":
			optimizerFunction = tf.train.adam(optimizer.learningRate);
			break;
	}
	return optimizerFunction;
};

const validateDense = (layer: any) => {
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
};

const validateConv2D = (layer: any) => {
	if (layer.kernelSize > 10 || layer.kerenelSize < 1) throw new Error("Invaild kerenelSize");
	if (layer.filters > 20 || layer.filters < 1) throw new Error("Invaild filters");
	if (layer.strides > 10 || layer.strides < 1) throw new Error("Invaild strides");
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
};

const validateMaxPooling2D = (layer: any) => {
	//if pool size is invalid is could crash the backend

	const pool = layer.poolSize[0] * layer.poolSize[1];
	const strides = layer.strides[0] * layer.strides[1];
	if (pool > 100 || layer.units < 1) throw new Error("Invaild poolSize");
	if (layer.units > 100 || layer.units < 1) throw new Error("Invaild poolSize");
};

const validateFlatten = (layer: any) => {
	if (Object.keys(layer).length != 0) throw new Error("Invaild Flatten Layer");
};

const validateCompilerSettings = (setting: any) => {};
