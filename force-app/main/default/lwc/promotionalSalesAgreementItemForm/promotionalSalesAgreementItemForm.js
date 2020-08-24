import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { createRecord, updateRecord, deleteRecord } from 'lightning/uiRecordApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import { fireEvent } from 'c/pubsub';

import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';
import CURRENCY_CODE from '@salesforce/i18n/currency';

import userId from '@salesforce/user/Id';

import OBJECT_PMI from '@salesforce/schema/Promotion_Material_Item__c';
import OBJECT_ACTIVITY from '@salesforce/schema/Promotion_Activity__c';

import FIELD_PROMOTION_ACTIVITY_ID from '@salesforce/schema/Promotion_Activity__c.Id';
import FIELD_PROMOTION_ACTIVITY_STATUS from '@salesforce/schema/Promotion_Activity__c.Status__c';
import FIELD_HAS_ACTUAL_TOTALS from '@salesforce/schema/Promotion_Activity__c.Has_Actual_Totals__c';

import FIELD_ID from '@salesforce/schema/Promotion_Material_Item__c.Id';
import FIELD_ACTIVITY_ID from '@salesforce/schema/Promotion_Material_Item__c.Activity__c';
import FIELD_PROMOTION from '@salesforce/schema/Promotion_Material_Item__c.Promotion__c';
import FIELD_PRODUCT from '@salesforce/schema/Promotion_Material_Item__c.Product_Custom__c';
import FIELD_VOLUME_FORECAST from '@salesforce/schema/Promotion_Material_Item__c.Plan_Volume__c';
import FIELD_ORIGINAL_PLAN_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Original_Plan_Volume__c';
import FIELD_PREVIOUS_PLAN_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Previous_Plan_Volume__c';
import FIELD_PROPOSED_PLAN_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Plan_Volume__c';
import FIELD_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Plan_Rebate__c';
import FIELD_ORIGINAL_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Original_Plan_Rebate__c';
import FIELD_PREVIOUS_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Previous_Plan_Rebate__c';
import FIELD_PROPOSED_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Plan_Rebate__c';
import FIELD_BRAND_STATUS from '@salesforce/schema/Promotion_Material_Item__c.Brand_Status__c';
import FIELD_LISTING_FEE from '@salesforce/schema/Promotion_Material_Item__c.Listing_Fee__c';
import FIELD_ORIGINAL_LISTING_FEE from '@salesforce/schema/Promotion_Material_Item__c.Original_Listing_Fee__c';
import FIELD_PREVIOUS_LISTING_FEE from '@salesforce/schema/Promotion_Material_Item__c.Previous_Listing_Fee__c';
import FIELD_PROPOSED_LISTING_FEE from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Listing_Fee__c';
import FIELD_PROMOTIONAL_ACTIVITY from '@salesforce/schema/Promotion_Material_Item__c.Promotional_Activity__c';
import FIELD_PROMOTIONAL_ACTIVITY_VALUE from '@salesforce/schema/Promotion_Material_Item__c.Promotional_Activity_Value__c';
import FIELD_ORIGINAL_PROMOTIONAL_ACTIVITY from '@salesforce/schema/Promotion_Material_Item__c.Original_Promotional_Activity__c';
import FIELD_PREVIOUS_PROMOTIONAL_ACTIVITY from '@salesforce/schema/Promotion_Material_Item__c.Previous_Promotional_Activity__c';
import FIELD_PROPOSED_PROMOTIONAL_ACTIVITY from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Promotional_Activity_Value__c';
import FIELD_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Training_And_Advocacy__c';
import FIELD_TRAINING_ADVOCACY_VALUE from '@salesforce/schema/Promotion_Material_Item__c.Training_And_Advocacy_Value__c';
import FIELD_ORIGINAL_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Original_Training_Advocacy__c';
import FIELD_PREVIOUS_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Previous_Training_Advocacy__c';
import FIELD_PROPOSED_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Training_Advocacy_Value__c';
import FIELD_DRINK_STRATEGY from '@salesforce/schema/Promotion_Material_Item__c.Drink_Strategy__c';
import FIELD_OUTLET_TO_PROVIDE from '@salesforce/schema/Promotion_Material_Item__c.Outlet_To_Provide__c';
import FIELD_COMMENTS from '@salesforce/schema/Promotion_Material_Item__c.Comments_Long__c';

import getProductDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getProductDetails';
import getPSAItemDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSAItemDetails';
import updatePMITotals from '@salesforce/apex/PromotionalSalesAgreement_Controller.updatePMITotals';

import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_PERCENTAGE_CHANGE_ERROR from '@salesforce/label/c.Percentage_Change_Error';
import LABEL_VOLUME_FORECAST_9L from '@salesforce/label/c.Volume9L';
import LABEL_INVALID_INPUT_ERROR from '@salesforce/label/c.Invalid_Input_Error';
import LABEL_DISCOUNT_PER_9LCASE from '@salesforce/label/c.Discount_per_9LCase';
import LABEL_COMMENTS from '@salesforce/label/c.Comments';
import LABEL_SAVING_PLEASE_WAIT from '@salesforce/label/c.Saving_Please_Wait';
import LABEL_LOADING_PLEASE_WAIT from '@salesforce/label/c.Loading_Please_Wait';
import LABEL_INPUT_TEXT_PLACEHOLDER from '@salesforce/label/c.Input_Text_Placeholder';
import LABEL_WARNING from '@salesforce/label/c.Warning_Title';
import LABEL_EMPTYFORM_SAVE_ERROR from '@salesforce/label/c.EmptyForm_Save_Error';
import LABEL_PSA_ABOVE_THRESHOLD_CHANGE_ERROR from '@salesforce/label/c.PSA_Above_Threshold_Change_Error';

export default class PromotionalSalesAgreementItemForm extends NavigationMixin(LightningElement) {
    labels = {
        back                    : { label: LABEL_BACK },
        volumeForecast          : { label: LABEL_VOLUME_FORECAST_9L, error: LABEL_INVALID_INPUT_ERROR.replace('%0', LABEL_VOLUME_FORECAST_9L) },
        discountPerCase         : { label: LABEL_DISCOUNT_PER_9LCASE, error: LABEL_INVALID_INPUT_ERROR.replace('%0', LABEL_DISCOUNT_PER_9LCASE) },
        drinkStrategy           : { help: 'Drink Strategy help' },
        promotionalActivity     : { help: 'Promotional Activity help' },
        trainingAdvocacy        : { help: 'Training & Advocacy help' },
        outletToProvide         : { help: 'Outlet to Provide help' },
        saving                  : { message: LABEL_SAVING_PLEASE_WAIT },
        loading                 : { message: LABEL_LOADING_PLEASE_WAIT },
        available               : { label: 'Available' },
        error                   : { message: 'Errors found validating/saving item details.  Please review and try saving again.' },
        saveError               : { message: 'Error saving item' },
        saveSuccess             : { message: 'All changes saved successfully'},
        comments                : { label: LABEL_COMMENTS, placeholder: LABEL_INPUT_TEXT_PLACEHOLDER },
        thresholdError          : { message: LABEL_PSA_ABOVE_THRESHOLD_CHANGE_ERROR },
        warning                 : { label: LABEL_WARNING },
        emptyFormError          : { message: LABEL_EMPTYFORM_SAVE_ERROR }
    };

