import { LightningElement, api, track, wire } from 'lwc';
import { createRecord, deleteRecord, updateRecord } from 'lightning/uiRecordApi';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import OBJECT_DEPLETION from '@salesforce/schema/Depletion__c';

import FIELD_ID from '@salesforce/schema/Depletion__c.Id';
import FIELD_ACCOUNT from '@salesforce/schema/Depletion__c.Account__c'
import FIELD_ACTIVITY from '@salesforce/schema/Depletion__c.Activity__c';
import FIELD_BOTTLES from '@salesforce/schema/Depletion__c.Bottles__c';
import FIELD_MONTH_OF_DATE from '@salesforce/schema/Depletion__c.Month_Of_Date__c';
import FIELD_MONTH from '@salesforce/schema/Depletion__c.Month_Text__c';
import FIELD_PRODUCT from '@salesforce/schema/Depletion__c.Custom_Product__c';
import FIELD_RECORDTYPEID from '@salesforce/schema/Depletion__c.RecordTypeId';
import FIELD_WHOLESALER from '@salesforce/schema/Depletion__c.Wholesaler__c';
import FIELD_VOLUME from '@salesforce/schema/Depletion__c.Volume9L__c';

import getAccount from '@salesforce/apex/Depletions_Controller.getAccount';
import getDepletions from '@salesforce/apex/Depletions_Controller.getDepletions';
import getProducts from '@salesforce/apex/Depletions_Controller.getProducts';

import LABEL_ACTIVITY from '@salesforce/label/c.Activity';
import LABEL_ACTIVITIES from '@salesforce/label/c.Activities';
import LABEL_ARE_YOU_SURE from '@salesforce/label/c.AreYouSure';
import LABEL_BOTTLES from '@salesforce/label/c.Bottles';
import LABEL_DELETE from '@salesforce/label/c.Delete';
import LABEL_EDIT from '@salesforce/label/c.Edit';
import LABEL_ERROR from '@salesforce/label/c.Error';
import LABEL_MONTH from '@salesforce/label/c.Month';
import LABEL_NEW from '@salesforce/label/c.New';
import LABEL_PRODUCT from '@salesforce/label/c.Product';
import LABEL_RECORDTYPE from '@salesforce/label/c.RecordType';
import LABEL_VOLUME9L from '@salesforce/label/c.Volume9L';
import LABEL_WHOLESALER from '@salesforce/label/c.Wholesaler';
import LABEL_JANUARY from '@salesforce/label/c.January';
import LABEL_FEBRUARY from '@salesforce/label/c.February';
import LABEL_MARCH from '@salesforce/label/c.March';
import LABEL_APRIL from '@salesforce/label/c.April';
import LABEL_MAY from '@salesforce/label/c.May';
import LABEL_JUNE from '@salesforce/label/c.June';
import LABEL_JULY from '@salesforce/label/c.July';
import LABEL_AUGUST from '@salesforce/label/c.August';
import LABEL_SEPTEMBER from '@salesforce/label/c.September';
import LABEL_OCTOBER from '@salesforce/label/c.October';
import LABEL_NOVEMBER from '@salesforce/label/c.November';
import LABEL_DECEMBER from '@salesforce/label/c.December';  

export default class DepletionEntryForm extends LightningElement {
    @api 
    recordId;

    @api 
    recordTypeId;

    labels = {
        activity: { label: LABEL_ACTIVITY, labelPlural: LABEL_ACTIVITIES, placeholder: LABEL_ACTIVITY },
        allProductsSaved: { message: 'Depletions for all products in activity created successfully'},
        delete: { label: LABEL_DELETE, prompt: LABEL_ARE_YOU_SURE, successmessage: 'Depletion successfully deleted' },
        edit: { label: LABEL_EDIT },
        bottles: { label: LABEL_BOTTLES, placeholder: LABEL_BOTTLES },
        fillAllRequiredFields: { message: 'Fill in all required fields and try again.'},
        loadFromActivity: { label: 'Load from Activity', hideLabel: 'Hide Activity List' },
        month: { label: LABEL_MONTH, placeholder: LABEL_MONTH },
        moveToNextProduct: { message: 'Skipping {0}. Moving to {1}' },
        new: { label: LABEL_NEW },
        product: { label: LABEL_PRODUCT, placeholder: LABEL_PRODUCT },
        recordType: { label: LABEL_RECORDTYPE },
        volume: { label: LABEL_VOLUME9L, placeholder: LABEL_VOLUME9L },
        wholesaler: { label: LABEL_WHOLESALER, placeholder: LABEL_WHOLESALER },
        success: { label: 'success' },
        error: { label: 'error' },
        productSaved: { message: '' },
        productSavedNextProduct: { message: 'Depletion saved. Moving to next product' }
    }

