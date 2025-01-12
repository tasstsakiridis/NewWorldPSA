import { LightningElement, api, track, wire } from 'lwc';
import { getObjectInfo, getPicklistValuesByRecordType } from 'lightning/uiObjectInfoApi';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { getRecord } from 'lightning/uiRecordApi';
import { encodeDefaultFieldValues } from 'lightning/pageReferenceUtils';

import LOCALE from '@salesforce/i18n/locale';
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
//import detachDocument from '@salesforce/apex/PromotionalSalesAgreement_Controller.detachDocument';
import getIsSOMUser from '@salesforce/apex/PromotionalSalesAgreement_Controller.getIsSOMUser';
import submitForApproval from '@salesforce/apex/PromotionalSalesAgreement_Controller.submitForApproval';
import recallApproval from '@salesforce/apex/PromotionalSalesAgreement_Controller.recallApproval';
import clonePSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.clonePSA';
import sendDocuSignEnvelope from '@salesforce/apex/PromotionalSalesAgreement_Controller.sendDocuSignEnvelope';

import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import userId from '@salesforce/user/Id';

import LABEL_ACCOUNT from '@salesforce/label/c.Account';
import LABEL_ACCOUNT_SEARCH_RESULTS from '@salesforce/label/c.Account_Search_Results';
import LABEL_ACTIVITY_TYPE from '@salesforce/label/c.Activity_Type';
import LABEL_ACTUALS from '@salesforce/label/c.Actuals';
import LABEL_AGREEMENT_END_DATE from '@salesforce/label/c.Agreement_End_Date';
import LABEL_AGREEMENT_START_DATE from '@salesforce/label/c.Agreement_Start_Date';
import LABEL_ALL from '@salesforce/label/c.All';
import LABEL_ALL_ACCOUNTS_SELECTED from '@salesforce/label/c.All_Accounts_Selected';
import LABEL_ALTERNATE_RTM from '@salesforce/label/c.Alternate_RTM';
import LABEL_ALTERNATE_RTM_ERROR from '@salesforce/label/c.Alternate_RTM_Error';
import LABEL_APPROVAL_SUBMITTED from '@salesforce/label/c.Approval_Submitted';
import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_BUDGET from '@salesforce/label/c.Budget';
import LABEL_CANCEL from '@salesforce/label/c.Cancel';
import LABEL_CHANGE from '@salesforce/label/c.Change';
import LABEL_CLEAR from '@salesforce/label/c.Clear';
import LABEL_CLONE from '@salesforce/label/c.Clone';
import LABEL_CLONE_SUCCESS_MESSAGE from '@salesforce/label/c.Clone_Success_Message';
import LABEL_CLONE_PSA_INSTRUCTION from '@salesforce/label/c.Clone_PSA_Instruction';
import LABEL_COMMENTS from '@salesforce/label/c.Comments';
import LABEL_COMPANY_DETAILS from '@salesforce/label/c.Company_Details';
import LABEL_CONTRACT_TYPE from '@salesforce/label/c.Contract_Type';
import LABEL_CONTRACT_TYPE from '@salesforce/label/c.Contract_Type';
import LABEL_COUPON from '@salesforce/label/c.Coupon';
import LABEL_CUSTOMER_DETAILS from '@salesforce/label/c.Customer_Details';
import LABEL_DATE_RANGE from '@salesforce/label/c.Date_Range';
import LABEL_DESELECT_ALL from '@salesforce/label/c.DeSelect_All';
import LABEL_DETACH_FILE from '@salesforce/label/c.Detach_File';
import LABEL_DETACH_FILE_CONFIRMATION from '@salesforce/label/c.Detach_File_Confirmation';
import LABEL_DETACH_FILE_SUCCESS from '@salesforce/label/c.Detach_File_Success';
import LABEL_DETAILS from '@salesforce/label/c.Details2';
import LABEL_DIRECT_REBATE from '@salesforce/label/c.Direct_Rebate';
import LABEL_DISCOUNT_CATEGORY from '@salesforce/label/c.Discount_Category';
import LABEL_DISCOUNT_CATEGORY from '@salesforce/label/c.Discount_Category';
import LABEL_DOCUSIGN from '@salesforce/label/c.DocuSign';
import LABEL_END_DATE_ERROR from '@salesforce/label/c.End_Date_Error';
import LABEL_FORM_ERROR from '@salesforce/label/c.PSA_Form_Error';
import LABEL_FOUR_PAYMENT_HELPTEXT from '@salesforce/label/c.Four_Payments_HelpText';
import LABEL_HELP from '@salesforce/label/c.Help';
import LABEL_INFO from '@salesforce/label/c.Info';
import LABEL_ITEMS from '@salesforce/label/c.Items';
import LABEL_LENGTH_OF_AGREEMENT_ERROR from '@salesforce/label/c.Length_of_Agreement_Error';
import LABEL_LENGTH_OF_AGREEMENT_YEARS from '@salesforce/label/c.Length_of_Agreement_Years';
import LABEL_LENGTH_OF_AGREEMENT_MONTHS from '@salesforce/label/c.Length_of_Agreement_Months';
import LABEL_LIMIT_TO_SELECTED_ACCOUNTS from '@salesforce/label/c.Limit_to_Selected_Accounts';
import LABEL_LOADING_PLEASE_WAIT from '@salesforce/label/c.Loading_Please_Wait';
import LABEL_MENU_TYPE from '@salesforce/label/c.MenuType';
import LABEL_MONTH from '@salesforce/label/c.Month';
import LABEL_MONTHS from '@salesforce/label/c.Months';
import LABEL_MPO_PRESTIGE from '@salesforce/label/c.MPO_Prestige';
import LABEL_NO from '@salesforce/label/c.No';
import LABEL_NO_ACCOUNTS_FOUND_FOR_PARENT from '@salesforce/label/c.No_Accounts_Found_For_Parent';
import LABEL_NO_ACCOUNTS_SELECTED from '@salesforce/label/c.No_Accounts_Selected';
import LABEL_NO_DECISION_MAKERS_FOUND_FOR_ACCOUNT from '@salesforce/label/c.No_Decision_Makers_found_for_Account';
import LABEL_NONE from '@salesforce/label/c.None';
import LABEL_NONE_PICKLIST_VALUE from '@salesforce/label/c.None_Picklist_Value';
import LABEL_NUMBER_OF_PAYMENTS from '@salesforce/label/c.Number_of_Payments';
import LABEL_OK from '@salesforce/label/c.OK';
import LABEL_ON_SIGNING from '@salesforce/label/c.On_Signing';
import LABEL_ONE_PAYMENT_HELPTEXT from '@salesforce/label/c.One_Payment_HelpText';
import LABEL_PARENT_ACCOUNT from '@salesforce/label/c.Parent_Account';
import LABEL_PARENT_ACCOUNT_ERROR from '@salesforce/label/c.Parent_Account_Error';
import LABEL_PARENT_ACCOUNT_SEARCH_RESULTS_ERROR from '@salesforce/label/c.Parent_Account_Search_Results_Message';
import LABEL_PAYMENTS from '@salesforce/label/c.Payments';
//import LABEL_PAYMENT_CONFIGURATIONS from '@salesforce/label/c.Payment_Configurations';
import LABEL_PERCENTAGE_VISIBILITY from '@salesforce/label/c.Percentage_Visibility';
import LABEL_PREFERRED_RTM from '@salesforce/label/c.Preferred_RTM';
import LABEL_PREFERRED_RTM_ERROR from '@salesforce/label/c.Preferred_RTM_Error';
import LABEL_PREVIEW from '@salesforce/label/c.Preview';
import LABEL_PROBABILITY from '@salesforce/label/c.Probability';
import LABEL_PROMO_CODE from '@salesforce/label/c.Promo_Code';
import LABEL_PROBABILITY from '@salesforce/label/c.Probability';
import LABEL_PROMO_CODE from '@salesforce/label/c.Promo_Code';
import LABEL_PROMOTION_TYPE from '@salesforce/label/c.Promotion_Type';
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
import LABEL_NO_START_DATE_ERROR from '@salesforce/label/c.Start_Date_Error';
import LABEL_PREDATED_ERROR from '@salesforce/label/c.PreDated_Error';
import LABEL_SIGNING_CUSTOMER_ERROR from '@salesforce/label/c.Signing_Customer_Error';
import LABEL_STATUS from '@salesforce/label/c.Status';
import LABEL_SUBMIT_FOR_APPROVAL from '@salesforce/label/c.Submit_For_Approval';
import LABEL_SUCCESS from '@salesforce/label/c.Success';
import LABEL_SUMMARY from '@salesforce/label/c.Summary';
import LABEL_THREE_PAYMENT_HELPTEXT from '@salesforce/label/c.Three_Payments_HelpText';
import LABEL_TWO_PAYMENT_HELPTEXT from '@salesforce/label/c.Two_Payments_HelpText';
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
const numberOfPaymentOptions = [{'label':'1','value':'1'},{'label':'2','value':'2'},{'label':'3','value':'3'},{'label':'4','value':'4'}];

