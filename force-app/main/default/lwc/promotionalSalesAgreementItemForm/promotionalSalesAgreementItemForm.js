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
import FIELD_BRAND_VISIBILITY from '@salesforce/schema/Promotion_Material_Item__c.Brand_Visibility__c';
import FIELD_PRODUCT_VISIBILITY from '@salesforce/schema/Promotion_Material_Item__c.Product_Visibility__c';
import FIELD_PSA_FREE_BOTTLE_COST from '@salesforce/schema/Promotion_Material_Item__c.PSA_Free_Bottle_Cost__c';
import FIELD_FREE_GOODS_QUANTITY from '@salesforce/schema/Promotion_Material_Item__c.Free_Bottle_Quantity__c';
import FIELD_FREE_GOODS_GIVEN_DATE from '@salesforce/schema/Promotion_Material_Item__c.Free_Goods_Given_Date__c';
import FIELD_FREE_GOODS_REASON from '@salesforce/schema/Promotion_Material_Item__c.Free_Goods_Reason__c';
import FIELD_VOLUME_FORECAST from '@salesforce/schema/Promotion_Material_Item__c.Plan_Volume__c';
import FIELD_ORIGINAL_PLAN_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Original_Plan_Volume__c';
import FIELD_PREVIOUS_PLAN_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Previous_Plan_Volume__c';
import FIELD_PROPOSED_PLAN_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Plan_Volume__c';
import FIELD_CURRENT_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Current_Volume__c';
import FIELD_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Plan_Rebate__c';
import FIELD_ORIGINAL_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Original_Plan_Rebate__c';
import FIELD_PREVIOUS_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Previous_Plan_Rebate__c';
import FIELD_PROPOSED_PLAN_REBATE from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Plan_Rebate__c';
import FIELD_PLAN_REBATE_PERCENTAGE from '@salesforce/schema/Promotion_Material_Item__c.Plan_Rebate_Percentage__c';
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
import FIELD_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Training_and_Advocacy__c';
import FIELD_TRAINING_ADVOCACY_VALUE from '@salesforce/schema/Promotion_Material_Item__c.Training_and_Advocacy_Value__c';
import FIELD_ORIGINAL_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Original_Training_Advocacy__c';
import FIELD_PREVIOUS_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Previous_Training_Advocacy__c';
import FIELD_PROPOSED_TRAINING_ADVOCACY from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Training_Advocacy_Value__c';
import FIELD_BRAND_SUPPORT from '@salesforce/schema/Promotion_Material_Item__c.Brand_Support__c';
import FIELD_ORIGINAL_BRAND_SUPPORT from '@salesforce/schema/Promotion_Material_Item__c.Original_Brand_Support__c';
import FIELD_PREVIOUS_BRAND_SUPPORT from '@salesforce/schema/Promotion_Material_Item__c.Previous_Brand_Support__c';
import FIELD_PROPOSED_BRAND_SUPPORT from '@salesforce/schema/Promotion_Material_Item__c.Proposed_Brand_Support__c';
import FIELD_DRINK_STRATEGY from '@salesforce/schema/Promotion_Material_Item__c.Drink_Strategy__c';
import FIELD_OUTLET_TO_PROVIDE from '@salesforce/schema/Promotion_Material_Item__c.Outlet_to_Provide__c';
import FIELD_COMMENTS from '@salesforce/schema/Promotion_Material_Item__c.Comments_Long__c';
import FIELD_PLAN_PSA_GROSS_PROFIT from '@salesforce/schema/Promotion_Material_Item__c.Plan_PSA_Gross_Profit__c';
import FIELD_PLAN_REBATE_VOLUME from '@salesforce/schema/Promotion_Material_Item__c.Plan_Rebate_Volume__c';
import FIELD_PLAN_REBATE_LIABILITY from '@salesforce/schema/Promotion_Material_Item__c.Plan_Rebate_Liability__c';
import FIELD_PRODUCT_PRICE from '@salesforce/schema/Promotion_Material_Item__c.Product_Price__c';
import FIELD_PLAN_PSA_ROI from '@salesforce/schema/Promotion_Material_Item__c.Plan_PSA_ROI__c';
import FIELD_GROSS_PROFIT_per_CASE_9L from '@salesforce/schema/Promotion_Material_Item__c.Gross_Profit_per_Case_9L__c';
import FIELD_PLAN_PSA_GP_per_Case from '@salesforce/schema/Promotion_Material_Item__c.Plan_PSA_GP_per_Case__c';

import getProductDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getProductDetails';
import getPSAItemDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSAItemDetails';
import updatePMITotals from '@salesforce/apex/PromotionalSalesAgreement_Controller.updatePMITotals';
import updatePSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.updatePSA';
import updateSpreadForPMI from '@salesforce/apex/PromotionalSalesAgreement_Controller.updateSpreadForPMI';

