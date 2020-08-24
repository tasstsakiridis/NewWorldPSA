public with sharing class UK_PSA_PushProposedValues {
    @InvocableMethod
    public static void pushProposedValues(List<String> activityIds) {
        List<Promotion_Material_Item__c> items = [SELECT Id, Name, Plan_Volume__c, Plan_Rebate__c, Listing_Fee__c, Promotional_Activity_Value__c,
                                                    Training_and_Advocacy_Value__c, Proposed_Plan_Volume__c, Proposed_Plan_Rebate__c, 
                                                    Proposed_Listing_Fee__c, Proposed_Promotional_Activity_Value__c, Proposed_Training_Advocacy_Value__c
                                                    FROM Promotion_Material_Item__c
                                                    WHERE Activity__c =: activityIds];

        List<Promotion_Material_Item__c> itemsToUpdate = new List<Promotion_Material_Item__c>();
        for(Promotion_Material_Item__c pmi : items) {
            if (pmi.Proposed_Plan_Volume__c != null && pmi.Plan_Volume__c != pmi.Proposed_Plan_Volume__c) {
                pmi.Plan_Volume__c = pmi.Proposed_Plan_Volume__c;
            }
            if (pmi.Proposed_Plan_Rebate__c != null && pmi.Plan_Rebate__c != pmi.Proposed_Plan_Rebate__c) {
                pmi.Plan_Rebate__c = pmi.Proposed_Plan_Rebate__c;
            }
            if (pmi.Proposed_Listing_Fee__c != null && pmi.Listing_Fee__c != pmi.Proposed_Listing_Fee__c) {
                pmi.Listing_Fee__c = pmi.Proposed_Listing_Fee__c;
            }
            if (pmi.Proposed_Promotional_Activity_Value__c != null && pmi.Promotional_Activity_Value__c != pmi.Proposed_Promotional_Activity_Value__c) {
                pmi.Promotional_Activity_Value__c = pmi.Proposed_Promotional_Activity_Value__c;
            }
            if (pmi.Proposed_Training_Advocacy_Value__c != null && pmi.Training_and_Advocacy_Value__c != pmi.Proposed_Training_Advocacy_Value__c) {
                pmi.Training_and_Advocacy_Value__c = pmi.Proposed_Training_Advocacy_Value__c;
            }
            itemsToUpdate.add(pmi);
        }
        if (itemsToUpdate.size() > 0) {
            update itemsToUpdate;
        }
    }
}