//Interfaces
export interface Layer {
	activation: string;
	units: number;
	kernelRegularizer: any;
}

export interface MyLayer {
	activation: string;
	units: number;
	regularizer: Regularizer;
}

export interface Regularizer {
	regularizer: string;
	lambda: number;
}

export interface JSONData {
	type: string; 
	size: number[];
	data: {x: number[][], y: number[]}
}

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

export const regularizerList = ["l1","l2", "l1l2"]

export const lambdaList = [0.0, 0.001, 0.01, 0.05, 0.1, 0.2, 0.3]