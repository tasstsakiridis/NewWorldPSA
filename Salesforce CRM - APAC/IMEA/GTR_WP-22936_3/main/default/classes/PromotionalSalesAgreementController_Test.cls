@isTest
private class PromotionalSalesAgreementController_Test {

    @testSetup
    static void setupData() {
        INFW_TestHelper helper = new INFW_TestHelper();        

        Map<String, RecordTypeInfo> aRecordTypes = Schema.SObjectType.Account.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> cRecordTypes = Schema.SObjectType.Contact.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pRecordTypes = Schema.SObjectType.Product__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> wRecordTypes = Schema.SObjectType.Wholesaler__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> paRecordTypes = Schema.SObjectType.Promotion_Activity__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> promoRecordTypes = Schema.SObjectType.Promotion__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pmiRecordTypes = Schema.SObjectType.Promotion_Material_Item__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> pmiaRecordTypes = Schema.SObjectType.PMI_Actual__c.getRecordTypeInfosByName();
        Map<String, RecordTypeInfo> vatRecordTypes = Schema.SObjectType.Vistex_Agreement_Types__c.getRecordTypeInfosByName();

        
        String rtJP_Wholesaler = wRecordTypes.get('Japan').getRecordTypeId();
        String rtKR_Wholesaler = wRecordTypes.get('Korea').getRecordTypeId();
        String rtMX_Wholesaler = wRecordTypes.get('Mexico').getRecordTypeId();
        
        String rtMX_ParentAccount = aRecordTypes.get('MX - Parents On').getRecordTypeId();

        String rtJP_Account = aRecordTypes.get('JPN Outlets').getRecordTypeId();
        String rtKR_Account = aRecordTypes.get('KOR - Outlets').getRecordTypeId();
        String rtMX_Account = aRecordTypes.get('MX - Outlet On').getRecordTypeId();

        String rtJP_Contact = cRecordTypes.get('JP Contacts').getRecordTypeId();
        String rtKR_Contact = cRecordTypes.get('KR Contacts').getRecordTypeId();
        String rtMX_Contact = cRecordTypes.get('MX - Contacts').getRecordTypeId();

        String rtJP_PSAActivity = paRecordTypes.get('JP - PSA').getRecordTypeId();
        String rtKR_PSAActivity = paRecordTypes.get('KR - PSA').getRecordTypeId();
        String rtMX_PSAActivity = paRecordTypes.get('MX - PSA').getRecordTypeId();

        String rtJP_PSAPromotion = promoRecordTypes.get('JP - PSA').getRecordTypeId();
        String rtKR_PSAPromotion = promoRecordTypes.get('KR - PSA').getRecordTypeId();
        String rtMX_PSAPromotion = promoRecordTypes.get('MX - PSA').getRecordTypeId();

        String rtJP_PSAPMI = pmiRecordTypes.get('JP - PSA').getRecordTypeId();
        String rtKR_PSAPMI = pmiRecordTypes.get('KR - PSA').getRecordTypeId();
        String rtMX_PSAPMI = pmiRecordTypes.get('MX - PSA').getRecordTypeId();

        String rtJP_PSAPMIA = pmiaRecordTypes.get('JP - PSA').getRecordTypeId();
        String rtKR_PSAPMIA = pmiaRecordTypes.get('KR - PSA').getRecordTypeId();
        String rtMX_PSAPMIA = pmiaRecordTypes.get('MX - PSA').getRecordTypeId();

        String rtJP_VAT = vatRecordTypes.get('JP - PSA').getRecordTypeId();
        String rtKR_VAT = vatRecordTypes.get('KR - PSA').getRecordTypeId();

        String rtWetGoods = pRecordTypes.get('Wet Goods').getRecordTypeId();

        User manager = helper.createUser('System Administrator', 'Test', 'Manager', 'Japan');
        insert manager;

        User user1 = helper.createUser('System Administrator','Test','User', 'Japan');
        user1.ManagerId = manager.Id;
        user1.Sales_Region__c = 'OFF NKA';
        insert user1;

        Market__c mJP = helper.createMarket('Japan');
        mJP.Country_ISO_Code_2__c = 'JP';
        mJP.Country_ISO_Code_3__c = 'JPN';
        mJP.Maximum_Agreement_Length__c = 5;
        mJP.Calculate_PSA_Product_Split__c = true;
        mJP.Capture_End_Date__c = true;
        mJP.Enable_PSA_Actuals__c = true;
        mJP.Can_PreDate_PSA__c = true;
        mJP.Agreement_Requires_Wholesaler__c = true;
        mJP.Capture_PSA_Budget__c = true;
        mJP.Spread_Planned_Values__c = true;
        mJP.Capture_CCM_Details__c = true;
        mJP.Show_Item_Gross_Profit__c = true;
        mJP.Show_Person_in_Charge_Details__c = true;
        mJP.Can_Close_Agreement__c = true;
        mJP.Can_Update_Status__c = true;

        Market__c mKR = helper.createMarket('Korea');
        mKR.Country_ISO_Code_2__c = 'JP';
        mKR.Country_ISO_Code_3__c = 'JPN';
        mKR.Maximum_Agreement_Length__c = 5;
        mKR.Agreement_Requires_Wholesaler__c = true;
        mKR.Capture_End_Date__c = true;
        mKR.Enable_PSA_Actuals__c = true;
        mKR.Enable_PSA_Preview__c = true;
        mKR.Spread_Planned_Values__c = true;
        mKR.Capture_Volume_in_Bottles__c = true;
        mKR.Capture_Rebate_per_Bottle__c = true;
        mKR.Capture_CCM_Details__c = true;
        mKR.Show_Approval_History__c = true;
        mKR.Show_Item_Gross_Profit__c = true;
        mKR.Show_Person_in_Charge_Details__c = true;
        mKR.Can_Close_Agreement__c = true;

        Market__c mMX = helper.createMarket('Mexico');
        mMX.Country_ISO_Code_2__c = 'JP';
        mMX.Country_ISO_Code_3__c = 'JPN';
        mMX.Add_New_Accounts_to_PSA__c = true;
        mMX.Capture_End_Date__c = true;
        mMX.Capture_Number_of_Payments__c = true;
        mMX.Enable_PSA_Actuals__c = true;
        mMX.Agreement_Configure_Payments__c = true;
        mMX.Show_Expanded_Actuals_on_Load__c = true;
        mMX.Capture_Activity_Type__c = true;
        mMX.Enable_PSA_Preview__c = true;
        mMX.Capture_PSA_Free_Goods__c = true;
        mMX.Capture_Volume_in_Bottles__c = true;
        
        Market__c[] markets = new Market__c[]{mJP, mKR, mMX};
        insert markets;

        Account mxParentAccount = helper.createAccount('Test Mexico Parent Account', mMX.Id, 'On');
        mxParentAccount.RecordTypeId = rtMX_ParentAccount;
        mxParentAccount.Status__c = 'Active';
        mxParentAccount.Market__c = mMX.Id;
        mxParentAccount.Is_Active__c = true;
        mxParentAccount.ShippingStreet = '1 Mexico Road';
        mxParentAccount.ShippingCity = 'Mexico';
        mxParentAccount.ShippingState = '';
        mxParentAccount.ShippingPostalCode = '12345';
        mxParentAccount.ShippingCountry = 'Mexico';

        Account[] parentAccounts = new Account[]{mxParentAccount};
        insert parentAccounts;
        
        Account jpAccount = helper.createAccount('Test JP Account', mJP.Id, 'On');
        jpAccount.RecordTypeId = rtJP_Account;
        jpAccount.Market__c = mJP.Id;
        jpAccount.Is_Active__c = true;
        jpAccount.Status__c = 'Active';
        jpAccount.Customer_Type__c = 'Indirect';
        jpAccount.ShippingStreet = '2 Japan Road';
        jpAccount.ShippingCity = 'Tokyo';
        jpAccount.ShippingState = '';
        jpAccount.ShippingPostalCode = '12345';
        jpAccount.ShippingCountry = 'Japan';
        
        Account krAccount = helper.createAccount('Test KR Account', mKR.Id, 'On');
        krAccount.RecordTypeId = rtKR_Account;
        krAccount.Market__c = mKR.Id;
        krAccount.Is_Active__c = true;
        krAccount.Status__c = 'Active';
        krAccount.ShippingStreet = '1 Korea Road';
        krAccount.ShippingCity = 'Seoul';
        krAccount.ShippingState = '';
        krAccount.ShippingPostalCode = '12345';
        krAccount.ShippingCountry = 'Korea';
        krAccount.Promotional_Budget__c = 1000000;
        krAccount.Promotional_Budget_Used__c = 0;

        Account mxAccount = helper.createAccount('Test MX Account', mMX.Id, 'On');
        mxAccount.RecordTypeId = rtMX_Account;
        mxAccount.Market__c = mMX.Id;
        mxAccount.ParentId = mxParentAccount.Id;
        mxAccount.Is_Active__c = true;
        mxAccount.Status__c = 'Active';
        mxAccount.ShippingStreet = '2 Mexico Road';
        mxAccount.ShippingCity = 'Mexico City';
        mxAccount.ShippingState = '';
        mxAccount.ShippingPostalCode = '123455';
        mxAccount.ShippingCountry = 'Mexico';

        Account[] accounts = new Account[]{jpAccount, krAccount, mxAccount};
        insert accounts;

        Contact mxContact_Parent = helper.createContact('Test MX', 'Parent Contact', mxParentAccount.Id);
        mxContact_Parent.Decision_Maker__c = true;
        mxContact_Parent.RecordTypeId = rtMX_Contact;
        
        Contact mxContact_Account = helper.createContact('Test MX', 'Child Contact', mxAccount.Id);
        mxContact_Account.Decision_Maker__c = true;
        mxContact_Account.RecordTypeId = rtMX_Contact;

        Contact jpContact_Account = helper.createContact('Test JP', 'Contact', jpAccount.Id);
        jpContact_Account.Decision_Maker__c = true;
        jpContact_Account.RecordTypeId = rtJP_Contact;

        Contact krContact_Account = helper.createContact('Test KR', 'Contact', krAccount.Id);
        krContact_Account.Decision_Maker__c = true;
        krContact_Account.RecordTypeId = rtKR_Contact;
        
        Contact[] l_Contacts = new Contact[]{mxContact_Parent, mxContact_Account, jpContact_Account, krContact_Account};
        insert l_Contacts;

        Wholesaler__c jpWholesaler1 = new Wholesaler__c(RecordTypeId=rtJP_Wholesaler,Name='WholesalerPreferred JP',Wholesaler_Name__c='Wholesaler JP1',Market__c=mJP.Id,Is_Active__c=true);
        Wholesaler__c jpWholesaler2 = new Wholesaler__c(RecordTypeId=rtJP_Wholesaler,Name='WholesalerAlternate JP',Wholesaler_Name__c='Wholesaler JP2',Market__c=mJP.Id,Is_Active__c=true);
        Wholesaler__c krWholesaler1 = new Wholesaler__c(RecordTypeId=rtKR_Wholesaler,Name='WholesalerPreferred KR',Wholesaler_Name__c='Wholesaler KR1',Market__c=mKR.Id,Is_Active__c=true);
        Wholesaler__c krWholesaler2 = new Wholesaler__c(RecordTypeId=rtKR_Wholesaler,Name='WholesalerAlternate KR',Wholesaler_Name__c='Wholesaler KR2',Market__c=mKR.Id,Is_Active__c=true);
        Wholesaler__c mxWholesaler1 = new Wholesaler__c(RecordTypeId=rtMX_Wholesaler,Name='WholesalerPreferred MX',Wholesaler_Name__c='Wholesaler MX1',Market__c=mMX.Id,Is_Active__c=true);
        Wholesaler__c mxWholesaler2 = new Wholesaler__c(RecordTypeId=rtMX_Wholesaler,Name='WholesalerAlternate MX',Wholesaler_Name__c='Wholesaler MX2',Market__c=mMX.Id,Is_Active__c=true);
        Wholesaler__c[] l_Wholesaler = new Wholesaler__c[]{jpWholesaler1, jpWholesaler2, krWholesaler1, krWholesaler2, mxWholesaler1, mxWholesaler2};
        insert l_Wholesaler;

        Supplier__c supplier = new Supplier__c();
        supplier.Name = 'B-F';
        supplier.Is_B_F_Brand__c = true;
        insert supplier;
        
        Brand__c brand = new Brand__c(Name='Brand');
        brand.Supplier__c = supplier.Id;
        
        Brand__c brand2 = new Brand__c(Name='Brand2');
        brand2.Supplier__c = supplier.Id;
        
        Brand__c[] l_brands = new Brand__c[]{brand, brand2};
        insert l_brands;
            
        List<Product__c> products = helper.createProducts(3, 'Wet Goods', mJP.Id, brand.Id, false);
        products.addAll(helper.createProducts(2, 'Wet Goods', mJP.Id, brand2.Id, false));
        products.addAll(helper.createProducts(3, 'Wet Goods', mKR.Id, brand.Id, false));
        products.addAll(helper.createProducts(5, 'Wet Goods', mMX.Id, brand.Id, false));
        products.addAll(helper.createProducts(1, 'Wet Goods', mMX.Id, brand2.Id, false));
        
        for(Product__c p : products) {
            p.Pack_Quantity__c = 12;
            p.Gross_Profit_per_Case__c = 10;
            p.Used_For__c = 'Promotion';
        }
        insert products;
        
        
        Vistex_Agreement_Types__c jpVAT = new Vistex_Agreement_Types__c();
        jpVAT.RecordTypeId = rtJP_VAT;
        jpVAT.Name = 'ZYVI';
        jpVAT.Condition__c = 'VI02';
        jpVAT.Is_Active__c = true;
        jpVAT.Contract_Type__c = 'CCM Lump Sum Manual Distribution';
        jpVAT.Discount_Category__c = 'Visibility';
        jpVAT.Promo_Code__c = 'Space Fee';
        jpVAT.SAP_Contract_Type__c = 'ZXL3';
        jpVAT.SAP_Contract_Type_Code__c = 'ZXL3';
        jpVAT.SAP_Promo_Code__c = 'VI02';

        Vistex_Agreement_Types__c jpVAT2 = new Vistex_Agreement_Types__c();
        jpVAT2.RecordTypeId = rtJP_VAT;
        jpVAT2.Name = 'ZYVI';
        jpVAT2.Condition__c = 'VI02';
        jpVAT2.Is_Active__c = true;
        jpVAT2.Contract_Type__c = 'CCM External Lump Sum Contract';
        jpVAT2.Discount_Category__c = 'Visibility';
        jpVAT2.Promo_Code__c = 'Space Fee';
        jpVAT2.SAP_Contract_Type__c = 'ZXL6';
        jpVAT2.SAP_Contract_Type_Code__c = 'ZXL6';
        jpVAT2.SAP_Promo_Code__c = 'VI02';
        
        Vistex_Agreement_Types__c krVAT = new Vistex_Agreement_Types__c();
        krVAT.RecordTypeId = rtKR_VAT;
        krVAT.Name = 'ZYVI';
        krVAT.Condition__c = 'VI03';
        krVAT.Is_Active__c = true;
        krVAT.Contract_Type__c = 'CCM Lump Sum Manual Distribution';
        krVAT.Discount_Category__c = 'Visibility';
        krVAT.Promo_Code__c = 'Ranging';
        krVAT.SAP_Contract_Type__c = 'ZXL3';
        krVAT.SAP_Contract_Type_Code__c = 'ZXL3';
        krVAT.SAP_Promo_Code__c = 'VI03';
        krVAT.Calculation_Type__c = 'B';
        krVAT.SAP_GL_Code__c = '7215703';
        krVAT.SAP_Accrual_GL_Code__c = '4489950';

        Vistex_Agreement_Types__c[] l_vat = new Vistex_Agreement_Types__c[]{jpVAT, jpVAT2, krVAT};
        insert l_vat;

        Promotion_Activity__c jpPSA = new Promotion_Activity__c();
        jpPSA.Name = 'Test JP PSA 1';
        jpPSA.RecordTypeId = rtJP_PSAActivity;
        jpPSA.Begin_Date__c = Date.today();
        jpPSA.End_Date__c = jpPSA.Begin_Date__c.addMonths(3);
        jpPSA.Account__c = jpAccount.Id;
        jpPSA.Contact__c = jpContact_Account.Id;
        jpPSA.Wholesaler_Preferred__c = jpWholesaler1.Id;
        jpPSA.Wholesaler_Preferred_Name__c = jpWholesaler1.Name;
        jpPSA.Is_Length_in_Years__c = false;
        jpPSA.Length_of_Agreement__c = 3;
        jpPSA.Status__c = 'New';
        jpPSA.Market__c = mJP.Id;
        jpPSA.Activity_Budget__c = 10000;
        jpPSA.Contract_Type__c = 'CCM External Lump Sum Contract';
        jpPSA.Discount_Category__c = 'Visibility';
        jpPSA.Promo_Code__c = 'Space Fee';

        Promotion_Activity__c krPSA = new Promotion_Activity__c();
        krPSA.Name = 'FY_Test KR PSA_NEW';
        krPSA.RecordTypeId = rtKR_PSAActivity;
        krPSA.Begin_Date__c = Date.today();
        krPSA.End_Date__c = krPSA.Begin_Date__c.addDays(10);
        krPSA.Account__c = krAccount.Id;
        krPSA.Contact__c = krContact_Account.Id;
        krPSA.Wholesaler_Preferred__c = krWholesaler1.Id;
        krPSA.Wholesaler_Preferred_Name__c = krWholesaler1.Name;
        krPSA.Is_Length_in_Years__c = false;
        krPSA.Length_of_Agreement__c = 1;
        krPSA.Status__c = 'New';
        krPSA.Market__c = mKR.Id;
        krPSA.Activity_Budget__c = 10000;
        krPSA.Planned_Fee__c = 10000;

        Promotion_Activity__c mxPSA = new Promotion_Activity__c();
        mxPSA.Name = 'Test MX PSA';
        mxPSA.RecordTypeId = rtMX_PSAActivity;
        mxPSA.Begin_Date__c = Date.today();
        mxPSA.End_Date__c = mxPSA.Begin_Date__c.addYears(1);
        mxPSA.Account__c = mxParentAccount.Id;
        mxPSA.Contact__c = mxContact_Parent.Id;
        mxPSA.Wholesaler_Preferred__c = mxWholesaler1.Id;
        mxPSA.Wholesaler_Preferred_Name__c = mxWholesaler1.Name;
        mxPSA.Is_Length_in_Years__c = true;
        mxPSA.Length_of_Agreement__c = 1;
        mxPSA.Reminder_Date__c = mxPSA.Begin_Date__c;
        mxPSA.Next_Email_Date__c = mxPSA.End_Date__c.addDays(10);
        mxPSA.Market__c = mMX.Id;
        mxPSA.Budget__c = 10000;
        
        Promotion_Activity__c[] l_PSA = new Promotion_Activity__c[]{jpPSA, krPSA, mxPSA};
        insert l_PSA;

        Promotion__c jpPromo = new Promotion__c();
        jpPromo.RecordTypeId = rtJP_PSAPromotion;
        jpPromo.Promotion_Activity__c = jpPSA.Id;
        jpPromo.Account__c = jpAccount.Id;

        Promotion__c krPromo = new Promotion__c();
        krPromo.RecordTypeId = rtKR_PSAPromotion;
        krPromo.Promotion_Activity__c = krPSA.Id;
        krPromo.Account__c = krAccount.Id;

        Promotion__c mxPromo = new Promotion__c();
        mxPromo.RecordTypeId = rtMX_PSAPromotion;
        mxPromo.Promotion_Activity__c = mxPSA.Id;
        mxPromo.Account__c = mxParentAccount.Id;

        Promotion__c[] l_Promotions = new Promotion__c[]{jpPromo, krPromo, mxPromo};
        insert l_Promotions;

        Promotion_Material_Item__c jpPMI = new Promotion_Material_Item__c();
        jpPMI.RecordTypeId = rtJP_PSAPMI;
        jpPMI.Activity__c = jpPSA.Id;
        jpPMI.Promotion__c = jpPromo.Id;
        jpPMI.Product_Custom__c = products[4].Id;
        jpPMI.Plan_Volume__c = 1;
        jpPMI.Plan_Rebate__c = 100;

        Promotion_Material_Item__c krPMI = new Promotion_Material_Item__c();
        krPMI.RecordTypeId = rtKR_PSAPMI;
        krPMI.Activity__c = krPSA.Id;
        krPMI.Promotion__c = krPromo.Id;
        krPMI.Product_Custom__c = products[6].Id;
        krPMI.Plan_Volume__c = 100;
        krPMI.Current_Volume__c = 50;
        krPMI.Product_Gross_Profit_per_Bottle__c = 1234;
        krPMI.Product_Gross_Profit_per_Case_9L__c = 57.56;
        krPMI.Plan_Rebate__c = 5292;

        Promotion_Material_Item__c mxPMI = new Promotion_Material_Item__c();
        mxPMI.RecordTypeId = rtMX_PSAPMI;
        mxPMI.Activity__c = mxPSA.Id;
        mxPMI.Promotion__c = mxPromo.Id;
        mxPMI.Product_Custom__c = products[9].Id;
        mxPMI.Plan_Volume__c = 120;
        mxPMI.Free_Bottle_Quantity__c = 10;
        mxPMI.Free_Goods_Reason__c = 'Training';
        mxPMI.Listing_Fee__c = 10000;
        mxPMI.Brand_Status__c = 'Must Stock';
        mxPMI.Promotional_Activity__c = 'Sampling Activity';
        mxPMI.Outlet_to_Provide__c = 'Activity Sales Data';

        Promotion_Material_Item__c[] l_PMI = new Promotion_Material_Item__c[]{jpPMI, krPMI, mxPMI};        
        insert l_PMI;

        PMI_Actual__c jpPMIA = new PMI_Actual__c();
        jpPMIA.RecordTypeId = rtJP_PSAPMIA;
        jpPMIA.Activity__c = jpPSA.Id;
        jpPMIA.Promotion__c = jpPromo.Id;
        jpPMIA.Promotion_Material_Item__c = jpPMI.Id;
        jpPMIA.Period__c = 0;
        jpPMIA.Rebate_Type__c = 'Volume';
        jpPMIA.Rebate_Amount__c = 1;
        jpPMIA.Act_Qty__c = 1;
        jpPMIA.External_Key__c = jpPromo.Id + '_' + jpPMI.Id + '_' + jpPMIA.Rebate_Type__c + '-' + jpPMIA.Period__c;
        jpPMIA.Approval_Status__c = 'Submit';
        
        PMI_Actual__c krPMIA = new PMI_Actual__c();
        krPMIA.RecordTypeId = rtKR_PSAPMIA;
        krPMIA.Activity__c = krPSA.Id;
        krPMIA.Promotion__c = krPromo.Id;
        krPMIA.Promotion_Material_Item__c = krPMI.Id;
        krPMIA.Period__c = 0;
        krPMIA.Rebate_Type__c = 'Volume';
        krPMIA.Rebate_Amount__c = 100;
        krPMIA.Act_Qty__c = 100;
        krPMIA.External_Key__c = krPromo.Id + '_' + krPMI.Id + '_' + krPMIA.Rebate_Type__c + '-' + krPMIA.Period__c;
        krPMIA.Approval_Status__c = 'Paid';
        krPMIA.Has_Totals__c = false;

        PMI_Actual__c krPMIA2 = new PMI_Actual__c();
        krPMIA2.RecordTypeId = rtKR_PSAPMIA;
        krPMIA2.Activity__c = krPSA.Id;
        krPMIA2.Promotion__c = krPromo.Id;
        krPMIA2.Promotion_Material_Item__c = null;
        krPMIA2.Period__c = 0;
        krPMIA2.Rebate_Type__c = 'Fee';
        krPMIA2.Rebate_Amount__c = 1000;
        krPMIA2.Act_Qty__c = 0;
        krPMIA2.External_Key__c = krPromo.Id + '_' + krPMIA2.Rebate_Type__c + '-' + krPMIA2.Period__c;
        krPMIA2.Approval_Status__c = 'Paid';
        krPMIA2.Has_Totals__c = false;

        PMI_Actual__c krPMIA3 = new PMI_Actual__c();
        krPMIA3.RecordTypeId = rtKR_PSAPMIA;
        krPMIA3.Activity__c = krPSA.Id;
        krPMIA3.Promotion__c = krPromo.Id;
        krPMIA3.Promotion_Material_Item__c = krPMI.Id;
        krPMIA3.Period__c = 0;
        krPMIA3.Rebate_Type__c = 'Listing Fee';
        krPMIA3.Rebate_Amount__c = 1000;
        krPMIA3.Act_Qty__c = 0;
        krPMIA3.External_Key__c = krPromo.Id + '_' + krPMI.Id + '_' + krPMIA3.Rebate_Type__c + '-' + krPMIA3.Period__c;
        krPMIA3.Approval_Status__c = 'Paid';
        krPMIA3.Has_Totals__c = false;

        PMI_Actual__c krPMIA4 = new PMI_Actual__c();
        krPMIA4.RecordTypeId = rtKR_PSAPMIA;
        krPMIA4.Activity__c = krPSA.Id;
        krPMIA4.Promotion__c = krPromo.Id;
        krPMIA4.Promotion_Material_Item__c = krPMI.Id;
        krPMIA4.Period__c = 0;
        krPMIA4.Rebate_Type__c = 'Free Goods';
        krPMIA4.Rebate_Amount__c = 1;
        krPMIA4.Act_Qty__c = 0;
        krPMIA4.External_Key__c = krPromo.Id + '_' + krPMI.Id + '_' + krPMIA4.Rebate_Type__c + '-' + krPMIA4.Period__c;
        krPMIA4.Approval_Status__c = 'Paid';
        krPMIA4.Has_Totals__c = false;

        PMI_Actual__c krPMIA5 = new PMI_Actual__c();
        krPMIA5.RecordTypeId = rtKR_PSAPMIA;
        krPMIA5.Activity__c = krPSA.Id;
        krPMIA5.Promotion__c = krPromo.Id;
        krPMIA5.Promotion_Material_Item__c = krPMI.Id;
        krPMIA5.Period__c = 0;
        krPMIA5.Rebate_Type__c = 'Promotional Activity';
        krPMIA5.Rebate_Amount__c = 1;
        krPMIA5.Act_Qty__c = 0;
        krPMIA5.External_Key__c = krPromo.Id + '_' + krPMI.Id + '_' + krPMIA5.Rebate_Type__c + '-' + krPMIA5.Period__c;
        krPMIA5.Approval_Status__c = 'Paid';
        krPMIA5.Has_Totals__c = false;
        
        PMI_Actual__c krPMIA6 = new PMI_Actual__c();
        krPMIA6.RecordTypeId = rtKR_PSAPMIA;
        krPMIA6.Activity__c = krPSA.Id;
        krPMIA6.Promotion__c = krPromo.Id;
        krPMIA6.Promotion_Material_Item__c = krPMI.Id;
        krPMIA6.Period__c = 0;
        krPMIA6.Rebate_Type__c = 'Training & Advocacy';
        krPMIA6.Rebate_Amount__c = 1;
        krPMIA6.Act_Qty__c = 0;
        krPMIA6.External_Key__c = krPromo.Id + '_' + krPMI.Id + '_' + krPMIA6.Rebate_Type__c + '-' + krPMIA6.Period__c;
        krPMIA6.Approval_Status__c = 'Paid';
        krPMIA6.Has_Totals__c = false;

        PMI_Actual__c krPMIA7 = new PMI_Actual__c();
        krPMIA7.RecordTypeId = rtKR_PSAPMIA;
        krPMIA7.Activity__c = krPSA.Id;
        krPMIA7.Promotion__c = krPromo.Id;
        krPMIA7.Promotion_Material_Item__c = krPMI.Id;
        krPMIA7.Period__c = 0;
        krPMIA7.Rebate_Type__c = 'Payment';
        krPMIA7.Rebate_Amount__c = 1;
        krPMIA7.Act_Qty__c = 0;
        krPMIA7.External_Key__c = krPromo.Id + '_' + krPMI.Id + '_' + krPMIA7.Rebate_Type__c + '-' + krPMIA7.Period__c;
        krPMIA7.Approval_Status__c = 'Paid';
        krPMIA7.Has_Totals__c = false;

        PMI_Actual__c krPMIA8 = new PMI_Actual__c();
        krPMIA8.RecordTypeId = rtKR_PSAPMIA;
        krPMIA8.Activity__c = krPSA.Id;
        krPMIA8.Promotion__c = krPromo.Id;
        krPMIA8.Promotion_Material_Item__c = krPMI.Id;
        krPMIA8.Period__c = 0;
        krPMIA8.Rebate_Type__c = 'Brand Support';
        krPMIA8.Rebate_Amount__c = 1;
        krPMIA8.Act_Qty__c = 0;
        krPMIA8.External_Key__c = krPromo.Id + '_' + krPMI.Id + '_' + krPMIA8.Rebate_Type__c + '-' + krPMIA8.Period__c;
        krPMIA8.Approval_Status__c = 'Paid';
        krPMIA8.Has_Totals__c = false;
        
        PMI_Actual__c[] l_actuals = new PMI_Actual__c[]{jpPMIA, krPMIA, krPMIA2, krPMIA3, krPMIA4, krPMIA5, krPMIA6, krPMIA7, krPMIA8};             
        insert l_actuals;
        
        ContentVersion cv = new ContentVersion();
        cv.Title = 'Test Document';
        cv.PathOnClient = 'Test.png';
        cv.VersionData = EncodingUtil.base64Decode('Test Document');
        insert cv;

        ContentDocumentLink cdl = new ContentDocumentLink();
        cdl.ContentDocumentId = [SELECT Id, ContentDocumentId FROM ContentVersion WHERE Id =:cv.Id].ContentDocumentId;
        cdl.LinkedEntityId = jpPSA.Id;
        cdl.ShareType = 'V';
        insert cdl;

    }