const paymentColumns = [
    { label: '%', fieldName: 'percentage_achieved', type: 'number', editable: true }
];

export default class PromotionalSalesAgreement extends NavigationMixin(LightningElement) {
    labels = {
        account                 : { label: LABEL_ACCOUNT },        
        accountSearchResults    : { label: LABEL_ACCOUNT_SEARCH_RESULTS },
        activityType            : { label: LABEL_ACTIVITY_TYPE, checked: LABEL_DIRECT_REBATE, unchecked: LABEL_COUPON },
        actuals                 : { label: LABEL_ACTUALS },
        agreementEndDate        : { label: LABEL_AGREEMENT_END_DATE },
        all                     : { label: LABEL_ALL, picklistValue: '--'+LABEL_ALL+'--' },
        allAccountSelected      : { message: LABEL_ALL_ACCOUNTS_SELECTED },
        alternateRTM            : { label: LABEL_ALTERNATE_RTM, placeholder: '', error: LABEL_ALTERNATE_RTM_ERROR},
        back                    : { label: LABEL_BACK },
        budget                  : { label: LABEL_BUDGET },
        cancel                  : { label: LABEL_CANCEL },
        change                  : { label: LABEL_CHANGE, labelLowercase: LABEL_CHANGE.toLowerCase() },
        clear                   : { label: LABEL_CLEAR },
        clone                   : { label: LABEL_CLONE, clonedMessage: LABEL_CLONE_SUCCESS_MESSAGE, instruction: LABEL_CLONE_PSA_INSTRUCTION },
        comments                : { label: LABEL_COMMENTS },
        companyDetails          : { label: LABEL_COMPANY_DETAILS },
        contractType            : { label: LABEL_CONTRACT_TYPE },
        contractType            : { label: LABEL_CONTRACT_TYPE },
        customerDetails         : { label: LABEL_CUSTOMER_DETAILS },
        deSelectAll             : { label: LABEL_DESELECT_ALL },
        dateRange               : { label: LABEL_DATE_RANGE },
        details                 : { label: LABEL_DETAILS },
        detachFile              : { label: LABEL_DETACH_FILE, successMessage: LABEL_DETACH_FILE_SUCCESS, confirmation: LABEL_DETACH_FILE_CONFIRMATION},
        discountCategory        : { label: LABEL_DISCOUNT_CATEGORY },
        discountCategory        : { label: LABEL_DISCOUNT_CATEGORY },
        docusign                : { label: 'Send Contract' },
        endDate                 : { label: LABEL_AGREEMENT_END_DATE, error: LABEL_END_DATE_ERROR },
        error                   : { message: LABEL_FORM_ERROR },
        help                    : { label: LABEL_HELP },
        items                   : { label: LABEL_ITEMS },
        info                    : { label: LABEL_INFO },
        lengthOfPSA             : { yearsLabel: LABEL_LENGTH_OF_AGREEMENT_YEARS, monthsLabel: LABEL_LENGTH_OF_AGREEMENT_MONTHS, error: LABEL_LENGTH_OF_AGREEMENT_ERROR },
        limitToSelectedAccounts : { label: LABEL_LIMIT_TO_SELECTED_ACCOUNTS },
        loading                 : { message: LABEL_LOADING_PLEASE_WAIT },
        menuType                : { label: LABEL_MENU_TYPE },
        month                   : { label: LABEL_MONTH.toLowerCase(), labelPlural: LABEL_MONTHS.toLowerCase() },
        mpoPrestige             : { label: LABEL_MPO_PRESTIGE },
        no                      : { label: LABEL_NO },
        noAccountsFound         : { label: LABEL_NO_ACCOUNTS_FOUND_FOR_PARENT },
        noAccountsSelected      : { error: LABEL_NO_ACCOUNTS_SELECTED },
        none                    : { label: LABEL_NONE, picklistLabel: LABEL_NONE_PICKLIST_VALUE },
        noSigningCustomers      : { message: LABEL_NO_DECISION_MAKERS_FOUND_FOR_ACCOUNT },
        numberOfPayments        : { label: LABEL_NUMBER_OF_PAYMENTS },
        ok                      : { label: LABEL_OK },
        parentAccount           : { label: LABEL_PARENT_ACCOUNT, error: LABEL_PARENT_ACCOUNT_ERROR },
        parentAccountSearchResults : { label: LABEL_PARENT_ACCOUNT_SEARCH_RESULTS_ERROR },
        payments                : { oneHelpText: LABEL_ONE_PAYMENT_HELPTEXT, twoHelpText: LABEL_TWO_PAYMENT_HELPTEXT, threeHelpText: LABEL_THREE_PAYMENT_HELPTEXT, fourHelpText: LABEL_FOUR_PAYMENT_HELPTEXT },
        paymentConfigurations   : { label: LABEL_PAYMENTS },
        percentageVisibility    : { label: LABEL_PERCENTAGE_VISIBILITY },
        preferredRTM            : { label: LABEL_PREFERRED_RTM, placeholder: '', error: LABEL_PREFERRED_RTM_ERROR },
        preview                 : { label: LABEL_PREVIEW },
        probabilityPercentage   : { label: LABEL_PROBABILITY },
        promoCode               : { label: LABEL_PROMO_CODE },
        probabilityPercentage   : { label: LABEL_PROBABILITY },
        promoCode               : { label: LABEL_PROMO_CODE },
        promotionType           : { label: LABEL_PROMOTION_TYPE },
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
        signingCustomer         : { error: LABEL_SIGNING_CUSTOMER_ERROR },
        signingCustomerHeader   : { label: LABEL_SIGNING_CUSTOMER },        
        startDate               : { label: LABEL_AGREEMENT_START_DATE, error: LABEL_NO_START_DATE_ERROR, preDatedPSAError: LABEL_PREDATED_ERROR },
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
    hasEndDateError = false;
    hasAlternateRTMError = false;
    hasPreferredRTMError = false;
    hasParentAccountError = false;
    hasChildAccountsError = false;
    hasSigningCustomerError = false;
    probabilityPercentage = 0;
    probabilityPercentage = 0;
    thePSA;
    startDate = '';
    endDate = '';
    isSearching = false;
    isUsingParentAccount = true;
    isSearchingForParent = true;
    isDirectRebate = true;
    selectAllChildAccounts = false;
    isMPOPrestige = false;
    limitToSelectedAccounts = false;
    hasMultipleAccountPages = true;
    captureNumberOfPayments = false;
    captureTotalBudget = false;
    captureEndDate = false;
    captureActivityType = false;
    capturePromotionType = false;
    captureMenuType = false;
    captureContractType = false;
    agreementRequiresWholesaler = false;
    configurePayments = false;
    allAccountsSelected = false;
    pageNumber = 1;
    pageSize;
    totalItemCount = 0;
    selectedAccountId;
    accountQueryString = '';
    accountHasManyDecisionMakers = false;
    accounts;
    childAccounts;
    selectedAccounts = new Map();
    promotionsToDelete = new Map();
    wiredAccount;
    purchaseOrder;
    promotionType;
    contractType;
    discountCategory;
    promoCode;
    contractType;
    discountCategory;
    promoCode;
    comments;
    numberOfPayments = 1;
    totalBudget = 0;
    percentageVisibility = 0;
    activityTypeActive = { label: this.labels.activityType.checked, value: this.labels.activityType.checked };
    activityTypeInactive = { label: this.labels.activityType.unchecked, value: this.labels.activityType.unchecked };    
    canAddNewAccountsToPSA = false;
    canPreDatePSA = false;
    loadOnlyAccountWholesalers = false;


    isWorking = true;
    workingMessage = this.labels.working.message;    

    @track
    attachedFiles;

    paymentColumns = paymentColumns;
    paymentConfigs = [];

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
                this.loadPSADetails(value.data.psa);
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

    isSOMUser = false;
    @wire(getIsSOMUser)
    wiredSOMUser(value) {
        if (value.data) {
            this.isSOMUser = value.data;
            this.error = null;
        } else {
            this.isSOMUser = false;
            this.error = value.error;
        }
    }
    

    numberOfPaymentOptions = numberOfPaymentOptions;
    statusOptions;
    promotionTypeOptions;
    menuTypeOptions;
    contractTypeOptions;
    discountCategoryOptions;
    promoCodeOptions;

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
            this.captureNumberOfPayments = this.market.Capture_Number_of_Payments__c == undefined ? false : this.market.Capture_Number_of_Payments__c;
            this.captureTotalBudget = this.market.Capture_PSA_Budget__c == undefined ? false : this.market.Capture_PSA_Budget__c;
            this.captureEndDate = this.market.Capture_End_Date__c == undefined ? false : this.market.Capture_End_Date__c;
            this.agreementRequiresWholesaler = this.market.Agreement_Requires_Wholesaler__c == undefined ? true : this.market.Agreement_Requires_Wholesaler__c;
            this.configurePayments = this.market.Agreement_Configure_Payments__c == undefined ? false : this.market.Agreement_Configure_Payments__c;
            this.captureActivityType = this.market.Capture_Activity_Type__c == undefined ? false : this.market.Capture_Activity_Type__c;
            this.canAddNewAccountsToPSA = this.market.Add_New_Accounts_to_PSA__c == undefined ? false : this.market.Add_New_Accounts_to_PSA__c;
            this.canPreDatePSA = this.market.Can_PreDate_PSA__c == undefined ? false : this.market.Can_PreDate_PSA__c;
            this.loadOnlyAccountWholesalers = this.market.Load_only_Account_Wholesalers__c == undefined ? false : this.market.Load_only_Account_Wholesalers__c;
            this.capturePromotionType = this.market.Capture_Promotion_Type__c == undefined ? false : this.market.Capture_Promotion_Type__c;
            this.captureCCMDetails = this.market.Capture_CCM_Details__c == undefined ? false : this.market.Capture_CCM_Details__c;
            this.captureMenuType = this.market.Capture_Menu_Type__c == undefined ? false : this.market.Capture_Menu_Type__c;
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
    @wire(getWholesalers, { market: '$marketId' })
    wiredGetWholesalers({ error, data }) {
        if (data) {
            if (this.isPhone && this.isThisTass) {
                alert('[psa.getwholesalers]');
            }            
            console.log('[wiredGetWholesalers] selectedAccountId', this.selectedAccountId);
            console.log('[wiredGetWholesalers] wholesalers', data);

            if (this.loadOnlyAccountWholesalers) { return; }
            this.error = undefined;
            this.wiredWholesalers = data;
            this.wholesalers = data.map(wholesaler => { 
               return { label: wholesaler.Name, value: wholesaler.Id, wholesaler: wholesaler.Wholesaler__c, wholesalerName: wholesaler.Wholesaler_Name__c }; 
            });
            this.wholesalers.splice(0, 0, { label: this.labels.none.picklistLabel, value: '-none-' });
            if (!this.agreementRequiresWholesaler) {
                this.wholesalers.splice(0, 0, { label: this.labels.all.picklistLabel, value: '-all-' });
            }
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
    get hasAccessToActuals() {
        return this.thePSA != null && this.thePSA.Market__r != undefined && this.thePSA.Market__r.Enable_PSA_Actuals__c;
    }
    get canEditActuals() {
        let canEdit = false;
        if (this.thePSA != null && this.thePSA.Is_Approved__c == true && !this.isSubmitted && this.hasAccessToActuals) {
            if (this.isMexico) {
                canEdit = this.status == 'Signed';
            } else {
                canEdit = this.status != 'Updated';
            }
        }
        //return this.thePSA != null && this.thePSA.Is_Approved__c == true && this.status != 'Updated' && !this.isSubmitted && this.hasAccessToActuals;
        return canEdit;
    }
    get canViewSummary() {
        return this.thePSA != null;
    }
    get hasPreview() {
        return this.market == undefined || (this.market != undefined && this.market.Enable_PSA_Preview__c == true);
    }
    get isLocked() {
        if (this.thePSA == undefined) {
            return false;
        } else {
            return this.status == 'Approved' || this.status == 'Submitted' || this.status == 'Pending Approval' || this.thePSA.Is_Approved__c == true;
        }
    }
    get paymentsLocked() {
        console.log('[canChangePayments] isLocked, isMexico, canchange', this.isLocked, this.isMexico, this.isLocked && this.isMexico);
        return this.isLocked && this.isMexico;
    }
    get isMexico() {
        return this.thePSA != null && this.thePSA.Market__r != null && this.thePSA.Market__r.Name == 'Mexico';
    }
    get isApproved() {
        return this.thePSA != null && (this.thePSA.Status__c == 'Approved' || this.thePSA.Is_Approved__c);
    }
    get canSendContract() {
        return this.thePSA != null && this.isApproved && this.thePSA.Market__r != null && this.thePSA.Market__r.DocuSign__c != null && this.thePSA.Market__r.DocuSign__c.indexOf('PSA') > -1;
        /*
        if (this.thePSA == null || this.thePSA.Market__r == null || this.thePSA.Market__r.Name == 'France') {
            return false;
        } else {
            return this.isApproved;
        }
        */
    }
    get canChangeStatus() {
        console.log('[canChangestatus] status, isSOMUser', this.status, this.isSOMUser);
        return this.status != 'New' && this.status != 'Submitted' && this.status != 'Updated' && this.isSOMUser;
    }
    get captureMPO() {
        return this.market == undefined || (this.market != undefined && this.market.Name == 'United Kingdom');
    }
    get capturePercentageVisibility() {
        return this.market == undefined || (this.market != undefined && this.market.Name == 'Brazil');
    }
    get captureProbability() {
        return this.market == undefined || (this.market != undefined && this.market.Name == 'Japan');
    }

    get captureProbability() {
        return this.market == undefined || (this.market != undefined && this.market.Name == 'Japan');
    }

    //get canPreDatePSA() {
    //    return this.thePSA != null && this.thePSA.Market__r != undefined && this.thePSA.Market__r.Can_PreDate_PSA__c;
    //}

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
    
    formatDate(theDate) {
        const year = theDate.getFullYear();
        const month = ('00' + (theDate.getMonth() + 1)).slice(-2);
        const day = ('00' + theDate.getDate()).slice(-2);
        console.log('[formatDate] theDate, year, month, day', theDate, year, month, day);
        return year + '-' + month + '-' + day + 'T00:00:00Z';
    }
    /*
    get formattedStartDate() {
        var theDate = this.startDate == null ? new Date() : this.startDate;;
        try {
            console.log('[formattedStartDate] theDate', theDate);
            theDate = this.formatDate(theDate);
        } catch(ex) {
            console.log('[formattedStartDate] exception', ex);
        }
        return theDate;
    }
    get formattedEndDate() {
        var theDate = this.i_endDate == null ? new Date() : this.i_endDate;
        try {
            console.log('[formattedEndDate] theDate', theDate);
            theDate = this.formatDate(theDate);
        } catch(ex) {
            console.log('[formattedEndDate] exception', ex);
        }
        return theDate;
    }
    
    get endDate() {
        var theDate = this.startDate == null ? new Date() : new Date(this.startDate);
        var year = theDate.getFullYear();
        var month = theDate.getMonth();
        var day = theDate.getDate();
        let newDate = new Date(year, month, day);
        console.log('[enddate] islengthinyears', this.isLengthInYears, this.lengthOfPSA, newDate);
        if (this.isLengthInYears) {
            newDate.setFullYear(newDate.getFullYear() + parseInt(this.lengthOfPSA));
            if (newDate > theDate) {
                newDate.setDate(newDate.getDate() - 1);
            }
        } else {
            newDate.setMonth(newDate.getMonth() + parseInt(this.lengthOfPSA));
        }
        console.log('[endDate] theDate', theDate, year, month, day, newDate);
        return newDate;
    }  
    */  

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
    get signingCustomerEmail() {
        let email = '';
        if (this.signingCustomer) {
            email = this.signingCustomer.Email == undefined ? '' : this.signingCustomer.Email;
        }

        return email;
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

    get isOnePayment() {
        return this.numberOfPayments == 1;
    }
    get isTwoPayments() {
        return this.numberOfPayments == 2;
    }
    get isThreePayments() {
        return this.numberOfPayments == 3;
    }
    get isFourPayments() {
        return this.numberOfPayments == 4;
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
                    refreshApex(this.wiredAgreement);
                    this.status = this.wiredAgreement.Status__c;
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
    handlePreviewButtonClick() {
        this[NavigationMixin.Navigate]({
            type: 'standard__webPage',
            attributes: {
                url: '/apex/PromotionalSalesAgreement_Preview?id='+this.recordId
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
        try {
            console.log('[handleClearAccountDetailsClick]');
            this.parentAccount = undefined;
            this.accounts = undefined;
            this.isSearchingForParent = true;
            this.hasSigningCustomerError = false;
            console.log('[handleClearAccountDetailsClick] thePSA.Promotions__r', this.thePSA.Promotions__r);
            if (this.thePSA.Promotions__r != undefined && this.thePSA.Promotions__r.length > 0) {
                this.promotionsToDelete.clear();
                this.thePSA.Promotions__r.forEach(p => {
                    this.promotionsToDelete.set(p.Account__c, { id: p.Id, itemItem: p.Account__c });
                });
            }
            console.log('[handleClearAccountDetailsClick] promotionsToDelete', this.promotionsToDelete);
        }catch(ex) {
            console.log('[handleClearAccountDetailsClick] exception', ex);
        }
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
        this.startDate = ev.detail.value;
        console.log('[handleStartDateChange] startdate', this.startDate);
        console.log('[handleStartDateChange] event.date', ev.detail.value);
        console.log('[handleStartDateChange] canPreDatePSA', this.canPreDatePSA);

        this.calcEndDate();
        this.hasStartDateError = false;
        if (!this.canPreDatePSA) {
            const today = new Date();
            today.setHours(0, 0, 0);

            const sdate = new Date(ev.detail.value);
            console.log('[handleStartDateChange] today', today);
            console.log('[handleStartDateChange] startDate', this.startDate);
            console.log('[handleStartDateChange] sdate', sdate);
            if (sdate < today) {
                this.hasStartDateError = true;
                this.labels.startDate.error = this.labels.startDate.preDatedPSAError;
            }
        }
    }
    handleEndDateChange(ev) {
        this.endDate = ev.detail.value;
    }
    handleLengthOfPSAChange(ev) {
        console.log('[handleLengthOfPSAChange] value', ev.detail.value);
        this.lengthOfPSA = ev.detail.value;
        this.calcEndDate();

        if (this.thePSA.Is_Approved__c) { 
            this.status = 'Updated';
        }
    }
    handleNumberOfPaymentsChange(ev) {
        console.log('[handleNumberOfPaymentsChange] value', ev.detail.value);
        this.numberOfPayments = ev.detail.value;
        if (this.configurePayments) {
            let payConfigs = [];
            for(let i = 1; i <= this.numberOfPayments; i++) {
                payConfigs.push({ payment_number: i, percent_achieved: 0 });
            }
            this.paymentConfigs = [...payConfigs];
        }
    }
    handlePaymentConfigChange(ev) {
        try {
        console.log('[handlePaymentConfigChange] value', ev.detail.value);
        console.log('[handlePaymentConfigChange] payment number', ev.target.dataset.paymentnumber);
            const paymentNumber = ev.target.dataset.paymentnumber - 1;
            this.paymentConfigs[paymentNumber].percent_achieved = ev.detail.value;
        }catch(ex) {
            console.log('[handlePaymentConfigChange] exception', ex);
        }
    }
    handlePaymentConfigurationsSave(ev) {
        try {
            this.paymentConfigs = ev.detail.draftValues;
            console.log('draftValues', this.paymentConfigs);
        }catch(ex) {
            console.log('draft values exception', ex);
        }
    }

    handlePreviousPage() {
        this.pageNumber = this.pageNumber - 1;
        if (this.isSearchingForParent) {
            this.getAccounts();
        } else {
            if (this.parentAccount != undefined) {
                //this.findAccountsForParent(this.parentAccount.Id);
                this.loadChildAccounts();
            }
        }
    }
    handleNextPage() {
        this.pageNumber = this.pageNumber + 1;
        if (this.isSearchingForParent) {
            this.getAccounts();
        } else {
            if (this.parentAccount != undefined) {
                //this.findAccountsForParent(this.parentAccount.Id);
                this.loadChildAccounts();
            }
        }
    }
    handleSelectAllAccountsClick(event) {
        console.log('select all accounts clicked');
        fireEvent(this.pageRef, 'selectTile', true);
        if (this.selectedAccounts == undefined) { this.selectedAccounts = new Map(); }
        // Check to see if this account was previously de-selected and marked for deletion
        this.promotionsToDelete.clear();
        console.log('[selectallaccounts] accounts', this.accounts);
        try {
            this.selectAllChildAccounts = true;
            
            this.childAccounts.forEach(a => {
                console.log('[selectallaccounts] a', a);
                a.isSelected = true;
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
        this.selectAllChildAccounts = false;
        this.childAccounts.forEach(a => {
            a.isSelected = false;
        });
        this.selectedAccounts.forEach(a => {
            if (a.id != '') {
                this.promotionsToDelete.set(a.id, a);
            }
        });
        this.selectedAccounts.clear();
        
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
    handleActivityTypeToggle(event) {
        this.isDirectRebate = event.detail.checked;
    }
    handleLimitToSelectedAccountsToggle(event) {
        this.limitToSelectedAccounts = event.detail.checked;
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
    /*
    handleRemoveAttachedFile(event) {
        const response = confirm(this.labels.detachFile.confirmation.replace('{0}', event.detail.item.label));
        if (response == true) {            
            this.detachFile(event.detail.item.name, event.detail.item.label, event.detail.index);
        } 
    }
        */
    handlePurchaseOrderChange(event) {
        this.purchaseOrder = event.detail.value;
    }
    handleTotalBudgetChange(event) {
        this.totalBudget = event.detail.value;
    }
    handlePercentageVisibilityChange(event) {
        this.percentageVisibility = event.detail.value;
    }
    handleProbabilityPercentageChange(event) {
        this.probabilityPercentage = event.detail.value;
    }
    handleProbabilityPercentageChange(event) {
        this.probabilityPercentage = event.detail.value;
    }
    handleStatusChange(event) {
        this.status = event.detail.value;
        console.log('this.status', this.status);
        if (invalidStatusSelections.indexOf(this.status) >= 0) {
            this.status = this.thePSA.Status__c;
            this.showToast('error', 'Invalid selection', 'You cannot select this status');
        }
    }
    handlePromotionTypeChange(event) {
        this.promotionType = event.detail.value;
    }
    handleMenuTypeChange(event) {
        this.menuType = event.detail.value;
    }
    handleContractTypeChange(event) {
        this.contractType = event.detail.value;
    }
    handleDiscountCategoryChange(event) {
        try {
            this.discountCategory = event.detail.value;
            this.promoCode = undefined;
            let controllingValue = this.picklistValuesMap["Promo_Code__c"].controllerValues[event.detail.value];
            console.log('[handleDiscountCategoryChange] controllingValue', controllingValue);
            let options = [];
            this.picklistValuesMap["Promo_Code__c"].values.forEach(pc => {
                console.log('promo code picklist value validfor', pc.validFor);
                console.log('has controlling value', pc.validFor.indexOf(controllingValue));
                if (pc.validFor.indexOf(controllingValue) >= 0) {
                    options.push({ label: pc.label, value: pc.value });
                }
            });
            /*
            let promoCodesForDiscountCategory = this.picklistValuesMap["Promo_Code__c"].values.filter(pc => pc.validFor.indexOf(controllingValue) >= 0);
            console.log('[handleDiscountCategoryChange] promoCodesForDiscountCategory', promoCodesForDiscountCategory);
            let options = promoCodesForDiscountCategory.map(pc => {
                return { label: pc.label, value: pc.value };
            });
            */
            console.log('[handleDiscountCategoryChange] options', options);

            this.promoCodeOptions = [...options];
        } catch(ex) {
            console.log('[handleDiscountCategoryChange] exception', ex.message);
        }
    }
    handlePromoCodeChange(event) {
        this.promoCode = event.detail.value;
    }

    handleCommentsChange(event) {
        this.comments = event.detail.value;
    }

    /*
        Handle Listener events
    */   
    handleAccountSelected(event) {
        console.log('[handleAccountSelected] account', event.detail);
        this.selectedAccountId = event.detail;
        if (this.isSearchingForParent) {
            if (event.detail) {
                this.getAccount(this.selectedAccountId);    
            }
        } else {
            if (this.selectedAccounts == undefined) { this.selectedAccounts = new Map(); }
            // Check to see if this account was previously de-selected and marked for deletion
            if (this.promotionsToDelete.has(this.selectedAccountId)) {
                const sa = this.promotionsToDelete.get(this.selectedAccountId);
                this.promotionsToDelete.delete(this.selectedAccountId);
                this.selectedAccounts.set(this.selectedAccountId, sa);
            } else if (!this.selectedAccounts.has(this.selectedAccountId)) {
                this.selectedAccounts.set(this.selectedAccountId, { id: '', itemId: this.selectedAccountId });
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
            this.selectedAccountId = undefined;
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
    calcEndDate() {
        var theDate = this.startDate == null ? new Date() : new Date(this.startDate);
        var year = theDate.getFullYear();
        var month = theDate.getMonth();
        var day = theDate.getDate();
        let newDate = new Date(year, month, day);
        console.log('[enddate] islengthinyears', this.isLengthInYears, this.lengthOfPSA, newDate);
        if (this.isLengthInYears) {
            newDate.setFullYear(newDate.getFullYear() + parseInt(this.lengthOfPSA));
            if (newDate > theDate) {
                newDate.setDate(newDate.getDate() - 1);
            }
        } else {
            newDate.setMonth(newDate.getMonth() + parseInt(this.lengthOfPSA));
        }
        console.log('[endDate] theDate', theDate, year, month, day, newDate);
        
        this.endDate = newDate;
    }
    getUpdatedPageReference(stateChanges) {
        console.log('[psa.getupdatedpagereference] statechanges', stateChanges);
        return Object.assign({}, this.currentPageReference, {
            state: Object.assign({}, this.currentPageReference.state, stateChanges)
        });
    }

    setFieldOptions(picklistValues) {
        console.log('[setFieldOptions] picklistValues', picklistValues);
        try {
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
                } else if (picklist === 'Activity_Type__c') {
                    if (picklistValues[picklist].values.length >= 2) {
                        this.activityTypeActive = { label: picklistValues[picklist].values[0].label, value: picklistValues[picklist].values[0].value };
                        this.activityTypeInactive = { label: picklistValues[picklist].values[1].label, value: picklistValues[picklist].values[1].value };    
                    }
                } else if (picklist === 'Promotion_Type__c') {
                    this.promotionTypeOptions = [];
                    picklistValues[picklist].values.forEach(pv => {
                        this.promotionTypeOptions.push({ label: pv.label, value: pv.value });
                    });
                } else if (picklist === 'Menu_Type__c') {
                    this.menuTypeOptions = [];
                    picklistValues[picklist].values.forEach(pv => {
                        this.menuTypeOptions.push({ label: pv.label, value: pv.value });
                    });
                } else if (picklist === 'Contract_Type__c') {
                    this.contractTypeOptions = [];
                    picklistValues[picklist].values.forEach(pv => {
                        this.contractTypeOptions.push({ label: pv.label, value: pv.value });
                    });
                } else if (picklist == 'Discount_Category__c') {
                    this.discountCategoryOptions = [];
                    picklistValues[picklist].values.forEach(pv => {
                        this.discountCategoryOptions.push({ label: pv.label, value: pv.value });
                    });
                } else if (picklist == 'Promo_Code__c') {
                    this.promoCodeOptions = [];
                    picklistValues[picklist].values.forEach(pv => {
                        this.promoCodeOptions.push({ label: pv.label, value: pv.value });
                    });
                }
            });
        } catch(ex) {
            console.log('[promotionalSalesAgreement.setFieldOptions] exception', ex);
        }
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
            this.allAccountsSelected = data.All_Child_Accounts_Included;
            if (data.Account__c) {
                this.parentAccount = {
                    Id: data.Account__c,
                    Name: data.Account__r.Name,
                    ShippingStreet: data.Account__r.ShippingStreet,
                    ShippingCity: data.Account__r.ShippingCity,
                    ShippingCountry: data.Account__r.ShippingCountry,
                    ShippingState: data.Account__r.ShippingState,
                    ShippingCountry: data.Account__r.ShippingCountry,
                    Contacts: [data.Contact__r],
                    PromotionId: ''
                };
                this.selectedAccountId = data.Account__c;
                this.isSearchingForParent = false;
                this.isUsingParentAccount = data.Account__r.RecordType.Name.indexOf('Parent') > -1;
                console.log('[getPSA] isUsingParentAccount', this.isUsingParentAccount);
                const el = this.template.querySelector("lightning-input.account-type-toggle");
                if (el) {
                    el.checked = this.isUsingParentAccount;
                }
                //this.template.querySelector("lightning-input.account-type-toggle").checked = this.isUsingParentAccount;
            }
            if (data.Number_of_Payments__c != undefined) {
                this.numberOfPayments = data.Number_of_Payments__c.toString();  

                let pconfigs = [];
                if (data.Payment_Configurations__c != undefined) {
                         
                    const pconfigItems = data.Payment_Configurations__c.split(',');
                    console.log('pconfigs', pconfigItems);
                    console.log('pconfigs length', pconfigItems.length);
                    
                    for(var pcCtr = 0; pcCtr < pconfigItems.length; pcCtr++) {
                        console.log('pconfigs['+pcCtr+']', pconfigItems[pcCtr]);
                        pconfigs.push({payment_number: (pcCtr + 1), percent_achieved: pconfigItems[pcCtr]});
                        
                    }
                    
                    //for(let i = 0; i < pconfigs.length; i++) {
                    //    pconfigs.push({payment_number: (i+1), percentage_achieved: parseFloat(pconfigs[i]) });
                    //}
                }
                this.paymentConfigs = [...pconfigs];
                
            }
            
            this.promotionType = data.Promotion_Type__c;
            this.menuType = data.Menu_Type__c;
            this.contractType = data.Contract_Type__c;
            this.discountCategory = data.Discount_Category__c;
            this.promoCode = data.Promo_Code__c;
            this.percentageVisibility = data.Percentage_Visibility__c;
            this.probabilityPercentage = data.Probability__c;
            this.probabilityPercentage = data.Probability__c;
            this.totalBudget = data.Activity_Budget__c;
            this.isMPOPrestige = data.MPO_Prestige__c;
            this.limitToSelectedAccounts = data.Limit_to_Selected_Accounts__c;
            this.status = data.Status__c;
            this.purchaseOrder = data.Purchase_Order__c;
            this.accountWholesalerPreferred = data.Account_Wholesaler_Preferred__c;
            this.accountWholesalerAlternate = data.Account_Wholesaler_Alternate__c;
            if (this.loadOnlyAccountWholesalers) {
                this.wholesalerPreferred = data.Account_Wholesaler_Preferred__c;
                this.wholesalerAlternate = data.Account_Wholesaler_Alternate__c;
            } else {
                this.wholesalerPreferred = data.Wholesaler_Preferred__c;
                this.wholesalerAlternate = data.Wholesaler_Alternate__c;
            }
            this.comments = data.Evaluation_Comments__c
            this.isDirectRebate = data.Activity_Type__c != 'Coupon';
            if (data.Begin_Date__c) {
                this.startDate = data.Begin_Date__c;
            }
            if (data.End_Date__c) {
                this.endDate = data.End_Date__c;
            } else {
                this.calcEndDate();
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
                data.Promotions__r.forEach(p => {
                    if (p.Account__c == this.parentAccount.Id) {
                        this.parentAccount.PromotionId = p.Id;
                    } else {
                        this.selectedAccounts.set(p.Account__c, { id: p.Id, itemId: p.Account__c });
                    }
                });
                /*
                if (this.isUsingParentAccount) {
                    getAccountsForParent({ 
                        parentAccountId: this.parentAccount.Id, 
                        pageNumber: 1,
                        market: this.market.Name
                    }).then(result => {
                        try {
                            console.log('[getAccountsForParent] result', result);
                            if (this.isPhone && this.isThisTass) {
                                alert('[psa.getaccountsforparent] # of child accounts', result.totalItemCount);
                            }
                
                            const newList = result.records.map(account => {
                                var isSelected = this.selectedAccounts.has(account.Id);

                                return { item: account, isSelected: isSelected };
                            });
                            this.childAccounts = newList;
                            console.log('[getAccountsForParent] children', newList);
                            this.accounts = {
                                pageSize: result.pageSize,
                                pageNumber: result.pageNumber,
                                records: newList.slice(0, result.pageSize),
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
                    this.getAccount(data.Account__c);
                }
                */
               this.getAccount(data.Account__c);

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
                    refreshApex(this.wiredAgreement);
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
        this.hasEndDateError = false;
        this.hasPreferredRTMError = false;
        this.hasParentAccountError = false;
        this.hasChildAccountsError = false;
        this.hasSigningCustomerError = false;

        if (this.captureEndDate) {
            const edate = new Date(this.endDate);
            const sdate = new Date(this.startDate);
            if (edate.getTime() < sdate.getTime()) {
                this.hasEndDateError = true;    
                isValid = false;            
            }
        } else {
            if (this.lengthOfPSA == undefined) {
                this.hasLengthOfPSAError = true;
                isValid = false; 
            } else if (this.isLengthInYears == false) {
                if (this.lengthOfPSA / 12 > this.maximumLengthOfPSA) {
                    this.hasLengthOfPSAError = true;
                }
            }    
        }

        if (!this.isApproved && !this.canPreDatePSA) {
            const today = new Date();
            today.setHours(0, 0, 0);

            if (new Date(this.startDate) < today) {
                this.hasStartDateError = true; isValid = false;
                this.labels.startDate.error = this.labels.startDate.preDatedPSAError;
            }
            console.log('[validatepsa] isValid', isValid);
            console.log('[validatepsa] startDateError', this.hasStartDateError);
        }

        console.log('[validatepsa] wholesalerpreferred', this.wholesalerPreferred);
        if (this.agreementRequiresWholesaler && this.wholesalerPreferred == undefined || this.wholesalerPreferred == '-none-') {
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

        if (this.signingCustomer == undefined) {
            this.hasSigningCustomerError = true;
            isValid = false;
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
   /*
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
    */
    /*
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
                if (this.loadOnlyAccountWholesalers && result.Wholesalers__r != undefined) {
                    this.wiredWholesalers = result.Wholesalers__r;
                    let l = result.Wholesalers__r.map(wholesaler => { 
                        return { label: wholesaler.Wholesaler_Account_Name__c, value: wholesaler.Id, wholesaler: wholesaler.Wholesaler__c, wholesalerName: wholesaler.Wholesaler_Name__c }; 
                    });
                    l.splice(0, 0, { label: this.labels.none.picklistLabel, value: '-none-' });
                    if (!this.agreementRequiresWholesaler) {
                        l.splice(0, 0, { label: this.labels.all.picklistLabel, value: '-all-' });
                    }

                    this.wholesalers = [...l];
                }
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
        getAccountsByName({
            accountName: this.accountQueryString, 
            isSearchingForParent: this.isUsingParentAccount, 
            market: this.marketId, 
            marketName: this.market.Name,
            pageNumber: this.pageNumber
        }).then(result => {
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
        getAccountsForParent({ parentAccountId: accountId, pageNumber: this.pageNumber, market: this.market.Name })
            .then(result => {
                console.log('[getAccountsForParent] result', result);
                /*
                if (this.allChildAccountsIncluded) {
                    result.records.forEach(item => {
                        if (!this.selectedAccounts.has(item.Id)) {
                            this.selectedAccounts.set(item.Id, { id: '', itemId: item.Id });;
                        }
                    });
                }
                */
                const newList = result.records.map(item => {
                    const isSelected = this.selectedAccounts == undefined || this.selectedAccounts.length == 0 ? false : this.selectedAccounts.has(item.Id);
                    return { item: item, isSelected: isSelected };
                });
                console.log('[getAccountsForParent] newList', newList);
                this.childAccounts = newList;
                this.accounts = {
                    pageSize: result.pageSize,
                    pageNumber: result.pageNumber,
                    records: newList.slice(0, result.pageSize),
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
    loadChildAccounts() {
        try {
            console.log('[loadChildAccounts] pageeNumber', this.pageNumber);
            console.log('[loadChildAccounts] pageSize', this.accounts.pageSize);
            const startIndex = (this.pageNumber - 1) * this.accounts.pageSize;
            let endIndex = this.accounts.pageSize * this.pageNumber;
            if (endIndex > this.childAccounts.length) { endIndex = this.childAccounts.length; }
            console.log('[loadChildAccounts] startIndex, endIndex', startIndex, endIndex);
            console.log('[loadChildAccounts] # of child accounts', this.childAccounts.length);
            let newList = this.childAccounts.slice(startIndex, endIndex);
            
            console.log('newList', newList);
            
            const updatedAccountList = {
                pageSize: this.accounts.pageSize,
                pageNumber: this.pageNumber,
                records: newList,
                totalItemCount: this.childAccounts.length
            };
            this.accounts = {...updatedAccountList};
        
        }catch(ex) {
            console.log('[loadChildAccounts] exception', ex);
        }
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
        
        console.log('[save] parentAccount', this.parentAccount);
        console.log('[save] marketId', this.marketId);
        console.log('[save] signingCustomer', this.signingCustomer);
        console.log('[save] wholesalerPreferred', this.wholesalerPreferred);
        console.log('[save] contractType', this.contractType);
        console.log('[save] contractType', this.contractType);

        param.beginDate = this.startDate;
        param.endDate = this.endDate;
        param.lengthOfPSA = parseInt(this.lengthOfPSA);
        param.isLengthInYears = this.isLengthInYears;
        param.numberOfPayments = parseInt(this.numberOfPayments);
        param.parentAccountId = this.parentAccount.Id;
        param.allChildAccountsIncluded = this.allAccountsSelected;
        param.signingCustomerId = this.signingCustomer.Id;
        param.signingCustomerFirstName = this.signingCustomer.FirstName;
        param.signingCustomerLastName = this.signingCustomer.LastName;
        param.signingCustomerName = this.signingCustomerName;
        param.signingCustomerEmail = this.signingCustomerEmail;
        param.comments = this.comments == undefined ? '' : this.comments;
        param.wholesalerPreferredId = this.wholesalerPreferred;
        param.mpoPrestige = this.isMPOPrestige;
        param.limitToSelectedAccounts = this.limitToSelectedAccounts;
        param.isDirectRebate = this.isDirectRebate;
        param.promotionType = this.promotionType;
        param.menuType = this.menuType;
        param.contractType = this.contractType;
        param.discountCategory = this.discountCategory;
        param.promoCode = this.promoCode;
        if (this.wholesalerPreferred == undefined || this.wholesalerPreferred == '-none-') {
            param.wholesalerPreferredId = null;
            param.wholesalerPreferredName = '';
        } else {
            const wp = this.wholesalers.find(w => w.value === this.wholesalerPreferred);
            if (this.loadOnlyAccountWholesalers) {
                param.wholesalerPreferredId = wp.wholesaler;
                param.wholesalerPreferredName = wp.wholesalerName;
                param.accountWholesalerPreferred = this.wholesalerPreferred;
                param.accountWholesalerPreferredName = wp.label;
            } else {
                param.wholesalerPreferredId = this.wholesalerPreferred;
                param.wholesalerPreferredName = wp.label;
            }
            console.log('wp', wp);    
        }
        if (this.wholesalerAlternate == undefined || this.wholesalerAlternate == '-none-') {
            param.wholesalerAlternateId = null;
            param.wholesalerAlternateName = '';
        } else {
            const wa = this.wholesalers.find(w => w.value === this.wholesalerAlternate);
            console.log('wa', wa);
            if (this.loadOnlyAccountWholesalers) {
                param.wholesalerAlternateId = wa.wholesaler;
                param.wholesalerAlternateName = wa.wholesalerName;
                param.accountWholesalerAlternate = this.wholesalerAlternate;
                param.accountWholesalerAlternateName = wa.label;
            } else {
                param.wholesalerAlternateId = this.wholesalerAlternate;
                param.wholesalerAlternateName = wa.label;    
            }
            console.log('wholesalerAlternate', this.wholesalerAlternate);
        }
        param.purchaseOrder = this.purchaseOrder == undefined ? '' : this.purchaseOrder;
        param.status = this.status;
        param.totalBudget = this.totalBudget == undefined ? 0 : this.totalBudget;
        param.percentageVisibility = this.percentageVisibility == undefined ? 0 : this.percentageVisibility;
        param.probabilityPercentage = this.probabilityPercentage == undefined ? 0 : this.probabilityPercentage;
        param.probabilityPercentage = this.probabilityPercentage == undefined ? 0 : this.probabilityPercentage;
        param.paymentConfigurations = '';
        console.log('paymentConfigurations', this.paymentConfigs);
        if (this.paymentConfigs.length > 0) {
            for(let i = 0; i < this.paymentConfigs.length; i++) {
                var percentage = this.paymentConfigs[i].percent_achieved;
                console.log('[save] percentage', percentage, this.paymentConfigs[i].percent_achieved);
                if (i == 0 && isNaN(percentage)) {
                    percentage = 0;
                } else {
                }
                param.paymentConfigurations += percentage + ',';
            }
            param.paymentConfigurations = param.paymentConfigurations.slice(0, -1);
            console.log('[save] payment configurations', param.paymentConfigurations);
        }
        
        param.accounts = [];
        param.accountsToDelete = [];
        
        if (this.isUsingParentAccount) {
            console.log('[save] selectedAccounts', this.selectedAccounts);
            if (this.selectedAccounts.size > 0) {
                this.selectedAccounts.forEach((value, key, map) => {
                    console.log('value', value, key);
                    param.accounts.push({id:value.id, itemId:value.itemId});
                });
                if (!this.selectedAccounts.has(param.parentAccountId)) {
                    param.accounts.push({id: this.parentAccount.PromotionId == undefined ? '' : this.parentAccount.PromotionId, itemId: param.parentAccountId});
                }
            }
        } else {
            let pId = '';
            if (this.thePSA.Promotions__r != undefined) {
                console.log('[save] promotions', this.thePSA.Promotions__r);
                const p = this.thePSA.Promotions__r.find(p => p.Account__c == param.parentAccountId);
                console.log('[save] found promotion', p);
                if (p != undefined) {
                    pId = p.Id;
                }
            }
            param.accounts.push({id:pId, itemId:param.parentAccountId});
        }
        console.log('[save] promotionsToDelete: ' + this.promotionsToDelete);
        if (this.promotionsToDelete.size > 0) {
            this.promotionsToDelete.forEach((value, key, map) => {
                console.log('promoToDelete', value, key);
                param.accountsToDelete.push(value.id);
            });
        }
        
        console.log('[save] param', param);
        savePSA({ psaData: param })
            .then(result => {
                this.isWorking = false;
                console.log('[savePSA] success. result', result);
                if (result === 'SUCCESS') {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: this.labels.success.label,
                            message: this.labels.saveSuccess.message,
                            variant: 'success'
                        }),
                    );
                } else {
                    this.dispatchEvent(
                        new ShowToastEvent({
                            title: this.labels.error.label,
                            message: result,
                            variant: 'warning'
                        }),
                    );
                } 

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