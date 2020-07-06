import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { createRecord, updateRecord } from 'lightning/uiRecordApi';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import { refreshApex } from '@salesforce/apex';

import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import createActuals from '@salesforce/apex/PromotionalSalesAgreement_Controller.createActuals';
import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';
import getPMIADetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPMIADetails';
import updateActualTotals from '@salesforce/apex/PromotionalSalesAgreement_Controller.updateActualTotals';
import getIsSOMUser from '@salesforce/apex/PromotionalSalesAgreement_Controller.getIsSOMUser';

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
import FIELD_REBATE_AMOUNT from '@salesforce/schema/PMI_Actual__c.Rebate_Amount__c';
import FIELD_LISTING_FEE from '@salesforce/schema/PMI_Actual__c.Listing_Fee__c';
import FIELD_PROMOTIONAL_ACTIVITY from '@salesforce/schema/PMI_Actual__c.Promotional_Activity__c';
import FIELD_TRAINING_ADVOCACY from '@salesforce/schema/PMI_Actual__c.Training_and_Advocacy__c';

import LABEL_ACCOUNT from '@salesforce/label/c.Account'
import LABEL_ACTUALS from '@salesforce/label/c.Actuals';
import LABEL_ACTUAL_QTY from '@salesforce/label/c.Actual_Qty';
import LABEL_ACTUAL_QTY_ERROR from '@salesforce/label/c.Actual_Qty_Error';
import LABEL_ACTUAL_QTY_PLACEHOLDER from '@salesforce/label/c.Actual_Qty_Placeholder';
import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_ERROR from '@salesforce/label/c.Error';
import LABEL_FORM_VALIDATION_ERROR from '@salesforce/label/c.Form_Validation_Error';
import LABEL_HELP from '@salesforce/label/c.help';
import LABEL_LISTING_FEE_PAID from '@salesforce/label/c.Listing_Fee_Paid';
import LABEL_NEXT from '@salesforce/label/c.Next';
import LABEL_NINELITREVOLUME from '@salesforce/label/c.NineLitreVolume';
import LABEL_PAYMENT_DATE from '@salesforce/label/c.Payment_Date';
import LABEL_PAYMENT_DATE_ERROR from '@salesforce/label/c.Payment_Date_Error';
import LABEL_PAYMENT_DATE_PLACEHOLDER from '@salesforce/label/c.Payment_Date_Placeholder';
import LABEL_PLANNED from '@salesforce/label/c.Planned';
import LABEL_PREV from '@salesforce/label/c.PREV';
import LABEL_PROCESSED from '@salesforce/label/c.Processed';
import LABEL_PRODUCT from '@salesforce/label/c.Product';
import LABEL_PROMOTIONAL_ACTIVITY_PAID from '@salesforce/label/c.Promotional_Activity_Paid';
import LABEL_PURCHASED_FROM from '@salesforce/label/c.Purchased_From';
import LABEL_REBATE_AMOUNT_PLACEHOLDER from '@salesforce/label/c.Rebate_Amount_Placeholder';
import LABEL_SAVE from '@salesforce/label/c.Save';
import LABEL_SKIP from '@salesforce/label/c.Skip'
import LABEL_STATUS from '@salesforce/label/c.Status';
import LABEL_TOTAL_DISCOUNT from '@salesforce/label/c.Total_Discount';
import LABEL_TRAINING_ADVOCACY_PAID from '@salesforce/label/c.Training_and_Advocacy_Paid';
import LABEL_WARNING from '@salesforce/label/c.Warning_Title';
 
