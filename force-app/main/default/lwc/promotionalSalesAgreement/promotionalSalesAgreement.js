import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo } from 'lightning/uiObjectInfoApi';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';

import { refreshApex } from '@salesforce/apex';

import { fireEvent } from 'c/pubsub';

import getUserMarket from '@salesforce/apex/PromotionalSalesAgreement_Controller.getUserMarket';
import getAccountById from '@salesforce/apex/PromotionalSalesAgreement_Controller.getAccountById';
import getAccountsByName from '@salesforce/apex/PromotionalSalesAgreement_Controller.getAccountsByName';
import getAccountsForParent from '@salesforce/apex/PromotionalSalesAgreement_Controller.getAccountsForParent';
import getWholesalers from '@salesforce/apex/PromotionalSalesAgreement_Controller.getWholesalers';
import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';
import savePSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.savePSA';

import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import userId from '@salesforce/user/Id';

import LABEL_CANCEL from '@salesforce/label/c.Cancel';
import LABEL_CHANGE from '@salesforce/label/c.Change';
import LABEL_CLEAR from '@salesforce/label/c.Clear';
import LABEL_SAVE_AND_CLOSE from '@salesforce/label/c.Save_and_Close';
import LABEL_SAVE from '@salesforce/label/c.Save';
import LABEL_SKIP from '@salesforce/label/c.Skip';
import LABEL_RECORD_TYPE from '@salesforce/label/c.RecordType';
import LABEL_DURATION from '@salesforce/label/c.Duration';
import LABEL_YES from '@salesforce/label/c.Yes';
import LABEL_NO from '@salesforce/label/c.No';
import LABEL_ITEMS from '@salesforce/label/c.Items';
import LABEL_CLONE from '@salesforce/label/c.Clone';
import LABEL_HELP from '@salesforce/label/c.help';
import LABEL_PREFERRED_RTM from '@salesforce/label/c.Preferred_RTM';
import LABEL_ALTERNATE_RTM from '@salesforce/label/c.Alternate_RTM';
import LABEL_ROUTETOMARKET from '@salesforce/label/c.RouteToMarket';
import LABEL_NEW from '@salesforce/label/c.New';

import OBJECT_ACTIVITY from '@salesforce/schema/Promotion_Activity__c';
import OBJECT_PROMOTION from '@salesforce/schema/Promotion__c';

import FIELD_BEGIN_DATE from '@salesforce/schema/Promotion_Activity__c.Begin_Date__c';
import FIELD_END_DATE from '@salesforce/schema/Promotion_Activity__c.End_Date__c';
import FIELD_LENGTH_OF_PSA from '@salesforce/schema/Promotion_Activity__c.Length_of_Agreement__c'
import FIELD_ACCOUNT from '@salesforce/schema/Promotion_Activity__c.Account__c';
import FIELD_CONTACT from '@salesforce/schema/Promotion_Activity__c.Contact__c';
import FIELD_WHOLESALER_PREFERRED from '@salesforce/schema/Promotion_Activity__c.Wholesaler_Preferred__c';
import FIELD_WHOLESALER_ALTERNATE from '@salesforce/schema/Promotion_Activity__c.Wholesaler_Alternate__c';

import FIELD_PROMOTION_ACCOUNT from '@salesforce/schema/Promotion__c';

