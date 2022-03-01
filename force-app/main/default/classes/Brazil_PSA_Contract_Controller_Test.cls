@isTest(SeeAllData=true)
public with sharing class Brazil_PSA_Contract_Controller_Test {
    static testMethod void unitTest1() {
        INFW_TestHelper helper = new INFW_TestHelper();

        Map<String, RecordTypeInfo> aRecordTypes = Schema.SObjectType.Account.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> cRecordTypes = Schema.SObjectType.Contact.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pRecordTypes = Schema.SObjectType.Product__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> wRecordTypes = Schema.SObjectType.Wholesaler__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> paRecordTypes = Schema.SObjectType.Promotion_Activity__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> promoRecordTypes = Schema.SObjectType.Promotion__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pmiRecordTypes = Schema.SObjectType.Promotion_Material_Item__c.getRecordTypeInfosByName();

        
        String rtWholesaler = wRecordTypes.get('Brazil').getRecordTypeId();
        String rtAccount = aRecordTypes.get('BRA - On Premise').getRecordTypeId();
        String rtParentAccount = aRecordTypes.get('Parent').getRecordTypeId();
        String rtContact = cRecordTypes.get('BRA - On Trade').getRecordTypeId();
        String rtWetGoods = pRecordTypes.get('Wet Goods').getRecordTypeId();
        String rtPSAActivity = paRecordTypes.get('BRA - PSA').getRecordTypeId();
        String rtPSAPromotion = promoRecordTypes.get('BRA - PSA').getRecordTypeId();
        String rtPSAPMI = pmiRecordTypes.get('BRA - PSA').getRecordTypeId();

        User manager = helper.createUser('System Administrator', 'Test', 'Manager', 'Brazil');
        insert manager;

        User user1 = helper.createUser('System Administrator','Test','User', 'Brazil');
        user1.ManagerId = manager.Id;
        insert user1;

        System.runAs(user1) {

            Market__c mBRA = helper.createMarket('Brazil');
            mBRA.Country_ISO_Code_2__c = 'BR';
            mBRA.Country_ISO_Code_3__c = 'BRA';
            mBRA.Maximum_Agreement_Length__c = 3;
            insert mBRA;

            Account parentAccount = helper.createAccount('Test BRA Parent Account', mBRA.Id, 'Wholesaler');
            parentAccount.RecordTypeId = rtParentAccount;
            parentAccount.Status__c = 'Active';
            parentAccount.Is_Active__c = true;
            parentAccount.ShippingStreet = '8 Otley Road';
            parentAccount.ShippingCity = 'Brazil';
            parentAccount.ShippingState = '';
            parentAccount.ShippingPostalCode = 'LS20 8AH';
            parentAccount.ShippingCountry = 'Brazil';
            insert parentAccount;

            Account childAccount = helper.createAccount('Test BRA Child Account', mBRA.Id, 'On Premise');
            childAccount.RecordTypeId = rtAccount;
            childAccount.ParentId = parentAccount.Id;
            childAccount.Is_Active__c = true;
            childAccount.Status__c = 'Active';
            childAccount.Sales_Route__c = 'WEST COAST';
            childAccount.ShippingStreet = '100 Acre Road';
            childAccount.ShippingCity = 'Brazil';
            childAccount.ShippingPostalCode = 'G20 OTL';
            childAccount.ShippingCountry = 'Brazil';
            insert childAccount;

            Contact contact1 = helper.createContact('Test BRA', 'Parent Contact', parentAccount.Id);
            contact1.Decision_Maker__c = true;
            contact1.RecordTypeId = rtContact;
            
            Contact contact2 = helper.createContact('Test BRA Child', 'Child Contact', childAccount.Id);
            contact2.Decision_Maker__c = true;
            contact2.RecordTypeId = rtContact;

            Contact[] l_Contacts = new Contact[]{contact1, contact2};
            insert l_Contacts;

            Wholesaler__c wholesaler1 = new Wholesaler__c(RecordTypeId=rtWholesaler,Name='WholesalerPreferred',Wholesaler_Name__c='Wholesaler1',Market__c=mBRA.Id,Is_Active__c=true);
            Wholesaler__c wholesaler2 = new Wholesaler__c(RecordTypeId=rtWholesaler,Name='WholesalerAlternate',Wholesaler_Name__c='Wholesaler2',Market__c=mBRA.Id,Is_Active__c=true);
            Wholesaler__c[] l_Wholesaler = new Wholesaler__c[]{wholesaler1, wholesaler2};
            insert l_Wholesaler;

            Brand__c brand = new Brand__c(Name='Brand');
            insert brand;
            
            List<Product__c> products = helper.createProducts(3, 'Wet Goods', mBRA.Id, brand.Id, false);
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
            psa1.Number_of_Payments__c = 4;
            psa1.Status__c = 'New';
            psa1.Total_Listing_Fee__c = 100000;
            psa1.Activity_Budget__c = 100000;
            psa1.Date_Approved__c = Date.today();
            
            Promotion_Activity__c[] l_PSA = new Promotion_Activity__c[]{psa1};
            insert l_PSA;

            Promotion__c promotion1 = new Promotion__c();
            promotion1.RecordTypeId = rtPSAPromotion;
            promotion1.Promotion_Activity__c = psa1.Id;
            promotion1.Account__c = parentAccount.Id;
            insert promotion1;

            Promotion_Material_Item__c psaItem1 = new Promotion_Material_Item__c();
            psaItem1.Activity__c = psa1.Id;
            psaItem1.Promotion__c = promotion1.Id;
            psaItem1.RecordTypeId = rtPSAPMI;
            psaItem1.Product_Custom__c = products[0].Id;
            psaItem1.Plan_Volume__c = 5;
            psaItem1.Brand_Status__c = 'Must Stock';
            psaItem1.Drink_Strategy__c = 'Perfect Serve';
            psaItem1.Listing_Fee__c = 100000;
            psaItem1.Promotional_Activity__c = 'Point of Sale';
            psaItem1.Training_and_Advocacy__c = 'Category Training';
            psaItem1.Outlet_to_Provide__c = 'Social Media Posting';
            insert psaItem1;

            Test.startTest();
                        
            ApexPages.StandardController stdController = new ApexPages.StandardController(psa1);
            PageReference docuSignPage = new PageReference('/apex/Brazil_PSA_ContractUK_PSA_Generate_DocuSign');
            docuSignPage.getParameters().put('id', psa1.Id);        
            Test.setCurrentPage(docuSignPage);
            
            Approval.ProcessSubmitRequest req1 = new Approval.ProcessSubmitRequest();
            req1.setComments('Submitting request');
            req1.setObjectId(psa1.Id);
            req1.setSubmitterId(user1.Id);
            req1.setProcessDefinitionNameOrId('Brazil_PSA');
            req1.setSkipEntryCriteria(true);
            Approval.ProcessResult result = Approval.process(req1);
            
            List<Id> newWorkItemIds = result.getNewWorkitemIds();
            System.debug('newWorkItemIds: ' + newWorkItemIds);
            Approval.ProcessWorkitemRequest workItem = new Approval.ProcessWorkitemRequest();
            workItem.setAction('Approve'); // manager approval
            workItem.setWorkitemId(newWorkItemIds.get(0));
            Approval.ProcessResult result2 = Approval.process(workItem);

            Brazil_PSA_Contract_Controller contractController = new Brazil_PSA_Contract_Controller();
            contractController.setThePSA(psa1);

            psa1.Number_of_Payments__c = 3;
            psa1.Date_Approved__c = psa1.Date_Approved__c.addMonths(1);
            update psa1;
            contractController.setThePSA(psa1);

            psa1.Number_of_Payments__c = 2;
            psa1.Date_Approved__c = psa1.Date_Approved__c.addMonths(1);
            update psa1;
            contractController.setThePSA(psa1);

            psa1.Number_of_Payments__c = 1;
            psa1.Date_Approved__c = psa1.Date_Approved__c.addMonths(1);
            update psa1;
            contractController.setThePSA(psa1);

            Test.stopTest();
        }
    }
}