(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["prediction-form-prediction-form-module"],{

/***/ "./src/app/prediction-form/prediction-form.module.ts":
/*!***********************************************************!*\
  !*** ./src/app/prediction-form/prediction-form.module.ts ***!
  \***********************************************************/
/*! exports provided: PredictionFormPageModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PredictionFormPageModule", function() { return PredictionFormPageModule; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_common__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @angular/common */ "./node_modules/@angular/common/fesm5/common.js");
/* harmony import */ var _angular_forms__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
/* harmony import */ var _angular_router__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
/* harmony import */ var _ionic_angular__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @ionic/angular */ "./node_modules/@ionic/angular/dist/fesm5.js");
/* harmony import */ var _prediction_form_page__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./prediction-form.page */ "./src/app/prediction-form/prediction-form.page.ts");







var routes = [
    {
        path: '',
        component: _prediction_form_page__WEBPACK_IMPORTED_MODULE_6__["PredictionFormPage"]
    }
];
var PredictionFormPageModule = /** @class */ (function () {
    function PredictionFormPageModule() {
    }
    PredictionFormPageModule = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            imports: [
                _angular_common__WEBPACK_IMPORTED_MODULE_2__["CommonModule"],
                _angular_forms__WEBPACK_IMPORTED_MODULE_3__["FormsModule"],
                _ionic_angular__WEBPACK_IMPORTED_MODULE_5__["IonicModule"],
                _angular_router__WEBPACK_IMPORTED_MODULE_4__["RouterModule"].forChild(routes)
            ],
            declarations: [_prediction_form_page__WEBPACK_IMPORTED_MODULE_6__["PredictionFormPage"]]
        })
    ], PredictionFormPageModule);
    return PredictionFormPageModule;
}());



/***/ }),

/***/ "./src/app/prediction-form/prediction-form.page.html":
/*!***********************************************************!*\
  !*** ./src/app/prediction-form/prediction-form.page.html ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<ion-header>\n  <ion-toolbar>\n    <ion-title>predictionForm</ion-title>\n  </ion-toolbar>\n</ion-header>\n\n<ion-content padding>\n<form #predictionForm=\"ngForm\" (ngSubmit)=\"predict(ngForm)\">\n    <ion-item-divider>  \n      <ion-input  name=\"Preg\" id=\"Preg\" type=\"number\" placeholder=\"Number of Pregnancies 0-17\" [(ngModel)]=\"PregValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #PregControl=\"ngModel\"></ion-input>\n    </ion-item-divider>\n  <!-- <div>touched: {{PregControl.touched}}</div>\n  <div>untouched: {{PregControl.untouched}}</div> -->\n  <ion-item-divider>\n    <ion-input  name=\"Glu\" id=\"Glu\" type=\"number\" placeholder=\"Glucose Value 0-199\" [(ngModel)]=\"GluValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #GluControl=\"ngModel\"></ion-input>\n  </ion-item-divider>\n  <ion-item-divider>\n     <ion-input  name=\"BP\" id=\"BP\" type=\"number\" placeholder=\"BloodPressure 0-122\" [(ngModel)]=\"BPValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #BPControl=\"ngModel\"></ion-input>\n  </ion-item-divider>\n  <ion-item-divider>\n    <ion-input  name=\"ST\" id=\"ST\" type=\"number\" placeholder=\"Skin Thickness 0-99\" [(ngModel)]=\"STValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #STControl=\"ngModel\"></ion-input>\n  </ion-item-divider>\n  <ion-item-divider>\n      <ion-input  name=\"Ins\" id=\"Ins\" type=\"number\" placeholder=\"Insulin 0-846\" [(ngModel)]=\"InsValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #InsControl=\"ngModel\"></ion-input>\n  </ion-item-divider>\n  <ion-item-divider>  \n    <ion-input  name=\"BMI\" id=\"BMI\" type=\"number\" placeholder=\"BMI 0-67.1\" [(ngModel)]=\"BMIValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #BMIControl=\"ngModel\"></ion-input>\n  </ion-item-divider>\n  <ion-item-divider>  \n    <ion-input  name=\"DPF\" id=\"DPF\" type=\"number\" placeholder=\"Diabetes Pedigree Function 0.08 - 2.42\" [(ngModel)]=\"DPFValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #DPFControl=\"ngModel\"></ion-input>\n  </ion-item-divider>\n  <ion-item-divider>\n      <ion-input  name=\"Age\" id=\"Age\" type=\"number\" placeholder=\"Age 21 - 81\" [(ngModel)]=\"AgeValue\" [ngModelOptions]=\"{standalone: true}\" class=\"form-control\" #AgeControl=\"ngModel\"></ion-input>\n  </ion-item-divider>\n    <ion-button fill=\"solid\" expand=\"block\" (click)=\"predict()\" color=\"dark\" style=\"margin-top:30px;\">Full Button</ion-button>\n</form>\n</ion-content>\n\n\n"

/***/ }),