export default class PromotionalSalesAgreementActualsForm extends NavigationMixin(LightningElement) {
    labels = {
        nineLitreVolume : { label: LABEL_NINELITREVOLUME },
        back         : { label: LABEL_BACK },
        save         : { label: LABEL_SAVE },
        help         : { label: LABEL_HELP },
        actuals      : { label: LABEL_ACTUALS },
        error        : { label: LABEL_ERROR },
        status       : { label: LABEL_STATUS },
        account      : { label: LABEL_ACCOUNT },
        product      : { label: LABEL_PRODUCT },
        actualQty    : { label: LABEL_ACTUAL_QTY, placeholder: LABEL_ACTUAL_QTY_PLACEHOLDER, error: LABEL_ACTUAL_QTY_ERROR },
        paymentDate  : { label: LABEL_PAYMENT_DATE, placeholder: LABEL_PAYMENT_DATE_PLACEHOLDER, error: LABEL_PAYMENT_DATE_ERROR },
        processed    : { label: LABEL_PROCESSED },
        planned      : { label: LABEL_PLANNED },
        purchasedFrom : { label: LABEL_PURCHASED_FROM },
        warning       : { label: LABEL_WARNING },
        validation    : { error: LABEL_FORM_VALIDATION_ERROR },
        skip          : { label: LABEL_SKIP.toLowerCase() },
        prev          : { label: LABEL_PREV.toLowerCase() },
        next          : { label: LABEL_NEXT.toLowerCase() },
        listingFeePaid : { label: LABEL_LISTING_FEE_PAID },
        promotionalActivityPaid: { label: LABEL_PROMOTIONAL_ACTIVITY_PAID },
        trainingAndAdvocacyPaid: { label: LABEL_TRAINING_ADVOCACY_PAID },
        rebateAmount  : { placeholder: LABEL_REBATE_AMOUNT_PLACEHOLDER },
        remaining     : { label: 'remaining' },
        amount        : { label: 'Amount' },
        totalDiscount : { label: LABEL_TOTAL_DISCOUNT }
    };    

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        console.log('[psaactualsform.setcurrentpagereference] pageref', currentPageReference);
        console.log('[psaactualsform.setcurrentpagereference] ids', this.psaId, this.promotionId, this.pmiId, this.pmiaId);
        this.psaId = currentPageReference.state.c__psaId;
        this.promotionId = currentPageReference.state.c__promotionId;
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
            } else {
                console.log('[psaActualsForm.setCurrentPageReference] pmiaId', this.pmiaId);
                this.loadPMIADetails();
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

    @wire(getIsSOMUser)
    isSOMUser;

    @api 
    psaId;

    @api 
    pmiId;

    @api 
    pmiaId;

    @api 
    promotionId;

    @api
    glMappings;


    /*
    @api 
    createNew(promotionId, pmiId, psaId) {
        this.promotionId = promotionId;
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
        this.setRemainingTotals();
    }
    */
    error;
    thePMIA;
    thePMI;
    theAccount;
    isWorking = false;    

    /*
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
                
            this.setRemainingTotals();

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
            this.setRemainingTotals();
        }
    }
    */
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
    totalDiscount;

    rebateType;
    rebateLabel;
    rebateAmount;

    actualQty;
    actualQtyLabel;
    actualQtyPlaceholder;
    hasActualQtyError;
    get actualQtyFormattedLabel() {
        console.log('[actualQtyFormattedLabel] actualqtylabel', this.labels.actualQty.label);
        console.log('[actualQtyFormattedLabel] isPhone', this.isPhone);
        console.log('[actualQtyFormattedLabel] plannedVolume', this.plannedVolume);
        if (this.isPhone) {
            return this.labels.nineLitreVolume.label;
        } else {
            return this.labels.nineLitreVolume.label + ' [' + this.labels.planned.label.toUpperCase() + ' : ' + this.plannedVolume + ']';
        }
    }

    listingFeePaid;
    listingFeeRemaining;
    get listingFeePaidLabel() {
        //return `${this.labels.listingFeePaid.label} [${this.labels.remaining.label}: ${this.listingFeeRemaining}]`;
    }
    promotionalActivityPaid;
    promotionalActivityRemaining;
    get promotionalActivityPaidLabel() {
        //return `${this.labels.promotionalActivityPaid.label} [${this.labels.remaining.label}: ${this.promotionalActivityRemaining}]`;
    }

    trainingAndAdvocacyPaid;
    trainingAndAdvocacyRemaining;
    get trainingAndAdvocacyPaidLabel() {
        //return `${this.labels.trainingAndAdvocacyPaid.label} [${this.labels.remaining.label}: ${this.trainingAndAdvocacyRemaining}]`;
    }

    paymentDate;
    paymentDateLabel;
    paymentDatePlaceholder;
    paymentDateErrorMessage = this.labels.paymentDate.error;
    hasPaymentDateError;
    get formattedPaymentDate() {
        console.log('[actuals.formattedpaymentdate]');
        console.log('[actuals.formattedPaymentDate] paymentDate', this.paymentDate);
        var theDate = this.paymentDate == null ? new Date() : new Date(this.paymentDate);
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
        console.log('[canEdit]');
        //return this.approvalStatus !== 'Paid' && this.approvalStatus !== 'Approved';
        return true;
    }

    get isNew() {
        return this.pmiaId == undefined;
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

   rebates;

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
        console.log('[handleapprovalstatuschange] approvalstatus', this.approvalStatus);
    }
    handleActualQtyChange(event) {
        this.actualQty = event.detail.value;
        console.log('[handleActualQtyChange] actualqty', this.actualQty);
        this.totalDiscount = this.actualQty * this.plannedDiscount;
    }
    handleListingFeeChange(event) {
        this.listingFeePaid = event.detail.value;
    }
    handlePromotionalActivityChange(event) {
        this.promotionalActivityPaid = event.detail.value;
    }
    handleTrainingAndAdvocacyChange(event) {
        this.trainingAndAdvocacyPaid = event.detail.value;
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
    handleRebateAmountChange(event) {
        console.log('[handleRebateAmountChange]');
        event.preventDefault();
        if (this.isNew) {
            const type = event.currentTarget.dataset.rebateType;
            console.log('[handleRebateAmountChange] type: ', type);
            this.rebates.forEach(rebate => {
                if (rebate.rebateType == type) {
                    rebate.rebateAmount = event.detail.value;
                    return true;
                }
            });
            if (type == 'Volume') {
                this.totalDiscount = event.detail.value * this.plannedDiscount;
            }
            console.log('[handleRebateAmountChange] rebates', this.rebates);    
        } else {
            this.rebateAmount = event.detail.value;
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
            if (picklist === 'Rebate_Type__c') {
                this.rebates = picklistValues[picklist].values.map(item => ({
                    rebateType: item.value, 
                    label: item.value + ' [' + this.labels.remaining.label + ' : %0]',
                    isVolumeRebate: item.value == 'Volume', 
                    rebateAmount: 0                    
                }));
            }
        });

        console.log('[setFieldOptions] finished loading field options.  will load the psa');
        this.loadPSA();
        
    }
    
    setFieldOptionsForField(picklistValues, picklist) {        
        console.log('[setFieldOptionsForField] picklist field', picklist);
        return picklistValues[picklist].values.map(item => ({
            label: item.label,
            value: item.value
        }));
    }

    loadPSA() {
        console.log('[loadPSA]');
        getPSA({psaId: this.psaId})
        .then(result => {
            this.error = undefined;
            this.thePSA = result;

            this.wholesalerOptions = [
                { label: this.thePSA.Wholesaler_Preferred_Name__c, value: this.thePSA.Wholesaler_Preferred__c, selected: true },
                { label: this.thePSA.Wholesaler_Alternate_Name__c, value: this.thePSA.Wholesaler_Alternate__c }
            ];
                
            //this.setRemainingTotals();
            console.log('[loadPSA] pmiaId', this.pmiaId);
            if (this.pmiaId == undefined) {                    
                this.createNewActual();
            } else {
                this.loadPMIADetails();
            }

        })
        .catch(error => {
            this.error = error;
            this.thePSA = undefined;
        });
    }
    
    loadPMIADetails() {
        getPMIADetails({pmiaId: this.pmiaId})
        .then(result => {
            this.thePMIA = result;
            this.productName = this.thePMIA.Product_Name__c;
            this.accountName = this.thePMIA.Account_Name__c;
            this.promotionId = this.thePMIA.Promotion__c;
            this.pmiId = this.thePMIA.Promotion_Material_Item__c;
            //this.actualQty = this.thePMIA.Act_Qty__c;
            //this.listingFeePaid = this.thePMIA.Listing_Fee__c;
            //this.promotionalActivityPaid = this.thePMIA.Promotional_Activity__c;
            //this.trainingAndAdvocacyPaid = this.thePMIA.Training_and_Advocacy__c;
            this.paymentDate = this.thePMIA.Payment_Date__c;
            this.approvalStatus = this.thePMIA.Approval_Status__c;
            this.processed = this.thePMIA.Boomi_Processed__c;
            this.processedDate = this.thePMIA.Processed_Date__c;
            this.plannedVolume = this.thePMIA.Promotion_Material_Item__r.Plan_Volume__c;
            this.plannedDiscount = this.thePMIA.Promotion_Material_Item__r.Plan_Rebate__c;
            this.wholesaler = this.thePMIA.Actual_Wholesaler__c;
            this.wholesalerName = this.thePMIA.Actual_Wholesaler__r.Name;
            this.isVolumeRebate = this.thePMIA.Rebate_Type__c == 'Volume';
            this.rebateAmount = this.isVolumeRebate ? this.thePMIA.Act_Qty__c : this.thePMIA.Rebate_Amount__c;
            this.rebateType = this.thePMIA.Rebate_Type__c;    
            
            try {
                let key = this.rebateType.replace('&','and');
                key = key.replace(/ /g,"_");
                const total = this.thePSA['Total_'+key+'__c'] || 0;
                const paid = this.thePSA['Total_'+key+'_Paid__c'] || 0;
                const remaining = total - paid;
                this.rebateLabel = this.rebateType + ' [' + this.labels.remaining.label + ' : ' + remaining + ']';    
            }catch(ex) {
                console.log('[loadPMIADetails] exception', ex);
            }
        })  
        .catch(error => {
            this.error = error;
            this.thePMIA = undefined;
        });    
    }

    setRemainingTotals() {
        /*
        console.log('[actuals.setremainingtotals] psa, pmia', this.thePSA, this.thePMIA);
        if (this.thePSA != undefined) {
            if (this.thePMIA == undefined) {
                const pmi = this.thePSA.Promotion_Material_Items__r.find(pmi => pmi.Id === this.pmiId);
                this.listingFeeRemaining = pmi.Listing_Fee__c - (pmi.Total_Listing_Fee_Paid__c == undefined ? 0 : pmi.Total_Listing_Fee_Paid__c);
                this.promotionalActivityRemaining = pmi.Promotional_Activity_Value__c - (pmi.Total_Promotional_Activity_Paid__c == undefined ? 0 : pmi.Total_Promotional_Activity_Paid__c);
                this.trainingAndAdvocacyRemaining = pmi.Training_and_Advocacy_Value__c - (pmi.Total_Training_and_Advocacy_Paid__c == undefined ? 0 : pmi.Total_Training_and_Advocacy_Paid__c);
            } else {
                const pmi = this.thePSA.Promotion_Material_Item__r.find(pmi => pmi.Id === this.thePMIA.Promotion_Material_Item__c);
                console.log('[actuals.setremainingtotals] p', p);
                if (pmi) {
                    this.listingFeeRemaining = this.thePMIA.Promotion_Material_Item__r.Listing_Fee__c - (pmi.Total_Listing_Fee_Paid__c == undefined ? 0 : pmi.Total_Listing_Fee_Paid__c);
                    this.promotionalActivityRemaining = this.thePMIA.Promotion_Material_Item__r.Promotional_Activity_Value__c - (pmi.Total_Promotional_Activity_Paid__c == undefined ? 0 : pmi.Total_Promotional_Activity_Paid__c);
                    this.trainingAndAdvocacyRemaining = this.thePMIA.Promotion_Material_Item__r.Training_and_Advocacy_Value__c - (pmi.Total_Training_and_Advocacy_Paid__c == undefined ? 0 : pmi.Total_Training_and_Advocacy_Paid__c);
                }    
            }
        }
        */
    }

    createNewActual() {
        console.log('createNewActual.thePSa', this.thePSA);
        this.wholesaler = this.thePSA.Wholesaler_Preferred__c;
        this.wholesalerName = this.thePSA.Wholesaler_Preferred_Name__c;
        
        this.theAccount = this.thePSA.Promotions__r.find(p => p.Id === this.promotionId);
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

        this.approvalStatus = 'Paid';
        this.paymentDate = new Date();
        this.actualQty = 0;
        this.listingFeePaid = 0;
        this.promotionalActivityPaid = 0;
        this.trainingAndAdvocacyPaid = 0;
        console.log('[ccreatenewactuals] rebates', this.rebates);
        if (this.rebates) {
            try {
                this.rebates.forEach(rebate => {
                    rebate.rebateAmount = 0;
                    let key = rebate.rebateType.replace("&", "and");
                    key = key.replace(/ /g, "_");
                    console.log('[createnewactuals] key', key);
                    let total = this.thePSA["Total_"+key+"__c"] || 0;
                    let paid = this.thePSA["Total_"+key+"_Paid__c"] || 0;
                    let remaining = total - paid;
                    console.log('[createnewactuals] total, paid', total, paid);
                    rebate.label = rebate.label.replace("%0", remaining);
                    console.log('rebatelabel', rebate.label);
                    /*
                    if (rebate.rebateType == 'Listing Fee') {
                        remaining = this.thePSA.Total_Listing_Fee__c - this.thePSA.Total_Listing_Fee_Paid__c;
                        rebate.label = rebate.label.replace('%0', remaining);
                    } else if (rebate.rebateType == 'Promotional Activity')
                    */
                });    
                console.log('rebates', this.rebates);
    
            }catch(ex) {
                console.log('[createnewactuals] exception', ex);
            }
        }
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
        console.log('[validateform]');
        let isValid = true;
        this.hasPaymentDateError = false;
        this.hasActualQtyError = false;

        //this.hasActualQtyError = (this.actualQty == undefined || this.actualQty == 0);
        this.hasPaymentDateError = (this.paymentDate == undefined);

        if (this.hasActualQtyError || this.hasPaymentDateError) { isValid = false; }
        return isValid;
    }

    save() {   
        console.log('[save]');   
        try {
            const pd = new Date(this.paymentDate);
            const paymentDateYear = pd.getFullYear().toString();
            const paymentDateMonth = ('00' + (pd.getMonth()+1)).slice(-2);
            const paymentDateDay = ('00' + pd.getDate()).slice(-2);
            console.log('[psaactualform.save] date parts', paymentDateYear, paymentDateMonth, paymentDateDay);          

            const fields = {};
            
            fields[FIELD_APPROVAL_STATUS.fieldApiName] = this.approvalStatus;
            fields[FIELD_ACTUAL_WHOLESALER.fieldApiName] = this.wholesaler;
            fields[FIELD_PAYMENT_DATE.fieldApiName] = paymentDateYear + '-' + paymentDateMonth + '-' + paymentDateDay;


            if (this.pmiaId === undefined) {
                fields['RecordTypeId'] = this.recordTypeId;
                fields[FIELD_PROMOTION_ID.fieldApiName] = this.promotionId;
                if (this.pmiId == undefined && this.pmiRecords != null && this.pmiRecords.length > 0) {
                    fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName] = this.pmiRecords[this.pmiIndex].Id;
                } else {
                    fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName] = this.pmiId;
                }

                console.log('[psaactualform.save] paymentDate, pd', this.paymentDate, pd);  
                const dateString = paymentDateYear + paymentDateMonth + paymentDateDay;
                console.log('[psaactualform.save] dateString', dateString);
                const externalKey = this.promotionId + '_' + fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName] + '_' + dateString;
                console.log('[psaactualform.save] externalKey', externalKey);
                fields[FIELD_EXTERNAL_KEY.fieldApiName] = externalKey;
                fields[FIELD_PERIOD.fieldApiName] = 0;
                fields[FIELD_ACTIVITY_ID.fieldApiName] = this.psaId;
                const record = { apiName: OBJECT_PMIA.objectApiName, fields };
                this.createNewPMIA(record);
            } else {
                fields[FIELD_ID.fieldApiName] = this.pmiaId;
                fields[FIELD_REBATE_AMOUNT.fieldApiName] = this.rebateAmount;                
                if (this.rebateType == 'Volume') {
                    fields[FIELD_ACTUAL_QTY.fieldApiName] = this.rebateAmount;
                    fields[FIELD_REBATE_AMOUNT.fieldApiName] = this.rebateAmount * this.plannedDiscount;
                }
                console.log('[save] rebateAmount', this.rebateAmount);
                console.log('[save] fields', fields);
                const record = { fields };
                this.updatePMIA(record);
            }
        } catch(ex) {
            console.log('[psaactualsform.save] exception', ex);
        }
    }


    createNewPMIA(record) {        
        console.log('[pmiaForm.createNewPMIA] record', record);
        console.log('[pmiaForm.createNewPMIA] glMappings', this.glMappings);
        const pmiId = record.fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName];
        this.rebates.forEach(r => {
            r.plannedRebate = this.plannedDiscount;            
            if (this.glMappings != undefined) {
                const glMapping = this.glMappings.find(gl => gl.Classification__c == r.rebateType);
                console.log('[pmiaform.createNewPMIA] glmapping', glMapping);
                r.glAccount = glMapping == null ? '' : glMapping.SoldTo_Code__c;    
            }
            if (this.thePSA.PMI_Actuals__r == undefined || this.thePSA.PMI_Actuals__r.length == 0) {
                r.hasTotals = true;
            } else {                
                const pmia = this.thePSA.PMI_Actuals__r.filter(pmia => pmia.Promotion_Material_Item__c == pmiId && pmia.Rebate_Type__c == r.rebateType);
                console.log('[pmiaForm.createNewPMIA] rebateType, pmiId, pmia', r.rebateType, pmiId, pmia);
                //r.hasTotals = pmia == null;
                if (pmia == null || pmia.length == 0) {
                    r.hasTotals = true;
                    r.externalKey = pmiId + '-' + r.rebateType;
                } else {
                    r.hasTotals = false;
                    r.externalKey = pmiId + '-' + r.rebateType + '-' + pmia.length;
                }
            }
        });
        console.log('[pmiaForm.createNewPMIA] rebates', this.rebates);
        console.log(']pmiaForm.createNewPMIA] record', record);
        createActuals({psaId: this.psaId, 
                            recordTypeId: this.recordTypeId, 
                            promotionId: record.fields[FIELD_PROMOTION_ID.fieldApiName],
                            pmiId: record.fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName],
                            wholesalerId: record.fields[FIELD_ACTUAL_WHOLESALER.fieldApiName],
                            paymentDate: record.fields[FIELD_PAYMENT_DATE.fieldApiName],
                            externalKey: record.fields[FIELD_EXTERNAL_KEY.fieldApiName],
                            rebates: this.rebates })
            .then(result => {
                console.log('[createnewpmia.createactuals] result', result);
                this.isWorking = false;
                this.updateTotals();

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
                        detail: result
                    });
                    this.dispatchEvent(saveEvent);
                    this[NavigationMixin.Navigate](this.getUpdatedPageReference({
                        c__psaId: this.psaId
                    }), true);
                }

            })
            .catch(error => {
                console.log('[createnewpmia.createactuals] exception', error);
                let msg = '';
                if (error.body.fieldErrors && error.body.fieldErrors.length > 0) {
                    error.body.fieldErrors.forEach(err => { msg += err.message + '\n'; });                    
                }
                if (error.body.pageErrors && error.body.pageErrors.length > 0) {
                    error.body.pageErrors.forEach(err => { msg += err.message + '\n'; });
                }
                this .dispatchEvent(
                    new ShowToastEvent({
                        title: this.labels.error.label,
                        message: msg,
                        variant: 'error'
                    })
                );
            });
        /*
        createRecord(record)
            .then(pmiaItem => {
                console.log('[pmiaForm.createRecord] pmiaItem', pmiaItem);
                this.isWorking = false;
                this.pmiaId = pmiaItem.id;

                this.updateTotals();

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
        */
    }
    updatePMIA(record) {
        console.log('[pmiaForm.update] record', record);
        updateRecord(record)
            .then(() => {
                
                this.isWorking = false;

                this.updateTotals();

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Actuals updated successfully',
                        variant: 'success'
                    }),
                );

                try {
                if (!this.isPhone) {
                    refreshApex(this.wiredPMIActual);
                    const saveEvent = new CustomEvent('save', {
                        detail: record
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

    updateTotals() {
        updateActualTotals({psaId: this.psaId})
            .then((status) => {
                console.log('[updateTotals] status', status);
            })
            .catch((error) => {
                console.log('[updateTotals] error', error);
            });
    }
}