import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_BREAK_EVEN from '@salesforce/label/c.Break_Even';
import LABEL_COMMENTS from '@salesforce/label/c.Comments';
import LABEL_COST from '@salesforce/label/c.Cost';
import LABEL_CURRENT_VOLUME from '@salesforce/label/c.CurrentVolume';
import LABEL_DISCOUNT_PER_BOTTLE from '@salesforce/label/c.Discount_per_Bottle';
import LABEL_DISCOUNT_PER_9LCASE from '@salesforce/label/c.Discount_per_9LCase';
import LABEL_DISCOUNT_PERCENT from '@salesforce/label/c.Discount_Percent';
import LABEL_EMPTYFORM_SAVE_ERROR from '@salesforce/label/c.EmptyForm_Save_Error';
import LABEL_FREE_GOODS from '@salesforce/label/c.Free_Goods';
import LABEL_FREE_GOODS_GIVEN_DATE from '@salesforce/label/c.Free_Goods_Given_Date';
import LABEL_FREE_GOOD_REASON from '@salesforce/label/c.Free_Goods_Reason';
import LABEL_GROSS_PROFIT from '@salesforce/label/c.Gross_Profit';
import LABEL_PERCENTAGE_CHANGE_ERROR from '@salesforce/label/c.Percentage_Change_Error';
import LABEL_INPUT_TEXT_PLACEHOLDER from '@salesforce/label/c.Input_Text_Placeholder';
import LABEL_INVALID_INPUT_ERROR from '@salesforce/label/c.Invalid_Input_Error';
import LABEL_INVALID_INTEGER from '@salesforce/label/c.Invalid_Integer';
import LABEL_LIABILITY from '@salesforce/label/c.Liability';
import LABEL_LOADING_PLEASE_WAIT from '@salesforce/label/c.Loading_Please_Wait';
import LABEL_PSA_ABOVE_THRESHOLD_CHANGE_ERROR from '@salesforce/label/c.PSA_Above_Threshold_Change_Error';
import LABEL_QUANTITY from '@salesforce/label/c.Quantity';
import LABEL_REASON from '@salesforce/label/c.Reason';
import LABEL_ROI from '@salesforce/label/c.Roi';
import LABEL_SAVING_PLEASE_WAIT from '@salesforce/label/c.Saving_Please_Wait';
import LABEL_SPLIT from '@salesforce/label/c.Split';
import LABEL_TOTAL_INVESTMENT from '@salesforce/label/c.Total_Investment';
import LABEL_VOLUME_FORECAST_9L from '@salesforce/label/c.Volume9L';
import LABEL_VOLUME_FORECAST_BTL from '@salesforce/label/c.VolumeBottle';
import LABEL_WARNING from '@salesforce/label/c.Warning_Title';

export default class PromotionalSalesAgreementItemForm extends NavigationMixin(LightningElement) {
    labels = {
        available               : { label: 'Available' },
        back                    : { label: LABEL_BACK },
        breakEven               : { label: LABEL_BREAK_EVEN },
        comments                : { label: LABEL_COMMENTS, placeholder: LABEL_INPUT_TEXT_PLACEHOLDER },
        cost                    : { label: LABEL_COST },
        currentVolume           : { label: LABEL_CURRENT_VOLUME },
        discountPerBottle       : { label: LABEL_DISCOUNT_PER_BOTTLE },
        discountPerCase         : { label: LABEL_DISCOUNT_PER_9LCASE, error: LABEL_INVALID_INPUT_ERROR.replace('%0', LABEL_DISCOUNT_PER_9LCASE) },
        discountPercent         : { label: LABEL_DISCOUNT_PERCENT },
        drinkStrategy           : { help: 'Drink Strategy help' },
        emptyFormError          : { message: LABEL_EMPTYFORM_SAVE_ERROR },
        error                   : { message: 'Errors found validating/saving item details.  Please review and try saving again.' },
        freeGoods               : { label: LABEL_FREE_GOODS },
        freeGoodsGivenDate      : { label: LABEL_FREE_GOODS_GIVEN_DATE },
        freeGoodsReason         : { label: LABEL_FREE_GOOD_REASON },
        grossProfit             : { label: LABEL_GROSS_PROFIT },
        invalidNumber           : { message: LABEL_INVALID_INTEGER },
        liability               : { label: LABEL_LIABILITY },
        loading                 : { message: LABEL_LOADING_PLEASE_WAIT },
        promotionalActivity     : { help: 'Promotional Activity help' },
        quantity                : { label: LABEL_QUANTITY },
        reason                  : { label: LABEL_REASON },
        roi                     : { label: LABEL_ROI },
        outletToProvide         : { help: 'Outlet to Provide help' },
        saving                  : { message: LABEL_SAVING_PLEASE_WAIT },
        saveError               : { message: 'Error saving item' },
        saveSuccess             : { message: 'All changes saved successfully'},
        split                   : { label: LABEL_SPLIT },
        thresholdError          : { message: LABEL_PSA_ABOVE_THRESHOLD_CHANGE_ERROR },
        trainingAdvocacy        : { help: 'Training & Advocacy help' },
        totalInvestment         : { label: LABEL_TOTAL_INVESTMENT },
        volumeForecast          : { label: LABEL_VOLUME_FORECAST_9L, error: LABEL_INVALID_INPUT_ERROR.replace('%0', LABEL_VOLUME_FORECAST_9L) },
        volumeForecastBtl       : { label: LABEL_VOLUME_FORECAST_BTL, error: LABEL_INVALID_INPUT_ERROR.replace('%0', LABEL_VOLUME_FORECAST_BTL) },
        warning                 : { label: LABEL_WARNING },
    };

    @api psa;
    @api psaId;
    @api psaItemId;
    @api psaRecordTypeName;
    @api productId;
    @api productName;
    @api promotionId;
    @api isLocked;
    @api isApproved;
    @api calcSplit;
    @api totalBudget;
    @api captureFreeGoods;
    @api captureVolumeInBottles;
    @api captureRebatePerBottle;
    @api showGrossProfit;
    @api fieldSet;

    _totalPlannedSpend = 0;
    @api 
    get totalPlannedSpend() {
        return this._totalPlannedSpend;
    }
    set totalPlannedSpend(value) {
        this._totalPlannedSpend = value;
    }

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

