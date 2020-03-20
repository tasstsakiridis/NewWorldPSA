import { LightningElement, api, track, wire } from 'lwc';

import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';

import LABEL_CANCEL from '@salesforce/label/c.Cancel';
import LABEL_START_DATE from '@salesforce/label/c.Start_Date';
import LABEL_END_DATE from '@salesforce/label/c.End_Date';
import LABEL_PSASUMMARY from '@salesforce/label/c.PSA_Summary';
import LABEL_ACCOUNT from '@salesforce/label/c.Account';
import LABEL_NUMBEROFQUARTERS from '@salesforce/label/c.NumberOfQuarters';
import LABEL_PRODUCT from '@salesforce/label/c.Product';
import LABEL_PLANNED_VOLUME from '@salesforce/label/c.Planned_Volume';
import LABEL_DISCOUNTPERCASE from '@salesforce/label/c.Discount_per_9LCase';
import LABEL_QUARTERS_CAPTURED from '@salesforce/label/c.QuartersCaptured';
import LABEL_ACTUAL_VOLUME from '@salesforce/label/c.ActualVolume';
import LABEL_LISTING_FEE from '@salesforce/label/c.Listing_Fee';
import LABEL_PROMOTIONAL_ACTIVITY from '@salesforce/label/c.Promotional_Activity';
import LABEL_TRAINING_ADVOCACY from '@salesforce/label/c.Training_and_Advocacy';
import LABEL_BALANCE from '@salesforce/label/c.Balance';
import LABEL_PAID from '@salesforce/label/c.Paid';
import LABEL_SUMMARY from '@salesforce/label/c.Summary';
import LABEL_TOTAL_INVESTMENT from '@salesforce/label/c.TotalInvestment';
import LABEL_ACTUAL from '@salesforce/label/c.Actual';

export default class PromotionalSalesAgreementSummary extends LightningElement { 
    labels = {
        cancel: { label: LABEL_CANCEL },
        start: { label: LABEL_START_DATE },
        end: { label: LABEL_END_DATE },
        account: { label: LABEL_ACCOUNT },
        psaSummary: { label: LABEL_PSASUMMARY },
        numberOfQuarters: { label: LABEL_NUMBEROFQUARTERS },
        summary: { label: LABEL_SUMMARY },
        volume: { label: 'Volume' },
        planned: { label: 'Planned' },
        actual: { label: LABEL_ACTUAL },
        listingFee: { label: LABEL_LISTING_FEE },
        promotionalActivity: { label: LABEL_PROMOTIONAL_ACTIVITY },
        trainingAdvocacy: { label: LABEL_TRAINING_ADVOCACY },
        balance: { label: LABEL_BALANCE },
        total: { label: 'Total' },
        paid: { label: LABEL_PAID },
        details: { label: 'Details' }        
    };
    
    @api 
    psaId;

    @track
    psaData = [];

    @track 
    columns = [
        { label: LABEL_ACCOUNT, fieldName: 'account', type: 'text', wrapText: true, cellAttributes: { alignment: 'left' }},
        { label: LABEL_PRODUCT, fieldName: 'product', type: 'text', wrapText: true,  cellAttributes: { alignment: 'left' }},
        { label: LABEL_PLANNED_VOLUME, fieldName: 'plannedVolume', type: 'number',cellAttributes: { alignment: 'right' }},
        { label: LABEL_DISCOUNTPERCASE, fieldName: 'discount', type: 'currency', cellAttributes: { alignment: 'right'}},
        { label: LABEL_QUARTERS_CAPTURED, fieldName: 'quartersCaptured', type: 'number', cellAttributes: { alignment: 'right' }},
        { label: LABEL_ACTUAL_VOLUME, fieldName: 'actualVolume', type: 'number', cellAttributes: { alignment: 'right' }},
        { label: LABEL_LISTING_FEE, fieldName: 'listingFee', type: 'currency', cellAttributes: { alignment: 'right' }},
        { label: this.listingFeePaidLabel, fieldName: 'listingFeePaid', type: 'currency', cellAttributes: { alignment: 'right' }},
        //{ label: this.listingFeeBalanceLabel, fieldName: 'listingFeeBalance', type: 'currency', cellAttributes: { alignment: 'right' }},
        { label: LABEL_PROMOTIONAL_ACTIVITY, fieldName: 'promotionalActivity', type: 'currency', cellAttributes: { alignment: 'right' }},
        { label: this.promotionalActivityPaidLabel, fieldName: 'promotionalActivityPaid', type: 'currency', cellAttributes: { alignment: 'right' }},
        //{ label: LABEL_TRAINING_ADVOCACY, fieldName: 'trainingAdvocacy', type: 'currency', cellAttributes: { alignment: 'right' }},
        //{ label: this.trainingAdvocacyPaidLabel, fieldName: 'trainingAdvocacyPaid', type: 'currency', cellAttributes: { alignment: 'right' }},    
        { label: LABEL_TOTAL_INVESTMENT, fieldName: 'totalInvestment', type: 'currency', cellAttributes: { alignment: 'right' } },
        { label: this.totalInvestment9lLabel, fieldName: 'totalInvestment9L', type: 'currency', cellAttributes: { alignment: 'right' }},
        { label: this.totalInvestmentActualLabel, fieldName: 'totalInvestmentActual', type: 'currency', cellAttributes: { alignment: 'right' }},
        { label: this.totalInvestmentActual9lLabel, fieldName: 'totalInvestmentActual9L', type: 'currency', cellAttributes: { alignment: 'right' }},
    ];
    
