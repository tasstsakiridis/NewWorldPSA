public with sharing class BuildInitialActualsForPSA {
    @InvocableMethod
    public static void buildInitialActuals(List<String> activityIds) {
        String rtUKPSA = '';
        
        Map<String, Schema.RecordTypeInfo> rtiList = PMI_Actual__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        if (rtiList.containsKey('UK - PSA')) {
            rtUKPSA = rtiList.get('UK - PSA').getRecordTypeId();
        }

        List<PMI_Actual__c> existingActuals = [SELECT Id, External_Key__c FROM PMI_Actual__c WHERE Activity__c =:activityIds AND External_Key__c LIKE '%_0'];
        Set<String> externalKeys = new Set<String>();
        for(PMI_Actual__c pmia : existingActuals) {
            if (!externalKeys.contains(pmia.External_Key__c)) {
                externalKeys.add(pmia.External_Key__c);
            }
        }

        List<PMI_Actual__c> actuals = new List<PMI_Actual__c>();
        Set<String> s_PSAWithActuals = new Set<String>();
        List<Promotion_Material_Item__c> items = [SELECT Id, Activity__c, Promotion__c, Activity__r.Wholesaler_Preferred__c
                                                    FROM Promotion_Material_Item__c 
                                                   WHERE Activity__c =:activityIds];

        String externalKey = '';
        Boolean addedActuals = false;
        if (items != null && items.size() > 0) {
            for(Promotion_Material_Item__c pmi : items) {
                addedActuals = false;
                externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Volume_0';
                if (!externalKeys.contains(externalKey)) {
                    actuals.add(createPMIActual(pmi, 'Volume', rtUKPSA));
                    addedActuals = true;
                }
                externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Listing Fee_0';
                if (!externalKeys.contains(externalKey)) {
                    actuals.add(createPMIActual(pmi, 'Listing Fee', rtUKPSA));
                    addedActuals = true;
                }
                externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Promotional Activity_0';
                if (!externalKeys.contains(externalKey)) {
                    actuals.add(createPMIActual(pmi, 'Promotional Activity', rtUKPSA));
                    addedActuals = true;
                }
                externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Training & Advocacy_0';
                if (!externalKeys.contains(externalKey)) {
                    actuals.add(createPMIActual(pmi, 'Training & Advocacy', rtUKPSA));
                    addedActuals = true;
                }
    
                if (addedActuals) {
                    if (!s_PSAWithActuals.contains(pmi.Activity__c)) {
                        s_PSAWithActuals.add(pmi.Activity__c);
                    }    
                }
                
            }
        }

        if (actuals.size() > 0) {
            insert actuals;

            List<Promotion_Activity__c> l = [SELECT Id, Has_Actual_Totals__c FROM Promotion_Activity__c WHERE Id =: s_PSAWithActuals];
            for(Promotion_Activity__c pa : l) {
                pa.Has_Actual_Totals__c = true;
            }
            update l;
        }
    }

    static PMI_Actual__c createPMIActual(Promotion_Material_Item__c pmi, String rebateType, String recordTypeId) {
        PMI_Actual__c pmia = new PMI_Actual__c();
        pmia.RecordTypeId = recordTypeId;
        pmia.Activity__c = pmi.Activity__c;
        pmia.Promotion__c = pmi.Promotion__c;
        pmia.Promotion_Material_Item__c = pmi.Id;
        pmia.Actual_Wholesaler__c = pmi.Activity__r.Wholesaler_Preferred__c;
        pmia.Period__c = 0;
        pmia.Has_Totals__c = true;
        pmia.Approval_Status__c = 'Rebate Complete';
        pmia.External_Key__c = pmi.Promotion__c + '_' + pmi.Id + '_'+rebateType+'-0';
        pmia.Rebate_Type__c = rebateType;
        pmia.Rebate_Amount__c = 0;
        pmia.Act_Qty__c = 0;
        pmia.Payment_Date__c = Date.today();

        return pmia;
    }
}
