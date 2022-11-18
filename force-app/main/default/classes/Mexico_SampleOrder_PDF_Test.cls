@isTest
public with sharing class Mexico_SampleOrder_PDF_Test {
    static testMethod void unitTest1() {
        Date today = Date.today();
        DateTime now = DateTime.now();

        INFW_TestHelper helper = new INFW_TestHelper();

        Map<String, RecordTypeInfo> aRecordTypes = Schema.SObjectType.Account.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pRecordTypes = Schema.SObjectType.Product__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapRecordTypes = Schema.SObjectType.SAP_Interfaced_Data__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapiRecordTypes = Schema.SObjectType.SAP_Interfaced_Data_Item__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> bannerRecordTypes = Schema.SObjectType.Banner_Groups__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> sapConfigRecordTypes = Schema.SObjectType.SAP_Interfaced_Data_Configuration__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> paRecordTypes = Schema.SObjectType.Promotion_Activity__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> promoRecordTypes = Schema.SObjectType.Promotion__c.getRecordTypeInfosByName();

        String rtMXAccount = aRecordTypes.get('MX - Outlet On').getRecordTypeId();
        String rtSampleOrderMX = sapRecordTypes.get('Sample Order - MEX').getRecordTypeId();
        String rtSampleOrderItem = sapiRecordTypes.get('Sample Order').getRecordTypeId();
        String rtWetGoods = pRecordTypes.get('Wet Goods').getRecordTypeId();
        String rtShipTo = sapConfigRecordTypes.get('ShipTo').getRecordTypeId();
        String rtSoldTo = sapConfigRecordTypes.get('SoldTo').getRecordTypeId();
        String rtGeneral = sapConfigRecordTypes.get('General').getRecordTypeId();
        String rtMexicoPSA = paRecordTypes.get('MX - PSA').getRecordTypeId();
        String rtPromoPSA = promoRecordTypes.get('MX - PSA').getRecordTypeId();
               
        Market__c mMX = helper.createMarket('Mexico');
        mMX.Country_ISO_Code_2__c = 'MX';
        
        Market__c[] markets = new Market__c[]{mMX};
	    insert markets;
        
        User mgr = helper.createUser('System Administrator', 'Mgr', 'Tsakiridis', '');
        mgr.Market__c = 'Australia';
        insert mgr;

        User user1 = helper.createUser('System Administrator', 'Test', 'Tsakiridis', '');
        user1.Market__c = 'Australia';
        user1.ManagerId = mgr.Id;
        user1.Manages_Brand__c = 'Gentleman Jack';
        user1.Email = 'tass_tsakiridis@b-f.com';
        insert user1;
		      
        
        Account account2 = new Account();
        account2.RecordTypeId = rtMXAccount;
        account2.Market__c = mMX.Id;
        account2.Name = 'Test MX Account';
        
        Account[] accounts = new Account[]{account2};
        insert accounts;
        
        Contact contact1 = new Contact();
        contact1.AccountId = account2.Id;
        contact1.FirstName = 'Test';
        contact1.LastName = 'Contact';
        contact1.Decision_Maker__c = true;
        insert contact1;
        
        
        Supplier__c supplier = helper.createSupplier('Test Supplier', true);
        insert supplier;
        
        Brand__c brand = helper.createBrand('Gentleman Jack', 'Spirits', '0987', supplier.Id);
        insert brand;
        
        List<Product__c> lProducts = helper.createProducts(5, 'Wet Goods', mMX.Id, brand.Id, false);
        for(Product__c p : lProducts) {
            p.Used_For__c = 'Sample Order';
        }
        lProducts[0].Used_For__c = 'Sample Order;High Value;Sample Order - MX';
        insert lProducts;
        
        
		SAP_Interfaced_Data__c sampleOrder = new SAP_Interfaced_Data__c();
        sampleOrder.RecordTypeId = rtSampleOrderMX;
        sampleOrder.Approval_Status__c = 'New';
        sampleOrder.Business_Address__c = '1 test street';
        sampleOrder.Business_City__c = 'Sydney';
        sampleOrder.Business_Country__c = 'AU';
        sampleOrder.Business_State__c = 'NSW';
        sampleOrder.Business_Postcode__c = '2000';
        sampleOrder.Business_Name__c = 'Test Sample Order';
        sampleOrder.Classification__c = 'Exhibits';
        sampleOrder.Contact_Name__c = 'Test Sample Order Contact';
        sampleOrder.Contact_Phone__c = '95551234';
        sampleOrder.Market__c = mMX.Id;
        sampleOrder.Reason__c = 'Because';
        sampleOrder.Requested_Delivery_Date__c = today.addDays(7);
        
        SAP_Interfaced_Data__c[] sampleOrders = new SAP_Interfaced_Data__c[]{sampleOrder};
        insert sampleOrders;
        
		SAP_Interfaced_Data_Item__c sapi = new SAP_Interfaced_Data_Item__c();
        sapi.RecordTypeId = rtSampleOrderItem;
		sapi.SAP_Interfaced_Data__c = sampleOrder.Id;
		sapi.Product__c = lProducts.get(0).Id;
		sapi.Quantity__c = 1;
		insert sapi;     
        
        
        System.runAs(user1) {

			Mexico_SampleOrder_PDF_Controller pdfController = new Mexico_SampleOrder_PDF_Controller();
			pdfController.setTheSampleOrder(sampleOrder);
        }
        
        
    }
}