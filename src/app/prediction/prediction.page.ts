import { Component, OnInit } from '@angular/core';
import { StatsBarChart } from '../../data';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import * as tf from '@tensorflow/tfjs';
import * as d3 from 'd3-selection';
import * as d3Scale from 'd3-scale';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import { Engine } from '@tensorflow/tfjs-core/dist/engine';
import { exists } from 'fs';
import { $ } from 'protractor';

@Component({
  selector: 'app-prediction',
  templateUrl: './prediction.page.html',
  styleUrls: ['./prediction.page.scss'],
})
export class PredictionPage implements OnInit {
  public displayLoading = false;
  tensorflow;
  title = 'D3 Barchart with Ionic 4';
  width: number;
  height: number;
  margin = { top: 20, right: 20, bottom: 30, left: 40 };
  x: any;
  y: any;
  svg: any;
  g: any;
  age: number;
  bmi: number;
  st: number;
  ins: number;
  dpf: number;
  glu: number;
  preg: number;
  bp: number;
  result;

 // two values show and notshow

  prediction_data;
  clean_data;

  constructor(private route?: ActivatedRoute, private router?: Router) {
    this.width = 900 - this.margin.left - this.margin.right;
    this.height = 500 - this.margin.top - this.margin.bottom;
    this.age = route.snapshot.queryParams.age;
    this.bp = route.snapshot.queryParams.bp;
    this.bmi = route.snapshot.queryParams.bmi;
    this.st = route.snapshot.queryParams.st;
    this.ins = route.snapshot.queryParams.ins;
    this.glu = route.snapshot.queryParams.glu;
    this.preg = route.snapshot.queryParams.preg;
    this.dpf = route.snapshot.queryParams.dpf;
    this.set_prediction_data();
  }

  public async initilizedData() {
    this.tensorflow = await new Tensorflow(this.prediction_data);
    this.tensorflow.run();
    this.clean_data = this.tensorflow.clean(this.prediction_data);
    this.result = await this.tensorflow.getPrediction(this.clean_data);
  }

  async ngOnInit() {
    await this.initilizedData();
    this.initSvg();
    this.initAxis();
    this.drawAxis();
    this.drawBars();
    this.set_prediction_data();
    this.check_prediction_data();
  }

  initSvg() {
    this.svg = d3.select('#barChart')
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 900 500');
    this.g = this.svg.append('g')
      .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
  }

  initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(StatsBarChart.map((d) => d.glucose));
    this.y.domain([0, d3Array.max(StatsBarChart, (d) => d.diabetes)]);
  }

  drawAxis() {
    this.g.append('g')
      .attr('class', 'axis axis--x')
      .attr('transform', 'translate(0,' + this.height + ')')
      .call(d3Axis.axisBottom(this.x));
    this.g.append('g')
      .attr('class', 'axis axis--y')
      .call(d3Axis.axisLeft(this.y))
      .append('text')
      .attr('class', 'axis-title')
      .attr('transform', 'rotate(-90)')
      .attr('y', 6)
      .attr('dy', '0.71em')
      .attr('text-anchor', 'end')
      .text('diabetes');
  }

  drawBars() {
    this.g.selectAll('.bar')
      .data(StatsBarChart)
      .enter().append('rect')
      .attr('class', 'bar')
      .attr('x', (d) => this.x(d.glucose))
      .attr('y', (d) => this.y(d.diabetes))
      .attr('width', this.x.bandwidth())
      .attr('height', (d) => this.height - this.y(d.diabetes));
  }

  public get_prediction_data() {
    return this.prediction_data;
  }

  public set_prediction_data() {
    this.prediction_data = [{
      Pregnancies: this.preg,
      Glucose: this.glu,
      BloodPressure: this.bp,
      SkinThickness: this.st,
      Insulin: this.ins,
      BMI: this.bmi,
      DiabetesPedigreeFunction: this.dpf,
      Age: this.age
    }];
  }

 async feedback(result) {
    await result;
    alert(`Array index 0 is the possibility of you having diabetes and index 1 is the posssibility of you not having it\n\r your result is ${result}`);
  }

  async check_prediction_data() {
    let state;
    let undefinedProps = '';
    this.prediction_data.map(
      item => {
        for (const key in item) {
          if (item.hasOwnProperty(key)) {
            const element = item[key];
            if (element === 'undefined') {
              state = 'undefined';
              undefinedProps += `${key} has no value\r\n`;
            }
          }
        }
      }
    );
    if (state === 'undefined') {
      state = '';
      alert(undefinedProps);
      this.router.navigateByUrl('/prediction-form');
      return false;
    }
    // predict here
    alert('Starting AI Engine.');
    this.feedback(this.result);
  }
}

export class Tensorflow {
  data = data;
  testDataObj = testData;
  model;
  result;
  formdata;
  constructor(formdata) {
    this.formdata = this.clean(formdata);
  }

 async run() {
      const model = this.buildNeuralNetwork();
      const [trainingData, outputData, testingData] = this.convertDatatoTensors(this.data, this.testDataObj);
      await this.trainModel(model, trainingData, outputData, testingData );
  }

  // convert/setup our data
  convertDatatoTensors(data, testDataObj) {

      tf.util.shuffle(data);
      const trainingData = tf.tensor2d(data.map(item => [
          item.Pregnancies, item.Glucose, item.BloodPressure,
          item.SkinThickness, item.Insulin, item.BMI,
          item.DiabetesPedigreeFunction, item.Age,
        ]));
      const outputData = tf.tensor2d(data.map(item => [
      item.Outcome === 1 ? 1 : 0,
      item.Outcome === 0 ? 1 : 0,
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
      inputShape: [8],
      activation: 'sigmoid',
      units: 10,
      }));
      model.add(tf.layers.dense({
      inputShape: [10],
      activation: 'sigmoid',
      units: 5,
      useBias: true
      }));
      model.add(tf.layers.dense({
      inputShape: [5],
      activation: 'sigmoid',
      units: 3,
      useBias: true
      }));
      model.add(tf.layers.dense({
      activation: 'sigmoid',
      units: 2,
      }));
      model.compile({
      loss: 'meanSquaredError',
      optimizer: tf.train.adam(.06),
      });

      return model;
  }
  // train/fit our network
  async trainModel(model, trainingData, outputData, testingData) {
    const startTime = Date.now();
    model.fit(trainingData, outputData, {epochs: 100})
      .then((history) => {
          // console.log(history);
          model.predict(testingData).print();
      });
    this.model = model;
    this.getPrediction(this.formdata);
  }
  // test network
  async getPrediction(formdata) {
    const cleanedformdata = tf.tensor2d(formdata.map(item => [
      item.Pregnancies, item.Glucose, item.BloodPressure,
      item.SkinThickness, item.Insulin, item.BMI,
      item.DiabetesPedigreeFunction, item.Age,
    ]));
    this.result = await this.model.predict(cleanedformdata);
    return this.result;
  }
  clean(data) {
   const clean = data.map(item => ({
      Pregnancies: parseInt(item.Pregnancies, null),
      Glucose: parseInt(item.Glucose, null),
      BloodPressure: parseInt(item.BloodPressure, null),
      SkinThickness: parseInt(item.SkinThickness, null),
      Insulin: parseInt(item.Insulin, null),
      BMI: parseInt(item.BMI, null),
      DiabetesPedigreeFunction: parseInt(item.DiabetesPedigreeFunction, null),
      Age: parseInt(item.Age, null)
    }));

   return clean;
  }

}

