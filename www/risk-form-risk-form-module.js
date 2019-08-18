(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["risk-form-risk-form-module"],{

/***/ "./src/app/risk-form/risk-form.module.ts":
/*!***********************************************!*\
  !*** ./src/app/risk-form/risk-form.module.ts ***!
  \***********************************************/
/*! exports provided: RiskFormPageModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RiskFormPageModule", function() { return RiskFormPageModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _risk_form_page__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./risk-form.page */ "./src/app/risk-form/risk-form.page.ts");







var routes = [
    {
        path: '',
        component: _risk_form_page__WEBPACK_IMPORTED_MODULE_6__["RiskFormPage"]
    }
];
var RiskFormPageModule = /** @class */ (function () {
    function RiskFormPageModule() {
    }
    RiskFormPageModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                _ionic_angular__WEBPACK_IMPORTED_MODULE_5__["IonicModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterModule"].forChild(routes)
            ],
            declarations: [_risk_form_page__WEBPACK_IMPORTED_MODULE_6__["RiskFormPage"]]
        })
    ], RiskFormPageModule);
    return RiskFormPageModule;
}());



/***/ }),

/***/ "./src/app/risk-form/risk-form.page.html":
/*!***********************************************!*\
  !*** ./src/app/risk-form/risk-form.page.html ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-header>\n  <ion-toolbar>\n    <ion-title>Diabetes Assessment</ion-title>\n  </ion-toolbar>\n</ion-header>\n<ion-content>\n  <form>\n    <ion-list age=\"age\">\n      <ion-radio-group [(ngModel)]=\"age\" [ngModelOptions]=\"{standalone: true}\">\n        <ion-list-header color=\"dark\">\n          How old are you?\n        </ion-list-header>\n        <ion-row>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>1-25</ion-label>\n              <ion-radio name=\"age\" value=\"0\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>26-40</ion-label>\n              <ion-radio name=\"age\" value=\"5\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>41-60</ion-label>\n              <ion-radio  name=\"age\" value=\"8\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>60+</ion-label>\n              <ion-radio  name=\"age\" value=\"10\"></ion-radio>\n            </ion-col>\n          </ion-item>\n        </ion-row>\n      </ion-radio-group>\n    </ion-list>\n    <ion-list bmi=\"bmi\">\n      <ion-radio-group [(ngModel)]=\"bmi\" [ngModelOptions]=\"{standalone: true}\">\n        <ion-list-header color=\"dark\">\n          What is your BMI?\n        </ion-list-header>\n        <ion-row>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>0-25</ion-label>\n              <ion-radio name=\"bmi\" value=\"0\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>26-30</ion-label>\n              <ion-radio name=\"bmi\" value=\"1\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>31-35</ion-label>\n              <ion-radio name=\"bmi\" value=\"9\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>35+</ion-label>\n              <ion-radio name=\"bmi\" value=\"10\"></ion-radio>\n            </ion-col>\n          </ion-item>\n        </ion-row>\n      </ion-radio-group>\n    </ion-list>\n    <ion-list dpf=\"dpf\">\n      <ion-radio-group [(ngModel)]=\"dpf\" [ngModelOptions]=\"{standalone: true}\">\n        <ion-list-header color=\"dark\">\n          Does anybody in your family have diabetes?\n        </ion-list-header>\n        <ion-row>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>No</ion-label>\n              <ion-radio name=\"dpf\" value=\"0\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>Grandparent</ion-label>\n              <ion-radio name=\"dpf\" value=\"7\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>Sibling</ion-label>\n              <ion-radio name=\"dpf\" value=\"15\"></ion-radio>\n            </ion-col>\n          </ion-item>\n          <ion-item>\n            <ion-col col-md-3>\n              <ion-label>Parent</ion-label>\n              <ion-radio name=\"dpf\" value=\"16\"></ion-radio>\n            </ion-col>\n          </ion-item>\n        </ion-row>\n      </ion-radio-group>\n    </ion-list>\n    <ion-list diet=\"diet\">\n      <ion-radio-group [(ngModel)]=\"diet\" [ngModelOptions]=\"{standalone: true}\">\n          <ion-list-header color=\"dark\">\n            How would you describe your diet?\n          </ion-list-header>\n            <ion-row>\n              <ion-item>\n                <ion-col col-md-3>\n                  <ion-label>Low sugar</ion-label>\n                  <ion-radio name=\"diet\" value=\"0\"></ion-radio>\n                </ion-col>\n              </ion-item>\n              <ion-item>\n                <ion-col col-md-3>\n                  <ion-label>Normal Sugar</ion-label>\n                  <ion-radio name=\"diet\" value=\"1\"></ion-radio>\n                </ion-col>\n              </ion-item>\n              <ion-item>\n                <ion-col col-md-3>\n                  <ion-label>Quite high sugar</ion-label>\n                  <ion-radio name=\"diet\" value=\"7\"></ion-radio>\n                </ion-col>\n              </ion-item>\n              <ion-item>\n                <ion-col col-md-3>\n                  <ion-label>High Sugar</ion-label>\n                  <ion-radio name=\"diet\" value=\"10\"></ion-radio>\n                </ion-col>\n              </ion-item>\n            </ion-row>\n      </ion-radio-group>\n    </ion-list>\n    <ion-button fill=\"outline\" expand=\"block\" (click)=\"getMessage()\" color=\"green\" style=\"margin-top:30px;\">Assess</ion-button>\n  </form>\n</ion-content>\n"

/***/ }),