export default class PromotionalSalesAgreement extends NavigationMixin(LightningElement) {
    labels = {
        cancel                  : { label: LABEL_CANCEL },
        clear                   : { label: LABEL_CLEAR },
        change                  : { label: LABEL_CHANGE, labelLowercase: LABEL_CHANGE.toLowerCase() },
        saveAndClose            : { label: LABEL_SAVE_AND_CLOSE },
        save                    : { label: LABEL_SAVE },
        skip                    : { label: LABEL_SKIP },
        recordType              : { label: LABEL_RECORD_TYPE },
        duration                : { label: LABEL_DURATION  },
        yes                     : { label: LABEL_YES },
        no                      : { label: LABEL_NO },
        items                   : { label: LABEL_ITEMS },
        actuals                 : { label: 'Actuals' },
        clone                   : { label: LABEL_CLONE },
        help                    : { label: LABEL_HELP },
        success                 : { label: 'Success' },
        selectAll               : { label: 'Select All' },
        deSelectAll             : { label: 'DeSelect All' },
        dateRange               : { label: 'Date Range' },
        customerDetails         : { label: 'Customer Details' },
        companyDetails          : { label: 'Company Details' },
        startDate               : { label: 'This agreement will start at', error: 'No Start Date selected' },
        lengthOfPSA             : { yearsLabel: 'Length of Agreement (in years)', monthsLabel: 'Length of Agreement (in months)', error: 'Please select from one of the Length of Agreement options' },
        parentAccount           : { label: 'Parent Account', error: 'No Parent or Retail Account selected and no Signing Customer selected' },
        account                 : { label: 'Account', labelPlural: 'Accounts' },        
        retailAccountsHeading   : { label: 'Names of individual outlets in estate and parts of business included in PSA' },
        search                  : { label: 'Search' },
        searchBy                : { label: 'Search by %0' },
        signingCustomerHeader   : { label: 'Full name of signing customer'},
        selectParentAccount     : { help: 'Enter the name, or part of the name, of an account to search for' },
        parentAccountSearchResults : { label: 'Accounts matching "%0".  Tap on an account below to select it and find any of it\'s retail accounts'},
        accountSearchResults    : { label: 'Accounts matching "%0"' },
        noAccountsFound         : { label: 'No retail accounts found for %0' },
        preferredRTM            : { label: LABEL_PREFERRED_RTM, placeholder: '', error: 'No Preferred Wholesaler selected' },
        alternateRTM            : { label: LABEL_ALTERNATE_RTM, placeholder: '', error: 'No Alternate Wholesaler selected'},
        routeToMarket           : { label: LABEL_ROUTETOMARKET },
        noSigningCustomers      : { message: 'There are no contacts for this account setup as decision makers.'},
        error                   : { message: 'Errors found validating/saving the PSA.  Please review and try saving again.' },
        saveError               : { message: 'Error saving PSA' },
        saveSuccess             : { message: 'All changes saved successfully'},
        year                    : { label: 'year', labelPlural: 'years' },
        month                   : { label: 'month', labelPlural: 'months' }
        
    };

    @track promotionObjectInfo;
    @wire(getObjectInfo, { objectApiName: OBJECT_PROMOTION })
    promotionObjectInfo;

    get promotionRecordTypeId() {
        const rtis = this.promotionObjectInfo.data.recordTypeInfos;
        return Object.keys(rtis).find(rti => rtis[rti].name === this.thePSA.RecordType.Name);
    }

    @api recordId;
    error;
    errors;
    hasLengthOfPSAError = false;
    hasStartDateError = false;
    hasAlternateRTMError = false;
    hasPreferredRTMError = false;
    hasParentAccountError = false;
    hasChildAccountsError = false;
    thePSA;
    startDate = new Date();
    isSearching = false;
    isUsingParentAccount = true;
    isSearchingForParent = true;
    hasMultipleAccountPages = true;
    pageNumber = 1;
    pageSize;
    totalItemCount = 0;
    accountQueryString = '';
    accountHasManyDecisionMakers = false;
    accounts;
    selectedAccounts = new Map();
    promotionsToDelete = new Map();
    wiredAccount;

    wiredAgreement;
    @wire(getPSA, {psaId: '$recordId'})
    wiredGetAgreement(value) {
        this.wiredAgreement = value;
        console.log('[psa.getagreement] value', value);
        if (this.isPhone && this.isThisTass) {
            alert('[psa.getagreement]');
        }
        if (value.error) {
            this.error = value.error;
            this.thePSA = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.loadPSADetails(value.data);
        }
    }

    @wire(CurrentPageReference) pageRef;

    market = '';
    marketId = '';
    @wire(getUserMarket)
    wiredMarket(value) {
        console.log('[psa.getmarket] value', value);
        if (value.data) {
            this.market = value.data;
            this.error = undefined;
            this.marketId = this.market.Id;
            this.maximumLengthOfPSA = this.market.Maximum_Agreement_Length__c == undefined ? 3 : this.market.Maximum_Agreement_Length__c;            
        } else if (value.error) {
            this.error = value.error;
            this.market = { Id: '', Name: 'Australia', Maximum_Agreement_Length__c: 3 };
            this.showToast('warning', labels.generalError.title, 'Could not load market details.  Check the Market setting on your user profile');
        }
    }

