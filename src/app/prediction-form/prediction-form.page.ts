import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-prediction-form',
  templateUrl: './prediction-form.page.html',
  styleUrls: ['./prediction-form.page.scss']
})
export class PredictionFormPage implements OnInit {
  check = true;
  AgeValue: any;
  BMIValue: any;
  STValue: any;
  PregValue: any;
  GluValue: any;
  DPFValue: any;
  InsValue: any;
  BPValue: any;

  constructor() { }

  ngOnInit() {
  }

 async predict() {
    let url = './prediction';
    try {
      const params = `?age=${this.AgeValue}&bmi=${this.BMIValue}&st=${this.STValue}&ins=${this.InsValue}&dpf=${this.DPFValue}&glu=${this.GluValue}&preg=${this.PregValue}&bp=${this.BPValue}`;
      url = url + params;
    } catch (err) {
      console.dir(err);
    }
    console.log(this);

    if (this.check) {
      try {
        window.open(url, '_self', null, true);
      } catch (err) {
        console.dir(err);
      }
    }
  }
}
