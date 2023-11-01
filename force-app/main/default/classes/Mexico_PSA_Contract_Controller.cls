/**
 * Test Class:  Mexico_PSA_Contract_Controller_Test
 */
public with sharing class Mexico_PSA_Contract_Controller {
    public class listItem {
        public Integer index                            { get; set; }
        public String productName                       { get; set; }
        public String selectedValues                    { get; set; }
        public Decimal value                            { get; set; }

        public listItem() {
            this.index = 0;
            this.productName = '';
            this.selectedValues = '';
            this.value = 0;
        }
        public listItem(Integer i, String n, String sv, Decimal v) {
            this.index = i;
            this.productName = n;
            this.selectedValues = sv;
            this.value = v;
        }
    }
    public class pmiItem {
        public Integer index                            { get; set; }
        public String productName                       { get; set; }
        public Decimal rebatePercentage                 { get; set; }
        public Decimal planVolumeBottles                { get; set; }
        public Decimal planVolumeLiability              { get; set; }
        public Decimal rebateLiability                  { get; set; }
        public Decimal promotionalActivityAmount        { get; set; }
        public String promotionalActivity               { get; set; }
        public String drinkStrategy                     { get; set; }
        public String brandVisibility                   { get; set; }
        public String productVisibility                 { get; set; }
        public String trainingAndAdvocacy               { get; set; }
        public String outletToProvide                   { get; set; }
        public Boolean hasBrandVisibility               { get; set; }
        public Boolean hasDrinkStrategy                 { get; set; }
        public Boolean hasOutletToProvide               { get; set; }
        public Boolean hasProductVisibility             { get; set; }
        public Boolean hasPromotionalActivity           { get; set; }
        public Boolean hasTrainingAndAdvocacy           { get; set; }
    }
    
    public class pmiFreeGoods {
        public Integer index							{ get; set; }
        public String productName                       { get; set; }
        public Decimal freeBottleVolume                 { get; set; }
        public Decimal freeBottleCost                   { get; set; }
        public Date freeGoodsGivenDate                  { get; set; }
        public String freeGoodsReason                   { get; set; }  
    }
    
    public class payment {
        public Integer paymentNumber                    { get; set; }
        public Decimal paymentPercentage                { get; set; }
        public Decimal paymentAmount                    { get; set; }
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
                           Payment_Configurations__c, Activity_Type__c, Evaluation_Comments__c, Total_Promotional_Activity__c, Total_Free_Bottle_Quantity__c,
                  		   Limit_to_Selected_Accounts__c, Account__r.RecordType.Name,  
                    (SELECT Id, Name, AccountName__c, Account__r.RFC__c,Account__r.RecordType.Name FROM Promotions__r), 
                  	(SELECT Id, Name, Product__c, Product_Name__c, Plan_Volume__c, Plan_Volume_Bottles__c, Plan_Rebate_Liability__c, Free_Goods_Reason__c, 
                            Free_Goods_Given_Date__c, Free_Bottle_Quantity__c, PSA_Free_Bottle_Cost__c, Product_Custom__r.Price__c, Plan_Rebate_Percentage__c,
                            Brand_Status__c, Listing_Fee__c, Promotional_Activity__c, Promotional_Activity_Value__c, Drink_Strategy__c, Brand_Visibility__c, 
                            Product_Visibility__c, Training_and_Advocacy__c, Outlet_to_Provide__c, Comments__c, Plan_Rebate_Volume__c, Brand__c
                       FROM Promotion_Material_Items__r)
           		    FROM Promotion_Activity__c 
		            WHERE Id =:pa.Id];

        List<Schema.PicklistEntry> brandStatusValues = Promotion_Material_Item__c.Brand_Status__c.getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> drinkStategyValues = Promotion_Material_Item__c.Drink_Strategy__c.getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> promotionalActivityValues = Promotion_Material_Item__c.Promotional_Activity__c.getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> trainingAndAdvocacyValues = Promotion_Material_Item__c.Training_and_Advocacy__c.getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> brandVisibilityValues = Promotion_Material_Item__c.Brand_Visibility__c.getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> productVisibilityValues = Promotion_Material_Item__c.Product_Visibility__c.getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> freeGoodsReasonValues = Promotion_Material_Item__c.Free_Goods_Reason__c.getDescribe().getPicklistValues();
        List<Schema.PicklistEntry> outletToProvideValues = Promotion_Material_Item__c.Outlet_to_Provide__c.getDescribe().getPicklistValues();

        numberOfProducts = thePSA.Promotion_Material_Items__r.size();
        ownerName = thePSA.Account__r.Owner.Name;
        ownerManagerName = thePSA.Account__r.Owner.Manager.Name;
        numberOfPayments = Integer.valueOf(thePSA.Number_of_Payments__c);
        comments = thePSA.Evaluation_Comments__c == null ? '' : thePSA.Evaluation_Comments__c;
        
        Integer ctr = 1;
        Integer ctrFreeGoods = 1;
        totalRebateLiability = 0;
        promotionMaterialItems = new List<pmiItem>();
        accountsInContract = new List<Promotion__c>();
        mustStockProducts = new List<Promotion_Material_Item__c>();
        mustStockBrands = new List<String>();
        drinkStrategyItems = new List<listItem>();
        promotionalActivityItems = new List<listItem>();
        trainingAndAdvocacyItems = new List<listItem>();
        brandVisibilityItems = new List<listItem>();
        productVisibilityItems = new List<listItem>();
        outletToProvideItems = new List<listItem>();
        selectedAccounts = '';

        payments = new List<payment>();        

        totalListingFee = thePSA.Total_Listing_Fee__c == null ? 0 : thePSA.Total_Listing_Fee__c;
        totalPromotionalActivity = thePSA.Total_Promotional_Activity__c == null ? 0 : thePSA.Total_Promotional_Activity__c;
        totalFreeGoods = thePSA.Total_Free_Bottle_Quantity__c == null ? 0 : thePSA.Total_Free_Bottle_Quantity__c;

        showPaymentDetails = totalListingFee + totalPromotionalActivity + totalFreeGoods > 0;
        
         if (thePSA.Account__r.RecordType.Name == 'MX - Parents On' && thePSA.Limit_to_Selected_Accounts__c == TRUE){
            
            for (Promotion__c promotion : thePSA.Promotions__r ) {
                if(promotion.Account__r.RecordType.Name == 'MX - Outlet On' ){
                	selectedAccounts += promotion.AccountName__c + ' (' + promotion.Account__r.RFC__c + '),';    
                }
            }
            selectedAccounts = selectedAccounts.removeEnd(',');
        }


        if (numberOfPayments == 1 && totalListingFee > 0) {
            payment p = new payment();
            p.paymentNumber = 1;
            p.paymentPercentage = 0;
            p.paymentAmount = totalListingFee;
            payments.add(p);
            
        } else if (String.isNotEmpty(thePSA.Payment_Configurations__c) && numberOfPayments > 1 && totalListingFee > 0) {
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
        
        Map<String, List<String>> drinkStrategiesByBrand = new Map<String, List<String>>();
        Map<String, List<String>> promotionalActivitiesByBrand = new Map<String, List<String>>();
        Map<String, List<String>> trainingAdvocaciesByBrand = new Map<String, List<String>>();
        Map<String, List<String>> brandVisibilityByBrand = new Map<String, List<String>>();
        Map<String, List<String>> productVisibilityByBrand = new Map<String, List<String>>();
        Map<String, List<String>> outletToProvideByBrand = new Map<String, List<String>>();
        List<String> itemSelections;
        freeGoodsToGive = new List<pmiFreeGoods>();

        for(Promotion_Material_Item__c pmi : thePSA.Promotion_Material_Items__r) {            
            pmiItem item = new pmiItem();
            item.index = ctr;
            item.productName = pmi.Product_Name__c;
            item.rebatePercentage = pmi.Plan_Rebate_Percentage__c == null ? 0 : pmi.Plan_Rebate_Percentage__c;
            item.planVolumeBottles = pmi.Plan_Volume_Bottles__c == null ? 0 : pmi.Plan_Volume_Bottles__c;
            //item.planVolumeLiability = (item.planVolumeBottles * (item.rebatePercentage / 100)).round();
            item.planVolumeLiability = pmi.Plan_Rebate_Volume__c == null ? 0 : pmi.Plan_Rebate_Volume__c;
            //item.rebateLiability = item.planVolumeBottles * (pmi.Product_Custom__r.Price__c == null ? 0 : pmi.Product_Custom__r.Price__c);
            item.rebateLiability = pmi.Plan_Rebate_Liability__c == null ? 0 : pmi.Plan_Rebate_Liability__c;
            if(pmi.Free_Bottle_Quantity__c != null && pmi.Free_Bottle_Quantity__c > 0){
                pmiFreeGoods freeGoods = new pmiFreeGoods();
                freeGoods.index = ctrFreeGoods;
                freeGoods.productName = pmi.Product_Name__c;
            	freeGoods.freeBottleVolume = pmi.Free_Bottle_Quantity__c == null ? 0 : pmi.Free_Bottle_Quantity__c;
            	freeGoods.freeBottleCost = pmi.Product_Custom__r == null ||  pmi.Product_Custom__r.Price__c == null ? 0 : pmi.Product_Custom__r.Price__c * freeGoods.freeBottleVolume;
            	freeGoods.freeGoodsReason = getTranslation(pmi.Free_Goods_Reason__c, freeGoodsReasonValues);   

                freeGoodsToGive.add(freeGoods);
                ctrFreeGoods++;
            }
            
            item.promotionalActivity = getTranslation(pmi.Promotional_Activity__c, promotionalActivityValues);

            item.promotionalActivityAmount = pmi.Promotional_Activity_Value__c == null ? 0 : pmi.Promotional_Activity_Value__c;            
            item.drinkStrategy = getTranslation(pmi.Drink_Strategy__c, drinkStategyValues);
            
            item.brandVisibility = getTranslation(pmi.Brand_Visibility__c, brandVisibilityValues);
            item.productVisibility = getTranslation(pmi.Product_Visibility__c, productVisibilityValues);
            item.trainingAndAdvocacy = getTranslation(pmi.Training_and_Advocacy__c, trainingAndAdvocacyValues);
            item.outletToProvide = getTranslation(pmi.Outlet_to_Provide__c, outletToProvideValues);

            totalRebateLiability += item.rebateLiability;
            totalVolumeLiability += item.planVolumeLiability;
            ctr++;
            

            if (String.isNotEmpty(pmi.Brand_Status__c) && pmi.Brand_Status__c.indexOf('Must Stock') >= 0) {
                if (!mustStockBrands.contains(pmi.Brand__c)) {
                    mustStockBrands.add(pmi.Brand__c);
                }
                mustStockProducts.add(pmi);
            }

            if (String.isNotEmpty(pmi.Comments__c)) {
                comments += ' ' + pmi.Comments__c;
            }

            promotionMaterialItems.add(item);
            if (String.isNotEmpty(item.drinkStrategy)) {
                /*
                if (drinkStrategiesByBrand.containsKey(item.Brand__c)) {
                    itemSelections = drinkStrategiesByBrand.get(item.Brand__c);
                    List<String> drinkStrategies = item.drinkStrategy.split(';');
                    for(String s : drinkStrategies) {
                        if (!itemSelections.contains(s)) {
                            itemSelections.add(s);
                        }
                    }
                } else {
                    itemSelections = item.drinkStrategy.split(';');
                }
                */
                itemSelections = groupSelection(item.drinkStrategy, pmi.Brand__c, drinkStrategiesByBrand);
                drinkStrategiesByBrand.put(pmi.Brand__c, itemSelections);

                //drinkStrategyItems.add(new listItem(drinkStrategyItems.size(), item.productName, item.drinkStrategy, 0));
            }
            if (String.isNotEmpty(item.promotionalActivity)) {
                //promotionalActivityItems.add(new listItem(promotionalActivityItems.size(), item.productName, item.promotionalActivity, item.promotionalActivityAmount));
                itemSelections = groupSelection(item.promotionalActivity, pmi.Brand__c, promotionalActivitiesByBrand);
                promotionalActivitiesByBrand.put(pmi.Brand__c, itemSelections);
            }
            if (String.isNotEmpty(item.trainingAndAdvocacy)) {
                //trainingAndAdvocacyItems.add(new listItem(trainingAndAdvocacyItems.size(), item.productName, item.trainingAndAdvocacy, 0));
                itemSelections = groupSelection(item.trainingAndAdvocacy, pmi.Brand__c, trainingAdvocaciesByBrand);
                trainingAdvocaciesByBrand.put(pmi.Brand__c, itemSelections);
            }
            if (String.isNotEmpty(item.brandVisibility)) {
                //brandVisibilityItems.add(new listItem(brandVisibilityItems.size(), item.productName, item.brandVisibility, 0));
                itemSelections = groupSelection(item.brandVisibility, pmi.Brand__c, brandVisibilityByBrand);
                brandVisibilityByBrand.put(pmi.Brand__c, itemSelections);
            }
            if (String.isNotEmpty(item.productVisibility)) {
                //productVisibilityItems.add(new listItem(productVisibilityItems.size(), item.productName, item.productVisibility, 0));
                itemSelections = groupSelection(item.productVisibility, pmi.Brand__c, productVisibilityByBrand);
                productVisibilityByBrand.put(pmi.Brand__c, itemSelections);
            }
            if (String.isNotEmpty(item.outletToProvide)) {
                //outletToProvideItems.add(new listItem(outletToProvideItems.size(), item.productName, item.outletToProvide, 0));
                itemSelections = groupSelection(item.outletToProvide, pmi.Brand__c, outletToProvideByBrand);
                outletToProvideByBrand.put(pmi.Brand__c, itemSelections);
            }
        }

        
        numberOfMustStockBrands = mustStockBrands.size();
        percentageVisibility = thePSA.Percentage_Visibility__c == null ? 0 : thePSA.Percentage_Visibility__c;
        
        for(String s : drinkStrategiesByBrand.keySet()) {
            drinkStrategyItems.add(new listItem(drinkStrategyItems.size(), s, String.join(drinkStrategiesByBrand.get(s), ';'), 0));
        }
        for(String s : promotionalActivitiesByBrand.keySet()) {
            promotionalActivityItems.add(new listItem(promotionalActivityItems.size(), s, String.join(promotionalActivitiesByBrand.get(s), ';'), 0));
        }
        for(String s : trainingAdvocaciesByBrand.keySet()) {
            trainingAndAdvocacyItems.add(new listItem(trainingAndAdvocacyItems.size(), s, String.join(trainingAdvocaciesByBrand.get(s), ';'), 0));
        }
        for(String s: brandVisibilityByBrand.keySet()) {
            brandVisibilityItems.add(new listItem(brandVisibilityItems.size(), s, String.join(brandVisibilityByBrand.get(s), ';'), 0));
        }
        for(String s : productVisibilityByBrand.keySet()) {
            productVisibilityItems.add(new listItem(productVisibilityItems.size(), s, String.join(productVisibilityByBrand.get(s), ';'), 0));
        }
        for(String s : outletToProvideByBrand.keySet()) {
            outletToProvideItems.add(new listItem(outletToProvideItems.size(), s, String.join(outletToProvideByBrand.get(s), ';'), 0));
        }

    }

    private String getTranslation(String value, List<Schema.PicklistEntry> picklistValues) {
        String v = value == null ? '' : value;
        List<String> values = v.split(';');
        String result = '';
        for(String s : values) {
            for(Schema.PicklistEntry pe : picklistValues) {
                if (pe.getValue() == s) {
                    result += pe.getLabel() + ',';
                }
            }
        }

        return result.removeEnd(',');
    }
    private List<String> groupSelection(String picklistValues, String key, Map<String, List<String>> itemMap) {
        List<String> picklistSelections = picklistValues.split(';');
        List<String> selections;
        if (itemMap.containsKey(key)) {
            selections = itemMap.get(key);
            for(String s : picklistSelections) {
                if (!selections.contains(s)) {
                    selections.add(s);
                }
            }
        } else {
            selections = picklistSelections;
        }
        return selections;
    }
    public Promotion_Activity__c getThePSA() {
        return thePSA;
    }

    public List<pmiItem> promotionMaterialItems                 { get; set; }
    public List<pmiFreeGoods> freeGoodsToGive		            { get; set; }
    public List<Promotion_Material_Item__c> mustStockProducts   { get; set; }
    public List <Promotion__c> accountsInContract               { get; set; }
    public List<String> mustStockBrands                         { get; set; }
    public List<listItem> drinkStrategyItems                    { get; set; }
    public List<listItem> promotionalActivityItems              { get; set; }
    public List<listItem> trainingAndAdvocacyItems              { get; set; }
    public List<listItem> brandVisibilityItems                  { get; set; }
    public List<listItem> productVisibilityItems                { get; set; }
    public List<listItem> outletToProvideItems                  { get; set; }
    public List<payment> payments                               { get; set; }
    public Integer numberOfMustStockBrands                      { get; set; }
    public String ownerName                                     { get; set; }
    public String ownerManagerName                              { get; set; }
    public String contactName                                   { get; set; }
    public String totalBudget                                   { get; set; }
    public String formattedTotalBudget                          { get; set; }
    public Decimal totalRebateLiability                         { get; set; }
    public Decimal totalVolumeLiability                         { get; set; }
    public Decimal totalListingFee                              { get; set; }
    public Decimal totalPromotionalActivity                     { get; set; }
    public Decimal totalPlanVolume                              { get; set; }
    public Decimal totalFreeGoods                               { get; set; }
    public Decimal percentageVisibility                         { get; set; }
    public Integer numberOfPayments                             { get; set; }
    public String comments                                      { get; set; }
    public String selectedAccounts                              { get; set; }
    public Boolean showPaymentDetails                           { get; set; }

    public Integer numberOfProducts                             { get; set; }
    
}