    wiredWholesalers;
    wholesalers;
    wholesalerPreferred;
    wholesalerAlternate;
    @wire(getWholesalers, { market: '$marketId'})
    wiredGetWholesalers({ error, data }) {
        if (data) {
            if (this.isPhone && this.isThisTass) {
                alert('[psa.getwholesalers]');
            }
            console.log('[wiredGetWholesalers] wholesalers', data);
            this.error = undefined;
            this.wiredWholesalers = data;
            this.wholesalers = data.map(wholesaler => { 
               return { label: wholesaler.Name, value: wholesaler.Id }; 
            });
        } else if (error) { 
            this.error = error;
            this.wholesalers = undefined;
        }
    }

    isPhone = CLIENT_FORM_FACTOR === "Small";
    get isThisTass() {
        return userId == '00530000005n92iAAA';
    }


    @track
    lengthOfPSA = '1';
    
    get canClone() {
        return false;
        return this.thePSA != null;
    }
    get canEditItems() {
        return this.thePSA != null && this.thePSA.Status__c !== 'Approved';
    }
    get canEditActuals() {
        return true;
        return this.thePSA != null && this.thePSA.Status__c == 'Approved';
    }

    error;
    get psaName() {
        return this.thePSA == undefined ? '' : this.thePSA.Name;
    }

    get psaStatus() {
        return this.thePSA == undefined ? LABEL_NEW : this.thePSA.Status__c;
    }

    isLengthInYears = true;

    maximumLengthOfPSA = 3;
    get lengthOfPSAOptions() {
        console.log('[psa.lengthofpsaoptions] max length of psa', this.maximumLengthOfPSA);
        const options = [];
        for(var i = 0; i < this.maximumLengthOfPSA; i++) {
            options.push({label: (i+1).toString(), value: (i+1).toString()});
        }
        return options;
        return [
            { label: '1', value: '1' },
            { label: '2', value: '2' },
            { label: '3', value: '3' },
            { label: '4', value: '4' },
            { label: '5', value: '5' },
            { label: '99', value: '99' }
        ];
    }
    

    get formattedStartDate() {
        var theDate = this.startDate == null ? new Date() : this.startDate;
        return theDate.toISOString();
    }
    get endDate() {
        var theDate = this.startDate == null ? new Date() : this.startDate;
        var year = theDate.getFullYear();
        var month = theDate.getMonth();
        var day = theDate.getDate();
        let newDate = new Date(year, month, day);
        console.log('[enddate] islengthinyears', this.isLengthInYears, this.lengthOfPSA, newDate);
        if (this.isLengthInYears) {
            newDate.setFullYear(newDate.getFullYear() + parseInt(this.lengthOfPSA));
        } else {
            newDate.setMonth(newDate.getMonth() + parseInt(this.lengthOfPSA));
        }
        if (newDate > theDate) {
            newDate.setDate(newDate.getDate() - 1);
        }
        console.log('[endDate] theDate', theDate, year, month, day, newDate);
        return newDate;
    }    

    parentAccount;
    get parentAccountSelected() {
        return (this.parentAccount == null);
    }
    
    get accountSearchInputLabel() {
        var lbl = this.labels.searchBy.label;
        if (this.isUsingParentAccount) {
            lbl = lbl.replace('%0', this.labels.parentAccount.label);
        } else {
            lbl = lbl.replace('%0', this.labels.account.label);
        }

        return lbl;
    }

    get accountName() {
        console.log('[accountName] parentAccount', this.parentAccount);
        return this.parentAccount ? this.parentAccount.Name : '';
    }
    get accountStreet() {
        return this.parentAccount ? this.parentAccount.ShippingStreet : '';
    }
    get accountCity() {
        return this.parentAccount ? this.parentAccount.ShippingCity : '';
    }
    get accountCountry() {
        return this.parentAccount ? this.parentAccount.ShippingCountry : '';
    }
    get accountState() {
        return this.parentAccount ? this.parentAccount.ShippingState : '';
    }
    get accountPostalCode() {
        return this.parentAccount ? this.parentAccount.ShippingPostalCode : '';
    }