    @api psa;
    @api psaId;
    @api psaItemId;
    @api productId;
    @api productName;
    @api promotionId;
    @api isLocked;
    @api isApproved;

    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        try {
            this.currentPageReference = currentPageReference;
            console.log('[psaitemform.setcurrentpagereference] pageref', currentPageReference);
            console.log('[psaitemform.setcurrentpagereference.before] psaItemId, productId', this.psaItemId, this.productId);
            this.psaId = currentPageReference.state.c__psaId;
            this.psaItemId = currentPageReference.state.c__psaItemId;        
            this.productId = currentPageReference.state.c__productId;
            this.promotionId = currentPageReference.state.c__promotionId;
            console.log('[psaitemform.setcurrentpagereference.after] psaItemId, productid', this.psaItemId, this.productId);
            
            
            if (this.wiredProduct != undefined) {
                refreshApex(this.wiredProduct);
            }

            console.log('[psaitemform.setcurrentpagereference.after] wiredPSAItem', this.wiredPSAItem);
            if (this.wiredPSAItem != undefined) {
                refreshApex(this.wiredPSAItem);
            }
        }catch(ex) {
            console.log('[psaitemform.setcurrentpagereference] exception', ex);
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
            console.log('[psaitemform.getproductdetails] psaItemId, psaItem', this.psaItemId, this.psaItem);
            if (this.psaItemId == undefined) {
                this.initialiseItemForm();
            }
            this.finishedLoadingProduct = true;
            if (this.psaItemId == undefined) { this.finishedLoadingDetails = true; }
            if (this.finishedLoadingDetails && this.finishedLoadingObjectInfo) { this.isWorking = false; }
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
            
            this.discount = 0;
            if (value.data.Plan_Rebate__c) {
                this.discount = value.data.Plan_Rebate__c;
                if (value.data.Proposed_Plan_Rebate__c && value.data.Proposed_Plan_Rebate__c != value.data.Plan_Rebate__c) {
                    this.discount = value.data.Proposed_Plan_Rebate__c;
                }
            }


            this.volumeForecast = 0;
            if (value.data.Plan_Volume__c) {
                this.volumeForecast = value.data.Plan_Volume__c;
                if (value.data.Proposed_Plan_Volume__c && value.data.Proposed_Plan_Volume__c != value.data.Plan_Volume__c) {
                    this.volumeForecast = value.data.Proposed_Plan_Volume__c;
                }
            }

            this.listingFee = 0;
            if (value.data.Listing_Fee__c) {
                this.listingFee = value.data.Listing_Fee__c;
                if (value.data.Proposed_Listing_Fee__c && value.data.Proposed_Listing_Fee__c != value.data.Listing_Fee__c) {
                    this.listingFee = value.data.Proposed_Listing_Fee__c;
                }
            }

            this.promotionalActivityAmount = 0;
            if (value.data.Promotional_Activity_Value__c) {
                this.promotionalActivityAmount = value.data.Promotional_Activity_Value__c;
                if (value.data.Proposed_Promotional_Activity_Value__c && value.data.Proposed_Promotional_Activity_Value__c != value.data.Promotional_Activity_Value__c) {
                    this.promotionalActivityAmount = value.data.Proposed_Promotional_Activity_Value__c;
                }
            }

            this.trainingAdvocacyAmount = 0;
            if (value.data.Training_and_Advocacy_Value__c) {
                this.trainingAdvocacyAmount = value.data.Training_and_Advocacy_Value__c;
                if (value.data.Proposed_Advocacy_Training_Value__c && value.data.Proposed_Training_Advocacy_Value__c != value.data.Training_and_Advocacy_Value__c) {
                    this.trainingAdvocacyAmount = value.data.Proposed_Advocacy_Training_Value__c;
                }
            }

            this.comments = value.data.Comments_Long__c;

            //this.brandStatus = value.data.Brand_Status__c;
            this.brandStatusValues = [];
            if (value.data.Brand_Status__c) {
                this.brandStatusValues = value.data.Brand_Status__c.split(';');
            }
            this.drinkStrategyValues = [];
            if (value.data.Drink_Strategy__c) {
                this.drinkStrategyValues = value.data.Drink_Strategy__c.split(';');
            }
            this.promotionalActivityValues = [];
            if (value.data.Promotional_Activity__c) {
                this.promotionalActivityValues = value.data.Promotional_Activity__c.split(';');
            }
            this.trainingAdvocacyValues = [];
            if (value.data.Training_and_Advocacy__c) {
                this.trainingAdvocacyValues = value.data.Training_and_Advocacy__c.split(';');
            }
            this.outletToProvideValues = [];
            if (value.data.Outlet_to_Provide__c) {
                this.outletToProvideValues = value.data.Outlet_to_Provide__c.split(';');
            }

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
    promotionalActivityValues;
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
        const v = this.volumeForecast == undefined || this.volumeForecast == '' ? 0 : parseFloat(this.volumeForecast);
        const d = this.discount == undefined || this.discount == '' ? 0 : parseFloat(this.discount);
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
    renderredCallback() {
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
                //if (this.brandStatusValues && this.brandStatusValues.length > 0) {
                //    const bsoptions = this.selectPicklistValues(this.brandStatusOptions, this.brandStatusValues);
                //    this.brandStatusOptions = [...bsoptions];
                //}
            } else if (picklist === 'Drink_Strategy__c') {
                this.drinkStrategyOptions = this.setFieldOptionsForField(picklistValues, picklist);
                //if (this.drinkStrategyValues && this.drinkStrategyValues.length > 0) {
                //    this.selectPicklistValues(this.drinkStrategyOptions, this.drinkStrategyValues);
                //}
            } else if (picklist === 'Promotional_Activity__c') {
                this.promotionalActivityOptions = this.setFieldOptionsForField(picklistValues, picklist);
                console.log('[psaitemform.setFieldOptions] promotionalActivityOptions', this.promotionalActivityOptions);
                //if (this.promotionalActivityValues && this.promotionalActivityValues.length > 0) {
                //    this.selectPicklistValues(this.promotionalActivityOptions, this.promotionalActivityValues);
                //}
            } else if (picklist === 'Training_and_Advocacy__c') {
                this.trainingAdvocacyOptions = this.setFieldOptionsForField(picklistValues, picklist);
                //if (this.trainingAdvocacyValues && this.trainingAdvocacyValues.length > 0) {
                //    this.selectPicklistValues(this.trainingAdvocacyOptions, this.trainingAdvocacyValues);
                //}
            } else if (picklist === 'Outlet_to_Provide__c') {
                this.outletToProvideOptions = this.setFieldOptionsForField(picklistValues, picklist);
                //if (this.outletToProvideValues && this.outletToProvideValues.length > 0) {
                //    this.selectPicklistValues(this.outletToProvideOptions, this.outletToProvideValues);
                //}
            }
        });

        if (this.isPhone && this.isThisTass) {
            alert('finished loading object info.  loadingproduct: ' + this.finishedLoadingProduct + ', details: ' + this.finishedLoadingDetails);
        }

        this.finishedLoadingObjectInfo = true;
        if (this.finishedLoadingDetails && this.finishedLoadingProduct) { this.isWorking = false; }
        
    }
    
    setFieldOptionsForField(picklistValues, picklist) {        
        console.log('[psaitemform.setFieldOptionsForField] picklist field', picklist);
        return picklistValues[picklist].values.map(item => ({
            label: item.label,
            value: item.value,
            selected: false
        }));
    }

    selectPicklistValues(options, values) {
        console.log('[psaItemForm.selectPicklistValue] options, values', options, values);
        if (options && options.length > 0 && values != undefined && values.length > 0) {            
            options.forEach(o => {
                if (values.includes(o.value)) {
                    o.selected = true;
                }
            });
        }

        return options;
        //console.log('[psaitemform.selectpicklistvalues] options, values', options, values);
    }
    
    initialiseItemForm() {
        console.log('[psaitemform.initialiseitemform]');
        this.discount = 0;
        this.volumeForecast = 0;
        this.listingFee = 0;
        this.promotionalActivityAmount = 0;
        this.trainingAdvocacyAmount = 0;
        this.comments = '';        

        try {
            this.brandStatusValues = [];
            this.drinkStrategyValues = [];
            this.promotionalActivityValues = [];
            this.trainingAdvocacyValues = [];
            this.outletToProvideValues = [];    
        }catch(ex) {
            console.log('[clear] exception', ex);
        }

    }

    /**
     * Handle local component events
     */
    handleCancelButtonClick(event) {
        //this.addClickedClassToElement('cancel');
        this.goBack();
    }
    handleSaveButtonClick() {
        //this.addClickedClassToElement('save');
        try {
            this.workingMessage = this.labels.saving.message;
            this.isWorking = true;
            const isValid = this.validateForm();
            console.log('[psaitemform..handlesavebuttonclick] isValid', isValid);
            if (isValid) {
                this.save();
            } else {
                this.isWorking = false;
            }
        }catch(ex) {
            console.log('[psaitemform.handlesavebuttonclick] exception', ex);
        }
    }
    handleDeleteButtonClick() {
        //this.addClickedClassToElement('delete');
        this.delete();
    }
    handleClearButtonClick() {
        this.initialiseItemForm();
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
            this.volumeForecast = event.detail.value.trim() == '' ? 0 : event.detail.value;
        }catch(ex) {
            console.log('exception', ex);
        }
    }
    handleDiscountChange(event) {
        this.discount = event.detail.value.trim() == '' ? 0 : event.detail.value;
    }
    handleListingFeeChange(event) {
        this.listingFee = event.detail.value.trim() == '' ? 0 : event.detail.value;
    }
    handleDrinkStrategyChange(event) {
        this.drinkStrategyValues = event.detail.value;
    }
    handlePromotionalActivityChange(event) {
        this.promotionalActivityValues = event.detail.value;
    }
    handlePromotionalActivityValueChange(event) {
        this.promotionalActivityAmount = event.detail.value.trim() == '' ? 0 : event.detail.value;
    }
    handleTrainingAdvocacyChange(event) {
        this.trainingAdvocacyValues = event.detail.value;
    }
    handleTrainingAdvocacyValueChange(event) {
        this.trainingAdvocacyAmount = event.detail.value.trim() == '' ? 0 : event.detail.value;
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
            try {
            console.log('el.classlist', el.classList);
            if (el.classList == undefined || el.classList == '' || el.classList.indexOf("clicked") < 0) {
                el.className = el.className + " clicked";
            }
            }catch(ex) {
                console.log('[psaitemform.addClickedClassToElement] exception', ex);                
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
        let msg = 'There are some issues that need your attention\n';
        let isValid = true;

        console.log('[psaitemform.validate] psa', this.psa);
        const empty_Volume = this.volumeForecast == undefined || this.volumeForecast == 0;
        const empty_Rebate = this.discount == undefined || this.discount == 0;
        const empty_ListingFee = this.listingFee == undefined || this.listingFee == 0;
        const empty_PromotionalActivity = this.promotionalActivityValues == undefined || this.promotionalActivityValues.length == 0;
        const empty_PromotionalActivityValue = this.promotionalActivityAmount == undefined || this.promotionalActivityAmount == 0;
        const empty_TrainingAdvocacy = this.trainingAdvocacyValues == undefined || this.trainingAdvocacyValues.length == 0;
        const empty_TrainingAvvocacyValue = this.trainingAdvocacyAmount == undefined || this.trainingAdvocacyAmount == 0;
        const empty_BrandStatus = this.brandStatusValues == undefined || this.brandStatusValues.length == 0;
        const empty_DrinkStrategy = this.drinkStrategyValues == undefined || this.drinkStrategyValues.length == 0;
        const empty_outletToProvide = this.outletToProvideValues == undefined || this.outletToProvideValues.length == 0;
        if (empty_Volume && empty_Rebate && empty_ListingFee && empty_PromotionalActivity && empty_PromotionalActivityValue
            && empty_TrainingAdvocacy && empty_TrainingAvvocacyValue && empty_BrandStatus && empty_DrinkStrategy && empty_outletToProvide) {
            this.showToast('warning', this.labels.warning.label, this.labels.emptyFormError.message);
            isValid = false;
        } else if (this.psa.Is_Approved__c) {
            let total = 0, v = 0, r = 0, l = 0, p = 0, t = 0;
            if (this.psa && this.psa.Promotion_Material_Items__r) {
                this.psa.Promotion_Material_Items__r.forEach(pmi => {
                    if (this.psaItem == undefined || pmi.Id != this.psaItem.Id) {
                        v = parseFloat(pmi.Plan_Volume__c) || 0;
                        r = parseFloat(pmi.Plan_Rebate__c) || 0;
                        l = parseFloat(pmi.Listing_Fee__c) || 0;
                        p = parseFloat(pmi.Promotional_Activity_Value__c) || 0;
                        t = parseFloat(pmi.Training_and_Advocacy_Value__c) || 0;
    
                        total += (v * r) + l + p + t;    
                    }
                });    
            }
            
            console.log('[psaitemform.validate] total', total);
            v = parseFloat(this.volumeForecast) || 0;
            r = parseFloat(this.discount) || 0;
            l = parseFloat(this.listingFee) || 0;
            p = parseFloat(this.promotionalActivityAmount) || 0;
            t = parseFloat(this.trainingAdvocacyAmount) || 0;
            total += (v * r) + l + p + t;
            console.log('[psaitemform.validate] v, r, l, p, t', v, r, l, p, t);
            console.log('[psaitemform.validate] total', total);

            if (this.psa.Original_Total_Investment__c && this.psa.Original_Total_Investment__c > 0) {
                const diff = Math.abs(total - this.psa.Original_Total_Investment__c);
                let threshold = 0;
                if (this.psa.Market__r.Change_Threshold_Amount__c == undefined) {
                    const thresholdPercentage = parseFloat(this.psa.Market__r.Promotion_Discount_Threshold__c) || 0;
                    threshold = parseFloat(this.psa.Original_Total_Investment__c) * 0;
                } else {
                    threshold = parseFloat(this.psa.Market__r.Change_Threshold_Amount__c);
                }

                console.log('[psaitemform.validate] original', this.psa.Original_Total_Investment__c);
                console.log('[psaitemform.validate] diff', diff);
                console.log('[psaitemform.validate] threshold', threshold);
                if (diff > threshold) {
                    const thresholdString = `${CURRENCY_CODE}  ${threshold}`;
                    this.showToast('warning', this.labels.warning.label, this.labels.thresholdError.message.replace('{0}', thresholdString));
                    isValid = false;        
                }
            }
            
        }
        console.log('[psaitems.validate] isvalie, volume, discount', isValid, this.hasVolumeForecastError, this.hasDiscountError);
        return isValid;
    }
    save() {
        console.log('[psaitemform.save]');
        this.isWorking = true;
        try {
            const fields = {};
            fields[FIELD_PRODUCT.fieldApiName] = this.productId;
            fields[FIELD_BRAND_STATUS.fieldApiName] = this.brandStatusValues.join(';');
            
            fields[FIELD_DRINK_STRATEGY.fieldApiName] = this.drinkStrategyValues.join(';');
            fields[FIELD_PROMOTIONAL_ACTIVITY.fieldApiName] = this.promotionalActivityValues.join(';');
            fields[FIELD_TRAINING_ADVOCACY.fieldApiName] = this.trainingAdvocacyValues.join(';');
            fields[FIELD_OUTLET_TO_PROVIDE.fieldApiName] = this.outletToProvideValues.join(';');
            fields[FIELD_COMMENTS.fieldApiName] = this.comments;

            fields[FIELD_PROPOSED_PLAN_VOLUME.fieldApiName] = this.volumeForecast;
            fields[FIELD_PROPOSED_PLAN_REBATE.fieldApiName] = this.discount;
            fields[FIELD_PROPOSED_LISTING_FEE.fieldApiName] = this.listingFee;
            fields[FIELD_PROPOSED_PROMOTIONAL_ACTIVITY.fieldApiName] = this.promotionalActivityAmount;
            fields[FIELD_PROPOSED_TRAINING_ADVOCACY.fieldApiName] = this.trainingAdvocacyAmount;

            if (this.isApproved == false || this.psaItemId == null) {
                fields[FIELD_ORIGINAL_PLAN_VOLUME.fieldApiName] = this.volumeForecast;
                fields[FIELD_ORIGINAL_PLAN_REBATE.fieldApiName] = this.discount;
                fields[FIELD_ORIGINAL_LISTING_FEE.fieldApiName] = this.listingFee;
                fields[FIELD_ORIGINAL_PROMOTIONAL_ACTIVITY.fieldApiName] = this.promotionalActivityAmount;
                fields[FIELD_ORIGINAL_TRAINING_ADVOCACY.fieldApiName] = this.trainingAdvocacyAmount;
            }
            
            if (this.psaItemId != null) {
                if (this.isApproved == false) {
                    fields[FIELD_PLAN_REBATE.fieldApiName] = this.discount;
                    fields[FIELD_VOLUME_FORECAST.fieldApiName] = this.volumeForecast;
                    fields[FIELD_LISTING_FEE.fieldApiName] = this.listingFee;
                    fields[FIELD_PROMOTIONAL_ACTIVITY_VALUE.fieldApiName] = this.promotionalActivityAmount;
                    fields[FIELD_TRAINING_ADVOCACY_VALUE.fieldApiName] = this.trainingAdvocacyAmount;    
                }
                fields[FIELD_PREVIOUS_PLAN_VOLUME.fieldApiName] = this.psaItem.Plan_Volume__c;
                fields[FIELD_PREVIOUS_PLAN_REBATE.fieldApiName] = this.psaItem.Plan_Rebate__c;
                fields[FIELD_PREVIOUS_LISTING_FEE.fieldApiName] = this.psaItem.Listing_Fee__c;
                fields[FIELD_PREVIOUS_PROMOTIONAL_ACTIVITY.fieldApiName] = this.psaItem.Promotional_Activity_Value__c;
                fields[FIELD_PREVIOUS_TRAINING_ADVOCACY.fieldApiName] = this.psaItem.Training_and_Advocacy_Value__c;
            } else {
                fields[FIELD_PLAN_REBATE.fieldApiName] = this.discount;
                fields[FIELD_VOLUME_FORECAST.fieldApiName] = this.volumeForecast;
                fields[FIELD_LISTING_FEE.fieldApiName] = this.listingFee;
                fields[FIELD_PROMOTIONAL_ACTIVITY_VALUE.fieldApiName] = this.promotionalActivityAmount;
                fields[FIELD_TRAINING_ADVOCACY_VALUE.fieldApiName] = this.trainingAdvocacyAmount;    

                fields[FIELD_PREVIOUS_PLAN_VOLUME.fieldApiName] = this.volumeForecast;
                fields[FIELD_PREVIOUS_PLAN_REBATE.fieldApiName] = this.discount;
                fields[FIELD_PREVIOUS_LISTING_FEE.fieldApiName] = this.listingFee;
                fields[FIELD_PREVIOUS_PROMOTIONAL_ACTIVITY.fieldApiName] = this.promotionalActivityAmount;
                fields[FIELD_PREVIOUS_TRAINING_ADVOCACY.fieldApiName] = this.trainingAdvocacyAmount;
            }

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

                if (this.isApproved) {
                    this.updatePSAStatus("Updated");
                }
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

                if (this.isApproved) {
                    this.updatePSAStatus("Updated");
                }
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

    updatePSAStatus(status) {
        const fields = {};
        fields[FIELD_PROMOTION_ACTIVITY_ID.fieldApiName] = this.psaId;
        fields[FIELD_PROMOTION_ACTIVITY_STATUS.fieldApiName] = status;
        fields[FIELD_HAS_ACTUAL_TOTALS.fieldApiName] = false;

        const record = { fields };
        updateRecord(record)
            .then(() => {                
                this.isWorking = false;
                this.dispatchEvent(new CustomEvent('updated'));                
            })
            .catch(error => {
                this.isWorking = false;
                console.log('[updatePSAStatsu] error', error);
            });
        
    }
}