import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import { fireEvent } from 'c/pubsub';

import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import userId from '@salesforce/user/Id';

import OBJECT_PMI from '@salesforce/schema/Promotion_Material_Item__c';

import FIELD_ID from '@salesforce/schema/Promotion_Material_Item__c.Id';
import FIELD_ACTIVITY_ID from '@salesforce/schema/Promotion_Material_Item__c.Activity__c';
import FIELD_PROMOTION from '@salesforce/schema/Promotion_Material_Item__c.Promotion__c';
import FIELD_PRODUCT from '@salesforce/schema/Promotion_Material_Item__c.Product_Custom__c';
import FIELD_VOLUME_FORECAST from '@salesforce/schema/Promotion_Material_Item__c.Plan_Volume__c';
import FIELD_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Plan_Rebate__c';
import FIELD_BRAND_STATUS from '@salesforce/schema/Promotion_Material_Item__c.Brand_Status__c';
import FIELD_LISTING_FEE from '@salesforce/schema/Promotion_Material_Item__c.Listing_Fee__c';
import FIELD_PROMOTIONAL_ACTIVITY from '@salesforce/schema/Promotion_Material_Item__c.Promotional_Activity__c';
import FIELD_PROMOTIONAL_ACTIVITY_VALUE from '@salesforce/schema/Promotion_Material_Item__c.Promotional_Activity_Value__c';
import FIELD_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Training_And_Advocacy__c';
import FIELD_TRAINING_ADVOCACY_VALUE from '@salesforce/schema/Promotion_Material_Item__c.Training_And_Advocacy_Value__c';
import FIELD_DRINK_STRATEGY from '@salesforce/schema/Promotion_Material_Item__c.Drink_Strategy__c';
import FIELD_OUTLET_TO_PROVIDE from '@salesforce/schema/Promotion_Material_Item__c.Outlet_To_Provide__c';
import FIELD_COMMENTS from '@salesforce/schema/Promotion_Material_Item__c.Comments_Long__c';

import getProductDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getProductDetails';
import getPSAItemDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSAItemDetails';
import updatePMITotals from '@salesforce/apex/PromotionalSalesAgreement_Controller.updatePMITotals';

import LABEL_VOLUME_FORECAST_9L from '@salesforce/label/c.Volume9L';
import LABEL_DISCOUNT_PER_9LCASE from '@salesforce/label/c.Discount_per_9LCase';
import LABEL_COMMENTS from '@salesforce/label/c.Comments';

export default class PromotionalSalesAgreementItemForm extends NavigationMixin(LightningElement) {
    labels = {
        brandStatus             : { help: 'bs help' },
        volumeForecast          : { label: LABEL_VOLUME_FORECAST_9L, error: 'Volume entered is invalid' },
        discountPerCase         : { label: LABEL_DISCOUNT_PER_9LCASE, error: 'Discount entered is invalid' },
        drinkStrategy           : { help: 'Drink Strategy help'},
        promotionalActivity     : { help: 'Promotional Activity help' },
        trainingAdvocacy        : { help: 'Training & Advocacy help' },
        outletToProvide         : { help: 'Outlet to Provide help' },
        saving                  : { message: 'Saving. Please wait...' },
        loading                 : { message: 'Loading PSA Item details. Please wait...' },
        available               : { label: 'Available' },
        selected                : { label: 'Selected' },
        error                   : { message: 'Errors found validating/saving item details.  Please review and try saving again.' },
        saveError               : { message: 'Error saving item' },
        saveSuccess             : { message: 'All changes saved successfully'},
        comments                : { label: LABEL_COMMENTS, placeholder: 'Type some text...' }
    };

    @api psaId;
    @api psaItemId;
    @api productId;
    @api productName;
    @api promotionId;
    @api isLocked;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        console.log('[psaitemform.setcurrentpagerefernce] pageref', currentPageReference);
        this.psaId = currentPageReference.state.c__psaId;
        this.psaItemId = currentPageReference.state.c__psaItemId;
        this.productId = currentPageReference.state.c__productId;
        this.promotionId = currentPageReference.state.c__promotionId;
        console.log('[psaitemform.setcurrentpagereference] productid', this.productId);
        
