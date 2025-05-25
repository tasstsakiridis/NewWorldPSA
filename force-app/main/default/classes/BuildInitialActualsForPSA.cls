/**
 * Test Class:  BuildActualsForPSA_Test
 */
public with sharing class BuildInitialActualsForPSA {
    @InvocableMethod
    public static void buildInitialActuals(List<String> activityIds) {        
        Map<String, Schema.RecordTypeInfo> rtSAPInterfacedDataConfigurationList = SAP_Interfaced_Data_Configuration__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        Map<String, Schema.RecordTypeInfo> rtPMIActualsList = PMI_Actual__c.SObjectType.getDescribe().getRecordTypeInfosByName();
        String rtPMIActualDefault = rtPMIActualsList.get('UK - PSA').getRecordTypeId();

        List<Promotion_Activity__c> activities = [SELECT Id, Begin_Date__c, End_Date__c, Market__c, Market__r.Name, Market__r.Spread_Planned_Values__c, 
                                                        RecordTypeId, RecordType.Name, Wholesaler_Preferred__c, Has_Actual_Totals__c, Length_of_Agreement__c, Is_Length_in_Years__c,
                                                    (SELECT Id, Activity__c, RecordTypeId, RecordType.Name, Promotion__c, Product_Custom__c, Plan_Volume__c, Plan_Rebate__c, Listing_Fee__c, Promotional_Activity_Value__c,
                                                            Training_and_Advocacy_Value__c, Proposed_Plan_Volume__c, Proposed_Plan_Rebate__c, Proposed_Listing_Fee__c, Proposed_Promotional_Activity_Value__c, Proposed_Training_Advocacy_Value__c
                                                        FROM Promotion_Material_Items__r)
                                                    FROM Promotion_Activity__c 
                                                    WHERE Id =:activityIds];

        List<PMI_Actual__c> existingActuals = [SELECT Id, External_Key__c FROM PMI_Actual__c WHERE Activity__c =:activityIds AND External_Key__c LIKE '%_0'];
        Set<String> existingExternalKeys = new Set<String>();
        for(PMI_Actual__c pmia : existingActuals) {
            existingExternalKeys.add(pmia.External_Key__c);
        }

        List<PMI_Actual__c> actuals = new List<PMI_Actual__c>();
        Set<String> s_PSAWithActuals = new Set<String>();
        /*
        List<Promotion_Material_Item__c> items = [SELECT Id, Activity__c, Promotion__c, Activity__r.Wholesaler_Preferred__c, 
                                                        Activity__r.Market__c, Activity__r.Market_Name__c
                                                    FROM Promotion_Material_Item__c 
                                                   WHERE Activity__c =:activityIds];
        */
        List<String> recordTypeIds = new List<String>();
        List<String> marketIds = new List<String>();
        for(Promotion_Activity__c pa : activities) {
            if (!marketIds.contains(pa.Market__c)) {
                marketIds.add(pa.Market__c);
            }

            if (!recordTypeIds.contains(pa.RecordTypeId)) {
                recordTypeIds.add(pa.RecordTypeId);
            }
        }

        List<SAP_Interfaced_Data_Configuration__c> configs = [SELECT Id, Classification__c, SoldTo_Code__c, Market__c
                                                                FROM SAP_Interfaced_Data_Configuration__c
                                                               WHERE RecordTypeId =: recordTypeIds
                                                                 AND Market__c =:marketIds
                                                                 AND Is_Active__c = true];
                                           

        try {
            String externalKey = '';
            Boolean addedActuals = false;
            Boolean keyExists = false;
            String pmiaRecordType = '';
            PMI_Actual__c newActual;
            List<Promotion_Material_Item__c> itemsToUpdate = new List<Promotion_Material_Item__c>();

            Schema.DescribeFieldResult dfrRebateTypes = PMI_Actual__c.Rebate_Type__c.getDescribe();
            List<Schema.PicklistEntry> rebateTypes = dfrRebateTypes.getPicklistValues();
        
            for(Promotion_Activity__c pa : activities) {
                if (pa.Promotion_Material_Items__r != null && pa.Promotion_Material_Items__r.size() > 0) {
                    for(Promotion_Material_Item__c pmi : pa.Promotion_Material_Items__r) {
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

                        pmiaRecordType = rtPMIActualDefault;
                        if (rtPMIActualsList.containsKey(pmi.RecordType.Name)) {
                            pmiaRecordType = rtPMIActualsList.get(pmi.RecordType.Name).getRecordTypeId();
                        } 

                        addedActuals = false;
                        for(Schema.PicklistEntry pe : rebateTypes) {
                            if (pe.isActive()) {
                                //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Volume-0';
                                newActual = createPMIActual(pa, pmi, pe.getValue(), pmiaRecordType, configs, true, false, 0, 0);
                                keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                                System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);                
                                if (!keyExists) {
                                    actuals.add(newActual);
                                    addedActuals = true;
                                }   
                            }
                        }
                        
                        /*
                        addedActuals = false;
                        //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Volume-0';
                        newActual = createPMIActual(pa, pmi, 'Volume', pmiaRecordType, configs, true, false, 0, 0);
                        keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                        System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);                
                        if (!keyExists) {
                            actuals.add(newActual);
                            addedActuals = true;
                        }    

                        newActual = createPMIActual(pa, pmi, 'Free Goods', pmiaRecordType, configs, true, false, 0, 0);
                        keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                        System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);                
                        if (!keyExists) {
                            actuals.add(newActual);
                            addedActuals = true;
                        }
                        //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Listing Fee-0';
                        newActual = createPMIActual(pa, pmi, 'Listing Fee', pmiaRecordType, configs, true, false, 0, 0);
                        keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                        System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);   
                        if (!keyExists) {
                            actuals.add(newActual);
                            addedActuals = true;
                        }
                        //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Promotional Activity-0';
                        newActual = createPMIActual(pa, pmi, 'Promotional Activity', pmiaRecordType, configs, true, false, 0, 0);
                        keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                        System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);   
                        if (!keyExists) {
                            actuals.add(newActual);
                            addedActuals = true;
                        }
                        //externalKey = pmi.Promotion__c + '_' + pmi.Id + '_Training & Advocacy-0';
                        newActual = createPMIActual(pa, pmi, 'Training & Advocacy', pmiaRecordType, configs, true, false, 0, 0);
                        keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                        System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);   
                        if (!keyExists) {
                            actuals.add(newActual);
                            addedActuals = true;
                        }

                        newActual = createPMIActual(pa, pmi, 'Branding Support', pmiaRecordType, configs, true, false, 0, 0);
                        keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                        System.debug('externalKey: ' + newActual.External_Key__c + ', exists: ' + keyExists);   
                        if (!keyExists) {
                            actuals.add(newActual);
                            addedActuals = true;
                        }
            
                        newActual = createPMIActual(pa, pmi, 'Payment', pmiaRecordType, configs, true, false, 0, 0);
                        keyExists = existingExternalKeys.contains(newActual.External_Key__c);
                        if (!keyExists) {
                            actuals.add(newActual);
                            addedActuals = true;
                        }
                        */
                        if (addedActuals) {
                            s_PSAWithActuals.add(pmi.Activity__c);
                        }

                        if (pa.Market__r.Spread_Planned_Values__c) {
                            Integer numberOfMonths = 0;
                            if (pa.Length_of_Agreement__c != null) {
                                numberOfMonths = pa.Length_of_Agreement__c.intValue();
                                if (pa.Is_Length_in_Years__c) {
                                    numberOfMonths = pa.Length_of_Agreement__c.intValue() * 12;
                                }
                            } else {
                                Date startDate = Date.newInstance(pa.Begin_Date__c.year(), pa.Begin_Date__c.month(), 1);
                                numberOfMonths = startDate.monthsBetween(pa.End_Date__c)+1;
                            }
                            for(Integer mm = 0; mm < numberOfMonths; mm++) {
                                newActual = createPMIActual(pa, pmi, 'Volume', pmiaRecordType, configs, false, true, numberOfMonths, mm);
                                if (!existingExternalKeys.contains(newActual.External_Key__c)) {
                                    actuals.add(newActual);
                                }
                            }
                        }
                    }
                }
                
                pa.Has_Actual_Totals__c = true;
            }

            if (actuals.size() > 0) {
                insert actuals;
            }

            if (itemsToUpdate.size() > 0) {
                update itemsToUpdate;
            }
            System.debug('activities to update: ' + activities);
            update activities;
            
        }catch(System.Exception ex) {
            System.debug('Exception: ' + ex.getMessage());
        }
    }

    static PMI_Actual__c createPMIActual(Promotion_Activity__c theActivity, Promotion_Material_Item__c pmi, String rebateType, String recordTypeId, List<SAP_Interfaced_Data_Configuration__c> configs, Boolean isTotal, Boolean calcSpread, Integer numberOfMonths, Integer period) {
        PMI_Actual__c pmia = new PMI_Actual__c();
        pmia.RecordTypeId = recordTypeId;
        pmia.Activity__c = theActivity.Id;
        pmia.Promotion__c = pmi.Promotion__c;
        pmia.Promotion_Material_Item__c = pmi.Id;
        pmia.Actual_Wholesaler__c = theActivity.Wholesaler_Preferred__c;
        pmia.Has_Totals__c = isTotal;
        pmia.Period__c = period;
        pmia.Approval_Status__c = isTotal ? 'Rebate Complete' : 'New';
        pmia.External_Key__c = pmi.Promotion__c + '_' + pmi.Id + '_'+rebateType+(isTotal ? '_total' : '')+'-'+period;
        pmia.Rebate_Type__c = rebateType;
        pmia.Rebate_Amount__c = 0;
        pmia.Act_Qty__c = 0;
        pmia.Payment_Date__c = Date.today();

        if (calcSpread) {
            pmia.Forecast_Volume__c = pmi.Plan_Volume__c / numberOfMonths;
            pmia.Forecast_Listing_Fee__c = pmi.Listing_Fee__c / numberOfMonths;
            pmia.Forecast_Promotional_Activity__c = pmi.Promotional_Activity_Value__c / numberOfMonths;
            pmia.Payment_Date__c = theActivity.Begin_Date__c.addMonths(period);
        }

        for(SAP_Interfaced_Data_Configuration__c sap : configs) {
            if (sap.Market__c == theActivity.Market__c && sap.Classification__c == rebateType) {
                pmia.SAP_GL_Account__c = sap.SoldTo_Code__c; break;
            }
        }

        return pmia;
    }
}