    months = [
        { label: '', value: '' },
        { label: LABEL_JANUARY, value: '0' },
        { label: LABEL_FEBRUARY, value: '1' },
        { label: LABEL_MARCH, value: '2' },
        { label: LABEL_APRIL, value: '3' },
        { label: LABEL_MAY, value: '4' },
        { label: LABEL_JUNE, value: '5' },
        { label: LABEL_JULY, value: '6' },
        { label: LABEL_AUGUST, value: '7' },
        { label: LABEL_SEPTEMBER, value: '8' },
        { label: LABEL_OCTOBER, value: '9' },
        { label: LABEL_NOVEMBER, value: '10' },
        { label: LABEL_DECEMBER, value: '11' }
    ];

    actions = [
        { label: this.labels.edit.label, name: 'edit' },
        { label: this.labels.delete.label, name: 'delete' },
    ];

    depletionColumns = [
        { label: this.labels.product.label, fieldName: 'Product_Name__c' },
        { label: this.labels.volume.label, fieldName: 'Volume9L__c' },
        { label: this.labels.bottles.label, fieldName: 'Bottles__c' },
        { label: this.labels.month.label, fieldName: 'Month_Text__c' },
        { label: this.labels.activity.label, fieldName: 'Activity_Name__c' },
        { label: this.labels.wholesaler.label, fieldName: 'Wholesaler_Name__c' },
        { type: 'action', typeAttributes: { rowActions: this.actions }}
    ];

    
    activitiesForProduct = new Map();
    activityProducts = new Map();
    activities = new Map();

    wholesalersForActivity = new Map();

    error;
    account;
    depletion;
    product;
    products;
    selectedActivity;
    activityOptions;
    allActivities;
    productOptions;
    wholesalerOptions;
    dataRows = [];
    captureInBottles = false;
    recordTypeId;
    recordTypeName;
    showActivityList = false;
    activityProductIndex = 0;
    numberOfProductsInActivity = 0;

    isWorking = false;

    depletionRecordTypeId;
    depletionProduct;
    depletionBottles;
    depletionVolume;
    depletionMonth;
    depletionActivity;
    depletionWholesaler;

    @track 
    activitOptions;

    @track
    wholesalerOptions;

    get accountName() {
        return this.account ? this.account.Name : '';
    }

    get hasAccessToActivity() {
        return true;
    }
    get hasAccessToWholesaler() {
        return true;
    }
    get loadFromActivityLabel() {
        return this.showActivityList ? this.labels.loadFromActivity.hideLabel : this.labels.loadFromActivity.label;
    }
    get showHowToMessage() {
        return this.depletion == undefined && this.showActivityList == false;
    }
    get productIndexLabel() {
        return `${this.activityProductIndex+1} / ${this.numberOfProductsInActivity}`;
    }
    get isNew() {
        return this.depletion && this.depletion.isNew;
    }
    get showSkipButton() {
        return this.activityProductIndex >= 0 && this.activityProductIndex < this.numberOfProductsInActivity-1;
    }
    get isEditing() {
        return this.depletion && !this.depletion.isNew;
    }

    @track objectInfo;

    @wire(getObjectInfo, { objectApiName: OBJECT_DEPLETION })
    objectInfo;

