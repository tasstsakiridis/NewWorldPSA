import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { refreshApex } from '@salesforce/apex';

import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';
import getPMIADetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPMIADetails';

import OBJECT_PMIA from '@salesforce/schema/PMI_Actual__c';

import FIELD_ID from '@salesforce/schema/PMI_Actual__c.Id';
import FIELD_ACTIVITY_ID from '@salesforce/schema/PMI_Actual__c.Activity__c';
import FIELD_PROMOTION_ID from '@salesforce/schema/PMI_Actual__c.Promotion__c';
import FIELD_PROMOTION_MATERIAL_ITEM_ID from '@salesforce/schema/PMI_Actual__c.Promotion_Material_Item__c';
import FIELD_APPROVAL_STATUS from '@salesforce/schema/PMI_Actual__c.Approval_Status__c';
import FIELD_PERIOD from '@salesforce/schema/PMI_Actual__c.Period__c';
import FIELD_EXTERNAL_KEY from '@salesforce/schema/PMI_Actual__c.External_Key__c';
import FIELD_ACTUAL_QTY from '@salesforce/schema/PMI_Actual__c.Act_Qty__c';
import FIELD_PAYMENT_DATE from '@salesforce/schema/PMI_Actual__c.Payment_Date__c';
import FIELD_ACTUAL_WHOLESALER from '@salesforce/schema/PMI_Actual__c.Actual_Wholesaler__c';

import CANCEL_LABEL from '@salesforce/label/c.Cancel';
import SAVE_LABEL from '@salesforce/label/c.Save';
import YES_LABEL from '@salesforce/label/c.Yes';
import NO_LABEL from '@salesforce/label/c.No';
import HELP_LABEL from '@salesforce/label/c.help';
import WARNING_LABEL from '@salesforce/label/c.Warning_Title';

