import { LightningElement, api } from 'lwc';
import { reduceErrors } from 'c/ldsUtils';

const VARIANTS = {
    info: 'utility:info',
    success: 'utility:success',
    warning: 'utility:warning',
    error: 'utility:error'
};

import SHOW_DETAILS_LABEL from '@salesforce/label/c.Show_Details';
import ERROR_MESSAGE from '@salesforce/label/c.Error_Getting_Data';

export default class InlineMessage extends LightningElement {
    labels = {
        errorMessage: { message: ERROR_MESSAGE },
        showDetails: { label: SHOW_DETAILS_LABEL }
    };

    @api message;
    @api errors;

    iconName = VARIANTS.info;

    _variant = 'info';
    @api
    get variant() {
        return this._variant;
    }
    set variant(value) {
        if (VARIANTS[value]) {
            this._variant = value;
            this.iconName = VARIANTS[value];
        }
    }

    viewDetails = false;

    get errorMessages() {
        return reduceErrors(this.errors);
    }

    handleCheckboxChange(event) {
        this.viewDetails = event.target.checked;
    }
    
}