    @isTest
    static void test_getFieldSet() {
        String fieldSetName = 'jp_psa';
        String sObjectName = 'Promotion_Material_Item__c';
        String marketName = 'japan';
        String channel = 'off';
        String promotionType = 'price_promotion';

        Test.startTest();

        Map<String, SimpleListItem> fieldSets = PromotionalSalesAgreement_Controller.getFieldSet(sObjectName, fieldSetName, marketName, '', channel, promotionType);

        Test.stopTest();
        
        System.assertNotEquals(null, fieldSets, 'Field sets should not be null');
    }

    @isTest 
    static void test_GetGLMappings() {
        String rtId = Schema.SObjectType.Promotion_Activity__c.getRecordTypeInfosByName().get('JP - PSA').getRecordTypeId();
        
        Test.startTest();

        List<SAP_Interfaced_Data_Configuration__c> configs = PromotionalSalesAgreement_Controller.getGLMappings(null, rtId);
        
        Test.stopTest();
    }

    @isTest
    static void test_getUserMarket() {
        User user1 = [SELECT Id FROM User WHERE Name = 'Test User'];
        System.runAs(user1) {
            Test.startTest();
    
            Market__c m = PromotionalSalesAgreement_Controller.getUserMarket();
            
            User u = PromotionalSalesAgreement_Controller.getUserDetails();
            Boolean isSOMUser = PromotionalSalesAgreement_Controller.getIsSOMUser();
            
            Test.stopTest();
    
            System.assertEquals('Japan', m.Name, 'Market retrieved doesnt match');
        }
    }

