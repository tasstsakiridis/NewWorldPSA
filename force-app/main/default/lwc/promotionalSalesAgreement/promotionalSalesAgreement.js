import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

import { refreshApex } from '@salesforce/apex';

import { fireEvent } from 'c/pubsub';

import getUserMarket from '@salesforce/apex/PromotionalSalesAgreement_Controller.getUserMarket';
import getAccountById from '@salesforce/apex/PromotionalSalesAgreement_Controller.getAccountById';
import getAccountsByName from '@salesforce/apex/PromotionalSalesAgreement_Controller.getAccountsByName';
import getAccountsForParent from '@salesforce/apex/PromotionalSalesAgreement_Controller.getAccountsForParent';
import getWholesalers from '@salesforce/apex/PromotionalSalesAgreement_Controller.getWholesalers';
import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';
import getUserDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getUserDetails';
import savePSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.savePSA';
import detachDocument from '@salesforce/apex/PromotionalSalesAgreement_Controller.detachDocument';
import getIsSOMUser from '@salesforce/apex/PromotionalSalesAgreement_Controller.getIsSOMUser';
import submitForApproval from '@salesforce/apex/PromotionalSalesAgreement_Controller.submitForApproval';
import recallApproval from '@salesforce/apex/PromotionalSalesAgreement_Controller.recallApproval';
import clonePSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.clonePSA';
import sendDocuSignEnvelope from '@salesforce/apex/PromotionalSalesAgreement_Controller.sendDocuSignEnvelope';

import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import userId from '@salesforce/user/Id';

