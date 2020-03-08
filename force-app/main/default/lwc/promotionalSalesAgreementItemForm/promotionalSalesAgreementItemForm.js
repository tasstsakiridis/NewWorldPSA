import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import userId from '@salesforce/user/Id';

import PMI_OBJECT from '@salesforce/schema/Promotion_Material_Item__c';

import ID_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Id';
import ACTIVITY_ID_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Activity__c';
import PROMOTION_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Promotion__c';
import PRODUCT_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Product_Custom__c';
import VOLUME_FORECAST_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Plan_Volume__c';
import PLAN_REBATE_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Plan_Rebate__c';
import BRAND_STATUS_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Brand_Status__c';
import LISTING_FEE_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Listing_Fee__c';
import PROMOTIONAL_ACTIVITY_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Promotional_Activity__c';
import PROMOTIONAL_ACTIVITY_VALUE_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Promotional_Activity_Value__c';
import TRAINING_ADVOCACY_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Training_And_Advocacy__c';
import TRAINING_ADVOCACY_VALUE_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Training_And_Advocacy_Value__c';
import DRINK_STRATEGY_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Drink_Strategy__c';
import OUTLET_TO_PROVIDE_FIELD from '@salesforce/schema/Promotion_Material_Item__c.Outlet_To_Provide__c';

import getProductDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getProductDetails';
import getPSAItemDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSAItemDetails';

import VOLUME_FORECAST_LABEL from '@salesforce/label/c.Volume_Forecast';
import DISCOUNT_PER_CASE_LABEL from '@salesforce/label/c.Discount_per_Case';

export default class PromotionalSalesAgreementItemForm extends NavigationMixin(LightningElement) {
    labels = {
        volumeForecast: { label: VOLUME_FORECAST_LABEL },
        discountPerCase: { label: DISCOUNT_PER_CASE_LABEL },
        saving: { message: 'Saving. Please wait...' },
        loading: { message: 'Loading PSA Item details. Please wait...' }
    };

    @api psaId;
    @api psaItemId;
    @api productId;
    @api productName;
    @api promotionId;

    @wire(CurrentPageReference) pageRef;

    get isPhone() {
        return CLIENT_FORM_FACTOR === 'Small';
    }

    @track objectInfo;
    recordTypeId;

    @wire(getObjectInfo, { objectApiName: PMI_OBJECT })
    wiredObjectInfo({error, data}) {
        if (this.isPhone && this.isTass) {
            alert('object info finished loading');
        }

        if (data) {
            this.error = undefined;
            this.objectInfo = data;
            this.getRecordTypeId();
            this.setFieldLabels();
        } else if (error) {
            this.error = error;
            this.objectInfo = undefined;
        }
    }

    picklistValuesMap;
    @wire(getPicklistValuesByRecordType, { objectApiName: PMI_OBJECT, recordTypeId: '$recordTypeId' })
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

    product;
    get productName() {
        return this.product == undefined ? '' : this.product.Name;
    }
    get productImageUrl() {
        return this.product == undefined ? '' : 'https://salesforce-static.b-fonline.com/images/' + this.product.Image_Name__c;
    }
    get brandName() {
        return this.product == undefined ? '' : this.product.Brand_Name__c;
    }
    get isThisTass() {
        return userId == '00530000005n92iAAA';
    }
    //wiredProduct;
    //@wire(getProductDetails, { productId: '$productId' })
    //wiredGetProduct(value) {        
        //this.wiredProduct = value;
    getProduct() {
        getProductDetails({productId: this.productId})
            .then(record => {
                this.error = undefined;
                this.product = record;
                
                this.finishedLoadingProduct = true;
                if (this.psaItemId == undefined) { this.finishedLoadingDetails = true; }
                if (this.finishedLoadingDetails && this.finishedLoadingObjectInfo) { this.isWorking = false;}
    
            })
            .catch(error => {
                this.error = value.error;
                this.product = undefined;    
            });
    }

