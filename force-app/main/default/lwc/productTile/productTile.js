import { LightningElement, api, track, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

import LABEL_BOTTLE from '@salesforce/label/c.Bottle';
import LABEL_BOTTLES from '@salesforce/label/c.Bottles';
import LABEL_CASE from '@salesforce/label/c.Case';
import LABEL_CASES from '@salesforce/label/c.Cases';
import LABEL_TOTAL_INVESTMENT from '@salesforce/label/c.TotalInvestment';
import LABEL_SPLIT from '@salesforce/label/c.Split';

export default class ProductTile extends LightningElement {
    labels = {
        bottle: { label: LABEL_BOTTLE, labelPlural: LABEL_BOTTLES, labelLowercase: LABEL_BOTTLE.toLowerCase() },
        case: { label: LABEL_CASE, labelPlural: LABEL_CASES, labelLowercase: LABEL_CASE.toLowerCase() },
        split: { label: LABEL_SPLIT }
    };

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
    captureRebatePerBottle;

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

    get formattedVolume() {
        let v = 0;

        if (this.psaItem && this.psaItem.Plan_Volume__c != undefined) {
            if (this.psaItem.Plan_Volume__c == this.psaItem.Proposed_Plan_Volume__c || this.psaItem.Proposed_Plan_Volume__c == undefined) {
                if (this.captureVolumeInBottles) {
                    v = '<b>' + this.psaItem.Plan_Volume__c * (this.product.Pack_Quantity__c == undefined ? 1 : this.product.Pack_Quantity__c) + '</b> ' + LABEL_BOTTLES.toLowerCase();
                } else {
                    v = '<b>' + this.psaItem.Plan_Volume__c + '</b> ' + LABEL_CASES.toLowerCase(); 
                }
            } else {
                if (this.captureVolumeInBottles) {
                    v = '<b>' + this.psaItem.Proposed_Plan_Volume__c * (this.product.Pack_Quantity__c == undefined ? 1 : this.product.Pack_Quantity__c) + '</b> ' + LABEL_BOTTLES.toLowerCase();
                } else {
                    v = '<b>' + this.psaItem.Proposed_Plan_Volume__c + '</b> ' + LABEL_CASES.toLowerCase();
                }
            }
        }

        return v;

    }
    get planRebate() {
        let r = 0;

        if (this.psaItem.Plan_Rebate__c != undefined) { 
            if (this.calcSplit) {
                r = this.psaItem.Product_Split__c;
            } else {
                if (this.psaItem.Plan_Rebate__c == this.psaItem.Proposed_Plan_Rebate__c || this.psaItem.Proposed_Plan_Rebate__c == undefined) {
                    r = this.psaItem.Plan_Rebate__c 
                } else {
                    r = this.psaItem.Proposed_Plan_Rebate__c;                         
                }    
            }
        }

        return parseFloat(r).toFixed(2);
    }

    @api 
    psaItem;

    get psaItemId() {
        return this.psaItem == undefined ? undefined : this.psaItem.Id;
    }

    get psaItemSummary() {
        //console.log('[productTile] psaitem', this.psaItem == undefined ? 'undefined' : JSON.parse(JSON.stringify(this.psaItem)));
        //console.log('[productTile] product', this.product == undefined ? 'undefined' : JSON.parse(JSON.stringify(this.product)));
        if (this.psaItem) {            
            let str = '';
            if (this.psaItem.Plan_Volume__c != undefined) { 
                if (this.psaItem.Plan_Volume__c == this.psaItem.Proposed_Plan_Volume__c || this.psaItem.Proposed_Plan_Volume__c == undefined) {
                    if (this.captureVolumeInBottles) {
                        str = '<b>'+this.psaItem.Plan_Volume__c * (this.product.Pack_Quantity__c == undefined ? 1 : this.product.Pack_Quantity__c)+'</b> bottles';
                    } else {
                        str = '<b>'+this.psaItem.Plan_Volume__c + '</b> cases'; 
                    }
                } else {
                    if (this.captureVolumeInBottles) {
                        str = '<b>'+this.psaItem.Proposed_Plan_Volume__c * (this.product.Pack_Quantity__c == undefined ? 1 : this.product.Pack_Quantity__c)+'</b> bottles';
                    } else {
                        str = '<b style="color: red;">'+this.psaItem.Proposed_Plan_Volume__c + '</b> cases';
                    }
                }
            }

            if (this.psaItem.Plan_Rebate__c != undefined) { 
                if (this.calcSplit) {
                    str += ' @ <b>' + this.psaItem.CurrencyIsoCode + ' ' + parseFloat(this.psaItem.Product_Split__c).toFixed(2) + '</b> ' + LABEL_SPLIT;
                } else {
                    if (this.psaItem.Plan_Rebate__c == this.psaItem.Proposed_Plan_Rebate__c || this.psaItem.Proposed_Plan_Rebate__c == undefined) {
                        if (this.captureRebatePerBottle) {
                            str += ' @ ' + this.psaItem.CurrencyIsoCode + '<b>' + parseFloat(this.psaItem.Plan_Rebate__c) + '</b>/bottle'; 
                        } else {
                            str += ' @ <b>' + parseFloat(this.psaItem.Plan_Rebate__c) + '</b>/case'; 
                        }
                    } else {
                        if (this.captureRebatePerBottle) {
                            str += ' @ <b style="color: red;">' + parseFloat(this.psaItem.Proposed_Plan_Rebate__c) + '</b>/bottle';                         
                        } else {
                            str += ' @ <b style="color: red;">' + parseFloat(this.psaItem.Proposed_Plan_Rebate__c) + '</b>/case';                         
                        }
                    }    
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
            return parseFloat(this.psaItem.Total_Investment__c) + ' ' + LABEL_TOTAL_INVESTMENT.toLowerCase();
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
                const newItem = Object.assign({}, this.psaItem);                     
                newItem.Plan_Rebate__c = detail.discount;
                newItem.Plan_Volume__c = detail.volume;
                newItem.Total_Investment__c = detail.totalInvestment;
                newItem.Proposed_Plan_Volume__c = detail.proposedVolume;
                newItem.Proposed_Plan_Rebate__c = detail.proposedRebate;
                this.psaItem = Object.assign({}, newItem);
            }
        }catch(ex) {
            console.log('[producttile.handlepsaupdated] exception', ex);
        }
    }

    handleClick(event) {
        event.preventDefault();

        try {
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