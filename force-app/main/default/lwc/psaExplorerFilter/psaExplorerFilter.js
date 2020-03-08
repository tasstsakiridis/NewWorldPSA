import { LightningElement, wire } from 'lwc';
import { CurrentPageReference } from 'lightning/navigation';

import { fireEvent } from 'c/pubsub';

const DELAY = 350;

import FILTERS_LABEL from '@salesforce/label/c.Filters';
import STARTDATE_LABEL from '@salesforce/label/c.Start_Date';
import MYAGREEMENTS_LABEL from '@salesforce/label/c.My_Agreements';

export default class PsaExplorerFilter extends LightningElement {
    labels = {
        filters: { label: FILTERS_LABEL },
        myAgreements: { label: MYAGREEMENTS_LABEL },
        startDate: { label: STARTDATE_LABEL }
    };

    filters = {
        myAgreements: true,
        startDate: null 
    };

    myAgreements;
    startDate;

    @wire(CurrentPageReference) pageRef;

    handleMyAgreementsChange(event) {
        var checked = event.target.checked;
        this.filters.myAgreements = checked;

        fireEvent(this.pageRef, 'psaFilterChange', this.filters);
    }
    handleStartDateChange(event) {

    }

    delayedFireFilterChangeEvent() {
        window.clearTimeout(this.delayTimeout);
        this.delayTimeout = setTimeout(() => {
            fireEvent(this.pageRef, 'psaFilterChange', this.filters)
        }, DELAY);
    }
}