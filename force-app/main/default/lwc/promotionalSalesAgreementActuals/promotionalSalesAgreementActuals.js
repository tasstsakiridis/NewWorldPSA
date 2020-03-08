import { LightningElement, api, wire } from 'lwc';

import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import { refreshApex } from '@salesforce/apex';

import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';

import userLocale from '@salesforce/i18n/locale';

import CANCEL_LABEL from '@salesforce/label/c.Cancel';
import SAVE_LABEL from '@salesforce/label/c.Save';
import HELP_LABEL from '@salesforce/label/c.help';

export default class PromotionalSalesAgreementActuals extends NavigationMixin(LightningElement) {
    labels = {
        cancel       : { label: CANCEL_LABEL },
        save         : { label: SAVE_LABEL },
        help         : { label: HELP_LABEL },
        createNew    : { label: 'Create new...' },
        createNewForAllProducts : { label: 'Create new for all products...' }
    };    

    @wire(CurrentPageReference) pageRef;

    isPhone = (CLIENT_FORM_FACTOR === "Small");
    get pageLeftMargin() {
        if (!this.isPhone) { return 'slds-m-left_medium'; }
    }

    @api 
    psaId;

    selectedPMIAId;
    selectedPMIId;
    selectedAccountId;
    showActualsForm = false;

    treeItems;
    error;
    thePSA;
    wiredPSA;
    //@wire(getPSA, {psaId: '$psaId'})
    //getWiredPSA(value) {
    //this.wiredPSA = value;
    getAgreement() {
        getPSA({psaId: this.psaId})
            .then(record => {
                this.error = undefined;
                this.thePSA = record;
                this.buildTree();    
            }).catch(error => {
                this.error = error;
                this.thePSA = undefined;
            });
    }

    get psaName() {
        return this.thePSA == undefined ? '' : this.thePSA.Name;
    }

    /**
     * Handle lifecycle events
     */
    connectedCallback() {
        this.getAgreement();
    }
    /**
     * Handle Actuals Form evnts
     */
    
    handleCloseForm(event) {
        console.log('[psaActuals.handleCloseForm]');
        this.selectedPMIAId = undefined;
        this.selectedAccountId = undefined;
        this.selectedPMIId = undefined;
        this.showActualsForm = false;
    }
    handleSaveForm(event) {
        try {
        console.log('[psaActuals.handleSaveForm] detail', event.detail);
        //this.wiredPSA = refreshApex(this.wiredPSA);
        //this.thePSA = this.wiredPSA.data;
        //this.buildTree();
            this.getAgreement();
        } catch(ex) {
            console.log('[psaActuals.handleSaveForm] exception', ex);
        }
    }

    /**
     * Handle local events
     */
    handleCancelButtonClick() {
        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.psaId,
                    objectApiName: 'Promotion_Activity__c',
                    actionName: 'view'
                }
            }, true);
        }catch(ex) {
            console.log('[handelCancelButtonClick] exception', ex);
        }
    
    }

    handleOnSelect(event) {
        try {
            console.log('handle on select. name', event.detail.name);
            const parts = event.detail.name.split('_');
            let prefix = event.detail.name.substring(0, 4);
            let id = event.detail.name.substring(4);        
            if (prefix === 'new_') { 
                this.selectedAccountId = parts[2];           
                this.selectedPMIId = parts[1];
                this.selectedPMIAId = undefined;
                this.showActualsForm = true;
                if (this.showActualsForm) {
                    this.template.querySelector('c-promotional-sales-agreement-actuals-form').createNew();
                }
            } else if (parts[0] === 'newaccount') {
                this.selectedAccountId = parts[1];
                this.selectedPMIId = undefined;
                this.selectedPMIAId = undefined;
                this.showActualsForm = true;
                if (this.showActualsForm) {
                    this.template.querySelector('c-promotional-sales-agreement-actuals-form').createNew();
                }
            } else if (parts[0] === 'pmia') {
                this.selectedAccountId = undefined;
                this.selectedPMIId = undefined;
                this.selectedPMIAId = parts[1];
                this.showActualsForm = true;
            }
        }catch(ex) {
            console.log('[handleOnSelect] exception', ex);
        }
    }

    /**
     * Helper functions
     */    
    buildTree() {
        console.log('[actuals.buildTree] thepsa', this.thePSA);
        try {
            
        if (this.thePSA.Promotions__r && this.thePSA.Promotions__r.length > 0) {
            const items = this.thePSA.Promotions__r.map(account => {
                //const isExpanded = account.Id == this.selectedAccountId;
                const accountTree = {
                    label: account.AccountName__c,
                    name: account.Id,
                    disabled: false,
                    expanded: true,
                    items: []
                };
                
                if (this.thePSA.Promotion_Material_Items__r && this.thePSA.Promotion_Material_Items__r.length > 0) {
                    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

                    const pmiItems = this.thePSA.Promotion_Material_Items__r.map(pmi => {                                            
                        //const pmiIsExpanded = pmi.Id == this.selectedPMIId;
                        const key = pmi.Id + '_' + account.Id;
                        const pmiTree = {
                            label: pmi.Product_Name__c,
                            name: pmi.Id + '_' + account.Id,
                            disabled: false,
                            expanded: true,
                            items: []
                        };

                        if (this.thePSA.PMI_Actuals__r && this.thePSA.PMI_Actuals__r.length > 0) {
                            const actualsForPMI = this.thePSA.PMI_Actuals__r.filter(pmia => (pmia.Promotion_Material_Item__c === pmi.Id && pmia.Promotion__c === account.Id));
                            if (actualsForPMI) {
                                pmiTree.items = actualsForPMI.map(actuals => {
                                    const pd = new Date(actuals.Payment_Date__c);
                                    let metattext = actuals.Approval_Status__c + ' : ' + actuals.Actual_Wholesaler__r.Name;
                                    metattext += ', Actual Qty: ' + actuals.Act_Qty__c;
                                    return {
                                        label: pd.toLocaleDateString(userLocale, dateOptions),
                                        metatext: metattext,
                                        name: 'pmia_' + actuals.Id,
                                        disabled: false,
                                        expanded: false,
                                        items: []
                                    };
                                })
                            } else {
                                pmiTree.items = [];
                            }
                            //pmiTree.items = actualsForPMI;
                        }

                        const createNew = { label:this.labels.createNew.label, name:'new_'+key, disabled:false, expanded:false, items:[] };
                        pmiTree.items.splice(0, 0, createNew);
                        return pmiTree;
                    });
                    const createNewForAccount = { label:this.labels.createNewForAllProducts.label, name:'newaccount_'+account.Account__c, disabled:false, expanded:false, items:[] };
                    pmiItems.splice(0, 0, createNewForAccount);
                    accountTree.items = pmiItems;
                }
                
               return accountTree;
            });

            this.treeItems = items;
            console.log('[actuals.buildtree] treeitems', items);
        }
        } catch (ex) {
            console.log('[actuals.buildtree] exception', ex);
        }
    }
}