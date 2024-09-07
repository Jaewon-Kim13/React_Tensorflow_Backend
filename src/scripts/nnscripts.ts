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
export const optimizerList = ["sgd", "adam"];

//helper functions
export const convertLayers = (layers: any[]) => {
	try {
		//first check if the layers object has been mannipulated
		const layerCheck: Layer[] = layers;
		//validate the layers data
		let fixedLayers = layers.map((layerObj, index) => {
			switch (layerObj.type) {
				case "Flatten":
					if (validateFlatten(layerObj.layer) == false) throw new Error("Invalid Flatten Layer");
					return layerObj;
				case "MaxPooling2D":
					if (!validateMaxPooling2D(layerObj.layer)) throw new Error("Invalid Flatten Layer");
					return layerObj;
				case "Dense":
					if (!validateDense(layerObj.layer)) throw new Error("Invalid Dense Layer");
					const copy: any = { ...layerObj };
					copy.layer.kernelRegularizer = regularizerToFunction(copy.layer.kernelRegularizer);
					return copy;
				case "Conv2D":
					if (!validateConv2D(layerObj.layer)) throw new Error("Invalid Conv2D Layer");
					const copy2: any = { ...layerObj };
					copy2.layer.kernelRegularizer = regularizerToFunction(copy2.layer.kernelRegularizer);
					return copy2;
				default:
					throw new Error("Invaild Layer");
			}
		});
		return fixedLayers;
	} catch (error) {
		return [];
	}
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

const validateDense = (layer: any) => {
	if (layer.units > 10 || layer.units < 1) return false;
	if (activationList.find((element) => element == layer.activation) == undefined) {
		return false;
	}
	if (regularizerList.find((element) => element == layer.kernelRegularizer.regularizer) == undefined) {
		return false;
	}
	if (lambdaList.find((element) => element == layer.kernelRegularizer.lambda) == undefined) {
		return false;
	}
	if (kernelInitializerList.find((element) => element == layer.kernelInitializer) == undefined) {
		return false;
	}

	return true;
};

const validateConv2D = (layer: any) => {
	if (layer.kernelSize > 10 || layer.kerenelSize < 1) return false;
	if (layer.filters > 20 || layer.filters < 1) return false;
	if (layer.strides > 10 || layer.strides < 1) return false;
	if (activationList.find((element) => element == layer.activation) == undefined) {
		return false;
	}
	if (regularizerList.find((element) => element == layer.kernelRegularizer.regularizer) == undefined) {
		return false;
	}
	if (lambdaList.find((element) => element == layer.kernelRegularizer.lambda) == undefined) {
		return false;
	}
	if (kernelInitializerList.find((element) => element == layer.kernelInitializer) == undefined) {
		return false;
	}

	return true;
};

const validateMaxPooling2D = (layer: any) => {
	//if pool size is invalid is could crash the backend

	const pool = layer.poolSize[0] * layer.poolSize[1];
	const strides = layer.strides[0] * layer.strides[1];
	if (pool > 100 || layer.units < 1) return false;
	if (layer.units > 100 || layer.units < 1) return false;
	return true;
};

const validateFlatten = (layer: any) => {
	if (Object.keys(layer).length != 0) return false;
	return true;
};

export const convertCompilerSettings = (compilerSettings: any) => {
	if (!validateCompilerSettings(compilerSettings)) return {};
	const copy = { ...compilerSettings };

	copy.ratio = compilerSettings.ratio / 100;
	copy.batchSize = Math.pow(2, compilerSettings.batchSize);
	copy.optimizer = convertOptimizer(compilerSettings.optimizer);
	return copy;
};
const validateCompilerSettings = (compilerSettings: any) => {
	if (compilerSettings.ratio < 10 || compilerSettings.ratio > 90) return false;
	if (compilerSettings.batch < 1 || compilerSettings.batch > 10) return false;
	if (compilerSettings.epochs < 1 || compilerSettings.epochs > 10) return false;
	if (compilerSettings.optimizer.learningRate < 1 || compilerSettings.optimizer.learningRate > 100) return false;
	if (optimizerList.find((element) => element == compilerSettings.optimizer.name) == undefined) {
		return false;
	}

	return true;
};
export const convertOptimizer = (optimizer: { name: string; learningRate: number }) => {
	if (optimizer.name === "adam") {
		return tf.train.adam(optimizer.learningRate / 100);
	} else {
		return tf.train.sgd(optimizer.learningRate / 100);
	}
};