    get hasMultipleRecordTypes() {
        console.log('[hasMultipleRecordTypes] objectInfo', this.objectInfo);
        
        return this.objectInfo && this.objectInfo.data && this.objectInfo.data.recordTypeInfos && Object.keys(this.objectInfo.data.recordTypeInfos).length > 1;
    }
    get recordTypes() {
        const availableRecordTypes = Object.values(this.objectInfo.data.recordTypeInfos).filter(rt => rt.available == true);
        const options = availableRecordTypes.map(rt => {
            return { label: rt.name, value: rt.recordTypeId };
        });
        console.log('[getRecordTypes] recordTypes', options);
        if (this.recordTypeId == undefined) {
            this.recordTypeId = options[0].value;
            this.recordTypeName = options[0].label;    
        }

        return options;
    }

    wiredDepletions;
    depletionData;
    @wire(getDepletions, { accountId: '$recordId'})
    getWiredDepletionData(value) {
        this.wiredDepletions = value;
        console.log('[getWiredDepletions] value', value);
        if (value.data) {
            this.depletionData = value.data;
            this.error = undefined;
        } else if (value.error) {
            this.error = value.error;
            this.depletionData = undefined;
        }
    }

    wiredAccount;
    @wire(getAccount, {accountId: '$recordId'})
    wiredGetAccount(value) {
        this.wiredAccount = value;
        if (value.data) {
            console.log('[getAccount] data', value.data);
            this.account = value.data;
            this.error = undefined;
            console.log('[getAccount] account', this.account);
            this.activities.clear();
            const actForAcc = [];
            this.account.Promotions__r.forEach(p => {
                if (!this.activities.has(p.Promotion_Activity__c)) {
                    this.activities.set(p.Promotion_Activity__c, { 
                        wholesalers: [ 
                            { label: p.Promotion_Activity__r.Wholesaler_Preferred_Name__c, value: p.Promotion_Activity__r.Wholesaler_Preferred__c },
                            { label: p.Promotion_Activity__r.Wholesaler_Alternate_Name__c, value: p.Promotion_Activity__r.Wholesaler_Alternate__c }
                        ]
                    });

                    actForAcc.push({label: p.Promotion_Activity__r.Name, value: p.Promotion_Activity__c});
                }
            });

            this.allActivities = [...actForAcc];
            //this.depletionData = this.account.Depletions__r;
            this.captureInBottles = this.account.Market__r.Capture_Volume_in_Bottles__c;
            if (this.captureInBottles) {
                this.depletionColumns.splice(1, 1);
            } else {
                this.depletionColumns.splice(2, 1);
            }
            this.depletionColumns = [...this.depletionColumns];
            console.log('account', this.account);
            console.log('activities', this.activities);
            this.getProductsForMarket();            
        } else if (value.error) {
            this.error = value.error;
            this.account = undefined;
        }
    }

    getProductsForMarket() {
        console.log('[getProductsForMarket] accountId', this.recordId);
        getProducts({accountId: this.recordId })
        .then(result => {
            this.products = result;
            console.log('[getProducts] products', this.products);
            const options = [];
            try {
                this.activitiesForProduct.clear();
                this.products.forEach(p => {
                    options.push({ label: p.Name, value: p.Id });
                    if (p.Promotion_Material_Items__r) {
                        p.Promotion_Material_Items__r.forEach(pmi => {
                            let activityList = [];     
                            let productsInActivity = [];
                            let act;
                            if (this.activities.has(pmi.Activity__c)) {
                                act = this.activities.get(pmi.Activity__c);
                                if (act.products == undefined) { act.products = []; }
                                act.products.push({label: p.Name, value: p.Id });                                
                                this.activities.set(pmi.Activity__c, act);

                                if (this.activitiesForProduct.has(p.Id)) {
                                    activityList = this.activitiesForProduct.get(p.Id);
                                }
                                const found = activityList.find(al => al.value == pmi.Activity__c);                        
                                if (found == undefined) {
                                    activityList.push({ label: pmi.Activity_Name__c, value: pmi.Activity__c});
                                }
                
                                this.activitiesForProduct.set(p.Id, activityList);            
                            }                   
                        });
                    }
                });

                console.log('[getProducts] activitiesForProduct', this.activitiesForProduct);
            }catch(ex) {
                console.log('[getProducts] exception', ex);
            }
            this.productOptions = [...options];
            this.activityOptions = [{label: 'activity1', value:'1'}];
            console.log('[getProducts] productOptions', this.productOptions);
            console.log('[getProducts] activityOptions', this.activityOptions);
            console.log('[getProducts] objectInfo', this.objectInfo);
        })
        .catch(error => {
            this.products = undefined;
            this.error = error;
            console.log('[getProducts] error', error);
        });
    }

