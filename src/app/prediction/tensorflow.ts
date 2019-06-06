/*
* 1. Convert or setup our data
* 2. Build neural network
* 3. train/ fit our network
* 4. test network
*/

import * as tf from '@tensorflow/tfjs';
// import '@tensorflow/tfjs-node';

class Tensorflow {

data;
testDataObj;

run() {

    this.data, this.testDataObj = this.getData();

    const model = this.buildNeuralNetwork();
    const [trainingData, outputData, testingData] = this.convertDatatoTensors(this.data, this.testDataObj);
    this.trainModel(model, trainingData, outputData, testingData );
}

async getData() {
    const data = await fetch('../../assets/diabetes.json');
    const testdata = await fetch('../../assets/testData.json');

    return [data.json(), testdata.json()];
}
// convert/setup our data
convertDatatoTensors(data, testDataObj) {

    const trainingData = tf.tensor2d(data.map(item => [
        item.Pregnancies, item.Glucose, item.BloodPressure,
        item.SkinThickness, item.Insulin, item.BMI,
        item.DiabetesPedigreeFunction, item.Age,
      ]));
    const outputData = tf.tensor2d(data.map(item => [
    item.Outcome === 1 ? 1 : 0,
    item.Outcome === 0 ? 0 : 1,
    ]));
    const testingData = tf.tensor2d(testDataObj.map(item => [
        item.Pregnancies, item.Glucose, item.BloodPressure,
        item.SkinThickness, item.Insulin, item.BMI,
        item.DiabetesPedigreeFunction, item.Age,
    ]));

    return [trainingData, outputData, testingData];
}
// build neural network
buildNeuralNetwork() {
    const model = tf.sequential();

    model.add(tf.layers.dense({
    inputShape: [4],
    activation: 'sigmoid',
    units: 5,
    }));
    model.add(tf.layers.dense({
    inputShape: [5],
    activation: 'sigmoid',
    units: 3,
    }));
    model.add(tf.layers.dense({
    activation: 'sigmoid',
    units: 3,
    }));
    model.compile({
    loss: 'meanSquaredError',
    optimizer: tf.train.adam(.06),
    });

    return model;
}
// train/fit our network
trainModel(model, trainingData, outputData, testingData) {
    const startTime = Date.now();
    model.fit(trainingData, outputData, {epochs: 100})
    .then((history) => {
        // console.log(history)
        model.predict(testingData).print();
    });
}
// test network

}