    @isTest
    static void test_getAttachments() {
        User user1 = [SELECT Id FROM User WHERE Name = 'Test User'];
        System.runAs(user1) {            
            Promotion_Activity__c jpPSA = [SELECT Id, Name FROM Promotion_Activity__c WHERE Name = 'Test JP PSA 1' LIMIT 1];
    
            Test.startTest();
    
            List<ContentDocumentLink> docs = PromotionalSalesAgreement_Controller.getAttachedFiles(jpPSA.Id);
    
            Test.stopTest();
        }
    }

    @isTest 
    static void test_getAccounts() {
        String rtParent = Schema.SObjectType.Account.getRecordTypeInfosByName().get('MX - Parents On').getRecordTypeId();

        Market__c market = [SELECT Id, Name FROM Market__c WHERE Name = 'Mexico' LIMIT 1];
        Account mxParentAccount = [SELECT Id, Name FROM Account WHERE Market__c =:market.Id AND RecordTypeId =:rtParent LIMIT 1];
        Test.startTest();

        Account pa = PromotionalSalesAgreement_Controller.getAccountById(mxParentAccount.Id);
        PagedResult pr = PromotionalSalesAgreement_Controller.getAccountsByName(mxParentAccount.Name, true, market.Id, market.Name, 1);
        PagedResult pr2 = PromotionalSalesAgreement_Controller.getAccountsForParent(mxParentAccount.Id, 1, market.Id);

        Test.stopTest();

        System.assertEquals(pa.Id, mxParentAccount.Id, 'Parent accounts dont match');
        System.assertNotEquals(null, pr.records, 'get accounts by name failed');
        System.assertNotEquals(null, pr2.records, 'getaccountsforparent failed');
    }