export default class PromotionalSalesAgreementActualsForm extends NavigationMixin(LightningElement) {
    labels = {
        cancel       : { label: CANCEL_LABEL },
        save         : { label: SAVE_LABEL },
        yes          : { label: YES_LABEL },
        no           : { label: NO_LABEL },
        help         : { label: HELP_LABEL },
        actuals      : { label: 'Actuals' },
        status       : { label: 'Status' },
        account      : { label: 'Account' },
        product      : { label: 'Product' },
        actualQty    : { label: 'Actual Qty', placeholder: 'Enter the actual qty sold', error: 'No actual qty entered' },
        paymentDate  : { label: 'Payment Date', placeholder: 'Enter the date payment of the rebate was made', error: 'No payment date selected' },
        processed    : { label: 'Processed' },
        planned      : { label: 'Planned' },
        purchasedFrom : { label: 'Purchased from' },
        warning       : { label: WARNING_LABEL },
        validation    : { error: 'There are some issues with the data you entered.  Please review the error messages and try again.'},
        skip          : { label: 'skip' },
        prev          : { label: 'prev' },
        next          : { label: 'next' }

    };    

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        console.log('[psaactualsform.setcurrentpagereference] pageref', currentPageReference);
        console.log('[psaactualsform.setcurrentpagereference] ids', this.psaId, this.promotionId, this.pmiId, this.pmiaId);
        this.psaId = currentPageReference.state.c__psaId;
        this.accountId = currentPageReference.state.c__promotionId;
        this.pmiId = currentPageReference.state.c__pmiId;
        this.pmiaId = currentPageReference.state.c__pmiaId;
        console.log('[psaactualsform.setcurrentpagereference] thePSA', this.thePSA);
        if (this.thePSA != undefined) {
            if (this.pmiaId == undefined) {
                if (this.pmiId == undefined) {
                    // this.createMultipleActuals();
                } else {
                    this.createNewActual();
                }
            }    
        }
    }

    isPhone = CLIENT_FORM_FACTOR === 'Small';    


    @track objectInfo;
    recordTypeId;

    @wire(getObjectInfo, { objectApiName: OBJECT_PMIA })
    wiredObjectInfo({error, data}) {
        if (data) {
            this.error = undefined;
            this.objectInfo = data;
            this.getRecordTypeId();
            //this.setFieldLabels();
        } else if (error) {
            this.error = error;
            this.objectInfo = undefined;
        }
    }

    picklistValuesMap;
    @wire(getPicklistValuesByRecordType, { objectApiName: OBJECT_PMIA, recordTypeId: '$recordTypeId' })
    wiredPicklistValues({ error, data }) {
        console.log('[getPicklistValues] data', data);
        console.log('[getPicklistValues] error', error);
        if (data) {
            this.error = undefined;
            this.picklistValuesMap = data.picklistFieldValues;
            this.setFieldOptions(data.picklistFieldValues);
        } else if (error) {
            this.error = error;
            this.picklistValuesMap = undefined;
            this.finishedLoadingObjectInfo = true;
        }
    }

    @api 
    psaId;

    @api 
    pmiId;

    @api 
    pmiaId;

    @api 
    accountId;

    @api 
    createNew(promotionId, pmiId, psaId) {
        this.accountId = promotionId;
        this.pmiId = pmiId;
        this.thePMIA = undefined;
        this.createNewActual();    
    }

    @api 
    loadPMIA(pmiaId, psaId) {
        this.pmiaId = pmiaId;
        console.log('[loadPMIA] pmiaId', pmiaId);
        console.log('[loadPMIA] psa', this.thePSA);
        refreshApex(this.wiredPMIActual);
        this.thePMIA = this.wiredPMIActual.data;
        this.loadPMIADetails();
    }

    error;
    thePMIA;
    thePMI;
    theAccount;
    isWorking = false;    

    wiredPSA;
    @wire(getPSA, { psaId: '$psaId' })
    wiredGetPSA(value) {
        this.wiredPSA = value;
        console.log('[psaactualsform.wiredgetpsa] psa', value);
        if (value.error) {
            this.error = value.error;
            this.thePSA = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.thePSA = value.data;

            this.wholesalerOptions = [
                { label: this.thePSA.Wholesaler_Preferred_Name__c, value: this.thePSA.Wholesaler_Preferred__c, selected: true },
                { label: this.thePSA.Wholesaler_Alternate_Name__c, value: this.thePSA.Wholesaler_Alternate__c }
            ];
    
            if (this.pmiaId == undefined) {                    
                this.createNewActual();
            }

        }
    }

    wiredPMIActual;
    @wire(getPMIADetails, { pmiaId: '$pmiaId' })
    wiredGetPMIActuals(value) {      
        console.log('[psaactualform.getpmiadetails] psa', this.thePSA);  
        this.wiredPMIActual = value;
        console.log('[psaactualform.getpmiadetails] pmia', value);
        if (value.error) {
            this.error = value.error;
            this.thePMIA = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.thePMIA = value.data;
            this.loadPMIADetails();
        }
    }
    /*
    getPMIA() {
        console.log('[getPMIA] pmiaId', this.pmiaId);
        getPMIADetails({pmiaId: this.pmiaId})
            .then(record => {
                console.log('[getPMIA] record', record);
                this.error = undefined;
                this.thePMIA = record;
                this.productName = this.thePMIA.Product_Name__c;
                this.accountName = this.thePMIA.Account_Name__c;
                this.actualQty = this.thePMIA.Act_Qty__c;
                this.paymentDate = this.thePMIA.Payment_Date__c;
                this.approvalStatus = this.thePMIA.Approval_Status__c;
                this.processed = this.thePMIA.Boomi_Processed__c;
                this.processedDate = this.thePMIA.Processed_Date__c;
                this.plannedVolume = this.thePMIA.Promotion_Material_Item__r.Plan_Volume__c;
                this.plannedDiscount = this.thePMIA.Promotion_Material_Item__r.Plan_Rebate__c;
                this.wholesaler = this.thePMIA.Actual_Wholesaler__c;
                this.wholesalerName = this.thePMIA.Actual_Wholesaler__r.Name;
    
            })
            .catch(error => {
                this.error = error;
                this.thePMIA = undefined;
    
            });
    }
    */
    isFinanceUser = false;

    productName;
    productLabel;

    accountName;
    accountLabel;
    
    wholesaler;
    wholesalerOptions;

    plannedDiscount;
    plannedVolume;

    actualQty;
    actualQtyLabel;
    actualQtyPlaceholder;
    actualQtyErrorMessage = this.labels.actualQty.error;
    hasActualQtyError;
    get actualQtyFormattedLabel() {
        console.log('[actualQtyFormattedLabel] actualqtylabel', this.labels.actualQty.label);
        console.log('[actualQtyFormattedLabel] isPhone', this.isPhone);
        if (this.isPhone) {
            return this.labels.actualQty.label;
        } else {
            return this.labels.actualQty.label + ' [' + this.labels.planned.label.toUpperCase() + ' : ' + this.plannedVolume + ']';
        }
    }

    paymentDate;
    paymentDateLabel;
    paymentDatePlaceholder;
    paymentDateErrorMessage = this.labels.paymentDate.error;
    hasPaymentDateError;
    get formattedPaymentDate() {
        var theDate = this.paymentDate == null ? new Date() : this.paymentDate;
        return theDate.toISOString();
    }

    processed;
    processedLabel;
    get processedMessage() {
        return 'Processed on';
    }

    processedDate;
    processedDateLabel;    

    approvalStatus;
    approvalStatusLabel;
    approvalStatusOptions;
    get canEdit() {
        return this.approvalStatus !== 'Paid' && this.approvalStatus !== 'Approved';
    }

    pmiIndex = 0;
    totalPMIRecords = 0;
    pmiRecords;
    get isFirstRecord() {
        return this.pmiIndex === 0;
    }
    get isLastRecord() {
        return this.pmiIndex >= this.totalPMIRecords;
    }
    get multipleRecordsMessage() {
        return (this.pmiIndex + 1) + ' : ' + this.totalPMIRecords;
    }

    /**
     * Handle lifecycle evnts
     */
    connectedCallback() {
        console.log('[psaactualform.connectedCallback] pmiaId', this.pmiaId);
        /*
        if (this.thePMIA != undefined && this.pmiaId !== this.thePMIA.Id) {
            refreshApex(this.wiredPMIActual);
        }
        */
    }
    renderedCallback() {
        console.log('[psaactualform.renderredCallback] pmiaId', this.pmiaId);
    }
    /**
     * Handle local events
     */
    handleCancelButtonClick() {
        this.goBack();
    }
    handleSaveButtonClick() {
        this.isWorking = true;

        const isValid = this.validateForm();
        if (isValid) {
            this.save();
        } else {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: this.labels.warning.label,
                    message: this.labels.validation.error,
                    variant: 'info'
                })
            );
        }
    }
    handleHelpButtonClick() {

    }
    handleSkipRecordButtonClick() {
        this.pmiIndex = this.pmiIndex + 1;
    }
    handlePreviousRecordButtonClick() {
        this.pmiIndex = this.pmiIndex - 1;
    }
    handleNextRecordButtonClick() {
        this.pmiIndex = this.pmiIndex + 1;
    }

    handleApprovalStatusChange(event) {
        this.approvalStatus = event.detail.value;
    }
    handleActualQtyChange(event) {
        this.actualQty = event.detail.value;
    }
    handlePaymentDateChange(event) {
        this.paymentDate = new Date(event.detail.value);
    }
    handleWholesalerChange(event) {
        this.wholesaler = event.detail.value;
        if (this.wholesaler === this.thePSA.Wholesaler_Preferred__c) {
            this.wholesalerName = this.thePSA.Wholesaler_Preferred_Name__c;
        } else {
            this.wholesalerName = this.thePSA.Wholesaler_Alternate_Name__c;
        }
    }

    /**
     * Helper functions
     */
    getRecordTypeId() {
        if (this.objectInfo.recordTypeInfos) {
            console.log('[get recordtypeid] objectinfo', this.objectInfo);
            const rtis = this.objectInfo.recordTypeInfos;
            console.log('[get recordtypeid] rtis', rtis);
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'UK - PSA');
            console.log('[get recordtypeid] rtis', Object.keys(rtis));
            console.log('[get recordtypeid] recordtypeid', this.recordTypeId);
        }    
    }

    setFieldLabels() {
        /*
        console.log('[setFieldLabels] objectInfo', this.objectInfo);
        if (this.objectInfo.fields["Approval_Status__c"]) {
            this.approvalStatusLabel = this.objectInfo.fields["Approval_Status__c"].label;
            this.approvalStatusPlaceholder = this.objectInfo.fields["Approval_Status__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Act_Qty__c"]) {
            this.actualQtyLabel = this.objectInfo.fields["Act_Qty__c"].label;
            this.actualQtyPlaceholder = this.objectInfo.fields["Act_Qty__c"].inlineHelpText;
            console.log('[setFieldLabels] actualQtyLabel', this.actualQtyLabel);
        }
        if (this.objectInfo.fields["Payment_Date__c"]) {
            this.paymentDateLabel = this.objectInfo.fields["Payment_Date__c"].label;
            this.paymentDatePlaceholder = this.objectInfo.fields["Payment_Date__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Account__c"]) {
            this.accountLabel = this.objectInfo.fields["Account__c"].label;
        }
        if (this.objectInfo.fields["Product__c"]) {
            this.productLabel = this.objectInfo.fields["Product__c"].label;
        }
        */

    }

    setFieldOptions(picklistValues) {
        console.log('[setFieldOptions] picklistValues', picklistValues);
        Object.keys(picklistValues).forEach(picklist => {            
            if (picklist === 'Approval_Status__c') {
                this.approvalStatusOptions = this.setFieldOptionsForField(picklistValues, picklist);
                console.log('[psaactualsform.setfieldoptions] approvalstatusoptions', this.approvalStatusOptions);
            }
        });

        this.finishedLoadingObjectInfo = true;
        if (this.finishedLoadingDetails && this.finishedLoadingProduct) { this.isWorking = false; }
        
    }
    
    setFieldOptionsForField(picklistValues, picklist) {        
        console.log('[setFieldOptionsForField] picklist field', picklist);
        return picklistValues[picklist].values.map(item => ({
            label: item.label,
            value: item.value
        }));
    }

    loadPMIADetails() {
        this.productName = this.thePMIA.Product_Name__c;
        this.accountName = this.thePMIA.Account_Name__c;
        this.actualQty = this.thePMIA.Act_Qty__c;
        this.paymentDate = this.thePMIA.Payment_Date__c;
        this.approvalStatus = this.thePMIA.Approval_Status__c;
        this.processed = this.thePMIA.Boomi_Processed__c;
        this.processedDate = this.thePMIA.Processed_Date__c;
        this.plannedVolume = this.thePMIA.Promotion_Material_Item__r.Plan_Volume__c;
        this.plannedDiscount = this.thePMIA.Promotion_Material_Item__r.Plan_Rebate__c;
        this.wholesaler = this.thePMIA.Actual_Wholesaler__c;
        this.wholesalerName = this.thePMIA.Actual_Wholesaler__r.Name;
    }
    createNewActual() {
        console.log('createNewActual.thePSa', this.thePSA);
        this.wholesaler = this.thePSA.Wholesaler_Preferred__c;
        this.wholesalerName = this.thePSA.Wholesaler_Preferred_Name__c;
        
        this.theAccount = this.thePSA.Promotions__r.find(p => p.Id === this.accountId);
        if (this.theAccount) {
            this.accountName = this.theAccount.AccountName__c;
        }
        if (this.pmiId == undefined) {
            this.pmiRecords = this.thePSA.Promotion_Material_Items__r;
            this.pmiIndex = 0;
            this.totalPMIRecords = this.pmiRecords.length;
            this.productName = this.pmiRecords[0].Product_Name__c;
            this.plannedVolume = this.pmiRecords[0].Plan_Volume__c;
            this.plannedDiscount = this.pmiRecords[0].Plan_Rebate__c;
        } else {
            this.thePMI = this.thePSA.Promotion_Material_Items__r.find(p => p.Id === this.pmiId);
            if (this.thePMI) {
                this.productName = this.thePMI.Product_Name__c;
                this.plannedDiscount = this.thePMI.Plan_Rebate__c;
                this.plannedVolume = this.thePMI.Plan_Volume__c;
            }    
        }

        this.approvalStatus = 'New';
        this.paymentDate = new Date();
        this.actualQty = 0;
    }

    goBack() {
        console.log('[pmiaForm.goBack]');
        if (this.isPhone) {
            this[NavigationMixin.Navigate]({
                type: 'standard__component',
                attributes: {
                    componentName: 'c__PromotionalSalesAgreementActualsContainer'
                },
                state: {
                    c__psaId: this.psaId
                }
            });        
        } else {
            this.dispatchEvent(new CustomEvent('close'));
        }
    }

    getUpdatedPageReference(stateChanges) {
        console.log('[psaactuals.getupdatedpagereference] statechanges', stateChanges);
        return Object.assign({}, this.currentPageReference, {
            state: Object.assign({}, this.currentPageReference.state, stateChanges)
        });
    }

    validateForm() {
        let isValid = true;
        this.hasPaymentDateError = false;
        this.hasActualQtyError = false;

        this.hasActualQtyError = (this.actualQty == undefined || this.actualQty == 0);
        this.hasPaymentDateError = (this.paymentDate == undefined);

        if (this.hasActualQtyError || this.hasPaymentDateError) { isValid = false; }
        return isValid;
    }

    save() {      
        try {
            const fields = {};
            
            fields['RecordTypeId'] = this.recordTypeId;
            fields[FIELD_PROMOTION_ID.fieldApiName] = this.accountId;
            if (this.pmiId == undefined && this.pmiRecords != null && this.pmiRecords.length > 0) {
                fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName] = this.pmiRecords[this.pmiIndex].Id;
            } else {
                fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName] = this.pmiId;
            }
            if (!this.isFinanceUser) {
                fields[FIELD_ACTUAL_QTY.fieldApiName] = this.actualQty;
            }
            fields[FIELD_PAYMENT_DATE.fieldApiName] = this.paymentDate;
            fields[FIELD_APPROVAL_STATUS.fieldApiName] = this.approvalStatus;
            fields[FIELD_ACTUAL_WHOLESALER.fieldApiName] = this.wholesaler;

            console.log('[psaactualform.save] paymentDate', this.paymentDate);  
            const paymentDateYear = this.paymentDate.getFullYear().toString();
            const paymentDateMonth = ('00' + this.paymentDate.getMonth()).substr(1);
            const paymentDateDay = ('00' + this.paymentDate.getDate()).substr(1);
            console.log('[psaactualform.save] date parts', paymentDateYear, paymentDateMonth, paymentDateDay);          
            const dateString = paymentDateYear + paymentDateMonth + paymentDateDay;
            console.log('[psaactualform.save] dateString', dateString);
            const externalKey = this.accountId + '_' + fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName] + '_' + dateString;
            console.log('[psaactualform.save] externalKey', externalKey);
            fields[FIELD_EXTERNAL_KEY.fieldApiName] = externalKey;
            fields[FIELD_PERIOD.fieldApiName] = 0;

            if (this.pmiaId === undefined) {
                fields[FIELD_ACTIVITY_ID.fieldApiName] = this.psaId;
                const record = { apiName: OBJECT_PMIA.objectApiName, fields };
                this.createNewPMIA(record);
            } else {
                fields[FIELD_ID.fieldApiName] = this.pmiaId;
                const record = { fields };
                this.updatePMIA(record);
            }
        } catch(ex) {
            console.log('[psaactualsform.save] exception', ex);
        }
    }

    createNewPMIA(record) {
        console.log('[pmiaForm.createNewPMIA] record', record);
        createRecord(record)
            .then(pmiaItem => {
                console.log('[pmiaForm.createRecord] pmiaItem', pmiaItem);
                this.isWorking = false;
                this.pmiaId = pmiaItem.id;

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Actuals created successfully',
                        variant: 'success'
                    }),
                );

                if (this.isPhone) {
                    this[NavigationMixin.Navigate]({
                        type: 'standard__component',
                        attributes: {
                            componentName: 'c__PromotionalSalesAgreementActualsContainer'
                        },
                        state: {
                            c__psaId: this.psaId
                        }
                    });
                } else {
                    const saveEvent = new CustomEvent('save', {
                        detail: pmiaItem
                    });
                    this.dispatchEvent(saveEvent);
                    this[NavigationMixin.Navigate](this.getUpdatedPageReference({
                        c__psaId: this.psaId,
                        c__pmiaId: pmiaItem.id 
                    }), true);
                }
                    
                if (this.pmiRecords != undefined && this.pmiRecords.length > 0) {
                    this.pmiIndex = this.pmiIndex + 1;
                } else {
                    this.pmiaItem = pmiaItem;
                    this.pmiaId = pmiaItem.Id;
                }
            })
            .catch(error => {
                this.isWorking = false;
                console.log('[psaItemForm.createNewPSAItem] error', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating Actuals',
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
            });

    }
    updatePMIA(record) {
        console.log('[pmiaForm.update] record', record);
        updateRecord(record)
            .then(() => {
                this.isWorking = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Actuals updated successfully',
                        variant: 'success'
                    }),
                );

                try {
                if (!this.isPhone) {
                    const updatedRecord = refreshApex(this.wiredPMIActual);
                    console.log('updated record', updatedRecord);
                    const saveEvent = new CustomEvent('save', {
                        detail: updatedRecord
                    });
                    this.dispatchEvent(saveEvent);
                }
                }catch(ex){
                    console.log('[updateRecord success] dispatchevent exception', ex);                    
                }

            })
            .catch(error => {
                this.isWorking = false;
                console.log('[updateRecord] error', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error updating Actuals',
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
            });

    }
}