import { Component, Input, OnInit, Output, Inject, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { CommonUtilService } from '@app/services/common-util.service';
import { SharedPreferences } from 'sunbird-sdk';
import { Observable } from 'rxjs';

enum InputType {
  INPUT = 'input',
  CHECKBOX = 'checkbox',
  SELECT = 'select',
  LABEL = 'label',
  NESTED_SELECT = 'nested_select'
}

enum ValidationType {
  REQUIRED = 'required',
  PATTERN = 'pattern',
  MINLENGTH = 'minLength',
  MAXLENGTH = 'maxLength'
}

@Component({
  selector: 'app-common-forms',
  templateUrl: './common-forms.component.html',
  styleUrls: ['./common-forms.component.scss'],
})
export class CommonFormsComponent implements OnInit {

// template
// value
// value changes
// submit
// reset

  @Input() formList: any = [];
  @Output() onFormDataChange = new EventEmitter();
  @Output() onCommonFormInitialized = new EventEmitter()

  commonFormGroup: FormGroup;
  formInputTypes = InputType;
  formValidationTypes = ValidationType;
  appName = '';

  isArray(input: any) {
    return Array.isArray(input);
  }

  isObject(input: any) {
    return !Array.isArray(input) && typeof input === 'object';
  }

  constructor(
    @Inject('SHARED_PREFERENCES') private sharedPreferences: SharedPreferences,
    private formBuilder: FormBuilder,
    private commonUtilService: CommonUtilService,
  ) { }

  ngOnInit(): void {
    this.initilizeForm();
    this.sharedPreferences.getString('app_name').toPromise().then(value => {
      this.appName = value;
    });
  }

  initilizeForm() {
    if (!this.formList.length) {
      console.error('FORM LIST IS EMPTY');
      return;
    }
    const formGroupData = {};
    this.formList.forEach((element: any, index) => {
      if (element.type !== this.formInputTypes.LABEL) {
        const formValueList = this.prepareFormValidationData(element, index);
        formGroupData[element.code] = formValueList;
      }
    });

    this.commonFormGroup = this.formBuilder.group(formGroupData);
    setTimeout(() => {
      this.onCommonFormInitialized.emit(true);
    }, 100);
  }

  /**
   * @return [''/0/[]/false, Validator.required]
   */
  private prepareFormValidationData(element, index) {
    const formValueList = [];
    const validationList = [];

    let defaultVal: any = '';
    switch (element.type) {
      case this.formInputTypes.INPUT:
        defaultVal = element.templateOptions.type === 'number' ?
          (element.defaultVal && Number.isInteger(element.defaultVal) ? element.defaultVal : 0) : '';
        break;
      case this.formInputTypes.SELECT:
        defaultVal = element.templateOptions.multiple ? 
        (element.defaultVal && Array.isArray(element.defaultVal) ? element.defaultVal : []) : '';
        break;
      case this.formInputTypes.CHECKBOX:
        defaultVal = false || !!element.defaultVal;
        break;
    }

    formValueList.push(defaultVal);

    if (element.validations && element.validations.length) {
      element.validations.forEach((data, i) => {
        switch (data.type) {
          case this.formValidationTypes.REQUIRED:
            validationList.push(element.type === this.formInputTypes.CHECKBOX ? Validators.requiredTrue : Validators.required);
            if (this.formList[index].templateOptions && this.formList[index].templateOptions.label) {
              this.formList[index].templateOptions.label =
                this.commonUtilService.translateMessage(this.formList[index].templateOptions.label) + ' *';
            }
            break;
          case this.formValidationTypes.PATTERN:
            validationList.push(Validators.pattern(element.validations[i].value));
            break;
          case this.formValidationTypes.MINLENGTH:
            validationList.push(Validators.minLength(element.validations[i].value));
            break;
          case this.formValidationTypes.MAXLENGTH:
            validationList.push(Validators.maxLength(element.validations[i].value));
            break;
        }
      });
    }

    formValueList.push(Validators.compose(validationList));

    return formValueList;
  }

  fetchInterfaceOption(fieldName) {
    if (!fieldName) {
      return {
        header: 'sample_text undefined',
        cssClass: 'select-box',
        animated: false
      };
    }
    return {
      header: this.commonUtilService.translateMessage(fieldName).toLocaleUpperCase(),
      cssClass: 'select-box',
      animated: false
    };
  }

  onInputChange(event) {
    setTimeout(() => {
      this.onFormDataChange.emit(this.commonFormGroup);
    }, 0);
  }

  initilizeInputData(data) {
    this.commonFormGroup.patchValue({[data.code]: data.value});
  }

  initilizeFormData(data) {
    for (let index = 0; index < this.formList.length; index++) {
      const formDetails = this.formList[index];
      if (formDetails.code === data.code && formDetails.templateOptions && formDetails.templateOptions.link &&
        formDetails.templateOptions.link.label) {
        this.setFormData(index, data.path, data.value);
      }

      if (formDetails.code === data.code && formDetails.templateOptions && formDetails.templateOptions.options) {
        this.setFormData(index, data.path, data.value);
      }
    }
  }

  setFormData(index, path, value) {
    path.reduce((a, b, level) => {
        if (typeof a[b] === 'undefined' && level !== path.length - 1) {
            a[b] = {};
            return a[b];
        }
        if (level === path.length - 1) {
            a[b] = value;
            return value;
        }
        return a[b];
    }, this.formList[index]);
    console.log(this.formList[index]);
}

  showInAppBrowser(url) {
    this.commonUtilService.openLink(url);
  }

  handleClick(event: MouseEvent) {
    if (event.target && event.target['hasAttribute'] && (event.target as HTMLAnchorElement).hasAttribute('href')) {
      this.commonUtilService.openLink((event.target as HTMLAnchorElement).getAttribute('href'));
    }
  }

  checkDisableCondition(formElement) {
    if (formElement.templateOptions && formElement.templateOptions.prefill && formElement.templateOptions.prefill.length) {
      for (let index = 0; index < formElement.templateOptions.prefill.length; index++) {
        if (!(this.commonFormGroup.value[formElement.templateOptions.prefill[index].code]).length) {
          return true;
        }
      }
    }
    return false;
  }

}