    findRowIndexById(id) {
        let ret = -1;
        
        this.data.some((row, index) => {
            if (row.Id == id) {
                ret = index;
                return true;
            }
            return false;
        });

        return ret;
    }

    toggleActivityList() {
        this.showActivityList = !this.showActivityList;        
        console.log('[toggleActivityList] showActivityList', this.showActivityList);
    }

    handleAllActivitiesChange(event) {
        try {
            console.log('[handleAllActivitiesChange] ev.detail.value', event.detail.value);
            this.selectedActivity = event.detail.value;
            const act = this.allActivities.find(a => a.value == this.selectedActivity);
            console.log('[handleAllActivitiesChange] selectedActivity', this.selectedActivity);
            this.productsForSelectedActivity = this.activities.get(this.selectedActivity).products;
            this.activityOptions = [{label: act.label, value: this.selectedActivity }];
            this.wholesalerOptions = this.activities.get(this.selectedActivity).wholesalers;
            this.depletion = {...this.createNewDepletion()};
            this.depletion.activity = this.selectedActivity;
            this.depletion.product = this.productsForSelectedActivity[0].value;
            this.activityProductIndex = 0;
            this.numberOfProductsInActivity = this.productsForSelectedActivity.length;
            this.showActivityList = false;
        }catch(ex) {
            console.log('[handleAllActivitiesChange] exception', ex);
        }
    }
    handleRecordTypeChange(event) {
        this.depletion.recordTypeId = event.detail.value;
        this.recordTypeId = event.detail.value;
        this.recordTypeName = event.detail.label;
    }
    handleProductChange(event) {
        try {
            const productId = event.detail.value;
            console.log('[handleProductChange] product', productId);

            const options = this.activitiesForProduct.get(productId);
            this.activityOptions = [...options];
            this.depletion.product = productId;
            
            console.log('[handleProductChange] options', this.activityOptions);
            console.log('[handleProductChange] depletion', this.depletion);
        }catch(ex) {
            console.log('[handleProductChange] exception', ex);
        }
    }
    handleVolumeChange(event) {
        this.depletion.volume = event.detail.value;
    }
    handleBottlesChange(event) {
        this.depletion.bottles = event.detail.value;
    }
    handleMonthChange(event) {
        this.depletion.month = event.detail.value;
    }
    handlePromotionActivityChange(event) {
        try {
            this.depletion.activity = event.detail.value;
            console.log('[handlePromotionActivityChange] activityId', this.depletion.activity);

            const options = this.activities.get(this.depletion.activity);
            this.wholesalerOptions = [...options];
            console.log('[handlePromotionActivityChange] wholesalerOptions', this.wholesalerOptions);
        } catch(ex) {
            console.log('[handlePromotionActivityChange] exception', ex);
        }
    }
    handleWholesalerChange(event) {
        this.depletion.wholesaler = event.detail.value;
    }

    handleRowAction(event) {
        try {
            const actionName = event.detail.action.name;
            const row = event.detail.row;
            this.depletion = {
                isNew: false,
                id: row.Id,
                recordTypeId: row.RecordTypeId,
                recordTypeName: row.RecordType.Name,
                account: row.Account__c,
                product: row.Custom_Product__c,
                productName: row.Product_Name__c,
                month: this.months.find(m => m.label == row.Month_Text__c).value,
                volume: row.Volume9L__c,
                bottles: row.Bottles__c,
                activity: row.Activity__c,
                activityName: row.Activity_Name__c,
                wholesaler: row.Wholesaler__c,
                wholesalerName: row.Wholesaler_Name__c
            };

            this.wholesalerOptions = this.activities.get(this.depletion.activity).wholesalers;
            this.activityOptions = [{label: this.depletion.activityName, value: this.depletion.activity}];
            console.log('[edit] depletion', this.depletion);

            switch (actionName) {
                case 'edit':                
                    break;

                case 'delete':
                    this.deleteRow();
                    break;

                default:
            }
        }catch(ex) {
            console.log('rowAction.exception', ex);
        }
    }

