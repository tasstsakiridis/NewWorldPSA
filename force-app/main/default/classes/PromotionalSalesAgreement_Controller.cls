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

    @AuraEnabled(Cacheable=true)
    public static Market__c getUserMarket() {
        User u = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        String marketName = 'Australia';
        if (u != null && u.Market__c != null) {
            marketName = u.Market__c;
        }
        Market__c market = [SELECT Id, Name, Maximum_Agreement_Length__c FROM Market__c WHERE Name =:marketName LIMIT 1];
        return market;
    }

    @AuraEnabled(cacheable=true)
    public static Promotion_Activity__c getPSA(String psaId){
        return [SELECT Id, Name, RecordTypeId, RecordType.Name, Account__c, Account__r.Name, Account__r.RecordTypeId, Account__r.RecordType.Name,
                                            Account__r.ShippingStreet, Account__r.ShippingCity, Account__r.ShippingState, Account__r.ShippingCountry, Account__r.ShippingPostalCode,
                                            Contact__c, Contact__r.Name, Begin_Date__c, End_Date__c, Length_of_Agreement__c, Is_Length_in_Years__c, Channel__c,
                                            Premise__c, Market__c, Market__r.Name, Status__c, Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                            Wholesaler_Alternate__c, Wholesaler_Alternate_Name__c, Total_Listing_Fee__c, Total_Listing_Fee_Paid__c,
                                            Total_Promotional_Activity__c, Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy__c, 
                                            Total_Training_and_Advocacy_Paid__c, Total_Volume__c, Total_Actual_Volume__c,
                                            (SELECT Id, Account__c, AccountName__c, Account__r.ShippingStreet, Account__r.ShippingCity, Account__r.ShippingState, 
                                                    Account__r.ShippingCountry, Account__r.ShippingPostalCode, Total_Actual_Qty__c, Total_Listing_Fee_Paid__c, 
                                                    Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy_Paid__c FROM Promotions__r),
                                            (SELECT Id, Promotion__c, Product_Custom__c, Product_Name__c, Brand__c, Approval_Status__c, Plan_Volume__c, Plan_Rebate__c, 
                                                    Brand_Status__c, Drink_Strategy__c, Outlet_to_Provide__c, Status__c, Listing_Fee__c, Promotional_Activity__c,
                                                    Promotional_Activity_Value__c, Quantity__c, Training_and_Advocacy__c, Training_and_Advocacy_Value__c,
                                                    Total_Investment__c, Comments_Long__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c,
                                                    Total_Training_and_Advocacy_Paid__c FROM Promotion_Material_Items__r), 
                                            (SELECT Id, Activity__c, Promotion__c, Promotion_Material_Item__c, Account__c, Account_Name__c, Act_Qty__c,
                                                    Approval_Status__c, Brand_Name__c, External_Key__c, Payment_Date__c, Period__c, RecordTypeId, 
                                                    Product__c, Product_Name__c, Actual_Wholesaler__c, Actual_Wholesaler__r.Name, Listing_Fee__c,
                                                    Promotional_Activity__c, Training_and_Advocacy__c FROM PMI_Actuals__r ORDER BY Payment_Date__c)
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

        String soql = 'SELECT Id, Name, Begin_Date__c, End_Date__c, Account__c, Account_Name__c, Status__c, ';
        soql += ' FROM Promotion_Activity__c';
        if (criteria.size() > 0) {
            soql += ' WHERE ' + String.join(criteria, ' AND ');
        }
        soql += ' WITH SECURITY_ENFORCED ORDER BY Begin_End__c LIMIT :pageSize OFFSET :offset';

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
    public static Account getAccountById(String accountId) {
        return [SELECT Id, Name, ShippingStreet, ShippingCity, ShippingCountry, ShippingPostalCode, ShippingState,
                    (SELECT Id, Name FROM Contacts WHERE Decision_Maker__c = true)
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
            soql += ' AND RecordType.Name = \'Parent\'';
        } else {
            soql += ' AND RecordType.Name != \'Parent\'';

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
                       Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy_Paid__c
                  FROM Promotion_Material_Item__c 
                 WHERE Id =:psaItemId];
    }

    @AuraEnabled(cacheable=true)
    public static Product__c getProductDetails(String productId) {
        return [SELECT Id, Name, Brand__c, Brand_Name__c, Image_Name__c 
                  FROM Product__c 
                 WHERE Id =:productId];
    }

    @AuraEnabled(cacheable=true)
    public static PagedResult getProducts(Integer pageNumber) {
        Integer pageSize = 50;
        Integer offset = (pageNumber - 1) * pageSize;
        
        String marketName = 'Australia';
        User u = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        if (u.Market__c != null) { marketName = u.Market__c; }
        Market__c market = [SELECT Id FROM Market__c WHERE Name =:marketName LIMIT 1];
        String marketId = market.Id;

        String soql = 'SELECT Id, Name, Brand__c, Brand_Name__c, Image_Name__c FROM Product__c WHERE IsActive__c = true AND RecordType.Name = \'Wet Goods\' AND Market__c =:marketId';
        soql += ' WITH SECURITY_ENFORCED ORDER BY Name LIMIT :pageSize OFFSET :offset';
        PagedResult result = new PagedResult();
        result.pageSize = pageSize;
        result.records = Database.query(soql);

        result.totalItemCount = result.records.size();

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
                                        AND Market__c =:market.Id];

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
                       Promotion_Material_Item__r.Promotional_Activity_Value__c, Promotion_Material_Item__r.Training_and_Advocacy_Value__c
                  FROM PMI_Actual__c 
                 WHERE Id =:pmiaId];
    }

    @AuraEnabled
    public static Promotion_Material_Item__c getPMIDetails(String pmiId) {
        return [SELECT Id, Name, Activity__c, Product_Custom__c, Product_Name__c, Plan_Volume__c, Plan_Rebate__c
                  FROM Promotion_Material_Item__c 
                 WHERE Id =:pmiId];
    }


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
            Promotion_Activity__c psa = new Promotion_Activity__c();
            psa.Id = psaData.id;
            psa.Begin_Date__c = psaData.beginDate;
            psa.End_Date__c = psaData.endDate;
            psa.Length_of_Agreement__c = Integer.valueOf(psaData.lengthOfPSA);
            psa.Account__c = psaData.parentAccountId;
            psa.Contact__c = psaData.signingCustomerId;
            psa.Wholesaler_Preferred__c = psaData.wholesalerPreferredId;
            psa.Wholesaler_Preferred_Name__c = psaData.wholesalerPreferredName;
            psa.Wholesaler_Alternate__c = psaData.wholesalerAlternateId;
            psa.Wholesaler_Alternate_Name__c = psaData.wholesalerAlternateName;

            if (psaData.marketId == null || psaData.marketId == '') {
                String marketName = psaData.marketName;
                if (psaData.marketName == null || psaData.marketName == '') {
                    marketName = [SELECT Id, Market__c FROM User WHERE Id =:UserInfo.getUserId() LIMIT 1].Market__c;
                }

                if (marketName != '') {
                    Market__c m = [SELECT Id FROM Market__c WHERE Name =:marketName LIMIT 1];
                    psa.Market__c = m.Id;
                }
            }

            update psa;

            if (psaData.accounts != null && psaData.accounts.size() > 0) {
                String rtUKPSAPromotion = '';
                Map<String, Schema.RecordTypeInfo> rtiList = Promotion__c.SObjectType.getDescribe().getRecordTypeInfosByName();
                if (rtiList.containsKey('UK - PSA')) {
                    rtUKPSAPromotion = rtiList.get('UK - PSA').getRecordTypeId();
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
        
        Map<String, Schema.RecordTypeInfo> rtiList = Promotion_Material_Item__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        if (rtiList.containsKey('UK - PSA')) {
            rtUKPSA = rtiList.get('UK - PSA').getRecordTypeId();
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
                    pmi.Quantity__c = psaData.items[i].volumeForecast;
                    pmi.Discount__c = psaData.items[i].discount;
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
            }
        } catch(Exception ex) {
            msg = ex.getMessage();
        }
        
        return msg;
    }

    @AuraEnabled 
    public static String updateActualTotals(String psaId) {
        String msg = 'OK';

        try {
            Promotion_Activity__c psa = [SELECT Id, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy_Paid__c,
                                                (SELECT Id, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, 
                                                        Total_Training_and_Advocacy_Paid__c FROM Promotions__r),
                                                (SELECT Id, Promotion__c, Product_Custom__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, 
                                                        Total_Training_and_Advocacy_Paid__c, Total_Actual_Volume__c FROM Promotion_Material_Items__r), 
                                                (SELECT Id, Activity__c, Promotion__c, Promotion_Material_Item__c, Act_Qty__c, Listing_Fee__c, 
                                                        Promotional_Activity__c, Training_and_Advocacy__c FROM PMI_Actuals__r)
                                        FROM Promotion_Activity__c 
                                        WHERE Id =:psaId];
            
            psa.Total_Actual_Volume__c = 0;
            psa.Total_Listing_Fee_Paid__c = 0;
            psa.Total_Promotional_Activity_Paid__c = 0;
            psa.Total_Training_and_Advocacy_Paid__c = 0;

            Map<Id, Promotion__c> m_Promotions = new Map<Id, Promotion__c>();
            for(Promotion__c p : psa.Promotions__r) {
                m_Promotions.put(p.Id, p);
            }
            Map<Id, Promotion_Material_Item__c> m_PMIs = new Map<Id, Promotion_Material_Item__c>();
            for(Promotion_Material_Item__c pmi : psa.Promotion_Material_Items__r) {
                m_PMIs.put(pmi.Id, pmi);
            }

            Decimal actualQty = 0;
            Decimal listingFee = 0;
            Decimal promotionalActivity = 0;
            Decimal trainingAndAdvocacy = 0;

            Promotion__c p;
            Promotion_Material_Item__c pmi;
            for(PMI_Actual__c pmia : psa.PMI_Actuals__r) {
                actualQty = pmia.Act_Qty__c == null ? 0 : pmia.Act_Qty__c;
                listingFee = pmia.Listing_Fee__c == null ? 0 : pmia.Listing_Fee__c;
                promotionalActivity = pmia.Promotional_Activity__c == null ? 0 : pmia.Promotional_Activity__c;
                trainingAndAdvocacy = pmia.Training_and_Advocacy__c == null ? 0 : pmia.Training_and_Advocacy__c;

                psa.Total_Actual_Volume__c += actualQty;
                psa.Total_Listing_Fee_Paid__c += listingFee;
                psa.Total_Promotional_Activity_Paid__c += promotionalActivity;
                psa.Total_Training_and_Advocacy_Paid__c += trainingAndAdvocacy;

                p = m_Promotions.get(pmia.Promotion__c);
                if (p.Total_Listing_Fee_Paid__c == null) { p.Total_Listing_Fee_Paid__c = 0; }
                if (p.Total_Promotional_Activity_Paid__c == null) { p.Total_Promotional_Activity_Paid__c = 0; }
                if (p.Total_Training_and_Advocacy_Paid__c == null) { p.Total_Training_and_Advocacy_Paid__c = 0; }

                p.Total_Listing_Fee_Paid__c += listingFee;
                p.Total_Promotional_Activity_Paid__c += promotionalActivity;
                p.Total_Training_and_Advocacy_Paid__c += trainingAndAdvocacy;
                m_Promotions.put(p.Id, p);

                pmi = m_PMIs.get(pmia.Promotion_Material_Item__c);
                if (pmi.Total_Actual_Volume__c == null) { pmi.Total_Actual_Volume__c = 0; }
                if (pmi.Total_Listing_Fee_Paid__c == null) { pmi.Total_Listing_Fee_Paid__c = 0; }
                if (pmi.Total_Promotional_Activity_Paid__c == null) { pmi.Total_Promotional_Activity_Paid__c = 0; }
                if (pmi.Total_Training_and_Advocacy_Paid__c == null) { pmi.Total_Training_and_Advocacy_Paid__c = 0; }

                pmi.Total_Listing_Fee_Paid__c += listingFee;
                pmi.Total_Promotional_Activity_Paid__c += promotionalActivity;
                pmi.Total_Training_and_Advocacy_Paid__c += trainingAndAdvocacy;
                pmi.Total_Actual_Volume__c += actualQty;
            }

            if (m_Promotions.size() > 0) {
                update m_Promotions.values();
            }
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
            Promotion_Activity__c psa = [SELECT Id, Total_Volume__c, Total_Listing_Fee__c, Total_Promotional_Activity__c, Total_Training_and_Advocacy__c,
                                                (SELECT Id, Total_Listing_Fee__c, Total_Promotional_Activity__c, 
                                                        Total_Training_and_Advocacy__c FROM Promotions__r),
                                                (SELECT Id, Promotion__c, Product_Custom__c, Plan_Volume__c, Listing_Fee__c, Promotional_Activity_Value__c, 
                                                        Training_and_Advocacy_Value__c FROM Promotion_Material_Items__r)
                                        FROM Promotion_Activity__c 
                                        WHERE Id =:psaId];
            
            psa.Total_Volume__c = 0;
            psa.Total_Listing_Fee__c = 0;
            psa.Total_Promotional_Activity__c = 0;
            psa.Total_Training_and_Advocacy__c = 0;

            Map<Id, Promotion__c> m_Promotions = new Map<Id, Promotion__c>();            
            for(Promotion__c p : psa.Promotions__r) {
                p.Total_Listing_Fee__c = 0;
                p.Total_Promotional_Activity__c = 0;
                p.Total_Training_and_Advocacy__c = 0; 
            }
            for(Promotion_Material_Item__c pmi : psa.Promotion_Material_Items__r) {
                psa.Total_Volume__c += pmi.Plan_Volume__c;
                psa.Total_Listing_Fee__c += pmi.Listing_Fee__c;
                psa.Total_Promotional_Activity__c += pmi.Promotional_Activity_Value__c;
                psa.Total_Training_and_Advocacy__c += pmi.Training_and_Advocacy_Value__c;

                for(Promotion__c p : psa.Promotions__r) {
                    p.Total_Listing_Fee__c += pmi.Listing_Fee__c;
                    p.Total_Promotional_Activity__c += pmi.Promotional_Activity_Value__c;
                    p.Total_Training_and_Advocacy__c += pmi.Training_and_Advocacy_Value__c;
                }
            }

            update psa.Promotions__r;
            update psa;
        }catch(Exception ex) {
            msg = ex.getMessage();   
            System.debug('update pmi totals exception ' + ex.getMessage());         
        }
        return msg;
    }
}
