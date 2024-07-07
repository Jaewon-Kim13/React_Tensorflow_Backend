import * as tf from "@tensorflow/tfjs-node";
import { MyLayer, Regularizer } from "./InterfacesAndConsts";

export const compileModel = async (layers: MyLayer[], loss: string, data: {x: number[][], y: number[], shape: number}, epoch: number): Promise<tf.LayersModel> => {
	const newLayers:any = layers.map((layer)=>({activation: layer.activation, units: layer.units, kernelRegularizer: regularizerToFunction(layer.regularizer)}))
	newLayers[0].inputShape = data.shape;
	const model = tf.sequential();
	newLayers.forEach((layer: any, index: any) =>{model.add(tf.layers.dense(layer))})

	model.compile({
	  loss: loss,
	  optimizer: tf.train.adam(0.01),
	  metrics: ['accuracy']
	});
  
	const history = await model.fit(tf.tensor(data.x), tf.tensor(data.y), {
	  epochs: epoch,
	  batchSize: 100,
	  callbacks: {
		onEpochEnd: (epoch, logs) => {
		  console.log(`Epoch ${epoch + 1}: loss = ${logs?.loss.toFixed(4)}, accuracy = ${logs?.acc.toFixed(4)}`);
		}
	  }
	});
  
	console.log('Final accuracy', history.history.acc[history.history.acc.length - 1]);
	console.log(model)
  
	return model;
};

export const predict = (data: number[], model: any) => {
	const tensor = tf.tensor(data);

}

//functions
function regularizerToFunction(reg: Regularizer) {
	let regularizerFunction;
	switch (reg.regularizer) {
		case "l1":
			regularizerFunction = tf.regularizers.l1({l1:reg.lambda});
			break;
		case "l2":
			regularizerFunction = tf.regularizers.l2({l2:reg.lambda});
			break;
		case "l1l2":
			regularizerFunction = tf.regularizers.l1l2({l1: reg.lambda, l2:reg.lambda});
			break;
	}

	return regularizerFunction
}


export function updateMyLayer(layer: MyLayer, paramName:string, value:any ){
	switch(paramName) {
		case "activation":
			layer.activation = value;
			break;
		case "units":
			layer.units = value;
			break;
		case "regularizer":
			layer.regularizer.regularizer = value;
			break;
		case "lambda":
			layer.regularizer.lambda = value
			break;
	}
}

function convertLayer(layer: MyLayer){
	return {	activation: layer.activation,
		units: layer.units,
		kernelRegularizer: regularizerToFunction(layer.regularizer)}
}