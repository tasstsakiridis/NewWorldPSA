import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { createRecord, updateRecord, getRecordNotifyChange } from 'lightning/uiRecordApi';
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
import FIELD_ACTIVITY_NAME from '@salesforce/schema/PMI_Actual__c.Activity_Name__c';
import FIELD_ACTUAL_QTY from '@salesforce/schema/PMI_Actual__c.Act_Qty__c';
import FIELD_ACTUAL_WHOLESALER from '@salesforce/schema/PMI_Actual__c.Actual_Wholesaler__c';
import FIELD_APPROVAL_STATUS from '@salesforce/schema/PMI_Actual__c.Approval_Status__c';
import FIELD_COMMENTS from '@salesforce/schema/PMI_Actual__c.Comments__c';
import FIELD_EXTERNAL_KEY from '@salesforce/schema/PMI_Actual__c.External_Key__c';
import FIELD_INVOICE_NUMBER from '@salesforce/schema/PMI_Actual__c.Invoice_Number__c';
import FIELD_LISTING_FEE from '@salesforce/schema/PMI_Actual__c.Listing_Fee__c';
import FIELD_PAYMENT_DATE from '@salesforce/schema/PMI_Actual__c.Payment_Date__c';
import FIELD_PERIOD from '@salesforce/schema/PMI_Actual__c.Period__c';
import FIELD_PROMOTION_ID from '@salesforce/schema/PMI_Actual__c.Promotion__c';
import FIELD_PROMOTION_MATERIAL_ITEM_ID from '@salesforce/schema/PMI_Actual__c.Promotion_Material_Item__c';
import FIELD_PROMOTIONAL_ACTIVITY from '@salesforce/schema/PMI_Actual__c.Promotional_Activity__c';
import FIELD_REBATE_AMOUNT from '@salesforce/schema/PMI_Actual__c.Rebate_Amount__c';
import FIELD_TRAINING_ADVOCACY from '@salesforce/schema/PMI_Actual__c.Training_and_Advocacy__c';

import LABEL_ACCOUNT from '@salesforce/label/c.Account'
import LABEL_ACTUALS from '@salesforce/label/c.Actuals';
import LABEL_ACTUAL_QTY from '@salesforce/label/c.Actual_Qty';
import LABEL_ACTUAL_QTY_ERROR from '@salesforce/label/c.Actual_Qty_Error';
import LABEL_ACTUAL_QTY_PLACEHOLDER from '@salesforce/label/c.Actual_Qty_Placeholder';
import LABEL_AMOUNT from '@salesforce/label/c.Amount';
import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_COMMENTS from '@salesforce/label/c.Comments';
import LABEL_COMMENTS_TOOLONGMSG from '@salesforce/label/c.Too_Many_Characters';
import LABEL_ERROR from '@salesforce/label/c.Error';
import LABEL_FREE_GOODS from '@salesforce/label/c.Free_Goods';
import LABEL_FORM_VALIDATION_ERROR from '@salesforce/label/c.Form_Validation_Error';
import LABEL_HELP from '@salesforce/label/c.Help';
import LABEL_INVALID_INPUT_ERROR from '@salesforce/label/c.Invalid_Input_Error';
import LABEL_INVOICE_NUMBER from '@salesforce/label/c.Invoice_Number';
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
import LABEL_REBATE_AMOUNT_ABOVE_PLANNED_ERROR from '@salesforce/label/c.Rebate_Amount_Above_Planned_Error';
import LABEL_REBATE_AMOUNT_PLACEHOLDER from '@salesforce/label/c.Rebate_Amount_Placeholder';
import LABEL_REMAINING from '@salesforce/label/c.Remaining';
import LABEL_SAVE from '@salesforce/label/c.Save';
import LABEL_SKIP from '@salesforce/label/c.Skip'
import LABEL_STATUS from '@salesforce/label/c.Status';
import LABEL_TOTAL_DISCOUNT from '@salesforce/label/c.Total_Discount';
import LABEL_TRAINING_ADVOCACY_PAID from '@salesforce/label/c.Training_and_Advocacy_Paid';
import LABEL_VOLUME_FORECAST_BTL from '@salesforce/label/c.VolumeBottle';
import LABEL_WARNING from '@salesforce/label/c.Warning_Title';
 
