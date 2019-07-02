import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-risk-form',
  templateUrl: './risk-form.page.html',
  styleUrls: ['./risk-form.page.scss'],
})
export class RiskFormPage implements OnInit {

  public age: string;
  public bmi: string;
  public dpf: string;
  public diet: string;
  public result: number[];
  constructor() {
    this.age = '0';
    this.bmi = '0';
    this.dpf = '0';
    this.diet = '0';
   }

  ngOnInit() {
  }

  sum(array) {
    let sum = 0;
    array.forEach(element => {
      sum += element;
    });
    return sum;
  }

  Assess() {
    const value = {};
    const result = [];
    value.age = parseInt(this.age, 10);
    value.bmi = parseInt(this.bmi, 10);
    value.family = parseInt(this.dpf, 10);
    value.diet = parseInt(this.diet, 10);

    for (const key in value) {
        if (value[key] >= 10) {
          result.push(key);
        }
    }
    console.log(result);
    return [this.sum(result), result];
  }

  highRisk(row) {
    let message = '';
    const cnt = row.length;
    if (cnt === 1) {
      message = '[Your main risk factor is your ' + row[0] + '.] ';
    } else if (cnt === 2) {
      message = '[Your main risk factors are your ' + row[0] +
        ' and your ' + row[1] + '.] ';
    } else if (cnt === 3) {
      message = '[Your main risk factors are: ' + row[0] +
        ', ' + row[1] + ' and ' + row[2] + '.] ';
    } else {
      message = '[Your main risk factors are: ' + row[0] +
        ', ' + row[1] + ', ' + row[2] + ' and ' + row[3] + '.] ';
    }
    return message;
  }

  getMessage() {
    let message = '';
    const results = this.Assess();
    if (results[0] <= 15) {
      message = 'Your results show that you currently have a low risk of ' +
                'developing diabetes. However, it is important that you ' +
                'maintain a healthy lifestyle in terms of diet and exercise.';
    } else if (results[0] > 15 && results[0] <= 25) {
      message = 'Your results show that you currently have a medium risk of ' +
                'developing diabetes. For more information on your risk ' +
                'factors, and what to do about them, please visit our diabetes ' +
                'advice website at <a href="https://www.diabetes.co.uk/diet/nhs-diet-advice.html">' +
                'https://www.diabetes.co.uk/diet/nhs-diet-advice.html</a>.';
    } else {
      message = 'Your results show that you currently have a HIGH risk of ' +
                'developing diabetes. ' + (results[1].length > 0 ? this.highRisk(results[1]) : '') +
                'We advise that you contact the NHS to discuss your risk factors ' +
                'as soon as you can. Please contact them on <a href="https://www.nhs.uk/conditions/Diabetes/">Diabetes</a> ' +
                'and a member of the NHS Diabetes Team will be in contact with you.';
    }
    console.log(message);
    return message;
  }
}