    //wiredPSAItem;
    //psaItem;
    //@wire(getPSAItemDetails, { psaItemId: '$psaItemId' })
    //wiredGetPSAItemDetails(value) {
    //    console.log('[psaItemForm.getPSAItemDetails] value', value);
    //    this.wiredPSAItem = value;
    getPSAItem() {
        getPSAItemDetails({psaItemId: this.psaItemId})
            .then(record => {
                this.error = undefined;
                this.psaItem = record;
                this.psaItemId = record.Id;
                this.productId = record.Product_Custom__c;
                this.product = {
                    Id: record.Product_Custom__c,
                    Name: record.Product_Name__c,
                    Image_Name__c: record.Product_Custom__r.Image_Name__c
                };
                
                this.brandStatus = record.Brand_Status__c;
                this.drinkStrategy = record.Drink_Strategy__c;
                this.discount = record.Plan_Rebate__c;
                this.volumeForecast = record.Plan_Volume__c;
                this.listingFee = record.Listing_Fee__c;
                this.promotionalActivity = record.Promotional_Activity__c;
                this.promotionalActivityAmount = record.Promotional_Activity_Value__c;
                this.trainingAdvocacy = record.Training_and_Advocacy__c;
                this.trainingAdvocacyAmount = record.Training_and_Advocacy_Value__c;
                this.outletToProvide = record.Outlet_to_Provide__c;
    
                this.finishedLoadingDetails = true;
                if (this.finishedLoadingObjectInfo && this.finishedLoadingProduct) { this.isWorking = false; }    
            })
            .catch(error => {
                this.error = value.error;
                this.psaItem = undefined;
                this.psaItemId = undefined;    
            });
    }
    
    get canDelete() {
        return false;
        return this.psaItem != undefined;
    }

    finishedLoadingDetails = false;
    finishedLoadingObjectInfo = false;
    finishedLoadingProduct = false;
    isWorking = true;
    workingMessage = this.labels.loading.message;

    brandStatus;
    brandStatusOptions;
    brandStatusLabel = 'Brand Status';
    brandStatusPlaceholder = '';

    volumeForecast = 0;
    volumeForecastLabel = 'Volume Forecast';

    discount = 0;
    discountLabel = 'Discount';

    listingFee = 0;
    listingFeeLabel = 'Listing Fee';

    drinkStrategy;
    drinkStrategyOptions;
    drinkStrategyLabel = 'Drink Strategy';
    drinkStrategyPlaceholder = '';
    
    promotionalActivityAmount = 0;
    promotionalActivity;
    promotionalActivityOptions;   
    promotionalActivityLabel = 'Promotional Activity';
    promotionalActivityPlaceholder = ''; 

    trainingAdvocacyAmount = 0;
    trainingAdvocacy;
    trainingAdvocacyOptions;
    trainingAdvocacyLabel = 'Training & Advocacy';
    trainingAdvocacyPlaceholder = '';

    outletToProvide;
    outletToProvideOptions;
    outletToProvideLabel = 'Outlet to Provide';
    outletToProvidePlaceholder;

    totalInvestmentLabel = 'Total Investment';
    get totalInvestment() {
        console.log('total investment calc', this.volumeForecast, this.discount, this.listingFee, this.promotionalActivityAmount, this.trainingAdvocacyAmount);
        const ti = (parseFloat(this.volumeForecast) * parseFloat(this.discount)) + parseFloat(this.listingFee) + parseFloat(this.promotionalActivityAmount) + parseFloat(this.trainingAdvocacyAmount);
        console.log('totalInvestment', ti);
        return ti;
    }

