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