    get signingCustomer() {
        var customer;
        if (this.parentAccount && this.parentAccount.Contacts && this.parentAccount.Contacts.length > 0) {
            customer = this.parentAccount.Contacts[0];
        }
        return customer;
    }
    get signingCustomerName() {
        var name = '';
        if (this.signingCustomer) {
            name = this.signingCustomer.Name;
        } else if (this.parentAccount) {
            name = this.labels.noSigningCustomers.message;
        }
        console.log('[signingCustomerName] name',name);
        return name;
    }
    get hasMultipleSigningContacts() {
        var hasMultiple = false;
        if (this.parentAccount && this.parentAccount.Contacts) {
            hasMultiple = this.parentAccount.Contacts.length > 1;
        }
        return hasMultiple;
    }

    get accountsHeader() {
        if (this.isSearchingForParent) {
            if (this.accounts) {
                if (this.isUsingParentAccount) {
                    return this.labels.parentAccountSearchResults.label.replace('%0', this.accountQueryString);
                } else {
                    return this.labels.accountSearchResults.label.replace('%0', this.accountQueryString);
                }
            } else {
                return this.labels.selectParentAccount.help;
            }
        } else {
            //if (this.accounts && this.accounts.length > 0) {
            //    return this.labels.retailAccountsHeading.label;
            //} else {
            //    return this.labels.noAccountsFound.label.replace('%0', this.accountName);
            //}
        }
    }
    get showAccountActions() {
        return this.isUsingParentAccount && !this.isSearchingForParent;
        if (!this.isSearchingForParent) {
            return true;
        } else {
            return false;
        }
    }

    /*
        Constructor
    */
    connectedCallback() {
        // Register Event Listeners
        //registerListener('accountSelected', this.handleAccountSelected, this);
        //this.getAgreement();
        console.log('[psa.connectedCallback] psaId', this.psaId);        
    }    
    renderedCallback() {
        console.log('[psa.renderredCallback] psaId', this.psaId);    
        if (!this.isLengthInYears) {
            this.template.querySelector("lightning-input.length-type-toggle").checked = this.isLengthInYears;            
        }    
        if (!this.isUsingParentAccount) {
            this.template.querySelector("lightning-input.account-type-toggle").checked = this.isUsingParentAccount;            
        }
        
    }