import LABEL_ACCOUNT from '@salesforce/label/c.Account';
import LABEL_ACCOUNT_SEARCH_RESULTS from '@salesforce/label/c.Account_Search_Results';
import LABEL_ACTUALS from '@salesforce/label/c.Actuals';
import LABEL_AGREEMENT_END_DATE from '@salesforce/label/c.Agreement_End_Date';
import LABEL_AGREEMENT_START_DATE from '@salesforce/label/c.Agreement_Start_Date';
import LABEL_ALTERNATE_RTM from '@salesforce/label/c.Alternate_RTM';
import LABEL_ALTERNATE_RTM_ERROR from '@salesforce/label/c.Alternate_RTM_Error';
import LABEL_APPROVAL_SUBMITTED from '@salesforce/label/c.Approval_Submitted';
import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_CANCEL from '@salesforce/label/c.Cancel';
import LABEL_CHANGE from '@salesforce/label/c.Change';
import LABEL_CLEAR from '@salesforce/label/c.Clear';
import LABEL_CLONE from '@salesforce/label/c.Clone';
import LABEL_CLONE_SUCCESS_MESSAGE from '@salesforce/label/c.Clone_Success_Message';
import LABEL_CLONE_PSA_INSTRUCTION from '@salesforce/label/c.Clone_PSA_Instruction';
import LABEL_COMMENTS from '@salesforce/label/c.Comments';
import LABEL_COMPANY_DETAILS from '@salesforce/label/c.Company_Details';
import LABEL_CUSTOMER_DETAILS from '@salesforce/label/c.Customer_Details';
import LABEL_DATE_RANGE from '@salesforce/label/c.Date_Range';
import LABEL_DESELECT_ALL from '@salesforce/label/c.DeSelect_All';
import LABEL_DETACH_FILE from '@salesforce/label/c.Detach_File';
import LABEL_DETACH_FILE_CONFIRMATION from '@salesforce/label/c.Detach_File_Confirmation';
import LABEL_DETACH_FILE_SUCCESS from '@salesforce/label/c.Detach_File_Success';
import LABEL_DETAILS from '@salesforce/label/c.Details2';
import LABEL_DOCUSIGN from '@salesforce/label/c.DocuSign';
import LABEL_FORM_ERROR from '@salesforce/label/c.PSA_Form_Error';
import LABEL_HELP from '@salesforce/label/c.Help';
import LABEL_INFO from '@salesforce/label/c.Info';
import LABEL_ITEMS from '@salesforce/label/c.Items';
import LABEL_LENGTH_OF_AGREEMENT_ERROR from '@salesforce/label/c.Length_of_Agreement_Error';
import LABEL_LENGTH_OF_AGREEMENT_YEARS from '@salesforce/label/c.Length_of_Agreement_Years';
import LABEL_LENGTH_OF_AGREEMENT_MONTHS from '@salesforce/label/c.Length_of_Agreement_Months';
import LABEL_LOADING_PLEASE_WAIT from '@salesforce/label/c.Loading_Please_Wait';
import LABEL_MONTH from '@salesforce/label/c.Month';
import LABEL_MONTHS from '@salesforce/label/c.Months';
import LABEL_MPO_PRESTIGE from '@salesforce/label/c.MPO_Prestige';
import LABEL_NO from '@salesforce/label/c.No';
import LABEL_NO_ACCOUNTS_FOUND_FOR_PARENT from '@salesforce/label/c.No_Accounts_Found_For_Parent';
import LABEL_NO_DECISION_MAKERS_FOUND_FOR_ACCOUNT from '@salesforce/label/c.No_Decision_Makers_found_for_Account';
import LABEL_NONE from '@salesforce/label/c.None';
import LABEL_NONE_PICKLIST_VALUE from '@salesforce/label/c.None_Picklist_Value';
import LABEL_OK from '@salesforce/label/c.OK';
import LABEL_PARENT_ACCOUNT from '@salesforce/label/c.Parent_Account';
import LABEL_PARENT_ACCOUNT_ERROR from '@salesforce/label/c.Parent_Account_Error';
import LABEL_PARENT_ACCOUNT_SEARCH_RESULTS_ERROR from '@salesforce/label/c.Parent_Account_Search_Results_Message';
import LABEL_PREFERRED_RTM from '@salesforce/label/c.Preferred_RTM';
import LABEL_PREFERRED_RTM_ERROR from '@salesforce/label/c.Preferred_RTM_Error';
import LABEL_PSA_RETAIL_ACCOUNTS_HEADING from '@salesforce/label/c.PSA_Retail_Accounts_Heading';
import LABEL_PURCHASE_ORDER from '@salesforce/label/c.Purchase_Order';
import LABEL_RECALL from '@salesforce/label/c.Recall';
import LABEL_RECALL_SUCCESS from '@salesforce/label/c.Recall_Success';
import LABEL_ROUTETOMARKET from '@salesforce/label/c.RouteToMarket';
import LABEL_SAVE from '@salesforce/label/c.Save';
import LABEL_SAVE_ERROR_MESSAGE from '@salesforce/label/c.Save_Error_Message';
import LABEL_SAVE_SUCCESS_MESSAGE from '@salesforce/label/c.Save_Success_Message';
import LABEL_SAVING_PLEASE_WAIT from '@salesforce/label/c.Saving_Please_Wait';
import LABEL_SEARCH from '@salesforce/label/c.Search';
import LABEL_SEARCH_BY from '@salesforce/label/c.SearchBy';
import LABEL_SEARCH_HELP_TEXT from '@salesforce/label/c.Search_Help_Text';
import LABEL_SELECT_ALL from '@salesforce/label/c.Select_All';
import LABEL_SIGNING_CUSTOMER from '@salesforce/label/c.Signing_Customer';
import LABEL_START_DATE_ERROR from '@salesforce/label/c.Start_Date_Error';
import LABEL_STATUS from '@salesforce/label/c.Status';
import LABEL_SUBMIT_FOR_APPROVAL from '@salesforce/label/c.Submit_For_Approval';
import LABEL_SUCCESS from '@salesforce/label/c.Success';
import LABEL_SUMMARY from '@salesforce/label/c.Summary';
import LABEL_UPLOAD_AND_ATTACH from '@salesforce/label/c.Upload_and_Attach';
import LABEL_UPLOAD_AND_ATTACH_HELPTEXT from '@salesforce/label/c.Upload_and_Attach_HelpText';
import LABEL_UPLOAD_AND_ATTACH_SUCCESS from '@salesforce/label/c.Upload_and_Attach_Success';
import LABEL_WARNING from '@salesforce/label/c.Warning_Title';
import LABEL_WORKING_PLEASEWAIT from '@salesforce/label/c.Working_PleaseWait';
import LABEL_YEAR from '@salesforce/label/c.Year';
import LABEL_YEARS from '@salesforce/label/c.Years';
import LABEL_YES from '@salesforce/label/c.Yes';

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

