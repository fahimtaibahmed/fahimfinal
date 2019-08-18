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
    const value = {age: 0, bmi: 0, family: 0, diet: 0};
    const result: string[] = [];
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
    return [this.sum(result), result, result.length];
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
      message = 'Keep it up! Your chances of contracting Type 2 diabetes are slim' +
                ' However, you should still maintain a healthy lifestyle by eating and exercising regularly' +
                ' You can find more information on how to be healthy and eating the correct foods online' +
                ' at https://www.nhs.uk/conditions/type-2-diabetes/food-and-keeping-active/ which will decrease the chances of diabetes in the future';
    } else if (results[0] > 15 && results[0] <= 25) {
      message = ' You may have a possible risk of getting pre-diabetes, therefore it is best to change your lifestyle ' +
                ' If you are overweight, your prediabetes will most likely turn into diabetes & dropping even as little as 5 - 10% of body weight makes a vast difference' +
                ' Achieve this by consuming low-fat proteins and vegetables, and limiting calories, sugars and starchy carbs ' +
                ' Quitting smoking, drinking alcohol only moderately (if you drink already), and reducing stress will help keep your blood glucose levels under control. ' +
                ' Speak to your GP about joining a Type 2 diabetes prevention program';
    } else {
      message = ' You should contact your GP, Your results show that you have a significant risk of potentially' +
                ' developing diabetes in the future. ' + (results[2] > 0 ? this.highRisk(results[1]) : '') +
                ' We advise that you contact the NHS to discuss your risk factors ' +
                ' as soon as you can. Also Improve your lifestyle by incorporating at least 30 minutes of exercise into your daily regime' +
                ' If you’re stressed at work or school, deep breathing yoga and Pilates to help relax your mind' +
                ' If you smoke, STOP! This will only increase your risk - talk with your doctor about ways to quit' +
                ' Your doctor can also help you with diet, and joining a Type 2 diabetes prevention program';
    }
    alert(message);
    return message;
  }
}
