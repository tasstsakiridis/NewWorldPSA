@isTest(SeeAllData=true)
private class BuildActualsForPSA_Test {
    static testMethod void unitTest1() {
        INFW_TestHelper helper = new INFW_TestHelper();

        Map<String, RecordTypeInfo> aRecordTypes = Schema.SObjectType.Account.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> cRecordTypes = Schema.SObjectType.Contact.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pRecordTypes = Schema.SObjectType.Product__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> wRecordTypes = Schema.SObjectType.Wholesaler__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> paRecordTypes = Schema.SObjectType.Promotion_Activity__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> promoRecordTypes = Schema.SObjectType.Promotion__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pmiRecordTypes = Schema.SObjectType.Promotion_Material_Item__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pmiaRecordTypes = Schema.SObjectType.PMI_Actual__c.getRecordTypeInfosByName();

        
        String rtWholesaler = wRecordTypes.get('United Kingdom').getRecordTypeId();
        String rtAccount_UK = aRecordTypes.get('United Kingdom - On Premise').getRecordTypeId();
        String rtParentAccount_UK = aRecordTypes.get('Parent').getRecordTypeId();
        String rtContact_UK = cRecordTypes.get('UK - Contacts').getRecordTypeId();
        String rtWetGoods = pRecordTypes.get('Wet Goods').getRecordTypeId();
        String rtPSAActivity = paRecordTypes.get('UK - PSA').getRecordTypeId();
        String rtPSAPromotion = promoRecordTypes.get('UK - PSA').getRecordTypeId();
        String rtPSAPMI = pmiRecordTypes.get('UK - PSA').getRecordTypeId();
        String rtPSAPMIA = pmiaRecordTypes.get('UK - PSA').getRecordTypeId();

        User manager = helper.createUser('System Administrator', 'Test', 'Manager', 'United Kingdom');
        insert manager;

        User user1 = helper.createUser('System Administrator','Test','User', 'United Kingdom');
        user1.ManagerId = manager.Id;
        insert user1;
        
        System.runAs(user1) {
            Market__c mUK = helper.createMarket('United Kingdom');
            mUK.Country_ISO_Code_2__c = 'GB';
            mUK.Country_ISO_Code_3__c = 'GBR';
            mUK.Maximum_Agreement_Length__c = 5;
            mUK.Spread_Planned_Values__c = true;
            mUK.Allow_Updates_After_Approval__c = true;
            insert mUK;

            Account parentAccount = helper.createAccount('Test UK Parent Account', mUK.Id, 'Wholesaler');
            parentAccount.RecordTypeId = rtParentAccount_UK;
            parentAccount.Status__c = 'Active';
            parentAccount.Is_Active__c = true;
            parentAccount.ShippingStreet = '8 Otley Road';
            parentAccount.ShippingCity = 'Leeds';
            parentAccount.ShippingState = '';
            parentAccount.ShippingPostalCode = 'LS20 8AH';
            parentAccount.ShippingCountry = 'United Kingdom';
            insert parentAccount;

            Account childAccount = helper.createAccount('Test UK Child Account', mUK.Id, 'On Premise');
            childAccount.RecordTypeId = rtAccount_UK;
            childAccount.ParentId = parentAccount.Id;
            childAccount.Is_Active__c = true;
            childAccount.Status__c = 'Active';
            childAccount.Sales_Route__c = 'WEST COAST';
            childAccount.ShippingStreet = '100 Acre Road';
            childAccount.ShippingCity = 'Glasgow';
            childAccount.ShippingPostalCode = 'G20 OTL';
            childAccount.ShippingCountry = 'United Kingdom';
            insert childAccount;

            Contact contact1 = helper.createContact('Test UK', 'Parent Contact', parentAccount.Id);
            contact1.Decision_Maker__c = true;
            contact1.RecordTypeId = rtContact_UK;
            
            Contact contact2 = helper.createContact('Test UK', 'Child Contact', childAccount.Id);
            contact2.Decision_Maker__c = true;
            contact2.RecordTypeId = rtContact_UK;

            Contact[] l_Contacts = new Contact[]{contact1, contact2};
            insert l_Contacts;

            Wholesaler__c wholesaler1 = new Wholesaler__c(RecordTypeId=rtWholesaler,Name='WholesalerPreferred',Wholesaler_Name__c='Wholesaler1',Market__c=mUK.Id,Is_Active__c=true);
            Wholesaler__c wholesaler2 = new Wholesaler__c(RecordTypeId=rtWholesaler,Name='WholesalerAlternate',Wholesaler_Name__c='Wholesaler2',Market__c=mUK.Id,Is_Active__c=true);
            Wholesaler__c[] l_Wholesaler = new Wholesaler__c[]{wholesaler1, wholesaler2};
            insert l_Wholesaler;

            Brand__c brand = new Brand__c(Name='Brand');
            insert brand;
            
            List<Product__c> products = helper.createProducts(3, 'Wet Goods', mUK.Id, brand.Id, false);
            insert products;
            
            Promotion_Activity__c psa1 = new Promotion_Activity__c();
            psa1.Name = 'Test PSA 1';
            psa1.RecordTypeId = rtPSAActivity;
            psa1.Begin_Date__c = Date.today();
            psa1.End_Date__c = psa1.Begin_Date__c.addDays(10);
            psa1.Account__c = parentAccount.Id;
            psa1.Contact__c = contact1.Id;
            psa1.Wholesaler_Preferred__c = wholesaler1.Id;
            psa1.Wholesaler_Preferred_Name__c = wholesaler1.Name;
            psa1.Is_Length_in_Years__c = false;
            psa1.Length_of_Agreement__c = 10;
            psa1.Reminder_Date__c = psa1.Begin_Date__c;
            psa1.Next_Email_Date__c = psa1.Begin_Date__c;
            psa1.Status__c = 'New';
            psa1.Market__c = mUK.Id;
            insert psa1;
            
            Promotion__c promo1 = new Promotion__c();
            promo1.Promotion_Activity__c = psa1.Id;
            promo1.RecordTypeId = rtPSAPromotion;
            promo1.Account__c = parentAccount.Id;
            insert promo1;
            
            Promotion_Material_Item__c pmi1 = new Promotion_Material_Item__c();
            pmi1.RecordTypeId = rtPSAPMI;
            pmi1.Promotion__c = promo1.Id;
            pmi1.Activity__c = psa1.Id;
            pmi1.Product_Custom__c = products[0].Id;
            pmi1.Plan_Volume__c = 10;
            pmi1.Plan_Rebate__c = 0;
            pmi1.Listing_Fee__c = 10000;
            pmi1.Promotional_Activity_Value__c = 12000;
            pmi1.Training_and_Advocacy_Value__c = 15000;
            pmi1.Proposed_Plan_Volume__c = 10;
            pmi1.Proposed_Listing_Fee__c = 10000;
            pmi1.Proposed_Promotional_Activity_Value__c = 12000;
            pmi1.Proposed_Training_Advocacy_Value__c = 15000;
            insert pmi1;
            
            String promotionId = promo1.Id;
            String wholesalerId = psa1.Wholesaler_Preferred__c;
            String externalKey = promotionId + '_' + pmi1.Id + '_0';
            PromotionalSalesAgreement_Controller.PSARebate rebate1 = new PromotionalSalesAgreement_Controller.PSARebate();
            rebate1.rebateType = 'Listing Fee';
            rebate1.rebateAmount = 1000.00;
            rebate1.isVolumeRebate = false;
            rebate1.hasTotals = true;
            rebate1.externalKey = pmi1.Id + '_' + rebate1.rebateType;

            PromotionalSalesAgreement_Controller.PSARebate rebate2 = new PromotionalSalesAgreement_Controller.PSARebate();
            rebate2.rebateType = 'Volume';
            rebate2.rebateAmount = 10;
            rebate2.isVolumeRebate = true;
            rebate2.hasTotals = true;
            rebate2.externalKey = pmi1.Id + '_' + rebate2.rebateType;

            List<PromotionalSalesAgreement_Controller.PSARebate> rebates = new List<PromotionalSalesAgreement_Controller.PSARebate>();
            rebates.add(rebate1);
            rebates.add(rebate2);
            
            //List<String> pmiaIds = PromotionalSalesAgreement_Controller.createActuals(psa1.Id, rtPSAPMIA, promotionId, pmi1.Id, wholesalerId, Date.today(), externalKey, 'New', 6,true,rebates);
            //System.assertNotEquals(0, pmiaIds.size());
            List<String> activityIds = new List<String>();
            activityIds.add(psa1.Id);
            BuildInitialActualsForPSA.buildInitialActuals(activityIds);
            
        }        
    }
}