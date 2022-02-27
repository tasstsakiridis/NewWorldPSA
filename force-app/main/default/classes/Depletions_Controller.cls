public with sharing class Depletions_Controller {
    /*
    public class depletionWrapper {
        @AuraEnabled 
        public String id { get; set }
        
        @AuraEnabled 
        public String recordTypeId { get; set; }

        @AuraEnabled 
        public String accountId { get; set; }

        @AuraEnabled 
        public String activityId { get; set; }

        @AuraEnabled 
        public String wholesalerId { get; set; }

        @AuraEnabled 
        public String month { get; set; }

        @AuraEnabled 
        public decimal bottles { get; set; }

        @AuraEnabled 
        public decimal volume { get; set; }

        public depletionWrapper() {
            id = '';
            recordTypeId = '';
            accountId = '';
            activityId = '';
            wholesalerId = '';
            month = '';
            bottles = 0;
            volume = 0;
        }
    }
    */
    private static String getUserMarket() {
        String marketName = 'Australia';
        User u = [SELECT Id, Name, Market__c FROM User WHERE Id =:UserInfo.getUserId()];
        if (String.isNotEmpty(u.Market__c)) {
            marketName = u.Market__c;
        }

        Market__c m = [SELECT Id, Name FROM Market__c WHERE Name =:marketName LIMIT 1];
        String marketId = '';
        if (m != null) {
            marketId = m.Id;
        }

        return marketId;
    }

    @AuraEnabled(cacheable=true)
    public static List<Depletion__c> getDepletions(String accountId){
        system.debug('accountId: ' + accountId);
        return [SELECT Id, Custom_Product__c, RecordTypeId, RecordType.Name, Product_Name__c, Activity__c, Activity_Name__c, Bottles__c,
                        Month_Text__c, Volume9L__c, Wholesaler__c, Wholesaler_Name__c
                FROM Depletion__c 
                WHERE Account__c =:accountId];
    }

    @AuraEnabled(cacheable=true) 
    public static Account getAccount(String accountId) {
        if (String.isEmpty(accountId)) {
            throw new AuraHandledException('Account Id is blank.');
        }

        return [SELECT Id, Name, Market__c, Market__r.Capture_Volume_in_Bottles__c,
                        (SELECT Id, Promotion_Activity__c, Promotion_Activity__r.Name, Promotion_Activity__r.Wholesaler_Preferred__c, Promotion_Activity__r.Wholesaler_Preferred_Name__c,
                                Promotion_Activity__r.Wholesaler_Alternate__c, Promotion_Activity__r.Wholesaler_Alternate_Name__c
                           FROM Promotions__r 
                          WHERE Promotion_Activity__r.End_Date__c > TODAY),
                        (SELECT Id, Custom_Product__c, RecordTypeId, RecordType.Name, Product_Name__c, Activity__c, Activity_Name__c, Bottles__c,
                                Month_Text__c, Volume9L__c, Wholesaler__c, Wholesaler_Name__c
                           FROM Depletions__r)
                  FROM Account 
                 WHERE Id =:accountId];
    }

    @AuraEnabled 
    public static List<Product__c> getProducts(String accountId) {
        System.debug('accountId: ' + accountId);
        String marketId = '';
        if (String.isEmpty(accountId)) {
            marketId = getUserMarket();
        } else {
            Account a = [SELECT Id, Name, Market__c FROM Account WHERE Id =:accountId];
            if (a != null) {
                marketId = a.Market__c;
            } else {
                marketId = getUserMarket();
            }
        }

        return [SELECT Id, Name, Brand__c, Brand_Name__c, Consolidated_Name__c, Pack_Quantity__c, Unit_Size__c,
                        (SELECT Id, Name, Activity__c, Activity_Name__c FROM Promotion_Material_Items__r WHERE Activity__r.End_Date__c > TODAY) 
                  FROM Product__c 
                 WHERE IsActive__c = true
                   AND Market__c =:marketId
                   AND RecordType.DeveloperName = 'Wet_Goods'
                   AND (Channel__c = 'On' OR Channel__c = 'Both')
                   AND Supplier__c = 'B-F'
                ORDER BY Sort_Order__c];
    }
    
}