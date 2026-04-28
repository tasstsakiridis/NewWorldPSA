import { api } from 'lwc';
import LightningModal from "lightning/modal";

import findWholesalers from '@salesforce/apex/PromotionalSalesAgreement_Controller.findWholesalers';

import LABEL_PURCHASED_FROM from '@salesforce/label/c.Purchased_From';
import LABEL_SEARCH from '@salesforce/label/c.Search';

export default class BfSearchResultsModal extends LightningModal {
    @api psa;
    @api options = [];

    labels = {
        purchasedFrom           : { label: LABEL_PURCHASED_FROM },
        search                  : { label: LABEL_SEARCH },
    };

    isSearching = false;
    wholesalerSearchString = '';
    error;

    handleSearchWholesalerChange(event) {
        this.wholesalerSearchString = event.detail.value;
    }

    handleWholesalerSearchButtonClick(event) {

    }

    handleOptionClick(e) {
        const { target } = e;
        const { recordId } = target.dataset

        this.close(recordId);
    }

    searchForWholesalers() {
        this.isSearching = true;
        console.log('[searchForWholesalers] query', this.wholesalerSearchString);
        findWholesalers({
            name: this.wholesalerSearchString,
            marketId: this.psa.Market__c,
            marketName: this.psa.Market__r.Name
        }).then(result => {
            console.log('[searchForWholesalers] result', result);
            this.isSearching = false;
            this.error = undefined;
            this.options = result.records;
        }).catch(error => {
            console.log('[searchForWholesalers] error', error);
            this.isSearching = false;
            this.error = error;
            this.options = undefined;
        });
    }

}