export default class PromotionalSalesAgreementActualsForm extends NavigationMixin(LightningElement) {
    labels = {
        account                 : { label: LABEL_ACCOUNT },
        actualQty               : { label: LABEL_ACTUAL_QTY, placeholder: LABEL_ACTUAL_QTY_PLACEHOLDER, error: LABEL_ACTUAL_QTY_ERROR },
        actuals                 : { label: LABEL_ACTUALS },
        amount                  : { label: LABEL_AMOUNT },
        back                    : { label: LABEL_BACK },
        comments                : { label: LABEL_COMMENTS, tooLongMsg: LABEL_COMMENTS_TOOLONGMSG.replace('{0}', '1024') },
        error                   : { label: LABEL_ERROR },
        freeGoods               : { label: LABEL_FREE_GOODS },
        help                    : { label: LABEL_HELP },
        invoice                 : { label: LABEL_INVOICE_NUMBER },
        listingFeePaid          : { label: LABEL_LISTING_FEE_PAID },
        next                    : { label: LABEL_NEXT.toLowerCase() },
        nineLitreVolume         : { label: LABEL_NINELITREVOLUME },
        paymentDate             : { label: LABEL_PAYMENT_DATE, placeholder: LABEL_PAYMENT_DATE_PLACEHOLDER, error: LABEL_PAYMENT_DATE_ERROR },
        planned                 : { label: LABEL_PLANNED },
        prev                    : { label: LABEL_PREV.toLowerCase() },
        processed               : { label: LABEL_PROCESSED },
        product                 : { label: LABEL_PRODUCT },
        promotionalActivityPaid : { label: LABEL_PROMOTIONAL_ACTIVITY_PAID },
        purchasedFrom           : { label: LABEL_PURCHASED_FROM },
        rebateAmount            : { placeholder: LABEL_REBATE_AMOUNT_PLACEHOLDER },
        rebatePaidAbovePlanned  : { error: LABEL_REBATE_AMOUNT_ABOVE_PLANNED_ERROR },
        remaining               : { label: LABEL_REMAINING },
        save                    : { label: LABEL_SAVE },
        skip                    : { label: LABEL_SKIP.toLowerCase() },
        status                  : { label: LABEL_STATUS },
        totalDiscount           : { label: LABEL_TOTAL_DISCOUNT },
        trainingAndAdvocacyPaid : { label: LABEL_TRAINING_ADVOCACY_PAID },
        validation              : { error: LABEL_FORM_VALIDATION_ERROR },
        volumeBtl               : { label: LABEL_VOLUME_FORECAST_BTL, error: LABEL_INVALID_INPUT_ERROR.replace('%0', LABEL_VOLUME_FORECAST_BTL) },        
        warning                 : { label: LABEL_WARNING },
    };    

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        console.log('[psaactualsform.setcurrentpagereference] pageref', currentPageReference);
        console.log('[psaactualsform.setcurrentpagereference] ids', this.psaId, this.promotionId, this.pmiId, this.pmiaId);
        console.log('[psaactualsform.setcurrentpagereference] psa', this.psa);
        this.psaId = currentPageReference.state.c__psaId;
        this.promotionId = currentPageReference.state.c__promotionId;
        this.pmiId = currentPageReference.state.c__pmiId;

        if (this.pmiaId == currentPageReference.state.c__pmiaId) {
            refreshApex(this.wiredPMIActual);
        } else {
            this.pmiaId = currentPageReference.state.c__pmiaId;
            this.loadPMIADetails();
        }
        /*
        if (this.psa != undefined) {
            if (this.pmiaId == undefined) {
                //this.createNewActual();
            } else {
                this.loadPMIADetails();
            }  
        }
        */
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
    psa;

    @api 
    pmiId;

    @api 
    pmiaId;

    @api 
    promotionId;

