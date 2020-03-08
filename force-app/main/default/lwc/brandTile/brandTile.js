import { LightningElement, api, wire } from 'lwc';

import BRAND_LOGOS from '@salesforce/resourceUrl/BrandLogos';

export default class BrandTile extends LightningElement {
    /* Private Properties */
    _brand;

    brandName;
    pictureUrl;
    isSelected = false;

    tileClass = 'tile';

    connectedCallback() {
    }

    disconnectedCallback() {
    }

    /* Public Properties */
    @api 
    get brand() {
        return this._brand;
    }
    
    set brand(value) {
        console.log('[brandtile.setbrand] value', value);
        this._brand = value;
        this.brandName = value.Name;
        this.isSelected = value.isSelected;
        if (value.Primary_Logo__c) {
            //this.pictureUrl = BRAND_LOGOS + '/BrandLogos/'+value.Primary_Logo__c;
            this.pictureUrl = 'https://salesforce-static.b-fonline.com/images/brand_logos/' + value.Primary_Logo__c;
        }
        console.log('[brandtile] brand is selected:', value.isSelected);
        this.selectTile();
    }

    handleSelectTile(isSelected) {
        console.log('[brandtile] selectTile method called');
        this.isSelected = isSelected;
        this.selectTile();
    }

    handleClick(event) {
        event.preventDefault();

        console.log('[brandTile.handleClick] brand selected', this.brand);
        this.isSelected = !this.isSelected;
        this.selectTile();

        const eventName = this.isSelected ? 'selected' : 'deselected';
        const selectedEvent = new CustomEvent(eventName, {
            detail: this.brand.Id
        });
        this.dispatchEvent(selectedEvent);
    }

    selectTile() {
        this.tileClass = this.isSelected ? 'tileSelected' : 'tile';
    }
}