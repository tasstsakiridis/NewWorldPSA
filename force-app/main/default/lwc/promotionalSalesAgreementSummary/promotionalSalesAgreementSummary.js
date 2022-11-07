import { LightningElement, api, track, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { refreshApex } from '@salesforce/apex';

import LOCALE from '@salesforce/i18n/locale';
import TIMEZONE from '@salesforce/i18n/timeZone';

import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';

import LABEL_ACCOUNT from '@salesforce/label/c.Account';
import LABEL_ACTUAL from '@salesforce/label/c.Actual';
import LABEL_ACTUAL_VOLUME from '@salesforce/label/c.ActualVolume';
import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_BALANCE from '@salesforce/label/c.Balance';
import LABEL_CUSTOMER_PROFIT from '@salesforce/label/c.Customer_Profit';
import LABEL_DETAILS from '@salesforce/label/c.Details2';
import LABEL_END_DATE from '@salesforce/label/c.End_Date';
import LABEL_DISCOUNTPERCASE from '@salesforce/label/c.Discount_per_9LCase';
import LABEL_FREE_GOODS from '@salesforce/label/c.Free_Goods';
import LABEL_FREE_GOODS_COST from '@salesforce/label/c.Free_Goods_Cost';
import LABEL_FREE_GOODS_GIVEN from '@salesforce/label/c.Free_Goods_Given';
import LABEL_GROSS_PROFIT from '@salesforce/label/c.Gross_Profit';
import LABEL_LISTING_FEE from '@salesforce/label/c.Listing_Fee';
import LABEL_NUMBEROFQUARTERS from '@salesforce/label/c.NumberOfQuarters';
import LABEL_PAID from '@salesforce/label/c.Paid';
import LABEL_PAYMENTS from '@salesforce/label/c.Payments';
import LABEL_PLANNED from '@salesforce/label/c.Planned';
import LABEL_PLANNED_VOLUME from '@salesforce/label/c.Planned_Volume';
import LABEL_PRINT from '@salesforce/label/c.Factsheet_Print';
import LABEL_PRODUCT from '@salesforce/label/c.Product';
import LABEL_PROMOTIONAL_ACTIVITY from '@salesforce/label/c.Promotional_Activity';
import LABEL_PSASUMMARY from '@salesforce/label/c.PSA_Summary';
import LABEL_REBATE_LIABILITY from '@salesforce/label/c.Rebate_Liability';
import LABEL_REBATE_PERCENT from '@salesforce/label/c.Rebate_Percent';
import LABEL_REBATE_VOLUME from '@salesforce/label/c.Rebate_Volume';
import LABEL_ROI from '@salesforce/label/c.ROI';
import LABEL_QUARTERS_CAPTURED from '@salesforce/label/c.QuartersCaptured';
import LABEL_SPLIT from '@salesforce/label/c.Split';
import LABEL_START_DATE from '@salesforce/label/c.Start_Date';
import LABEL_SUMMARY from '@salesforce/label/c.Summary';
import LABEL_TOTAL from '@salesforce/label/c.Total';
import LABEL_TOTAL_INVESTMENT from '@salesforce/label/c.TotalInvestment';
import LABEL_TRAINING_ADVOCACY from '@salesforce/label/c.Training_and_Advocacy';
import LABEL_VOLUME from '@salesforce/label/c.Volume_Title';
import LABEL_WORKING from '@salesforce/label/c.Working_PleaseWait';

export default class PromotionalSalesAgreementSummary extends NavigationMixin(LightningElement) { 
    labels = {
        account:                { label: LABEL_ACCOUNT },
        actual:                 { label: LABEL_ACTUAL },
        back:                   { label: LABEL_BACK },
        balance:                { label: LABEL_BALANCE },
        customerProfit:         { label: LABEL_CUSTOMER_PROFIT },
        details:                { label: LABEL_DETAILS },
        end:                    { label: LABEL_END_DATE },
        freeGoods:              { label: LABEL_FREE_GOODS },
        listingFee:             { label: LABEL_LISTING_FEE },
        numberOfQuarters:       { label: LABEL_NUMBEROFQUARTERS },
        paid:                   { label: LABEL_PAID },
        payments:               { label: LABEL_PAYMENTS },
        planned:                { label: LABEL_PLANNED },
        print:                  { label: LABEL_PRINT },
        promotionalActivity:    { label: LABEL_PROMOTIONAL_ACTIVITY },
        psaSummary:             { label: LABEL_PSASUMMARY },
        rebateLiability:        { label: LABEL_REBATE_LIABILITY },
        rebatePercent:          { label: LABEL_REBATE_PERCENT },
        roi:                    { label: LABEL_ROI },
        split:                  { label: LABEL_SPLIT },
        start:                  { label: LABEL_START_DATE },
        summary:                { label: LABEL_SUMMARY },
        totalInvestment:        { label: LABEL_TOTAL_INVESTMENT },
        trainingAdvocacy:       { label: LABEL_TRAINING_ADVOCACY },
        total:                  { label: LABEL_TOTAL },
        volume:                 { label: LABEL_VOLUME },
        working:                { message: LABEL_WORKING }
    };
    
    locale = LOCALE;
    timeZone = TIMEZONE;
    
    @api 
    psaId;

    @track
    psaData = [];

    @track 
    columns = [
        { label: LABEL_ACCOUNT, fieldName: 'account', type: 'text', wrapText: true, cellAttributes: { alignment: 'left' }, markets: ['Brazil','Mexico','United Kingdom']},
        { label: LABEL_PRODUCT, fieldName: 'product', type: 'text', wrapText: true,  cellAttributes: { alignment: 'left' }, markets: ['Brazil','Mexico','United Kingdom']},
        { label: LABEL_FREE_GOODS, fieldName: 'freeGoods', type: 'number', cellAttributes: { alignment: 'right' }, markets: ['Mexico']},
        { label: LABEL_FREE_GOODS_GIVEN, fieldName: 'actualFreeGoods', type: 'number', cellAttributes: { alignment: 'right' }, markets: ['Mexico']},
        { label: LABEL_FREE_GOODS_COST, fieldName: 'freeGoodsCost', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Mexico']},
        { label: LABEL_PLANNED_VOLUME, fieldName: 'plannedVolume', type: 'number',cellAttributes: { alignment: 'right' }, markets: ['Brazil','Mexico','United Kingdom']},
        { label: LABEL_DISCOUNTPERCASE, fieldName: 'discount', type: 'currency', cellAttributes: { alignment: 'right'}, markets: ['Mexico','United Kingdom']},
        { label: LABEL_QUARTERS_CAPTURED, fieldName: 'quartersCaptured', type: 'number', cellAttributes: { alignment: 'right' }, markets: ['United Kingdom']},
        { label: LABEL_ACTUAL_VOLUME, fieldName: 'actualVolume', type: 'number', cellAttributes: { alignment: 'right' }, markets: ['Brazil','Mexico','United Kingdom']},
        { label: LABEL_PAYMENTS, fieldName: 'payment', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Brazil','United Kingdom']},
        { label: LABEL_LISTING_FEE, fieldName: 'listingFee', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Mexico', 'United Kingdom']},
        { label: this.listingFeePaidLabel, fieldName: 'listingFeePaid', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Mexico', 'United Kingdom']},
        //{ label: this.listingFeeBalanceLabel, fieldName: 'listingFeeBalance', type: 'currency', cellAttributes: { alignment: 'right' }},
        { label: LABEL_PROMOTIONAL_ACTIVITY, fieldName: 'promotionalActivity', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Mexico', 'United Kingdom']},
        { label: this.promotionalActivityPaidLabel, fieldName: 'promotionalActivityPaid', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Mexico', 'United Kingdom']},
        //{ label: LABEL_TRAINING_ADVOCACY, fieldName: 'trainingAdvocacy', type: 'currency', cellAttributes: { alignment: 'right' }},
        //{ label: this.trainingAdvocacyPaidLabel, fieldName: 'trainingAdvocacyPaid', type: 'currency', cellAttributes: { alignment: 'right' }},    
        { label: LABEL_REBATE_VOLUME, fieldName: 'rebateVolume', type: 'number', cellAttributes: { alignment: 'right' }, markets: ['Mexico']},
        { label: LABEL_REBATE_PERCENT, fieldName: 'rebatePercent', type: 'percent', cellAttributes: { alignment: 'right' }, markets: ['Mexico']},
        { label: LABEL_REBATE_LIABILITY, fieldName: 'rebateLiability', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Mexico']},
        { label: LABEL_GROSS_PROFIT, fieldName: 'totalPSAGP', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Mexico']},
        { label: LABEL_SPLIT, fieldName: 'productSplit', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['Brazil']},
        { label: LABEL_TOTAL_INVESTMENT, fieldName: 'totalInvestment', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['United Kingdom'] },
        { label: this.totalInvestment9lLabel, fieldName: 'totalInvestment9L', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['United Kingdom']},
        { label: this.totalInvestmentActualLabel, fieldName: 'totalInvestmentActual', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['United Kingdom']},
        { label: this.totalInvestmentActual9lLabel, fieldName: 'totalInvestmentActual9L', type: 'currency', cellAttributes: { alignment: 'right' }, markets: ['United Kingdom']},
    ];
    
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        try {
            this.pageRef = currentPageReference;
            this.currentPageReference = currentPageReference;
            console.log('[psasummary.setcurrentpagerefernce] pageref', currentPageReference);
            this.psaId = currentPageReference.state.c__psaId;
            this.loadPSA();
        } catch(ex) {
            console.log('[psaSummary.setCurrentPageReference] exception', ex);
        }
    }

    isWorking = false;
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortBy;

    error;
    wiredPSA;
    thePSA;
    showListingFee = true;
    showPromotionalActivity = true;
    showTrainingAndAdvocacy = true;
    showPayments = true;
    showNumberOfQuarters = false;
    showRebateLiability = false;
    showTotalInvestment = false;
    showCustomerProfit = false;

    /*
    @wire(getPSA, { psaId: '$psaId'} )
    wiredGetPSA(value) {
        this.wiredPSA = value;
        console.log('[summary.getpsa] wiredpsa', this.wiredPSA);
        if (value.data) {
            this.error = undefined;
            this.thePSA = value.data;
            this.buildTableData();
        } else if (value.error) {
            this.error = value.error;
            this.data = undefined;
        }
    }
    */
    loadPSA() {
        getPSA({psaId: this.psaId})
        .then(result => {
            this.error = undefined;
            this.thePSA = result;
            this.buildTableData();
        })
        .catch(error => {
            this.error = error;
            console.log('[psaSummary.loadPSA] error', error);
            this.data = undefined;
        });
    }

    get listingFeePaidLabel() {
        return `${LABEL_LISTING_FEE} (${LABEL_PAID})`;
    }
    get listingFeeBalanceLabel() {
        return `${LABEL_LISTING_FEE} (${LABEL_BALANCE})`;
    }
    get promotionalActivityPaidLabel() {
        return `${LABEL_PROMOTIONAL_ACTIVITY} (${LABEL_PAID})`;
    }
    get trainingAdvocacyPaidLabel() {
        return `${LABEL_TRAINING_ADVOCACY} (${LABEL_PAID})`;
    }
    get totalInvestment9lLabel() {
        return `${LABEL_TOTAL_INVESTMENT} (9L)`;
    }
    get totalInvestmentActualLabel() {
        return `${LABEL_TOTAL_INVESTMENT} (${LABEL_ACTUAL})`;
    }
    get totalInvestmentActual9lLabel() {
        return `${LABEL_TOTAL_INVESTMENT} (${LABEL_ACTUAL} 9L)`
    }

    get marketName() {
        return this.thePSA == undefined || this.thePSA.Market__r == undefined ? '' : this.thePSA.Market__r.Name;
    }
    get psaName() {
        return this.thePSA == undefined ? '' : this.thePSA.Name;
    }
    get startDate() {
        console.log('[summary.startDate] timezone', this.timeZone);
        return this.thePSA == undefined ? null : this.thePSA.Begin_Date__c;
    }
    get formattedStartDate() {
        console.log('[summary.formattedStartDate] startdate', this.startDate);
        let sdate = new Date();
        if (this.startDate) {
            const dateParts = this.startDate.split('-');
            const year = dateParts[0];
            const month = dateParts[1] - 1;
            const day = dateParts[2];
            console.log('[summary.formattedStartDate] dateParts, year, month, day', dateParts, year, month, day);

            sdate = new Date(year, month, day);
        }
        console.log('[summary.formattedStartDate] sdate', sdate);
        //return day + '-' + month + '-' + year;
        return sdate.toLocaleDateString(LOCALE, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    }
    get endDate() {
        return this.thePSA == undefined ? null : this.thePSA.End_Date__c;
    }
    get formattedEndDate() {
        console.log('[summary.formattedEndDate] enddate', this.endDate);
        let sdate = new Date();
        if (this.endDate) {
            const dateParts = this.endDate.split('-');
            const year = dateParts[0];
            const month = dateParts[1] - 1;
            const day = dateParts[2];
            console.log('[summary.formattedEndDate] dateParts, year, month, day', dateParts, year, month, day);

            sdate = new Date(year, month, day);
        }
        console.log('[summary.formattedStartDate] sdate', sdate);
        return sdate.toLocaleDateString(LOCALE, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'});
    }
    get totalFreeGoodsPlanned() {
        return parseInt(this.thePSA.Total_Free_Bottle_Quantity__c);
    }
    get totalFreeGoodsActual() {
        return parseInt(this.thePSA.Total_Actual_Free_Bottle_Qty__c);
    }
    get totalFreeGoodsBalance() {
        return this.totalFreeGoodsPlanned - this.totalFreeGoodsActual;
    }
    get totalVolume() {
        let val = 0;
        if (this.thePSA != undefined) {
            if (this.captureVolumeInBottles) {
                val = parseFloat(this.thePSA.Total_Volume_Bottles__c);
            } else {
                val = parseFloat(this.thePSA.Total_Volume__c);
            }
        }
        //return this.thePSA == undefined ? null : parseFloat(this.thePSA.Total_Volume__c);
        return val;
    }
    get totalActualVolume() {
        let val = 0;
        if (this.thePSA != undefined) {
            if (this.captureVolumeInBottles) {
                val = parseFloat(this.thePSA.Total_Actual_Volume_Bottles__c);
            } else {
                val = parseFloat(this.thePSA.Total_Actual_Volume__c);
            }
        }
        //return this.thePSA == undefined ? null : parseFloat(this.thePSA.Total_Volume__c);
        return val;
//        return this.thePSA == undefined || this.thePSA.Total_Actual_Volume__c == undefined ? null : parseFloat(this.thePSA.Total_Actual_Volume__c);
    }
    get volumeBalance() {
        const v = this.totalVolume - (this.totalActualVolume == null ? 0 : this.totalActualVolume);
        console.log('[volumebalance] v, totalvolume, totalactualvolume', v, this.totalVolume, this.totalActualVolume);
        return v;
    }
    get activityBudget() {
        return this.thePSA == undefined ? null : parseFloat(this.thePSA.Activity_Budget__c);
    }
    get paymentsPaid() {
        return this.thePSA == undefined ? null : parseFloat(this.thePSA.Total_Payments_Paid__c);
    }
    get paymentsBalance() {
        let v = this.activityBudget - (this.paymentsPaid == null ? 0 : this.paymentsPaid);
        console.log('paymentsBalance', v);
        console.log('activityBudget', this.activityBudget);
        console.log('paymentsPaid', this.paymentsPaid);
        return v;
    }
    get listingFee() {
        return this.thePSA == undefined ? null : parseFloat(this.thePSA.Total_Listing_Fee__c);
    }
    get listingFeePaid() {
        return this.thePSA == undefined || this.thePSA.Total_Listing_Fee_Paid__c == undefined ? null : parseFloat(this.thePSA.Total_Listing_Fee_Paid__c);
    }
    get listingFeeBalance() {
        return this.listingFee - (this.listingFeePaid == null ? 0 : this.listingFeePaid);
    }
    get promotionalActivity() {
        return this.thePSA == undefined ? null : parseFloat(this.thePSA.Total_Promotional_Activity__c);
    }
    get promotionalActivityPaid() {
        return this.thePSA == undefined || this.thePSA.Total_Promotional_Activity_Paid__c == undefined ? null : parseFloat(this.thePSA.Total_Promotional_Activity_Paid__c);
    }
    get promotionalActivityBalance() {
        return this.promotionalActivity - (this.promotionalActivityPaid == null ? 0 : this.promotionalActivityPaid);
    }
    get trainingAdvocacy() {
        return this.thePSA == undefined ? null : parseFloat(this.thePSA.Total_Training_and_Advocacy__c);
    }
    get trainingAdvocacyPaid() {
        return this.thePSA == undefined || this.thePSA.Total_Training_and_Advocacy_Paid__c == undefined ? null : parseFloat(this.thePSA.Total_Training_and_Advocacy_Paid__c);
    }
    get trainingAdvocacyBalance() {
        return this.trainingAdvocacy - (this.trainingAdvocacyPaid == null ? 0 : this.trainingAdvocacyPaid);
    }
    get totalBudget() {
        return this.thePSA == undefined || this.thePSA.Activity_Budget__c == undefined ? 0 : parseFloat(this.thePSA.Activity_Budget__c);
    }
    get totalPlannedSpend() {
        return this.thePSA == undefined || this.thePSA.Total_Planned_Spend__c == undefined ? 0 : parseFloat(this.thePSA.Total_Planned_Spend__c);
    }
    get captureVolumeInBottles() {
        return this.thePSA == undefined || this.thePSA.Market__r == undefined || this.thePSA.Market__r.Capture_Volume_in_Bottles__c == undefined ? false : this.thePSA.Market__r.Capture_Volume_in_Bottles__c;
    }
    get showProductSplit() {
        return this.thePSA == undefined || this.thePSA.Market__r == undefined || this.thePSA.Market__r.Calculate_PSA_Product_Split__c == undefined ? false : this.thePSA.Market__r.Calculate_PSA_Product_Split__c;
    }
    get showFreeGoods() {
        return this.thePSA == undefined || this.thePSA.Market__r == undefined || this.thePSA.Market__r.Capture_PSA_Free_Goods__c == undefined ? false : this.thePSA.Market__r.Capture_PSA_Free_Goods__c;
    }
    get totalInvestment() {
        return this.thePSA == undefined || this.thePSA.Total_Investment__c == null ? 0 : this.thePSA.Total_Investment__c;
    }
    get totalRebateLiability() {
        return this.thePSA == undefined || this.thePSA.Total_Rebate_Liability__c == null ? 0 : this.thePSA.Total_Rebate_Liability__c;
    }
    get totalFreeGoodCost() {
        return this.thePSA == undefined || this.thePSA.Total_Free_Bottle_Cost__c == null ? 0 : this.thePSA.Total_Free_Bottle_Cost__c;
    }
    get customerProfit() {
        return this.thePSA == undefined || this.thePSA.Total_Customer_Profit__c == null ? 0 : this.thePSA.Total_Customer_Profit__c;
    }
    get roi() {
        return this.thePSA == undefined || this.thePSA.Total_Return_on_Investment__c == null ? 0 : this.thePSA.Total_Return_on_Investment__c;
    }


    /**
     * Handle local events
     */
    handleCancelButtonClick(event) {
        console.log('[handleCancelButtonClick]');
        try {
            this.isWorking = true;
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: this.psaId,
                objectApiName: 'Promotion_Activity__c',
                actionName: 'view'
            }
        }, true);
        }catch(ex) {
            console.log('[handelCancelButtonClick] exception', ex);
            if (this.isPhone && this.isThisTass) {
                alert('[psaItem.handlecancel] exception', ex);
            }
        }
    }
    handlePrintButtonClick() {        
        window.print();
    }

    handleOnSort(event) {
        try {
            const { fieldName: sortedBy, sortDirection } = event.detail;
            const clonedData = [...this.psaData];

            console.log('[summary.handleonsort] sortedby, sortDirection', sortedBy, sortDirection);
            clonedData.sort(function(a, b) {
                var aval = a[sortedBy];
                var bval = b[sortedBy];
                let reverse = sortDirection === 'asc' ? 1 : -1;
                return reverse * ((aval > bval) - (bval > aval));
            });
            this.psaData = clonedData;
            this.sortDirection = sortDirection;
            this.sortedBy = sortedBy;
        }catch(ex) {
            console.log('[summary.handleonsort] exception', ex);
        }
    }

    /**
     * Helper functions
     */
    /*
    sortBy(field, reverse, primer) {
        const key = primer
            ? function(x) {
                  return primer(x[field]);
              }
            : function(x) {
                  return x[field];
              };

        console.log('[summary.sortby] key, primer', key, primer);
        return function(a, b) {
            console.log('[summary.sortby] key(a), key(b)', key(a), key(b));
            a = key(a);
            b = key(b);
            return reverse * ((a > b) - (b > a));
        };
    }
    */
    buildTableData() {
        //const accountsMap = new Map();

       // if (this.thePSA.Promotions__r && this.thePSA.Promotions__r.length > 0) {
       //     this.thePSA.Promotions__r.forEach(p => {                            
        //console.log('[summary.buildtabledata] promotion', p);
        console.log('[summary.buildTableData] thePSA', this.thePSA);
        this.showPayments = false;
        this.showListingFee = true;
        this.showTrainingAndAdvocacy = true;
        this.showPromotionalActivity = true;
        this.showNumberOfQuarters = false;
        this.showRebateLiability = false;
        this.showTotalInvestment = false;
        this.showCustomerProfit = false;
        console.log('[summary.buildTableData] columns', this.columns);
        console.log('[summary.buildTableData] market name', this.thePSA.Market__r.Name);
        var cols = [...this.columns.filter(c => c.markets.includes(this.thePSA.Market__r.Name))];
        console.log('[summary.buildTableData] showFreeGoods', this.showFreeGoods);
        if (!this.showFreeGoods) {
            //cols = cols.filter(c => c.fieldName.indexOf('freeGoods') < 0);
        }
        if (this.marketName == 'Brazil') {
            this.showPromotionalActivity = false;
            this.showTrainingAndAdvocacy = false;
            this.showListingFee = false;
            this.showPayments = true
            //cols = cols.filter(c => c.fieldName.indexOf('listingFee') < 0 && c.fieldName.indexOf('promotionalActivity') < 0 && c.fieldName.indexOf('totalInvestment') < 0);
            //cols = cols.filter(c => c.fieldName != 'discount');
        }
        if (this.marketName == 'Mexico') {
            this.showRebateLiability = true;
            this.showTotalInvestment = true;
            this.showCustomerProfit = true;
            //cols = cols.filter(c => c.fieldName != 'discount');
            //cols = cols.filter(c => c.fieldName.indexOf('totalInvestment') < 0);
        } else {
            //cols = cols.filter(c => c.fieldName != 'rebatePercent');
            //cols = cols.filter(c => c.fieldName != 'rebateLiability');
            //cols = cols.filter(c => c.fieldName != 'rebateVolume');
            //cols = cols.filter(c => c.fieldName != 'totalRebateGP');
        }
        if (this.marketName == 'United Kingdom') {
            this.showNumberOfQuarters = true;            
        } else {
            this.showTrainingAndAdvocacy = false;
            //cols = cols.filter(c => c.fieldName != 'quartersCaptured');
        }
        
        if (!this.showProductSplit) {
            //cols = cols.filter(c => c.fieldName != 'productSplit' && c.fieldName != 'payment');
        }
       
        console.log('[summary.buildTableData] cols', cols);
        this.columns = [...cols];
        this.isWorking = true;
        const account = { id: this.thePSA.Account__c, 
                            name: this.thePSA.Account__r.Name, 
                            freeGoods: this.thePSA.Total_Free_Bottle_Quantity__c,
                            freeGoodsGiven: this.thePSA.Total_Actual_Free_Bottle_Qty__c,
                            actualVolume: this.totalActualVolume,
                            plannedVolume: 0,
                            listingFee: 0,
                            listingFeePaid: parseFloat(this.thePSA.Total_Listing_Fee_Paid__c),
                            promotionalActivity: 0,
                            promotionalActivityPaid: parseFloat(this.thePSA.Total_Promotional_Activity_Paid__c),
                            trainingAdvocacy: 0,
                            trainingAdvocacyPaid: parseFloat(this.thePSA.Total_Training_and_Advocacy_Paid__c),
                            pmi: new Map() };                
                
        var packQty = 1;
        if (this.thePSA.Promotion_Material_Items__r && this.thePSA.Promotion_Material_Items__r.length > 0) {
            this.thePSA.Promotion_Material_Items__r.forEach((pmi, index) => {
                console.log('[summary.buildtabledata] pmi, index', pmi, index);
                
                if (pmi.Plan_Volume__c != undefined) {
                    if (this.captureVolumeInBottles) {
                        packQty = pmi.Product_Pack_Qty__c == undefined ? 1 : pmi.Product_Pack_Qty__c;
                        account.plannedVolume += (pmi.Plan_Volume__c * packQty);
                    } else {
                        account.plannedVolume += pmi.Plan_Volume__c;
                    }
                }
                if (pmi.Listing_Fee__c != undefined) {
                    account.listingFee += pmi.Listing_Fee__c;
                }
                if (pmi.Promotional_Activity__c != undefined) {
                    account.promotionalActivity += pmi.Promotional_Activity__c;                            
                }
                if (pmi.Training_and_Advocacy__c != undefined) {
                    account.trainingAdvocacy += pmi.Training_and_Advocacy__c;
                }

                account.pmi.set(pmi.Id, {
                    id: pmi.Id, 
                    product: pmi.Product_Name__c, 
                    plannedFreeGoods: parseInt(pmi.Free_Bottle_Quantity__c),
                    actualFreeGoods: parseInt(pmi.Total_Actual_Free_Bottle_Qty__c),
                    plannedVolume: parseFloat(pmi.Plan_Volume__c),
                    actualVolume: parseFloat(pmi.Total_Actual_Volume__c),
                    discount: parseFloat(pmi.Plan_Rebate__c),
                    listingFee: parseFloat(pmi.Listing_Fee__c),
                    listingFeePaid: parseFloat(pmi.Total_Listing_Fee_Paid__c),
                    promotionalActivity: parseFloat(pmi.Promotional_Activity_Value__c),
                    promotionalActivityPaid: parseFloat(pmi.Total_Promotional_Activity_Paid__c),
                    trainingAdvocacy: parseFloat(pmi.Training_and_Advocacy_Value__c),
                    trainingAdvocacyPaid: parseFloat(pmi.Total_Training_and_Advocacy_Paid__c),
                    totalInvestment: parseFloat(pmi.Total_Investment__c),
                    packQuantity: parseInt(pmi.Product_Pack_Qty__c),
                    grossProfit: parseFloat(pmi.Product_Custom__r.Gross_Profit_per_Case__c==undefined ? 0 : pmi.Product_Custom__r.Gross_Profit_per_Case__c),
                    rebateVolume: parseFloat(pmi.Plan_Rebate_Volume__c),
                    rebateLiability: parseFloat(pmi.Plan_Rebate_Liability__c),
                    rebatePercent: (parseFloat(pmi.Plan_Rebate_Percentage__c)/100),
                    totalPSAGP: parseFloat(pmi.Plan_PSA_Gross_Profit__c),
                    payment: parseFloat(pmi.Total_Payments_Paid__c),
                    productSplit: parseFloat(pmi.Product_Split__c),
                    freeGoodsCost: parseFloat(pmi.PSA_Free_Bottle_Cost__c == undefined ? 0 : pmi.PSA_Free_Bottle_Cost__c).toFixed(2)
                });
            });
        }

        //accountsMap.set(p.Id, account);
            //});
        //}

        //console.log('[summary.buildtabledata] accountsMap', accountsMap);
        /*
        if (this.thePSA.PMI_Actuals__r && this.thePSA.PMI_Actuals__r.length > 0) {
            this.thePSA.PMI_Actuals__r.forEach(pmia => {
                console.log('[summary.buildtabledata] pmia', pmia);
                //let account = accountsMap.get(pmia.Promotion__c);
                let pmi = account.pmi.get(pmia.Promotion_Material_Item__c);
                if (pmia.Act_Qty__c != undefined) {
                    pmi.actualVolume = (pmi.actualVolume == undefined ? 0 : pmi.actualVolume) + parseFloat(pmia.Act_Qty__c);
                }
                if (pmia.Listing_Fee__c != undefined) {
                    pmi.listingFeePaid = (pmi.listingFeePaid == undefined ? 0 : pmi.listingFeePaid) + parseFloat(pmia.Listing_Fee__c);
                }
                if (pmia.Promotional_Activity__c != undefined) {
                    pmi.promotionalActivityPaid = (pmi.promotionalActivityPaid == undefined ? 0 : pmi.promotionalActivityPaid) + parseFloat(pmia.Promotional_Activity__c);
                }
                if (pmia.Training_and_Advocacy__c != undefined) {
                    pmi.trainingAdvocacyPaid = (pmi.trainingAdvocacyPaid == undefined ? 0 : pmi.trainingAdvocacyPaid) + parseFloat(pmia.Training_and_Advocacy__c);
                }
                account.pmi.set(pmia.Promotion_Material_Item__c, pmi);
                console.log('[summary.buildtabledata] newPMI', pmi);
            });            
        }
        */
        const data = [];
        let index = 0;
        var volume = 0;
        var actualVolume = 0;
        //accountsMap.forEach((account, key, map) => {
            console.log('[summary.buildtabledata] account', account);
            index = 0;
            account.pmi.forEach(pmi => {
                const row = { id: account.id + '_' + pmi.id };

                if (index == 0) {
                    row.account = account.name;
                } else {
                    row.account = '';
                } 
                row.product = pmi.product;

                row.freeGoods = pmi.plannedFreeGoods;
                row.actualFreeGoods = pmi.actualFreeGoods;
                volume = pmi.plannedVolume;
                actualVolume = pmi.actualVolume;
                if (this.captureVolumeInBottles) {
                    volume = pmi.plannedVolume * pmi.packQuantity;
                    actualVolume = pmi.actualVolume * pmi.packQuantity;
                }
                row.plannedVolume = volume;
                row.discount = pmi.discount;
                row.listingFee = pmi.listingFee;
                row.promotionalActivity = pmi.promotionalActivity;
                row.trainingAdvocacy = pmi.trainingAdvocacy;
                row.actualVolume = actualVolume; 
                row.listingFeePaid = pmi.listingFeePaid;
                row.promotionalActivityPaid = pmi.promotionalActivityPaid;
                row.trainingAdvocacyPaid = pmi.trainingAdvocacyPaid;
                row.totalInvestment = pmi.totalInvestment;
                row.rebateLiability = pmi.rebateLiability;
                row.rebateVolume = pmi.rebateVolume;
                row.rebatePercent = pmi.rebatePercent;
                row.totalPSAGP = pmi.totalPSAGP;
                row.payment = pmi.payment;
                row.productSplit = pmi.productSplit;
                row.freeGoodsCost = pmi.freeGoodsCost;

                row.quartersCaptured = 0;  // Need to calculate or capture how many quarters are captured
                row.listingFeeBalance = row.listingFee - row.listingFeePaid;
                row.totalInvestment9L = row.totalInvestment / row.plannedVolume;
                
                if (row.actualVolume != undefined && row.actualVolume > 0) {
                    row.totalInvestmentActual = (row.actualVolume * row.discount) + row.listingFee + row.promotionalActivity + row.trainingAdvocacy;
                    row.totalInvestmentActual9L = row.actualVolume > 0 ? row.totalInvestmentActual / row.actualVolume : 0;    
                }
        
                //const nineLtrCases = pmi.plannedVolume / 9;
                //const plannedPrice = nineLtrCases * pmi.grossProfit;
                //row.productSplit = (plannedPrice / this.totalPlannedSpend) * this.totalBudget;
                //console.log('9ltr cases: ' + nineLtrCases);
                //console.log('plannedPrice: ' + plannedPrice);
                console.log('grossProfit: ' + pmi.grossProfit);
                console.log('totalBudget: ' + this.totalBudget);
                console.log('totalPlannedSpend: ' + this.totalPlannedSpend);

                data.push(row);
                index++;
            });

            /*
            const accountRow = { id: account.id,
                                 account: account.name, 
                                 product: 'TOTALS',
                                 plannedVolume: account.plannedVolume,
                                 actualVolume: account.actualVolume,
                                 listingFee: account.listingFee,
                                 listingFeePaid: account.listingFeePaid,
                                 promotionalActivity: account.promotionalActivity,
                                 promotionalActivityPaid: account.promotionalActivityPaid,
                                 trainingAdvocacy: account.trainingAdvocacy,
                                 trainingAdvocacyPaid: account.trainingAdvocacyPaid };
            data.push(accountRow);
            */
        //});
        
        this.psaData = data;
        console.log('[summary.buildtabledata] data', data);
        this.isWorking = false;
    }

}