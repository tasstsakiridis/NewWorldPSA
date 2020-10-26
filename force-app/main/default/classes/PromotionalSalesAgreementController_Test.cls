@isTest(SeeAllData=true)
private class PromotionalSalesAgreementController_Test {
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

            Promotion_Activity__c psa2 = new Promotion_Activity__c();
            psa2.Name = 'Test PSA 2';
            psa2.RecordTypeId = rtPSAActivity;
            psa2.Begin_Date__c = Date.today();
            psa2.End_Date__c = psa2.Begin_Date__c.addDays(10);
            psa2.Account__c = parentAccount.Id;
            psa2.Contact__c = contact1.Id;
            psa2.Wholesaler_Preferred__c = wholesaler1.Id;
            psa2.Wholesaler_Preferred_Name__c = wholesaler1.Name;
            psa2.Is_Length_in_Years__c = false;
            psa2.Length_of_Agreement__c = 10;
            psa2.Reminder_Date__c = psa2.Begin_Date__c;
            psa2.Next_Email_Date__c = psa2.Begin_Date__c;

            Promotion_Activity__c psa3 = new Promotion_Activity__c();
            psa3.Name = 'Test PSA 3';
            psa3.RecordTypeId = rtPSAActivity;
            psa3.Begin_Date__c = Date.today();
            psa3.End_Date__c = psa3.Begin_Date__c.addYears(1);
            psa3.Account__c = parentAccount.Id;
            psa3.Contact__c = contact1.Id;
            psa3.Wholesaler_Preferred__c = wholesaler1.Id;
            psa3.Wholesaler_Preferred_Name__c = wholesaler1.Name;
            psa3.Is_Length_in_Years__c = true;
            psa3.Length_of_Agreement__c = 1;
            psa3.Reminder_Date__c = psa3.Begin_Date__c;
            psa3.Next_Email_Date__c = psa3.End_Date__c.addDays(10);

            Promotion_Activity__c psa4 = new Promotion_Activity__c();
            psa4.Name = 'Test PSA 4';
            psa4.RecordTypeId = rtPSAActivity;
            psa4.Begin_Date__c = Date.today();
            psa4.End_Date__c = psa4.Begin_Date__c.addMonths(2);
            psa4.Account__c = parentAccount.Id;
            psa4.Contact__c = contact1.Id;
            psa4.Wholesaler_Preferred__c = wholesaler1.Id;
            psa4.Wholesaler_Preferred_Name__c = wholesaler1.Name;
            psa4.Is_Length_in_Years__c = true;
            psa4.Length_of_Agreement__c = 1;
            psa4.Reminder_Date__c = null;
            psa4.Next_Email_Date__c = psa4.End_Date__c.addDays(10);
            
            Promotion_Activity__c[] l_PSA = new Promotion_Activity__c[]{psa1, psa2, psa3, psa4};
            insert l_PSA;

            ContentVersion cv = new ContentVersion();
            cv.Title = 'Test Document';
            cv.PathOnClient = 'Test.png';
            cv.VersionData = EncodingUtil.base64Decode('Test Document');
            insert cv;