const invalidStatusSelections = ['New','Submitted','Pending Approval','Updated'];

export default class PromotionalSalesAgreement extends NavigationMixin(LightningElement) {
    labels = {
        account                 : { label: LABEL_ACCOUNT },        
        accountSearchResults    : { label: LABEL_ACCOUNT_SEARCH_RESULTS },
        actuals                 : { label: LABEL_ACTUALS },
        agreementEndDate        : { label: LABEL_AGREEMENT_END_DATE },
        alternateRTM            : { label: LABEL_ALTERNATE_RTM, placeholder: '', error: LABEL_ALTERNATE_RTM_ERROR},
        back                    : { label: LABEL_BACK },
        cancel                  : { label: LABEL_CANCEL },
        change                  : { label: LABEL_CHANGE, labelLowercase: LABEL_CHANGE.toLowerCase() },
        clear                   : { label: LABEL_CLEAR },
        clone                   : { label: LABEL_CLONE, clonedMessage: LABEL_CLONE_SUCCESS_MESSAGE, instruction: LABEL_CLONE_PSA_INSTRUCTION },
        comments                : { label: LABEL_COMMENTS },
        companyDetails          : { label: LABEL_COMPANY_DETAILS },
        customerDetails         : { label: LABEL_CUSTOMER_DETAILS },
        deSelectAll             : { label: LABEL_DESELECT_ALL },
        dateRange               : { label: LABEL_DATE_RANGE },
        details                 : { label: LABEL_DETAILS },
        detachFile              : { label: LABEL_DETACH_FILE, successMessage: LABEL_DETACH_FILE_SUCCESS, confirmation: LABEL_DETACH_FILE_CONFIRMATION},
        docusign                : { label: 'Send Contract' },
        error                   : { message: LABEL_FORM_ERROR },
        help                    : { label: LABEL_HELP },
        items                   : { label: LABEL_ITEMS },
        info                    : { label: LABEL_INFO },
        lengthOfPSA             : { yearsLabel: LABEL_LENGTH_OF_AGREEMENT_YEARS, monthsLabel: LABEL_LENGTH_OF_AGREEMENT_MONTHS, error: LABEL_LENGTH_OF_AGREEMENT_ERROR },
        loading                 : { message: LABEL_LOADING_PLEASE_WAIT },
        month                   : { label: LABEL_MONTH.toLowerCase(), labelPlural: LABEL_MONTHS.toLowerCase() },
        mpoPrestige             : { label: LABEL_MPO_PRESTIGE },
        no                      : { label: LABEL_NO },
        noAccountsFound         : { label: LABEL_NO_ACCOUNTS_FOUND_FOR_PARENT },
        none                    : { label: LABEL_NONE, picklistLabel: LABEL_NONE_PICKLIST_VALUE },
        noSigningCustomers      : { message: LABEL_NO_DECISION_MAKERS_FOUND_FOR_ACCOUNT },
        ok                      : { label: LABEL_OK },
        parentAccount           : { label: LABEL_PARENT_ACCOUNT, error: LABEL_PARENT_ACCOUNT_ERROR },
        parentAccountSearchResults : { label: LABEL_PARENT_ACCOUNT_SEARCH_RESULTS_ERROR },
        preferredRTM            : { label: LABEL_PREFERRED_RTM, placeholder: '', error: LABEL_PREFERRED_RTM_ERROR },
        purchaseOrder           : { label: LABEL_PURCHASE_ORDER },
        recall                  : { label: LABEL_RECALL, recalledMessage: LABEL_RECALL_SUCCESS.replace('%0', 'PSA') },
        retailAccountsHeading   : { label: LABEL_PSA_RETAIL_ACCOUNTS_HEADING },
        routeToMarket           : { label: LABEL_ROUTETOMARKET },
        save                    : { label: LABEL_SAVE, message: LABEL_SAVING_PLEASE_WAIT },
        saveError               : { message: LABEL_SAVE_ERROR_MESSAGE.replace('%0', 'PSA') },
        saveSuccess             : { message: LABEL_SAVE_SUCCESS_MESSAGE },
        search                  : { label: LABEL_SEARCH },
        searchBy                : { label: LABEL_SEARCH_BY },
        searchHelpText          : { label: LABEL_SEARCH_HELP_TEXT },
        selectAll               : { label: LABEL_SELECT_ALL },
        signingCustomerHeader   : { label: LABEL_SIGNING_CUSTOMER },
        startDate               : { label: LABEL_AGREEMENT_START_DATE, error: LABEL_START_DATE_ERROR },
        status                  : { label: LABEL_STATUS },
        submitForApproval       : { label: LABEL_SUBMIT_FOR_APPROVAL, submittedMessage: LABEL_APPROVAL_SUBMITTED.replace('%0', 'PSA') },
        success                 : { label: LABEL_SUCCESS },
        summary                 : { label: LABEL_SUMMARY },
        uploadFile              : { label: LABEL_UPLOAD_AND_ATTACH, message: LABEL_UPLOAD_AND_ATTACH_HELPTEXT.replace('%0', 'PSA'), successMessage: LABEL_UPLOAD_AND_ATTACH_SUCCESS },
        userDetails             : { error: 'There was a problem getting your details from Salesforce.'},
        warning                 : { label: LABEL_WARNING },        
        working                 : { label: LABEL_WORKING_PLEASEWAIT },
        year                    : { label: LABEL_YEAR, labelPlural: LABEL_YEARS },
        yes                     : { label: LABEL_YES },
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
    isMPOPrestige = false;
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
    comments;

    isWorking = true;
    workingMessage = this.labels.working.message;    

    @track
    attachedFiles;

    wiredAgreement;
    @wire(getPSA, {psaId: '$recordId'})
    wiredGetAgreement(value) {
        try {
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
                //this.loadAttachedFiles();
                this.isWorking = false;
            }
        }catch(ex) {
            console.log('[psa.getagreement] exception', ex);
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

    user;
    @wire(getUserDetails)
    wiredGetUserDetails(value) {
        console.log('[psa.getuserdetails] value', value);
        if (value.data) {
            this.user = value.data;
            this.error = undefined;
        } else if (value.error) {
            this.error = value.erroor;
            this.user = undefined;
            console.log('[psa.getuserdetails] error', value.error);
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
            this.wholesalers.splice(0, 0, { label: this.labels.none.picklistLabel, value: '-none-' });
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
        if (this.status == 'Updated') {
            return true;
        } else {
            return !this.isSubmitted && this.thePSA != null && !this.thePSA.Is_Approved__c && (this.thePSA.Promotions__r != null && this.thePSA.Promotions__r.length > 0) && (this.thePSA.Promotion_Material_Items__r != null && this.thePSA.Promotion_Material_Items__r.length > 0);
        }
    }

    get isSubmitted() {
        return this.status == 'Submitted' || this.status == 'Pending Approval';
    }
    get canClone() {
        return this.thePSA != null && (this.thePSA.Promotions__r != null && this.thePSA.Promotions__r.length > 0) && (this.thePSA.Promotion_Material_Items__r != null && this.thePSA.Promotion_Material_Items__r.length > 0);
    }
    get canEditItems() {
        return true;
        return this.thePSA != null && this.thePSA.Is_Approved__c == false;
    }
    get canEditActuals() {
        return this.thePSA != null && this.thePSA.Is_Approved__c == true && this.status != 'Updated' && !this.isSubmitted;
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
        return this.status != 'New' && this.status != 'Submitted' && this.status != 'Updated' && this.isSOMUser;
    }

    error;
    get psaName() {
        return this.thePSA == undefined ? '' : this.thePSA.Name;
    }

    status = 'New';
    get psaStatus() {
        return this.status;
    }

    cloneName = '';
    isCloning = false;
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
            lbl = lbl + ' ' + this.labels.parentAccount.label;
        } else {
            lbl = lbl + ' ' + this.labels.account.label;
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
                return this.labels.searchHelpText.label.replace('%0', this.labels.account.label);
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
        const today = new Date();
        this.cloneName = this.parentAccount.Name + '-PSA-' + today.getFullYear() + today.getMonth() + today.getDate();
        this.isCloning = true;
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
    handleDocusignButtonClick(event) {
        console.log('[sendwithdocusign] signingcustomerid', this.signingCustomer.Id);
        
        sendDocuSignEnvelope({psaId: this.psaId, contactId: this.signingCustomer.Id})
        .then(result => {
            console.log('[senddocusignenv] success', result);
            this.showToast('success', 'Success', 'The PSA has been emailed');
            this.isWorking = false;
        })
        .catch(error => {
            console.log('[senddocusignenv] error', error);
            this.showToast('error', 'Warning', 'Error encountered while trying to send the PSA');
            this.isWorking = false;
        });
        
        /*
        if (this.user == undefined) {
            this.showToast('error', 'Error', this.labels.userDetails.error);
            return;
        }
        try {
        this.isWorking = true;
        const defaultValues = encodeDefaultFieldValues({
            sId: this.psaId,
            templateId: 'aAQ3I000000CbwuWAC',
            recordId: this.psaId,
            recordName: this.thePSA.Name,
            title: 'Generate UK PSA',
            CRL: 'Email~' + this.user.Email + ';FirstName~' + this.user.FirstName + ';LastName~' + this.user.LastName + ';SignInPersonName~Customer;SignNow~1;RoutingOrder~1;Role~Signer 1, Email~' + this.user.Email + ';FirstName~' + this.user.FirstName + ';LastName~' + this.user.LastName + ';Role~Signer 2;RoutingOrder~2;',
            OCO: 'Send',
            CCTM: 'Signer 1~Host in person - sign now',
            LF: '0',
            CCRM: 'Signer 1~Customer;Signer 2~Sales Representative',
        });        

        const pageReference = {
            type: 'standard__namedPage',
            attributes: {
                pageName: 'UK_PSA_Generate_DocuSign'
            },
            state: {
                defaultFieldValues: defaultValues
            }
        };
        this.isWorking = false;
        this[NavigationMixin.Navigate]({
            type: 'standard__namedPage',
            attributes: {
                pageName: 'UK_PSA_Generate_DocuSign',
                id: this.psaId
            }
        });
        */
        //window.location.href = '{!URLFOR(\'/apex/dfsle_gendocumentgenerator\',null,[SourceID='+this.psaId+'])';
        /*
        this[NavigationMixin.GenerateUrl](pageReference)
            .then(url => {
                console.log('[generateurl] url', url);
                //window.open(url);
                this[NavigationMixin.Navigate]({
                    type: 'standard__webPage',
                    attributes: {
                        url: url
                    }
                });
            });
           */ 
       // } catch(ex) {
        //    console.log('[docusign.exception] ex', ex);
        //}
        
    }
    handleHelpButtonClick(event) {
        this.showToast('info', 'Help', 'Sorry.  Help has not been completed yet.');
    }

    handleCloneCancelButtonClick() {
        this.isCloning = false;
        this.cloneName = "";
    }
    handleCloneOKButtonClick() {
        this.isCloning = false;
        this.clonePSA();
    }
    handleCloneNameChange(event) {
        this.cloneName = event.detail.value;
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
        if (this.thePSA.Is_Approved__c) { 
            this.status = 'Updated';
        }
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
        if (this.selectedAccounts == undefined) { this.selectedAccounts = new Map(); }
        // Check to see if this account was previously de-selected and marked for deletion
        this.promotionsToDelete.clear();
        console.log('[selectallaccounts] accounts', this.accounts);
        try {
            this.accounts.records.forEach(a => {
                console.log('[selectallaccounts] a', a);
                if (!this.selectedAccounts.has(a.item.Id)) {
                    this.selectedAccounts.set(a.item.Id, { id: '', itemId: a.item.Id });
                }
            });    
        }catch(ex) {
            console.log('[selectallaccounts] exception', ex);
        }
        console.log('[selectallaccounts] selectedaccount', this.selectedAccounts);

    }
    handleUnSelectAllAccountsClick(event) {
        fireEvent(this.pageRef, 'selectTile', false);
        this.promotionsToDelete.clear();
        this.selectedAccounts.forEach(a => {
            if (a.id != '') {
                this.promotionsToDelete.set(a.id, a);
            }
        });
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
    handlePrestigeTypeToggle(event) {
        this.isMPOPrestige = event.detail.checked;
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
        const response = confirm(this.labels.detachFile.confirmation.replace('{0}', event.detail.item.label));
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
    handleCommentsChange(event) {
        this.comments = event.detail.value;
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
            this.isMPOPrestige = data.MPO_Prestige__c;
            this.status = data.Status__c;
            this.purchaseOrder = data.Purchase_Order__c;
            this.wholesalerPreferred = data.Wholesaler_Preferred__c;
            this.wholesalerAlternate = data.Wholesaler_Alternate__c;
            this.comments = data.Evaluation_Comments__c
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
    clonePSA() {
        this.isWorking = true;
        clonePSA({ psaId: this.recordId, newName: this.cloneName })
            .then(result => {
                this.isWorking = false;
                console.log('[clone] result', result);
                // navigate to new PSA
                if (result.selected) {
                    this.showToast('success', 'Success', this.labels.clone.clonedMessage.replace('%0', 'PSA'));    
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
    validatePSA() {
        let isValid = true;

        this.hasLengthOfPSAError = false;
        this.hasStartDateError = false;
        this.hasPreferredRTMError = false;
        this.hasParentAccountError = false;
        this.hasChildAccountsError = false;

        if (this.lengthOfPSA == undefined) {
            this.hasLengthOfPSAError = true;
            isValid = false; 
        } else if (this.isLengthInYears == false) {
            if (this.lengthOfPSA / 12 > this.maximumLengthOfPSA) {
                this.hasLengthOfPSAError = true;
            }
        }
        console.log('[validatepsa] wholesalerpreferred', this.wholesalerPreferred);
        if (this.wholesalerPreferred == undefined || this.wholesalerPreferred == '-none-') {
            this.hasPreferredRTMError = true;
            isValid = false; 
        }
        console.log('[validatepsa] parentAccount', this.parentAccount);
        console.log('[validatepsa] isUsingParentAccount', this.isUsingParentAccount);
        console.log('[validatepsa] selectedAccounts', this.selectedAccounts, this.selectedAccounts.size);
        if (this.parentAccount == undefined) {
            this.hasParentAccountError = true;
            isValid = false; 
        } else if (this.isUsingParentAccount && (this.selectedAccounts == undefined || this.selectedAccounts.size == 0)) {
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
        param.signingCustomerName = this.signingCustomerName;
        param.signingCustomerEmail = this.signingCustomer.Email;
        param.comments = this.comments;
        param.wholesalerPreferredId = this.wholesalerPreferred;
        param.mpoPrestige = this.isMPOPrestige;
        console.log('wholesalerPreferred', this.wholesalerPreferred);
        const wp = this.wholesalers.find(w => w.value === this.wholesalerPreferred);
        param.wholesalerPreferredName = wp.label;
        console.log('wp', wp);
        if (this.wholesalerAlternate == undefined || this.wholesalerAlternate == '-none-') {
            param.wholesalerAlternateId = null;
            param.wholesalerAlternateName = '';
        } else {
            param.wholesalerAlternateId = this.wholesalerAlternate;
            console.log('wholesalerAlternate', this.wholesalerAlternate);
            const wa = this.wholesalers.find(w => w.value === this.wholesalerAlternate);
            console.log('wa', wa);
            param.wholesalerAlternateName = wa.label;    
        }
        param.purchaseOrder = this.purchaseOrder;
        param.status = this.status;

        param.accounts = [];
        param.promotionsToDelete = [];
        
        if (this.isUsingParentAccount) {
            if (this.selectedAccounts.size > 0) {
                this.selectedAccounts.forEach((value, key, map) => {
                    console.log('value', value, key);
                    param.accounts.push({id:value.id, itemId:value.itemId});
                });
                if (!this.selectedAccounts.has(param.parentAccountId)) {
                    param.accounts.push({id: null, itemId: param.parentAccountId});
                }
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