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
  constructor() {
    this.age = '1-25';
    this.bmi = '0-25';
    this.dpf = 'no';
    this.diet = 'lowSugar';
   }

  ngOnInit() {
  }

  Assess() {
    console.log(this);
  }

  getMessage() {
    let message = '';
    const results = calculate();
    if (results[0] <= 15) {
      message = 'Your results show that you currently have a low risk of ' +
                'developing diabetes. However, it is important that you ' +
                'maintain a healthy lifestyle in terms of diet and exercise.';
    } else if (results[0] > 15 && results[0] <= 25) {
      message = 'Your results show that you currently have a medium risk of ' +
                'developing diabetes. For more information on your risk ' +
                'factors, and what to do about them, please visit our diabetes ' +
                'advice website at <a href="http://www.zha.org.zd">http://www.zha.org.zd</a>.';
    } else {
      message = 'Your results show that you currently have a HIGH risk of ' +
                'developing diabetes. ' + (results[1].length > 0 ? highRisk(results[1]) : '') +
                'We advise that you contact the Health Authority to discuss your risk factors ' +
                'as soon as you can. Please fill in our <a href="contactform.html">contact form</a> ' +
                'and a member of the Health Authority Diabetes Team will be in contact with you.';
    }
    return message;
  }
}