    @isTest
    static void test_getProducts() {
        User user1 = [SELECT Id FROM User WHERE Name = 'Test User'];
        System.runAs(user1) {                    
            Test.startTest();
    
            PagedResult brands = PromotionalSalesAgreement_Controller.getBrands(1);
            System.assertNotEquals(null, brands.records, 'get brands failed');
            
            Brand__c brand = (Brand__c)brands.records[0];
            PagedResult products = PromotionalSalesAgreement_Controller.getProducts(1, brand.Id);
            System.assertNotEquals(null, products.records, 'get products failed');
    
            Product__c p = (Product__c)products.records[0];
            Product__c prod1 = PromotionalSalesAgreement_Controller.getProductDetails(p.Id);
    
            Test.stopTest();
    
            System.assertNotEquals(null, prod1, 'get product details failed');
        }
    }

    @isTest
    static void test_getWholesalers() {
        User user1 = [SELECT Id FROM User WHERE Name = 'Test User'];
        System.runAs(user1) {            
        
            Market__c market = [SELECT Id, Name FROM Market__c WHERE Name = 'Japan' LIMIT 1];
    
            Test.startTest();
    
            List<Map<String, String>> wholesalers = PromotionalSalesAgreement_Controller.getWholesalers(market.Id);
            PagedResult pr = PromotionalSalesAgreement_Controller.findWholesalers('wholesaler', market.Id, 'Japan');
            Test.stopTest();
    
            System.assertNotEquals(null, wholesalers, 'get wholesalers failed');
        }
    }