const data = [
    {
    "Pregnancies": 7,
    "Glucose": 81,
    "BloodPressure": 78,
    "SkinThickness": 40,
    "Insulin": 48,
    "BMI": 46.7,
    "DiabetesPedigreeFunction": 0.261,
    "Age": 42,
    "Outcome": 0
  },
  {
    "Pregnancies": 4,
    "Glucose": 134,
    "BloodPressure": 72,
    "SkinThickness": 0,
    "Insulin": 0,
    "BMI": 23.8,
    "DiabetesPedigreeFunction": 0.277,
    "Age": 60,
    "Outcome": 1
  },
  {
    "Pregnancies": 2,
    "Glucose": 142,
    "BloodPressure": 82,
    "SkinThickness": 18,
    "Insulin": 64,
    "BMI": 24.7,
    "DiabetesPedigreeFunction": 0.761,
    "Age": 21,
    "Outcome": 0
  },
  {
    "Pregnancies": 6,
    "Glucose": 144,
    "BloodPressure": 72,
    "SkinThickness": 27,
    "Insulin": 228,
    "BMI": 33.9,
    "DiabetesPedigreeFunction": 0.255,
    "Age": 40,
    "Outcome": 0
  },
  {
    "Pregnancies": 2,
    "Glucose": 92,
    "BloodPressure": 62,
    "SkinThickness": 28,
    "Insulin": 0,
    "BMI": 31.6,
    "DiabetesPedigreeFunction": 0.13,
    "Age": 24,
    "Outcome": 0
  },
  {
    "Pregnancies": 1,
    "Glucose": 71,
    "BloodPressure": 48,
    "SkinThickness": 18,
    "Insulin": 76,
    "BMI": 20.4,
    "DiabetesPedigreeFunction": 0.323,
    "Age": 22,
    "Outcome": 0
  },
  {
    "Pregnancies": 6,
    "Glucose": 93,
    "BloodPressure": 50,
    "SkinThickness": 30,
    "Insulin": 64,
    "BMI": 28.7,
    "DiabetesPedigreeFunction": 0.356,
    "Age": 23,
    "Outcome": 0
  },
  {
    "Pregnancies": 1,
    "Glucose": 122,
    "BloodPressure": 90,
    "SkinThickness": 51,
    "Insulin": 220,
    "BMI": 49.7,
    "DiabetesPedigreeFunction": 0.325,
    "Age": 31,
    "Outcome": 1
  },
  {
    "Pregnancies": 1,
    "Glucose": 163,
    "BloodPressure": 72,
    "SkinThickness": 0,
    "Insulin": 0,
    "BMI": 39,
    "DiabetesPedigreeFunction": 1.222,
    "Age": 33,
    "Outcome": 1
  },
  {
    "Pregnancies": 1,
    "Glucose": 151,
    "BloodPressure": 60,
    "SkinThickness": 0,
    "Insulin": 0,
    "BMI": 26.1,
    "DiabetesPedigreeFunction": 0.179,
    "Age": 22,
    "Outcome": 0
  },
  {
    "Pregnancies": 0,
    "Glucose": 125,
    "BloodPressure": 96,
    "SkinThickness": 0,
    "Insulin": 0,
    "BMI": 22.5,
    "DiabetesPedigreeFunction": 0.262,
    "Age": 21,
    "Outcome": 0
  },
  {
    "Pregnancies": 1,
    "Glucose": 81,
    "BloodPressure": 72,
    "SkinThickness": 18,
    "Insulin": 40,
    "BMI": 26.6,
    "DiabetesPedigreeFunction": 0.283,
    "Age": 24,
    "Outcome": 0
  },
  {
    "Pregnancies": 2,
    "Glucose": 85,
    "BloodPressure": 65,
    "SkinThickness": 0,
    "Insulin": 0,
    "BMI": 39.6,
    "DiabetesPedigreeFunction": 0.93,
    "Age": 27,
    "Outcome": 0
  },
  {
    "Pregnancies": 1,
    "Glucose": 126,
    "BloodPressure": 56,
    "SkinThickness": 29,
    "Insulin": 152,
    "BMI": 28.7,
    "DiabetesPedigreeFunction": 0.801,
    "Age": 21,
    "Outcome": 0
  },
  {
    "Pregnancies": 1,
    "Glucose": 96,
    "BloodPressure": 122,
    "SkinThickness": 0,
    "Insulin": 0,
    "BMI": 22.4,
    "DiabetesPedigreeFunction": 0.207,
    "Age": 27,
    "Outcome": 0
  },
  {
    "Pregnancies": 4,
    "Glucose": 144,
    "BloodPressure": 58,
    "SkinThickness": 28,
    "Insulin": 140,
    "BMI": 29.5,
    "DiabetesPedigreeFunction": 0.287,
    "Age": 37,
    "Outcome": 0
  },
  {
    "Pregnancies": 3,
    "Glucose": 83,
    "BloodPressure": 58,
    "SkinThickness": 31,
    "Insulin": 18,
    "BMI": 34.3,
    "DiabetesPedigreeFunction": 0.336,
    "Age": 25,
    "Outcome": 0
  },
  {
    "Pregnancies": 0,
    "Glucose": 95,
    "BloodPressure": 85,
    "SkinThickness": 25,
    "Insulin": 36,
    "BMI": 37.4,
    "DiabetesPedigreeFunction": 0.247,
    "Age": 24,
    "Outcome": 1
  },
  {
    "Pregnancies": 3,
    "Glucose": 171,
    "BloodPressure": 72,
    "SkinThickness": 33,
    "Insulin": 135,
    "BMI": 33.3,
    "DiabetesPedigreeFunction": 0.199,
    "Age": 24,
    "Outcome": 1
  },
  {
    "Pregnancies": 8,
    "Glucose": 155,
    "BloodPressure": 62,
    "SkinThickness": 26,
    "Insulin": 495,
    "BMI": 34,
    "DiabetesPedigreeFunction": 0.543,
    "Age": 46,
    "Outcome": 1
  },
  {
    "Pregnancies": 1,
    "Glucose": 89,
    "BloodPressure": 76,
    "SkinThickness": 34,
    "Insulin": 37,
    "BMI": 31.2,
    "DiabetesPedigreeFunction": 0.192,
    "Age": 23,
    "Outcome": 0
  },
  {
    "Pregnancies": 4,
    "Glucose": 76,
    "BloodPressure": 62,
    "SkinThickness": 0,
    "Insulin": 0,
    "BMI": 34,
    "DiabetesPedigreeFunction": 0.391,
    "Age": 25,
    "Outcome": 0
  },
  {
    "Pregnancies": 7,
    Glucose: 160,
    BloodPressure: 54,
    SkinThickness: 32,
    Insulin: 175,
    BMI: 30.5,
    DiabetesPedigreeFunction: 0.588,
    Age: 39,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 146,
    BloodPressure: 92,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.539,
    Age: 61,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 124,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34,
    DiabetesPedigreeFunction: 0.22,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 78,
    BloodPressure: 48,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 33.7,
    DiabetesPedigreeFunction: 0.654,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 97,
    BloodPressure: 60,
    SkinThickness: 23,
    Insulin: 0,
    BMI: 28.2,
    DiabetesPedigreeFunction: 0.443,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 99,
    BloodPressure: 76,
    SkinThickness: 15,
    Insulin: 51,
    BMI: 23.2,
    DiabetesPedigreeFunction: 0.223,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 162,
    BloodPressure: 76,
    SkinThickness: 56,
    Insulin: 100,
    BMI: 53.2,
    DiabetesPedigreeFunction: 0.759,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 111,
    BloodPressure: 64,
    SkinThickness: 39,
    Insulin: 0,
    BMI: 34.2,
    DiabetesPedigreeFunction: 0.26,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 107,
    BloodPressure: 74,
    SkinThickness: 30,
    Insulin: 100,
    BMI: 33.6,
    DiabetesPedigreeFunction: 0.404,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 132,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26.8,
    DiabetesPedigreeFunction: 0.186,
    Age: 69,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 113,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 33.3,
    DiabetesPedigreeFunction: 0.278,
    Age: 23,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 88,
    BloodPressure: 30,
    SkinThickness: 42,
    Insulin: 99,
    BMI: 55,
    DiabetesPedigreeFunction: 0.496,
    Age: 26,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 120,
    BloodPressure: 70,
    SkinThickness: 30,
    Insulin: 135,
    BMI: 42.9,
    DiabetesPedigreeFunction: 0.452,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 118,
    BloodPressure: 58,
    SkinThickness: 36,
    Insulin: 94,
    BMI: 33.3,
    DiabetesPedigreeFunction: 0.261,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 117,
    BloodPressure: 88,
    SkinThickness: 24,
    Insulin: 145,
    BMI: 34.5,
    DiabetesPedigreeFunction: 0.403,
    Age: 40,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 105,
    BloodPressure: 84,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.9,
    DiabetesPedigreeFunction: 0.741,
    Age: 62,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 173,
    BloodPressure: 70,
    SkinThickness: 14,
    Insulin: 168,
    BMI: 29.7,
    DiabetesPedigreeFunction: 0.361,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 122,
    BloodPressure: 56,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 33.3,
    DiabetesPedigreeFunction: 1.114,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 170,
    BloodPressure: 64,
    SkinThickness: 37,
    Insulin: 225,
    BMI: 34.5,
    DiabetesPedigreeFunction: 0.356,
    Age: 30,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 84,
    BloodPressure: 74,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 38.3,
    DiabetesPedigreeFunction: 0.457,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 96,
    BloodPressure: 68,
    SkinThickness: 13,
    Insulin: 49,
    BMI: 21.1,
    DiabetesPedigreeFunction: 0.647,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 125,
    BloodPressure: 60,
    SkinThickness: 20,
    Insulin: 140,
    BMI: 33.8,
    DiabetesPedigreeFunction: 0.088,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 100,
    BloodPressure: 70,
    SkinThickness: 26,
    Insulin: 50,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.597,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 93,
    BloodPressure: 60,
    SkinThickness: 25,
    Insulin: 92,
    BMI: 28.7,
    DiabetesPedigreeFunction: 0.532,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 129,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.703,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 105,
    BloodPressure: 72,
    SkinThickness: 29,
    Insulin: 325,
    BMI: 36.9,
    DiabetesPedigreeFunction: 0.159,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 128,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.1,
    DiabetesPedigreeFunction: 0.268,
    Age: 55,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 106,
    BloodPressure: 82,
    SkinThickness: 30,
    Insulin: 0,
    BMI: 39.5,
    DiabetesPedigreeFunction: 0.286,
    Age: 38,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 108,
    BloodPressure: 52,
    SkinThickness: 26,
    Insulin: 63,
    BMI: 32.5,
    DiabetesPedigreeFunction: 0.318,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 108,
    BloodPressure: 66,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.272,
    Age: 42,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 154,
    BloodPressure: 62,
    SkinThickness: 31,
    Insulin: 284,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.237,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 102,
    BloodPressure: 75,
    SkinThickness: 23,
    Insulin: 0,
    BMI: 0,
    DiabetesPedigreeFunction: 0.572,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 57,
    BloodPressure: 80,
    SkinThickness: 37,
    Insulin: 0,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.096,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 106,
    BloodPressure: 64,
    SkinThickness: 35,
    Insulin: 119,
    BMI: 30.5,
    DiabetesPedigreeFunction: 1.4,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 147,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 33.7,
    DiabetesPedigreeFunction: 0.218,
    Age: 65,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 90,
    BloodPressure: 70,
    SkinThickness: 17,
    Insulin: 0,
    BMI: 27.3,
    DiabetesPedigreeFunction: 0.085,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 136,
    BloodPressure: 74,
    SkinThickness: 50,
    Insulin: 204,
    BMI: 37.4,
    DiabetesPedigreeFunction: 0.399,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 114,
    BloodPressure: 65,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.9,
    DiabetesPedigreeFunction: 0.432,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 156,
    BloodPressure: 86,
    SkinThickness: 28,
    Insulin: 155,
    BMI: 34.3,
    DiabetesPedigreeFunction: 1.189,
    Age: 42,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 153,
    BloodPressure: 82,
    SkinThickness: 42,
    Insulin: 485,
    BMI: 40.6,
    DiabetesPedigreeFunction: 0.687,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 188,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 47.9,
    DiabetesPedigreeFunction: 0.137,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 152,
    BloodPressure: 88,
    SkinThickness: 44,
    Insulin: 0,
    BMI: 50,
    DiabetesPedigreeFunction: 0.337,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 99,
    BloodPressure: 52,
    SkinThickness: 15,
    Insulin: 94,
    BMI: 24.6,
    DiabetesPedigreeFunction: 0.637,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 109,
    BloodPressure: 56,
    SkinThickness: 21,
    Insulin: 135,
    BMI: 25.2,
    DiabetesPedigreeFunction: 0.833,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 88,
    BloodPressure: 74,
    SkinThickness: 19,
    Insulin: 53,
    BMI: 29,
    DiabetesPedigreeFunction: 0.229,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 17,
    Glucose: 163,
    BloodPressure: 72,
    SkinThickness: 41,
    Insulin: 114,
    BMI: 40.9,
    DiabetesPedigreeFunction: 0.817,
    Age: 47,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 151,
    BloodPressure: 90,
    SkinThickness: 38,
    Insulin: 0,
    BMI: 29.7,
    DiabetesPedigreeFunction: 0.294,
    Age: 36,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 102,
    BloodPressure: 74,
    SkinThickness: 40,
    Insulin: 105,
    BMI: 37.2,
    DiabetesPedigreeFunction: 0.204,
    Age: 45,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 114,
    BloodPressure: 80,
    SkinThickness: 34,
    Insulin: 285,
    BMI: 44.2,
    DiabetesPedigreeFunction: 0.167,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 100,
    BloodPressure: 64,
    SkinThickness: 23,
    Insulin: 0,
    BMI: 29.7,
    DiabetesPedigreeFunction: 0.368,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 131,
    BloodPressure: 88,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.743,
    Age: 32,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 104,
    BloodPressure: 74,
    SkinThickness: 18,
    Insulin: 156,
    BMI: 29.9,
    DiabetesPedigreeFunction: 0.722,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 148,
    BloodPressure: 66,
    SkinThickness: 25,
    Insulin: 0,
    BMI: 32.5,
    DiabetesPedigreeFunction: 0.256,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 120,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.6,
    DiabetesPedigreeFunction: 0.709,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 110,
    BloodPressure: 66,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.9,
    DiabetesPedigreeFunction: 0.471,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 111,
    BloodPressure: 90,
    SkinThickness: 12,
    Insulin: 78,
    BMI: 28.4,
    DiabetesPedigreeFunction: 0.495,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 102,
    BloodPressure: 82,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.18,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 134,
    BloodPressure: 70,
    SkinThickness: 23,
    Insulin: 130,
    BMI: 35.4,
    DiabetesPedigreeFunction: 0.542,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 87,
    BloodPressure: 0,
    SkinThickness: 23,
    Insulin: 0,
    BMI: 28.9,
    DiabetesPedigreeFunction: 0.773,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 79,
    BloodPressure: 60,
    SkinThickness: 42,
    Insulin: 48,
    BMI: 43.5,
    DiabetesPedigreeFunction: 0.678,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 75,
    BloodPressure: 64,
    SkinThickness: 24,
    Insulin: 55,
    BMI: 29.7,
    DiabetesPedigreeFunction: 0.37,
    Age: 33,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 179,
    BloodPressure: 72,
    SkinThickness: 42,
    Insulin: 130,
    BMI: 32.7,
    DiabetesPedigreeFunction: 0.719,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 85,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.382,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 129,
    BloodPressure: 110,
    SkinThickness: 46,
    Insulin: 130,
    BMI: 67.1,
    DiabetesPedigreeFunction: 0.319,
    Age: 26,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 143,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 45,
    DiabetesPedigreeFunction: 0.19,
    Age: 47,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 130,
    BloodPressure: 82,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 39.1,
    DiabetesPedigreeFunction: 0.956,
    Age: 37,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 87,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.2,
    DiabetesPedigreeFunction: 0.084,
    Age: 32,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 119,
    BloodPressure: 64,
    SkinThickness: 18,
    Insulin: 92,
    BMI: 34.9,
    DiabetesPedigreeFunction: 0.725,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 0,
    BloodPressure: 74,
    SkinThickness: 20,
    Insulin: 23,
    BMI: 27.7,
    DiabetesPedigreeFunction: 0.299,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 73,
    BloodPressure: 60,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26.8,
    DiabetesPedigreeFunction: 0.268,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 141,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.6,
    DiabetesPedigreeFunction: 0.244,
    Age: 40,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 194,
    BloodPressure: 68,
    SkinThickness: 28,
    Insulin: 0,
    BMI: 35.9,
    DiabetesPedigreeFunction: 0.745,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 181,
    BloodPressure: 68,
    SkinThickness: 36,
    Insulin: 495,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.615,
    Age: 60,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 128,
    BloodPressure: 98,
    SkinThickness: 41,
    Insulin: 58,
    BMI: 32,
    DiabetesPedigreeFunction: 1.321,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 109,
    BloodPressure: 76,
    SkinThickness: 39,
    Insulin: 114,
    BMI: 27.9,
    DiabetesPedigreeFunction: 0.64,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 139,
    BloodPressure: 80,
    SkinThickness: 35,
    Insulin: 160,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.361,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 111,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 22.6,
    DiabetesPedigreeFunction: 0.142,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 123,
    BloodPressure: 70,
    SkinThickness: 44,
    Insulin: 94,
    BMI: 33.1,
    DiabetesPedigreeFunction: 0.374,
    Age: 40,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 159,
    BloodPressure: 66,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.4,
    DiabetesPedigreeFunction: 0.383,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 11,
    Glucose: 135,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 52.3,
    DiabetesPedigreeFunction: 0.578,
    Age: 40,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 85,
    BloodPressure: 55,
    SkinThickness: 20,
    Insulin: 0,
    BMI: 24.4,
    DiabetesPedigreeFunction: 0.136,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 158,
    BloodPressure: 84,
    SkinThickness: 41,
    Insulin: 210,
    BMI: 39.4,
    DiabetesPedigreeFunction: 0.395,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 105,
    BloodPressure: 58,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.3,
    DiabetesPedigreeFunction: 0.187,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 107,
    BloodPressure: 62,
    SkinThickness: 13,
    Insulin: 48,
    BMI: 22.9,
    DiabetesPedigreeFunction: 0.678,
    Age: 23,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 109,
    BloodPressure: 64,
    SkinThickness: 44,
    Insulin: 99,
    BMI: 34.8,
    DiabetesPedigreeFunction: 0.905,
    Age: 26,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 148,
    BloodPressure: 60,
    SkinThickness: 27,
    Insulin: 318,
    BMI: 30.9,
    DiabetesPedigreeFunction: 0.15,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 113,
    BloodPressure: 80,
    SkinThickness: 16,
    Insulin: 0,
    BMI: 31,
    DiabetesPedigreeFunction: 0.874,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 138,
    BloodPressure: 82,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 40.1,
    DiabetesPedigreeFunction: 0.236,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 108,
    BloodPressure: 68,
    SkinThickness: 20,
    Insulin: 0,
    BMI: 27.3,
    DiabetesPedigreeFunction: 0.787,
    Age: 32,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 99,
    BloodPressure: 70,
    SkinThickness: 16,
    Insulin: 44,
    BMI: 20.4,
    DiabetesPedigreeFunction: 0.235,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 103,
    BloodPressure: 72,
    SkinThickness: 32,
    Insulin: 190,
    BMI: 37.7,
    DiabetesPedigreeFunction: 0.324,
    Age: 55,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 111,
    BloodPressure: 72,
    SkinThickness: 28,
    Insulin: 0,
    BMI: 23.9,
    DiabetesPedigreeFunction: 0.407,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 196,
    BloodPressure: 76,
    SkinThickness: 29,
    Insulin: 280,
    BMI: 37.5,
    DiabetesPedigreeFunction: 0.605,
    Age: 57,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 162,
    BloodPressure: 104,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 37.7,
    DiabetesPedigreeFunction: 0.151,
    Age: 52,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 96,
    BloodPressure: 64,
    SkinThickness: 27,
    Insulin: 87,
    BMI: 33.2,
    DiabetesPedigreeFunction: 0.289,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 184,
    BloodPressure: 84,
    SkinThickness: 33,
    Insulin: 0,
    BMI: 35.5,
    DiabetesPedigreeFunction: 0.355,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 81,
    BloodPressure: 60,
    SkinThickness: 22,
    Insulin: 0,
    BMI: 27.7,
    DiabetesPedigreeFunction: 0.29,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 147,
    BloodPressure: 85,
    SkinThickness: 54,
    Insulin: 0,
    BMI: 42.8,
    DiabetesPedigreeFunction: 0.375,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 179,
    BloodPressure: 95,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 34.2,
    DiabetesPedigreeFunction: 0.164,
    Age: 60,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 140,
    BloodPressure: 65,
    SkinThickness: 26,
    Insulin: 130,
    BMI: 42.6,
    DiabetesPedigreeFunction: 0.431,
    Age: 24,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 112,
    BloodPressure: 82,
    SkinThickness: 32,
    Insulin: 175,
    BMI: 34.2,
    DiabetesPedigreeFunction: 0.26,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 12,
    Glucose: 151,
    BloodPressure: 70,
    SkinThickness: 40,
    Insulin: 271,
    BMI: 41.8,
    DiabetesPedigreeFunction: 0.742,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 109,
    BloodPressure: 62,
    SkinThickness: 41,
    Insulin: 129,
    BMI: 35.8,
    DiabetesPedigreeFunction: 0.514,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 125,
    BloodPressure: 68,
    SkinThickness: 30,
    Insulin: 120,
    BMI: 30,
    DiabetesPedigreeFunction: 0.464,
    Age: 32,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 85,
    BloodPressure: 74,
    SkinThickness: 22,
    Insulin: 0,
    BMI: 29,
    DiabetesPedigreeFunction: 1.224,
    Age: 32,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 112,
    BloodPressure: 66,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 37.8,
    DiabetesPedigreeFunction: 0.261,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 177,
    BloodPressure: 60,
    SkinThickness: 29,
    Insulin: 478,
    BMI: 34.6,
    DiabetesPedigreeFunction: 1.072,
    Age: 21,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 158,
    BloodPressure: 90,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.805,
    Age: 66,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 119,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25.2,
    DiabetesPedigreeFunction: 0.209,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 142,
    BloodPressure: 60,
    SkinThickness: 33,
    Insulin: 190,
    BMI: 28.8,
    DiabetesPedigreeFunction: 0.687,
    Age: 61,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 100,
    BloodPressure: 66,
    SkinThickness: 15,
    Insulin: 56,
    BMI: 23.6,
    DiabetesPedigreeFunction: 0.666,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 87,
    BloodPressure: 78,
    SkinThickness: 27,
    Insulin: 32,
    BMI: 34.6,
    DiabetesPedigreeFunction: 0.101,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 101,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 35.7,
    DiabetesPedigreeFunction: 0.198,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 162,
    BloodPressure: 52,
    SkinThickness: 38,
    Insulin: 0,
    BMI: 37.2,
    DiabetesPedigreeFunction: 0.652,
    Age: 24,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 197,
    BloodPressure: 70,
    SkinThickness: 39,
    Insulin: 744,
    BMI: 36.7,
    DiabetesPedigreeFunction: 2.329,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 117,
    BloodPressure: 80,
    SkinThickness: 31,
    Insulin: 53,
    BMI: 45.2,
    DiabetesPedigreeFunction: 0.089,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 142,
    BloodPressure: 86,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 44,
    DiabetesPedigreeFunction: 0.645,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 134,
    BloodPressure: 80,
    SkinThickness: 37,
    Insulin: 370,
    BMI: 46.2,
    DiabetesPedigreeFunction: 0.238,
    Age: 46,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 79,
    BloodPressure: 80,
    SkinThickness: 25,
    Insulin: 37,
    BMI: 25.4,
    DiabetesPedigreeFunction: 0.583,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 122,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 35,
    DiabetesPedigreeFunction: 0.394,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 74,
    BloodPressure: 68,
    SkinThickness: 28,
    Insulin: 45,
    BMI: 29.7,
    DiabetesPedigreeFunction: 0.293,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 171,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 43.6,
    DiabetesPedigreeFunction: 0.479,
    Age: 26,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 181,
    BloodPressure: 84,
    SkinThickness: 21,
    Insulin: 192,
    BMI: 35.9,
    DiabetesPedigreeFunction: 0.586,
    Age: 51,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 179,
    BloodPressure: 90,
    SkinThickness: 27,
    Insulin: 0,
    BMI: 44.1,
    DiabetesPedigreeFunction: 0.686,
    Age: 23,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 164,
    BloodPressure: 84,
    SkinThickness: 21,
    Insulin: 0,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.831,
    Age: 32,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 104,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 18.4,
    DiabetesPedigreeFunction: 0.582,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 91,
    BloodPressure: 64,
    SkinThickness: 24,
    Insulin: 0,
    BMI: 29.2,
    DiabetesPedigreeFunction: 0.192,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 91,
    BloodPressure: 70,
    SkinThickness: 32,
    Insulin: 88,
    BMI: 33.1,
    DiabetesPedigreeFunction: 0.446,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 139,
    BloodPressure: 54,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25.6,
    DiabetesPedigreeFunction: 0.402,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 119,
    BloodPressure: 50,
    SkinThickness: 22,
    Insulin: 176,
    BMI: 27.1,
    DiabetesPedigreeFunction: 1.318,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 146,
    BloodPressure: 76,
    SkinThickness: 35,
    Insulin: 194,
    BMI: 38.2,
    DiabetesPedigreeFunction: 0.329,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 184,
    BloodPressure: 85,
    SkinThickness: 15,
    Insulin: 0,
    BMI: 30,
    DiabetesPedigreeFunction: 1.213,
    Age: 49,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 122,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.258,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 165,
    BloodPressure: 90,
    SkinThickness: 33,
    Insulin: 680,
    BMI: 52.3,
    DiabetesPedigreeFunction: 0.427,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 124,
    BloodPressure: 70,
    SkinThickness: 33,
    Insulin: 402,
    BMI: 35.4,
    DiabetesPedigreeFunction: 0.282,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 111,
    BloodPressure: 86,
    SkinThickness: 19,
    Insulin: 0,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.143,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 106,
    BloodPressure: 52,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.38,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 129,
    BloodPressure: 84,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28,
    DiabetesPedigreeFunction: 0.284,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 90,
    BloodPressure: 80,
    SkinThickness: 14,
    Insulin: 55,
    BMI: 24.4,
    DiabetesPedigreeFunction: 0.249,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 86,
    BloodPressure: 68,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 35.8,
    DiabetesPedigreeFunction: 0.238,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 12,
    Glucose: 92,
    BloodPressure: 62,
    SkinThickness: 7,
    Insulin: 258,
    BMI: 27.6,
    DiabetesPedigreeFunction: 0.926,
    Age: 44,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 113,
    BloodPressure: 64,
    SkinThickness: 35,
    Insulin: 0,
    BMI: 33.6,
    DiabetesPedigreeFunction: 0.543,
    Age: 21,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 111,
    BloodPressure: 56,
    SkinThickness: 39,
    Insulin: 0,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.557,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 114,
    BloodPressure: 68,
    SkinThickness: 22,
    Insulin: 0,
    BMI: 28.7,
    DiabetesPedigreeFunction: 0.092,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 193,
    BloodPressure: 50,
    SkinThickness: 16,
    Insulin: 375,
    BMI: 25.9,
    DiabetesPedigreeFunction: 0.655,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 11,
    Glucose: 155,
    BloodPressure: 76,
    SkinThickness: 28,
    Insulin: 150,
    BMI: 33.3,
    DiabetesPedigreeFunction: 1.353,
    Age: 51,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 191,
    BloodPressure: 68,
    SkinThickness: 15,
    Insulin: 130,
    BMI: 30.9,
    DiabetesPedigreeFunction: 0.299,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 141,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30,
    DiabetesPedigreeFunction: 0.761,
    Age: 27,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 95,
    BloodPressure: 70,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 32.1,
    DiabetesPedigreeFunction: 0.612,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 142,
    BloodPressure: 80,
    SkinThickness: 15,
    Insulin: 0,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.2,
    Age: 63,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 123,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32,
    DiabetesPedigreeFunction: 0.226,
    Age: 35,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 96,
    BloodPressure: 74,
    SkinThickness: 18,
    Insulin: 67,
    BMI: 33.6,
    DiabetesPedigreeFunction: 0.997,
    Age: 43,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 138,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 36.3,
    DiabetesPedigreeFunction: 0.933,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 128,
    BloodPressure: 64,
    SkinThickness: 42,
    Insulin: 0,
    BMI: 40,
    DiabetesPedigreeFunction: 1.101,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 102,
    BloodPressure: 52,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25.1,
    DiabetesPedigreeFunction: 0.078,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 146,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.5,
    DiabetesPedigreeFunction: 0.24,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 101,
    BloodPressure: 86,
    SkinThickness: 37,
    Insulin: 0,
    BMI: 45.6,
    DiabetesPedigreeFunction: 1.136,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 108,
    BloodPressure: 62,
    SkinThickness: 32,
    Insulin: 56,
    BMI: 25.2,
    DiabetesPedigreeFunction: 0.128,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 122,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23,
    DiabetesPedigreeFunction: 0.254,
    Age: 40,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 71,
    BloodPressure: 78,
    SkinThickness: 50,
    Insulin: 45,
    BMI: 33.2,
    DiabetesPedigreeFunction: 0.422,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 13,
    Glucose: 106,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34.2,
    DiabetesPedigreeFunction: 0.251,
    Age: 52,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 100,
    BloodPressure: 70,
    SkinThickness: 52,
    Insulin: 57,
    BMI: 40.5,
    DiabetesPedigreeFunction: 0.677,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 106,
    BloodPressure: 60,
    SkinThickness: 24,
    Insulin: 0,
    BMI: 26.5,
    DiabetesPedigreeFunction: 0.296,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 104,
    BloodPressure: 64,
    SkinThickness: 23,
    Insulin: 116,
    BMI: 27.8,
    DiabetesPedigreeFunction: 0.454,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 114,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.9,
    DiabetesPedigreeFunction: 0.744,
    Age: 57,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 108,
    BloodPressure: 62,
    SkinThickness: 10,
    Insulin: 278,
    BMI: 25.3,
    DiabetesPedigreeFunction: 0.881,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 146,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 37.9,
    DiabetesPedigreeFunction: 0.334,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 129,
    BloodPressure: 76,
    SkinThickness: 28,
    Insulin: 122,
    BMI: 35.9,
    DiabetesPedigreeFunction: 0.28,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 133,
    BloodPressure: 88,
    SkinThickness: 15,
    Insulin: 155,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.262,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 161,
    BloodPressure: 86,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.4,
    DiabetesPedigreeFunction: 0.165,
    Age: 47,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 108,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27,
    DiabetesPedigreeFunction: 0.259,
    Age: 52,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 136,
    BloodPressure: 74,
    SkinThickness: 26,
    Insulin: 135,
    BMI: 26,
    DiabetesPedigreeFunction: 0.647,
    Age: 51,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 155,
    BloodPressure: 84,
    SkinThickness: 44,
    Insulin: 545,
    BMI: 38.7,
    DiabetesPedigreeFunction: 0.619,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 119,
    BloodPressure: 86,
    SkinThickness: 39,
    Insulin: 220,
    BMI: 45.6,
    DiabetesPedigreeFunction: 0.808,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 96,
    BloodPressure: 56,
    SkinThickness: 17,
    Insulin: 49,
    BMI: 20.8,
    DiabetesPedigreeFunction: 0.34,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 108,
    BloodPressure: 72,
    SkinThickness: 43,
    Insulin: 75,
    BMI: 36.1,
    DiabetesPedigreeFunction: 0.263,
    Age: 33,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 78,
    BloodPressure: 88,
    SkinThickness: 29,
    Insulin: 40,
    BMI: 36.9,
    DiabetesPedigreeFunction: 0.434,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 107,
    BloodPressure: 62,
    SkinThickness: 30,
    Insulin: 74,
    BMI: 36.6,
    DiabetesPedigreeFunction: 0.757,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 128,
    BloodPressure: 78,
    SkinThickness: 37,
    Insulin: 182,
    BMI: 43.3,
    DiabetesPedigreeFunction: 1.224,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 128,
    BloodPressure: 48,
    SkinThickness: 45,
    Insulin: 194,
    BMI: 40.5,
    DiabetesPedigreeFunction: 0.613,
    Age: 24,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 161,
    BloodPressure: 50,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.9,
    DiabetesPedigreeFunction: 0.254,
    Age: 65,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 151,
    BloodPressure: 62,
    SkinThickness: 31,
    Insulin: 120,
    BMI: 35.5,
    DiabetesPedigreeFunction: 0.692,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 146,
    BloodPressure: 70,
    SkinThickness: 38,
    Insulin: 360,
    BMI: 28,
    DiabetesPedigreeFunction: 0.337,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 126,
    BloodPressure: 84,
    SkinThickness: 29,
    Insulin: 215,
    BMI: 30.7,
    DiabetesPedigreeFunction: 0.52,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 14,
    Glucose: 100,
    BloodPressure: 78,
    SkinThickness: 25,
    Insulin: 184,
    BMI: 36.6,
    DiabetesPedigreeFunction: 0.412,
    Age: 46,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 112,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.6,
    DiabetesPedigreeFunction: 0.84,
    Age: 58,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 167,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.3,
    DiabetesPedigreeFunction: 0.839,
    Age: 30,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 144,
    BloodPressure: 58,
    SkinThickness: 33,
    Insulin: 135,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.422,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 77,
    BloodPressure: 82,
    SkinThickness: 41,
    Insulin: 42,
    BMI: 35.8,
    DiabetesPedigreeFunction: 0.156,
    Age: 35,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 115,
    BloodPressure: 98,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 52.9,
    DiabetesPedigreeFunction: 0.209,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 150,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21,
    DiabetesPedigreeFunction: 0.207,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 120,
    BloodPressure: 76,
    SkinThickness: 37,
    Insulin: 105,
    BMI: 39.7,
    DiabetesPedigreeFunction: 0.215,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 161,
    BloodPressure: 68,
    SkinThickness: 23,
    Insulin: 132,
    BMI: 25.5,
    DiabetesPedigreeFunction: 0.326,
    Age: 47,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 137,
    BloodPressure: 68,
    SkinThickness: 14,
    Insulin: 148,
    BMI: 24.8,
    DiabetesPedigreeFunction: 0.143,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 128,
    BloodPressure: 68,
    SkinThickness: 19,
    Insulin: 180,
    BMI: 30.5,
    DiabetesPedigreeFunction: 1.391,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 124,
    BloodPressure: 68,
    SkinThickness: 28,
    Insulin: 205,
    BMI: 32.9,
    DiabetesPedigreeFunction: 0.875,
    Age: 30,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 80,
    BloodPressure: 66,
    SkinThickness: 30,
    Insulin: 0,
    BMI: 26.2,
    DiabetesPedigreeFunction: 0.313,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 106,
    BloodPressure: 70,
    SkinThickness: 37,
    Insulin: 148,
    BMI: 39.4,
    DiabetesPedigreeFunction: 0.605,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 155,
    BloodPressure: 74,
    SkinThickness: 17,
    Insulin: 96,
    BMI: 26.6,
    DiabetesPedigreeFunction: 0.433,
    Age: 27,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 113,
    BloodPressure: 50,
    SkinThickness: 10,
    Insulin: 85,
    BMI: 29.5,
    DiabetesPedigreeFunction: 0.626,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 109,
    BloodPressure: 80,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 35.9,
    DiabetesPedigreeFunction: 1.127,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 112,
    BloodPressure: 68,
    SkinThickness: 22,
    Insulin: 94,
    BMI: 34.1,
    DiabetesPedigreeFunction: 0.315,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 99,
    BloodPressure: 80,
    SkinThickness: 11,
    Insulin: 64,
    BMI: 19.3,
    DiabetesPedigreeFunction: 0.284,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 182,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.5,
    DiabetesPedigreeFunction: 0.345,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 115,
    BloodPressure: 66,
    SkinThickness: 39,
    Insulin: 140,
    BMI: 38.1,
    DiabetesPedigreeFunction: 0.15,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 194,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.5,
    DiabetesPedigreeFunction: 0.129,
    Age: 59,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 129,
    BloodPressure: 60,
    SkinThickness: 12,
    Insulin: 231,
    BMI: 27.5,
    DiabetesPedigreeFunction: 0.527,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 112,
    BloodPressure: 74,
    SkinThickness: 30,
    Insulin: 0,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.197,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 124,
    BloodPressure: 70,
    SkinThickness: 20,
    Insulin: 0,
    BMI: 27.4,
    DiabetesPedigreeFunction: 0.254,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 13,
    Glucose: 152,
    BloodPressure: 90,
    SkinThickness: 33,
    Insulin: 29,
    BMI: 26.8,
    DiabetesPedigreeFunction: 0.731,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 112,
    BloodPressure: 75,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 35.7,
    DiabetesPedigreeFunction: 0.148,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 157,
    BloodPressure: 72,
    SkinThickness: 21,
    Insulin: 168,
    BMI: 25.6,
    DiabetesPedigreeFunction: 0.123,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 122,
    BloodPressure: 64,
    SkinThickness: 32,
    Insulin: 156,
    BMI: 35.1,
    DiabetesPedigreeFunction: 0.692,
    Age: 30,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 179,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 35.1,
    DiabetesPedigreeFunction: 0.2,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 102,
    BloodPressure: 86,
    SkinThickness: 36,
    Insulin: 120,
    BMI: 45.5,
    DiabetesPedigreeFunction: 0.127,
    Age: 23,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 105,
    BloodPressure: 70,
    SkinThickness: 32,
    Insulin: 68,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.122,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 118,
    BloodPressure: 72,
    SkinThickness: 19,
    Insulin: 0,
    BMI: 23.1,
    DiabetesPedigreeFunction: 1.476,
    Age: 46,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 87,
    BloodPressure: 58,
    SkinThickness: 16,
    Insulin: 52,
    BMI: 32.7,
    DiabetesPedigreeFunction: 0.166,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 180,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 43.3,
    DiabetesPedigreeFunction: 0.282,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 12,
    Glucose: 106,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.6,
    DiabetesPedigreeFunction: 0.137,
    Age: 44,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 95,
    BloodPressure: 60,
    SkinThickness: 18,
    Insulin: 58,
    BMI: 23.9,
    DiabetesPedigreeFunction: 0.26,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 165,
    BloodPressure: 76,
    SkinThickness: 43,
    Insulin: 255,
    BMI: 47.9,
    DiabetesPedigreeFunction: 0.259,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 117,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 33.8,
    DiabetesPedigreeFunction: 0.932,
    Age: 44,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 115,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.343,
    Age: 44,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 152,
    BloodPressure: 78,
    SkinThickness: 34,
    Insulin: 171,
    BMI: 34.2,
    DiabetesPedigreeFunction: 0.893,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 178,
    BloodPressure: 84,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 39.9,
    DiabetesPedigreeFunction: 0.331,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 130,
    BloodPressure: 70,
    SkinThickness: 13,
    Insulin: 105,
    BMI: 25.9,
    DiabetesPedigreeFunction: 0.472,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 95,
    BloodPressure: 74,
    SkinThickness: 21,
    Insulin: 73,
    BMI: 25.9,
    DiabetesPedigreeFunction: 0.673,
    Age: 36,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 0,
    BloodPressure: 68,
    SkinThickness: 35,
    Insulin: 0,
    BMI: 32,
    DiabetesPedigreeFunction: 0.389,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 122,
    BloodPressure: 86,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34.7,
    DiabetesPedigreeFunction: 0.29,
    Age: 33,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 95,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 36.8,
    DiabetesPedigreeFunction: 0.485,
    Age: 57,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 126,
    BloodPressure: 88,
    SkinThickness: 36,
    Insulin: 108,
    BMI: 38.5,
    DiabetesPedigreeFunction: 0.349,
    Age: 49,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 139,
    BloodPressure: 46,
    SkinThickness: 19,
    Insulin: 83,
    BMI: 28.7,
    DiabetesPedigreeFunction: 0.654,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 116,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.5,
    DiabetesPedigreeFunction: 0.187,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 99,
    BloodPressure: 62,
    SkinThickness: 19,
    Insulin: 74,
    BMI: 21.8,
    DiabetesPedigreeFunction: 0.279,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 0,
    BloodPressure: 80,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 41,
    DiabetesPedigreeFunction: 0.346,
    Age: 37,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 92,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 42.2,
    DiabetesPedigreeFunction: 0.237,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 137,
    BloodPressure: 84,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.252,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 61,
    BloodPressure: 82,
    SkinThickness: 28,
    Insulin: 0,
    BMI: 34.4,
    DiabetesPedigreeFunction: 0.243,
    Age: 46,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 90,
    BloodPressure: 62,
    SkinThickness: 12,
    Insulin: 43,
    BMI: 27.2,
    DiabetesPedigreeFunction: 0.58,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 90,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 42.7,
    DiabetesPedigreeFunction: 0.559,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 165,
    BloodPressure: 88,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.4,
    DiabetesPedigreeFunction: 0.302,
    Age: 49,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 125,
    BloodPressure: 50,
    SkinThickness: 40,
    Insulin: 167,
    BMI: 33.3,
    DiabetesPedigreeFunction: 0.962,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 13,
    Glucose: 129,
    BloodPressure: 0,
    SkinThickness: 30,
    Insulin: 0,
    BMI: 39.9,
    DiabetesPedigreeFunction: 0.569,
    Age: 44,
    Outcome: 1
  },
  {
    Pregnancies: 12,
    Glucose: 88,
    BloodPressure: 74,
    SkinThickness: 40,
    Insulin: 54,
    BMI: 35.3,
    DiabetesPedigreeFunction: 0.378,
    Age: 48,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 196,
    BloodPressure: 76,
    SkinThickness: 36,
    Insulin: 249,
    BMI: 36.5,
    DiabetesPedigreeFunction: 0.875,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 189,
    BloodPressure: 64,
    SkinThickness: 33,
    Insulin: 325,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.583,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 158,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.8,
    DiabetesPedigreeFunction: 0.207,
    Age: 63,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 103,
    BloodPressure: 108,
    SkinThickness: 37,
    Insulin: 0,
    BMI: 39.2,
    DiabetesPedigreeFunction: 0.305,
    Age: 65,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 146,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 38.5,
    DiabetesPedigreeFunction: 0.52,
    Age: 67,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 147,
    BloodPressure: 74,
    SkinThickness: 25,
    Insulin: 293,
    BMI: 34.9,
    DiabetesPedigreeFunction: 0.385,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 99,
    BloodPressure: 54,
    SkinThickness: 28,
    Insulin: 83,
    BMI: 34,
    DiabetesPedigreeFunction: 0.499,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 124,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.6,
    DiabetesPedigreeFunction: 0.368,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 101,
    BloodPressure: 64,
    SkinThickness: 17,
    Insulin: 0,
    BMI: 21,
    DiabetesPedigreeFunction: 0.252,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 81,
    BloodPressure: 86,
    SkinThickness: 16,
    Insulin: 66,
    BMI: 27.5,
    DiabetesPedigreeFunction: 0.306,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 133,
    BloodPressure: 102,
    SkinThickness: 28,
    Insulin: 140,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.234,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 173,
    BloodPressure: 82,
    SkinThickness: 48,
    Insulin: 465,
    BMI: 38.4,
    DiabetesPedigreeFunction: 2.137,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 118,
    BloodPressure: 64,
    SkinThickness: 23,
    Insulin: 89,
    BMI: 0,
    DiabetesPedigreeFunction: 1.731,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 84,
    BloodPressure: 64,
    SkinThickness: 22,
    Insulin: 66,
    BMI: 35.8,
    DiabetesPedigreeFunction: 0.545,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 105,
    BloodPressure: 58,
    SkinThickness: 40,
    Insulin: 94,
    BMI: 34.9,
    DiabetesPedigreeFunction: 0.225,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 122,
    BloodPressure: 52,
    SkinThickness: 43,
    Insulin: 158,
    BMI: 36.2,
    DiabetesPedigreeFunction: 0.816,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 12,
    Glucose: 140,
    BloodPressure: 82,
    SkinThickness: 43,
    Insulin: 325,
    BMI: 39.2,
    DiabetesPedigreeFunction: 0.528,
    Age: 58,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 98,
    BloodPressure: 82,
    SkinThickness: 15,
    Insulin: 84,
    BMI: 25.2,
    DiabetesPedigreeFunction: 0.299,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 87,
    BloodPressure: 60,
    SkinThickness: 37,
    Insulin: 75,
    BMI: 37.2,
    DiabetesPedigreeFunction: 0.509,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 156,
    BloodPressure: 75,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 48.3,
    DiabetesPedigreeFunction: 0.238,
    Age: 32,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 93,
    BloodPressure: 100,
    SkinThickness: 39,
    Insulin: 72,
    BMI: 43.4,
    DiabetesPedigreeFunction: 1.021,
    Age: 35,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 107,
    BloodPressure: 72,
    SkinThickness: 30,
    Insulin: 82,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.821,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 105,
    BloodPressure: 68,
    SkinThickness: 22,
    Insulin: 0,
    BMI: 20,
    DiabetesPedigreeFunction: 0.236,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 109,
    BloodPressure: 60,
    SkinThickness: 8,
    Insulin: 182,
    BMI: 25.4,
    DiabetesPedigreeFunction: 0.947,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 90,
    BloodPressure: 62,
    SkinThickness: 18,
    Insulin: 59,
    BMI: 25.1,
    DiabetesPedigreeFunction: 1.268,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 125,
    BloodPressure: 70,
    SkinThickness: 24,
    Insulin: 110,
    BMI: 24.3,
    DiabetesPedigreeFunction: 0.221,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 119,
    BloodPressure: 54,
    SkinThickness: 13,
    Insulin: 50,
    BMI: 22.3,
    DiabetesPedigreeFunction: 0.205,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 116,
    BloodPressure: 74,
    SkinThickness: 29,
    Insulin: 0,
    BMI: 32.3,
    DiabetesPedigreeFunction: 0.66,
    Age: 35,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 105,
    BloodPressure: 100,
    SkinThickness: 36,
    Insulin: 0,
    BMI: 43.3,
    DiabetesPedigreeFunction: 0.239,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 144,
    BloodPressure: 82,
    SkinThickness: 26,
    Insulin: 285,
    BMI: 32,
    DiabetesPedigreeFunction: 0.452,
    Age: 58,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 100,
    BloodPressure: 68,
    SkinThickness: 23,
    Insulin: 81,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.949,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 100,
    BloodPressure: 66,
    SkinThickness: 29,
    Insulin: 196,
    BMI: 32,
    DiabetesPedigreeFunction: 0.444,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 166,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 45.7,
    DiabetesPedigreeFunction: 0.34,
    Age: 27,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 131,
    BloodPressure: 64,
    SkinThickness: 14,
    Insulin: 415,
    BMI: 23.7,
    DiabetesPedigreeFunction: 0.389,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 116,
    BloodPressure: 72,
    SkinThickness: 12,
    Insulin: 87,
    BMI: 22.1,
    DiabetesPedigreeFunction: 0.463,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 158,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.9,
    DiabetesPedigreeFunction: 0.803,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 127,
    BloodPressure: 58,
    SkinThickness: 24,
    Insulin: 275,
    BMI: 27.7,
    DiabetesPedigreeFunction: 1.6,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 96,
    BloodPressure: 56,
    SkinThickness: 34,
    Insulin: 115,
    BMI: 24.7,
    DiabetesPedigreeFunction: 0.944,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 131,
    BloodPressure: 66,
    SkinThickness: 40,
    Insulin: 0,
    BMI: 34.3,
    DiabetesPedigreeFunction: 0.196,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 82,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.1,
    DiabetesPedigreeFunction: 0.389,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 193,
    BloodPressure: 70,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 34.9,
    DiabetesPedigreeFunction: 0.241,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 95,
    BloodPressure: 64,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32,
    DiabetesPedigreeFunction: 0.161,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 137,
    BloodPressure: 61,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.2,
    DiabetesPedigreeFunction: 0.151,
    Age: 55,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 136,
    BloodPressure: 84,
    SkinThickness: 41,
    Insulin: 88,
    BMI: 35,
    DiabetesPedigreeFunction: 0.286,
    Age: 35,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 72,
    BloodPressure: 78,
    SkinThickness: 25,
    Insulin: 0,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.28,
    Age: 38,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 168,
    BloodPressure: 64,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.9,
    DiabetesPedigreeFunction: 0.135,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 123,
    BloodPressure: 48,
    SkinThickness: 32,
    Insulin: 165,
    BMI: 42.1,
    DiabetesPedigreeFunction: 0.52,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 115,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28.9,
    DiabetesPedigreeFunction: 0.376,
    Age: 46,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 101,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.9,
    DiabetesPedigreeFunction: 0.336,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 197,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25.9,
    DiabetesPedigreeFunction: 1.191,
    Age: 39,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 172,
    BloodPressure: 68,
    SkinThickness: 49,
    Insulin: 579,
    BMI: 42.4,
    DiabetesPedigreeFunction: 0.702,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 102,
    BloodPressure: 90,
    SkinThickness: 39,
    Insulin: 0,
    BMI: 35.7,
    DiabetesPedigreeFunction: 0.674,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 112,
    BloodPressure: 72,
    SkinThickness: 30,
    Insulin: 176,
    BMI: 34.4,
    DiabetesPedigreeFunction: 0.528,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 143,
    BloodPressure: 84,
    SkinThickness: 23,
    Insulin: 310,
    BMI: 42.4,
    DiabetesPedigreeFunction: 1.076,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 143,
    BloodPressure: 74,
    SkinThickness: 22,
    Insulin: 61,
    BMI: 26.2,
    DiabetesPedigreeFunction: 0.256,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 138,
    BloodPressure: 60,
    SkinThickness: 35,
    Insulin: 167,
    BMI: 34.6,
    DiabetesPedigreeFunction: 0.534,
    Age: 21,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 173,
    BloodPressure: 84,
    SkinThickness: 33,
    Insulin: 474,
    BMI: 35.7,
    DiabetesPedigreeFunction: 0.258,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 97,
    BloodPressure: 68,
    SkinThickness: 21,
    Insulin: 0,
    BMI: 27.2,
    DiabetesPedigreeFunction: 1.095,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 144,
    BloodPressure: 82,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 38.5,
    DiabetesPedigreeFunction: 0.554,
    Age: 37,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 83,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 18.2,
    DiabetesPedigreeFunction: 0.624,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 129,
    BloodPressure: 64,
    SkinThickness: 29,
    Insulin: 115,
    BMI: 26.4,
    DiabetesPedigreeFunction: 0.219,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 119,
    BloodPressure: 88,
    SkinThickness: 41,
    Insulin: 170,
    BMI: 45.3,
    DiabetesPedigreeFunction: 0.507,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 94,
    BloodPressure: 68,
    SkinThickness: 18,
    Insulin: 76,
    BMI: 26,
    DiabetesPedigreeFunction: 0.561,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 102,
    BloodPressure: 64,
    SkinThickness: 46,
    Insulin: 78,
    BMI: 40.6,
    DiabetesPedigreeFunction: 0.496,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 115,
    BloodPressure: 64,
    SkinThickness: 22,
    Insulin: 0,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.421,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 151,
    BloodPressure: 78,
    SkinThickness: 32,
    Insulin: 210,
    BMI: 42.9,
    DiabetesPedigreeFunction: 0.516,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 184,
    BloodPressure: 78,
    SkinThickness: 39,
    Insulin: 277,
    BMI: 37,
    DiabetesPedigreeFunction: 0.264,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 94,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 0,
    DiabetesPedigreeFunction: 0.256,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 181,
    BloodPressure: 64,
    SkinThickness: 30,
    Insulin: 180,
    BMI: 34.1,
    DiabetesPedigreeFunction: 0.328,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 135,
    BloodPressure: 94,
    SkinThickness: 46,
    Insulin: 145,
    BMI: 40.6,
    DiabetesPedigreeFunction: 0.284,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 95,
    BloodPressure: 82,
    SkinThickness: 25,
    Insulin: 180,
    BMI: 35,
    DiabetesPedigreeFunction: 0.233,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 99,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 22.2,
    DiabetesPedigreeFunction: 0.108,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 89,
    BloodPressure: 74,
    SkinThickness: 16,
    Insulin: 85,
    BMI: 30.4,
    DiabetesPedigreeFunction: 0.551,
    Age: 38,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 80,
    BloodPressure: 74,
    SkinThickness: 11,
    Insulin: 60,
    BMI: 30,
    DiabetesPedigreeFunction: 0.527,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 139,
    BloodPressure: 75,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25.6,
    DiabetesPedigreeFunction: 0.167,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 90,
    BloodPressure: 68,
    SkinThickness: 8,
    Insulin: 0,
    BMI: 24.5,
    DiabetesPedigreeFunction: 1.138,
    Age: 36,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 141,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 42.4,
    DiabetesPedigreeFunction: 0.205,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 12,
    Glucose: 140,
    BloodPressure: 85,
    SkinThickness: 33,
    Insulin: 0,
    BMI: 37.4,
    DiabetesPedigreeFunction: 0.244,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 147,
    BloodPressure: 75,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.9,
    DiabetesPedigreeFunction: 0.434,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 97,
    BloodPressure: 70,
    SkinThickness: 15,
    Insulin: 0,
    BMI: 18.2,
    DiabetesPedigreeFunction: 0.147,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 107,
    BloodPressure: 88,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 36.8,
    DiabetesPedigreeFunction: 0.727,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 189,
    BloodPressure: 104,
    SkinThickness: 25,
    Insulin: 0,
    BMI: 34.3,
    DiabetesPedigreeFunction: 0.435,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 83,
    BloodPressure: 66,
    SkinThickness: 23,
    Insulin: 50,
    BMI: 32.2,
    DiabetesPedigreeFunction: 0.497,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 117,
    BloodPressure: 64,
    SkinThickness: 27,
    Insulin: 120,
    BMI: 33.2,
    DiabetesPedigreeFunction: 0.23,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 108,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.5,
    DiabetesPedigreeFunction: 0.955,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 117,
    BloodPressure: 62,
    SkinThickness: 12,
    Insulin: 0,
    BMI: 29.7,
    DiabetesPedigreeFunction: 0.38,
    Age: 30,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 180,
    BloodPressure: 78,
    SkinThickness: 63,
    Insulin: 14,
    BMI: 59.4,
    DiabetesPedigreeFunction: 2.42,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 100,
    BloodPressure: 72,
    SkinThickness: 12,
    Insulin: 70,
    BMI: 25.3,
    DiabetesPedigreeFunction: 0.658,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 95,
    BloodPressure: 80,
    SkinThickness: 45,
    Insulin: 92,
    BMI: 36.5,
    DiabetesPedigreeFunction: 0.33,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 104,
    BloodPressure: 64,
    SkinThickness: 37,
    Insulin: 64,
    BMI: 33.6,
    DiabetesPedigreeFunction: 0.51,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 120,
    BloodPressure: 74,
    SkinThickness: 18,
    Insulin: 63,
    BMI: 30.5,
    DiabetesPedigreeFunction: 0.285,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 82,
    BloodPressure: 64,
    SkinThickness: 13,
    Insulin: 95,
    BMI: 21.2,
    DiabetesPedigreeFunction: 0.415,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 134,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28.9,
    DiabetesPedigreeFunction: 0.542,
    Age: 23,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 91,
    BloodPressure: 68,
    SkinThickness: 32,
    Insulin: 210,
    BMI: 39.9,
    DiabetesPedigreeFunction: 0.381,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 119,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 19.6,
    DiabetesPedigreeFunction: 0.832,
    Age: 72,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 100,
    BloodPressure: 54,
    SkinThickness: 28,
    Insulin: 105,
    BMI: 37.8,
    DiabetesPedigreeFunction: 0.498,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 14,
    Glucose: 175,
    BloodPressure: 62,
    SkinThickness: 30,
    Insulin: 0,
    BMI: 33.6,
    DiabetesPedigreeFunction: 0.212,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 135,
    BloodPressure: 54,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26.7,
    DiabetesPedigreeFunction: 0.687,
    Age: 62,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 86,
    BloodPressure: 68,
    SkinThickness: 28,
    Insulin: 71,
    BMI: 30.2,
    DiabetesPedigreeFunction: 0.364,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 148,
    BloodPressure: 84,
    SkinThickness: 48,
    Insulin: 237,
    BMI: 37.6,
    DiabetesPedigreeFunction: 1.001,
    Age: 51,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 134,
    BloodPressure: 74,
    SkinThickness: 33,
    Insulin: 60,
    BMI: 25.9,
    DiabetesPedigreeFunction: 0.46,
    Age: 81,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 120,
    BloodPressure: 72,
    SkinThickness: 22,
    Insulin: 56,
    BMI: 20.8,
    DiabetesPedigreeFunction: 0.733,
    Age: 48,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 71,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.8,
    DiabetesPedigreeFunction: 0.416,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 74,
    BloodPressure: 70,
    SkinThickness: 40,
    Insulin: 49,
    BMI: 35.3,
    DiabetesPedigreeFunction: 0.705,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 88,
    BloodPressure: 78,
    SkinThickness: 30,
    Insulin: 0,
    BMI: 27.6,
    DiabetesPedigreeFunction: 0.258,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 115,
    BloodPressure: 98,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24,
    DiabetesPedigreeFunction: 1.022,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 124,
    BloodPressure: 56,
    SkinThickness: 13,
    Insulin: 105,
    BMI: 21.8,
    DiabetesPedigreeFunction: 0.452,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 74,
    BloodPressure: 52,
    SkinThickness: 10,
    Insulin: 36,
    BMI: 27.8,
    DiabetesPedigreeFunction: 0.269,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 97,
    BloodPressure: 64,
    SkinThickness: 36,
    Insulin: 100,
    BMI: 36.8,
    DiabetesPedigreeFunction: 0.6,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 120,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30,
    DiabetesPedigreeFunction: 0.183,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 154,
    BloodPressure: 78,
    SkinThickness: 41,
    Insulin: 140,
    BMI: 46.1,
    DiabetesPedigreeFunction: 0.571,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 144,
    BloodPressure: 82,
    SkinThickness: 40,
    Insulin: 0,
    BMI: 41.3,
    DiabetesPedigreeFunction: 0.607,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 137,
    BloodPressure: 70,
    SkinThickness: 38,
    Insulin: 0,
    BMI: 33.2,
    DiabetesPedigreeFunction: 0.17,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 119,
    BloodPressure: 66,
    SkinThickness: 27,
    Insulin: 0,
    BMI: 38.8,
    DiabetesPedigreeFunction: 0.259,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 136,
    BloodPressure: 90,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.9,
    DiabetesPedigreeFunction: 0.21,
    Age: 50,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 114,
    BloodPressure: 64,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28.9,
    DiabetesPedigreeFunction: 0.126,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 137,
    BloodPressure: 84,
    SkinThickness: 27,
    Insulin: 0,
    BMI: 27.3,
    DiabetesPedigreeFunction: 0.231,
    Age: 59,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 105,
    BloodPressure: 80,
    SkinThickness: 45,
    Insulin: 191,
    BMI: 33.7,
    DiabetesPedigreeFunction: 0.711,
    Age: 29,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 114,
    BloodPressure: 76,
    SkinThickness: 17,
    Insulin: 110,
    BMI: 23.8,
    DiabetesPedigreeFunction: 0.466,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 126,
    BloodPressure: 74,
    SkinThickness: 38,
    Insulin: 75,
    BMI: 25.9,
    DiabetesPedigreeFunction: 0.162,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 132,
    BloodPressure: 86,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 28,
    DiabetesPedigreeFunction: 0.419,
    Age: 63,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 158,
    BloodPressure: 70,
    SkinThickness: 30,
    Insulin: 328,
    BMI: 35.5,
    DiabetesPedigreeFunction: 0.344,
    Age: 35,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 123,
    BloodPressure: 88,
    SkinThickness: 37,
    Insulin: 0,
    BMI: 35.2,
    DiabetesPedigreeFunction: 0.197,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 85,
    BloodPressure: 58,
    SkinThickness: 22,
    Insulin: 49,
    BMI: 27.8,
    DiabetesPedigreeFunction: 0.306,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 84,
    BloodPressure: 82,
    SkinThickness: 31,
    Insulin: 125,
    BMI: 38.2,
    DiabetesPedigreeFunction: 0.233,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 145,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 44.2,
    DiabetesPedigreeFunction: 0.63,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 135,
    BloodPressure: 68,
    SkinThickness: 42,
    Insulin: 250,
    BMI: 42.3,
    DiabetesPedigreeFunction: 0.365,
    Age: 24,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 139,
    BloodPressure: 62,
    SkinThickness: 41,
    Insulin: 480,
    BMI: 40.7,
    DiabetesPedigreeFunction: 0.536,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 173,
    BloodPressure: 78,
    SkinThickness: 32,
    Insulin: 265,
    BMI: 46.5,
    DiabetesPedigreeFunction: 1.159,
    Age: 58,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 99,
    BloodPressure: 72,
    SkinThickness: 17,
    Insulin: 0,
    BMI: 25.6,
    DiabetesPedigreeFunction: 0.294,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 194,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26.1,
    DiabetesPedigreeFunction: 0.551,
    Age: 67,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 83,
    BloodPressure: 65,
    SkinThickness: 28,
    Insulin: 66,
    BMI: 36.8,
    DiabetesPedigreeFunction: 0.629,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 89,
    BloodPressure: 90,
    SkinThickness: 30,
    Insulin: 0,
    BMI: 33.5,
    DiabetesPedigreeFunction: 0.292,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 99,
    BloodPressure: 68,
    SkinThickness: 38,
    Insulin: 0,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.145,
    Age: 33,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 125,
    BloodPressure: 70,
    SkinThickness: 18,
    Insulin: 122,
    BMI: 28.9,
    DiabetesPedigreeFunction: 1.144,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 80,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 0,
    DiabetesPedigreeFunction: 0.174,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 166,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26.6,
    DiabetesPedigreeFunction: 0.304,
    Age: 66,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 110,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26,
    DiabetesPedigreeFunction: 0.292,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 81,
    BloodPressure: 72,
    SkinThickness: 15,
    Insulin: 76,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.547,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 195,
    BloodPressure: 70,
    SkinThickness: 33,
    Insulin: 145,
    BMI: 25.1,
    DiabetesPedigreeFunction: 0.163,
    Age: 55,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 154,
    BloodPressure: 74,
    SkinThickness: 32,
    Insulin: 193,
    BMI: 29.3,
    DiabetesPedigreeFunction: 0.839,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 117,
    BloodPressure: 90,
    SkinThickness: 19,
    Insulin: 71,
    BMI: 25.2,
    DiabetesPedigreeFunction: 0.313,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 84,
    BloodPressure: 72,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 37.2,
    DiabetesPedigreeFunction: 0.267,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 0,
    BloodPressure: 68,
    SkinThickness: 41,
    Insulin: 0,
    BMI: 39,
    DiabetesPedigreeFunction: 0.727,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 94,
    BloodPressure: 64,
    SkinThickness: 25,
    Insulin: 79,
    BMI: 33.3,
    DiabetesPedigreeFunction: 0.738,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 96,
    BloodPressure: 78,
    SkinThickness: 39,
    Insulin: 0,
    BMI: 37.3,
    DiabetesPedigreeFunction: 0.238,
    Age: 40,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 75,
    BloodPressure: 82,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 33.3,
    DiabetesPedigreeFunction: 0.263,
    Age: 38,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 180,
    BloodPressure: 90,
    SkinThickness: 26,
    Insulin: 90,
    BMI: 36.5,
    DiabetesPedigreeFunction: 0.314,
    Age: 35,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 130,
    BloodPressure: 60,
    SkinThickness: 23,
    Insulin: 170,
    BMI: 28.6,
    DiabetesPedigreeFunction: 0.692,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 84,
    BloodPressure: 50,
    SkinThickness: 23,
    Insulin: 76,
    BMI: 30.4,
    DiabetesPedigreeFunction: 0.968,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 120,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25,
    DiabetesPedigreeFunction: 0.409,
    Age: 64,
    Outcome: 0
  },
  {
    Pregnancies: 12,
    Glucose: 84,
    BloodPressure: 72,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 29.7,
    DiabetesPedigreeFunction: 0.297,
    Age: 46,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 139,
    BloodPressure: 62,
    SkinThickness: 17,
    Insulin: 210,
    BMI: 22.1,
    DiabetesPedigreeFunction: 0.207,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 91,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.2,
    DiabetesPedigreeFunction: 0.2,
    Age: 58,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 91,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.3,
    DiabetesPedigreeFunction: 0.525,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 99,
    BloodPressure: 54,
    SkinThickness: 19,
    Insulin: 86,
    BMI: 25.6,
    DiabetesPedigreeFunction: 0.154,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 163,
    BloodPressure: 70,
    SkinThickness: 18,
    Insulin: 105,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.268,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 145,
    BloodPressure: 88,
    SkinThickness: 34,
    Insulin: 165,
    BMI: 30.3,
    DiabetesPedigreeFunction: 0.771,
    Age: 53,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 125,
    BloodPressure: 86,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 37.6,
    DiabetesPedigreeFunction: 0.304,
    Age: 51,
    Outcome: 0
  },
  {
    Pregnancies: 13,
    Glucose: 76,
    BloodPressure: 60,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.18,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 129,
    BloodPressure: 90,
    SkinThickness: 7,
    Insulin: 326,
    BMI: 19.6,
    DiabetesPedigreeFunction: 0.582,
    Age: 60,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 68,
    BloodPressure: 70,
    SkinThickness: 32,
    Insulin: 66,
    BMI: 25,
    DiabetesPedigreeFunction: 0.187,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 124,
    BloodPressure: 80,
    SkinThickness: 33,
    Insulin: 130,
    BMI: 33.2,
    DiabetesPedigreeFunction: 0.305,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 114,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 0,
    DiabetesPedigreeFunction: 0.189,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 130,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34.2,
    DiabetesPedigreeFunction: 0.652,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 125,
    BloodPressure: 58,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.151,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 87,
    BloodPressure: 60,
    SkinThickness: 18,
    Insulin: 0,
    BMI: 21.8,
    DiabetesPedigreeFunction: 0.444,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 97,
    BloodPressure: 64,
    SkinThickness: 19,
    Insulin: 82,
    BMI: 18.2,
    DiabetesPedigreeFunction: 0.299,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 116,
    BloodPressure: 74,
    SkinThickness: 15,
    Insulin: 105,
    BMI: 26.3,
    DiabetesPedigreeFunction: 0.107,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 117,
    BloodPressure: 66,
    SkinThickness: 31,
    Insulin: 188,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.493,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 111,
    BloodPressure: 65,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.6,
    DiabetesPedigreeFunction: 0.66,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 122,
    BloodPressure: 60,
    SkinThickness: 18,
    Insulin: 106,
    BMI: 29.8,
    DiabetesPedigreeFunction: 0.717,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 107,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 45.3,
    DiabetesPedigreeFunction: 0.686,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 86,
    BloodPressure: 66,
    SkinThickness: 52,
    Insulin: 65,
    BMI: 41.3,
    DiabetesPedigreeFunction: 0.917,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 91,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.8,
    DiabetesPedigreeFunction: 0.501,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 77,
    BloodPressure: 56,
    SkinThickness: 30,
    Insulin: 56,
    BMI: 33.3,
    DiabetesPedigreeFunction: 1.251,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 132,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.9,
    DiabetesPedigreeFunction: 0.302,
    Age: 23,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 105,
    BloodPressure: 90,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.6,
    DiabetesPedigreeFunction: 0.197,
    Age: 46,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 57,
    BloodPressure: 60,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.7,
    DiabetesPedigreeFunction: 0.735,
    Age: 67,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 127,
    BloodPressure: 80,
    SkinThickness: 37,
    Insulin: 210,
    BMI: 36.3,
    DiabetesPedigreeFunction: 0.804,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 129,
    BloodPressure: 92,
    SkinThickness: 49,
    Insulin: 155,
    BMI: 36.4,
    DiabetesPedigreeFunction: 0.968,
    Age: 32,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 100,
    BloodPressure: 74,
    SkinThickness: 40,
    Insulin: 215,
    BMI: 39.4,
    DiabetesPedigreeFunction: 0.661,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 128,
    BloodPressure: 72,
    SkinThickness: 25,
    Insulin: 190,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.549,
    Age: 27,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 90,
    BloodPressure: 85,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 34.9,
    DiabetesPedigreeFunction: 0.825,
    Age: 56,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 84,
    BloodPressure: 90,
    SkinThickness: 23,
    Insulin: 56,
    BMI: 39.5,
    DiabetesPedigreeFunction: 0.159,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 88,
    BloodPressure: 78,
    SkinThickness: 29,
    Insulin: 76,
    BMI: 32,
    DiabetesPedigreeFunction: 0.365,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 186,
    BloodPressure: 90,
    SkinThickness: 35,
    Insulin: 225,
    BMI: 34.5,
    DiabetesPedigreeFunction: 0.423,
    Age: 37,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 187,
    BloodPressure: 76,
    SkinThickness: 27,
    Insulin: 207,
    BMI: 43.6,
    DiabetesPedigreeFunction: 1.034,
    Age: 53,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 131,
    BloodPressure: 68,
    SkinThickness: 21,
    Insulin: 166,
    BMI: 33.1,
    DiabetesPedigreeFunction: 0.16,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 164,
    BloodPressure: 82,
    SkinThickness: 43,
    Insulin: 67,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.341,
    Age: 50,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 189,
    BloodPressure: 110,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 28.5,
    DiabetesPedigreeFunction: 0.68,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 116,
    BloodPressure: 70,
    SkinThickness: 28,
    Insulin: 0,
    BMI: 27.4,
    DiabetesPedigreeFunction: 0.204,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 84,
    BloodPressure: 68,
    SkinThickness: 30,
    Insulin: 106,
    BMI: 31.9,
    DiabetesPedigreeFunction: 0.591,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 114,
    BloodPressure: 88,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.8,
    DiabetesPedigreeFunction: 0.247,
    Age: 66,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 88,
    BloodPressure: 62,
    SkinThickness: 24,
    Insulin: 44,
    BMI: 29.9,
    DiabetesPedigreeFunction: 0.422,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 84,
    BloodPressure: 64,
    SkinThickness: 23,
    Insulin: 115,
    BMI: 36.9,
    DiabetesPedigreeFunction: 0.471,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 124,
    BloodPressure: 70,
    SkinThickness: 33,
    Insulin: 215,
    BMI: 25.5,
    DiabetesPedigreeFunction: 0.161,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 97,
    BloodPressure: 70,
    SkinThickness: 40,
    Insulin: 0,
    BMI: 38.1,
    DiabetesPedigreeFunction: 0.218,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 110,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.8,
    DiabetesPedigreeFunction: 0.237,
    Age: 58,
    Outcome: 0
  },
  {
    Pregnancies: 11,
    Glucose: 103,
    BloodPressure: 68,
    SkinThickness: 40,
    Insulin: 0,
    BMI: 46.2,
    DiabetesPedigreeFunction: 0.126,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 11,
    Glucose: 85,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.3,
    Age: 35,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 125,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 33.8,
    DiabetesPedigreeFunction: 0.121,
    Age: 54,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 198,
    BloodPressure: 66,
    SkinThickness: 32,
    Insulin: 274,
    BMI: 41.3,
    DiabetesPedigreeFunction: 0.502,
    Age: 28,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 87,
    BloodPressure: 68,
    SkinThickness: 34,
    Insulin: 77,
    BMI: 37.6,
    DiabetesPedigreeFunction: 0.401,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 99,
    BloodPressure: 60,
    SkinThickness: 19,
    Insulin: 54,
    BMI: 26.9,
    DiabetesPedigreeFunction: 0.497,
    Age: 32,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 91,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.601,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 95,
    BloodPressure: 54,
    SkinThickness: 14,
    Insulin: 88,
    BMI: 26.1,
    DiabetesPedigreeFunction: 0.748,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 99,
    BloodPressure: 72,
    SkinThickness: 30,
    Insulin: 18,
    BMI: 38.6,
    DiabetesPedigreeFunction: 0.412,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 92,
    BloodPressure: 62,
    SkinThickness: 32,
    Insulin: 126,
    BMI: 32,
    DiabetesPedigreeFunction: 0.085,
    Age: 46,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 154,
    BloodPressure: 72,
    SkinThickness: 29,
    Insulin: 126,
    BMI: 31.3,
    DiabetesPedigreeFunction: 0.338,
    Age: 37,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 121,
    BloodPressure: 66,
    SkinThickness: 30,
    Insulin: 165,
    BMI: 34.3,
    DiabetesPedigreeFunction: 0.203,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 78,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.5,
    DiabetesPedigreeFunction: 0.27,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 130,
    BloodPressure: 96,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 22.6,
    DiabetesPedigreeFunction: 0.268,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 111,
    BloodPressure: 58,
    SkinThickness: 31,
    Insulin: 44,
    BMI: 29.5,
    DiabetesPedigreeFunction: 0.43,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 98,
    BloodPressure: 60,
    SkinThickness: 17,
    Insulin: 120,
    BMI: 34.7,
    DiabetesPedigreeFunction: 0.198,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 143,
    BloodPressure: 86,
    SkinThickness: 30,
    Insulin: 330,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.892,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 119,
    BloodPressure: 44,
    SkinThickness: 47,
    Insulin: 63,
    BMI: 35.5,
    DiabetesPedigreeFunction: 0.28,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 108,
    BloodPressure: 44,
    SkinThickness: 20,
    Insulin: 130,
    BMI: 24,
    DiabetesPedigreeFunction: 0.813,
    Age: 35,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 118,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 42.9,
    DiabetesPedigreeFunction: 0.693,
    Age: 21,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 133,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27,
    DiabetesPedigreeFunction: 0.245,
    Age: 36,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 197,
    BloodPressure: 70,
    SkinThickness: 99,
    Insulin: 0,
    BMI: 34.7,
    DiabetesPedigreeFunction: 0.575,
    Age: 62,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 151,
    BloodPressure: 90,
    SkinThickness: 46,
    Insulin: 0,
    BMI: 42.1,
    DiabetesPedigreeFunction: 0.371,
    Age: 21,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 109,
    BloodPressure: 60,
    SkinThickness: 27,
    Insulin: 0,
    BMI: 25,
    DiabetesPedigreeFunction: 0.206,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 12,
    Glucose: 121,
    BloodPressure: 78,
    SkinThickness: 17,
    Insulin: 0,
    BMI: 26.5,
    DiabetesPedigreeFunction: 0.259,
    Age: 62,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 100,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 38.7,
    DiabetesPedigreeFunction: 0.19,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 124,
    BloodPressure: 76,
    SkinThickness: 24,
    Insulin: 600,
    BMI: 28.7,
    DiabetesPedigreeFunction: 0.687,
    Age: 52,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 93,
    BloodPressure: 56,
    SkinThickness: 11,
    Insulin: 0,
    BMI: 22.5,
    DiabetesPedigreeFunction: 0.417,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 143,
    BloodPressure: 66,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34.9,
    DiabetesPedigreeFunction: 0.129,
    Age: 41,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 103,
    BloodPressure: 66,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.3,
    DiabetesPedigreeFunction: 0.249,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 176,
    BloodPressure: 86,
    SkinThickness: 27,
    Insulin: 156,
    BMI: 33.3,
    DiabetesPedigreeFunction: 1.154,
    Age: 52,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 73,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 21.1,
    DiabetesPedigreeFunction: 0.342,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 11,
    Glucose: 111,
    BloodPressure: 84,
    SkinThickness: 40,
    Insulin: 0,
    BMI: 46.8,
    DiabetesPedigreeFunction: 0.925,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 112,
    BloodPressure: 78,
    SkinThickness: 50,
    Insulin: 140,
    BMI: 39.4,
    DiabetesPedigreeFunction: 0.175,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 132,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34.4,
    DiabetesPedigreeFunction: 0.402,
    Age: 44,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 82,
    BloodPressure: 52,
    SkinThickness: 22,
    Insulin: 115,
    BMI: 28.5,
    DiabetesPedigreeFunction: 1.699,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 123,
    BloodPressure: 72,
    SkinThickness: 45,
    Insulin: 230,
    BMI: 33.6,
    DiabetesPedigreeFunction: 0.733,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 188,
    BloodPressure: 82,
    SkinThickness: 14,
    Insulin: 185,
    BMI: 32,
    DiabetesPedigreeFunction: 0.682,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 67,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 45.3,
    DiabetesPedigreeFunction: 0.194,
    Age: 46,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 89,
    BloodPressure: 24,
    SkinThickness: 19,
    Insulin: 25,
    BMI: 27.8,
    DiabetesPedigreeFunction: 0.559,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 173,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 36.8,
    DiabetesPedigreeFunction: 0.088,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 109,
    BloodPressure: 38,
    SkinThickness: 18,
    Insulin: 120,
    BMI: 23.1,
    DiabetesPedigreeFunction: 0.407,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 108,
    BloodPressure: 88,
    SkinThickness: 19,
    Insulin: 0,
    BMI: 27.1,
    DiabetesPedigreeFunction: 0.4,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 96,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.7,
    DiabetesPedigreeFunction: 0.19,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 124,
    BloodPressure: 74,
    SkinThickness: 36,
    Insulin: 0,
    BMI: 27.8,
    DiabetesPedigreeFunction: 0.1,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 150,
    BloodPressure: 78,
    SkinThickness: 29,
    Insulin: 126,
    BMI: 35.2,
    DiabetesPedigreeFunction: 0.692,
    Age: 54,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 183,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28.4,
    DiabetesPedigreeFunction: 0.212,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 124,
    BloodPressure: 60,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 35.8,
    DiabetesPedigreeFunction: 0.514,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 181,
    BloodPressure: 78,
    SkinThickness: 42,
    Insulin: 293,
    BMI: 40,
    DiabetesPedigreeFunction: 1.258,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 92,
    BloodPressure: 62,
    SkinThickness: 25,
    Insulin: 41,
    BMI: 19.5,
    DiabetesPedigreeFunction: 0.482,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 152,
    BloodPressure: 82,
    SkinThickness: 39,
    Insulin: 272,
    BMI: 41.5,
    DiabetesPedigreeFunction: 0.27,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 111,
    BloodPressure: 62,
    SkinThickness: 13,
    Insulin: 182,
    BMI: 24,
    DiabetesPedigreeFunction: 0.138,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 106,
    BloodPressure: 54,
    SkinThickness: 21,
    Insulin: 158,
    BMI: 30.9,
    DiabetesPedigreeFunction: 0.292,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 174,
    BloodPressure: 58,
    SkinThickness: 22,
    Insulin: 194,
    BMI: 32.9,
    DiabetesPedigreeFunction: 0.593,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 168,
    BloodPressure: 88,
    SkinThickness: 42,
    Insulin: 321,
    BMI: 38.2,
    DiabetesPedigreeFunction: 0.787,
    Age: 40,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 105,
    BloodPressure: 80,
    SkinThickness: 28,
    Insulin: 0,
    BMI: 32.5,
    DiabetesPedigreeFunction: 0.878,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 11,
    Glucose: 138,
    BloodPressure: 74,
    SkinThickness: 26,
    Insulin: 144,
    BMI: 36.1,
    DiabetesPedigreeFunction: 0.557,
    Age: 50,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 106,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25.8,
    DiabetesPedigreeFunction: 0.207,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 117,
    BloodPressure: 96,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28.7,
    DiabetesPedigreeFunction: 0.157,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 68,
    BloodPressure: 62,
    SkinThickness: 13,
    Insulin: 15,
    BMI: 20.1,
    DiabetesPedigreeFunction: 0.257,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 112,
    BloodPressure: 82,
    SkinThickness: 24,
    Insulin: 0,
    BMI: 28.2,
    DiabetesPedigreeFunction: 1.282,
    Age: 50,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 119,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.141,
    Age: 24,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 112,
    BloodPressure: 86,
    SkinThickness: 42,
    Insulin: 160,
    BMI: 38.4,
    DiabetesPedigreeFunction: 0.246,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 92,
    BloodPressure: 76,
    SkinThickness: 20,
    Insulin: 0,
    BMI: 24.2,
    DiabetesPedigreeFunction: 1.698,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 183,
    BloodPressure: 94,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 40.8,
    DiabetesPedigreeFunction: 1.461,
    Age: 45,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 94,
    BloodPressure: 70,
    SkinThickness: 27,
    Insulin: 115,
    BMI: 43.5,
    DiabetesPedigreeFunction: 0.347,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 108,
    BloodPressure: 64,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.158,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 90,
    BloodPressure: 88,
    SkinThickness: 47,
    Insulin: 54,
    BMI: 37.7,
    DiabetesPedigreeFunction: 0.362,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 125,
    BloodPressure: 68,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.7,
    DiabetesPedigreeFunction: 0.206,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 132,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.393,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 128,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34.6,
    DiabetesPedigreeFunction: 0.144,
    Age: 45,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 94,
    BloodPressure: 65,
    SkinThickness: 22,
    Insulin: 0,
    BMI: 24.7,
    DiabetesPedigreeFunction: 0.148,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 114,
    BloodPressure: 64,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.4,
    DiabetesPedigreeFunction: 0.732,
    Age: 34,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 102,
    BloodPressure: 78,
    SkinThickness: 40,
    Insulin: 90,
    BMI: 34.5,
    DiabetesPedigreeFunction: 0.238,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 111,
    BloodPressure: 60,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26.2,
    DiabetesPedigreeFunction: 0.343,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 128,
    BloodPressure: 82,
    SkinThickness: 17,
    Insulin: 183,
    BMI: 27.5,
    DiabetesPedigreeFunction: 0.115,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 92,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25.9,
    DiabetesPedigreeFunction: 0.167,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 13,
    Glucose: 104,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.465,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 104,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28.8,
    DiabetesPedigreeFunction: 0.153,
    Age: 48,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 94,
    BloodPressure: 76,
    SkinThickness: 18,
    Insulin: 66,
    BMI: 31.6,
    DiabetesPedigreeFunction: 0.649,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 97,
    BloodPressure: 76,
    SkinThickness: 32,
    Insulin: 91,
    BMI: 40.9,
    DiabetesPedigreeFunction: 0.871,
    Age: 32,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 100,
    BloodPressure: 74,
    SkinThickness: 12,
    Insulin: 46,
    BMI: 19.5,
    DiabetesPedigreeFunction: 0.149,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 102,
    BloodPressure: 86,
    SkinThickness: 17,
    Insulin: 105,
    BMI: 29.3,
    DiabetesPedigreeFunction: 0.695,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 128,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 34.3,
    DiabetesPedigreeFunction: 0.303,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 147,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.5,
    DiabetesPedigreeFunction: 0.178,
    Age: 50,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 90,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28,
    DiabetesPedigreeFunction: 0.61,
    Age: 31,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 103,
    BloodPressure: 72,
    SkinThickness: 30,
    Insulin: 152,
    BMI: 27.6,
    DiabetesPedigreeFunction: 0.73,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 157,
    BloodPressure: 74,
    SkinThickness: 35,
    Insulin: 440,
    BMI: 39.4,
    DiabetesPedigreeFunction: 0.134,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 167,
    BloodPressure: 74,
    SkinThickness: 17,
    Insulin: 144,
    BMI: 23.4,
    DiabetesPedigreeFunction: 0.447,
    Age: 33,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 179,
    BloodPressure: 50,
    SkinThickness: 36,
    Insulin: 159,
    BMI: 37.8,
    DiabetesPedigreeFunction: 0.455,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 11,
    Glucose: 136,
    BloodPressure: 84,
    SkinThickness: 35,
    Insulin: 130,
    BMI: 28.3,
    DiabetesPedigreeFunction: 0.26,
    Age: 42,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 107,
    BloodPressure: 60,
    SkinThickness: 25,
    Insulin: 0,
    BMI: 26.4,
    DiabetesPedigreeFunction: 0.133,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 91,
    BloodPressure: 54,
    SkinThickness: 25,
    Insulin: 100,
    BMI: 25.2,
    DiabetesPedigreeFunction: 0.234,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 117,
    BloodPressure: 60,
    SkinThickness: 23,
    Insulin: 106,
    BMI: 33.8,
    DiabetesPedigreeFunction: 0.466,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 123,
    BloodPressure: 74,
    SkinThickness: 40,
    Insulin: 77,
    BMI: 34.1,
    DiabetesPedigreeFunction: 0.269,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 120,
    BloodPressure: 54,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 26.8,
    DiabetesPedigreeFunction: 0.455,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 106,
    BloodPressure: 70,
    SkinThickness: 28,
    Insulin: 135,
    BMI: 34.2,
    DiabetesPedigreeFunction: 0.142,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 155,
    BloodPressure: 52,
    SkinThickness: 27,
    Insulin: 540,
    BMI: 38.7,
    DiabetesPedigreeFunction: 0.24,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 101,
    BloodPressure: 58,
    SkinThickness: 35,
    Insulin: 90,
    BMI: 21.8,
    DiabetesPedigreeFunction: 0.155,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 120,
    BloodPressure: 80,
    SkinThickness: 48,
    Insulin: 200,
    BMI: 38.9,
    DiabetesPedigreeFunction: 1.162,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 11,
    Glucose: 127,
    BloodPressure: 106,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 39,
    DiabetesPedigreeFunction: 0.19,
    Age: 51,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 80,
    BloodPressure: 82,
    SkinThickness: 31,
    Insulin: 70,
    BMI: 34.2,
    DiabetesPedigreeFunction: 1.292,
    Age: 27,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 162,
    BloodPressure: 84,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 27.7,
    DiabetesPedigreeFunction: 0.182,
    Age: 54,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 199,
    BloodPressure: 76,
    SkinThickness: 43,
    Insulin: 0,
    BMI: 42.9,
    DiabetesPedigreeFunction: 1.394,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 167,
    BloodPressure: 106,
    SkinThickness: 46,
    Insulin: 231,
    BMI: 37.6,
    DiabetesPedigreeFunction: 0.165,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 145,
    BloodPressure: 80,
    SkinThickness: 46,
    Insulin: 130,
    BMI: 37.9,
    DiabetesPedigreeFunction: 0.637,
    Age: 40,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 115,
    BloodPressure: 60,
    SkinThickness: 39,
    Insulin: 0,
    BMI: 33.7,
    DiabetesPedigreeFunction: 0.245,
    Age: 40,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 112,
    BloodPressure: 80,
    SkinThickness: 45,
    Insulin: 132,
    BMI: 34.8,
    DiabetesPedigreeFunction: 0.217,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 145,
    BloodPressure: 82,
    SkinThickness: 18,
    Insulin: 0,
    BMI: 32.5,
    DiabetesPedigreeFunction: 0.235,
    Age: 70,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 111,
    BloodPressure: 70,
    SkinThickness: 27,
    Insulin: 0,
    BMI: 27.5,
    DiabetesPedigreeFunction: 0.141,
    Age: 40,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 98,
    BloodPressure: 58,
    SkinThickness: 33,
    Insulin: 190,
    BMI: 34,
    DiabetesPedigreeFunction: 0.43,
    Age: 43,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 154,
    BloodPressure: 78,
    SkinThickness: 30,
    Insulin: 100,
    BMI: 30.9,
    DiabetesPedigreeFunction: 0.164,
    Age: 45,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 165,
    BloodPressure: 68,
    SkinThickness: 26,
    Insulin: 168,
    BMI: 33.6,
    DiabetesPedigreeFunction: 0.631,
    Age: 49,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 99,
    BloodPressure: 58,
    SkinThickness: 10,
    Insulin: 0,
    BMI: 25.4,
    DiabetesPedigreeFunction: 0.551,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 68,
    BloodPressure: 106,
    SkinThickness: 23,
    Insulin: 49,
    BMI: 35.5,
    DiabetesPedigreeFunction: 0.285,
    Age: 47,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 123,
    BloodPressure: 100,
    SkinThickness: 35,
    Insulin: 240,
    BMI: 57.3,
    DiabetesPedigreeFunction: 0.88,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 91,
    BloodPressure: 82,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 35.6,
    DiabetesPedigreeFunction: 0.587,
    Age: 68,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 195,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.9,
    DiabetesPedigreeFunction: 0.328,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 156,
    BloodPressure: 86,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.8,
    DiabetesPedigreeFunction: 0.23,
    Age: 53,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 93,
    BloodPressure: 60,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 35.3,
    DiabetesPedigreeFunction: 0.263,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 121,
    BloodPressure: 52,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 36,
    DiabetesPedigreeFunction: 0.127,
    Age: 25,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 101,
    BloodPressure: 58,
    SkinThickness: 17,
    Insulin: 265,
    BMI: 24.2,
    DiabetesPedigreeFunction: 0.614,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 56,
    BloodPressure: 56,
    SkinThickness: 28,
    Insulin: 45,
    BMI: 24.2,
    DiabetesPedigreeFunction: 0.332,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 162,
    BloodPressure: 76,
    SkinThickness: 36,
    Insulin: 0,
    BMI: 49.6,
    DiabetesPedigreeFunction: 0.364,
    Age: 26,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 95,
    BloodPressure: 64,
    SkinThickness: 39,
    Insulin: 105,
    BMI: 44.6,
    DiabetesPedigreeFunction: 0.366,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 125,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.3,
    DiabetesPedigreeFunction: 0.536,
    Age: 27,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 136,
    BloodPressure: 82,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 0,
    DiabetesPedigreeFunction: 0.64,
    Age: 69,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 129,
    BloodPressure: 74,
    SkinThickness: 26,
    Insulin: 205,
    BMI: 33.2,
    DiabetesPedigreeFunction: 0.591,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 130,
    BloodPressure: 64,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.1,
    DiabetesPedigreeFunction: 0.314,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 107,
    BloodPressure: 50,
    SkinThickness: 19,
    Insulin: 0,
    BMI: 28.3,
    DiabetesPedigreeFunction: 0.181,
    Age: 29,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 140,
    BloodPressure: 74,
    SkinThickness: 26,
    Insulin: 180,
    BMI: 24.1,
    DiabetesPedigreeFunction: 0.828,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 144,
    BloodPressure: 82,
    SkinThickness: 46,
    Insulin: 180,
    BMI: 46.1,
    DiabetesPedigreeFunction: 0.335,
    Age: 46,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 107,
    BloodPressure: 80,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.6,
    DiabetesPedigreeFunction: 0.856,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 13,
    Glucose: 158,
    BloodPressure: 114,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 42.3,
    DiabetesPedigreeFunction: 0.257,
    Age: 44,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 121,
    BloodPressure: 70,
    SkinThickness: 32,
    Insulin: 95,
    BMI: 39.1,
    DiabetesPedigreeFunction: 0.886,
    Age: 23,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 129,
    BloodPressure: 68,
    SkinThickness: 49,
    Insulin: 125,
    BMI: 38.5,
    DiabetesPedigreeFunction: 0.439,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 90,
    BloodPressure: 60,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.5,
    DiabetesPedigreeFunction: 0.191,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 142,
    BloodPressure: 90,
    SkinThickness: 24,
    Insulin: 480,
    BMI: 30.4,
    DiabetesPedigreeFunction: 0.128,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 169,
    BloodPressure: 74,
    SkinThickness: 19,
    Insulin: 125,
    BMI: 29.9,
    DiabetesPedigreeFunction: 0.268,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 99,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 25,
    DiabetesPedigreeFunction: 0.253,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 127,
    BloodPressure: 88,
    SkinThickness: 11,
    Insulin: 155,
    BMI: 34.5,
    DiabetesPedigreeFunction: 0.598,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 118,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 44.5,
    DiabetesPedigreeFunction: 0.904,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 122,
    BloodPressure: 76,
    SkinThickness: 27,
    Insulin: 200,
    BMI: 35.9,
    DiabetesPedigreeFunction: 0.483,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 125,
    BloodPressure: 78,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 27.6,
    DiabetesPedigreeFunction: 0.565,
    Age: 49,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 168,
    BloodPressure: 88,
    SkinThickness: 29,
    Insulin: 0,
    BMI: 35,
    DiabetesPedigreeFunction: 0.905,
    Age: 52,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 129,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 38.5,
    DiabetesPedigreeFunction: 0.304,
    Age: 41,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 110,
    BloodPressure: 76,
    SkinThickness: 20,
    Insulin: 100,
    BMI: 28.4,
    DiabetesPedigreeFunction: 0.118,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 80,
    BloodPressure: 80,
    SkinThickness: 36,
    Insulin: 0,
    BMI: 39.8,
    DiabetesPedigreeFunction: 0.177,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 115,
    BloodPressure: 0,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 0,
    DiabetesPedigreeFunction: 0.261,
    Age: 30,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 127,
    BloodPressure: 46,
    SkinThickness: 21,
    Insulin: 335,
    BMI: 34.4,
    DiabetesPedigreeFunction: 0.176,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 164,
    BloodPressure: 78,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.148,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 93,
    BloodPressure: 64,
    SkinThickness: 32,
    Insulin: 160,
    BMI: 38,
    DiabetesPedigreeFunction: 0.674,
    Age: 23,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 158,
    BloodPressure: 64,
    SkinThickness: 13,
    Insulin: 387,
    BMI: 31.2,
    DiabetesPedigreeFunction: 0.295,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 126,
    BloodPressure: 78,
    SkinThickness: 27,
    Insulin: 22,
    BMI: 29.6,
    DiabetesPedigreeFunction: 0.439,
    Age: 40,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 129,
    BloodPressure: 62,
    SkinThickness: 36,
    Insulin: 0,
    BMI: 41.2,
    DiabetesPedigreeFunction: 0.441,
    Age: 38,
    Outcome: 1
  },
  {
    Pregnancies: 0,
    Glucose: 134,
    BloodPressure: 58,
    SkinThickness: 20,
    Insulin: 291,
    BMI: 26.4,
    DiabetesPedigreeFunction: 0.352,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 102,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 29.5,
    DiabetesPedigreeFunction: 0.121,
    Age: 32,
    Outcome: 0
  },
  {
    Pregnancies: 7,
    Glucose: 187,
    BloodPressure: 50,
    SkinThickness: 33,
    Insulin: 392,
    BMI: 33.9,
    DiabetesPedigreeFunction: 0.826,
    Age: 34,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 173,
    BloodPressure: 78,
    SkinThickness: 39,
    Insulin: 185,
    BMI: 33.8,
    DiabetesPedigreeFunction: 0.97,
    Age: 31,
    Outcome: 1
  },
  {
    Pregnancies: 10,
    Glucose: 94,
    BloodPressure: 72,
    SkinThickness: 18,
    Insulin: 0,
    BMI: 23.1,
    DiabetesPedigreeFunction: 0.595,
    Age: 56,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 108,
    BloodPressure: 60,
    SkinThickness: 46,
    Insulin: 178,
    BMI: 35.5,
    DiabetesPedigreeFunction: 0.415,
    Age: 24,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 97,
    BloodPressure: 76,
    SkinThickness: 27,
    Insulin: 0,
    BMI: 35.6,
    DiabetesPedigreeFunction: 0.378,
    Age: 52,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 83,
    BloodPressure: 86,
    SkinThickness: 19,
    Insulin: 0,
    BMI: 29.3,
    DiabetesPedigreeFunction: 0.317,
    Age: 34,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 114,
    BloodPressure: 66,
    SkinThickness: 36,
    Insulin: 200,
    BMI: 38.1,
    DiabetesPedigreeFunction: 0.289,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 149,
    BloodPressure: 68,
    SkinThickness: 29,
    Insulin: 127,
    BMI: 29.3,
    DiabetesPedigreeFunction: 0.349,
    Age: 42,
    Outcome: 1
  },
  {
    Pregnancies: 5,
    Glucose: 117,
    BloodPressure: 86,
    SkinThickness: 30,
    Insulin: 105,
    BMI: 39.1,
    DiabetesPedigreeFunction: 0.251,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 111,
    BloodPressure: 94,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.8,
    DiabetesPedigreeFunction: 0.265,
    Age: 45,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 112,
    BloodPressure: 78,
    SkinThickness: 40,
    Insulin: 0,
    BMI: 39.4,
    DiabetesPedigreeFunction: 0.236,
    Age: 38,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 116,
    BloodPressure: 78,
    SkinThickness: 29,
    Insulin: 180,
    BMI: 36.1,
    DiabetesPedigreeFunction: 0.496,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 141,
    BloodPressure: 84,
    SkinThickness: 26,
    Insulin: 0,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.433,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 175,
    BloodPressure: 88,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 22.9,
    DiabetesPedigreeFunction: 0.326,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 92,
    BloodPressure: 52,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.141,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 130,
    BloodPressure: 78,
    SkinThickness: 23,
    Insulin: 79,
    BMI: 28.4,
    DiabetesPedigreeFunction: 0.323,
    Age: 34,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 120,
    BloodPressure: 86,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 28.4,
    DiabetesPedigreeFunction: 0.259,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 174,
    BloodPressure: 88,
    SkinThickness: 37,
    Insulin: 120,
    BMI: 44.5,
    DiabetesPedigreeFunction: 0.646,
    Age: 24,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 106,
    BloodPressure: 56,
    SkinThickness: 27,
    Insulin: 165,
    BMI: 29,
    DiabetesPedigreeFunction: 0.426,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 105,
    BloodPressure: 75,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 23.3,
    DiabetesPedigreeFunction: 0.56,
    Age: 53,
    Outcome: 0
  },
  {
    Pregnancies: 4,
    Glucose: 95,
    BloodPressure: 60,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 35.4,
    DiabetesPedigreeFunction: 0.284,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 126,
    BloodPressure: 86,
    SkinThickness: 27,
    Insulin: 120,
    BMI: 27.4,
    DiabetesPedigreeFunction: 0.515,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 8,
    Glucose: 65,
    BloodPressure: 72,
    SkinThickness: 23,
    Insulin: 0,
    BMI: 32,
    DiabetesPedigreeFunction: 0.6,
    Age: 42,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 99,
    BloodPressure: 60,
    SkinThickness: 17,
    Insulin: 160,
    BMI: 36.6,
    DiabetesPedigreeFunction: 0.453,
    Age: 21,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 102,
    BloodPressure: 74,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 39.5,
    DiabetesPedigreeFunction: 0.293,
    Age: 42,
    Outcome: 1
  },
  {
    Pregnancies: 11,
    Glucose: 120,
    BloodPressure: 80,
    SkinThickness: 37,
    Insulin: 150,
    BMI: 42.3,
    DiabetesPedigreeFunction: 0.785,
    Age: 48,
    Outcome: 1
  },
  {
    Pregnancies: 3,
    Glucose: 102,
    BloodPressure: 44,
    SkinThickness: 20,
    Insulin: 94,
    BMI: 30.8,
    DiabetesPedigreeFunction: 0.4,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 109,
    BloodPressure: 58,
    SkinThickness: 18,
    Insulin: 116,
    BMI: 28.5,
    DiabetesPedigreeFunction: 0.219,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 140,
    BloodPressure: 94,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 32.7,
    DiabetesPedigreeFunction: 0.734,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 13,
    Glucose: 153,
    BloodPressure: 88,
    SkinThickness: 37,
    Insulin: 140,
    BMI: 40.6,
    DiabetesPedigreeFunction: 1.174,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 12,
    Glucose: 100,
    BloodPressure: 84,
    SkinThickness: 33,
    Insulin: 105,
    BMI: 30,
    DiabetesPedigreeFunction: 0.488,
    Age: 46,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 147,
    BloodPressure: 94,
    SkinThickness: 41,
    Insulin: 0,
    BMI: 49.3,
    DiabetesPedigreeFunction: 0.358,
    Age: 27,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 81,
    BloodPressure: 74,
    SkinThickness: 41,
    Insulin: 57,
    BMI: 46.3,
    DiabetesPedigreeFunction: 1.096,
    Age: 32,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 187,
    BloodPressure: 70,
    SkinThickness: 22,
    Insulin: 200,
    BMI: 36.4,
    DiabetesPedigreeFunction: 0.408,
    Age: 36,
    Outcome: 1
  },
  {
    Pregnancies: 6,
    Glucose: 162,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 24.3,
    DiabetesPedigreeFunction: 0.178,
    Age: 50,
    Outcome: 1
  },
  {
    Pregnancies: 4,
    Glucose: 136,
    BloodPressure: 70,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 31.2,
    DiabetesPedigreeFunction: 1.182,
    Age: 22,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 121,
    BloodPressure: 78,
    SkinThickness: 39,
    Insulin: 74,
    BMI: 39,
    DiabetesPedigreeFunction: 0.261,
    Age: 28,
    Outcome: 0
  },
  {
    Pregnancies: 3,
    Glucose: 108,
    BloodPressure: 62,
    SkinThickness: 24,
    Insulin: 0,
    BMI: 26,
    DiabetesPedigreeFunction: 0.223,
    Age: 25,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 181,
    BloodPressure: 88,
    SkinThickness: 44,
    Insulin: 510,
    BMI: 43.3,
    DiabetesPedigreeFunction: 0.222,
    Age: 26,
    Outcome: 1
  },
  {
    Pregnancies: 8,
    Glucose: 154,
    BloodPressure: 78,
    SkinThickness: 32,
    Insulin: 0,
    BMI: 32.4,
    DiabetesPedigreeFunction: 0.443,
    Age: 45,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 128,
    BloodPressure: 88,
    SkinThickness: 39,
    Insulin: 110,
    BMI: 36.5,
    DiabetesPedigreeFunction: 1.057,
    Age: 37,
    Outcome: 1
  },
  {
    Pregnancies: 7,
    Glucose: 137,
    BloodPressure: 90,
    SkinThickness: 41,
    Insulin: 0,
    BMI: 32,
    DiabetesPedigreeFunction: 0.391,
    Age: 39,
    Outcome: 0
  },
  {
    Pregnancies: 0,
    Glucose: 123,
    BloodPressure: 72,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 36.3,
    DiabetesPedigreeFunction: 0.258,
    Age: 52,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 106,
    BloodPressure: 76,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 37.5,
    DiabetesPedigreeFunction: 0.197,
    Age: 26,
    Outcome: 0
  },
  {
    Pregnancies: 6,
    Glucose: 190,
    BloodPressure: 92,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 35.5,
    DiabetesPedigreeFunction: 0.278,
    Age: 66,
    Outcome: 1
  },
  {
    Pregnancies: 2,
    Glucose: 88,
    BloodPressure: 58,
    SkinThickness: 26,
    Insulin: 16,
    BMI: 28.4,
    DiabetesPedigreeFunction: 0.766,
    Age: 22,
    Outcome: 0
  },
  {
    Pregnancies: 9,
    Glucose: 170,
    BloodPressure: 74,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 44,
    DiabetesPedigreeFunction: 0.403,
    Age: 43,
    Outcome: 1
  },
  {
    Pregnancies: 9,
    Glucose: 89,
    BloodPressure: 62,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 22.5,
    DiabetesPedigreeFunction: 0.142,
    Age: 33,
    Outcome: 0
  },
  {
    Pregnancies: 10,
    Glucose: 101,
    BloodPressure: 76,
    SkinThickness: 48,
    Insulin: 180,
    BMI: 32.9,
    DiabetesPedigreeFunction: 0.171,
    Age: 63,
    Outcome: 0
  },
  {
    Pregnancies: 2,
    Glucose: 122,
    BloodPressure: 70,
    SkinThickness: 27,
    Insulin: 0,
    BMI: 36.8,
    DiabetesPedigreeFunction: 0.34,
    Age: 27,
    Outcome: 0
  },
  {
    Pregnancies: 5,
    Glucose: 121,
    BloodPressure: 72,
    SkinThickness: 23,
    Insulin: 112,
    BMI: 26.2,
    DiabetesPedigreeFunction: 0.245,
    Age: 30,
    Outcome: 0
  },
  {
    Pregnancies: 1,
    Glucose: 126,
    BloodPressure: 60,
    SkinThickness: 0,
    Insulin: 0,
    BMI: 30.1,
    DiabetesPedigreeFunction: 0.349,
    Age: 47,
    Outcome: 1
  },
  {
    Pregnancies: 1,
    Glucose: 93,
    BloodPressure: 70,
    SkinThickness: 31,
    Insulin: 0,
    BMI: 30.4,
    DiabetesPedigreeFunction: 0.315,
    Age: 23,
    Outcome: 0
  }
 ];

 // tslint:disable-next-line:align
 const testData = [
  {
      Pregnancies: 6,
      Glucose: 148,
      BloodPressure: 72,
      SkinThickness: 35,
      Insulin: 0,
      BMI: 33.6,
      DiabetesPedigreeFunction: 0.627,
      Age: 50,
      Outcome: 1
    },
    {
      Pregnancies: 1,
      Glucose: 85,
      BloodPressure: 66,
      SkinThickness: 29,
      Insulin: 0,
      BMI: 26.6,
      DiabetesPedigreeFunction: 0.351,
      Age: 31,
      Outcome: 0
    },
    {
      Pregnancies: 8,
      Glucose: 183,
      BloodPressure: 64,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 23.3,
      DiabetesPedigreeFunction: 0.672,
      Age: 32,
      Outcome: 1
    },
    {
      Pregnancies: 1,
      Glucose: 89,
      BloodPressure: 66,
      SkinThickness: 23,
      Insulin: 94,
      BMI: 28.1,
      DiabetesPedigreeFunction: 0.167,
      Age: 21,
      Outcome: 0
    },
    {
      Pregnancies: 0,
      Glucose: 137,
      BloodPressure: 40,
      SkinThickness: 35,
      Insulin: 168,
      BMI: 43.1,
      DiabetesPedigreeFunction: 2.288,
      Age: 33,
      Outcome: 1
    },
    {
      Pregnancies: 5,
      Glucose: 116,
      BloodPressure: 74,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 25.6,
      DiabetesPedigreeFunction: 0.201,
      Age: 30,
      Outcome: 0
    },
    {
      Pregnancies: 3,
      Glucose: 78,
      BloodPressure: 50,
      SkinThickness: 32,
      Insulin: 88,
      BMI: 31,
      DiabetesPedigreeFunction: 0.248,
      Age: 26,
      Outcome: 1
    },
    {
      Pregnancies: 10,
      Glucose: 115,
      BloodPressure: 0,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 35.3,
      DiabetesPedigreeFunction: 0.134,
      Age: 29,
      Outcome: 0
    },
    {
      Pregnancies: 2,
      Glucose: 197,
      BloodPressure: 70,
      SkinThickness: 45,
      Insulin: 543,
      BMI: 30.5,
      DiabetesPedigreeFunction: 0.158,
      Age: 53,
      Outcome: 1
    },
    {
      Pregnancies: 8,
      Glucose: 125,
      BloodPressure: 96,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 0,
      DiabetesPedigreeFunction: 0.232,
      Age: 54,
      Outcome: 1
    },
    {
      Pregnancies: 4,
      Glucose: 110,
      BloodPressure: 92,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 37.6,
      DiabetesPedigreeFunction: 0.191,
      Age: 30,
      Outcome: 0
    },
    {
      Pregnancies: 10,
      Glucose: 168,
      BloodPressure: 74,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 38,
      DiabetesPedigreeFunction: 0.537,
      Age: 34,
      Outcome: 1
    },
    {
      Pregnancies: 10,
      Glucose: 139,
      BloodPressure: 80,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 27.1,
      DiabetesPedigreeFunction: 1.441,
      Age: 57,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 189,
      BloodPressure: 60,
      SkinThickness: 23,
      Insulin: 846,
      BMI: 30.1,
      DiabetesPedigreeFunction: 0.398,
      Age: 59,
      Outcome: 1
    },
    {
      Pregnancies: 5,
      Glucose: 166,
      BloodPressure: 72,
      SkinThickness: 19,
      Insulin: 175,
      BMI: 25.8,
      DiabetesPedigreeFunction: 0.587,
      Age: 51,
      Outcome: 1
    },
    {
      Pregnancies: 7,
      Glucose: 100,
      BloodPressure: 0,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 30,
      DiabetesPedigreeFunction: 0.484,
      Age: 32,
      Outcome: 1
    },
    {
      Pregnancies: 0,
      Glucose: 118,
      BloodPressure: 84,
      SkinThickness: 47,
      Insulin: 230,
      BMI: 45.8,
      DiabetesPedigreeFunction: 0.551,
      Age: 31,
      Outcome: 1
    },
    {
      Pregnancies: 7,
      Glucose: 107,
      BloodPressure: 74,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 29.6,
      DiabetesPedigreeFunction: 0.254,
      Age: 31,
      Outcome: 1
    },
    {
      Pregnancies: 1,
      Glucose: 103,
      BloodPressure: 30,
      SkinThickness: 38,
      Insulin: 83,
      BMI: 43.3,
      DiabetesPedigreeFunction: 0.183,
      Age: 33,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 115,
      BloodPressure: 70,
      SkinThickness: 30,
      Insulin: 96,
      BMI: 34.6,
      DiabetesPedigreeFunction: 0.529,
      Age: 32,
      Outcome: 1
    },
    {
      Pregnancies: 3,
      Glucose: 126,
      BloodPressure: 88,
      SkinThickness: 41,
      Insulin: 235,
      BMI: 39.3,
      DiabetesPedigreeFunction: 0.704,
      Age: 27,
      Outcome: 0
    },
    {
      Pregnancies: 8,
      Glucose: 99,
      BloodPressure: 84,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 35.4,
      DiabetesPedigreeFunction: 0.388,
      Age: 50,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 196,
      BloodPressure: 90,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 39.8,
      DiabetesPedigreeFunction: 0.451,
      Age: 41,
      Outcome: 1
    },
    {
      Pregnancies: 9,
      Glucose: 119,
      BloodPressure: 80,
      SkinThickness: 35,
      Insulin: 0,
      BMI: 29,
      DiabetesPedigreeFunction: 0.263,
      Age: 29,
      Outcome: 1
    },
    {
      Pregnancies: 11,
      Glucose: 143,
      BloodPressure: 94,
      SkinThickness: 33,
      Insulin: 146,
      BMI: 36.6,
      DiabetesPedigreeFunction: 0.254,
      Age: 51,
      Outcome: 1
    },
    {
      Pregnancies: 10,
      Glucose: 125,
      BloodPressure: 70,
      SkinThickness: 26,
      Insulin: 115,
      BMI: 31.1,
      DiabetesPedigreeFunction: 0.205,
      Age: 41,
      Outcome: 1
    },
    {
      Pregnancies: 7,
      Glucose: 147,
      BloodPressure: 76,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 39.4,
      DiabetesPedigreeFunction: 0.257,
      Age: 43,
      Outcome: 1
    },
    {
      Pregnancies: 1,
      Glucose: 97,
      BloodPressure: 66,
      SkinThickness: 15,
      Insulin: 140,
      BMI: 23.2,
      DiabetesPedigreeFunction: 0.487,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 13,
      Glucose: 145,
      BloodPressure: 82,
      SkinThickness: 19,
      Insulin: 110,
      BMI: 22.2,
      DiabetesPedigreeFunction: 0.245,
      Age: 57,
      Outcome: 0
    },
    {
      Pregnancies: 5,
      Glucose: 117,
      BloodPressure: 92,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 34.1,
      DiabetesPedigreeFunction: 0.337,
      Age: 38,
      Outcome: 0
    },
    {
      Pregnancies: 5,
      Glucose: 109,
      BloodPressure: 75,
      SkinThickness: 26,
      Insulin: 0,
      BMI: 36,
      DiabetesPedigreeFunction: 0.546,
      Age: 60,
      Outcome: 0
    },
    {
      Pregnancies: 3,
      Glucose: 158,
      BloodPressure: 76,
      SkinThickness: 36,
      Insulin: 245,
      BMI: 31.6,
      DiabetesPedigreeFunction: 0.851,
      Age: 28,
      Outcome: 1
    },
    {
      Pregnancies: 3,
      Glucose: 88,
      BloodPressure: 58,
      SkinThickness: 11,
      Insulin: 54,
      BMI: 24.8,
      DiabetesPedigreeFunction: 0.267,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 6,
      Glucose: 92,
      BloodPressure: 92,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 19.9,
      DiabetesPedigreeFunction: 0.188,
      Age: 28,
      Outcome: 0
    },
    {
      Pregnancies: 10,
      Glucose: 122,
      BloodPressure: 78,
      SkinThickness: 31,
      Insulin: 0,
      BMI: 27.6,
      DiabetesPedigreeFunction: 0.512,
      Age: 45,
      Outcome: 0
    },
    {
      Pregnancies: 4,
      Glucose: 103,
      BloodPressure: 60,
      SkinThickness: 33,
      Insulin: 192,
      BMI: 24,
      DiabetesPedigreeFunction: 0.966,
      Age: 33,
      Outcome: 0
    },
    {
      Pregnancies: 11,
      Glucose: 138,
      BloodPressure: 76,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 33.2,
      DiabetesPedigreeFunction: 0.42,
      Age: 35,
      Outcome: 0
    },
    {
      Pregnancies: 9,
      Glucose: 102,
      BloodPressure: 76,
      SkinThickness: 37,
      Insulin: 0,
      BMI: 32.9,
      DiabetesPedigreeFunction: 0.665,
      Age: 46,
      Outcome: 1
    },
    {
      Pregnancies: 2,
      Glucose: 90,
      BloodPressure: 68,
      SkinThickness: 42,
      Insulin: 0,
      BMI: 38.2,
      DiabetesPedigreeFunction: 0.503,
      Age: 27,
      Outcome: 1
    },
    {
      Pregnancies: 4,
      Glucose: 111,
      BloodPressure: 72,
      SkinThickness: 47,
      Insulin: 207,
      BMI: 37.1,
      DiabetesPedigreeFunction: 1.39,
      Age: 56,
      Outcome: 1
    },
    {
      Pregnancies: 3,
      Glucose: 180,
      BloodPressure: 64,
      SkinThickness: 25,
      Insulin: 70,
      BMI: 34,
      DiabetesPedigreeFunction: 0.271,
      Age: 26,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 133,
      BloodPressure: 84,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 40.2,
      DiabetesPedigreeFunction: 0.696,
      Age: 37,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 106,
      BloodPressure: 92,
      SkinThickness: 18,
      Insulin: 0,
      BMI: 22.7,
      DiabetesPedigreeFunction: 0.235,
      Age: 48,
      Outcome: 0
    },
    {
      Pregnancies: 9,
      Glucose: 171,
      BloodPressure: 110,
      SkinThickness: 24,
      Insulin: 240,
      BMI: 45.4,
      DiabetesPedigreeFunction: 0.721,
      Age: 54,
      Outcome: 1
    },
    {
      Pregnancies: 7,
      Glucose: 159,
      BloodPressure: 64,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 27.4,
      DiabetesPedigreeFunction: 0.294,
      Age: 40,
      Outcome: 0
    },
    {
      Pregnancies: 0,
      Glucose: 180,
      BloodPressure: 66,
      SkinThickness: 39,
      Insulin: 0,
      BMI: 42,
      DiabetesPedigreeFunction: 1.893,
      Age: 25,
      Outcome: 1
    },
    {
      Pregnancies: 1,
      Glucose: 146,
      BloodPressure: 56,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 29.7,
      DiabetesPedigreeFunction: 0.564,
      Age: 29,
      Outcome: 0
    },
    {
      Pregnancies: 2,
      Glucose: 71,
      BloodPressure: 70,
      SkinThickness: 27,
      Insulin: 0,
      BMI: 28,
      DiabetesPedigreeFunction: 0.586,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 103,
      BloodPressure: 66,
      SkinThickness: 32,
      Insulin: 0,
      BMI: 39.1,
      DiabetesPedigreeFunction: 0.344,
      Age: 31,
      Outcome: 1
    },
    {
      Pregnancies: 7,
      Glucose: 105,
      BloodPressure: 0,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 0,
      DiabetesPedigreeFunction: 0.305,
      Age: 24,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 103,
      BloodPressure: 80,
      SkinThickness: 11,
      Insulin: 82,
      BMI: 19.4,
      DiabetesPedigreeFunction: 0.491,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 101,
      BloodPressure: 50,
      SkinThickness: 15,
      Insulin: 36,
      BMI: 24.2,
      DiabetesPedigreeFunction: 0.526,
      Age: 26,
      Outcome: 0
    },
    {
      Pregnancies: 5,
      Glucose: 88,
      BloodPressure: 66,
      SkinThickness: 21,
      Insulin: 23,
      BMI: 24.4,
      DiabetesPedigreeFunction: 0.342,
      Age: 30,
      Outcome: 0
    },
    {
      Pregnancies: 8,
      Glucose: 176,
      BloodPressure: 90,
      SkinThickness: 34,
      Insulin: 300,
      BMI: 33.7,
      DiabetesPedigreeFunction: 0.467,
      Age: 58,
      Outcome: 1
    },
    {
      Pregnancies: 7,
      Glucose: 150,
      BloodPressure: 66,
      SkinThickness: 42,
      Insulin: 342,
      BMI: 34.7,
      DiabetesPedigreeFunction: 0.718,
      Age: 42,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 73,
      BloodPressure: 50,
      SkinThickness: 10,
      Insulin: 0,
      BMI: 23,
      DiabetesPedigreeFunction: 0.248,
      Age: 21,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 187,
      BloodPressure: 68,
      SkinThickness: 39,
      Insulin: 304,
      BMI: 37.7,
      DiabetesPedigreeFunction: 0.254,
      Age: 41,
      Outcome: 1
    },
    {
      Pregnancies: 0,
      Glucose: 100,
      BloodPressure: 88,
      SkinThickness: 60,
      Insulin: 110,
      BMI: 46.8,
      DiabetesPedigreeFunction: 0.962,
      Age: 31,
      Outcome: 0
    },
    {
      Pregnancies: 0,
      Glucose: 146,
      BloodPressure: 82,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 40.5,
      DiabetesPedigreeFunction: 1.781,
      Age: 44,
      Outcome: 0
    },
    {
      Pregnancies: 0,
      Glucose: 105,
      BloodPressure: 64,
      SkinThickness: 41,
      Insulin: 142,
      BMI: 41.5,
      DiabetesPedigreeFunction: 0.173,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 2,
      Glucose: 84,
      BloodPressure: 0,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 0,
      DiabetesPedigreeFunction: 0.304,
      Age: 21,
      Outcome: 0
    },
    {
      Pregnancies: 8,
      Glucose: 133,
      BloodPressure: 72,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 32.9,
      DiabetesPedigreeFunction: 0.27,
      Age: 39,
      Outcome: 1
    },
    {
      Pregnancies: 5,
      Glucose: 44,
      BloodPressure: 62,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 25,
      DiabetesPedigreeFunction: 0.587,
      Age: 36,
      Outcome: 0
    },
    {
      Pregnancies: 2,
      Glucose: 141,
      BloodPressure: 58,
      SkinThickness: 34,
      Insulin: 128,
      BMI: 25.4,
      DiabetesPedigreeFunction: 0.699,
      Age: 24,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 114,
      BloodPressure: 66,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 32.8,
      DiabetesPedigreeFunction: 0.258,
      Age: 42,
      Outcome: 1
    },
    {
      Pregnancies: 5,
      Glucose: 99,
      BloodPressure: 74,
      SkinThickness: 27,
      Insulin: 0,
      BMI: 29,
      DiabetesPedigreeFunction: 0.203,
      Age: 32,
      Outcome: 0
    },
    {
      Pregnancies: 0,
      Glucose: 109,
      BloodPressure: 88,
      SkinThickness: 30,
      Insulin: 0,
      BMI: 32.5,
      DiabetesPedigreeFunction: 0.855,
      Age: 38,
      Outcome: 1
    },
    {
      Pregnancies: 2,
      Glucose: 109,
      BloodPressure: 92,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 42.7,
      DiabetesPedigreeFunction: 0.845,
      Age: 54,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 95,
      BloodPressure: 66,
      SkinThickness: 13,
      Insulin: 38,
      BMI: 19.6,
      DiabetesPedigreeFunction: 0.334,
      Age: 25,
      Outcome: 0
    },
    {
      Pregnancies: 4,
      Glucose: 146,
      BloodPressure: 85,
      SkinThickness: 27,
      Insulin: 100,
      BMI: 28.9,
      DiabetesPedigreeFunction: 0.189,
      Age: 27,
      Outcome: 0
    },
    {
      Pregnancies: 2,
      Glucose: 100,
      BloodPressure: 66,
      SkinThickness: 20,
      Insulin: 90,
      BMI: 32.9,
      DiabetesPedigreeFunction: 0.867,
      Age: 28,
      Outcome: 1
    },
    {
      Pregnancies: 5,
      Glucose: 139,
      BloodPressure: 64,
      SkinThickness: 35,
      Insulin: 140,
      BMI: 28.6,
      DiabetesPedigreeFunction: 0.411,
      Age: 26,
      Outcome: 0
    },
    {
      Pregnancies: 13,
      Glucose: 126,
      BloodPressure: 90,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 43.4,
      DiabetesPedigreeFunction: 0.583,
      Age: 42,
      Outcome: 1
    },
    {
      Pregnancies: 4,
      Glucose: 129,
      BloodPressure: 86,
      SkinThickness: 20,
      Insulin: 270,
      BMI: 35.1,
      DiabetesPedigreeFunction: 0.231,
      Age: 23,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 79,
      BloodPressure: 75,
      SkinThickness: 30,
      Insulin: 0,
      BMI: 32,
      DiabetesPedigreeFunction: 0.396,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 0,
      BloodPressure: 48,
      SkinThickness: 20,
      Insulin: 0,
      BMI: 24.7,
      DiabetesPedigreeFunction: 0.14,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 62,
      BloodPressure: 78,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 32.6,
      DiabetesPedigreeFunction: 0.391,
      Age: 41,
      Outcome: 0
    },
    {
      Pregnancies: 5,
      Glucose: 95,
      BloodPressure: 72,
      SkinThickness: 33,
      Insulin: 0,
      BMI: 37.7,
      DiabetesPedigreeFunction: 0.37,
      Age: 27,
      Outcome: 0
    },
    {
      Pregnancies: 0,
      Glucose: 131,
      BloodPressure: 0,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 43.2,
      DiabetesPedigreeFunction: 0.27,
      Age: 26,
      Outcome: 1
    },
    {
      Pregnancies: 2,
      Glucose: 112,
      BloodPressure: 66,
      SkinThickness: 22,
      Insulin: 0,
      BMI: 25,
      DiabetesPedigreeFunction: 0.307,
      Age: 24,
      Outcome: 0
    },
    {
      Pregnancies: 3,
      Glucose: 113,
      BloodPressure: 44,
      SkinThickness: 13,
      Insulin: 0,
      BMI: 22.4,
      DiabetesPedigreeFunction: 0.14,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 2,
      Glucose: 74,
      BloodPressure: 0,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 0,
      DiabetesPedigreeFunction: 0.102,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 7,
      Glucose: 83,
      BloodPressure: 78,
      SkinThickness: 26,
      Insulin: 71,
      BMI: 29.3,
      DiabetesPedigreeFunction: 0.767,
      Age: 36,
      Outcome: 0
    },
    {
      Pregnancies: 0,
      Glucose: 101,
      BloodPressure: 65,
      SkinThickness: 28,
      Insulin: 0,
      BMI: 24.6,
      DiabetesPedigreeFunction: 0.237,
      Age: 22,
      Outcome: 0
    },
    {
      Pregnancies: 5,
      Glucose: 137,
      BloodPressure: 108,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 48.8,
      DiabetesPedigreeFunction: 0.227,
      Age: 37,
      Outcome: 1
    },
    {
      Pregnancies: 2,
      Glucose: 110,
      BloodPressure: 74,
      SkinThickness: 29,
      Insulin: 125,
      BMI: 32.4,
      DiabetesPedigreeFunction: 0.698,
      Age: 27,
      Outcome: 0
    },
    {
      Pregnancies: 13,
      Glucose: 106,
      BloodPressure: 72,
      SkinThickness: 54,
      Insulin: 0,
      BMI: 36.6,
      DiabetesPedigreeFunction: 0.178,
      Age: 45,
      Outcome: 0
    },
    {
      Pregnancies: 2,
      Glucose: 100,
      BloodPressure: 68,
      SkinThickness: 25,
      Insulin: 71,
      BMI: 38.5,
      DiabetesPedigreeFunction: 0.324,
      Age: 26,
      Outcome: 0
    },
    {
      Pregnancies: 15,
      Glucose: 136,
      BloodPressure: 70,
      SkinThickness: 32,
      Insulin: 110,
      BMI: 37.1,
      DiabetesPedigreeFunction: 0.153,
      Age: 43,
      Outcome: 1
    },
    {
      Pregnancies: 1,
      Glucose: 107,
      BloodPressure: 68,
      SkinThickness: 19,
      Insulin: 0,
      BMI: 26.5,
      DiabetesPedigreeFunction: 0.165,
      Age: 24,
      Outcome: 0
    },
    {
      Pregnancies: 1,
      Glucose: 80,
      BloodPressure: 55,
      SkinThickness: 0,
      Insulin: 0,
      BMI: 19.1,
      DiabetesPedigreeFunction: 0.258,
      Age: 21,
      Outcome: 0
    },
    {
      Pregnancies: 4,
      Glucose: 123,
      BloodPressure: 80,
      SkinThickness: 15,
      Insulin: 176,
      BMI: 32,
      DiabetesPedigreeFunction: 0.443,
      Age: 34,
      Outcome: 0
    }
];
