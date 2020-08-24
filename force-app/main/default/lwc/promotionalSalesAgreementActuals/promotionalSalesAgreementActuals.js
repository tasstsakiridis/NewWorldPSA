import { LightningElement, api, wire } from 'lwc';

import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import { refreshApex } from '@salesforce/apex';

import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';
import getGLMappings from '@salesforce/apex/PromotionalSalesAgreement_Controller.getGLMappings';

import userLocale from '@salesforce/i18n/locale';

import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_HELP from '@salesforce/label/c.help';
import LABEL_CREATE_NEW from '@salesforce/label/c.CreateNew';
import LABEL_PSA_UPDATED_ACTUALS_MESSAGE from '@salesforce/label/c.PSA_Updated_Actuals_Message';

export default class PromotionalSalesAgreementActuals extends NavigationMixin(LightningElement) {
    labels = {
        back         : { label: LABEL_BACK },
        help         : { label: LABEL_HELP },
        createNew    : { label: LABEL_CREATE_NEW },
        createNewForAllProducts : { label: 'Create new for all products...' },
        psaUpdated   : { message: LABEL_PSA_UPDATED_ACTUALS_MESSAGE }
    };    
    
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        console.log('[psaactuals.setcurrentpagerefernce] pageref', currentPageReference);
        this.psaId = currentPageReference.state.c__psaId;
        this.showActualsForm = currentPageReference.state.c__showActualsForm;
    }

    isPhone = (CLIENT_FORM_FACTOR === "Small");
    get pageLeftMargin() {
        if (!this.isPhone) { return 'slds-m-left_medium'; }
    }

    @api 
    psaId;

    selectedPMIAId;
    selectedPMIId;
    selectedAccountId;
    showActualsForm;
    connected = false;

    treeItems;
    error;
    marketId;
    thePSA;
    wiredPSA;
    wholesalerOptions;

    @wire(getPSA, {psaId: '$psaId'})
    getWiredPSA(value) {
        this.wiredPSA = value;
        console.log('[psaactuals.getWiredPSA] psa', value);
        if (value.error) {
            this.error = value.error;
            this.thePSA = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.thePSA = value.data;
            this.marketId = this.thePSA.Market__c;
            this.wholesalerOptions = [
                { label: this.thePSA.Wholesaler_Preferred_Name__c, value: this.thePSA.Wholesaler_Preferred__c, selected: true }    
            ];
            if (this.thePSA.Wholesaler_Alternate__c != undefined) {
                this.wholesalerOptions.push({ label: this.thePSA.Wholesaler_Alternate_Name__c, value: this.thePSA.Wholesaler_Alternate__c });
            }

            console.log('[psaactuals.wholesalerOptions] wholesalerOptions', this.wholesalerOptions);
            this.buildTree();
        }
    }

    get psaName() {
        return this.thePSA == undefined ? '' : this.thePSA.Name;
    }
    get psaStatus() {
        return this.thePSA == null ? 'New' : this.thePSA.Status__c;
    }
    get isApproved() {
        return this.thePSA == null ? false : this.thePSA.Is_Approved__c;
    }
    get canEdit() {
        console.log('[canEdit] status, isapproved', this.psaStatus, this.isApproved);
        return this.psaStatus != 'Updated' && this.psaStatus != 'Submit' && this.psaStatus != 'Pending Approval' && this.isApproved;
    }

    glMappings;
    @wire(getGLMappings, { marketId: '$marketId' })
    getGLMappings(value) {
        console.log('[getGLMappings] value', value);
        if (value.error) {
            this.error = value.error;
            this.glMappings = undefined;
        } else if (value.data) { 
            this.error = undefined;
            this.glMappings = value.data;
        }
    }

    /**
     * Handle lifecycle events
     */
    connectedCallback() {
        //this.getAgreement();
        this.connected = true;
        /*
        console.log('[psaactuals.connectedCallback] psaId', this.psaId);
        if (this.thePSA != undefined && this.psaId !== this.thePSA.Id) {
            console.log('[psaactuals.connectedCallback] refreshing apex');
            refreshApex(this.wiredPSA);
            this.thePSA = this.wiredPSA.data;
            console.log('[psaactuals.connectedCallback] refreshing apex. thePSA', this.thePSA);
            this.buildTree();
        }
        */
    }
    renderredCallback() {
        console.log('[psaactuals.renderredCallback] psaId', this.psaId);
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
            console.log('[psaActuals.handleSaveForm] detail.id', event.detail.Id);
            refreshApex(this.wiredPSA)
                .then(() => {
                    this.thePSA = this.wiredPSA.data;
                    console.log('[psaActuals.handleSaveForm] after refreshapex has returned. thePSa', this.thePSA);
                    this.buildTree();
                    this.handleCloseForm();
                })
                .catch(error => {
                    console.log('[psaActuals.handleSaveForm] error', error);
                });
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
            console.log('[psaactuals.handleonselect] prefix', prefix);       
            console.log('[psaactuals.handleonselect] parts[0]', parts[0]);       
            let newState;
            if (parts[0] === 'new') {     
                console.log('[psaactuals.handleonselect] setting up for new pmia');            
                newState = {
                    c__psaId: this.psaId,
                    c__pmiaId: undefined,
                    c__promotionId: parts[2],
                    c__pmiId: parts[1],
                    c__showActualsForm: true
                };
            } else if (parts[0] === 'pmia') {
                newState = {
                    c__psaId: this.psaId,
                    c__pmiaId: parts[1],
                    c__promotionId: undefined,
                    c__pmiId: undefined,
                    c__showActualsForm: true
                };
            }            
            if (this.isPhone) {
                this[NavigationMixin.Navigate]({
                    type: 'standard__component',
                    attributes: {
                        componentName: 'c__PromotionalSalesAgreementActualsFormContainer'
                    },
                    state: newState
                });
            } else {
                this[NavigationMixin.Navigate](this.getUpdatedPageReference(newState), true);
            }
        }catch(ex) {
            console.log('[handleOnSelect] exception', ex);
        }
    }

    /**
     * Helper functions
     */    
    getUpdatedPageReference(stateChanges) {
        console.log('[psaactuals.getupdatedpagereference] statechanges', stateChanges);
        return Object.assign({}, this.currentPageReference, {
            state: Object.assign({}, this.currentPageReference.state, stateChanges)
        });
    }
    buildTree() {
        console.log('[actuals.buildTree] thepsa', this.thePSA);
        try {
            const accountTree = {
                label: this.thePSA.Account__r.Name,
                name: this.thePSA.Account__c,
                disabled: false,
                expanded: true,
                items: []
            };
            let promotionWithParentAccount = this.thePSA.Promotions__r[0];
            if (this.thePSA.Account__r.RecordType.Name == 'Parent') {
                promotionWithParentAccount = this.thePSA.Promotions__r.find(p => p.Account__c == this.thePSA.Account__c);
            }
            console.log('[buildTree] accountTree', accountTree);

            if (this.thePSA.Promotion_Material_Items__r && this.thePSA.Promotion_Material_Items__r.length > 0) {
                const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

                const pmiItems = this.thePSA.Promotion_Material_Items__r.map(pmi => {                                            
                    console.log('[buildtree] pmi', pmi);
                    const key = pmi.Id + '_' + promotionWithParentAccount.Id;
                    const pmiTree = {
                        label: pmi.Product_Name__c,
                        name: key,
                        disabled: false,
                        expanded: true,
                        items: []
                    };

                    
                    if (this.thePSA.PMI_Actuals__r && this.thePSA.PMI_Actuals__r.length > 0) {
                        const actualsForPMI = this.thePSA.PMI_Actuals__r.filter(pmia => pmia.Promotion_Material_Item__c === pmi.Id);
                        console.log('[buildtree] actualforpmi', actualsForPMI);
                        if (actualsForPMI) {
                            
                            actualsForPMI.forEach(actual => {
                                console.log('[buildtree] actual', actual);
                                console.log('[buildtree] has totals', actual.Has_Totals__c);
                                if (actual.Has_Totals__c == false) {
                                    const pd = new Date(actual.Payment_Date__c);
                                    let metatext = '';
                                    if (actual.Rebate_Type__c == 'Volume') {
                                        metatext += 'Actual Qty: ' + actual.Act_Qty__c;
                                    } else {
                                        metatext += actual.Rebate_Type__c + ': ' + actual.Rebate_Amount__c;
                                    }
                                    let found = false;
                                    pmiTree.items.forEach(item => {
                                        if (item.paymentDate == actual.Payment_Date__c) {
                                            found = true;
                                            item.items.push({
                                                label: actual.Rebate_Type__c + ' - ' + actual.Approval_Status__c,
                                                metatext: metatext,
                                                name: 'pmia_'+actual.Id + '_' + actual.Rebate_Type__c,
                                                disabled: false,
                                                expanded: false,
                                                items: []    
                                            });
                                            return true;
                                        }
                                    });
                                    console.log('[buildtree] found', found);
                                    console.log('[buildtree] pmiTree', pmiTree);
                                    if (!found) {
                                        pmiTree.items.push({
                                            paymentDate: actual.Payment_Date__c,
                                            label: pd.toLocaleDateString(userLocale, dateOptions),
                                            metatext: actual.Actual_Wholesaler__r.Name,
                                            name: 'pmia_'+actual.Id,
                                            disabled: false,
                                            expanded: true,
                                            items: [
                                                { label: actual.Rebate_Type__c + ' - ' + actual.Approval_Status__c,
                                                    metatext: metatext,
                                                    name: 'pmia_'+actual.Id+'_'+actual.Rebate_Type__c,
                                                    disabled: false,
                                                    expanded: false,
                                                    items: []
                                            }]
                                        });
                                    }
    
                                }
                            });
                        } else {
                            pmiTree.items = [];
                        }
                    }
                    console.log('[buildtree] pmiTree', pmiTree);
                    const createNew = { label:this.labels.createNew.label, name:'new_'+key, disabled:false, expanded:false, items:[] };
                    pmiTree.items.splice(0, 0, createNew);
                    return pmiTree;
                });
                accountTree.items = pmiItems;
            }
              
            this.treeItems = [accountTree];
        } catch (ex) {
            console.log('[actuals.buildtree] exception', ex);
        }
    }
}