    @isTest
    static void test_getPSA() {
        Account a = [SELECT Id, Name FROM Account WHERE Name = 'Test JP Account' LIMIT 1];

        Test.startTest();

        PromotionalSalesAgreement_Controller.Filters filters = new PromotionalSalesAgreement_Controller.Filters();
        filters.searchKey = '';
        filters.myAgreements = false;
        filters.parentAccount = a.Id;
        filters.signingCustomer = '';
        filters.startDate = Date.today();
        filters.endDate = filters.startDate.addYears(2);
        filters.accounts = new List<String>();
        
        PagedResult pr = PromotionalSalesAgreement_Controller.getAgreements(filters, 1);
        System.assertNotEquals(null, pr.records, 'get agreements failed');

        Promotion_Activity__c psa = (Promotion_Activity__c)pr.records[0];
        Map<String, Object> result = PromotionalSalesAgreement_Controller.getPSA(psa.Id);
        System.assertNotEquals(null, result.get('psa'), 'getPSA failed');

        Test.stopTest();
    }

    @isTest
    static void test_getPMIDetails() {
        Promotion_Activity__c psa = [SELECT Id, Name, 
                                            (SELECT Id FROM Promotion_Material_Items__r) 
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];

        Test.startTest();

        Promotion_Material_Item__c pmItem = PromotionalSalesAgreement_Controller.getPSAItemDetails(psa.Promotion_Material_Items__r[0].Id);
        System.assertNotEquals(null, pmItem, 'getPSAItemDetails failed');
        
        Test.stopTest();
    }

