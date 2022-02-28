/**
 * Test Class:  BuildActualsForPSA_Test
 */
public with sharing class BuildInitialActualsForPSA {
    @InvocableMethod
    public static void buildInitialActuals(List<String> activityIds) {
        String rtUKPSA = '';
        String rtBRAPSA = '';
        
        Map<String, Schema.RecordTypeInfo> rtiList = PMI_Actual__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        if (rtiList.containsKey('UK - PSA')) {
            rtUKPSA = rtiList.get('UK - PSA').getRecordTypeId();
        }
        if (rtiList.containsKey('BRA - PSA')) {
            rtBRAPSA = rtiList.get('BRA - PSA').getRecordTypeId();
        }

        
        List<PMI_Actual__c> existingActuals = [SELECT Id, External_Key__c FROM PMI_Actual__c WHERE Activity__c =:activityIds AND External_Key__c LIKE '%_0'];
        Set<String> externalKeys = new Set<String>();
        for(PMI_Actual__c pmia : existingActuals) {
            externalKeys.add(pmia.External_Key__c);
        }
        for(String s : externalKeys) {
            System.debug('existing externalKey: ' + s);
        }

        List<PMI_Actual__c> actuals = new List<PMI_Actual__c>();
        Set<String> s_PSAWithActuals = new Set<String>();
        List<Promotion_Material_Item__c> items = [SELECT Id, Activity__c, Promotion__c, Activity__r.Wholesaler_Preferred__c, 
                                                        Activity__r.Market__c, Activity__r.Market_Name__c
                                                    FROM Promotion_Material_Item__c 
                                                   WHERE Activity__c =:activityIds];

        List<String> marketIds = new List<String>();
        for(Promotion_Material_Item__c pmi : items) {
            if (!marketIds.contains(pmi.Activity__r.Market__c)) {
                marketIds.add(pmi.Activity__r.Market__c);
            }
        }

        Map<String, Schema.RecordTypeInfo> rtList = SAP_Interfaced_Data_Configuration__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        String rtId = rtList.get('UK - PSA').getRecordTypeId();

        List<SAP_Interfaced_Data_Configuration__c> configs = [SELECT Id, Classification__c, SoldTo_Code__c, Market__c
                                                                FROM SAP_Interfaced_Data_Configuration__c
                                                               WHERE RecordTypeId =: rtId
                                                                 AND Market__c =:marketIds
                                                                 AND Is_Active__c = true];
                                           

        try {
            String externalKey = '';
            Boolean addedActuals = false;
            Boolean keyExists = false;
            String recordTypeId = rtUKPSA;
            PMI_Actual__c newActual;
            if (items != null && items.size() > 0) {
                for(Promotion_Material_Item__c pmi : items) {
                    switch on pmi.Activity__r.Market_Name__c {
                        when 'Brazil' {
                            recordTypeId = rtBRAPSA;
                        }
                        when 'United Kingdom' {
                            recordTypeId = rtUKPSA;
                        }
                        when else {
                            recordTypeId = rtUKPSA;
                        }
                    }

                    addedActuals = false;
                    //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Volume-0';
                    newActual = createPMIActual(pmi, 'Volume', recordTypeId, configs);
                    keyExists = externalKeys.contains(newActual.External_Key__c);
                    System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);                
                    if (!keyExists) {
                        actuals.add(newActual);
                        addedActuals = true;
                    }
                    //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Listing Fee-0';
                    newActual = createPMIActual(pmi, 'Listing Fee', recordTypeId, configs);
                    keyExists = externalKeys.contains(newActual.External_Key__c);
                    System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);   
                    if (!keyExists) {
                        actuals.add(newActual);
                        addedActuals = true;
                    }
                    //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Promotional Activity-0';
                    newActual = createPMIActual(pmi, 'Promotional Activity', recordTypeId, configs);
                    keyExists = externalKeys.contains(newActual.External_Key__c);
                    System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);   
                    if (!keyExists) {
                        actuals.add(newActual);
                        addedActuals = true;
                    }
                    //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Training & Advocacy-0';
                    newActual = createPMIActual(pmi, 'Training & Advocacy', recordTypeId, configs);
                    keyExists = externalKeys.contains(newActual.External_Key__c);
                    System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);   
                    if (!keyExists) {
                        actuals.add(newActual);
                        addedActuals = true;
                    }
        
                    newActual = createPMIActual(pmi, 'Payment', recordTypeId, configs);
                    keyExists = externalKeys.contains(newActual.External_Key__c);
                    if (!keyExists) {
                        actuals.add(newActual);
                        addedActuals = true;
                    }
                    if (addedActuals) {
                        s_PSAWithActuals.add(pmi.Activity__c);
                    }
                    
                }
            }
            for(PMI_Actual__c pmia : actuals) {
                System.debug('actuals to create: ' + pmia.External_Key__c);
            }
            if (actuals.size() > 0) {
                insert actuals;
            }
            List<Promotion_Activity__c> l = [SELECT Id, Has_Actual_Totals__c FROM Promotion_Activity__c WHERE Id =: activityIds];
            for(Promotion_Activity__c pa : l) {
                pa.Has_Actual_Totals__c = true;
            }
            System.debug('activities to update: ' + l);
            update l;

        }catch(System.Exception ex) {
            System.debug('Exception: ' + ex.getMessage());
        }
    }

    static PMI_Actual__c createPMIActual(Promotion_Material_Item__c pmi, String rebateType, String recordTypeId, List<SAP_Interfaced_Data_Configuration__c> configs) {
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

        for(SAP_Interfaced_Data_Configuration__c sap : configs) {
            if (sap.Market__c == pmi.Activity__r.Market__c && sap.Classification__c == rebateType) {
                pmia.SAP_GL_Account__c = sap.SoldTo_Code__c; break;
            }
        }


        return pmia;
    }
}