    @api
    glMappings;

    @api 
    wholesalerOptions;

    @api 
    captureVolumeInBottles;

    @api 
    captureFreeGoods;

    @api 
    isLocked;

    error;
    thePMIA;
    thePMI;
    theAccount;
    isWorking = false;    

    showTotalDiscount = true;

    productName;
    productLabel;

    accountName;
    accountLabel;
    
    wholesaler;

    plannedDiscount;
    plannedVolume;
    totalActualVolume;
    totalDiscount;
    activityBudget;
    comments;
    invoiceNumber;

    rebateType;
    rebateLabel;
    rebateAmount;
    remainingRebate;

    actualQty;
    actualQtyLabel;
    actualQtyPlaceholder;
    hasActualQtyError;
    get actualQtyFormattedLabel() {
        console.log('[actualQtyFormattedLabel] actualqtylabel', this.labels.actualQty.label);
        console.log('[actualQtyFormattedLabel] isPhone', this.isPhone);
        console.log('[actualQtyFormattedLabel] plannedVolume', this.plannedVolume);
        console.log('[actualQtyFormattedLabel] captureVolumeInBottles', this.captureVolumeInBottles);
        let lbl = this.labels.nineLitreVolume.label;
        if (this.captureVolumeInBottles) {
            lbl = this.labels.volumeBtl.label;
        }

        if (!this.isPhone) {
            lbl += ' [' + this.labels.planned.label.toUpperCase() + ' : ' + this.plannedVolume + ']';
        }

        return lbl;
    }

    freeGoodsQty;
    totalActualFreeGoodsQty;

    listingFeePlanned;
    listingFeePaid;
    listingFeeRemaining;
    totalListingFeePaid;

    promotionalActivityPlanned;
    promotionalActivityPaid;
    promotionalActivityRemaining;
    totalPromotionalActivityPaid;

    trainingAndAdvocacyPlanned;
    trainingAndAdvocacyPaid;
    trainingAndAdvocacyRemaining;
    totalTrainingAndAdvocacyPaid;

    productSplit;
    totalPaymentsPaid;

    paymentDate;
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

