import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
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
import detachDocument from '@salesforce/apex/PromotionalSalesAgreement_Controller.detachDocument';
import getIsSOMUser from '@salesforce/apex/PromotionalSalesAgreement_Controller.getIsSOMUser';
import submitForApproval from '@salesforce/apex/PromotionalSalesAgreement_Controller.submitForApproval';
import recallApproval from '@salesforce/apex/PromotionalSalesAgreement_Controller.recallApproval';
import clonePSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.clonePSA';

import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import userId from '@salesforce/user/Id';

import LABEL_BACK from '@salesforce/label/c.Back';
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
import LABEL_SUMMARY from '@salesforce/label/c.Summary';

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

const invalidStatusSelections = ['New','Submitted','Pending Approval'];

export default class PromotionalSalesAgreement extends NavigationMixin(LightningElement) {
    labels = {
        account                 : { label: 'Account', labelPlural: 'Accounts' },        
        accountSearchResults    : { label: 'Accounts matching "%0"' },
        actuals                 : { label: 'Actuals' },
        alternateRTM            : { label: LABEL_ALTERNATE_RTM, placeholder: '', error: 'No Alternate Wholesaler selected'},
        back                    : { label: LABEL_BACK },
        cancel                  : { label: LABEL_CANCEL },
        change                  : { label: LABEL_CHANGE, labelLowercase: LABEL_CHANGE.toLowerCase() },
        clear                   : { label: LABEL_CLEAR },
        clone                   : { label: LABEL_CLONE, clonedMessage: 'PSA successfully cloned.' },
        companyDetails          : { label: 'Company Details' },
        confirmDetachFile       : { message: 'Are you sure you want to detach {0} from this PSA?' },
        customerDetails         : { label: 'Customer Details' },
        deSelectAll             : { label: 'DeSelect All' },
        dateRange               : { label: 'Date Range' },
        details                 : { label: 'Details' },
        detachFile              : { label: 'Detach File', successMessage: 'File {0} has been successfully detached from this PSA.'},
        duration                : { label: LABEL_DURATION  },
        error                   : { message: 'Errors found validating/saving the PSA.  Please review and try saving again.' },
        help                    : { label: LABEL_HELP },
        items                   : { label: LABEL_ITEMS },
        info                    : { label: 'Info' },
        lengthOfPSA             : { yearsLabel: 'Length of Agreement (in years)', monthsLabel: 'Length of Agreement (in months)', error: 'Please select from one of the Length of Agreement options' },
        loading                 : { message: 'Loading PSA details. Please wait...' },
        month                   : { label: 'month', labelPlural: 'months' },
        no                      : { label: LABEL_NO },
        noAccountsFound         : { label: 'No retail accounts found for %0' },
        noSigningCustomers      : { message: 'There are no contacts for this account setup as decision makers.'},
        parentAccount           : { label: 'Parent Account', error: 'No Parent or Retail Account selected and no Signing Customer selected' },
        parentAccountSearchResults : { label: 'Accounts matching "%0".  Tap on an account below to select it and find any of it\'s retail accounts'},
        preferredRTM            : { label: LABEL_PREFERRED_RTM, placeholder: '', error: 'No Preferred Wholesaler selected' },
        recordType              : { label: LABEL_RECORD_TYPE },
        retailAccountsHeading   : { label: 'Names of individual outlets in estate and parts of business included in PSA' },
        routeToMarket           : { label: LABEL_ROUTETOMARKET },
        saveAndClose            : { label: LABEL_SAVE_AND_CLOSE },
        save                    : { label: LABEL_SAVE },
        saveError               : { message: 'Error saving PSA' },
        saveSuccess             : { message: 'All changes saved successfully'},
        search                  : { label: 'Search' },
        searchBy                : { label: 'Search by %0' },
        selectAll               : { label: 'Select All' },
        selectParentAccount     : { help: 'Enter the name, or part of the name, of an account to search for' },
        signingCustomerHeader   : { label: 'Full name of signing customer'},
        skip                    : { label: LABEL_SKIP },
        startDate               : { label: 'This agreement will start at', error: 'No Start Date selected' },
        status                  : { label: 'Status' },
        success                 : { label: 'Success' },
        summary                 : { label: LABEL_SUMMARY },
        uploadFile              : { label: 'Upload & Attach Files', message: 'Select files to upload and attach to PSA', successMessage: 'Files uploaded successfully!' },
        warning                 : { label: 'Warning' },        
        yes                     : { label: LABEL_YES },
        year                    : { label: 'year', labelPlural: 'years' },
        purchaseOrder           : { label: 'Purchase Order' },
        submitForApproval       : { label: 'Submit for Approval', submittedMessage: 'PSA has successfully been submitted for approval' },
        recall                  : { label: 'Recall', recalledMessage: 'PSA recalled successfully' },
        working                 : { label: 'Working. Please wait...' }
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
    purchaseOrder;

    isWorking = true;
    workingMessage = this.labels.working.message;    

    @track
    attachedFiles;

    wiredAgreement;
    @wire(getPSA, {psaId: '$recordId'})
    wiredGetAgreement(value) {
        this.wiredAgreement = value;
        console.log('[psa.getagreement] value', value);
        if (this.isPhone && this.isThisTass) {
            alert('[psa.getagreement]');
        }
        if (value.error) {
            this.isWorking = false;
            this.error = value.error;
            this.thePSA = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.loadPSADetails(value.data);
            this.loadAttachedFiles();
            this.isWorking = false;
        }
    }

    @wire(CurrentPageReference) pageRef;
    /*
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.currentPageReference = currentPageReference;
        this.pageRef = currentPageReference;
        console.log('[psa.setcurrentpagereference] pageref', currentPageReference);
        if (currentPageReference.attributes.recordId == undefined) {
            this.recordId = currentPageReference.state.c__psaId;
        } else {
            this.recordId = currentPageReference.attributes.recordId;
        }
    }
    */

    @wire(getIsSOMUser)
    isSOMUser;

    statusOptions;
    recordTypeId;
    picklistValuesMap;
    @wire(getPicklistValuesByRecordType, { objectApiName: OBJECT_ACTIVITY, recordTypeId: '$recordTypeId' })
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
        }
    }

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
    
    get canSubmitForApproval() {
        return !this.isSubmitted && this.thePSA != null && !this.thePSA.Is_Approved__c && (this.thePSA.Promotions__r != null && this.thePSA.Promotions__r.length > 0) && (this.thePSA.Promotion_Material_Items__r != null && this.thePSA.Promotion_Material_Items__r.length > 0);
    }

    get isSubmitted() {
        return this.status == 'Submitted' || this.status == 'Pending Approval';
    }
    get canClone() {
        return this.thePSA != null && (this.thePSA.Promotions__r != null && this.thePSA.Promotions__r.length > 0) && (this.thePSA.Promotion_Material_Items__r != null && this.thePSA.Promotion_Material_Items__r.length > 0);
    }
    get canEditItems() {
        return this.thePSA != null && this.thePSA.Is_Approved__c == false;
    }
    get canEditActuals() {
        return this.thePSA != null && this.thePSA.Is_Approved__c == true;
    }
    get canViewSummary() {
        return this.thePSA != null;
    }
    get isLocked() {
        if (this.thePSA == undefined) {
            return false;
        } else {
            return this.status == 'Approved' || this.status == 'Submitted' || this.status == 'Pending Approval' || this.thePSA.Is_Approved__c == true;
        }
    }
    get isApproved() {
        return this.thePSA != null && (this.thePSA.Status__c == 'Approved' || this.thePSA.Is_Approved__c);
    }
    get canChangeStatus() {
        console.log('[canChangestatus] status, isSOMUser', this.status, this.isSOMUser);
        return this.status != 'New' && this.status != 'Submitted' && this.isSOMUser;
    }

    error;
    get psaName() {
        return this.thePSA == undefined ? '' : this.thePSA.Name;
    }

    status = 'New';
    get psaStatus() {
        return this.status;
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

    get acceptedFileUploadFormats() {
        return ['.pdf', '.png'];
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
        /*
        if (!this.isLengthInYears) {
            this.template.querySelector("lightning-input.length-type-toggle").checked = this.isLengthInYears;            
        }    
        if (!this.isUsingParentAccount) {
            this.template.querySelector("lightning-input.account-type-toggle").checked = this.isUsingParentAccount;            
        }
        */
    }

    /*
        Handle Button Clicks
    */
    handleCancelButtonClick(event) {
        console.log('[handleCancelButtonClick]');
        try {
            this.isWorking = true;
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
            this.isWorking = true;
            const isValid = this.validatePSA();
            console.log('[handleSaveButtonClick] isValid', isValid);
            if (isValid) {
                this.save();
            } else {
                this.isWorking = false;
                this.showToast('error', this.labels.saveError.message, this.labels.error.message);            
            }
        }catch(ex) {
            console.log('[handleSaveButtonClick] exception', ex);
        }
    }
    handleItemsButtonClick(event) {
        this.isWorking = true;
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
        this.isWorking = true;
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
        this.isWorking = true;
        submitForApproval({ psaId: this.recordId })
            .then(result => {
                this.isWorking = false;
                if (result == 'OK') {
                    this.status = 'Pending Approval';
                    this.showToast('success','Success', this.labels.submitForApproval.submittedMessage);
                } else {
                    this.showToast('error', 'Warning', result);
                }
            })
            .catch(error => {
                this.isWorking = false;
                this.error = error;
                this.showToast('error', 'Warning', error);
            });

    }
    handleRecallButtonClick() {
        this.isWorking = true;
        recallApproval({psaId: this.recordId })
            .then(result => {
                this.isWorking = false;
                if (result == 'OK') {
                    this.status = 'New';
                    this.showToast('success', 'Success', this.labels.recall.recalledMessage);
                } else {
                    this.showToast('error', 'Warning', msg);
                }
            })
            .catch(error => {
                this.isWorking = false;
                this.error = error;
                this.showToast('error', 'Warning', error);
            });
    }
    handleCloneButtonClick(event) {
        this.isWorking = true;
        clonePSA({ psaId: this.recordId })
            .then(result => {
                this.isWorking = false;
                console.log('[clone] result', result);
                // navigate to new PSA
                if (result.selected) {
                    this.showToast('success', 'Success', this.labels.clone.clonedMessage);    
                    this.recordId = result.id;
                } else {
                    this.showToast('error', 'Warning', result.description);
                }
            })
            .catch(error => {
                console.log('[clone] error', error);
                this.isWorking = false;
                this.error = error;
                this.showToast('error', 'Warning', error);
            });

    }
    handleSummaryButtonClick(event) {
        this.isWorking = true;
        this[NavigationMixin.Navigate]({
            type: 'standard__component',
            attributes: {
                componentName: 'c__PromotionalSalesAgreementSummaryContainer'
            },
            state: {
                c__psaId: this.recordId
            }
        });
        
    }
    handleHelpButtonClick(event) {
        this.showToast('info', 'Help', 'Sorry.  Help has not been completed yet.');
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
    handleFileUploadFinished(event) {
        try {
            const files = event.detail.files;  
            const tempList = [...this.attachedFiles];
            files.forEach(f => {
                console.log('[handleFileUploadFinished] file', f);
                let nameParts = f.name.split('.');
                const filename = nameParts[0];
                const fileExtension = nameParts.length == 2 ? nameParts[1].toLowerCase() : '';
                let iconName = 'attachment';
                if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg') {
                    iconName = 'image';
                } else if (fileExtension === 'txt') {
                    iconName = 'txt';
                } else if (fileExtension === 'pdf') {
                    iconName = 'pdf';
                }
                const attachedFile = {
                    type: 'icon',
                    name: f.documentId,
                    label: filename,
                    href: "/lightning/r/ContentDocument/" + f.documentId + "/view",
                    src: "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=" + f.documentId,
                    iconName: 'doctype:'+iconName,
                    fallbackIconName: 'doctype:'+iconName,
                    variant: 'link',
                    alternativeText: 'Attched document', 
                    isLink: true 
                }
                console.log('[handleFileUploadFinished] attachedFile', attachedFile);
                tempList.push(attachedFile);
            });
            this.attachedFiles = [...tempList];
            this.showToast("success", this.labels.info.label, this.labels.uploadFile.successMessage);
        }catch(ex) {
            console.log('[promotionalSalesAgreement.handleFileUploadFinished] exception', ex);
        }
    }
    handleRemoveAttachedFile(event) {
        const response = confirm(this.labels.confirmDetachFile.message.replace('{0}', event.detail.item.label));
        if (response == true) {            
            this.detachFile(event.detail.item.name, event.detail.item.label, event.detail.index);
        } 
    }
    handlePurchaseOrderChange(event) {
        this.purchaseOrder = event.detail.value;
    }
    handleStatusChange(event) {
        this.status = event.detail.value;
        console.log('this.status', this.status);
        if (invalidStatusSelections.indexOf(this.status) >= 0) {
            this.status = this.thePSA.Status__c;
            this.showToast('error', 'Invalid selection', 'You cannot select this status');
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
    getUpdatedPageReference(stateChanges) {
        console.log('[psa.getupdatedpagereference] statechanges', stateChanges);
        return Object.assign({}, this.currentPageReference, {
            state: Object.assign({}, this.currentPageReference.state, stateChanges)
        });
    }

    setFieldOptions(picklistValues) {
        console.log('[setFieldOptions] picklistValues', picklistValues);
        Object.keys(picklistValues).forEach(picklist => {            
            if (picklist === 'Status__c') {
                //this.statusOptions = this.setFieldOptionsForField(picklistValues, picklist);
                this.statusOptions = [];
                picklistValues[picklist].values.forEach(pv => {
                    if (invalidStatusSelections.indexOf(pv.value) < 0) {
                        this.statusOptions.push({ label: pv.label, value: pv.value });
                    }
                });
                console.log('[psaactualsform.setfieldoptions] approvalstatusoptions', this.statusOptions);
            }
        });

        this.finishedLoadingObjectInfo = true;
        if (this.finishedLoadingDetails && this.finishedLoadingProduct) { this.isWorking = false; }
        
    }
    
    setFieldOptionsForField(picklistValues, picklist) {        
        console.log('[setFieldOptionsForField] picklist field', picklist);
        
        return picklistValues[picklist].values.map(item => ({
            label: item.label,
            value: item.value
        }));
    }

    loadPSADetails(data) {
        //this.thePSA = Object.assign(this.thePSA, record);            
        try {
            this.thePSA = { ...data };
            console.log('[getAgreement] psa', this.thePSA);
            this.psaId = data.Id;
            this.recordTypeId = data.RecordTypeId;
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
            this.status = data.Status__c;
            this.purchaseOrder = data.Purchase_Order__c;
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

    loadAttachedFiles() {
        if (this.thePSA && this.thePSA.ContentDocumentLinks) {
            this.attachedFiles = this.thePSA.ContentDocumentLinks.map(cdl => {
                //return this.addToAttachedFilesList(cdl.ContentDocumentId, cdl.ContentDocument.LatestPublishedVersionId, cdl.ContentDocument.FileExtension, cdl.ContentDocument.Title);
                let iconName = 'attachment';
                if (cdl.ContentDocument.FileExtension === 'png' || cdl.ContentDocument.FileExtension === 'jpg' || cdl.ContentDocument.FileExtension === 'jpeg') {
                    iconName = 'image';
                } else if (cdl.ContentDocument.FileExtension === 'txt') {
                    iconName = 'txt';
                } else if (cdl.ContentDocument.FileExtension === 'pdf') {
                    iconName = 'pdf';
                } else {
                    iconName = 'attachment';
                }
                return { type: 'icon',
                         name: cdl.ContentDocumentId,
                         label: cdl.ContentDocument.Title,
                         href: "/lightning/r/ContentDocument/" + cdl.ContentDocumentId + "/view",
                         src: "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=" + cdl.ContentDocument.LatestPublishedVersionId,
                         iconName: 'doctype:'+iconName,
                         fallbackIconName: 'doctype:'+iconName,
                         variant: 'link',
                         alternativeText: 'Attched document', 
                         isLink: true 
                }
            });

            console.log('[loadAttachedFiles] attachedFiles', this.attachedFiles);
        }
    }
    /*
    addToAttachedFilesList(documentId, versionId, fileExtension, label) {
        let iconName = 'attachment';
        if (fileExtension === 'png' || fileExtension === 'jpg' || fileExtension === 'jpeg') {
            iconName = 'image';
        } else if (fileExtension === 'txt') {
            iconName = 'txt';
        } else if (fileExtension === 'pdf') {
            iconName = 'pdf';
        } else {
            iconName = 'attachment';
        }
        return { type: 'icon',
                 name: documentId,
                 label: label,
                 href: "/lightning/r/ContentDocument/" + documentId + "/view",
                 src: "/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=" + versionId,
                 iconName: 'doctype:'+iconName,
                 fallbackIconName: 'doctype:'+iconName,
                 variant: 'link',
                 alternativeText: 'Attched document', 
                 isLink: true 
        };
    }
    */
    validatePSA() {
        let isValid = true;

        this.hasLengthOfPSAError = false;
        this.hasStartDateError = false;
        this.hasPreferredRTMError = false;
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
    getAttachedDocuments() {
        try {
            getAttchedDocuments({ psaId: this.recordId })
                .then(result => {
                    this.attachedFiles = result.map(f => {
                        return { type: 'avatar',
                                 label: f.ContentDocument.Title,
                                 href: 'https://www.salesforce./com',
                                 fallbackIconName: 'doctype:attachment',
                                 variant: 'circle',
                                 alternativeText: 'Attched document', 
                                 isLink: true,
                                 contentDocumentId: f.ContentDocumentId }
                    });

                })
                .catch(error => {
                    this.error = error;
                    this.attachedFiles = undefined;
                });
        } catch(ex) {
            console.log('[promotionalSalesAgreement.getAttachedDocuments] exception', ex);
        }
    }
    detachFile(documentId, name, index) {
        console.log('[promotionalsalesagreement.detachFile] id, name, index', documentId, name, index);
        console.log('[promotionalsalesagreement.detachFile] attachedFiles', this.attachedFiles);
        detachDocument({psaId: this.recordId, documentId: documentId})
            .then(result => {
                console.log('[promotionalsalesagreement.detachFile] result', result);
                if (result == 'OK') {
                    this.showToast("success", this.labels.info.label, this.labels.detachFile.successMessage.replace('{0}', ));
                } else {
                    this.showToast("error", this.labels.error.label, result);
                }

                console.log('promotionalSalesAgreement.detachFile] index', index);
                this.attachedFiles.splice(index, 1);
                this.attachedFiles = [...this.attachedFiles];
                console.log('promotionalSalesAgreement.detachFile] index', index);
            })
            .catch(error => {
                console.log('[promotionalsalesagreement.detailFile] error', error);
                this.error = error;   
                this.showToast("error", this.labels.warning.label, error);             
            });
    }
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
        this.isWorking = true;
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
                this.isWorking = false;
            })
            .catch(error => {
                console.log('[getAccountsByName] error', error);
                this.isWorking = false;
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
        param.purchaseOrder = this.purchaseOrder;
        param.status = this.status;
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
                this.isWorking = false;
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
                this.isWorking = false;
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