        if (this.wiredProduct != undefined) {
            refreshApex(this.wiredProduct);
        }
        if (this.wiredPSAItem != undefined) {
            refreshApex(this.wiredPSAItem);
        }
    }

    get isPhone() {
        return CLIENT_FORM_FACTOR === 'Small';
    }

    @track objectInfo;
    recordTypeId;

    @wire(getObjectInfo, { objectApiName: OBJECT_PMI })
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
    @wire(getPicklistValuesByRecordType, { objectApiName: OBJECT_PMI, recordTypeId: '$recordTypeId' })
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
    wiredProduct;
    @wire(getProductDetails, { productId: '$productId' })
    wiredGetProduct(value) {        
        this.wiredProduct = value;
        console.log('[psaitemform.getproductdetails] product', value);
        if (value.error) {
            this.error = value.error;
            this.product = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.product = value.data;
            this.finishedLoadingProduct = true;
            if (this.psaItemId == undefined) { this.finishedLoadingDetails = true; }
            if (this.finishedLoadingDetails && this.finishedLoadingObjectInfo) { this.isWorking = false;}
            console.log('[psaItemForm.getproductdetails] finishedloadingdetails, objectinof, product', this.finishedLoadingDetails, this.finishedLoadingObjectInfo, this.finishedLoadingProduct);
        }
    }

    wiredPSAItem;
    psaItem;
    @wire(getPSAItemDetails, { psaItemId: '$psaItemId' })
    wiredGetPSAItemDetails(value) {
        console.log('[psaItemForm.getPSAItemDetails] value', value);
        this.wiredPSAItem = value;
        if (value.error) {
            this.error = error;
            this.psaItem = undefined;
            this.psaItemId = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.psaItem = value.data;

            this.psaItemId = value.data.Id;
            this.productId = value.data.Product_Custom__c;
            this.product = {
                Id: value.data.Product_Custom__c,
                Name: value.data.Product_Name__c,
                Image_Name__c: value.data.Product_Custom__r.Image_Name__c
            };
            
            this.discount = value.data.Plan_Rebate__c;
            this.volumeForecast = value.data.Plan_Volume__c;
            this.listingFee = value.data.Listing_Fee__c;
            this.promotionalActivityAmount = value.data.Promotional_Activity_Value__c;
            this.trainingAdvocacyAmount = value.data.Training_and_Advocacy_Value__c;
            this.comments = value.data.Comments_Long__c;

            //this.brandStatus = value.data.Brand_Status__c;
            if (value.data.Brand_Status__c) {
                this.brandStatusValues = value.data.Brand_Status__c.split(';');
            }
            this.selectPicklistValues(this.brandStatusOptions, this.brandStatusValues);

            if (value.data.Drink_Strategy__c) {
                this.drinkStrategyValues = value.data.Drink_Strategy__c.split(';');
            }
            this.selectPicklistValues(this.drinkStrategyOptions, this.drinkStrategyValues);

            if (value.data.Promotional_Activity__c) {
                this.promotionalActivityValues = value.data.Promotional_Activity__c.split(';');
            }
            this.selectPicklistValues(this.promotionalActivityOptions, this.promotionalActivityValues);

            if (value.data.Training_and_Advocacy__c) {
                this.trainingAdvocacyValues = value.data.Training_and_Advocacy__c.split(';');
            }
            this.selectPicklistValues(this.trainingAdvocacyOptions, this.trainingAdvocacyValues);

            if (value.data.Outlet_to_Provide__c) {
                this.outletToProvideValues = value.data.Outlet_to_Provide__c.split(';');
            }
            this.selectPicklistValues(this.outletToProvideOptions, this.outletToProvideValues);

            this.finishedLoadingDetails = true;
            if (this.finishedLoadingObjectInfo && this.finishedLoadingProduct) { this.isWorking = false; }    
            console.log('[psaItemForm.getpsaitemdetails] finishedloadingdetails, objectinof, product', this.finishedLoadingDetails, this.finishedLoadingObjectInfo, this.finishedLoadingProduct);

        }
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

    brandStatusValues;
    brandStatusOptions;
    brandStatusLabel = 'Brand Status';
    brandStatusPlaceholder = '';

    volumeForecast = 0;
    volumeForecastLabel = 'Volume Forecast';
    hasVolumeForecastError;

    discount = 0;
    discountLabel = 'Discount';
    hasDiscountError;

    listingFee = 0;
    listingFeeLabel = 'Listing Fee';

    drinkStrategyValues;
    drinkStrategyOptions;
    drinkStrategyLabel = 'Drink Strategy';
    drinkStrategyPlaceholder = '';
    
    promotionalActivityAmount = 0;
    promotionalActivity;
    promotionalActivityOptions;   
    promotionalActivityLabel = 'Promotional Activity';
    promotionalActivityPlaceholder = ''; 

    trainingAdvocacyAmount = 0;
    trainingAdvocacyValues;
    trainingAdvocacyOptions;
    trainingAdvocacyLabel = 'Training & Advocacy';
    trainingAdvocacyPlaceholder = '';

    outletToProvideValues;
    outletToProvideOptions;
    outletToProvideLabel = 'Outlet to Provide';
    outletToProvidePlaceholder;

    comments;

    totalInvestmentLabel = 'Total Investment';
    get totalInvestment() {
        //console.log('total investment calc', this.volumeForecast, this.discount, this.listingFee, this.promotionalActivityAmount, this.trainingAdvocacyAmount);
        const ti = (parseFloat(this.volumeForecast) * parseFloat(this.discount)) + parseFloat(this.listingFee) + parseFloat(this.promotionalActivityAmount) + parseFloat(this.trainingAdvocacyAmount);
        //console.log('totalInvestment', ti);
        return ti;
    }

    /**
     * Lifecycle events
     */
    connectedCallback() {
        /*
        if (this.psaItemId != undefined) {
            this.getPSAItem();
        } else if (this.productId != undefined) {
            this.getProduct();
        }
        */
    }
    /**
     * Helper functions
     */
    getRecordTypeId() {
        if (this.objectInfo.recordTypeInfos) {
            //console.log('[psaitemform.getrecordtypeid] objectinfo', this.objectInfo);
            const rtis = this.objectInfo.recordTypeInfos;
            //console.log('[psaitemform.getrecordtypeid] rtis', rtis);
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === 'UK - PSA');
            //console.log('[psaitemform.getrecordtypeid] rtis', Object.keys(rtis));
            //console.log('[psaitemform.getrecordtypeid] recordtypeid', this.recordTypeId);
        }    
    }

    setFieldLabels() {
        console.log('[psaitemform.setFieldLabels] objectInfo', this.objectInfo);
        if (this.objectInfo.fields["Brand_Status__c"]) {
            console.log('[psaitemform.setFieldLabels] brand status label', this.objectInfo.fields["Brand_Status__c"].label);
            console.log('[psaitemform.setFieldLabels] brand status placeholder', this.objectInfo.fields["Brand_Status__c"].inlineHelpText);
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
        console.log('[psaitemform.setFieldOptions] picklistValues', picklistValues);
        Object.keys(picklistValues).forEach(picklist => {            
            if (picklist === 'Brand_Status__c') {
                this.brandStatusOptions = this.setFieldOptionsForField(picklistValues, picklist);
                if (this.brandStatusValues && this.brandStatusValues.length > 0) {
                    this.selectPicklistValues(this.brandStatusOptions, this.brandStatusValues);
                }
            } else if (picklist === 'Drink_Strategy__c') {
                this.drinkStrategyOptions = this.setFieldOptionsForField(picklistValues, picklist);
                if (this.drinkStrategyValues && this.drinkStrategyValues.length > 0) {
                    this.selectPicklistValues(this.drinkStrategyOptions, this.drinkStrategyValues);
                }
            } else if (picklist === 'Promotional_Activity__c') {
                this.promotionalActivityOptions = this.setFieldOptionsForField(picklistValues, picklist);
                if (this.promotionalActivityValues && this.promotionalActivityValues.length > 0) {
                    this.selectPicklistValues(this.promotionalActivityOptions, this.promotionalActivityValues);
                }
            } else if (picklist === 'Training_and_Advocacy__c') {
                this.trainingAdvocacyOptions = this.setFieldOptionsForField(picklistValues, picklist);
                if (this.trainingAdvocacyValues && this.trainingAdvocacyValues.length > 0) {
                    this.selectPicklistValues(this.trainingAdvocacyOptions, this.trainingAdvocacyValues);
                }
            } else if (picklist === 'Outlet_to_Provide__c') {
                this.outletToProvideOptions = this.setFieldOptionsForField(picklistValues, picklist);
                if (this.outletToProvideValues && this.outletToProvideValues.length > 0) {
                    this.selectPicklistValues(this.outletToProvideOptions, this.outletToProvideValues);
                }
            }
        });

        if (this.isPhone && this.isThisTass) {
            alert('finished loading object info.  loadingproduct: ' + this.finishedLoadingProduct + ', details: ' + this.finishedLoadingDetails);
        }

        this.finishedLoadingObjectInfo = true;
        if (this.finishedLoadingDetails && this.finishedLoadingProduct) { this.isWorking = false; }
        
    }
    
    setFieldOptionsForField(picklistValues, picklist) {        
        //console.log('[psaitemform.setFieldOptionsForField] picklist field', picklist);
        return picklistValues[picklist].values.map(item => ({
            label: item.label,
            value: item.value,
            selected: false
        }));
    }

    selectPicklistValues(options, values) {
        if (options && options.length > 0 && values != undefined && values.length > 0) {            
            options.forEach(o => {
                if (values.includes(o.value)) {
                    o.selected = true;
                }
            });
        }
        //console.log('[psaitemform.selectpicklistvalues] options, values', options, values);
    }
    
    initialiseItemForm() {
        console.log('[psaitemform.initialiseitemform]');
        this.productId = undefined;
        this.psaItemId = undefined;
        this.promotionId = undefined;
        this.product = undefined;
        this.brandStatusValues = undefined;
        this.brandStatusOptions.forEach(p => p.selected = false);
        this.volumeForecast = 0;
        this.discount = 0;
        this.listingFee = 0;
        this.promotionalActivityAmount = 0;
        this.trainingAdvocacyAmount = 0;
        this.drinkStrategyValues = undefined;
        this.drinkStrategyOptions.forEach(p => p.selected = false);
        this.promotionalActivityValues = undefined;
        this.promotionalActivityOptions.forEach(p => p.selected = false);
        this.trainingAdvocacyValues = undefined;
        this.trainingAdvocacyOptions.forEach(p => p.selected = false);
        this.outletToProvideValues = undefined;
        this.outletToProvideOptions.forEach(p => p.selected = false);
        this.comments = undefined;
    }

    /**
     * Handle local component events
     */
    handleCancelButtonClick(event) {
        //this.addClickedClassToElement('cancel');
        this.goBack();
    }
    handleSaveButtonClick() {
        this.addClickedClassToElement('save');
        this.workingMessage = this.labels.saving.message;
        this.isWorking = true;
        const isValid = this.validateForm();
        console.log('[psaitemform..handlesavebuttonclick] isValid', isValid);
        //if (isValid) {
            this.save();
        //} else {
        //    this.showToast('error', this.labels.saveError.message, this.labels.error.message);            
        //}
    }
    handleDeleteButtonClick() {
        this.addClickedClassToElement('delete');
        this.delete();
    }

    handleBSChange(event) {
        const bs = this.template.querySelector("select.brandStatus");
        for(var i = 0; i < bs.selectedOptions.length; i++) {
            console.log('[psaitemform.hanelbschange] checked value', bs.selectedOptions[i].label, bs.selectedOptions[i].value);
        }

    }
    handleBrandStatusChange(event) {
        this.brandStatusValues = event.detail.value;
    }
    handleVolumeForecastChange(event) {
        try {
        this.volumeForecast = event.detail.value;
        }catch(ex) {
            console.log('exception', ex);
        }
    }
    handleDiscountChange(event) {
        this.discount = event.detail.value;
    }
    handleListingFeeChange(event) {
        this.listingFee = event.detail.value;
    }
    handleDrinkStrategyChange(event) {
        this.drinkStrategyValues = event.detail.value;
    }
    handlePromotionalActivityChange(event) {
        this.promotionalActivityValues = event.detail.value;
    }
    handlePromotionalActivityValueChange(event) {
        this.promotionalActivityAmount = event.detail.value;
    }
    handleTrainingAdvocacyChange(event) {
        this.trainingAdvocacyValues = event.detail.value;
    }
    handleTrainingAdvocacyValueChange(event) {
        this.trainingAdvocacyAmount = event.detail.value;
    }
    handleOutletToProvideChange(event) {
        this.outletToProvideValues = event.detail.value;
    }
    handleCommentsChange(event) {
        this.comments = event.detail.value;
    }

    /**
     * Helper functions
     */
    addClickedClassToElement(elementName) {
        const el = this.template.querySelector('[data-id="'+elementName+'"]');
        if (el != undefined) {
            console.log('el.classlist', el.classList);
            if (el.classList.indexOf("clicked") < 0) {
                el.className = el.className + " clicked";
            }
        }
    }
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
    showToast(type, title, msg) {
        console.log('[showToast] type', type, title, msg);
        try {
        var toastMessage = msg;
        if (Array.isArray(msg)) {
            toastMessage = '';
            msg.forEach(m => {
                toastMessage += m + '\n';
            });
        }
        const event = new ShowToastEvent({
            title: title,
            message: toastMessage,
            variant: type
        });

        this.dispatchEvent(event);
        }catch(ex) {
            console.log('[showToast] exception', ex);
        }   
    }

    validateForm() {
        let isValid = true;
        if (this.volumeForecast == undefined || this.volumeForecast == 0) {
            isValid = false; this.hasVolumeForecastError = true;
        }
        if (this.discount == undefined || this.discount == 0) {
            isValid = false; this.hasDiscountError = true;
        }
        console.log('[psaitems.validate] isvalie, volume, discount', isValid, this.hasVolumeForecastError, this.hasDiscountError);

        return isValid;
    }
    save() {
        console.log('[psaitemform.save]');
        this.isWorking = true;
        try {
            this.brandStatusValues = [];
            const bs = this.template.querySelector("select.brandStatus");
            for(var i = 0; i < bs.selectedOptions.length; i++) {
                this.brandStatusValues.push(bs.selectedOptions[i].value);
            }
            this.brandStatusOptions = this.brandStatusOptions.map(bso => {                
                if (this.brandStatusValues.includes(bso.value)) {
                    bso.selected = true;
                } else {
                    bso.selected = false;
                }
                return bso;
            });
            const drinkStrategy = this.template.querySelector("select.drinkStrategy");
            this.drinkStrategyValues = [];
            for(var i = 0; i < drinkStrategy.selectedOptions.length; i++) {
                this.drinkStrategyValues.push(drinkStrategy.selectedOptions[i].value);
            }
            this.drinkStrategyOptions = this.drinkStrategyOptions.map(dso => {
                dso.selected = this.drinkStrategyValues.includes(dso.value);
                return dso;
            });

            const promotionalActivity = this.template.querySelector("select.promotionalActivity");
            this.promotionalActivityValues = [];
            for(var i = 0; i < promotionalActivity.selectedOptions.length; i++) {
                this.promotionalActivityValues.push(promotionalActivity.selectedOptions[i].value);
            }
            this.promotionalActivityOptions = this.promotionalActivityOptions.map(pao => {
                pao.selected = this.promotionalActivityValues.includes(pao.value);
                return pao;
            });

            const trainingAdvocacy = this.template.querySelector("select.trainingAdvocacy");
            this.trainingAdvocacyValues = [];
            for(var i = 0; i < trainingAdvocacy.selectedOptions.length; i++) {
                this.trainingAdvocacyValues.push(trainingAdvocacy.selectedOptions[i].value);
            }
            this.trainingAdvocacyOptions = this.trainingAdvocacyOptions.map(tao => {
                tao.selected = this.trainingAdvocacyValues.includes(tao.value);
                return tao;
            });

            const outletToProvide = this.template.querySelector("select.outletToProvide");
            this.outletToProvideValues = [];
            for(var i = 0; i < outletToProvide.selectedOptions.length; i++) {
                this.outletToProvideValues.push(outletToProvide.selectedOptions[i].value);
            }
            this.outletToProvideOptions = this.outletToProvideOptions.map(opo => {
                opo.selected = this.outletToProvideValues.includes(opo.value);
                return opo;
            });

            const fields = {};
            fields[FIELD_PRODUCT.fieldApiName] = this.productId;
            fields[FIELD_BRAND_STATUS.fieldApiName] = this.brandStatusValues.join(';');
            fields[FIELD_PLAN_REBATE.fieldApiName] = this.discount;
            fields[FIELD_VOLUME_FORECAST.fieldApiName] = this.volumeForecast;
            fields[FIELD_LISTING_FEE.fieldApiName] = this.listingFee;
            fields[FIELD_DRINK_STRATEGY.fieldApiName] = this.drinkStrategyValues.join(';');
            fields[FIELD_PROMOTIONAL_ACTIVITY.fieldApiName] = this.promotionalActivityValues.join(';');
            fields[FIELD_PROMOTIONAL_ACTIVITY_VALUE.fieldApiName] = this.promotionalActivityAmount;
            fields[FIELD_TRAINING_ADVOCACY.fieldApiName] = this.trainingAdvocacyValues.join(';');
            fields[FIELD_TRAINING_ADVOCACY_VALUE.fieldApiName] = this.trainingAdvocacyAmount;
            fields[FIELD_OUTLET_TO_PROVIDE.fieldApiName] = this.outletToProvideValues.join(';');
            fields[FIELD_COMMENTS.fieldApiName] = this.comments;

            console.log('[psaitemform.save] fields', fields);
            console.log('[psaitemform.save] psaitemId', this.psaItemId);
            if (this.psaItemId == undefined) {
                fields['RecordTypeId'] = this.recordTypeId;
                fields[FIELD_ACTIVITY_ID.fieldApiName] = this.psaId;
                fields[FIELD_PROMOTION.fieldApiName] = this.promotionId;
                if (this.isPhone && this.isThisTass) {
                    alert('psaId: ' + this.psaId + ', promotionId: ' + this.promotionId);
                }
                const record = { apiName: OBJECT_PMI.objectApiName, fields };
                this.createNewPSAItem(record);
            } else {
                fields[FIELD_ID.fieldApiName] = this.psaItem.Id;
                const record = { fields };
                this.updatePSAItem(record);
            }
        }catch(ex) {
            console.log('[psaitemform.save] exception', ex);
        }
    }

    /**
     * Server functions
     */

    createNewPSAItem(record) {
        console.log('[psaitemform.createNewPSAItem] record', record);
        if (this.isPhone && this.isThisTass) {
            alert('creating new pmi record');
        }
        createRecord(record)
            .then(psaItem => {
                console.log('[psaitemForm.createrecord] psaItem', psaItem);
                this.isWorking = false;
                this.psaItem = psaItem;
                this.psaItemId = psaItem.id;
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

                this.updateTotals();

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

                this.updateTotals();

                try {
                if (!this.isPhone) {
                    //const updatedRecord = refreshApex(this.wiredPSAItem);
                    console.log('updated record', updatedRecord);
                    const saveEvent = new CustomEvent('save', {
                        detail: { productId: this.productId,
                                  psaItemId: this.psaItemId, 
                                  volume: this.volumeForecast,
                                  discount: this.discount,
                                  totalInvestment: this.totalInvestment }
                    });
                    //this.dispatchEvent(saveEvent);
                    const detail = {
                        psaItemId: this.psaItemId,
                        productId: this.productId,
                        volume: this.volumeForecast,
                        discount: this.discount,
                        totalInvestment: this.totalInvestment
                    };
                    fireEvent(this.currentPageReference, 'psaupdated', detail);
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

                this.updateTotals();
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

    updateTotals() {
        updatePMITotals({psaId: this.psaId})
            .then((status) => {
                console.log('[updateTotals] status', status);
            })
            .catch((error) => {
                console.log('[updateTotals] error', error);
            });

    }
}