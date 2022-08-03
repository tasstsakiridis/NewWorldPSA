/**
 * Test Class:  Mexico_PSA_Contract_Controller_Test
 */
public with sharing class Mexico_PSA_Contract_Controller {
    public class pmiItem {
        public Integer index { get; set; }
        public String productName { get; set; }
        public Decimal rebatePercentage { get; set; }
        public Decimal planVolumeBottles { get; set; }
        public Decimal planVolumeLiability { get; set; }
        public Decimal rebateLiability { get; set; }
        public Decimal freeBottleVolume { get; set; }
        public Decimal freeBottleCost { get; set; }
        public Date freeGoodsGivenDate { get; set; }
        public String freeGoodsReason { get; set; }
    }
    public class payment {
        public Integer paymentNumber { get; set; }
        public Decimal paymentPercentage { get; set; }
        public Decimal paymentAmount { get; set; }
    }

    public Promotion_Activity__c thePSA;
    public void setThePSA(Promotion_Activity__c pa) {
        thePSA = [SELECT Id, Name, RecordTypeId, RecordType.Name, Status__c, Market__c, Market_Filter__c, Account__c, Account__r.Name, Account__r.English_Name__c,
                         Total_Listing_Fee__c, Account__r.ShippingStreet, Account__r.ILN_Code__c, Account__r.Tax_Number_PL__c,
                         Number_of_Payments__c, Begin_Date__c, End_Date__c, Is_Length_in_Years__c, Length_of_Agreement__c, CreatedDate,
                         CreatedById, CreatedBy.Name, CreatedBy.MobilePhone, CreatedBy.Email, Contact__c, Contact__r.Name, Contact__r.MobilePhone, Contact__r.Email,
                  		 Activity_Budget__c, Account__r.Owner.Name, Account__r.Owner.Manager.Name, Account__r.ShippingPostalCode, Date_Approved__c,
                           Percentage_Visibility__c, Account__r.Payment_Account__c, Account__r.Payment_Account_Bank__c, Account__r.Payment_Account_Agency__c,
                           Sales_Proposal_Id__c, Account__r.RFC__c, Account__r.ShippingCity, Account__r.ShippingState, Total_Volume_Bottles__c, Total_Rebate_Volume__c,
                           Payment_Configurations__c,
                  	(SELECT Id, Name, Product__c, Product_Name__c, Plan_Volume__c, Plan_Volume_Bottles__c, Plan_Rebate_Liability__c, Free_Goods_Reason__c, 
                            Free_Goods_Given_Date__c, Free_Bottle_Quantity__c, PSA_Free_Bottle_Cost__c, Product_Custom__r.Price__c, Plan_Rebate_Percentage__c,
                            Brand_Status__c, Listing_Fee__c, Promotional_Activity__c 
                       FROM Promotion_Material_Items__r)
           		    FROM Promotion_Activity__c 
		            WHERE Id =:pa.Id];

        numberOfProducts = thePSA.Promotion_Material_Items__r.size();
        ownerName = thePSA.Account__r.Owner.Name;
        ownerManagerName = thePSA.Account__r.Owner.Manager.Name;
        numberOfPayments = Integer.valueOf(thePSA.Number_of_Payments__c);
        
        Integer ctr = 1;
        totalRebateLiability = 0;
        promotionMaterialItems = new List<pmiItem>();
        mustStockProducts = new List<Promotion_Material_Item__c>();
        payments = new List<payment>();

        Decimal totalListingFee = thePSA.Total_Listing_Fee__c == null ? 0 : thePSA.Total_Listing_Fee__c;
        if (String.isNotEmpty(thePSA.Payment_Configurations__c) && numberOfPayments > 1 && totalListingFee > 0) {
            String[] configurations = thePSA.Payment_Configurations__c.split(',');
            for(String config : configurations) {
                payment p = new payment();
                p.paymentNumber = ctr;
                p.paymentPercentage = Decimal.valueOf(config);
                p.paymentAmount = (Decimal.valueOf(config) / 100) * totalListingFee;

                payments.add(p);
                ctr++;
            }
        }

        totalVolumeLiability = 0;
        totalRebateLiability = 0;
        ctr = 1;
        for(Promotion_Material_Item__c pmi : thePSA.Promotion_Material_Items__r) {            
            pmiItem item = new pmiItem();
            item.index = ctr;
            item.productName = pmi.Product_Name__c;
            item.rebatePercentage = pmi.Plan_Rebate_Percentage__c;
            item.planVolumeBottles = pmi.Plan_Volume_Bottles__c;
            item.planVolumeLiability = (item.planVolumeBottles * (item.rebatePercentage / 100)).round();
            item.rebateLiability = item.planVolumeBottles * pmi.Product_Custom__r.Price__c;
            item.freeBottleVolume = pmi.Free_Bottle_Quantity__c;
            item.freeBottleCost = pmi.PSA_Free_Bottle_Cost__c;
            item.freeGoodsReason = pmi.Free_Goods_Reason__c;
            item.freeGoodsGivenDate = pmi.Free_Goods_Given_Date__c;

            totalRebateLiability += item.rebateLiability;
            totalVolumeLiability += item.planVolumeLiability;
            ctr++;

            if (pmi.Brand_Status__c.indexOf('Must Stock') >= 0) {
                mustStockProducts.add(pmi);
            }

            promotionMaterialItems.add(item);
        }

        
        numberOfMustStockProducts = mustStockProducts.size();
        percentageVisibility= thePSA.Percentage_Visibility__c;
        

    }
    private String getFormattedDate(Date theDate) {
        String formattedDate = '';

        if (theDate != null) {
            Integer month = theDate.month();
            String monthName = '';
            if (month == 1) {
                monthName = Label.January;
            } else if (month == 2) {
                monthName = Label.February;
            } else if (month == 3) {
                monthName = Label.March;
            } else if (month == 4) {
                monthName = Label.April;
            } else if (month == 5) {
                monthName = Label.May;
            } else if (month == 6) {
                monthName = Label.June;
            } else if (month == 7) {
                monthName = Label.July;
            } else if (month == 8) {
                monthName = Label.August;
            } else if (month == 9) {
                monthName = Label.September;
            } else if (month == 10) {
                monthName = Label.October;
            } else if (month == 11) {
                monthName = Label.November;
            } else if (month == 12) {
                monthname = Label.December;
            }
            formattedDate = theDate.day() + ' de ' + monthName + ' de ' + theDate.year();
        }

        return formattedDate;
    }
    private String formatCurrencyValue(Decimal value) {
        Long divisor = 10;
        String returnValue = value.format();
        if (Math.mod(value.longValue(), divisor) == 0) {
            returnValue += ',00';
        }
        return returnValue;
    }
    public Promotion_Activity__c getThePSA() {
        return thePSA;
    }

    public List<pmiItem> promotionMaterialItems { get; set; }
    public List<Promotion_Material_Item__c> mustStockProducts { get; set; }
    public List<payment> payments { get; set; }
    public Integer numberOfMustStockProducts { get; set; }
    public String ownerName { get; set; }
    public String ownerManagerName { get; set; }
    public String contactName { get; set; }
    public String totalBudget { get; set; }
    public String formattedTotalBudget { get; set; }
    public Decimal totalRebateLiability { get; set; }
    public Decimal totalVolumeLiability { get; set; }
    public Decimal totalPlanVolume { get; set; }
    public Integer numberOfPayments { get; set; }
    public Decimal firstPaymentAmount { get; set; }
    public String formattedFirstPaymentAmount { get; set; }
    public String translatedFirstPaymentAmount { get; set; }
    public Decimal secondPaymentAmount { get; set; }
    public String formattedSecondPaymentAmount { get; set; }
    public String translatedSecondPaymentAmount { get; set; }
    public Decimal thirdPaymentAmount { get; set; }
    public String formattedThirdPaymentAmount { get; set; }
    public String translatedThirdPaymentAmount { get; set; }
    public Decimal fourthPaymentAmount { get; set; }
    public String formattedFourthPaymentAmount { get; set; }
    public String translatedFourthPaymentAmount { get; set; }
    public String formattedLengthOfAgreement { get; set; }
    public Decimal percentageVisibility{get; set; }
    public String formattedPercentageVisibility { get; set; }
    public String currencyFormatString { get; set; }
    public ApprovalHistory psaApprovalHistory { get; set; }
    public String dateApproved { get; set; }
    public String dateCreated { get; set; }

    public Integer numberOfProducts { get; set; }
    
}