    @isTest
    static void test_getPMIADetails() {
        Promotion_Activity__c psa = [SELECT Id, Name, 
                                            (SELECT Id FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];

        Test.startTest();

        PMI_Actual__c pmiaItem = PromotionalSalesAgreement_Controller.getPMIADetails(psa.PMI_Actuals__r[0].Id);
        System.assertNotEquals(null, pmiaItem, 'getPMIADetails failed');
        
        Test.stopTest();
    }

    @isTest
    static void test_savePSA() {
        Promotion_Activity__c psa = [SELECT Id, Name, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];
		        
        Test.startTest();
	
        PSAWrapper wrapper = new PSAWrapper();
        wrapper.id = psa.Id;
        wrapper.parentAccountId = psa.Account__c;
        wrapper.accountOwner = psa.Account__r.Owner.Name;
        wrapper.ownerManager = '';
        wrapper.accountOwnerSalesRegion = psa.Account__r.Owner_Sales_Region__c;
        wrapper.beginDate = Date.today();
        wrapper.endDate = wrapper.beginDate.addMonths(3);
        wrapper.isLengthInYears = false;
        wrapper.lengthOfPSA = 3;
        wrapper.numberOfPayments = 1;
        wrapper.signingCustomerId = psa.Contact__c;
        wrapper.signingCustomerFirstName = psa.Contact__r.FirstName;
        wrapper.signingCustomerLastName = psa.Contact__r.LastName;
        wrapper.signingCustomerEmail = psa.Contact__r.Email;
        wrapper.wholesalerPreferredId = psa.Wholesaler_Preferred__c;
        wrapper.wholesalerPreferredName = psa.Wholesaler_Preferred_Name__c;
        wrapper.wholesalerAlternateId = null;
        wrapper.wholesalerAlternateName = '';
        wrapper.discountCategory = psa.Discount_Category__c;
        wrapper.contractType = psa.Contract_Type__c;
        wrapper.promoCode = psa.Promo_Code__c;
        wrapper.status = 'New';
        wrapper.promotionType = '';
        wrapper.menuType = '';
        wrapper.purchaseOrder = '';
        wrapper.comments = 'testing';
        wrapper.mpoPrestige = false;
        wrapper.totalBudget = 10000;
        wrapper.fee = 10000;
        wrapper.accountPromotionalBudget = 1000000;
        wrapper.accountPromotionalTargetROI = 1.2;
        wrapper.percentageVisibility = 100;
        wrapper.probabilityPercentage = 100;
        wrapper.paymentConfigurationComments = '';
        wrapper.paymentConfigurations = '';
        wrapper.limitToSelectedAccounts = false;
        wrapper.allChildAccountsIncluded = true;
        wrapper.isDirectRebate = false;
        wrapper.accountWholesalerAlternate = null;
        wrapper.accountWholesalerAlternateName = '';
        wrapper.accountWholesalerPreferred = null;
        wrapper.accountWholesalerPreferredName = '';
        
        wrapper.accounts = new List<SelectableItem>();
        SelectableItem si1 = new SelectableItem();
        si1.id = psa.Promotions__r[0].Id;
        si1.itemId = psa.Promotions__r[0].Account__c;
        wrapper.accounts.add(si1);
        
		String result = PromotionalSalesAgreement_Controller.savePSA(wrapper);        
		System.assertEquals('SUCCESS', result, 'savePSA failed');
            
        Test.stopTest();
    }


    @isTest
    static void test_savePSAItems() {
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];
        
        PagedResult brands = PromotionalSalesAgreement_Controller.getBrands(1);
        System.assertNotEquals(null, brands.records, 'get brands failed');
        
        Brand__c brand = (Brand__c)brands.records[0];
        PagedResult products = PromotionalSalesAgreement_Controller.getProducts(1, brand.Id);
        System.assertNotEquals(null, products.records, 'get products failed');
        
        Product__c p = (Product__c)products.records[0];
        
        Test.startTest();
        
        PSAWrapper wrapper = new PSAWrapper();
        wrapper.id = psa.Id;
        wrapper.recordTypeName = psa.RecordTypeName__c;
        wrapper.recordTypeId = psa.RecordTypeId;

        wrapper.accounts = new List<SelectableItem>();
        SelectableItem si1 = new SelectableItem();
        si1.id = psa.Promotions__r[0].Id;
        si1.itemId = psa.Promotions__r[0].Account__c;
        wrapper.accounts.add(si1);        

        wrapper.items = new List<PSAWrapper.PSAItemWrapper>();
        PSAWrapper.PSAItemWrapper psaItem1 = new PSAWrapper.PSAItemWrapper();
        psaItem1.id = null;
        psaItem1.productId = p.Id;
        psaItem1.currentVolume = 10;
        psaItem1.volumeForecast = 5;
        psaItem1.discount = 2.0;
        psaItem1.brandStatus = 'Must Stock';
        psaItem1.drinkStrategy = '';
        psaItem1.listingFee = 500;
        psaItem1.promotionalActivity = '';
        psaItem1.promotionalActivityAmount = 1000;
        psaItem1.trainingAndAdvocacy = '';
        psaItem1.trainingAndAdvocacyAmount = 2000;
        psaItem1.outletToProvide = '';
        psaItem1.cvs = 0;
        psaItem1.excise = 0;
        psaItem1.cosNetofICP = 0;
        psaItem1.educationTax = 0;
        psaItem1.localCOS = 0;
        psaItem1.vapCOS = 0;
        psaItem1.planSNS = 0;
        psaItem1.planGP = 0;
        psaItem1.planGPM = 0;
        
        wrapper.items.add(psaItem1);
        
        String result = PromotionalSalesAgreement_Controller.savePSAItems(wrapper);
		System.assertEquals('OK', result, 'savePSAItems failed');        
        
        Test.stopTest();
    }

