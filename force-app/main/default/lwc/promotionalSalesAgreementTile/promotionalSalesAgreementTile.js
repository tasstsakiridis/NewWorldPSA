import { LightningElement, api } from 'lwc';

export default class PromotionalSalesAgreementTile extends LightningElement {
    _agreement;

    @api
    get agreement() {
        return this._agreement;
    }
    set agreement(value) {
        this._agreement = value;        
    }

    get isNewAgreement() {
        return this.agreement && this.agreement.Id === 'new';
    }
    get name() {
        return this.agreement ? this.agreement.Name : '';
    }
    get account() {
        return this.agreement && this.agreement.Account__r ? this.agreement.Account__r.Name : '';
    }
    get signingCustomer() {
        return this.agreement && this.agreement.Contact__r ? this.agreement.Contact__r.Name : '';
    }
    get startDate() {
        return this.agreement ? this.agreement.Begin_Date__c : undefined;
    }
    get endDate() {
        return this.agreement ? this.agreement.End_Date__c : undefined;
    }

    handleClick() {
        const selectedEvent = new CustomEvent('agreementSelected', {
            detail: this.agreement.Id 
        });
        this.dispatchEvent(selectedEvent);
    }
}