    approvalStatus;
    approvalStatusOptions;
    get canEdit() {

        console.log('[actualsForm.canEdit] isLocked', this.isLocked);
        //return this.approvalStatus !== 'Paid' && this.approvalStatus !== 'Approved';
        return !this.isLocked;
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

    get productPackQty() {
        if (this.thePMI != undefined && this.thePMI.Product_Pack_Qty__c != undefined) {
            return this.thePMI.Product_Pack_Qty__c;
        } else if (this.thePMIA != undefined && this.thePMIA.Product_Pack_Qty__c != undefined) {
            return this.thePMIA.Product_Pack_Qty__c;
        } else {
            return 1;
        }
    }

    get captureInvoice() {
        return this.psa != undefined && this.psa.Market__r.Name == 'Mexico';
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
    handlePaymentDateChange(event) {
        this.paymentDate = new Date(event.detail.value);
    }
    handleWholesalerChange(event) {
        this.wholesaler = event.detail.value;
        if (this.wholesaler === this.psa.Wholesaler_Preferred__c) {
            this.wholesalerName = this.psa.Wholesaler_Preferred_Name__c;
        } else {
            this.wholesalerName = this.psa.Wholesaler_Alternate_Name__c;
        }
    }
    handleInvoiceNumberChange(event) {
        this.invoiceNumber = event.detail.value;
    }
    handleRebateAmountChange(event) {
        console.log('[handleRebateAmountChange]');
        event.preventDefault();
        if (this.isNew) {
            const type = event.currentTarget.dataset.rebateType;
            console.log('[handleRebateAmountChange] type: ', type);
            this.rebates.forEach(rebate => {
                console.log('[handleRebateAmountChange] rebate.rebateType, remaining', rebate.rebateType, rebate.remaining);
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
    handleCommentsChange(event) {
        this.comments = event.detail.value;
    }

    /**
     * Helper functions
     */
    getRecordTypeId() {
        if (this.objectInfo.recordTypeInfos) {
            console.log('[get recordtypeid] objectinfo', this.objectInfo);
            const rtis = this.objectInfo.recordTypeInfos;
            console.log('[get recordtypeid] rtis', rtis);
            if (this.psa.Market__r.Name == 'United Kingdom') {
                this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'UK - PSA');
            } else if (this.psa.Market__r.Name == 'Brazil') {
                this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'BRA - PSA');
            } else if (this.psa.Market__r.Name == 'Mexico') {
                this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'MX - PSA');
            }
            console.log('[get recordtypeid] rtis', Object.keys(rtis));
            console.log('[get recordtypeid] recordtypeid', this.recordTypeId);
        }    
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
                    isFreeGoods:  item.value == 'Free Goods',
                    rebateAmount: 0,
                    remaining: 0                   
                }));
            }
        });

        console.log('[setFieldOptions] finished loading field options.  pmiaId', this.pmiaId);
        //this.loadPSA();

        if (this.pmiaId == undefined) {
            this.createNewActual();
        //} else {
        //    this.loadPMIADetails();
        }
    }
    
    setFieldOptionsForField(picklistValues, picklist) {        
        console.log('[setFieldOptionsForField] picklist field', picklist);
        return picklistValues[picklist].values.map(item => ({
            label: item.label,
            value: item.value
        }));
    }

    /*
    loadPSA() {
        console.log('[loadPSA]');
        getPSA({psaId: this.psaId})
        .then(result => {
            this.error = undefined;
            this.thePSA = result;
            console.log('[loadPSA] thePSA', this.thePSA);
            this.wholesalerOptions = [
                { label: this.thePSA.Wholesaler_Preferred_Name__c, value: this.thePSA.Wholesaler_Preferred__c, selected: true }    
            ];
            if (this.thePSA.Wholesaler_Alternate__c != undefined) {
                this.wholesalerOptions.push({ label: this.thePSA.Wholesaler_Alternate_Name__c, value: this.thePSA.Wholesaler_Alternate__c });
            }
                
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
    */
   
    loadPMIADetails() {
        getPMIADetails({pmiaId: this.pmiaId})
        .then(result => { 
            console.log('[pmiaForm.loadPMIADetails] result', result);
            try {
                this.thePMIA = result;
                this.productName = this.thePMIA.Product_Name__c;
                this.accountName = this.thePMIA.Account_Name__c;
                this.promotionId = this.thePMIA.Promotion__c;
                this.pmiId = this.thePMIA.Promotion_Material_Item__c;
                this.paymentDate = this.thePMIA.Payment_Date__c;
                this.approvalStatus = this.thePMIA.Approval_Status__c;
                this.processed = this.thePMIA.Boomi_Processed__c;
                this.comments = this.thePMIA.Comments__c;
                this.processedDate = this.thePMIA.Processed_Date__c;
                this.plannedVolume = parseFloat(this.thePMIA.Promotion_Material_Item__r.Plan_Volume__c);
                this.plannedDiscount = parseFloat(this.thePMIA.Promotion_Material_Item__r.Plan_Rebate__c);
                //this.productPackQty = parseInt(this.thePMIA.Product_Pack_Qty__c);
                this.wholesaler = this.thePMIA.Actual_Wholesaler__c;
                this.wholesalerName = this.thePMIA.Actual_Wholesaler__c == undefined ? '' : this.thePMIA.Actual_Wholesaler__r.Name;
                this.isVolumeRebate = this.thePMIA.Rebate_Type__c == 'Volume';
                this.isFreeGoodsRebate = this.thePMIA.Rebate_Type__c == 'Free Goods';
                this.rebateAmount = this.isVolumeRebate ? parseFloat(this.thePMIA.Act_Qty__c) : parseFloat(this.thePMIA.Rebate_Amount__c);
                this.rebateType = this.thePMIA.Rebate_Type__c;    
                this.totalActualVolume = parseFloat(this.thePMIA.Promotion_Material_Item__r.Total_Actual_Volume__c);            
                this.listingFeePlanned = parseFloat(this.thePMIA.Promotion_Material_Item__r.Listing_Fee__c);
                this.listingFeePaid = parseFloat(this.thePMIA.Promotion_Material_Item__r.Total_Listing_Fee_Paid__c);
                this.promotionalActivityPlanned = parseFloat(this.thePMIA.Promotion_Material_Item__r.Promotional_Activity_Value__c);
                this.promotionalActivityPaid = parseFloat(this.thePMIA.Promotion_Material_Item__r.Total_Promotional_Activity_Paid__c);
                this.trainingAndAdvocacyPlanned = parseFloat(this.thePMIA.Promotion_Material_Item__r.Training_and_Advocacy_Value__c);
                this.trainingAndAdvocacyPaid = parseFloat(this.thePMIA.Promotion_Material_Item__r.Total_Training_and_Advocacy_Paid__c);
                this.activityBudget = parseFloat(this.thePMIA.Activity__r.Activity_Budget__c);
                this.totalPaymentsPaid = parseFloat(this.thePMIA.Promotion_Material_Item__r.Total_Payments_Paid__c).toFixed(2);
                this.productSplit = parseFloat(this.thePMIA.Promotion_Material_Item__r.Product_Split__c).toFixed(2);
                this.invoiceNumber = this.thePMIA.Invoice_Number__c;

                console.log('[loadPMIADetails] captureVolumeInBottles', this.captureVolumeInBottles);
                console.log('[loadPMIADetails] thePMI', this.thePMI);
                this.plannedVolume = this.thePMIA.Promotion_Material_Item__r.Plan_Volume__c || 0;
                this.freeGoodsQty = this.thePMIA.Promotion_Material_Item__r.Free_Bottle_Quantity__c || 0;
                this.listingFeePlanned = this.thePMIA.Promotion_Material_Item__r.Listing_Fee__c || 0;
                this.promotionalActivityPlanned = this.thePMIA.Promotion_Material_Item__r.Promotional_Activity_Value__c || 0;
                this.trainingAndAdvocacyPlanned = this.thePMIA.Promotion_Material_Item__r.Training_and_Advocacy_Value__c || 0;
                this.totalActualVolume = this.thePMIA.Promotion_Material_Item__r.Total_Actual_Volume__c || 0;
                this.totalActualFreeGoodsQty = this.thePMIA.Promotion_Material_Item__r.Total_Actual_Free_Bottle_Qty__c || 0;
                this.listingFeePaid = this.thePMIA.Promotion_Material_Item__r.Total_Listing_Fee_Paid__c || 0;
                this.promotionalActivityPaid = this.thePMIA.Promotion_Material_Item__r.Total_Promotional_Activity_Paid__c || 0;
                this.trainingAndAdvocacyPaid = this.thePMIA.Promotion_Material_Item__r.Total_Training_and_Advocacy_Paid__c || 0;

                if (this.captureVolumeInBottles) {
                    if (this.isVolumeRebate) {
                        this.rebateAmount = this.rebateAmount * this.productPackQty;
                    }
                    this.plannedVolume = this.plannedVolume * this.productPackQty;
                    //this.freeGoodsQty = this.freeGoodsQty * this.productPackQty;
                    this.totalActualVolume = this.totalActualVolume * this.productPackQty;
                    //this.totalActualFreeGoodsQty = this.totalActualFreeGoodsQty * this.productPackQty;
                }

                console.log('[loadPMIADetails] freeGoodsQty', this.freeGoodsQty);
                console.log('[loadPMIADetails] totalActualFreeGoodsQty', this.totalActualFreeGoodsQty);

                this.remainingRebate = 0;
                if (this.rebateType == 'Volume') {
                    this.remainingRebate = this.plannedVolume - this.totalActualVolume;
                } else if (this.rebateType == 'Free Goods') {
                    this.remainingRebate = this.freeGoodsQty - this.totalActualFreeGoodsQty;
                    if (this.remainingRebate < 0) { this.remainingRebate = 0; }
                } else if (this.rebateType == 'Listing Fee') {
                    this.remainingRebate = this.listingFeePlanned - this.listingFeePaid;
                } else if (this.rebateType == 'Promotional Activity') {
                    this.remainingRebate = this.promotionalActivityPlanned - this.promotionalActivityPaid;
                } else if (this.rebateType == 'Training & Advocacy') {
                    this.remainingRebate = this.trainingAndAdvocacyPlanned - this.trainingAndAdvocacyPaid;
                } else if (this.rebateType == 'Payment') {
                    this.remainingRebate = this.productSplit - this.totalPaymentsPaid;      
                    console.log('remainingRebate, activityBudget, totalPaymentsPaid', this.remainingRebate, this.productSplit, this.totalPaymentsPaid);              
                }
                this.rebateLabel = this.rebateType + ' [' + this.labels.remaining.label + ' : ' + this.remainingRebate.toFixed(2) + ']';    
                if (this.rebates != undefined) {
                    const rebate = this.rebates.find(r => r.rebateType == this.rebateType);
                    if (rebate) {
                        rebate.remaining = this.remainingRebate;
                    }    
                }
            }catch(ex) {
                console.log('[loadPMIADetails] exception', ex);
            }
        })  
        .catch(error => {
            this.error = error;
            this.thePMIA = undefined;
        });    
    }


    createNewActual() {
        try {
        console.log('createNewActual.psa', this.psa);
        console.log('createNewActual.wholesalerOptions', this.wholesalerOptions);
        this.wholesaler = this.psa.Wholesaler_Preferred__c;
        this.wholesalerName = this.psa.Wholesaler_Preferred_Name__c || '';
        this.activityBudget = parseFloat(this.psa.Activity_Budget__c || 0);

        this.theAccount = this.psa.Promotions__r.find(p => p.Id === this.promotionId);
        if (this.theAccount) {
            this.accountName = this.theAccount.AccountName__c;
        }

        this.thePMI = this.psa.Promotion_Material_Items__r.find(p => p.Id === this.pmiId);
        console.log('[createnewactuals] thePMI', this.thePMI);
        if (this.thePMI) {
            this.productName = this.thePMI.Product_Name__c;
            this.plannedDiscount = parseFloat(this.thePMI.Plan_Rebate__c);
            this.plannedVolume = parseFloat(this.thePMI.Plan_Volume__c);
            this.totalActualVolume = parseFloat(this.thePMI.Total_Actual_Volume__c || 0);
            this.listingFeePlanned = parseFloat(this.thePMI.Listing_Fee__c);
            this.totalListingFeePaid = parseFloat(this.thePMI.Total_Listing_Fee_Paid__c || 0);
            this.promotionalActivityPlanned = parseFloat(this.thePMI.Promotional_Activity_Value__c || 0);
            this.totalPromotionalActivityPaid = parseFloat(this.thePMI.Total_Promotional_Activity_Paid__c || 0);
            this.trainingAndAdvocacyPlanned = parseFloat(this.thePMI.Training_and_Advocacy_Value__c || 0);
            this.totalTrainingAndAdvocacyPaid = parseFloat(this.thePMI.Total_Training_and_Advocacy_Paid__c || 0);
            this.totalPaymentsPaid = parseFloat(this.thePMI.Total_Payments_Paid__c || 0).toFixed(2);
            this.productSplit = parseFloat(this.thePMI.Product_Split__c || 0).toFixed(2);
            this.freeGoodsQty = parseFloat(this.thePMI.Free_Bottle_Quantity__c || 0);
            this.totalActualFreeGoodsQty = parseFloat(this.thePMI.Total_Actual_Free_Bottle_Qty__c || 0);

            if (this.captureVolumeInBottles) {
                this.plannedVolume = this.plannedVolume * this.productPackQty;
                this.totalActualVolume = this.totalActualVolume * this.productPackQty;
            }
        }    

        this.approvalStatus = this.psa.Market__r.Name == 'Mexico' ? 'New' : 'Paid';
        this.paymentDate = new Date();
        this.actualQty = 0;
        this.listingFeePaid = 0;
        this.promotionalActivityPaid = 0;
        this.trainingAndAdvocacyPaid = 0;
        this.invoiceNumber = '';
        
        console.log('[ccreatenewactuals] rebates', this.rebates);
        if (this.rebates) {
            try {
                this.rebates.forEach(rebate => {
                    rebate.rebateAmount = 0;
                    if (rebate.rebateType == 'Volume') {
                        rebate.remaining = this.plannedVolume - this.totalActualVolume;
                    } else if (rebate.rebateType == 'Free Goods') {
                        rebate.remaining = this.freeGoodsQty - this.totalActualFreeGoodsQty;
                    } else if (rebate.rebateType == 'Listing Fee') {
                        rebate.remaining = this.listingFeePlanned - this.totalListingFeePaid;
                    } else if (rebate.rebateType == 'Promotional Activity') {
                        rebate.remaining = this.promotionalActivityPlanned - this.totalPromotionalActivityPaid;
                    } else if (rebate.rebateType == 'Training & Advocacy') {
                        rebate.remaining = this.trainingAndAdvocacyPlanned - this.totalTrainingAndAdvocacyPaid;
                    } else if (rebate.rebateType == 'Payment') {
                        rebate.remaining = this.productSplit - this.totalPaymentsPaid;
                    }
                    rebate.label = rebate.label.replace("%0", rebate.remaining);
                    console.log('rebatelabel', rebate.label);
                });    
                console.log('rebates', this.rebates);
    
            }catch(rex) {
                console.log('[createnewactuals] rebates exception', rex);
            }
        }
        }catch(ex) {
            console.log('[createnewactuals] exception', ex);
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

        let hasRebateError = false;
        if (this.isNew) {
            console.log('[validateform] rebates', this.rebates);
            this.rebates.forEach(rebate => {
                if (rebate.remaining < parseFloat(rebate.rebateAmount)) {
                    hasRebateError = true;
                    return true;                                      
                }                        
            });
        } else {
            console.log('[validateForm] rebateType, rebateAmount, remainingRebate', this.rebateType, this.rebateAmount, this.remainingRebate);
            let total = 0;
            if (this.rebateType == 'Volume') {
                total = this.remainingRebate + this.totalActualVolume;
                hasRebateError = parseFloat(this.rebateAmount) > total;
                console.log('[validateForm] rebateAmount, remainingRebate, totalActualVolume, total', parseFloat(this.rebateAmount), this.remainingRebate, this.totalActualVolume, total);
            } else if (this.rebateType == 'Free Goods') {
                total = this.remainingFreeGoods + this.totalActualFreeGoodsQty;
                hasRebateError = parseFloat(this.rebateAmount) > total;
                console.log('[validateForm] rebateAmount, remainingRebate, totalActualVolume, total', parseFloat(this.rebateAmount), this.remainingRebate, this.totalActualFreeGoodsQty, total);
            } else if (this.rebateType == 'Listing Fee') {
                total = this.remainingRebate + this.totalListingFeePaid;
                hasRebateError = parseFloat(this.rebateAmount) > total;
                console.log('[validateForm] rebateAmount, remainingRebate, totalListingFeePaid', this.rebateAmount, this.remainingRebate, this.totalListingFeePaid, total);
            } else if (this.rebateType == 'Promotional Activity') {
                total = this.remainingRebate + this.totalPromotionalActivityPaid;
                hasRebateError = parseFloat(this.rebateAmount) > total;
                console.log('[validateForm] rebateAmount, remainingRebate, totalPromotionalActivityPaid', this.rebateAmount, this.remainingRebate, this.totalPromotionalActivityPaid, total);
            } else if (this.rebateType == 'Training & Advocacy') {
                total = this.remainingRebate + this.totalTrainingAndAdvocacyPaid;
                hasRebateError = parseFloat(this.rebateAmount) > total;
                console.log('[validateForm] rebateAmount, remainingRebate, totalTrainingAndAdvocacyPaid', this.rebateAmount, this.remainingRebate, this.totalTrainingAndAdvocacyPaid, total);
            } else if (this.rebateType == 'Payment') {
                total = this.remainingRebate + this.totalPayments;
            }

        }
        if (hasRebateError) {
            isValid = false;
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error',
                    message: this.labels.rebatePaidAbovePlanned.error,
                    variant: 'error' 
                }),
            );  
        }

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
            fields[FIELD_COMMENTS.fieldApiName] = this.comments;
            fields[FIELD_INVOICE_NUMBER.fieldApiName] = this.invoiceNumber;

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
                    let actQty = this.rebateAmount;
                    if (this.captureVolumeInBottles) {
                        actQty = this.rebateAmount / this.productPackQty;
                    }
                    fields[FIELD_ACTUAL_QTY.fieldApiName] = actQty;
                    fields[FIELD_REBATE_AMOUNT.fieldApiName] = this.rebateAmount * this.plannedDiscount;
                }
                if (this.rebateType == 'Free Goods') {
                    fields[FIELD_REBATE_AMOUNT.fieldApiName] = this.rebateAmount;
                    if (this.captureVolumeInBottles) {
                        fields[FIELD_REBATE_AMOUNT.fieldApiName] = this.rebateAmount / this.productPackQty;
                    }
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
        const promotionId = record.fields[FIELD_PROMOTION_ID.fieldApiName];
        this.rebates.forEach(r => {
            r.plannedRebate = this.plannedDiscount;            
            if (this.glMappings != undefined) {
                const glMapping = this.glMappings.find(gl => gl.Classification__c == r.rebateType);
                console.log('[pmiaform.createNewPMIA] glmapping', glMapping);
                r.glAccount = glMapping == null ? '' : glMapping.SoldTo_Code__c;    
            }
            if (this.psa.PMI_Actuals__r == undefined || this.psa.PMI_Actuals__r.length == 0) {
                r.hasTotals = true;
            } else {           
                const pmia = this.psa.PMI_Actuals__r.filter(pmia => pmia.Promotion_Material_Item__c == pmiId && pmia.Rebate_Type__c == r.rebateType);
                console.log('[pmiaForm.createNewPMIA] rebateType, pmiId, pmia', r.rebateType, pmiId, pmia);
                //r.hasTotals = pmia == null;
                var index = pmia == null ? 0 : pmia.length;
                r.hasTotals = index == 0;
                r.externalKey = promotionId + '_' + pmiId + '_' + r.rebateType + '-' + index;
            }
        });
        console.log('[pmiaForm.createNewPMIA] rebates', this.rebates);
        console.log(']pmiaForm.createNewPMIA] record', record);
        createActuals({psaId: this.psaId, 
                        psaName: this.psa.Name,
                            recordTypeId: this.recordTypeId, 
                            promotionId: record.fields[FIELD_PROMOTION_ID.fieldApiName],
                            pmiId: record.fields[FIELD_PROMOTION_MATERIAL_ITEM_ID.fieldApiName],
                            wholesalerId: record.fields[FIELD_ACTUAL_WHOLESALER.fieldApiName],
                            paymentDate: record.fields[FIELD_PAYMENT_DATE.fieldApiName],
                            externalKey: record.fields[FIELD_EXTERNAL_KEY.fieldApiName],
                            status: record.fields[FIELD_APPROVAL_STATUS.fieldApiName],
                            invoiceNumber: record.fields[FIELD_INVOICE_NUMBER.fieldApiName],
                            captureVolumeInBottles: this.captureVolumeInBottles,
                            productPackQty: this.productPackQty,
                            comments: this.comments,
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
    }
    async updatePMIA(record) {
        console.log('[pmiaForm.update] record', record);
        await updateRecord(record)
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
                    console.log('[pmiaForm.update] refreshedApex');
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

        getRecordNotifyChange([{ recordId: this.pmiaId }]);

    }

    updateTotals() {

        updateActualTotals({psaIds: [this.psaId]})
            .then((status) => {
                console.log('[updateTotals] status', status);
            })
            .catch((error) => {
                console.log('[updateTotals] error', error);
            });
    }
}