    defaultSortDirection = 'asc';
    sortDirection = 'asc';
    sortBy;

    error;
    wiredPSA;
    thePSA;
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

    get psaName() {
        return this.thePSA == undefined ? '' : this.thePSA.Name;
    }
    get startDate() {
        return this.thePSA == undefined ? null : this.thePSA.Begin_Date__c;
    }
    get endDate() {
        return this.thePSA == undefined ? null : this.thePSA.End_Date__c;
    }
    get totalVolume() {
        return this.thePSA == undefined ? null : parseFloat(this.thePSA.Total_Volume__c);
    }
    get totalActualVolume() {
        return this.thePSA == undefined || this.thePSA.Total_Actual_Volume__c == undefined ? null : parseFloat(this.thePSA.Total_Actual_Volume__c);
    }
    get volumeBalance() {
        const v = this.totalVolume - (this.totalActualVolume == null ? 0 : this.totalActualVolume);
        console.log('[volumebalance] v, totalvolume, totalactualvolume', v, this.totalVolume, this.totalActualVolume);
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

    /**
     * Handle local events
     */
    handleCancelButtonClick(event) {
        console.log('[handleCancelButtonClick]');
        try {
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
        const accountsMap = new Map();

        if (this.thePSA.Promotions__r && this.thePSA.Promotions__r.length > 0) {
            this.thePSA.Promotions__r.forEach(p => {                            
                console.log('[summary.buildtabledata] promotion', p);
                const account = { id: p.Id, 
                                  name: p.AccountName__c, 
                                  actualVolume: parseFloat(p.Total_Actual_Qty__c),
                                  plannedVolume: 0,
                                  listingFee: 0,
                                  listingFeePaid: parseFloat(p.Total_Listing_Fee_Paid__c),
                                  promotionalActivity: 0,
                                  promotionalActivityPaid: parseFloat(p.Total_Promotional_Activity_Paid__c),
                                  trainingAdvocacy: 0,
                                  trainingAdvocacyPaid: parseFloat(p.Total_Training_and_Advocacy_Paid__c),
                                  pmi: new Map() };                
                
                if (this.thePSA.Promotion_Material_Items__r && this.thePSA.Promotion_Material_Items__r.length > 0) {
                    this.thePSA.Promotion_Material_Items__r.forEach((pmi, index) => {
                        console.log('[summary.buildtabledata] pmi, index', pmi, index);

                        if (pmi.Plan_Volume__c != undefined) {
                            account.plannedVolume += pmi.Plan_Volume__c;
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
                            plannedVolume: parseFloat(pmi.Plan_Volume__c),
                            discount: parseFloat(pmi.Plan_Rebate__c),
                            listingFee: parseFloat(pmi.Listing_Fee__c),
                            promotionalActivity: parseFloat(pmi.Promotional_Activity_Value__c),
                            trainingAdvocacy: parseFloat(pmi.Training_and_Advocacy_Value__c),
                            totalInvestment: parseFloat(pmi.Total_Investment__c)
                        });
                    });
                }

                accountsMap.set(p.Id, account);
            });
        }

        console.log('[summary.buildtabledata] accountsMap', accountsMap);
        if (this.thePSA.PMI_Actuals__r && this.thePSA.PMI_Actuals__r.length > 0) {
            this.thePSA.PMI_Actuals__r.forEach(pmia => {
                console.log('[summary.buildtabledata] pmia', pmia);
                let account = accountsMap.get(pmia.Promotion__c);
                let pmi = account.pmi.get(pmia.Promotion_Material_Item__c);
                /*
                const newPMI = {...pmi};
                newPMI.actualVolume += pmia.Act_Qty__c;
                newPMI.listingFeePaid += pmia.Listing_Fee__c;
                newPMI.promotionalActivityPaid += pmia.Promotional_Activity__c;
                newPMI.trainingAndAdvocacyPaid += pmia.Training_and_Advocacy__c;
                */
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

        const data = [];
        let index = 0;
        accountsMap.forEach((account, key, map) => {
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
                row.plannedVolume = pmi.plannedVolume;
                row.discount = pmi.discount;
                row.listingFee = pmi.listingFee;
                row.promotionalActivity = pmi.promotionalActivity;
                row.trainingAdvocacy = pmi.trainingAdvocacy;
                row.actualVolume = pmi.actualVolume; 
                row.listingFeePaid = pmi.listingFeePaid;
                row.promotionalActivityPaid = pmi.promotionalActivityPaid;
                row.trainingAdvocacyPaid = pmi.trainingAdvocacyPaid;
                row.totalInvestment = pmi.totalInvestment;

                row.quartersCaptured = 0;  // Need to calculate or capture how many quarters are captured
                row.listingFeeBalance = row.listingFee - row.listingFeePaid;
                row.totalInvestment9L = row.totalInvestment / row.plannedVolume;
                
                if (row.actualVolume != undefined && row.actualVolume > 0) {
                    row.totalInvestmentActual = (row.actualVolume * row.discount) + row.listingFee + row.promotionalActivity + row.trainingAdvocacy;
                    row.totalInvestmentActual9L = row.actualVolume > 0 ? row.totalInvestmentActual / row.actualVolume : 0;    
                }
        
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
        });
        
        this.psaData = data;
        console.log('[summary.buildtabledata] data', data);
    }

}