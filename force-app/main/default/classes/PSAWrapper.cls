/**
 * Test Class:  PromotionalSalesAgreementController_Test
 */
public with sharing class PSAWrapper {
    public class PSAItemWrapper {
        @AuraEnabled 
        public String id  { get; set; }
        @AuraEnabled 
        public String productId     { get; set; }
        
        @AuraEnabled
        public Integer volumeForecast  { get; set; }

        @AuraEnabled 
        public Decimal discount { get; set; }

        @AuraEnabled 
        public Decimal discountPercent { get; set; }

        @AuraEnabled 
        public String brandStatus { get; set; }

        @AuraEnabled 
        public Decimal listingFee { get; set; }

        @AuraEnabled 
        public String drinkStrategy { get; set; }

        @AuraEnabled 
        public String promotionalActivity { get; set; }

        @AuraEnabled 
        public Decimal promotionalActivityAmount { get; set; }

        @AuraEnabled 
        public String trainingAndAdvocacy { get; set; }

        @AuraEnabled 
        public Decimal trainingAndAdvocacyAmount { get; set; }

        @AuraEnabled 
        public Decimal brandSupport { get; set; }

        @AuraEnabled 
        public String outletToProvide { get; set; }

        @AuraEnabled 
        public Decimal freeBottleQty { get; set; }

        @AuraEnabled 
        public Date freeGoodsGivenDate { get; set; }

        @AuraEnabled 
        public String freeGoodsReason { get; set; }

        @AuraEnabled 
        public String brandVisibility { get; set; }

        @AuraEnabled 
        public String productVisibility { get; set; }

        @AuraEnabled 
        public Decimal planRebateLiability { get; set; }

        @AuraEnabled 
        public Decimal planRebateVolume { get; set; }

    }

    public class PSAAccountWrapper {
        @AuraEnabled
        public Account account { get; set; }
        
        @AuraEnabled
        public Boolean isSelected { get; set; }
    }

    @AuraEnabled 
    public String id    { get; set; }

    @AuraEnabled 
    public String recordTypeId  { get; set; }

    @AuraEnabled 
    public String recordTypeName  { get; set; }

    @AuraEnabled 
    public String marketId  { get; set; }

    @AuraEnabled 
    public String marketName { get; set; }

    @AuraEnabled 
    public String parentAccountId { get; set; }

    @AuraEnabled 
    public Boolean allChildAccountsIncluded { get; set; }

    @AuraEnabled 
    public String signingCustomerId { get; set; }

    @AuraEnabled 
    public String signingCustomerName { get; set; }

    @AuraEnabled 
    public String signingCustomerFirstName { get; set; }

    @AuraEnabled 
    public String signingCustomerLastName { get; set; }

    @AuraEnabled
    public String signingCustomerEmail { get; set; }

    @AuraEnabled 
    public Integer lengthOfPSA { get; set; }

    @AuraEnabled
    public Boolean isLengthInYears { get; set; }

    @AuraEnabled 
    public Date beginDate { get; set; }

    @AuraEnabled 
    public Date endDate { get; set; }

    @AuraEnabled 
    public String wholesalerPreferredId { get; set; }

    @AuraEnabled 
    public String wholesalerPreferredName { get; set; }

    @AuraEnabled 
    public String wholesalerAlternateId { get; set; }

    @AuraEnabled 
    public String wholesalerAlternateName { get; set; }

    @AuraEnabled 
    public String accountWholesalerPreferred { get; set; }

    @AuraEnabled 
    public String accountWholesalerPreferredName { get; set; }

    @AuraEnabled 
    public String accountWholesalerAlternate { get; set; }

    @AuraEnabled 
    public String accountWholesalerAlternateName { get; set; }

    @AuraEnabled 
    public String status { get; set; }

    @AuraEnabled 
    public String promotionType { get; set; }

    @AuraEnabled 
    public String comments { get; set; }

    @AuraEnabled 
    public String message { get; set; }

    @AuraEnabled 
    public String purchaseOrder { get; set; }

    @AuraEnabled 
    public Boolean mpoPrestige { get; set; }

    @AuraEnabled 
    public Boolean limitToSelectedAccounts { get; set; }

    @AuraEnabled 
    public Integer numberOfPayments { get; set; }

    @AuraEnabled
    public String paymentConfigurations { get; set; }

    @AuraEnabled 
    public Decimal totalBudget { get; set; }

    @AuraEnabled 
    public Decimal percentageVisibility { get; set; }

    @AuraEnabled 
    public Boolean isDirectRebate { get; set; }

    @AuraEnabled 
    public List<SelectableItem> accounts { get; set; }

    @AuraEnabled 
    public List<String> accountsToDelete { get; set; }

    @AuraEnabled 
    public List<PSAItemWrapper> items { get; set; }

    @AuraEnabled 
    public List<String> itemsToDelete { get; set; }

    public PSAWrapper() {
        this.id = '';
        this.recordTypeId = '';
        this.recordTypeName = '';
        this.marketId = '';
        this.marketName = '';
        this.parentAccountId = '';
        this.allChildAccountsIncluded = false;
        this.signingCustomerId = '';
        this.signingCustomerName = '';
        this.signingCustomerFirstName = '';
        this.signingCustomerLastName = '';
        this.signingCustomerEmail = '';
        this.lengthOfPSA = 0;
        this.isLengthInYears = true;
        this.beginDate = null;
        this.endDate = null;
        this.accountWholesalerPreferred = '';
        this.accountWholesalerPreferredName = '';
        this.accountWholesalerAlternate = '';
        this.accountWholesalerAlternateName = '';
        this.wholesalerAlternateId = '';
        this.wholesalerAlternateName = '';
        this.wholesalerPreferredId = '';
        this.wholesalerAlternateName = '';
        this.status = 'OK';
        this.promotionType = '';
        this.message = '';
        this.purchaseOrder = '';
        this.comments = '';
        this.mpoPrestige = false;
        this.limitToSelectedAccounts = true;
        this.numberOfPayments = 1;
        this.paymentConfigurations = '';
        this.totalBudget = 0;
        this.percentageVisibility = 0;
        this.isDirectRebate = true;

        this.accounts = new List<SelectableItem>();
        this.accountsToDelete = new List<String>();
        this.items = new List<PSAItemWrapper>();
        this.itemsToDelete = new List<String>();
    }

    public PSAWrapper(Promotion_Activity__c psa) {
        this.id = psa.Id;
        this.recordTypeId = psa.RecordTypeId;
        this.recordTypeName = psa.RecordType.Name;
        this.marketId = psa.Market__c;
        this.marketName = psa.Market__r.Name;
        this.parentAccountId = psa.Account__c;
        this.allChildAccountsIncluded = psa.All_Child_Accounts_Included__c;
        this.signingCustomerId = psa.Contact__c;
        if (psa.Contact__r != null) {
            this.signingCustomerFirstName = psa.Contact__r.FirstName;
            this.signingCustomerLastName = psa.Contact__r.LastName;
            this.signingCustomerName = psa.Contact__r.Name;
            this.signingCustomerEmail = psa.Contact__r.Email;    
        }
        this.lengthOfPSA = Integer.valueOf(psa.Length_of_Agreement__c);
        this.isLengthInYears = psa.Is_Length_in_Years__c;
        this.mpoPrestige = psa.MPO_Prestige__c;
        this.beginDate = psa.Begin_Date__c;
        this.endDate = psa.End_Date__c;
        this.wholesalerAlternateId = psa.Wholesaler_Alternate__c;
        this.wholesalerAlternateName = psa.Wholesaler_Alternate_Name__c;
        this.wholesalerPreferredId = psa.Wholesaler_Preferred__c;
        this.wholesalerPreferredName = psa.Wholesaler_Preferred_Name__c;
        this.status = psa.Status__c;
        this.promotionType = psa.Promotion_Type__c;
        this.purchaseOrder = psa.Purchase_Order__c;
        this.comments = psa.Evaluation_Comments__c;
        this.numberOfPayments = Integer.valueOf(psa.Number_of_Payments__c);
        this.totalBudget = psa.Activity_Budget__c;
        this.percentageVisibility = psa.Percentage_Visibility__c;
        this.limitToSelectedAccounts = psa.Limit_to_Selected_Accounts__c;
        this.isDirectRebate = psa.Activity_Type__c == null || psa.Activity_Type__c == 'Direct Rebate';
        this.accountWholesalerPreferred = psa.Account_Wholesaler_Preferred__c;
        this.accountWholesalerPreferredName = psa.Account_Wholesaler_Preferred_Name__c;
        this.accountWholesalerAlternate = psa.Account_Wholesaler_Alternate__c;
        this.accountWholesalerAlternateName = psa.Account_Wholesaler_Alternate_Name__c;
    }
}