            ContentDocumentLink cdl = new ContentDocumentLink();
            cdl.ContentDocumentId = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id].ContentDocumentId;
            cdl.LinkedEntityId = psa1.Id;
            cdl.ShareType = 'V';
            insert cdl;

            Test.startTest();
            
            Market__c m = PromotionalSalesAgreement_Controller.getUserMarket();
            System.assertEquals('United Kingdom', m.Name, 'Market retrieved doesnt match');

            Account pa = PromotionalSalesAgreement_Controller.getAccountById(parentAccount.Id);
            System.assertEquals(pa.Id, parentAccount.Id, 'Parent accounts dont match');

            PagedResult pr = PromotionalSalesAgreement_Controller.getAccountsByName(parentAccount.Name, true, mUK.Id, 1);
            System.assertNotEquals(null, pr.records, 'get accounts by name failed');

            PagedResult pr2 = PromotionalSalesAgreement_Controller.getAccountsForParent(parentAccount.Id, 1);
            System.assertNotEquals(null, pr2.records, 'getaccountsforparent failed');

            Product__c prod1 = PromotionalSalesAgreement_Controller.getProductDetails(products[0].Id);
            System.assertNotEquals(null, prod1, 'get product details failed');

            PagedResult pr3 = PromotionalSalesAgreement_Controller.getProducts(1, brand.Id);
            System.assertNotEquals(null, pr3.records, 'get products failed');

            PagedResult pr4 = PromotionalSalesAgreement_Controller.getBrands(1);
            System.assertNotEquals(null, pr4.records, 'get brands failed');

            List<Wholesaler__c> wholesalers = PromotionalSalesAgreement_Controller.getWholesalers(mUK.Id);
            System.assertNotEquals(null, wholesalers, 'get wholesalers failed');

            PSAWrapper wrapper1 = new PSAWrapper();
            wrapper1.id = psa1.Id;
            wrapper1.beginDate = Date.today();
            wrapper1.endDate = wrapper1.beginDate.addYears(1);
            wrapper1.parentAccountId = parentAccount.Id;
            wrapper1.signingCustomerId = contact1.Id;
            wrapper1.wholesalerPreferredId = wholesaler1.Id;
            wrapper1.wholesalerPreferredName = wholesaler1.Name;
            wrapper1.wholesalerAlternateId = wholesaler2.Id;
            wrapper1.wholesalerAlternateName = wholesaler2.Name;
            wrapper1.isLengthInYears = true;
            wrapper1.lengthOfPSA = 1;
            //wrapper1.marketId = mUK.Id;
            //wrapper1.marketName = mUK.Name;

            SelectableItem si1 = new SelectableItem();
            si1.itemId = childAccount.Id;
            si1.item = null;
            si1.isSelected = false;
            wrapper1.accounts.add(si1);

            String msg = PromotionalSalesAgreement_Controller.savePSA(wrapper1);
            System.assertEquals('OK', msg, 'savePSA failed');

            psa1 = PromotionalSalesAgreement_Controller.getPSA(psa1.Id);
            System.assertNotEquals(null, psa1, 'getPSA failed');            
            
            wrapper1.accounts[0].id = psa1.Promotions__r[0].Id;
            
            wrapper1.items.clear();
            PSAWrapper.PSAItemWrapper psaItem1 = new PSAWrapper.PSAItemWrapper();
            psaItem1.productId = products[0].Id;
            psaItem1.volumeForecast = 5;
            psaItem1.discount = 2.0;
            psaItem1.brandStatus = 'Must Stock';
            psaItem1.drinkStrategy = 'Perfect Serve';
            psaItem1.listingFee = 500;
            psaItem1.promotionalActivity = 'Point of Sale';
            psaItem1.promotionalActivityAmount = 1000;
            psaItem1.trainingAndAdvocacy = 'Category Training';
            psaItem1.trainingAndAdvocacyAmount = 2000;
            psaItem1.outletToProvide = 'Social Media Posting';
            wrapper1.items.add(psaItem1);

            msg = PromotionalSalesAgreement_Controller.savePSAItems(wrapper1);
            System.assertEquals('OK', msg, 'savePSAItems failed');

            PromotionalSalesAgreement_Controller.Filters filters = new PromotionalSalesAgreement_Controller.Filters();
            filters.myAgreements = true;
            filters.parentAccount = parentAccount.Id;

            PagedResult pr5 = PromotionalSalesAgreement_Controller.getAgreements(filters, 1);

            List<ContentDocumentLink> linkedDocs = PromotionalSalesAgreement_Controller.getAttachedFiles(psa1.Id);
            msg = PromotionalSalesAgreement_Controller.detachDocument(psa1.Id, cdl.ContentDocumentId);

            msg = PromotionalSalesAgreement_Controller.updatePMITotals(psa1.Id);
            System.assertEquals('OK', msg);

            psa1 = PromotionalSalesAgreement_Controller.getPSA(psa1.Id);
            
            String pmiId = psa1.Promotion_Material_Items__r[0].Id;            
            //Promotion_Material_Item__c pmi = PromotionalSalesAgreement_Controller.getPMIDetails(pmiId);
            //System.assertNotEquals(null, pmi);

            Promotion_Material_Item__c pmi = PromotionalSalesAgreement_Controller.getPSAItemDetails(pmiId);
            pmi.Proposed_Plan_Rebate__c = 1.25;
            pmi.Proposed_Plan_Volume__c = 100;
            pmi.Proposed_Listing_Fee__c = 10000;
            pmi.Proposed_Promotional_Activity_Value__c = 2500;
            pmi.Proposed_Training_Advocacy_Value__c = 3000;
            update pmi;
            System.assertNotEquals(null, pmi);

            psa1.Status__c = 'Approved';
            update psa1;
            
            Boolean isSOMUser = PromotionalSalesAgreement_Controller.getIsSOMUser();
            System.assertEquals(false, isSOMUser);

            User u = PromotionalSalesAgreement_Controller.getUserDetails();
            System.assertNotEquals(null, u);

            String promotionId = psa1.Promotions__r[0].Id;
            String wholesalerId = psa1.Wholesaler_Preferred__c;
            String externalKey = promotionId + '_' + pmiId + '_0';
            PromotionalSalesAgreement_Controller.PSARebate rebate1 = new PromotionalSalesAgreement_Controller.PSARebate();
            rebate1.rebateType = 'Listing Fee';
            rebate1.rebateAmount = 1000.00;
            rebate1.isVolumeRebate = false;
            rebate1.hasTotals = true;
            rebate1.externalKey = pmiId + '_' + rebate1.rebateType;

            PromotionalSalesAgreement_Controller.PSARebate rebate2 = new PromotionalSalesAgreement_Controller.PSARebate();
            rebate2.rebateType = 'Volume';
            rebate2.rebateAmount = 10;
            rebate2.isVolumeRebate = true;
            rebate2.hasTotals = true;
            rebate2.externalKey = pmiId + '_' + rebate2.rebateType;

            List<PromotionalSalesAgreement_Controller.PSARebate> rebates = new List<PromotionalSalesAgreement_Controller.PSARebate>();
            rebates.add(rebate1);
            rebates.add(rebate2);

            List<String> pmiaIds = PromotionalSalesAgreement_Controller.createActuals(psa1.Id, rtPSAPMIA, promotionId, pmiId, wholesalerId, Date.today(), externalKey, 'New', rebates);
            System.assertNotEquals(0, pmiaIds.size());

            msg = PromotionalSalesAgreement_Controller.updateActualTotals(psa1.Id);
            System.assertEquals('OK', msg);
            
            PMI_Actual__c pmia2 = PromotionalSalesAgreement_Controller.getPMIADetails(pmiaIds[0]);
            System.assertNotEquals(null, pmia2);

            SimpleListItem sli = PromotionalSalesAgreement_Controller.clonePSA(psa1.Id, 'Cloned PSA');
            System.assertEquals('OK', sli.name);

            msg = PromotionalSalesAgreement_Controller.submitForApproval(sli.id);
            System.assertEquals('OK', msg);

            msg = PromotionalSalesAgreement_Controller.recallApproval(sli.id);
            System.assertEquals('OK', msg);
            
            PSAWrapper wrapper2 = new PSAWrapper(psa1);
            System.assertNotEquals(null, wrapper2);
            
            UK_PSA_CONTRACT_Controller contractController = new UK_PSA_CONTRACT_Controller();
            contractController.setThePSA(psa1);
            
            ApexPages.StandardController stdController = new ApexPages.StandardController(psa1);
            PageReference docuSignPage = new PageReference('/apex/UK_PSA_Generate_DocuSign');
            docuSignPage.getParameters().put('id', psa1.Id);        
            Test.setCurrentPage(docuSignPage);
            
            UK_PSA_Generate_DocuSign_Controller docuSignController = new UK_PSA_Generate_DocuSign_Controller(stdController);

            List<Promotion_Activity__c> psaList = new List<Promotion_Activity__c>();
            psaList.add(psa1);
            psaList.add(psa2);
            psaList.add(psa3);
            psaList.add(psa4);
            CalculateNextReminderDate.calcNextReminderDate(psaList);
            CalculateNextActualsReminderDate.calcNextActualsReminderDate(psaList);

            List<String> psaIds = new List<String>();
            psaIds.add(psa1.Id);
            BuildInitialActualsForPSA.buildInitialActuals(psaIds);
            
            
            Test.stopTest();
        }
    }
}