    /**
     * Lifecycle events
     */
    connectedCallback() {
        if (this.psaItemId != undefined) {
            this.getPSAItem();
        } else if (this.productId != undefined) {
            this.getProduct();
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
        console.log('[setFieldLabels] objectInfo', this.objectInfo);
        if (this.objectInfo.fields["Brand_Status__c"]) {
            console.log('[setFieldLabels] brand status label', this.objectInfo.fields["Brand_Status__c"].label);
            console.log('[setFieldLabels] brand status placeholder', this.objectInfo.fields["Brand_Status__c"].inlineHelpText);
            this.brandStatusLabel = this.objectInfo.fields["Brand_Status__c"].label;
            this.brandStatusPlaceholder = this.objectInfo.fields["Brand_Status__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Discount__c"]) {
            this.discountLabel = this.objectInfo.fields["Discount__c"].label;
        }
        if (this.objectInfo.fields["Volume_Forecast__c"]) {
            this.volumeForecastLabel = this.objectInfo.fields["Volume_Forecast__c"].label;
        }
        if (this.objectInfo.fields["Listing_Fee__c"]) {
            this.listingFeeLabel = this.objectInfo.fields["Listing_Fee__c"].label;
        }
        if (this.objectInfo.fields["Total_Investment__c"]) {
            this.totalInvestmentLabel = this.objectInfo.fields["Total_Investment__c"].label;
        }
        if (this.objectInfo.fields["Drink_Strategy__c"]) {
            this.drinkStrategyLabel = this.objectInfo.fields["Drink_Strategy__c"].label;
            this.drinkStrategyPlaceholder = this.objectInfo.fields["Drink_Strategy__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Promotional_Activity__c"]) {
            this.promotionalActivityLabel = this.objectInfo.fields["Promotional_Activity__c"].label;
            this.promotionalActivityPlaceholder = this.objectInfo.fields["Promotional_Activity__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Training_and_Advocacy__c"]) {
            this.trainingAdvocacyLabel = this.objectInfo.fields["Training_and_Advocacy__c"].label;
            this.trainingAdvocacyPlaceholder = this.objectInfo.fields["Training_and_Advocacy__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Outlet_to_Provide__c"]) {
            this.outletToProvideLabel = this.objectInfo.fields["Outlet_to_Provide__c"].label;
            this.outletToProvidePlaceholder = this.objectInfo.fields["Outlet_to_Provide__c"].inlineHelpText;
        }

    }

    setFieldOptions(picklistValues) {
        if (this.isPhone && this.isThisTass) {
            alert('setting field options');
        }
        console.log('[setFieldOptions] picklistValues', picklistValues);
        Object.keys(picklistValues).forEach(picklist => {            
            if (picklist === 'Brand_Status__c') {
                this.brandStatusOptions = this.setFieldOptionsForField(picklistValues, picklist);
            } else if (picklist === 'Drink_Strategy__c') {
                this.drinkStrategyOptions = this.setFieldOptionsForField(picklistValues, picklist);
            } else if (picklist === 'Promotional_Activity__c') {
                this.promotionalActivityOptions = this.setFieldOptionsForField(picklistValues, picklist);
            } else if (picklist === 'Training_and_Advocacy__c') {
                this.trainingAdvocacyOptions = this.setFieldOptionsForField(picklistValues, picklist);
            } else if (picklist === 'Outlet_to_Provide__c') {
                this.outletToProvideOptions = this.setFieldOptionsForField(picklistValues, picklist);
            }
        });

        if (this.isPhone && this.isThisTass) {
            alert('finished loading object info.  loadingproduct: ' + this.finishedLoadingProduct + ', details: ' + this.finishedLoadingDetails);
        }
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
    
    initialiseItemForm() {
        this.productId = undefined;
        this.psaItemId = undefined;
        this.promotionId = undefined;
        this.product = undefined;
        this.brandStatus = undefined;
        this.volumeForecast = 0;
        this.discount = 0;
        this.listingFee = 0;
        this.promotionalActivityAmount = 0;
        this.trainingAdvocacyAmount = 0;
        this.drinkStrategy = undefined;
        this.promotionalActivity = undefined;
        this.trainingAdvocacy = undefined;
        this.outletToProvide = undefined;
    }

    /**
     * Handle local component events
     */
    handleCancelButtonClick(event) {
        this.goBack();
    }
    handleSaveButtonClick() {
        this.workingMessage = this.labels.saving.message;
        this.isWorking = true;
        this.save();
    }
    handleDeleteButtonClick() {
        this.delete();
    }

    handleBrandStatusChange(event) {
        this.brandStatus = event.detail.value;
    }
    handleVolumeForecastChange(event) {
        try {
        console.log('volumeforecast change. value', event.detail.value);
        this.volumeForecast = event.detail.value;
        }catch(ex) {
            console.log('exception', ex);
        }
    }
    handleDiscountChange(event) {
        this.discount = event.detail.value;
        console.log('[handleDiscountChange] discount', this.discount);
    }
    handleListingFeeChange(event) {
        this.listingFee = event.detail.value;
    }
    handleDrinkStrategyChange(event) {
        this.drinkStrategy = event.detail.value;
    }
    handlePromotionalActivityChange(event) {
        this.promotionalActivity = event.detail.value;
    }
    handlePromotionalActivityValueChange(event) {
        this.promotionalActivityAmount = event.detail.value;
    }
    handleTrainingAdvocacyChange(event) {
        this.trainingAdvocacy = event.detail.value;
    }
    handleTrainingAdvocacyValueChange(event) {
        this.trainingAdvocacyAmount = event.detail.value;
    }
    handleOutletToProvideChange(event) {
        this.outletToProvide = event.detail.value;
    }
    /**
     * Server functions
     */
    goBack() {
        try {
        if (this.isPhone) {
            this.initialiseItemForm();

            this[NavigationMixin.Navigate]({
                type: 'standard__component',
                attributes: {
                    componentName: 'c__PromotionalSalesAgreementItemsContainer'
                },
                state: {
                    c__psaId: this.psaId,
                }
            }, true);
        } else {
            console.log('[psaitemform.goback');
            const closeEvent = new CustomEvent('close');
            this.dispatchEvent(closeEvent);            
        }
        }catch(ex) {
            console.log('[psaItemForm.goBack] exception', ex);
        }
    }

    save() {
        console.log('[psaitemForm.save]');
        this.isWorking = true;
        try {
        const fields = {};
        fields[PRODUCT_FIELD.fieldApiName] = this.productId;
        fields[BRAND_STATUS_FIELD.fieldApiName] = this.brandStatus;
        fields[PLAN_REBATE_FIELD.fieldApiName] = this.discount;
        fields[VOLUME_FORECAST_FIELD.fieldApiName] = this.volumeForecast;
        fields[LISTING_FEE_FIELD.fieldApiName] = this.listingFee;
        fields[DRINK_STRATEGY_FIELD.fieldApiName] = this.drinkStrategy;
        fields[PROMOTIONAL_ACTIVITY_FIELD.fieldApiName] = this.promotionalActivity;
        fields[PROMOTIONAL_ACTIVITY_VALUE_FIELD.fieldApiName] = this.promotionalActivityAmount;
        fields[TRAINING_ADVOCACY_FIELD.fieldApiName] = this.trainingAdvocacy;
        fields[TRAINING_ADVOCACY_VALUE_FIELD.fieldApiName] = this.trainingAdvocacyAmount;
        fields[OUTLET_TO_PROVIDE_FIELD.fieldApiName] = this.outletToProvide;

        console.log('[psaItemForm.save] fields', fields);
        if (this.psaItemId == undefined) {
            fields['RecordTypeId'] = this.recordTypeId;
            fields[ACTIVITY_ID_FIELD.fieldApiName] = this.psaId;
            fields[PROMOTION_FIELD.fieldApiName] = this.promotionId;
            if (this.isPhone && this.isThisTass) {
                alert('psaId: ' + this.psaId + ', promotionId: ' + this.promotionId);
            }
            const record = { apiName: PMI_OBJECT.objectApiName, fields };
            this.createNewPSAItem(record);
        } else {
            fields[ID_FIELD.fieldApiName] = this.psaItem.Id;
            const record = { fields };
            this.updatePSAItem(record);
        }
        }catch(ex) {
            console.log('[psaItemForm.save] exception', ex);
        }
    }

    createNewPSAItem(record) {
        console.log('[psaItemForm.createNewPSAItem] record', record);
        if (this.isPhone && this.isThisTass) {
            alert('creating new pmi record');
        }
        createRecord(record)
            .then(psaItem => {
                this.isWorking = false;
                this.psaItem = psaItem;
                this.psaItemId = psaItem.Id;
                if (this.isPhone && this.isThisTass) {
                    alert('created pmi successfully');
                }
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Promotional Sales Agreement Item created successfully',
                        variant: 'success'
                    }),
                );

                if (!this.isPhone) {
                    const saveEvent = new CustomEvent('save', {
                        detail: psaItem
                    });
                    this.dispatchEvent(saveEvent);
                }
            })
            .catch(error => {
                this.isWorking = false;
                console.log('[psaItemForm.createNewPSAItem] error', error);
                if (this.isThisTass && this.isPhone) {
                    alert('error creating pmi. error: ' + error.body);
                }
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error creating Promotional Sales Agreement Item',
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
            });
    }

    updatePSAItem(record) {
        console.log('[psaItemForm.update] record', record);
        updateRecord(record)
            .then((updatedRecord) => {
                this.isWorking = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Promotional Sales Agreement Item updated successfully',
                        variant: 'success'
                    }),
                );

                try {
                if (!this.isPhone) {
                    //const updatedRecord = refreshApex(this.wiredPSAItem);
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
                        title: 'Error updating Promotional Sales Agreement Item',
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
            });
    }

    delete() {
        deleteRecord(this.psaItemId) 
            .then(() => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Promotional Sales Agreement Item deleted successfully',
                        variant: 'success'
                    }),
                );

                if (!this.isPhone) {
                    const saveEvent = new CustomEvent('save', {
                        detail: this.psaItem
                    });
                    this.dispatchEvent(saveEvent);
                }
            })
            .catch(error => {
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting Promotional Sales Agreement Item',
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
            });
    }
}