        console.log('[getObjectInfo] data', data);
        console.log('[getObjectInfo] error', error);
        if (data) {
            this.error = undefined;
            this.objectInfo = data;
            this.getRecordTypeId();
            this.setFieldLabels();
            console.log('finishedLoadingObjectInfo', this.finishedLoadingObjectInfo);
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
        return this.product == undefined || this.product.Image_Name__c == undefined || this.product.Image_Name__c == '' ? '' : 'https://salesforce-static.b-fonline.com/images/' + this.product.Image_Name__c;
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
            this.psaItem = {...value.data};

            //this.psaItemId = value.data.Id;
            this.productId = value.data.Product_Custom__c;
            this.product = {
                Id: value.data.Product_Custom__c,
                Name: value.data.Product_Name__c,
                Image_Name__c: value.data.Product_Custom__r.Image_Name__c
            };
            
            this.productSplit = parseFloat(value.data.Product_Split__c);
            this.totalPlannedSpend = parseFloat(value.data.Activity__r.Total_Planned_Spend__c);
            this.discount = value.data.Plan_Rebate__c || 0;
            if (value.data.Proposed_Plan_Rebate__c && value.data.Proposed_Plan_Rebate__c != value.data.Plan_Rebate__c) {
                this.discount = value.data.Proposed_Plan_Rebate__c;
            }

            this.discountPercent = value.data.Plan_Rebate_Percentage__c || 0;

            let freeGoodsVolume = value.data.Free_Bottle_Quantity__c || 0;
            //this.freeGoodGivenDate = value.data.Free_Goods_Given_Date__c || null;

            let cVolume = value.data.Current_Volume__c || 0;
            if (this.captureVolumeInBottles || value.data.Activity__r.Market__r.Capture_Volume_in_Bottles__c) {
                cVolume = cVolume * (value.data.Product_Pack_Qty__c == undefined ? 1 : value.data.Product_Pack_Qty__c);
            }
            this.currentVolume = cVolume;

            let volume = value.data.Plan_Volume__c || 0;
            if (value.data.Proposed_Plan_Volume__c && value.data.Proposed_Plan_Volume__c != value.data.Plan_Volume__c) {
                volume = value.data.Proposed_Plan_Volume__c;
            }
            if (this.captureVolumeInBottles || value.data.Activity__r.Market__r.Capture_Volume_in_Bottles__c) {
                volume = volume * (value.data.Product_Pack_Qty__c == undefined ? 1 : value.data.Product_Pack_Qty__c);
                //freeGoodsVolume = freeGoodsVolume * (value.data.Product_Pack_Qty__c == undefined ? 1 : value.data.Product_Pack_Qty__c);
            }
            this.volumeForecast = volume;
            this.freeGoodQty = freeGoodsVolume;
            console.log('[psaItemForm] captureVolumeInBottles', this.captureVolumeInBottles);
            console.log('[psaItemForm] volumeForecast', volume);
            this.listingFee = value.data.Listing_Fee__c || 0;
            if (value.data.Proposed_Listing_Fee__c && value.data.Proposed_Listing_Fee__c != value.data.Listing_Fee__c) {
                this.listingFee = value.data.Proposed_Listing_Fee__c;
            }

            this.promotionalActivityAmount = value.data.Promotional_Activity_Value__c || 0;
            if (value.data.Proposed_Promotional_Activity_Value__c && value.data.Proposed_Promotional_Activity_Value__c != value.data.Promotional_Activity_Value__c) {
                this.promotionalActivityAmount = value.data.Proposed_Promotional_Activity_Value__c;
            }

            this.trainingAdvocacyAmount = value.data.Training_and_Advocacy_Value__c || 0;
            if (value.data.Proposed_Advocacy_Training_Value__c && value.data.Proposed_Training_Advocacy_Value__c != value.data.Training_and_Advocacy_Value__c) {
                this.trainingAdvocacyAmount = value.data.Proposed_Advocacy_Training_Value__c;
            }

            this.brandSupport = value.data.Brand_Support__c || 0;

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
            this.freeGoodReasonValues = [];
            if (value.data.Free_Goods_Reason__c) {
                this.freeGoodReasonValues = value.data.Free_Goods_Reason__c.split(';');
            }
            this.brandVisibilityValues = [];
            if (value.data.Brand_Visibility__c) {
                this.brandVisibilityValues = value.data.Brand_Visibility__c.split(';');
            }
            this.productVisibilityValues = [];
            if (value.data.Product_Visibility__c) {
                this.productVisibilityValues = value.data.Product_Visibility__c.split(';');
            }

            this.finishedLoadingDetails = true;
            if (this.finishedLoadingObjectInfo && this.finishedLoadingProduct) { this.isWorking = false; }
            console.log('[psaItemForm.getpsaitemdetails] finishedloadingdetails, objectinof, product', this.finishedLoadingDetails, this.finishedLoadingObjectInfo, this.finishedLoadingProduct);

        }
    }
    
    get isUKMarket() {
        return this.psa != undefined && this.psa.Market__r != undefined && this.psa.Market__r.Name == 'United Kingdom';
    }
    get isMexico() {
        return this.psa != undefined && this.psa.Market__r != undefined && this.psa.Market__r.Name == 'Mexico';
    }
    get isJapan() {
        return this.psa != undefined && this.psa.Market__r != undefined && this.psa.Market__r.Name == 'Japan';
    }
    get captureCurrentVolume() {
        return this.fieldSet != null && this.fieldSet.Current_Volume__c != null;
    }
    get captureRebate() {
        //return this.isUKMarket;
        return this.fieldSet != null && this.fieldSet.Plan_Rebate__c != null;
    }
    get captureRebatePercent() {
        //return this.isMexico;
        return this.fieldSet != null && this.fieldSet.Plan_Rebate_Percentage__c != null;
    }
    get captureListingFee() {
        //return this.isUKMarket || this.isMexico;
        return this.fieldSet != null && this.fieldSet.Listing_Fee__c != null;
    }
    get capturePromotionalActivityAmount() {
        return this.fieldSet != null && this.fieldSet.Promotional_Activity_Value__c != null;
    }
    get capturePromotionalActivity() {
        //return this.isUKMarket || this.isMexico;
        return this.fieldSet != null && this.fieldSet.Promotional_Activity__c != null;
    }
    get captureTrainingAndAdvocacy() {
        return this.fieldSet != null && this.fieldSet.Training_and_Advocacy__c != null;
    }
    get captureBrandSupport() {
        return this.fieldSet != null && this.fieldSet.Brand_Support__c != null;
    }
    get captureBrandVisibility() {
        //return this.isMexico;
        console.log('captureBrandVisibility', this.fieldSet != null && this.fieldSet.Brand_Visibility__c != null);
        return this.fieldSet != null && this.fieldSet.Brand_Visibility__c != null;
    }
    get captureProductVisibility() {
        //return this.isMexico;
        console.log('captureProductVisibility', this.fieldSet != null && this.fieldSet.Product_Visibility__c != null);
        return this.fieldSet != null && this.fieldSet.Product_Visibility__c != null;
    }
    get captureBrandStatus() {
        return this.fieldSet != null && this.fieldSet.Brand_Status__c != null;
    }
    get captureDrinkStrategy() {
        return this.fieldSet != null && this.fieldSet.Drink_Strategy__c != null;
    }
    get captureOutletToProvide() {
        return this.fieldSet != null && this.fieldSet.Outlet_to_Provide__c != null;
    }
    get captureComments() {
        return this.fieldSet != null && this.fieldSet.Comments_Long__c != null;
    }

    get canDelete() {
        console.log('[psaItemForm.canDelete] isApproved, psaItemId', this.isApproved, this.psaItemId);
        return (!this.isApproved && this.psaItemId != undefined);
        //return this.psaItem != undefined;
    }
    get isDisabled() {
        console.log('[psaItemForm] isLocked, isMexico, isEditable', this.isLocked, this.isMexico, this.isLocked && this.isMexico);
        return this.isLocked && this.isMexico;
    }

    get psaTotalInvestment() {
        return this.psaItem == undefined ? 0 : parseFloat(this.psa.Total_Investment__c);
    }
    get psaOriginalTotalInvestment() {
        return this.psaItem = undefined ? 0 : parseFloat(this.psa.Original_Total_Investment__c);
    }

    finishedLoadingDetails = false;
    finishedLoadingObjectInfo = false;
    finishedLoadingProduct = false;
    isWorking = true;
    workingMessage = this.labels.loading.message;  
    requiresApproval = false;  
    isChangeAboveThreshold = false;

    brandStatusValues;
    brandStatusOptions;
    brandStatusLabel = 'Brand Status';
    brandStatusPlaceholder = '';

    currentVolume = 0;
    currentVolumeLabel = this.labels.currentVolume.label;

    volumeForecast = 0;
    volumeForecastLabel = 'Volume Forecast';
    hasVolumeForecastError;

    discount = 0;
    discountPercent = 0;
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

    brandSupport = 0;
    brandSupportLabel = 'Brand Support';
    brandSupportPlaceholder = '';
    outletToProvideValues;
    outletToProvideOptions;
    outletToProvideLabel = 'Outlet to Provide';
    outletToProvidePlaceholder;

    freeGoodQty = 0;
    freeGoodGivenDate;
    freeGoodReasonValues;
    freeGoodReasonOptions;

    brandVsibilityLabel = 'Brand Visibility';
    brandVisibilityValues;
    brandVisibilityOptions;
    brandVisibilityPlaceholder;
    productVisibilityLabel = 'Product Visibility';
    productVisibilityValues;
    productVisibilityOptions;
    productVisibilityPlaceholder;

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
    
    productSplit = 0;
    get calcProductSplit() {
        console.log('[psaItemForm.calcProductSplit] psaItem', this.pasItem);
        console.log('[psaItemForm.calcProductSplit] psaItemId', this.pasItemId);
        console.log('[psaItemForm.calcProductSplit] product', this.product);
        console.log('[psaItemForm.calcProductSplit] packQty', this.product.Pack_Quantity__c);
        console.log('[psaItemForm.calcProductSplit] gp', this.product.Gross_Profit_per_Case__c);

        const pq = this.product.Pack_Quantity__c == undefined ? 1 : parseInt(this.product.Pack_Quantity__c);
        const us = this.product.Unit_Size__c == undefined ? 1 : parseInt(this.product.Unit_Size__c);
        const gp = this.product.Gross_Profit_per_Case__c == undefined ? 0 : parseFloat(this.product.Gross_Profit_per_Case__c);
        const v = this.volumeForecast == undefined || this.volumeForecast == '' ? 0 : parseFloat(this.volumeForecast);
        const case9lt = (v * us) / 9000;
        const goalPrice = case9lt * gp;
        let tps = 0;
        if (this.totalPlannedSpend == 0) {
            tps = goalPrice;
        } else {
            tps = this.totalPlannedSpend;
            if (this.psaItem == null || this.psaItemId == undefined || this.psaItemId == '') {
                tps += goalPrice;
            }
        } 
        let productSplit = (goalPrice / tps) * this.totalBudget;

        console.log('[psaItemForm.calcProductSplit] product', this.product);
        console.log('[psaItemForm.calcProductSplit] psaItem', this.pasItem);
        console.log('[psaItemForm.calcProductSplit] psaItemId', this.pasItemId);
        console.log('[psaItemForm.calcProductSplit] totalPlannedSpend', this.totalPlannedSpend);
        console.log('[psaItemForm.calcProductSplit] packQty', pq);
        console.log('[psaItemForm.calcProductSplit] unit size', us);
        console.log('[psaItemForm.calcProductSplit] gp', gp);
        console.log('[psaItemForm.calcProductSplit] totalBudget', this.totalBudget);
        console.log('[psaItemForm.calcProductSplit] volume', v);
        console.log('[psaItemForm.calcProductSplit] 9lt cases', case9lt);
        console.log('[psaItemForm.calcProductSplit] goalPrice', goalPrice);
        console.log('[psaItemForm.calcProductSplit] tps', tps);
        console.log('[psaItemForm.calcProductSplit] productSplit', this.productSplit);
        
        return productSplit;
    }

    get thisProductGP() {
        let v = this.volumeForecast == undefined || this.volumeForecast == '' ? 0 : Math.round(parseFloat(this.volumeForecast));
        let gpPerCase = this.product == undefined || this.product.Gross_Profit_Flat_Case__c == undefined ? 0 : parseFloat(this.product.Gross_Profit_Flat_Case__c);
        const packQty = this.product.Pack_Quantity__c == undefined ? 1 : parseInt(this.product.Pack_Quantity__c);
        if (this.isJapan) {
            gpPerCase = this.product == undefined || this.product.Gross_Profit_per_Case__c == undefined ? 0 : parseFloat(this.product.Gross_Profit_per_Case__c);
        }
        if (this.psa.Activity_Type__c != 'Coupon') {
            v += this.planRebateVolume;
        }

        let productGP = v * gpPerCase;
        if (this.psa.Market__r.Capture_Volume_in_Bottles__c) {
            productGP = (v / packQty) * gpPerCase;
        }
        
        console.log('[psaItemForm.thisProductGP] gpPerCase', gpPerCase);
        console.log('[psaItemForm.thisProductGP] activityType', this.psa.Activity_Type__c);
        console.log('[psaItemForm.thisProductGP] planRebateVolume', this.planRebateVolume);
        console.log('[psaItemForm.thisProductGP] volume', v);
        console.log('[psaItemForm.thisProductGP] packQty', packQty);
        console.log('[psaItemForm.thisProductGP] productGP', productGP);
    
        return productGP;
    }

    get gpPerCase() {
        let v = this.product == undefined || this.product.Gross_Profit_Flat_Case__c == undefined ? 1 : parseFloat(this.product.Gross_Profit_Flat_Case__c);
        if (this.isJapan) {
            v = this.product == undefined || this.product.Gross_Profit_per_Case__c == undefined ? 0 : parseFloat(this.product.Gross_Profit_per_Case__c);
        }
        return v;
    }

    get totalCost() {
        return (this.volumeForecast * this.discount) + parseFloat(this.listingFee);
    }

    get currentVolumeGP() {
        console.log('[currentVolumeGP] gpPerCase', this.gpPerCase);
        return parseFloat(this.gpPerCase) * parseFloat(this.currentVolume);
    }

    get planGPperCase() {
        return parseFloat(this.gpPerCase) * parseFloat(this.volumeForecast);
    }

    get planGPAfterCost() {
        console.log('[planGPAfterCost] planGPperCase', this.planGPperCase);
        console.log('[planGPAfterCost] totalCost', this.totalCost);
        return this.planGPperCase - this.totalCost;
    }

    get currentGPperCase() {
        console.log('[currentGPperCase] currentVolumeGP', this.currentVolumeGP);
        return this.currentVolume == 0 ? 0 : this.currentVolumeGP / this.currentVolume;
    }

    get planGPperCaseAfterCost() {
        console.log('[planGPperCaseAfterCost] planGPAfterCost', this.planGPAfterCost);
        return this.volumeForecast == 0 ? 0 : this.planGPAfterCost / this.volumeForecast;
    }

    get planROI() {
        console.log('[planROI] productGP', this.thisProductGP);
        console.log('[planROI] totalCost', this.totalCost);
        console.log('[planROI] planROI', this.totalCost == 0 ? 0 : (this.thisProductGP - this.currentVolumeGP) / this.totalCost);
        return this.totalCost == 0 ? 0 : (this.thisProductGP - this.currentVolumeGP) / this.totalCost;
    }

    get breakEven() {
        console.log('[breakEven] planGPperCaseAfterCost', this.planGPperCaseAfterCost);
        console.log('[breakEven] currentGPperCase', this.currentGPperCase);
        console.log('[breakEven] breakEven', this.planGPperCaseAfterCost == 0 ? 0 : this.currentGPperCase / this.planGPperCaseAfterCost - 1);
        return this.planGPperCaseAfterCost == 0 ? 0 : this.currentGPperCase / this.planGPperCaseAfterCost - 1;
    }

    get freeGoodsLabel() {
        return `${this.labels.freeGoods.label} (${this.labels.cost.label}: $ ${this.freeGoodCost.toFixed(2)})`;
    }
    
    get freeGoodCost() {
        const unitCost = this.product.Unit_Cost__c == undefined ? 0 : parseFloat(this.product.Unit_Cost__c);
        return this.freeGoodQty * unitCost;
    }
    get planRebateVolume() {
        let v1 = this.volumeForecast * (this.discountPercent / 100);
        let v2 = parseInt(v1);
        let v3 = v1 - v2;
        let v = v3 <= 0.5 ? v2 : Math.round(v1);
        console.log('[psaItemForm.planRebateVolume] v, v1, v2, v3', v, v1, v2, v3);
        return v;
    }
    get discountPercentLabel() {
        return `${this.labels.discountPercent.label} (${this.labels.liability.label}: ${this.planRebateVolume.toFixed(0)})`;
    }
    get rebateLiability() {
        //const price = this.product.Price_per_Case__c == undefined ? 0 : parseFloat(this.product.Price_per_Case__c);    
        const price = this.product.Wholesale_Price__c == undefined ? 0 : parseFloat(this.product.Wholesale_Price__c);
        const packQty = this.product.Pack_Quantity__c == undefined ? 1 : parseInt(this.product.Pack_Quantity__c);
        console.log('[psaItemForm.rebateLiability] product', this.product);
        console.log('[psaItemForm.rebateLiability] price', price);
        console.log('[psaItemForm.rebateLiability] packQty', packQty);
        console.log('[psaItemForm.rebateLiability] rebateVolume', this.planRebateVolume);    
        //return ((this.planRebateVolume / packQty) * price * 1.05).toFixed(2);
        return (this.planRebateVolume * price * 1.05).toFixed(2);
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
        console.log('[psaItemForm.getRecordTypeId] objectInfo', this.objectInfo);
        if (this.objectInfo.recordTypeInfos) {
            //console.log('[psaitemform.getrecordtypeid] objectinfo', this.objectInfo);
            const rtis = this.objectInfo.recordTypeInfos;
            //console.log('[psaitemform.getrecordtypeid] rtis', rtis);
            let rtKey = this.psaRecordTypeName == undefined ? 'UK - PSA' : this.psaRecordTypeName;
            console.log('[psaItemForm.getRecordTypeId] rtKey', rtKey);
            this.recordTypeId = Object.keys(rtis).find(rti => rtis[rti].name === rtKey);
            console.log('[psaItemForm.getRecordTypeId] recordTypeId', this.recordTypeId);
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
        if (this.objectInfo.fields["Current_Volume__c"]) {
            this.currentVolumeLabel = this.objectInfo.fields["Current_Volume__c"].label;
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
        if (this.objectInfo.fields["Brand_Support__c"]) {
            this.brandSupportLabel = this.objectInfo.fields["Brand_Support__c"].label;
            this.brandSupportPlaceholder = this.objectInfo.fields["Brand_Support__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Outlet_to_Provide__c"]) {
            this.outletToProvideLabel = this.objectInfo.fields["Outlet_to_Provide__c"].label;
            this.outletToProvidePlaceholder = this.objectInfo.fields["Outlet_to_Provide__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Brand_Visibility__c"]) {
            this.brandVisibilityLabel = this.objectInfo.fields["Brand_Visibility__c"].label;
            this.brandVisibilityPlaceholder = this.objectInfo.fields["Brand_Visibility__c"].inlineHelpText;
        }
        if (this.objectInfo.fields["Product_Visibility__c"]) {
            this.productVisibilityLabel = this.objectInfo.fields["Product_Visibility__c"].label;
            this.productVisibilityPlaceholder = this.objectInfo.fields["Product_Visibility__c"].inlineHelpText;
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
                console.log('[psaitemform.setFieldOptions] brandStatusOptions', this.brandStatusOptions);
                //if (this.brandStatusValues && this.brandStatusValues.length > 0) {
                //    const bsoptions = this.selectPicklistValues(this.brandStatusOptions, this.brandStatusValues);
                //    this.brandStatusOptions = [...bsoptions];
                //}
            } else if (picklist === 'Drink_Strategy__c') {
                this.drinkStrategyOptions = this.setFieldOptionsForField(picklistValues, picklist);
                console.log('[psaitemform.setFieldOptions] drinkStrategyOptions', this.drinkStrategyOptions);
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
                console.log('[psaitemform.setFieldOptions] trainingAdvocacyOptions', this.trainingAdvocacyOptions);
                //if (this.trainingAdvocacyValues && this.trainingAdvocacyValues.length > 0) {
                //    this.selectPicklistValues(this.trainingAdvocacyOptions, this.trainingAdvocacyValues);
                //}
            } else if (picklist === 'Outlet_to_Provide__c') {
                this.outletToProvideOptions = this.setFieldOptionsForField(picklistValues, picklist);
                console.log('[psaitemform.setFieldOptions] outletToProvideOptions', this.outletToProvideOptions);
                //if (this.outletToProvideValues && this.outletToProvideValues.length > 0) {
                //    this.selectPicklistValues(this.outletToProvideOptions, this.outletToProvideValues);
                //}
            } else if (picklist === 'Free_Goods_Reason__c') {
                this.freeGoodReasonOptions = this.setFieldOptionsForField(picklistValues, picklist);
                console.log('[psaitemform.setFieldOptions] freeGoodReasonOptions', this.freeGoodReasonOptions);
            } else if (picklist === 'Brand_Visibility__c') {
                this.brandVisibilityOptions = this.setFieldOptionsForField(picklistValues, picklist);
                console.log('[psaitemform.setFieldOptions] brandVisibilityOptions', this.brandVisibilityOptions);
            } else if (picklist === 'Product_Visibility__c') {
                this.productVisibilityOptions = this.setFieldOptionsForField(picklistValues, picklist);
                console.log('[psaitemform.setFieldOptions] productVisibilityOptions', this.productVisibilityOptions);
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
        console.log('[psaitemform.initialiseitemform] captureFreeGoods', this.captureFreeGoods);
        this.freeGoodQty = 0;
        this.freeGoodGivenDate = null;
        this.discount = 0;
        this.discountPercent = 0;
        this.volumeForecast = 0;
        this.currentVolume = 0;
        this.listingFee = 0;
        this.promotionalActivityAmount = 0;
        this.trainingAdvocacyAmount = 0;
        this.brandSupport = 0;
        this.comments = '';        

        try {
            this.brandStatusValues = [];
            this.drinkStrategyValues = [];
            this.promotionalActivityValues = [];
            this.trainingAdvocacyValues = [];
            this.outletToProvideValues = [];    
            this.freeGoodReasonValues = [];
            this.brandVisibilityValues = [];
            this.productVisibilityValues = [];
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
    handleFreeGoodsQtyChange(event) {
        this.freeGoodQty = event.detail.value;
    }
    handleFreeGoodsGivenDateChange(event) {
        this.freeGoodGivenDate = event.detail.value;
    }
    handleFreeGoodsReasonChange(event) {
        this.freeGoodReasonValues = event.detail.value;
    }
    handleBrandStatusChange(event) {
        this.brandStatusValues = event.detail.value;
    }
    handleCurrentVolumeChange(event) {
        try {
            this.currentVolume = event.detail.value.trim() == '' ? 0 : event.detail.value;
        }catch(ex) {
            console.log('[handleCurrentVolumeChange] exception', ex);
        }
    }
    handleVolumeForecastChange(event) {
        try {      
            this.volumeForecast = event.detail.value.trim() == '' ? 0 : event.detail.value;
            if (this.calcSplit) {
                this.calcProductSplit();
            }
            console.log('[handleVolumeForecastChange] volumeForecast', this.volumeForecast);
        }catch(ex) {
            console.log('exception', ex);
        }
    }
    handleDiscountChange(event) {
        this.discount = event.detail.value.trim() == '' ? 0 : event.detail.value;
}
    handleDiscountPercentChange(event) {
        this.discountPercent = event.detail.value.trim() == '' ? 0 : event.detail.value;
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
    handleBrandSupportChange(event) {
        this.brandSupport = event.detail.value.trim() == '' ? 0 : event.detail.value;
    }
    handleOutletToProvideChange(event) {
        this.outletToProvideValues = event.detail.value;
    }
    handleCommentsChange(event) {
        this.comments = event.detail.value;
    }
    handleBrandVisibilityChange(event) {
        this.brandVisibilityValues = event.detail.value;
    }
    handleProductVisibilityChange(event) {
        this.productVisibilityValues = event.detail.value;
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
                    //threshold = parseFloat(this.psa.Original_Total_Investment__c);
                    threshold = 0;
                } else {
                    threshold = parseFloat(this.psa.Market__r.Change_Threshold_Amount__c);
                }

                console.log('[psaitemform.validate] original', this.psa.Original_Total_Investment__c);
                console.log('[psaitemform.validate] diff', diff);
                console.log('[psaitemform.validate] threshold', threshold);
                if (diff > threshold) {
                    const thresholdString = `${CURRENCY_CODE}  ${threshold}`;
                    this.showToast('warning', this.labels.warning.label, this.labels.thresholdError.message.replace('{0}', thresholdString));                                                      
                    this.isChangeAboveThreshold = true;
                }
            }
    
        } else {
            console.log('[psaitems.validate] isMexico', this.isMexico);
            console.log('[psaitems.validate] isInteger', Number.isInteger(this.discountPercent));
            console.log('[psaitems.validate] discountPercent', this.discountPercent);
            if (this.isMexico) {
                if (!Number.isInteger(parseFloat(this.discountPercent))) {
                    isValid = false;
                    this.showToast('error', this.labels.error.label, this.labels.invalidNumber.message.replace('{0}', this.labels.discountPercent.label));
                }
                if (this.volumeForecast <= 0) {
                    isValid = false;
                    this.showToast('error', this.labels.error.label, this.labels.volumeForecast.error);
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
            fields[FIELD_FREE_GOODS_REASON.fieldApiName] = this.freeGoodReasonValues.join(';');
            fields[FIELD_BRAND_VISIBILITY.fieldApiName] = this.brandVisibilityValues.join(';');
            fields[FIELD_PRODUCT_VISIBILITY.fieldApiName] = this.productVisibilityValues.join(';');
            fields[FIELD_COMMENTS.fieldApiName] = this.comments;
            fields[FIELD_PLAN_PSA_GROSS_PROFIT.fieldApiName] = this.thisProductGP;
            fields[FIELD_PLAN_REBATE_LIABILITY.fieldApiName] = this.rebateLiability;
            fields[FIELD_PLAN_REBATE_VOLUME.fieldApiName] = this.planRebateVolume;
            fields[FIELD_PSA_FREE_BOTTLE_COST.fieldApiName] = this.freeGoodCost;
            fields[FIELD_GROSS_PROFIT_per_CASE_9L.fieldApiName] = this.gpPerCase;
            fields[FIELD_PLAN_PSA_ROI.fieldApiName] = this.planROI;
            fields[FIELD_PLAN_PSA_GP_per_Case.fieldApiName] = this.planGPperCase;

            if (this.isMexico) {
                fields[FIELD_PRODUCT_PRICE.fieldApiName] = this.product.Wholesale_Price__c;
            }

            let freeGoodsVolume = this.freeGoodQty;
            let volume = this.volumeForecast;
            let cVolume = this.currentVolume;
            if (this.captureVolumeInBottles) {
                const packQty = this.product.Pack_Quantity__c == undefined || this.product.Pack_Quantity__c == 0 ? 1 : this.product.Pack_Quantity__c;
                volume = this.volumeForecast / packQty;
                cVolume = this.currentVolume / packQty;
                //freeGoodsVolume = this.freeGoodQty / this.product.Pack_Quantity__c;
            }

            fields[FIELD_CURRENT_VOLUME.fieldApiName] = cVolume;

            console.log('[psaItemForm.save] captureVolumeInBottles', this.captureVolumeInBottles);
            console.log('[psaItemForm.save] volume', volume);
            fields[FIELD_PROPOSED_PLAN_VOLUME.fieldApiName] = volume;
            fields[FIELD_PROPOSED_PLAN_REBATE.fieldApiName] = this.discount;
            fields[FIELD_PROPOSED_LISTING_FEE.fieldApiName] = this.listingFee;
            fields[FIELD_PROPOSED_PROMOTIONAL_ACTIVITY.fieldApiName] = this.promotionalActivityAmount;
            fields[FIELD_PROPOSED_TRAINING_ADVOCACY.fieldApiName] = this.trainingAdvocacyAmount;
            fields[FIELD_PROPOSED_BRAND_SUPPORT.fieldApiName] = this.brandSupport;

            var givenDate;
            if (this.freeGoodGivenDate != undefined) {
                const pd = new Date(this.freeGoodGivenDate);
                const paymentDateYear = pd.getFullYear().toString();
                const paymentDateMonth = ('00' + (pd.getMonth()+1)).slice(-2);
                const paymentDateDay = ('00' + pd.getDate()).slice(-2);
                givenDate = paymentDateYear + '-' + paymentDateMonth + '-' + paymentDateDay;
            }

            if (this.isApproved == false || this.psaItemId == null) {
                fields[FIELD_ORIGINAL_PLAN_VOLUME.fieldApiName] = volume;
                fields[FIELD_ORIGINAL_PLAN_REBATE.fieldApiName] = this.discount;
                fields[FIELD_ORIGINAL_LISTING_FEE.fieldApiName] = this.listingFee;
                fields[FIELD_ORIGINAL_PROMOTIONAL_ACTIVITY.fieldApiName] = this.promotionalActivityAmount;
                fields[FIELD_ORIGINAL_TRAINING_ADVOCACY.fieldApiName] = this.trainingAdvocacyAmount;
                fields[FIELD_ORIGINAL_BRAND_SUPPORT.fieldApiName] = this.brandSupport;
            }
            
            if (this.psaItemId != null) {
                if (!this.isChangeAboveThreshold) {
                    fields[FIELD_PLAN_REBATE.fieldApiName] = this.discount;
                    fields[FIELD_PLAN_REBATE_PERCENTAGE.fieldApiName] = this.discountPercent;
                    fields[FIELD_VOLUME_FORECAST.fieldApiName] = volume;
                    fields[FIELD_LISTING_FEE.fieldApiName] = this.listingFee;
                    fields[FIELD_PROMOTIONAL_ACTIVITY_VALUE.fieldApiName] = this.promotionalActivityAmount;
                    fields[FIELD_TRAINING_ADVOCACY_VALUE.fieldApiName] = this.trainingAdvocacyAmount;  
                    fields[FIELD_BRAND_SUPPORT.fieldApiName] = this.brandSupport; 
                    fields[FIELD_FREE_GOODS_QUANTITY.fieldApiName] = freeGoodsVolume;
                    //fields[FIELD_FREE_GOODS_GIVEN_DATE.fieldApiName] = this.freeGoodGivenDate;
                    fields[FIELD_FREE_GOODS_REASON.fieldApiName] = this.freeGoodReasonValues.join(';');
                }
                fields[FIELD_PREVIOUS_PLAN_VOLUME.fieldApiName] = this.psaItem.Plan_Volume__c;
                fields[FIELD_PREVIOUS_PLAN_REBATE.fieldApiName] = this.psaItem.Plan_Rebate__c;
                fields[FIELD_PREVIOUS_LISTING_FEE.fieldApiName] = this.psaItem.Listing_Fee__c;
                fields[FIELD_PREVIOUS_PROMOTIONAL_ACTIVITY.fieldApiName] = this.psaItem.Promotional_Activity_Value__c;
                fields[FIELD_PREVIOUS_TRAINING_ADVOCACY.fieldApiName] = this.psaItem.Training_and_Advocacy_Value__c;
                fields[FIELD_PREVIOUS_BRAND_SUPPORT.fieldApiName] = this.psaItem.Brand_Support__c;
            } else {
                fields[FIELD_PLAN_REBATE.fieldApiName] = this.discount;
                fields[FIELD_PLAN_REBATE_PERCENTAGE.fieldApiName] = this.discountPercent;
                fields[FIELD_VOLUME_FORECAST.fieldApiName] = volume;
                fields[FIELD_LISTING_FEE.fieldApiName] = this.listingFee;
                fields[FIELD_PROMOTIONAL_ACTIVITY_VALUE.fieldApiName] = this.promotionalActivityAmount;
                fields[FIELD_TRAINING_ADVOCACY_VALUE.fieldApiName] = this.trainingAdvocacyAmount;    
                fields[FIELD_BRAND_SUPPORT.fieldApiName] = this.brandSupport;
                fields[FIELD_FREE_GOODS_QUANTITY.fieldApiName] = freeGoodsVolume;
                //fields[FIELD_FREE_GOODS_GIVEN_DATE.fieldApiName] = this.freeGoodGivenDate;
                fields[FIELD_FREE_GOODS_REASON.fieldApiName] = this.freeGoodReasonValues.join(';');

                fields[FIELD_PREVIOUS_PLAN_VOLUME.fieldApiName] = volume;
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
            console.log('[psaitemform.save] exception', ex.toString());
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
            .then(result => {
                console.log('[psaitemForm.createrecord] psaItem', result);
                this.isWorking = false;
                this.psaItem = {...result};
                this.psaItemId = result.id;
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

                this.updateTotals('save');
                refreshApex(this.wiredPSAItem);
                /*
                if (!this.isPhone) {
                    const saveEvent = new CustomEvent('save', {
                        detail: psaItem
                    });
                    this.dispatchEvent(saveEvent);
                }
                */
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

                console.log('[updatePSAItem] isapproved, ischangeabovethreshold', this.isApproved, this.isChangeAboveThreshold);
                this.updateTotals('update');
                if (this.psa.Is_Approved__c && this.psa.Market__r.Spread_Planned_Values__c) {
                    this.updateSpread(record.Id);
                }
                refreshApex(this.wiredPSAItem);
                /*
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
                        volume: record.fields.Plan_Volume__c,
                        discount: record.fields.Plan_Rebate__c,
                        totalInvestment: this.totalInvestment,
                        proposedVolume: record.fields.Proposed_Plan_Volume__c,
                        proposedRebate: record.fields.Proposed_Plan_Rebate__c
                    };
                    fireEvent(this.currentPageReference, 'psaupdated', detail);
                }
                }catch(ex){
                    console.log('[updateRecord success] dispatchevent exception', ex);                    
                }
                */
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
        this.isWorking = true;
        this.initialiseItemForm();
        deleteRecord(this.psaItemId) 
            .then(() => {
                this.isWorking = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Success',
                        message: 'Promotional Sales Agreement Item deleted successfully',
                        variant: 'success'
                    }),
                );

                this.updateTotals('delete');
            })
            .catch(error => {
                this.isWorking = false;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error deleting Promotional Sales Agreement Item',
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
            });
    }

    updateTotals(action) {
        updatePMITotals({psaId: this.psaId})
            .then((status) => {
                console.log('[updateTotals] status', status);
                if (!this.isPhone) {
                    if (action == 'save' || (action == 'update' && this.isApproved && this.isChangeAboveThreshold)) {
                        this.updatePSAStatus("Updated");
                    }

                    const saveEvent = new CustomEvent('save', {
                        detail: {
                            action: action,
                            psaItem: this.psaItem
                        }
                    });
                    this.dispatchEvent(saveEvent);
                    refreshApex(this.wiredPSAItem);
                }
            })
            .catch((error) => {
                console.log('[updateTotals] error', error);
            });

    }

    updateSpread() {
        updateSpreadForPMI({
            psaId: this.psaId,
            pmiId: this.psaItemId
        }).then(() => {

        }).catch((error) => {
            console.log('[updateSpreadForPMI] error', error);
        });
    }

    updatePSAStatus(status) {
        const fields = {};
        fields[FIELD_PROMOTION_ACTIVITY_ID.fieldApiName] = this.psaId;
        fields[FIELD_PROMOTION_ACTIVITY_STATUS.fieldApiName] = status;
        fields[FIELD_HAS_ACTUAL_TOTALS.fieldApiName] = false;

        console.log('[psaItemForm.updatePSAStatus] fields', fields);
        const record = { fields };
        updatePSA({ psaId: this.psaId, status: status, hasActualTotals: false })
            .then(() => {                
                this.isWorking = false;
                //this.dispatchEvent(new CustomEvent('updated'));                
            })
            .catch(error => {
                this.isWorking = false;
                console.log('[updatePSAStatsu] error', error);
            });
        
    }
}