/***/ "./src/app/prediction-form/prediction-form.page.scss":
/*!***********************************************************!*\
  !*** ./src/app/prediction-form/prediction-form.page.scss ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "ion-input, ion-item-divider {\n  background-color: #1ad7f0;\n  margin: 3px 0; }\n\nion-item-divider {\n  border-radius: 15px; }\n\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9hcHAvcHJlZGljdGlvbi1mb3JtL0Q6XFxEZXZlbG9wbWVudFxcZmFoaW1EaWFiZXRlc0FwcC9zcmNcXGFwcFxccHJlZGljdGlvbi1mb3JtXFxwcmVkaWN0aW9uLWZvcm0ucGFnZS5zY3NzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0VBQ0kseUJBQXNDO0VBQ3RDLGFBQVksRUFBQTs7QUFFaEI7RUFDSSxtQkFBa0IsRUFBQSIsImZpbGUiOiJzcmMvYXBwL3ByZWRpY3Rpb24tZm9ybS9wcmVkaWN0aW9uLWZvcm0ucGFnZS5zY3NzIiwic291cmNlc0NvbnRlbnQiOlsiaW9uLWlucHV0LCBpb24taXRlbS1kaXZpZGVye1xyXG4gICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgkY29sb3I6ICMxYWQ3ZjAsICRhbHBoYTogMS4wKTtcclxuICAgIG1hcmdpbjozcHggMDsgIFxyXG59XHJcbmlvbi1pdGVtLWRpdmlkZXJ7XHJcbiAgICBib3JkZXItcmFkaXVzOjE1cHg7XHJcbn0iXX0= */"

/***/ }),

/***/ "./src/app/prediction-form/prediction-form.page.ts":
/*!*********************************************************!*\
  !*** ./src/app/prediction-form/prediction-form.page.ts ***!
  \*********************************************************/
/*! exports provided: PredictionFormPage */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PredictionFormPage", function() { return PredictionFormPage; });
/* harmony import */ var tslib__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! tslib */ "./node_modules/tslib/tslib.es6.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");


var PredictionFormPage = /** @class */ (function () {
    function PredictionFormPage() {
        this.check = true;
    }
    PredictionFormPage.prototype.ngOnInit = function () {
    };
    PredictionFormPage.prototype.predict = function () {
        return tslib__WEBPACK_IMPORTED_MODULE_0__["__awaiter"](this, void 0, void 0, function () {
            var url, params;
            return tslib__WEBPACK_IMPORTED_MODULE_0__["__generator"](this, function (_a) {
                url = './prediction';
                try {
                    params = "?age=" + this.AgeValue + "&bmi=" + this.BMIValue + "&st=" + this.STValue + "&ins=" + this.STValue + "\n                  &dpf=" + this.DPFValue + "&glu=" + this.GluValue + "&preg=" + this.PregValue;
                    url = url + params;
                }
                catch (err) {
                    console.dir(err);
                }
                console.log(this);
                if (this.check) {
                    try {
                        window.open(url, '_self', null, true);
                    }
                    catch (err) {
                        console.dir(err);
                    }
                }
                return [2 /*return*/];
            });
        });
    };
    PredictionFormPage = tslib__WEBPACK_IMPORTED_MODULE_0__["__decorate"]([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["Component"])({
            selector: 'app-prediction-form',
            template: __webpack_require__(/*! ./prediction-form.page.html */ "./src/app/prediction-form/prediction-form.page.html"),
            styles: [__webpack_require__(/*! ./prediction-form.page.scss */ "./src/app/prediction-form/prediction-form.page.scss")]
        }),
        tslib__WEBPACK_IMPORTED_MODULE_0__["__metadata"]("design:paramtypes", [])
    ], PredictionFormPage);
    return PredictionFormPage;
}());



/***/ })

}]);
//# sourceMappingURL=prediction-form-prediction-form-module.js.map