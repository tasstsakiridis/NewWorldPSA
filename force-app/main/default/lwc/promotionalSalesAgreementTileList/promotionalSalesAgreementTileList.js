import { LightningElement, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { registerListener, unregisterAllListeners } from 'c/pubsub';

import getAgreements from '@salesforce/apex/PromotionalSalesAgreement_Controller.getAgreements';

import NEW_LABEL from '@salesforce/label/c.New';
import NEWPSA_LABEL from '@salesforce/label/c.New_PSA';

export default class PromotionalSalesAgreementTileList extends NavigationMixin(LightningElement) {
    labels = {
        new: { label: NEW_LABEL },
        newPSA: { label: NEWPSA_LABEL }
    };

    pageNumber = 1;
    pageSize;
    totalItemCount = 0;
    filters = {};
    agreements = [];

    newAgreement = {
        Id: 'new',
        name: this.labels.new.label
    };

    @wire(CurrentPageReference) pageRef;

    @wire(getAgreements, {filters: '$filters', pageNumber: '$pageNumber'})
    wiredAgreements({ error, data }) {
        if (data) {
            this.agreements = data;
            this.agreements.splice(0, 0, newAgreement);
            this.error = undefined;
        } else if (error) {
            this.error = error;
            this.agreements = undefined;
        }
    };

    connectedCallback() {
        registerListener('filterChange', this.handleFilterChange, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);        
    }

    handleAgreementSelected(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Promotional_Sales_Agreement'
            },
            state: {
                recordId: event.detail  // Pass the id of the agreement to the page
            }
        },
        true  // Replace the current page in the browser history with the URL
        );
    }

    handleNewButtonClick(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__navItemPage',
            attributes: {
                apiName: 'Promotional_Sales_Agreement'
            }
        },
        true  // Replace the current page in the browser history with the URL
        );
    }
    handleFilterChange(filters) {
        this.filters = { ...filters };
        this.pageNumber = 1;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
    }

    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
    }
}