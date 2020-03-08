import { LightningElement, api, wire } from 'lwc';
import { registerListener, unregisterAllListeners } from 'c/pubsub';
import { CurrentPageReference } from 'lightning/navigation';

export default class AccountTile extends LightningElement {
    /* Private Properties */
    _account;

    accountName;
    accountStreet;
    accountCity;
    accountState;
    accountPostalCode;
    accountCountry;
    pictureUrl;
    isSelected = false;

    tileClass = 'tile';

    @wire(CurrentPageReference) pageRef;

    connectedCallback() {
        registerListener('selectTile', this.handleSelectTile, this);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }

    /* Public Properties */
    @api 
    get account() {
        return this._account;
    }
    
    set account(value) {
        console.log('[accounttile.setaccount] value', value);
        this._account = value;
        this.accountName = value.item.Name;
        this.accountStreet = value.item.ShippingStreet;
        this.accountState = value.item.ShippingState;
        this.accountCity = value.item.ShippingCity;
        this.accountCountry = value.item.ShippingCountry;
        this.accountPostalCode = value.item.ShippingPostalCode;
        this.isSelected = value.isSelected;
        console.log('[accounttile] account is selected:', value.isSelected);
        this.selectTile();
    }

    handleSelectTile(isSelected) {
        console.log('[accounttile] selectTile method called');
        this.isSelected = isSelected;
        this.selectTile();
    }

    handleClick(event) {
        event.preventDefault();

        this.isSelected = !this.isSelected;
        this.selectTile();

        const eventName = this.isSelected ? 'selected' : 'deselected';
        const selectedEvent = new CustomEvent(eventName, {
            detail: this.account.item.Id
        });
        this.dispatchEvent(selectedEvent);
    }

    selectTile() {
        this.tileClass = this.isSelected ? 'tileSelected' : 'tile';
    }
}