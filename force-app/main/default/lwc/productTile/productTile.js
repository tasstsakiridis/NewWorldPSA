import { LightningElement, api, track, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

import LABEL_TOTAL_INVESTMENT from '@salesforce/label/c.TotalInvestment';
import LABEL_SPLIT from '@salesforce/label/c.Split';

export default class ProductTile extends LightningElement {

    tileClass = 'tile';

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener('selectTile', this.handleSelectTile, this);
        registerListener('psaupdated', this.handlePSAUpdate, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    @api 
    keepSelection = false;

    @api
    product;

    @api 
    quantityFieldName;

    @api 
    quantityFieldLabel;

    @api 
    priceFieldName;

    @api 
    priceFieldLabel;

    @api 
    captureVolumeInBottles;

    @api 
    calcSplit;

    @api 
    showTotalInvestment;

    quantityFieldValue = 0;
    priceFieldValue = 0;

    get showQtyOrPriceFields() {
        return this.quantityFieldName != undefined || this.priceFieldName != undefined;
    }

    get productName() {
        return this.product ? this.product.Name : '';
    }

    get brandName() {
        return this.product ? this.product.Brand_Name__c : '';
    }

    get titleSize() {
        var size = 12;
        if (this.product != undefined && this.product.Image_Name__c != undefined && this.product.Image_Name__c !== '') {
            size = 8;
        }
        return size;
    }
    get pictureUrl() {
        var pictureUrl;
        if (this.product && this.product.Image_Name__c) {
            //pictureUrl = PRODUCT_IMAGES + '/ProductImages/' + this.product.Image_Name__c;
            pictureUrl = 'https://salesforce-static.b-fonline.com/images/'+this.product.Image_Name__c;
        }

        return pictureUrl;
    }

    @api 
    psaItem;

    get psaItemId() {
        return this.psaItem == undefined ? undefined : this.psaItem.Id;
    }

    get psaItemSummary() {
        console.log('[productTile] psaitem', this.psaItem == undefined ? 'undefined' : JSON.parse(JSON.stringify(this.psaItem)));
        console.log('[productTile] product', this.product == undefined ? 'undefined' : JSON.parse(JSON.stringify(this.product)));
        console.log('[productTile] captureVolumeInBottles', this.captureVolumeInBottles);
        if (this.psaItem) {            
            let str = '';
            console.log('[productTile] planVolume, proposed volume', this.psaItem.Plan_Volume__c, this.psaItem.Proposed_Plan_Volume__c);
            if (this.psaItem.Plan_Volume__c != undefined) { 
                if (this.psaItem.Plan_Volume__c == this.psaItem.Proposed_Plan_Volume__c || this.psaItem.Proposed_Plan_Volume__c == undefined) {
                    str = '<b>'+this.psaItem.Plan_Volume__c + '</b> cases'; 
                } else {
                    str = '<b style="color: red;">'+this.psaItem.Proposed_Plan_Volume__c + '</b> cases';
                }
            }
            console.log('[productTile] planRebate, proposed rebate', this.psaItem.Plan_Rebate__c, this.psaItem.Proposed_Plan_Rebate__c);
            if (this.psaItem.Plan_Rebate__c != undefined) { 
                if (this.psaItem.Plan_Rebate__c == this.psaItem.Proposed_Plan_Rebate__c || this.psaItem.Proposed_Plan_Rebate__c == undefined) {
                    str += ' @ $<b>' + parseFloat(this.psaItem.Plan_Rebate__c) + '</b>/case'; 
                } else {
                    str += ' @ $<b style="color: red;">' + parseFloat(this.psaItem.Proposed_Plan_Rebate__c) + '</b>/case'; 
                }
            }
            return str;
        } else {
            return 'has no psa item details';
        }
    }
    get totalInvestment() {
        if (this.psaItem && this.psaItem.Total_Investment__c) {
            return this.psaItem.Total_Investment__c;
        } else {
            return 0;
        }
    }
    get totalInvestmentSummary() {
        if (this.psaItem && this.psaItem.Total_Investment__c) {
            return '$' + parseFloat(this.psaItem.Total_Investment__c) + ' ' + LABEL_TOTAL_INVESTMENT.toLowerCase();
        }
    }

    @api 
    selectTile(isSelected) {
        this.isSelected = isSelected;
        this.setTileClass();
    }

    handleSelectTile(isSelected) {
        this.isSelected = isSelected;
        //this.selectTile();
    }
    handlePSAUpdate(detail) {
        try {
        if (detail.psaItemId === this.psaItem.Id) {   
            console.log('[producttile.handlepsaupdated] detail', detail, this.psaItem);
            const newItem = Object.assign({}, this.psaItem);                     
            newItem.Plan_Rebate__c = detail.discount;
            newItem.Plan_Volume__c = detail.volume;
            newItem.Total_Investment__c = detail.totalInvestment;
            newItem.Proposed_Plan_Volume__c = detail.proposedVolume;
            newItem.Proposed_Plan_Rebate__c = detail.proposedRebate;
            this.psaItem = Object.assign({}, newItem);
            console.log('[producttile.handlepsaupdated] psaitem', this.psaItem);
        }
        }catch(ex) {
            console.log('[producttile.handlepsaupdated] exception', ex);
        }
    }

    handleClick(event) {
        event.preventDefault();

        try {
        console.log('[productTile.handleClick] product', this.product.Id, this.psaItem);
        this.isSelected = !this.isSelected;
        this.setTileClass();
        
        const selectedEvent = new CustomEvent('selected', {
            detail: { productId: this.product.Id, productName: this.product.Name, psaItemId: this.psaItemId }
        });
        this.dispatchEvent(selectedEvent);
        }catch(ex) {
            console.log('[producttile.handleclick] exception', ex);
        }
    }

    setTileClass() {
        console.log('[productTile.selectTile] isselected', this.isSelected);
        if (this.keepSelection && this.isSelected) {
            this.tileClass = 'selected';
        } else {
            this.tileClass = this.isSelected ? 'tileSelected' : 'tile';
        }
    }

    handleQuantityFieldValueCHange(event) {
        this.quantityFieldValue = event.detail.value;
        const updateEvent = new CustomEvent('qtyupdate', {
            detail: { productId: this.productId, qty: this.quantityFieldValue }
        });
    }
    handlePriceFieldValueCHange(event) {
        this.priceFieldValue = event.detail.value;
        const updateEvent = new CustomEvent('priceupdate', {
            detail: { productId: this.productId, price: this.quantityFieldValue }
        });
    }
}