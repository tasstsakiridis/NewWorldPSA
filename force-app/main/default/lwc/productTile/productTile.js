import { LightningElement, api, track, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

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
        console.log('[productTile] product', this.product);
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
        console.log('[productTile] psaitem', this.psaItem);
        if (this.psaItem) {            
            let str = '';
            if (this.psaItem.Plan_Volume__c) { str = '<b>'+this.psaItem.Plan_Volume__c + '</b> cases'; }
            if (this.psaItem.Plan_Rebate__c) { str += ' @ $<b>' + parseFloat(this.psaItem.Plan_Rebate__c) + '</b>/case'; }
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
            return '$' + parseFloat(this.psaItem.Total_Investment__c) + ' total investment';
        }
    }

    handleSelectTile(isSelected) {
        console.log('[producttile] selectTile method called');
        this.isSelected = isSelected;
        //this.selectTile();
    }
    handlePSAUpdate(detail) {
        console.log('[producttile.handlepsaupdated] detail', detail, this.psaItem.Id);
        try {
        if (detail.psaItemId === this.psaItem.Id) {   
            const newItem = Object.assign({}, this.psaItem);                     
            newItem.Plan_Rebate__c = detail.discount;
            newItem.Plan_Volume__c = detail.volume;
            newItem.Total_Investment__c = detail.totalInvestment;
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
        this.selectTile();
        
        const selectedEvent = new CustomEvent('selected', {
            detail: { productId: this.product.Id, psaItemId: this.psaItemId }
        });
        this.dispatchEvent(selectedEvent);
        }catch(ex) {
            console.log('[producttile.handleclick] exception', ex);
        }
    }

    selectTile() {
        if (this.keepSelection && this.isSelected) {
            this.tileClass = 'selected';
        } else {
            this.tileClass = this.isSelected ? 'tileSelected' : 'tile';
        }
    }

}