    createNewDepletion() {
        this.depletionRecordTypeId = '';
        this.depletionProduct = '';
        this.depletionMonth = '';
        this.depletionBottles = 0;
        this.depletionVolume = 0;
        this.depletionActivity = '';
        this.depletionWholesaler = '';

        return {
            isNew: true,
            id: '',
            recordTypeId: this.recordTypeId,
            product: '',
            month: '',
            bottles: 0,
            volume: 0,
            activity: '',
            wholesaler: ''
        };
    }

    cancel() {

    }
    cancelEdit() {
        this.selectedActivity = undefined;
        this.activityProductIndex = 0;
        this.numberOfProductsInActivity = 0;
        this.depletion = undefined;
    }
    deleteRow() {
        console.log('[deleteRow]');
        let r = confirm(this.labels.delete.prompt);
        if (r == true) {
            this.deleteDepletion(this.depletion.id);
        } else {
            this.depletion = undefined;
            this.activityOptions = undefined;
            this.wholesalerOptions = undefined;
        }
    }
    addNewRow() {
        console.log('[addNewRow]');
        try {
            this.depletion = {...this.createNewDepletion()};
        }catch(ex) {
            console.log('[addNewRow] exception', ex);
        }
    }

    skip() {
        let msg = this.labels.allProductsSaved.message;
        this.activityProductIndex++;
        if (this.activityProductIndex >= this.numberOfProductsInActivity) {
            this.selectedActivity = undefined;
            this.activityProductIndex = 0;
            this.numberOfProductsInActivity = 0;
            this.depletion = undefined;
        } else {
            this.depletion = {...this.createNewDepletion()};
            this.depletion.activity = this.selectedActivity;
            this.depletion.product = this.productsForSelectedActivity[this.activityProductIndex].value;     
            this.depletion.bottles = 0;
            this.depletion.volume = 0;
            this.depletion.month = '';
            this.depletion.wholesaler = undefined;
            console.log('[moveToNext] depletion', this.depletion);                                                                   

            msg = this.labels.moveToNextProduct.message.replace('{0}', this.productsForSelectedActivity[this.activityProductIndex-1].label);
            msg = msg.replace('{1}', this.productsForSelectedActivity[this.activityProductIndex]);
        }

        this.dispatchEvent(
            new ShowToastEvent({
                title: this.labels.info.label,
                message: msg,
                variant: 'info'
            }),
        );

    }