    @isTest
    static void test_updateSpreadForPMI() {
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];
        
        Test.startTest();

        String result = PromotionalSalesAgreement_Controller.updateSpreadForPMI(psa.Id, psa.Promotion_Material_Items__r[0].Id);

        Test.stopTest();
        System.assertEquals('OK', result, 'updateSpreadForPMI failed');
    }

    @isTest
    static void test_updatePSA() {
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];

        Test.startTest();

        String result = PromotionalSalesAgreement_Controller.updatePSA(psa.Id, 'Updated', false);

        Test.stopTest();
        System.assertEquals('OK', result, 'updatePSA failed');
    }
    
    @isTest
    static void test_sendDocuSignEnvelope() {
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];

        Test.startTest();

        String result = PromotionalSalesAgreement_Controller.sendDocuSignEnvelope(psa.Id, '');

        Test.stopTest();
        System.assertEquals('OK', result, 'sendDocuSignEnvelope failed');
    }

    @isTest
    static void test_createActuals() {
        Map<String, RecordTypeInfo> pmiaRecordTypes = Schema.SObjectType.PMI_Actual__c.getRecordTypeInfosByName();
        
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];

        String psaId = psa.Id;
        String recordTypeId = pmiaRecordTypes.get(psa.RecordTypeName__c).getRecordTypeId();
        String promotionId = psa.Promotions__r[0].Id;
        String pmiId = psa.Promotion_Material_Items__r[0].Id;
        String wholesalerId = psa.Wholesaler_Preferred__c;
        Date paymentDate = Date.today();
        String externalKey = '';
        String status = 'Paid';
        String invoiceNumber = '12345';
        Integer productPackQty = 1;
        Boolean captureVolumeInBottles = true;
        String comments = 'comments';
        List<PromotionalSalesAgreement_Controller.PSARebate> rebates = new List<PromotionalSalesAgreement_Controller.PSARebate>();
        PromotionalSalesAgreement_Controller.PSARebate rebate1 = new PromotionalSalesAgreement_Controller.PSARebate();
        rebate1.rebateType = 'Volume';
        rebate1.rebateAmount = 100;
        rebate1.isVolumeRebate = true;
        rebate1.plannedRebate = 0;
        rebate1.glAccount = '';
        rebate1.hasTotals = false;
        rebate1.externalKey = promotionId + '_' + pmiId + '_' + rebate1.rebateType + '-2';
        rebate1.status = 'Paid';

        rebates.add(rebate1);

        Test.startTest();

        List<String> result = PromotionalSalesAgreement_Controller.createActuals(psaId, recordTypeId, promotionId, pmiId, wholesalerId, paymentDate, externalKey, status, invoiceNumber, productPackQty, captureVolumeInBottles, comments, rebates);

        Test.stopTest();

        System.assertNotEquals(0, result.size(), 'createActuals failed');
    }


    @isTest
    static void test_updateTotals() {
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'FY_Test KR PSA_NEW' LIMIT 1];

        Test.startTest();

        String result = PromotionalSalesAgreement_Controller.updatePMITotals(psa.Id);
        System.assertEquals('OK', result, 'Update PMI Totals failed');

        List<String> ids = new List<String>();
        ids.add(psa.Id);
        result = PromotionalSalesAgreement_Controller.updateActualTotals(ids);
        System.assertEquals('OK', result, 'Update Actuals Totals failed');
        
        Test.stopTest();
    }

    @isTest
    static void test_approvals() {
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];

        Test.startTest();

        String approvalResult = PromotionalSalesAgreement_Controller.submitForApproval(psa.Id);
        System.assertEquals('OK', approvalResult, 'Submit for Approval failed');

        String recallResult = PromotionalSalesAgreement_Controller.recallApproval(psa.Id);
        System.assertEquals('OK', recallResult, 'Recall Approval failed');

        approvalResult = PromotionalSalesAgreement_Controller.submitActualsForApproval(psa.Id);
        System.assertEquals('OK', approvalResult, 'Submit Actuals for Approval failed');
        
        Test.stopTest();
    }

    @isTest
    static void test_closeAndClone() {
        Promotion_Activity__c psa = [SELECT Id, Name, RecordTypeId, RecordTypeName__c, Account__c, Account__r.Owner.Name, Account__r.Owner_Sales_Region__c,
                                     		Begin_Date__c, End_Date__c, Contract_Type__c, Discount_Category__c, Promo_Code__c,
                                     		Contact__c, Contact__r.FirstName, Contact__r.LastName, Contact__r.Email,
                                     		Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                     		(SELECT Id, Account__c FROM Promotions__r),
                                            (SELECT Id, Product_Custom__c FROM Promotion_Material_Items__r),
                                     		(SELECT Id FROM PMI_Actuals__r)
                                       FROM Promotion_Activity__c 
                                       WHERE Name = 'Test JP PSA 1' LIMIT 1];

        Test.startTest();

        String closeResult = PromotionalSalesAgreement_Controller.closePSA(psa.Id, 'close', 'Test Close');
        System.assertEquals('OK', closeResult, 'Close PSA failed');

        SimpleListItem cloneResult = PromotionalSalesAgreement_Controller.clonePSA(psa.Id, '');
        System.assertNotEquals(null, cloneResult, 'Clone PSA failed');

        Test.stopTest();
    }
    