/***/ "./src/app/risk-form/risk-form.page.scss":
/*!***********************************************!*\
  !*** ./src/app/risk-form/risk-form.page.scss ***!
  \***********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ion-list-header {\n  background-color: navy; }\n\nion-button {\n  background-color: #0ed42f; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcmlzay1mb3JtL0M6XFxVc2Vyc1xcT2tveWVcXERvd25sb2Fkc1xcRmFoaW0gQWhtZWQgZGlhYmV0ZXMgcHJvamVjdFxcRmFoaW0gQWhtZWQgZGlhYmV0ZXMgcHJvamVjdFxcZmFoaW1maW5hbC9zcmNcXGFwcFxccmlzay1mb3JtXFxyaXNrLWZvcm0ucGFnZS5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBO0VBQ0ksc0JBQXNCLEVBQUE7O0FBRTFCO0VBQ0kseUJBQXlCLEVBQUEiLCJmaWxlIjoic3JjL2FwcC9yaXNrLWZvcm0vcmlzay1mb3JtLnBhZ2Uuc2NzcyIsInNvdXJjZXNDb250ZW50IjpbIlxuaW9uLWxpc3QtaGVhZGVye1xuICAgIGJhY2tncm91bmQtY29sb3I6IG5hdnk7XG59XG5pb24tYnV0dG9ue1xuICAgIGJhY2tncm91bmQtY29sb3I6ICMwZWQ0MmY7XG59Il19 */"

/***/ }),

/***/ "./src/app/risk-form/risk-form.page.ts":
/*!*********************************************!*\
  !*** ./src/app/risk-form/risk-form.page.ts ***!
  \*********************************************/
/*! exports provided: RiskFormPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "RiskFormPage", function() { return RiskFormPage; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var RiskFormPage = /** @class */ (function () {
    function RiskFormPage() {
        this.age = '0';
        this.bmi = '0';
        this.dpf = '0';
        this.diet = '0';
    }
    RiskFormPage.prototype.ngOnInit = function () {
    };
    RiskFormPage.prototype.sum = function (array) {
        var sum = 0;
        array.forEach(function (element) {
            sum += element;
        });
        return sum;
    };
    RiskFormPage.prototype.Assess = function () {
        var value = { age: 0, bmi: 0, family: 0, diet: 0 };
        var result = [];
        value.age = parseInt(this.age, 10);
        value.bmi = parseInt(this.bmi, 10);
        value.family = parseInt(this.dpf, 10);
        value.diet = parseInt(this.diet, 10);
        for (var key in value) {
            if (value[key] >= 10) {
                result.push(key);
            }
        }
        console.log(result);
        return [this.sum(result), result, result.length];
    };
    RiskFormPage.prototype.highRisk = function (row) {
        var message = '';
        var cnt = row.length;
        if (cnt === 1) {
            message = '[Your main risk factor is your ' + row[0] + '.] ';
        }
        else if (cnt === 2) {
            message = '[Your main risk factors are your ' + row[0] +
                ' and your ' + row[1] + '.] ';
        }
        else if (cnt === 3) {
            message = '[Your main risk factors are: ' + row[0] +
                ', ' + row[1] + ' and ' + row[2] + '.] ';
        }
        else {
            message = '[Your main risk factors are: ' + row[0] +
                ', ' + row[1] + ', ' + row[2] + ' and ' + row[3] + '.] ';
        }
        return message;
    };
    RiskFormPage.prototype.getMessage = function () {
        var message = '';
        var results = this.Assess();
        if (results[0] <= 15) {
            message = 'Keep it up! Your chances of contracting Type 2 diabetes are slim' +
                ' However, you should still maintain a healthy lifestyle by eating and exercising regularly' +
                ' You can find more information on how to be healthy and eating the correct foods online' +
                ' at https://www.nhs.uk/conditions/type-2-diabetes/food-and-keeping-active/ which will decrease the chances of diabetes in the future';
        }
        else if (results[0] > 15 && results[0] <= 25) {
            message = ' You may have a possible risk of getting pre-diabetes, therefore it is best to change your lifestyle ' +
                ' If you are overweight, your prediabetes will most likely turn into diabetes & dropping even as little as 5 - 10% of body weight makes a vast difference' +
                ' Achieve this by consuming low-fat proteins and vegetables, and limiting calories, sugars and starchy carbs ' +
                ' Quitting smoking, drinking alcohol only moderately (if you drink already), and reducing stress will help keep your blood glucose levels under control. ' +
                ' Speak to your GP about joining a Type 2 diabetes prevention program';
        }
        else {
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
    };
    RiskFormPage = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-risk-form',
            template: __webpack_require__(/*! ./risk-form.page.html */ "./src/app/risk-form/risk-form.page.html"),
            styles: [__webpack_require__(/*! ./risk-form.page.scss */ "./src/app/risk-form/risk-form.page.scss")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], RiskFormPage);
    return RiskFormPage;
}());



/***/ })

}]);
//# sourceMappingURL=risk-form-risk-form-module.js.map