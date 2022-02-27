/**
 * Test Class: PromotionalSalesAgreementController_Test
 */
public with sharing class PromotionalSalesAgreement_Controller {
    static INTEGER PAGE_SIZE = 20;

    public class Filters {
        @AuraEnabled
        public String searchKey { get; set; }

        @AuraEnabled 
        public Boolean myAgreements { get; set; }
        
        @AuraEnabled 
        public Date startDate { get; set; }

        @AuraEnabled 
        public Date endDate { get; set; }

        @AuraEnabled 
        public String parentAccount { get; set; }

        @AuraEnabled 
        public String signingCustomer { get; set; }

        @AuraEnabled 
        public String[] products { get; set; }

        @AuraEnabled 
        public String[] accounts { get; set; }
    }

    public class PSARebate {
        @AuraEnabled 
        public string rebateType { get; set; }

        @AuraEnabled 
        public Decimal rebateAmount { get; set; }

        @AuraEnabled 
        public Boolean isVolumeRebate { get; set; }

        @AuraEnabled 
        public Decimal plannedRebate { get; set; }

        @AuraEnabled 
        public String glAccount { get; set; }

        @AuraEnabled 
        public Boolean hasTotals { get; set; }

        @AuraEnabled 
        public String externalKey { get; set; }

        @AuraEnabled
        public String status { get; set; }
    }

    @AuraEnabled(Cacheable=true)
    public static Market__c getUserMarket() {
        User u = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        String marketName = 'Australia';
        if (u != null && u.Market__c != null) {
            marketName = u.Market__c;
        }
        Market__c market = [SELECT Id, Name, Maximum_Agreement_Length__c, Capture_End_Date__c, Capture_Volume_in_Bottles__c, 
                                    Capture_Number_of_Payments__c, Capture_PSA_Budget__c, Calculate_PSA_Product_Split__c 
                              FROM Market__c 
                             WHERE Name =:marketName 
                             LIMIT 1];
        return market;
    }

    @AuraEnabled 
    public static Boolean getIsSOMUser() {
        List<GroupMember> groups = [SELECT Id, Group.Name FROM GroupMember WHERE UserOrGroupId =:UserInfo.getUserId() AND Group.DeveloperName ='UK_SOM'];
        Boolean isSOMUser = groups == null ? false : groups.size() > 0;
        System.debug('# of groups: ' + groups == null ? 0 : groups.size());
        System.debug('isSOMUSer: ' + isSOMUser);

        return isSOMUser;
    }

    @AuraEnabled(cacheable=true) 
    public static User getUserDetails() {
        return [SELECT Id, Name, FirstName, LastName, Email
                  FROM User 
                 WHERE Id =:UserInfo.getUserId()];
    }

    @AuraEnabled(cacheable=true)
    public static Promotion_Activity__c getPSA(String psaId){
        return [SELECT Id, Name, RecordTypeId, RecordType.Name, Account__c, Account__r.Name, Account__r.RecordTypeId, Account__r.RecordType.Name,
                                            Account__r.ShippingStreet, Account__r.ShippingCity, Account__r.ShippingState, Account__r.ShippingCountry, Account__r.ShippingPostalCode,
                                            Contact__c, Contact__r.Name, Contact__r.Email, Begin_Date__c, End_Date__c, Length_of_Agreement__c, Is_Length_in_Years__c, Channel__c,
                                            Premise__c, Market__c, Market__r.Name, Status__c, Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                            Wholesaler_Alternate__c, Wholesaler_Alternate_Name__c, Total_Volume__c, Total_Discount__c, Total_Investment__c, 
                                            Total_Listing_Fee__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity__c, Total_Promotional_Activity_Paid__c, 
                                            Total_Training_and_Advocacy__c, Evaluation_Comments__c, Is_Approved__c, Date_Approved__c, Total_Training_and_Advocacy_Paid__c, 
                                            Total_Actual_Volume__c, Purchase_Order__c, MPO_Prestige__c, Original_Total_Investment__c, Market__r.Change_Threshold_Amount__c,
                                            Market__r.Promotion_Discount_Threshold__c, Reminder_Date__c, Next_Email_Date__c, Market__r.Capture_Volume_in_Bottles__c,
                                            Number_of_Payments__c, Activity_Budget__c, Market__r.Capture_PSA_Budget__c, Market__r.Calculate_PSA_Product_Split__c,
                                            Total_Planned_Spend__c, Total_Payments_Paid__c, Percentage_Visibility__c, Total_Volume_Bottles__c, Total_Actual_Volume_Bottles__c,
                                            Market__r.Capture_End_Date__c,
                                            (SELECT Id, Account__c, AccountName__c, Account__r.RecordTypeId, Account__r.RecordType.Name, Account__r.ShippingStreet, 
                                                    Account__r.ShippingCity, Account__r.ShippingState, Account__r.ShippingCountry, Account__r.ShippingPostalCode, 
                                                    Total_Actual_Qty__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy_Paid__c 
                                                    FROM Promotions__r),
                                            (SELECT Id, Promotion__c, Product_Custom__c, Product_Name__c, Brand__c, Approval_Status__c, Plan_Volume__c, Plan_Rebate__c, 
                                                    Brand_Status__c, Drink_Strategy__c, Outlet_to_Provide__c, Status__c, Listing_Fee__c, Promotional_Activity__c,
                                                    Promotional_Activity_Value__c, Quantity__c, Training_and_Advocacy__c, Training_and_Advocacy_Value__c,
                                                    Total_Investment__c, Comments_Long__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c,
                                                    Total_Training_and_Advocacy_Paid__c, Original_Plan_Volume__c, Original_Plan_Rebate__c, Original_Listing_Fee__c,
                                                    Original_Promotional_Activity__c, Original_Training_Advocacy__c, Total_Actual_Volume__c, Previous_Plan_Volume__c, 
                                                    Previous_Plan_Rebate__c, Previous_Listing_Fee__c, Previous_Promotional_Activity__c, Previous_Training_Advocacy__c,
                                                    Proposed_Plan_Volume__c, Proposed_Plan_Rebate__c, Proposed_Listing_Fee__c, Proposed_Promotional_Activity_Value__c,
                                                    Proposed_Training_Advocacy_Value__c, Product_Pack_Qty__c, Product_Custom__r.Gross_Profit_per_Case__c,
                                                    CurrencyISOCode, Product_Split__c, Total_Payments_Paid__c                                                    
                                                    FROM Promotion_Material_Items__r), 
                                            (SELECT Id, Activity__c, Promotion__c, Promotion_Material_Item__c, Account__c, Account_Name__c, Act_Qty__c,
                                                    Approval_Status__c, Brand_Name__c, External_Key__c, Payment_Date__c, Period__c, RecordTypeId, 
                                                    Product__c, Product_Name__c, Actual_Wholesaler__c, Actual_Wholesaler__r.Name, Listing_Fee__c,
                                                    Promotional_Activity__c, Training_and_Advocacy__c, Rebate_Type__c, Rebate_Amount__c, Has_Totals__c,
                                                    Product_Pack_Qty__c
                                                    FROM PMI_Actuals__r ORDER BY Payment_Date__c),
                                            (SELECT Id, ContentDocumentId, ContentDocument.Title, ContentDocument.FileType, ContentDocument.FileExtension,
                                                    ContentDocument.LatestPublishedVersionId FROM ContentDocumentLinks) 
                                      FROM Promotion_Activity__c 
                                     WHERE Id =:psaId];
    }

    @AuraEnabled(cacheable=true)
    public static PagedResult getAgreements(Filters filters, Integer pageNumber) {
        String key, whereClause = '';
        String[] criteria = new List<String>();
        if (filters != null) {
            if (filters.myAgreements != null) {
                criteria.add('CreatedById = \'' + UserInfo.getUserId() + '\'');
            }
            if (filters.parentAccount != null) {
                criteria.add('Account__c = \'' + filters.parentAccount + '\'');
            }
            if (filters.startDate != null) {
                Date startDate = filters.startDate;
                criteria.add('Begin_Date__c >= :startDate');
            }
            if (filters.endDate != null) {
                Date endDate = filters.endDate;
                criteria.add('End_Date__c <= :endDate');
            }
            if (filters.products != null && filters.products.size() > 0) {
                
            }
        }

        String soql = 'SELECT Id, Name, Begin_Date__c, End_Date__c, Account__c, Status__c ';
        soql += ' FROM Promotion_Activity__c';
        if (criteria.size() > 0) {
            soql += ' WHERE ' + String.join(criteria, ' AND ');
        }
        soql += ' WITH SECURITY_ENFORCED ORDER BY Begin_Date__c LIMIT :pageSize OFFSET :offset';
        System.debug(soql);

        Integer pageSize = PromotionalSalesAgreement_Controller.PAGE_SIZE;
        Integer offSet = (pageNumber - 1) * pageSize;
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.pageNumber = pageNumber;
        result.records = Database.query(soql);
        result.totalItemCount = result.records == null ? 0 : result.records.size();

        return result;
    }

    @AuraEnabled 
    public static List<ContentDocumentLink> getAttachedFiles(String psaId) {
        return [SELECT Id, ContentDocumentId, ContentDocument.Title, ContentDocument.FileType, ContentDocument.FileExtension
                  FROM ContentDocumentLink 
                 WHERE LinkedEntityId =:psaId];
    }

    @AuraEnabled
    public static Account getAccountById(String accountId) {
        return [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingCountry, ShippingPostalCode, ShippingState,
                    (SELECT Id, Name, Email FROM Contacts WHERE Decision_Maker__c = true)
                  FROM Account 
                 WHERE Id =:accountId];
    }
    @AuraEnabled(Cacheable=true)
    public static PagedResult getAccountsByName(String accountName, Boolean isSearchingForParent, String market, Integer pageNumber) {
        String soql = 'SELECT Id, Name, ShippingStreet, ShippingCity, ShippingCountry, ShippingPostalCode, ShippingState,';
        soql += '(SELECT Id, Name FROM Contacts WHERE Decision_Maker__c = true)';
        soql += ' FROM Account WHERE Name LIKE \'%' + accountName + '%\'';
        soql += ' AND Market__c = \'' + market + '\'';
        if (isSearchingForParent) {
            soql += ' AND RecordType.Name LIKE \'%Parent\'';
        } else {
            soql += ' AND (NOT RecordType.Name LIKE \'%Parent\')';

        }
        soql += ' WITH SECURITY_ENFORCED ORDER BY Name LIMIT :pageSize OFFSET :offset';
        
        Integer pageSize = PromotionalSalesAgreement_Controller.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        
        PagedResult result = new PagedResult();
        result.pageSize = 20;
        result.records = Database.query(soql);
        result.totalItemCount = result.records.size();
        
        return result;
    }

    @AuraEnabled
    public static PagedResult getAccountsForParent(String parentAccountId, Integer pageNumber) {
        List<Account> accounts = [SELECT Id, Name FROM Account WHERE ParentId =:parentAccountId];

        Integer pageSize = PromotionalSalesAgreement_Controller.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        
        PagedResult result = new PagedResult();
        result.pageSize = 20;

        String soql = 'SELECT Id, Name, ShippingStreet, ShippingCity, ShippingCountry, ShippingPostalCode, ShippingState';
        soql += ' FROM Account WHERE ParentId = \'' + parentAccountId + '\' WITH SECURITY_ENFORCED ORDER BY Name LIMIT :pageSize OFFSET :offset';
        result.records = Database.query(soql);
        result.totalItemCount = result.records == null ? 0 : result.records.size();

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static Promotion_Material_Item__c getPSAItemDetails(String psaItemId) {
        return [SELECT Id, Promotion__c, Product_Custom__c, Product_Name__c, Brand__c, Brand_Status__c, Approval_Status__c, Plan_Rebate__c, 
                       Plan_Volume__c, Drink_Strategy__c, Status__c, Listing_Fee__c, Outlet_to_Provide__c, Promotional_Activity__c,
                       Promotional_Activity_Value__c, Training_and_Advocacy__c, Training_and_Advocacy_Value__c,
                       Total_Investment__c, Product_Custom__r.Image_Name__c, Comments_Long__c, Total_Listing_Fee_Paid__c, 
                       Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy_Paid__c, Original_Plan_Volume__c, Original_Plan_Rebate__c,
                       Original_Listing_Fee__c, Original_Promotional_Activity__c, Original_Training_Advocacy__c, Proposed_Plan_Volume__c,
                       Proposed_Plan_Rebate__c, Proposed_Listing_Fee__c, Proposed_Promotional_Activity_Value__c, Proposed_Training_Advocacy_Value__c,
                       Product_Pack_Qty__c, Product_Custom__r.Gross_Profit_per_Case__c, Activity__r.Market__r.Capture_Volume_in_Bottles__c,
                       CurrencyISOCode, Product_Split__c, Activity__r.Total_Planned_Spend__c
                  FROM Promotion_Material_Item__c 
                 WHERE Id =:psaItemId];
    }

    @AuraEnabled(cacheable=true)
    public static Product__c getProductDetails(String productId) {
        return [SELECT Id, Name, Brand__c, Brand_Name__c, Image_Name__c, Unit_Size__c, Pack_Quantity__c, Gross_Profit_per_Case__c 
                  FROM Product__c 
                 WHERE Id =:productId];
    }

    @AuraEnabled(cacheable=true)
    public static PagedResult getProducts(Integer pageNumber, String brandsSelected) {
        Integer pageSize = 50;
        Integer offset = (pageNumber - 1) * pageSize;
        
        System.debug('brandsSelected:' + brandsSelected);

        String marketName = 'Australia';
        User u = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        if (u.Market__c != null) { marketName = u.Market__c; }
        Market__c market = [SELECT Id FROM Market__c WHERE Name =:marketName LIMIT 1];
        String marketId = market.Id;

        String soql = 'SELECT Id, Name, Brand__c, Brand_Name__c, Image_Name__c, Pack_Quantity__c, Unit_Size__c, Gross_Profit_per_Case__c FROM Product__c';
        soql += ' WHERE IsActive__c = true AND RecordType.Name = \'Wet Goods\' AND Market__c =:marketId AND Supplier__c = \'B-F\' AND Used_For__c INCLUDES (\'Promotion\')';
        if (brandsSelected.length() > 0) {
            brandsSelected = '\'' + brandsSelected + '\'';
            brandsSelected = brandsSelected.replaceAll(',', '\',\'');    
            soql += ' AND Brand__c IN (' + brandsSelected + ')';
        }
        soql += ' WITH SECURITY_ENFORCED ORDER BY Name LIMIT :pageSize OFFSET :offset';
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.records = Database.query(soql);

        result.totalItemCount = Database.countQuery('SELECT COUNT() FROM Product__c WHERE IsActive__c = true AND RecordType.Name = \'Wet Goods\' AND Market__c =:marketId AND Supplier__c = \'B-F\' AND Used_For__c INCLUDES (\'Promotion\') WITH SECURITY_ENFORCED');

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static PagedResult getBrands(Integer pageNumber) {
        Integer pageSize = PromotionalSalesAgreement_Controller.PAGE_SIZE;
        Integer offset = (pageNumber - 1) * pageSize;
        
        String marketName = 'Australia';
        User u = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        if (u.Market__c != null) { marketName = u.Market__c; }
        Market__c market = [SELECT Id FROM Market__c WHERE Name =:marketName LIMIT 1];

        PagedResult result = new PagedResult();
        result.pageSize = 20;

        List<Product__c> products = [SELECT Id, Brand__c, Brand_Name__c, Brand__r.Primary_Logo__c 
                                       FROM Product__c 
                                      WHERE IsActive__c = true 
                                        AND RecordType.Name = 'Wet Goods'
                                        AND Supplier__c = 'B-F'
                                        AND Market__c =:market.Id
                                        ORDER BY Brand_Name__c];

        Set<Brand__c> brands = new Set<Brand__c>();
        for(Product__c p : products) {
            brands.add(new Brand__c(Id=p.Brand__c, Name=p.Brand_Name__c, Primary_Logo__c=p.Brand__r.Primary_Logo__c));
        }
        result.records = new List<Brand__c>(brands);
        result.totalItemCount = brands.size();

        return result;
    }

    @AuraEnabled(cacheable=true)
    public static List<Wholesaler__c> getWholesalers(String market) {
        return [SELECT Id, Name 
                  FROM Wholesaler__c 
                 WHERE Is_Active__c = true
                   AND Market__c =:market  
                  WITH SECURITY_ENFORCED];
    }

    @AuraEnabled(cacheable=true)
    public static PMI_Actual__c getPMIADetails(String pmiaId) {
        return [SELECT Id, Name, RecordTypeId, RecordType.Name, Activity__c, Promotion__c, Account__c, Account_Name__c,
                       Promotion_Material_Item__c, Product__c, Product_Name__c, Payment_Date__c, Act_Qty__c, Actual_Discount__c, 
                       Plan_Payment__c, Promotion_Material_Item__r.Plan_Volume__c, Promotion_Material_Item__r.Plan_Rebate__c,
                       Boomi_Processed__c, LastModifiedDate, Approval_Status__c, Actual_Wholesaler__c, Actual_Wholesaler__r.Name,
                       Listing_Fee__c, Promotional_Activity__c, Training_and_Advocacy__c, Promotion_Material_Item__r.Listing_Fee__c,
                       Promotion_Material_Item__r.Promotional_Activity_Value__c, Promotion_Material_Item__r.Training_and_Advocacy_Value__c,
                       Rebate_Type__c, Rebate_Amount__c, Promotion_Material_Item__r.Total_Listing_Fee_Paid__c, Promotion_Material_Item__r.Total_Promotional_Activity_Paid__c,
                       Promotion_Material_Item__r.Total_Training_and_Advocacy_Paid__c, Promotion_Material_Item__r.Total_Actual_Volume__c,
                       Product_Pack_Qty__c, Activity__r.Activity_Budget__c, Promotion_Material_Item__r.Total_Payments_Paid__c,
                       Promotion_Material_Item__r.Product_Split__c
                  FROM PMI_Actual__c 
                 WHERE Id =:pmiaId];
    }

    @AuraEnabled(cacheable=true) 
    public static List<SAP_Interfaced_Data_Configuration__c> getGLMappings(String marketId) {
        if (marketId == null) {
            User u = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
            String marketName = 'Australia';
            if (u.Market__c != null) {
                marketName = u.Market__c;
            }

            Market__c m = [SELECT Id FROM Market__c WHERE Name =:marketName LIMIT 1];
            marketId = m.Id;
        }
        Map<String, Schema.RecordTypeInfo> rtList = SAP_Interfaced_Data_Configuration__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        String rtId = rtList.get('UK - PSA').getRecordTypeId();

        return [SELECT Id, Classification__c, SoldTo_Code__c
                  FROM SAP_Interfaced_Data_Configuration__c
                 WHERE RecordTypeId =: rtId
                   AND Market__c =:marketId
                   AND Is_Active__c = true];
    }

    /*
    @AuraEnabled
    public static Promotion_Material_Item__c getPMIDetails(String pmiId) {
        return [SELECT Id, Name, Activity__c, Product_Custom__c, Product_Name__c, Plan_Volume__c, Plan_Rebate__c
                  FROM Promotion_Material_Item__c 
                 WHERE Id =:pmiId];
    }
    */

    /**
     * Update Data methods
     */

    @AuraEnabled 
    public static String savePSA(PSAWrapper psaData) {
        String msg = 'OK';

        System.debug('[savePSA] psaData: ' + psaData);
        
        try {            
            System.debug('[savePSA] psa Id: ' + psaData.id);
            System.debug('[savePSA] marketId: ' + psaData.marketId);
            System.debug('[savePSA] marketName: ' + psaData.marketName);
            System.debug('[savePSA} beginDate: ' + psaData.beginDate);
            System.debug('[savePSA] endDate: ' + psaData.endDate);
            System.debug('[savePSA] length of PSA: ' + psaData.lengthOfPSA);
            System.debug('[savePSA] Account: ' + psaData.parentAccountId);
            System.debug('[savePSA] contact: ' + psaData.signingCustomerId);
            System.debug('[savePSA] wholesaler preferred: ' + psaData.wholesalerPreferredId);
            System.debug('[savePSA] wholesaler preferred: ' + psaData.wholesalerAlternateId);
            Promotion_Activity__c psa = [SELECT Id, RecordTypeId, RecordType.Name FROM Promotion_Activity__c WHERE Id =:psaData.id];
            psa.Id = psaData.id;
            psa.Begin_Date__c = psaData.beginDate;
            psa.End_Date__c = psaData.endDate;
            psa.Is_Length_in_Years__c = psaData.isLengthInYears;
            psa.Length_of_Agreement__c = Integer.valueOf(psaData.lengthOfPSA);
            psa.Number_of_Payments__c = Integer.valueOf(psaData.numberOfPayments);
            psa.Account__c = psaData.parentAccountId;
            psa.Contact__c = psaData.signingCustomerId;
            psa.Wholesaler_Preferred__c = psaData.wholesalerPreferredId;
            psa.Wholesaler_Preferred_Name__c = psaData.wholesalerPreferredName;
            psa.Wholesaler_Alternate__c = psaData.wholesalerAlternateId;
            psa.Wholesaler_Alternate_Name__c = psaData.wholesalerAlternateName;
            psa.Status__c = psaData.status;
            psa.Purchase_Order__c = psaData.purchaseOrder;
            psa.Evaluation_Comments__c = psaData.comments;
            psa.MPO_Prestige__c = psaData.mpoPrestige;
            psa.Activity_Budget__c = psaData.totalBudget;
            psa.Percentage_Visibility__c = psaData.percentageVisibility;

            if (psaData.marketId == null || psaData.marketId == '') {
                String marketName = psaData.marketName;
                if (psaData.marketName == null || psaData.marketName == '') {
                    marketName = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId() LIMIT 1].Market__c;
                }

                if (marketName != '') {
                    Market__c m = [SELECT Id FROM Market__c WHERE Name =:marketName LIMIT 1];
                    psa.Market__c = m.Id;
                }
            } else {
                psa.Market__c = psaData.marketId;
            }

            update psa;

            if (psaData.accounts != null && psaData.accounts.size() > 0) {
                String rtUKPSAPromotion = '';
                Map<String, Schema.RecordTypeInfo> rtiList = Promotion__c.SObjectType.getDescribe().getRecordTypeInfosByName();
                if (rtiList.containsKey(psa.RecordType.Name)) {
                    rtUKPSAPromotion = rtiList.get(psa.RecordType.Name).getRecordTypeId();
                }

                List<Promotion__c> l_Promotions = new List<Promotion__c>();
                Integer numberOfAccounts = psaData.accounts.size();
                for (Integer i = 0; i < numberOfAccounts; i++) {
                    System.debug('account id: ' + psaData.accounts[i].id + ', itemid: ' + psaData.accounts[i].itemid);
                    if (psaData.accounts[i].itemId != '') {
                        Promotion__c p = new Promotion__c();
                        if (psaData.accounts[i].id != null && psaData.accounts[i].id != '') {
                            p.Id = psaData.accounts[i].id;
                        }
                        p.Promotion_Activity__c = psa.Id;
                        p.RecordTypeId = rtUKPSAPromotion;
                        p.Account__c = psaData.accounts[i].itemId;
    
                        l_Promotions.add(p);    
                        System.debug('promotion.account: ' + p.Account__c);
                    }
                }
                System.debug('# of promotions to create: ' + l_Promotions.size());
                if (l_Promotions.size() > 0) {
                    upsert l_Promotions;
                }

                if (psaData.accountsToDelete != null && psaData.accountsToDelete.size() > 0) {
                    // Update Promotion Material Items before deleting the Promotion so we don't lose any items
                    // which will be deleted if they are children of the promotion (Account) we will delete.
                    List<Promotion_Material_Item__c> items = [SELECT Id, Promotion__c FROM Promotion_Material_Item__c WHERE Activity__c =:psa.Id AND Promotion__c = :psaData.accountsToDelete];
                    if (items != null && items.size() > 0) {
                        for(Promotion_Material_Item__c pmi : items) {
                            pmi.Promotion__c = l_Promotions[0].Id;
                        }
                    }
                    update items;

                    List<Promotion__c> promotionsToDelete = [SELECT Id FROM Promotion__c WHERE Id =:psaData.accountsToDelete];
                    if (promotionsToDelete != null && promotionsToDelete.size() > 0) {
                        delete promotionsToDelete;
                    }
                }
            }
        }catch(Exception ex) {
            msg = ex.getMessage();
        }
        
        return msg;
    }

    @AuraEnabled 
    public static String savePSAItems(PSAWrapper psaData) {
        String msg = 'OK';

        String rtUKPSA = '';
        String rtKey = psaData.recordTypeName == '' ? 'UK - PSA' : psaData.recordTypeName;
        Map<String, Schema.RecordTypeInfo> rtiList = Promotion_Material_Item__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        if (rtiList.containsKey(rtKey)) {
            rtUKPSA = rtiList.get(rtKey).getRecordTypeId();
        }

        try {
            if (psaData.itemsToDelete != null && psaData.itemsToDelete.size() > 0) {
                List<Promotion_Material_Item__c> pmiToDelete = [SELECT Id FROM Promotion_Material_Item__c WHERE Id =:psaData.itemsToDelete];
                delete pmiToDelete;
            }

            if (psaData.items != null && psaData.items.size() > 0) {
                List<Promotion_Material_Item__c> l_PMI = new List<Promotion_Material_Item__c>();

                Integer numberOfItems = psaData.items.size();
                for (Integer i = 0; i < numberOfItems; i++) {
                    Promotion_Material_Item__c pmi = new Promotion_Material_Item__c();
                    if (psaData.items[i].id != null) {
                        pmi.Id = psaData.items[i].id;
                    }

                    pmi.RecordTypeId = rtUKPSA;
                    pmi.Activity__c = psaData.id;
                    pmi.Promotion__c = psaData.accounts[0].id;
                    pmi.Approval_Status__c = 'New';
                    pmi.Product_Custom__c = psaData.items[i].productId;
                    pmi.Brand_Status__c = psaData.items[i].brandStatus;
                    pmi.Drink_Strategy__c = psaData.items[i].drinkStrategy;
                    pmi.Listing_Fee__c = psaData.items[i].listingFee;
                    pmi.Plan_Volume__c = psaData.items[i].volumeForecast;
                    pmi.Plan_Rebate__c = psaData.items[i].discount;
                    pmi.Promotional_Activity__c = psaData.items[i].promotionalActivity;
                    pmi.Promotional_Activity_Value__c = psaData.items[i].promotionalActivityAmount;
                    pmi.Training_and_Advocacy__c = psaData.items[i].trainingAndAdvocacy;
                    pmi.Training_and_Advocacy_Value__c = psaData.items[i].trainingAndAdvocacyAmount;
                    pmi.Outlet_to_Provide__c = psaData.items[i].outletToProvide;

                    l_PMI.add(pmi);
                }

                if (l_PMI.size() > 0) {
                    upsert(l_PMI);
                }

                Promotion_Activity__c theActivity = [SELECT Id, Status__c, Is_Approved__c FROM Promotion_Activity__c WHERE Id =:psaData.id];
                if (theActivity.Is_Approved__c) {
                    theActivity.Status__c = 'Updated';
                    update theActivity;
                }
            }
        } catch(Exception ex) {
            msg = ex.getMessage();
        }
        
        return msg;
    }

    @AuraEnabled
    public static List<String> createActuals(String psaId, String recordTypeId, String promotionId, String pmiId, String wholesalerId, Date paymentDate, String externalKey, String status, Integer productPackQty, Boolean captureVolumeInBottles, List<PSARebate> rebates) {
        System.debug('psaId: ' + psaId);
        System.debug('recordTypeId: ' + recordTypeId);
        System.debug('promotionId: ' + promotionId);
        System.debug('pmiId: ' + pmiId);
        System.debug('externalKey: ' + externalKey);
        System.debug('paymentDate: ' + paymentDate);
        System.debug('status: ' + status);
        System.debug('productPackQty: ' + productPackQty);
        System.debug('captureVolumeInBottles: ' + captureVolumeInBottles);
        System.debug('rebates: ' + rebates);
        List<String> returnIds = new List<String>();

        try {
            List<PMI_Actual__c> actualsToCreate = new List<PMI_Actual__c>();
            for(PSARebate rebate : rebates) {
                if (rebate.rebateAmount > 0) {
                    PMI_Actual__c pmia = new PMI_Actual__c();
                    pmia.Activity__c = psaId;
                    pmia.RecordTypeId = recordTypeId;
                    pmia.Promotion__c = promotionId;
                    pmia.Promotion_Material_Item__c = pmiId;
                    pmia.Actual_Wholesaler__c = wholesalerId;
                    pmia.Approval_Status__c = status;
                    pmia.Payment_Date__c = paymentDate;
                    pmia.Rebate_Type__c = rebate.rebateType;
                    pmia.SAP_GL_Account__c = rebate.glAccount;
                    pmia.Has_Totals__c = rebate.hasTotals;
                    if (rebate.rebateType == 'Volume') {
                        pmia.Act_Qty__c = rebate.rebateAmount;
                        if (captureVolumeInBottles) {
                            pmia.Act_Qty__c = rebate.rebateAmount / productPackQty;
                        }

                        Promotion_Material_Item__c pmi = [SELECT Id, Plan_Volume__c, Plan_Rebate__c FROM Promotion_Material_Item__c WHERE Id =:pmiId];
                        pmia.Rebate_Amount__c = rebate.rebateAmount * pmi.Plan_Rebate__c; 
                    } else {
                        pmia.Rebate_Amount__c = rebate.rebateAmount;
                    }  
                    pmia.Period__c = 0;
                    //pmia.External_Key__c = externalKey + '_' + rebate.rebateType.replaceAll(' ','_'); 
                    if (rebate.externalKey == null || rebate.externalKey == '') {
                        pmia.External_Key__c = pmiId + '_' + rebate.rebateType;
                    } else {
                        pmia.External_Key__c = rebate.externalKey;
                    }
    
                    actualsToCreate.add(pmia);    
                }
            }

            if (actualsToCreate.size() > 0) {
                insert actualsToCreate;
                for(PMI_Actual__c p : actualsToCreate) {
                    returnIds.add(p.Id);
                }
                
            } else {
                returnIds.add('No actuals to create');
            }
        } catch(Exception ex) {
            System.debug('[createactuals] exception: ' + ex.getMessage());
            //returnIds.add(ex.getMessage());
            throw ex;
        }   

        return returnIds;
    }

    @AuraEnabled 
    public static String updateActualTotals(String psaId) {
        String msg = 'OK';

        try {
            Promotion_Activity__c psa = [SELECT Id, Total_Actual_Volume__c, Total_Actual_Discount__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, 
                                            Total_Training_and_Advocacy_Paid__c, Market__r.Capture_Volume_in_Bottles__c, Activity_Budget__c, Total_Payments_Paid__c,
                                            Total_Actual_Volume_Bottles__c,
                                                (SELECT Id, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, 
                                                        Total_Training_and_Advocacy_Paid__c, Total_Planned_Discount__c, Total_Actual_Discount__c, Total_Planned_Qty__c 
                                                        FROM Promotions__r),
                                                (SELECT Id, Promotion__c, Product_Custom__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, 
                                                        Total_Training_and_Advocacy_Paid__c, Total_Actual_Volume__c, Total_Actual_Investment__c, Product_Pack_Qty__c                                                        
                                                        FROM Promotion_Material_Items__r), 
                                                (SELECT Id, Activity__c, Promotion__c, Promotion_Material_Item__c, Act_Qty__c, Listing_Fee__c, 
                                                        Promotional_Activity__c, Training_and_Advocacy__c, Promotion_Material_Item__r.Plan_Rebate__c,
                                                        Promotion_Material_Item__r.Listing_Fee__c, Promotion_Material_Item__r.Promotional_Activity_Value__c,
                                                        Promotion_Material_Item__r.Training_and_Advocacy_Value__c, Proposed_Discount__c, Rebate_Type__c, Rebate_Amount__c
                                                        FROM PMI_Actuals__r WHERE Approval_Status__c = 'Paid' OR Approval_Status__c = 'Rebate Complete')
                                        FROM Promotion_Activity__c 
                                        WHERE Id =:psaId];
            
            psa.Total_Actual_Volume__c = 0;
            psa.Total_Actual_Volume_Bottles__c = 0;
            psa.Total_Actual_Discount__c = 0;
            psa.Total_Listing_Fee_Paid__c = 0;
            psa.Total_Promotional_Activity_Paid__c = 0;
            psa.Total_Training_and_Advocacy_Paid__c = 0;
            psa.Total_Actual_Investment__c = 0;
            psa.Total_Payments_Paid__c = 0;

            /*
            Map<Id, Promotion__c> m_Promotions = new Map<Id, Promotion__c>();
            for(Promotion__c p : psa.Promotions__r) {
                m_Promotions.put(p.Id, p);
            }
            */
            Map<Id, Promotion_Material_Item__c> m_PMIs = new Map<Id, Promotion_Material_Item__c>();
            for(Promotion_Material_Item__c pmi : psa.Promotion_Material_Items__r) {
                pmi.Total_Actual_Volume__c = 0;
                pmi.Total_Listing_Fee_Paid__c = 0;
                pmi.Total_Promotional_Activity_Paid__c = 0;
                pmi.Total_Training_and_Advocacy_Paid__c = 0;
                pmi.Total_Payments_Paid__c = 0;
                
                m_PMIs.put(pmi.Id, pmi);
            }

            Decimal rebateAmount = 0;
            Decimal actualQty = 0;
            Decimal listingFee = 0;
            Decimal promotionalActivity = 0;
            Decimal trainingAndAdvocacy = 0;
            Decimal actualInvestment = 0;
            Decimal totalDiscount = 0;
            Decimal packQty = 0;

            Promotion__c p;
            Promotion_Material_Item__c pmi;
            for(PMI_Actual__c pmia : psa.PMI_Actuals__r) {
                rebateAmount = pmia.Rebate_Amount__c == null ? 0 : pmia.Rebate_Amount__c;
                
                /*
                p = m_Promotions.get(pmia.Promotion__c);
                if (p.Total_Actual_Discount__c == null) { p.Total_Actual_Discount__c = 0; }
                if (p.Total_Listing_Fee_Paid__c == null) { p.Total_Listing_Fee_Paid__c = 0; }
                if (p.Total_Promotional_Activity_Paid__c == null) { p.Total_Promotional_Activity_Paid__c = 0; }
                if (p.Total_Training_and_Advocacy_Paid__c == null) { p.Total_Training_and_Advocacy_Paid__c = 0; }
                */
                pmi = m_PMIs.get(pmia.Promotion_Material_Item__c);

                System.debug('[rebateType: ' + pmia.Rebate_Type__c);
                System.debug('[rebateAmount: ' + pmia.Rebate_Amount__c);
                if (pmia.Rebate_Type__c == 'Listing Fee') {
                    psa.Total_Listing_Fee_Paid__c += rebateAmount;
                    //p.Total_Listing_Fee_Paid__c += rebateAmount;
                    pmi.Total_Listing_Fee_Paid__c += rebateAmount;
                } else if (pmia.Rebate_Type__c == 'Promotional Activity') {
                    psa.Total_Promotional_Activity_Paid__c += rebateAmount;
                    //p.Total_Promotional_Activity_Paid__c += rebateAmount;
                    pmi.Total_Promotional_Activity_Paid__c += rebateAmount;
                } else if (pmia.Rebate_Type__c == 'Training & Advocacy') {
                    psa.Total_Training_and_Advocacy_Paid__c += rebateAmount;
                    //p.Total_Training_and_Advocacy_Paid__c += rebateAmount;
                    pmi.Total_Training_and_Advocacy_Paid__c += rebateAmount;
                } else if (pmia.Rebate_Type__c == 'Payment') {
                    psa.Total_Payments_Paid__c += rebateAmount;
                    pmi.Total_Payments_Paid__c += rebateAmount;
                } else if (pmia.Rebate_Type__c == 'Volume') {
                    actualQty = pmia.Act_Qty__c == null ? 0 : pmia.Act_Qty__c;
                    packQty = pmi.Product_Pack_Qty__c == null ? 1 : pmi.Product_Pack_Qty__c;
                    //if (psa.Market__r.Capture_Volume_in_Bottles__c) {
                    //    actualQty = actualQty * packQty;
                    //}
                    
                    System.debug('[actualQty: ' + actualQty);
                    totalDiscount = actualQty * pmia.Promotion_Material_Item__r.Plan_Rebate__c;

                    psa.Total_Actual_Volume__c += actualQty;        
                    psa.Total_Actual_Volume_Bottles__c += actualQty * packQty;            
                    psa.Total_Actual_Discount__c += totalDiscount;
                    //p.Total_Actual_Discount__c += totalDiscount;
                    pmi.Total_Actual_Volume__c += actualQty;
                }

                //m_Promotions.put(p.Id, p);
                m_PMIs.put(pmi.Id, pmi);

            }

            psa.Total_Actual_Investment__c = psa.Total_Actual_Discount__c + psa.Total_Listing_Fee_Paid__c + psa.Total_Promotional_Activity_Paid__c + psa.Total_Training_and_Advocacy_Paid__c;

            /*
            if (m_Promotions.size() > 0) {
                update m_Promotions.values();
            }
            */
            if (m_PMIs.size() > 0) {
                update m_PMIs.values();
            }

            update psa;
        }catch(Exception ex) {
            msg = ex.getMessage();   
            System.debug('update totals exception ' + ex.getMessage());         
        }
        return msg;
    }
    
    @AuraEnabled 
    public static String updatePMITotals(String psaId) {
        String msg = 'OK';

        try {
            Promotion_Activity__c psa = [SELECT Id, Total_Volume__c, Total_Discount__c, Total_Listing_Fee__c, Total_Promotional_Activity__c, Total_Training_and_Advocacy__c, Total_Investment__c,
                                            Original_Total_Investment__c, Status__c, Is_Approved__c, Market__r.Capture_Volume_in_Bottles__c, Total_Planned_Spend__c,
                                            Market__r.Calculate_PSA_Product_Split__c, Activity_Budget__c, Total_Volume_Bottles__c,
                                                (SELECT Id, Total_Listing_Fee__c, Total_Promotional_Activity__c, Total_Training_and_Advocacy__c, Total_Planned_Discount__c 
                                                   FROM Promotions__r),
                                                (SELECT Id, Promotion__c, Product_Custom__c, Plan_Volume__c, Plan_Rebate__c, Listing_Fee__c, Promotional_Activity_Value__c, 
                                                        Training_and_Advocacy_Value__c, Total_Investment__c, Product_Pack_Qty__c, Product_Custom__r.Gross_Profit_per_Case__c,
                                                        Product_Split__c
                                                   FROM Promotion_Material_Items__r)
                                        FROM Promotion_Activity__c 
                                        WHERE Id =:psaId];
            
            psa.Total_Volume__c = 0;
            psa.Total_Volume_Bottles__c = 0;
            psa.Total_Discount__c = 0;
            psa.Total_Listing_Fee__c = 0;
            psa.Total_Promotional_Activity__c = 0;
            psa.Total_Training_and_Advocacy__c = 0;
            psa.Total_Investment__c = 0;
            psa.Total_Planned_Spend__c = 0;

            /*
            Map<Id, Promotion__c> m_Promotions = new Map<Id, Promotion__c>();            
            for(Promotion__c p : psa.Promotions__r) {
                p.Total_Planned_Discount__c = 0;
                p.Total_Listing_Fee__c = 0;
                p.Total_Promotional_Activity__c = 0;
                p.Total_Training_and_Advocacy__c = 0; 
            }
            */
            Decimal volume = 0;
            Decimal rebate = 0;
            Decimal listingFee = 0;
            Decimal promotionalActivity = 0;
            Decimal trainingAdvocacy = 0;
            Decimal totalInvestment = 0;
            Decimal totalPlannedSpend = 0;
            Decimal grossSellingPrice = 0;
            Decimal packQty = 0;
            for(Promotion_Material_Item__c pmi : psa.Promotion_Material_Items__r) {
                volume = pmi.Plan_Volume__c == null ? 0 : pmi.Plan_Volume__c;
                rebate = pmi.Plan_Rebate__c == null ? 0 : pmi.Plan_Rebate__c;
                listingFee = pmi.Listing_Fee__c == null ? 0 : pmi.Listing_Fee__c;
                promotionalActivity = pmi.Promotional_Activity_Value__c == null ? 0 : pmi.Promotional_Activity_Value__c;
                trainingAdvocacy = pmi.Training_and_Advocacy_Value__c == null ? 0 : pmi.Training_and_Advocacy_Value__c;
                totalInvestment = pmi.Total_Investment__c == null ? 0 : pmi.Total_Investment__c;

                grossSellingPrice = pmi.Product_Custom__r == null || pmi.Product_Custom__r.Gross_Profit_per_Case__c == null ? 0 : pmi.Product_Custom__r.Gross_Profit_per_Case__c;
                psa.Total_Planned_Spend__c += (volume / 9) * grossSellingPrice;
                System.debug('Total Planned Spend: ' + psa.Total_Planned_Spend__c);
                System.debug('gross profit per case: ' + grossSellingPrice);
                System.debug('volume: ' + volume);

                packQty = pmi.Product_Pack_Qty__c == null ? 1 : pmi.Product_Pack_Qty__c;
                //if (psa.Market__r.Capture_Volume_in_Bottles__c) {
                //    volume = volume * packQty;
                //}
    
                psa.Total_Volume__c += volume;
                psa.Total_Volume_Bottles__c += volume * packQty;
                psa.Total_Discount__c += volume * rebate;
                psa.Total_Listing_Fee__c += listingFee;
                psa.Total_Promotional_Activity__c += promotionalActivity;
                psa.Total_Training_and_Advocacy__c += trainingAdvocacy;
                psa.Total_Investment__c += totalInvestment;

                /*
                for(Promotion__c p : psa.Promotions__r) {
                    p.Total_Planned_Discount__c = pmi.Plan_Volume__c * pmi.Plan_Rebate__c;
                    p.Total_Listing_Fee__c += pmi.Listing_Fee__c;
                    p.Total_Promotional_Activity__c += pmi.Promotional_Activity_Value__c;
                    p.Total_Training_and_Advocacy__c += pmi.Training_and_Advocacy_Value__c;
                }
                */
            }
            System.debug('calc psa split: ' + psa.Market__r.Calculate_PSA_Product_Split__c);
            if (psa.Market__r.Calculate_PSA_Product_Split__c) {
                Decimal goalPrice = 0;
                Decimal nineLitreCases = 0;
                for(Promotion_Material_Item__c pmi : psa.Promotion_Material_Items__r) {
                    volume = pmi.Plan_Volume__c == null ? 0 : pmi.Plan_Volume__c;

                    grossSellingPrice = pmi.Product_Custom__r == null || pmi.Product_Custom__r.Gross_Profit_per_Case__c == null ? 0 : pmi.Product_Custom__r.Gross_Profit_per_Case__c;

                    nineLitreCases = volume / 9;
                    goalPrice = nineLitreCases * grossSellingPrice;
                    pmi.Product_Split__c = (goalPrice / psa.Total_Planned_Spend__c) * psa.Activity_Budget__c;
                    System.debug('volume: ' + volume);
                    System.debug('packQty: ' + packQty);
                    System.debug('nineLitreCases: ' + nineLitreCases);
                    System.debug('goalPrice: ' + goalPrice);
                    System.debug('grossSellingPrice: ' + grossSellingPrice);
                    System.debug('product split: ' + pmi.Product_Split__c);
                }
                update psa.Promotion_Material_Items__r;

            }

            if (!psa.Is_Approved__c) {
                psa.Original_Total_Investment__c = psa.Total_Investment__c;
            }

            //update psa.Promotions__r;
            update psa;
        }catch(Exception ex) {
            msg = ex.getMessage();   
            System.debug('update pmi totals exception ' + ex.getMessage());         
        }
        return msg;
    }

    @AuraEnabled 
    public static String detachDocument(String psaId, String documentId) {
        String result = 'OK';
        try {
            List<ContentDocumentLink> documentLinks = [SELECT Id FROM ContentDocumentLink 
            WHERE ContentDocumentId =:documentId 
              AND LinkedEntityId =:psaId];

            if (documentLinks != null && documentLinks.size() > 0) {
                delete documentLinks;
            }    

        }catch(Exception ex) {
            result = ex.getMessage();
        }

        return result;
    }

    @AuraEnabled 
    public static String submitForApproval(String psaId) {
        String msg = 'OK';
        try {
            Promotion_Activity__c psa = [SELECT Id, Status__c FROM Promotion_Activity__c WHERE Id =:psaId];
            if (psa != null) {
                psa.Status__c = 'Submitted';
                update psa;

                /*
                *  Note.  By setting the Status to Submitted will trigger the Promotion Activity - UK process
                *  which will submit the record for approval
                */
            }
        } catch(Exception ex) {
            msg = ex.getMessage();
        }

        return msg;
    }
    @AuraEnabled 
    public static String recallApproval(String psaId) {
        String msg = 'OK';
        try {
            List<ProcessInstanceWorkitem> workItems = [SELECT Id FROM ProcessInstanceWorkitem WHERE ProcessInstance.TargetObjectId =: psaId];
            if (workItems != null && workItems.size() > 0) {
                Approval.ProcessWorkitemRequest pwr = new Approval.ProcessWorkitemRequest();
                pwr.setAction('Removed');
                pwr.setWorkitemId(workItems[0].Id);
                Approval.ProcessResult result = Approval.process(pwr);
                if (!result.isSuccess()) {
                    List<Database.Error> errors = result.getErrors();
                    for(Database.Error de : errors) {
                        msg += de.getMessage();
                    }                    
                }
            }
        } catch(Exception ex) {
            msg = ex.getMessage();
        }

        return msg;
    }

    @AuraEnabled 
    public static SimpleListItem clonePSA(String psaId, String newName) {
        SimpleListItem sli = new SimpleListItem('', 'OK', true, '');

        try {
            Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordType.Name, Account__c, Account__r.Name, Account__r.RecordTypeId, Account__r.RecordType.Name,
                                                Account__r.ShippingStreet, Account__r.ShippingCity, Account__r.ShippingState, Account__r.ShippingCountry, Account__r.ShippingPostalCode,
                                                Contact__c, Contact__r.Name, Begin_Date__c, End_Date__c, Length_of_Agreement__c, Is_Length_in_Years__c, Channel__c,
                                                Premise__c, Market__c, Market__r.Name, Status__c, Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                                Wholesaler_Alternate__c, Wholesaler_Alternate_Name__c, Total_Listing_Fee__c, Total_Listing_Fee_Paid__c,
                                                Total_Promotional_Activity__c, Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy__c, Reminder_Date__c,
                                                Is_Approved__c, Date_Approved__c, Total_Training_and_Advocacy_Paid__c, Total_Volume__c, Total_Actual_Volume__c, Purchase_Order__c,
                                                (SELECT Id, Account__c, AccountName__c, Account__r.ShippingStreet, Account__r.ShippingCity, Account__r.ShippingState, 
                                                        Account__r.ShippingCountry, Account__r.ShippingPostalCode, Total_Actual_Qty__c, Total_Listing_Fee_Paid__c, 
                                                        Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy_Paid__c FROM Promotions__r),
                                                (SELECT Id, Promotion__c, Product_Custom__c, Product_Name__c, Brand__c, Approval_Status__c, Plan_Volume__c, Plan_Rebate__c, 
                                                        Brand_Status__c, Drink_Strategy__c, Outlet_to_Provide__c, Status__c, Listing_Fee__c, Promotional_Activity__c,
                                                        Promotional_Activity_Value__c, Quantity__c, Training_and_Advocacy__c, Training_and_Advocacy_Value__c,
                                                        Total_Investment__c, Comments_Long__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c,
                                                        Total_Training_and_Advocacy_Paid__c, Total_Actual_Volume__c FROM Promotion_Material_Items__r)
                                        FROM Promotion_Activity__c 
                                        WHERE Id =:psaId];

            Promotion_Activity__c newPSA = psa.clone(false, true, false, false);
            Date today = Date.today();
            if (newName == null || newName == '') {
                newPSA.Name = 'PSA_' + today.year() + today.month() + today.day();
            } else {
                newPSA.Name = newName;
            }
            newPSA.Status__c = 'New';
            newPSA.Is_Approved__c = false;
            newPSA.Date_Approved__c = null;
            newPSA.Total_Listing_Fee_Paid__c = 0;
            newPSA.Total_Promotional_Activity_Paid__c = 0;
            newPSA.Total_Training_and_Advocacy_Paid__c = 0;
            newPSA.Total_Actual_Volume__c = 0;
            newPSA.Purchase_Order__c = '';
            newPSA.Begin_Date__c = Date.today();
            if (newPSA.Is_Length_in_Years__c) {
                newPSA.End_Date__c = newPSA.Begin_Date__c.addYears(Integer.valueOf(newPSA.Length_of_Agreement__c));
            } else {
                newPSA.End_Date__c = newPSA.Begin_Date__c.addMonths(Integer.valueOf(newPSA.Length_of_Agreement__c));
            }

            insert newPSA;
            sli.id = newPSA.Id;

            List<Promotion__c> newPromotions = new List<Promotion__c>();
            for(Promotion__c p : psa.Promotions__r) {
                Promotion__c newPromo = p.clone(false, true, false, false);
                newPromo.Promotion_Activity__c = newPSA.Id;
                newPromo.Total_Listing_Fee_Paid__c = 0;
                newPromo.Total_Promotional_Activity_Paid__c = 0;
                newPromo.Total_Training_and_Advocacy_Paid__c = 0;
                newPromotions.add(newPromo);
            }
            if (newPromotions.size() > 0) {
                insert newPromotions;
            }

            List<Promotion_Material_Item__c> newPMIs = new List<Promotion_Material_Item__c>();
            for(Promotion_Material_Item__c pmi : psa.Promotion_Material_Items__r) {
                Promotion_Material_Item__c newPMI = pmi.clone(false, true, false, false);
                newPMI.Activity__c = newPSA.Id;
                newPMI.Promotion__c = newPromotions[0].Id;
                newPMI.Total_Listing_Fee_Paid__c = 0;
                newPMI.Total_Promotional_Activity_Paid__c = 0;
                newPMI.Total_Training_and_Advocacy_Paid__c = 0;
                newPMI.Total_Actual_Volume__c = 0;
                newPMIs.add(newPMI);
            }
            if (newPMIs.size() > 0) {
                insert newPMIs;
            }
        }catch(Exception ex) {
            sli.selected = false;
            sli.description = ex.getMessage();
        }
        return sli;
    }

    @AuraEnabled 
    public static String sendDocuSignEnvelope(String psaId, String contactId) {
        String msg = 'OK';
        Promotion_Activity__c psa = [SELECT Id, Name, Send_by_DocuSign__c FROM Promotion_Activity__c WHERE Id =:psaId];
        psa.Send_by_DocuSign__c = true;
        update psa;
/*
        try {
            Promotion_Activity__c theActivity = [SELECT Id, Send_by_DocuSign__c FROM Promotion_Activity__c WHERE Id =:psaId];
            theActivity.Send_by_DocuSign__c = true;
            update theActivity;
        } catch(Exception ex) {
            msg = ex.getMessage();
        }
*/
        /*
        String recipientId = UserInfo.getUserId();
        String recipientName = UserInfo.getUserName();
        String recipientEmail = UserInfo.getUserEmail();
        System.debug('[sendwithdocusign] contactid: ' + contactId);
        Contact decisionMaker = [SELECT Id, Name, Email FROM Contact WHERE Id =:contactId];
        if (decisionMaker != null) {
            recipientId = contactId;
            recipientName = decisionMaker.Name;
            recipientEmail = decisionMaker.Email;
        }
        dfsle.Envelope theEnvelope = dfsle.EnvelopeService.getEmptyEnvelope(new dfsle.Entity(psaId));
        dfsle.Recipient theRecipient = dfsle.Recipient.fromSource(
            recipientName, 
            recipientEmail, 
            null,                                       // Optional Phone Number
            'Signer 1',                                 // Role Name.  Specify the exact role name from template
            new dfsle.Entity(recipientId)      // Source object for the recipient
        );
        dfsle.Recipient theRecipient2 = dfsle.Recipient.fromSource(
            UserInfo.getUserName(), 
            UserInfo.getUserEmail(), 
            null,                                       // Optional Phone Number
            'Signer 2',                                 // Role Name.  Specify the exact role name from template
            new dfsle.Entity(UserInfo.getUserId())      // Source object for the recipient
        );


        theEnvelope = theEnvelope.withRecipients(new List<dfsle.Recipient> { theRecipient, theRecipient2 });

        
        dfsle.UUID theTemplateId = dfsle.UUID.parse('59a80dfb-aeb9-48e3-ac8c-f277b7405082');
        //dfsle.UUID theTemplateId = dfsle.UUID.parse('d65a6a14-3770-ea11-b80c-48df378a7098');
        dfsle.Document theDocument = dfsle.Document.fromTemplate(theTemplateId, 'UK PSA - Gen');
        System.debug('theDocument: ' + theDocument);
        List<ContentDocumentLink> cdlList = [SELECT ContentDocumentId FROM ContentDocumentLink WHERE LinkedEntityId =:psaId];
        if (cdlList != null && cdlList.size() > 0) {
            Set<Id> cdIds = new Set<Id>();
            for(ContentDocumentLink cdl : cdlList) {
                cdIds.add(cdl.ContentDocumentId);
            }
            List<ContentVersion> cvList = [SELECT Id FROM ContentVersion WHERE ContentDocumentId =:cdIds];
            if (cvList != null && cvList.size() > 0) {
                Set<Id> cvIds = new Set<Id>();
                for(ContentVersion cv : cvList) {
                    cdIds.add(cv.Id);
                }
                List<dfsle.Document> theDocuments = dfsle.DocumentService.getDocuments(ContentVersion.sObjectType, cvIds);
                theEnvelope = theEnvelope.withDocuments(theDocuments);
            } else {
                theEnvelope = theEnvelope.withDocuments(new List<dfsle.Document> { theDocument });
            }
        } else {
            theEnvelope = theEnvelope.withDocuments(new List<dfsle.Document> { theDocument });
        }

        theEnvelope = dfsle.EnvelopeService.sendEnvelope(theEnvelope, true);

        List<dfsle.Envelope.Status> envelopeStatus = dfsle.StatusService.getStatus(new Set<Id> { psaId }, 1);
        System.debug('# of statuses: ' + envelopeStatus.size());
        for(dfsle.Envelope.Status s : envelopeStatus) {
            System.debug('status: ' + s);
            msg += s + ',';
        }
        msg = msg.removeEnd(',');
        */
        return msg;
    }    

}