/*

    @isTest
    static void test_getProducts() {
        Test.startTest();


        Test.stopTest();
    }

    @isTest
    static void test_getProducts() {
        Test.startTest();


        Test.stopTest();
    }


    static testMethod void unitTest1() {
        INFW_TestHelper helper = new INFW_TestHelper();

            
        System.runAs(user1) {
        

            Test.startTest();
            

            
            



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
            //System.assertEquals('OK', msg, 'savePSA failed');

            Map<String, Object> result = PromotionalSalesAgreement_Controller.getPSA(psa1.Id);
            psa1 = (Promotion_Activity__c)result.get('psa');
            //System.assertNotEquals(null, psa1, 'getPSA failed');            
            
            PSAWrapper wrapper2 = new PSAWrapper(psa1);
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
            psaItem1.trainingAndAdvocacy = 'Brand Education';
            psaItem1.trainingAndAdvocacyAmount = 2000;
            psaItem1.outletToProvide = 'Social Media Posting';
            psaItem1.cvs = 0;
            psaItem1.excise = 0;
            psaItem1.cosNetofICP = 0;
            psaItem1.educationTax = 0;
            psaItem1.localCOS = 0;
            psaItem1.vapCOS = 0;
            psaItem1.planSNS = 0;
            psaItem1.planGP = 0;
            psaItem1.planGPM = 0;
            wrapper1.items.add(psaItem1);

            msg = PromotionalSalesAgreement_Controller.savePSAItems(wrapper1);
            System.assertEquals('OK', msg, 'savePSAItems failed');

            PromotionalSalesAgreement_Controller.Filters filters = new PromotionalSalesAgreement_Controller.Filters();
            filters.myAgreements = true;
            filters.parentAccount = parentAccount.Id;
            filters.accounts = new String[]{};
            filters.signingCustomer = '';
            filters.searchKey = '';
            filters.startDate = Date.today();
            filters.endDate = filters.startDate.addDays(90);

            PagedResult pr5 = PromotionalSalesAgreement_Controller.getAgreements(filters, 1);
            msg = PromotionalSalesAgreement_Controller.updatePMITotals(psa1.Id);
            System.assertEquals('OK', msg);

            result = PromotionalSalesAgreement_Controller.getPSA(psa1.Id);
            psa1 = (Promotion_Activity__c)result.get('psa');
           
			String pmiId = psa1.Promotion_Material_Items__r[0].Id;
            Promotion_Material_Item__c pmi = PromotionalSalesAgreement_Controller.getPSAItemDetails(pmiId);
            pmi.Proposed_Plan_Rebate__c = 1.25;
            pmi.Proposed_Plan_Volume__c = 100;
            pmi.Proposed_Listing_Fee__c = 10000;
            pmi.Proposed_Promotional_Activity_Value__c = 2500;
            pmi.Proposed_Training_Advocacy_Value__c = 3000;
            update pmi;
            //System.assertNotEquals(null, pmi);

            psa1.Status__c = 'Approved';
            update psa1;
            
            Boolean isSOMUser = PromotionalSalesAgreement_Controller.getIsSOMUser();
            //System.assertEquals(true, isSOMUser);

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

            List<String> pmiaIds = PromotionalSalesAgreement_Controller.createActuals(psa1.Id, rtPSAPMIA, promotionId, pmiId, wholesalerId, Date.today(), externalKey, 'New', '', 6,true,'test comments', rebates);
            System.assertNotEquals(0, pmiaIds.size());
                       
            msg = PromotionalSalesAgreement_Controller.updateActualTotals(new List<String>{psa1.Id});
            //System.assertEquals('OK', msg);
          
            PMI_Actual__c pmia2 = PromotionalSalesAgreement_Controller.getPMIADetails(pmiaIds[0]);
            //System.assertNotEquals(null, pmia2);

            SimpleListItem sli = PromotionalSalesAgreement_Controller.clonePSA(psa1.Id, 'Cloned PSA');
            //System.assertEquals('OK', sli.name);

            //msg = PromotionalSalesAgreement_Controller.submitForApproval(sli.id);
            //System.assertEquals('OK', msg);

            //msg = PromotionalSalesAgreement_Controller.recallApproval(sli.id);
            //System.assertEquals('OK', msg);
            
            //msg = PromotionalSalesAgreement_Controller.updatePSA(psa1.Id, 'Approved', false);
            //msg = PromotionalSalesAgreement_Controller.closePSA(psa1.Id, 'close', 'test');
            
            //msg = PromotionalSalesAgreement_Controller.updateSpreadForPMI(psa1.Id, pmi.Id);
            
            Map<String, SimpleListItem> fieldsets = PromotionalSalesAgreement_Controller.getFieldSet('Promotion_Material_Item__c', 'UK_PSA', 'United Kingdom', psa1.Id, psa1.Promotion_Type__c, parentAccount.Channel__c);

            PSAWrapper wrapper2 = new PSAWrapper(psa1);
            System.assertNotEquals(null, wrapper2);
                                                          
            PageReference previewRef = Page.PromotionalSalesAgreement_Preview;
            Test.setCurrentPage(previewRef);
            ApexPages.currentPage().getParameters().put('id', psa1.Id);
            PSA_Preview_Controller psaPreviewCtrl = new PSA_Preview_Controller();
            Promotion_Activity__c previewPSA = psaPreviewCtrl.getPsa();
            
            ApexPages.currentPage().getParameters().put('id', psa5.Id);
            ApexPages.Component cmp = psaPreviewCtrl.getPreviewComponent();

            SimpleListItem sli1 = new SimpleListItem();
            SimpleListItem sli2 = new SimpleListItem('123', 'sli2');
            System.assertEquals('sli2', sli2.name);

            SimpleListitem sli3 = new SimpleListItem('123', 'sli3', 'test sli3');
            System.assertEquals('test sli3', sli3.description);

            SimpleListItem sli4 = new SimpleListItem('123', 'sli4', false, 'test sli4', true);
            System.assertEquals(true, sli4.isDefault);

            SimpleListItem sli5 = new SimpleListItem('123', 'sli5', false, 'test sli5', true, false);
            System.assertEquals(false, sli5.isRequired);

            SimpleListItem sli6 = new SimpleListItem('sli6', false);
            System.assertEquals(false, sli6.isRequired);
            
            Test.stopTest();
        }
    }
    */
}