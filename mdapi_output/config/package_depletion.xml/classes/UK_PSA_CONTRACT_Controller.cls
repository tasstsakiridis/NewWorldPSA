public with sharing class UK_PSA_CONTRACT_Controller {
    public Promotion_Activity__c thePSA;
    public void setThePSA(Promotion_Activity__c pa) {
        thePSA = pa;
        List<Promotion_Material_Item__c> items = [SELECT Id, Name, Drink_Strategy__c, Promotional_Activity__c, Training_and_Advocacy__c, Outlet_to_Provide__c
                                                    FROM Promotion_Material_Item__c
                                                    WHERE Activity__c =:pa.Id];

/*
        if (items != null) {
            Set<String> setDrinkStrategy = new Set<String>();
            Set<String> setPromotionalActivity = new Set<String>();
            Set<String> setTrainingAndAdvocacy = new Set<String>();
            Set<String> setOutletToProvide = new Set<String>();

            List<String> l;
            for(Promotion_Material_Item__c pmi : items) {
                if (pmi.Drink_Strategy__c != null) {
                    l = pmi.Drink_Strategy__c.split(';');
                    setDrinkStrategy.addAll(l);
                }
                if (pmi.Promotional_Activity__c != null) {
                    l = pmi.Promotional_Activity__c.split(';');
                    setPromotionalActivity.addAll(l);
                }
                if (pmi.Training_and_Advocacy__c != null) {
                    l = pmi.Training_and_Advocacy__c.split(';');
                    setTrainingAndAdvocacy.addAll(l);
                }
                if (pmi.Outlet_to_Provide__c != null) {
                    l = pmi.Outlet_to_Provide__c.split(';');
                    setOutletToProvide.addAll(l);
                }
            }

            drinkStrategies = setDrinkStrategy.toString();
            drinkStrategies = drinkStrategies.removeStart('{');
            drinkStrategies = drinkStrategies.removeEnd('}');

            promotionalActivities = setPromotionalActivity.toString();
            promotionalActivities = promotionalActivities.removeStart('{');
            promotionalActivities = promotionalActivities.removeEnd('}');

            trainingAndAdvocacies = setTrainingAndAdvocacy.toString();
            trainingAndAdvocacies = trainingAndAdvocacies.removeStart('{');
            trainingAndAdvocacies = trainingAndAdvocacies.removeEnd('}');

            outletToProvideValues = setOutletToProvide.toString();
            outletToProvideValues = outletToProvideValues.removeStart('{');
            outletToProvideValues = outletToProvideValues.removeEnd('}');
        }
        */
    }
    public Promotion_Activity__c getThePSA() {
        return thePSA;
    }

    public String drinkStrategies { get; set; }
    
    public String promotionalActivities { get; set; }

    public String trainingAndAdvocacies { get; set; }

    public String outletToProvideValues { get; set; }


}