    validateDepletion() {
        console.log('[validateDepletion] depletion', this.depletion);
        if (this.depletion.recordTypeId == '' || this.depletion.product == '' || (this.depletion.bottles == 0 && this.depletion.volume == 0)) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: this.labels.error.label,
                    message: this.labels.fillAllRequiredFields.message,
                    variant: 'error'
                }),
            );
            return false;
        }

        return true;
    }
    save() {
        console.log('dataRows', this.dataRows);
        try {
            if (!this.validateDepletion()) {
                return;
            }

            this.isWorking = true;

            const today = new Date();
            const thisYear = today.getFullYear();
            const month = parseInt(this.depletion.month ? this.depletion.month : today.getMonth()) + 1;
            const dateOfMonth = new Date(thisYear, month, 1);

            const fields = {};
            fields[FIELD_ACCOUNT.fieldApiName] = this.recordId;
            fields[FIELD_ACTIVITY.fieldApiName] = this.depletion.activity;
            fields[FIELD_BOTTLES.fieldApiName] = parseInt(this.depletion.bottles);
            fields[FIELD_MONTH.fieldApiName] = this.depletion.month;
            fields[FIELD_MONTH_OF_DATE.fieldApiName] = dateOfMonth.toISOString();
            fields[FIELD_PRODUCT.fieldApiName] = this.depletion.product;
            fields[FIELD_VOLUME.fieldApiName] = parseFloat(this.depletion.volume);
            fields[FIELD_WHOLESALER.fieldApiName] = this.depletion.wholesaler;

            if (this.depletion.id == '') {
                fields[FIELD_RECORDTYPEID.fieldApiName] = this.depletion.recordTypeId;    

                this.createDepletion(fields);
            } else {
                fields[FIELD_ID.fieldApiName] = this.depletion.id;
                this.updateDepletion(fields);
            }

        }catch(ex) {
            console.log('[save] exception', ex);
        }
    }

    createDepletion(fields) {
        try {
            const self = this;
            const recordInput = { apiName: OBJECT_DEPLETION.objectApiName, fields };
            console.log('[createDepletion] recordInput', recordInput);
            createRecord(recordInput)
                .then(result => {
                    console.log('[createDepletion] result', result);
                    try {
                    let msg = self.labels.productSaved.message;
                    if (self.selectedActivity) {
                        self.activityProductIndex++;
                        if (self.activityProductIndex >= self.numberOfProductsInActivity) {
                            msg = self.labels.allProductsSaved.message;
                            self.selectedActivity = undefined;
                            self.activityProductIndex = 0;
                            self.numberOfProductsInActivity = 0;
                            self.depletion = undefined;
                            self.activityOptions = undefined;
                            self.wholesalerOptions = undefined;
                        } else {
                            msg = self.labels.productSavedNextProduct.message;
                            self.depletion = {...self.createNewDepletion()};
                            self.depletion.activity = self.selectedActivity;
                            self.depletion.product = self.productsForSelectedActivity[self.activityProductIndex].value;     
                            self.depletion.bottles = 0;
                            self.depletion.volume = 0;
                            self.depletion.month = '';
                            self.depletion.wholesaler = undefined;
                            console.log('[moveToNext] depletion', self.depletion);                                                                   
                        }
                    }

                    refreshApex(this.wiredDepletions);

                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: self.labels.success.label,
                            message: msg,
                            variant: 'success'
                        }),
                    );
    
                        this.isWorking = false;

                    }catch(ex) {
                        console.log('[createRecord.then] eception', ex);
                    }
                })
                .catch(error => {
                    console.log('[createDepletion.catch] error', error);
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: self.labels.error.label,
                            message: error.body.message,
                            variant: 'error'
                        }),
                    );

                    this.isWorking = false;
                });
        }catch(ex) {
            console.log('[createDepletion] exception', ex);
        }
    }

    updateDepletion(fields) {
        const self = this;
        const recordInput = { fields };
        console.log('[updateDepletion] recordInput', recordInput);
        updateRecord(recordInput)
            .then(() => {
                this.depletion = undefined;
                this.activityOptions = undefined;
                this.wholesalerOptions = undefined;

                refreshApex(this.wiredDepletions);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: self.labels.success.label,
                        message: self.labels.productSaved.message,
                        variant: 'success'
                    }),
                );

                this.isWorking = false;

            })
            .catch(error => {
                console.log('[createDepletion.catch] error', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: self.labels.error.label,
                        message: error.body.message,
                        variant: 'error'
                    }),
                );

                this.isWorking = false;
            });
    }

    deleteDepletion(id) {
        console.log('[deleteDepletion] id', id);
        this.isWorking = true;
        deleteRecord(id)
            .then(() => {
                this.depletion = undefined;
                this.activityOptions = undefined;
                this.wholesalerOptions = undefined;

                refreshApex(this.wiredDepletions);

                this.dispatchEvent(
                    new ShowToastEvent({
                        title: this.labels.success.label,
                        message: this.labels.deleted.successmessage,
                        variant: 'success'
                    }),
                );

                this.isWorking = false;

            })
            .catch(error => {
                this.error = error;
                console.log('[deleteDepletion.catch] error', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: self.labels.error.label,
                        message: error.body.message,
                        variant: 'error'
                    }),
                );

                this.isWorking = false;

            });
    }
}