    /*
        Handle Button Clicks
    */
    handleCancelButtonClick(event) {
        console.log('[handleCancelButtonClick]');
        try {
            this[NavigationMixin.Navigate]({
                type: 'standard__objectPage',
                attributes: {
                    objectApiName: 'Promotion_Activity__c',
                    actionName: 'list'
                },
                state: {
                    filterName: 'PromotionalSalesAgreements'
                }
            });
        } catch(ex) {
            console.log('[cancel button click] ex', ex);
        }
    }
    handleSaveButtonClick(event) {
        try {
            const isValid = this.validatePSA();
            console.log('[handleSaveButtonClick] isValid', isValid);
            if (isValid) {
                this.save();
            } else {
                this.showToast('error', this.labels.saveError.message, this.labels.error.message);            
            }
        }catch(ex) {
            console.log('[handleSaveButtonClick] exception', ex);
        }
    }
    handleItemsButtonClick(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__PromotionalSalesAgreementItemsContainer'
            },
            state: {
                c__psaId: this.recordId
            }
        });
    }
    handleActualsButtonClick(event) {
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__PromotionalSalesAgreementActualsContainer'
            },
            state: {
                c__psaId: this.recordId
            }
        });
    }
    handleSubmitForApprovalButtonClick(event) {

    }
    handleCloneButtonClick(event) {

    }
    handleHelpButtonClick(event) {

    }
    handleSearchAccountChange(event) {
        console.log('[handleSearchAccountChange] event.detail', event.detail);
        this.accountQueryString = event.detail.value;
        console.log('this.accountquerystring', this.accountQueryString);
    }
    handleAccountSearchButtonClick(event) {
        this.getAccounts();
    }
    handleClearAccountDetailsClick(event) {
        this.parentAccount = undefined;
        this.accounts = undefined;
        this.isSearchingForParent = true;
    }

    handleAccountTypeToggle(ev) {
        console.log('[handleAccountTypeChange] changed to', ev.detail.checked);
        this.isUsingParentAccount = ev.detail.checked;
        this.parentAccountFilterClause = "WHERE RecordType.Name = 'Parent'";
        
        if (!this.isUsingParentAccount) {
            this.parentAccountFilterClause = "WHERE RecordType.Name != 'Parent'";
        }

        console.log('[handleAccountTypeChange] isusingparentaccount', this.isUsingParentAccount);
    }    

    handleStartDateChange(ev) {
        this.startDate = new Date(ev.detail.value);
        console.log('startdate', this.startDate);
    }
    handleLengthOfPSAChange(ev) {
        console.log('[handleLengthOfPSAChange] value', ev.detail.value);
        this.lengthOfPSA = ev.detail.value;
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
        this.getAccounts();
    }
    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
        this.getAccounts();
    }
    handleSelectAllAccountsClick(event) {
        console.log('select all accounts clicked');
        fireEvent(this.pageRef, 'selectTile', true);
    }
    handleUnSelectAllAccountsClick(event) {
        fireEvent(this.pageRef, 'selectTile', false);
    }

    handleChangeSigningCustomerClick(event) {

    }
    handlePreferredRTMChange(event) {
        this.wholesalerPreferred = event.detail.value;
    }
    handleAlternateRTMChange(event) {
        this.wholesalerAlternate = event.detail.value;
    }
    handleLengthTypeToggle(event) {
        try {            
            this.isLengthInYears = event.detail.checked;   
            let newLength = 1;         
            if (this.isLengthInYears) {
                newLength = Math.floor(this.lengthOfPSA / 12).toString();
                if (newLength < 1) { newLength = 1; }
                this.lengthOfPSA = newLength.toString();
            } else {
                this.lengthOfPSA = parseInt(this.lengthOfPSA) * 12;
            }
            console.log('[psa.handlelengthtypetoggle] islength in year, length', this.isLengthInYears, this.lengthOfPSA);
        }catch(ex) {
            console.log('[psa.handlelengthtypechange] length type', event.detail.checked);
        }
    }

    /*
        Handle Listener events
    */   
    handleAccountSelected(event) {
        console.log('[handleAccountSelected] account', event.detail);
        if (this.isSearchingForParent) {
            if (event.detail) {
                const accountId = event.detail;
                this.getAccount(accountId);    
            }
        } else {
            if (this.selectedAccounts == undefined) { this.selectedAccounts = new Map(); }
            // Check to see if this account was previously de-selected and marked for deletion
            if (this.promotionsToDelete.has(event.detail)) {
                const sa = this.promotionsToDelete.get(event.detail);
                this.promotionsToDelete.delete(event.detail);
                this.selectedAccounts.set(event.detail, sa);
            } else if (!this.selectedAccounts.has(event.detail)) {
                this.selectedAccounts.set(event.detail, { id: '', itemId: event.detail });
            }
        }
    }    
    handleAccountDeSelected(event) {
        console.log('[handleAccountDeSelected] account', event.detail);
        if (this.isSearchingForParent) {
            this.parentAccount = undefined;
            this.isSearchingForParent = true;
            this.signingCustomer = undefined;
        } else {
            if (this.selectedAccounts.has(event.detail)) {
                const sa = this.selectedAccounts.get(event.detail);
                this.selectedAccounts.delete(event.detail);
                if (sa.id !== '') {
                    this.promotionsToDelete.set(event.detail, sa);
                }
            }
        }
    }

    /**
     * Helper functions
     */
    loadPSADetails(data) {
        //this.thePSA = Object.assign(this.thePSA, record);            
        try {
            this.thePSA = { ...data };
            console.log('[getAgreement] psa', this.thePSA);
            this.psaId = data.Id;
            if (data.Account__c) {
                this.parentAccount = {
                    Id: data.Account__c,
                    Name: data.Account__r.Name,
                    ShippingStreet: data.Account__r.ShippingStreet,
                    ShippingCity: data.Account__r.ShippingCity,
                    ShippingCountry: data.Account__r.ShippingCountry,
                    ShippingState: data.Account__r.ShippingState,
                    ShippingCountry: data.Account__r.ShippingCountry,
                    Contacts: [data.Contact__r]
                };
                this.isSearchingForParent = false;
                this.isUsingParentAccount = data.Account__r.RecordType.Name === 'Parent';
                const el = this.template.querySelector("lightning-input.account-type-toggle");
                console.log('[getPSA] account-type-toggle', el);
                if (el) {
                    el.checked = this.isUsingParentAccount;
                }
                //this.template.querySelector("lightning-input.account-type-toggle").checked = this.isUsingParentAccount;
            }
            this.wholesalerPreferred = data.Wholesaler_Preferred__c;
            this.wholesalerAlternate = data.Wholesaler_Alternate__c;
            if (data.Begin_Date__c) {
                this.startDate = new Date(data.Begin_Date__c);
            }
            if (data.Is_Length_in_Years__c != undefined) {
                this.isLengthInYears = data.Is_Length_in_Years__c;
            }
            if (data.Length_of_Agreement__c != undefined) {
                if (this.isLengthInYears) {
                    this.lengthOfPSA = data.Length_of_Agreement__c.toString();
                } else {
                    this.lengthOfPSA = data.Length_of_Agreement__c;
                }
            }
            console.log('[getPSA] islengthInYears, length', this.isLengthInYears, this.lengthOfPSA);

            this.selectedAccounts.clear();
            this.promotionsToDelete.clear();
                        
            if (data.Promotions__r != undefined && data.Promotions__r.length > 0) {
                if (this.isPhone && this.isThisTass) {
                    alert('[psa.loadpsadetails] # of promotions', data.Promotions__r.length);
                }
                data.Promotions__r.forEach(p => {
                    this.selectedAccounts.set(p.Account__c, { id: p.Id, itemId: p.Account__c });
                });
                getAccountsForParent({ parentAccountId: this.parentAccount.Id, pageNumber: 1 })
                    .then(result => {
                        try {
                        console.log('[getAccountsForParent] result', result);
                        if (this.isPhone && this.isThisTass) {
                            alert('[psa.getaccountsforparent] # of child accounts', result.totalItemCount);
                        }
            
                        const newList = result.records.map(account => {
                            var isSelected = this.selectedAccounts.has(account.Id);

                            return { item: account, isSelected: isSelected };
                        });
                        console.log('[getAccountsForParent] children', newList);
                        this.accounts = {
                            pageSize: result.pageSize,
                            pageNumber: result.pageNumber,
                            records: newList,
                            totalItemCount: result.totalItemCount
                        };
                        }catch(ex) {
                            console.log('[getAccountsForParent] exception', ex);
                        }
                    })
                    .catch(error => {
                        console.log('[getAccountsForParent] error', error);
                        this.error = error;
                        this.accounts = undefined;
                    });

            } else {
                if (this.isPhone && this.isThisTass) {
                    alert('[psa.loadpsadetails] no promotions for this psa');
                }    
            }
        }catch(ex) {
            console.log('[getPSA] exception', ex);
        }

    }
    validatePSA() {
        let isValid = true;

        this.hasLengthOfPSAError = false;
        this.hasStartDateError = false;
        this.hasPreferredRTMError = false;
        this.hasAlternateRTMError = false;
        this.hasParentAccountError = false;
        this.hasChildAccountError = false;

        if (this.lengthOfPSA == undefined) {
            this.hasLengthOfPSAError = true;
            isValid = false; 
        } else if (this.isLengthInYears == false) {
            if (this.lengthOfPSA / 12 > this.maximumLengthOfPSA) {
                this.hasLengthOfPSAError = true;
            }
        }
        if (this.wholesalerPreferred == undefined) {
            this.hasPreferredRTMError = true;
            isValid = false; 
        }
        if (this.wholesalerAlternate == undefined) {
            this.hasAlternateRTMError = true;
            isValid = false; 
        }
        if (this.parentAccount == undefined) {
            this.hasParentAccountError = true;
            isValid = false; 
        } else if (this.isUsingParentAccount && (this.selectedAccounts == undefined || this.selectedAccounts.length == 0)) {
            this.hasChildAccountsError = true;
            isValid =  false; 
        }
        return isValid;
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
    
    /*
        Server calls
    */
    getAccount(accountId) {
        console.log('[promotionalSalesAgreement.getAccount] accountId', accountId);

        try {
        getAccountById({accountId: accountId})
            .then(result => {
                console.log('[getAccountById] result', result);
                this.parentAccount = result;
                this.isSearchingForParent = false;
                this.accounts = undefined;
                this.pageNumber = 1;
                if (this.isUsingParentAccount) {
                    this.findAccountsForParent(result.Id);
                }
            })
            .catch(error => {
                console.log('[getAccountsById] error', error);
                this.error = error;
                this.parentAccount = undefined;                
            });
        }catch(ex) {
            console.log('[getAccount] exception', ex);
        }
    }
    getAccounts() {
        console.log('[handleaccountsearchbuttonclick] querystring', this.accountQueryString);
        console.log('[handleaccountsearchbuttonclick] usingparent', this.isUsingParentAccount);
        console.log('[handleaccountsearchbuttonclick] market', this.market);
        getAccountsByName({accountName: this.accountQueryString, isSearchingForParent: this.isUsingParentAccount, market: this.marketId, pageNumber: this.pageNumber})
            .then(result => {
                console.log('[getAccountsByName] result', result);
                const newList = result.records.map(item => {
                    return { item: item, isSelected: false };
                });

                this.accounts = {
                    pageSize: result.pageSize,
                    pageNumber: result.pageNumber,
                    records: newList,
                    totalItemCount: result.totalItemCount
                };
                this.error = undefined;
            })
            .catch(error => {
                console.log('[getAccountsByName] error', error);
                this.error = error;
                this.accounts = undefined;
            });

    }
    findAccountsForParent(accountId) {
        getAccountsForParent({ parentAccountId: accountId, pageNumber: this.pageNumber })
            .then(result => {
                console.log('[getAccountsForParent] result', result);
                const newList = result.records.map(item => {
                    return { item: item, isSelected: false };
                });
                console.log('[getAccountsForParent] newList', newList);
                this.accounts = {
                    pageSize: result.pageSize,
                    pageNumber: result.pageNumber,
                    records: newList,
                    totalItemCount: result.totalItemCount
                };
                this.error = undefined;
            })
            .catch(error => {
                console.log('[getAccountsForParent] error', error);
                this.error = error;
                this.accounts = undefined;
            });
    }
    save() {
        try {
            console.log('psa', this.thePSA);
        const param = {
            id: this.thePSA.Id,
            recordTypeId: this.thePSA.RecordTypeId 
        };

        if (this.thePSA.Market__c == undefined) {
            param.marketId = this.marketId;
        }
        
        param.beginDate = this.startDate;
        param.endDate = this.endDate;
        param.lengthOfPSA = this.lengthOfPSA;
        param.isLengthInYears = this.isLengthInYears;
        param.parentAccountId = this.parentAccount.Id;
        param.signingCustomerId = this.signingCustomer.Id;
        param.wholesalerPreferredId = this.wholesalerPreferred;
        console.log('wholesalerPreferred', this.wholesalerPreferred);
        const wp = this.wholesalers.find(w => w.value === this.wholesalerPreferred);
        param.wholesalerPreferredName = wp.label;
        console.log('wp', wp);
        param.wholesalerAlternateId = this.wholesalerAlternate;
        console.log('wholesalerAlternate', this.wholesalerAlternate);
        const wa = this.wholesalers.find(w => w.value === this.wholesalerAlternate);
        param.wholesalerAlternateName = wa.label;
        console.log('wa', wa);

        param.accounts = [];
        param.promotionsToDelete = [];
        
        if (this.isUsingParentAccount) {
            if (this.selectedAccounts.size > 0) {
                this.selectedAccounts.forEach((value, key, map) => {
                    console.log('value', value, key);
                    param.accounts.push({id:value.id, itemId:value.itemId});
                });
            }
            if (this.promotionsToDelete.size > 0) {
                this.promotionsToDelete.forEach((value, key, map) => {
                    console.log('promoToDelete', value, key);
                });
            }
        } else {
            param.accounts.push({id:'', itemId:param.parentAccountId});
        }
        
        console.log('[save] param', param);
        savePSA({ psaData: param })
            .then(result => {
                console.log('[savePSA] success. result', result);
                this.psaId = result.Id;
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: this.labels.success.label,
                        message: this.labels.saveSuccess.message,
                        variant: 'success'
                    }),
                );

                this.wiredAgreement = refreshApex(this.wiredAgreement);
            })
            .catch(error => {
                console.log('[savePSA] error', error);
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: this.labels.saveError.message,
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
            });

        }catch(ex) {
            console.log('[promotionalSalesAgreement.save] exception', ex);
        }
    }
}