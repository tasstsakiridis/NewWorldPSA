public with sharing class Update_PSA_Actuals_Approvals {
    @InvocableMethod
    public static void Update_PSA_Actuals_Approvals(List<String> activityIds) {
        List<Promotion_Activity__c> activities = [SELECT Id, SalesProposal_Actuals_Updated__c, PMI_Actual_Status__c,
                                                    (SELECT Id, Approval_Status__c FROM PMI_Actuals__r WHERE Approval_Status__c = 'Submit')
                                                    FROM Promotion_Activity__c
                                                    WHERE Id =:activityIds];

        List<PMI_Actual__c> actualsToUpdate = new List<PMI_Actual__c>();
        for(Promotion_Activity__c theActivity : activities) {
            if (theActivity.PMI_Actuals__r != null && theActivity.PMI_Actuals__r.size() > 0) {
                for(PMI_Actual__c pmia : theActivity.PMI_Actuals__r) {
                    if (theActivity.PMI_Actual_Status__c == 'Approved' || theActivity.PMI_Actual_Status__c == 'Paid') {
                        pmia.Approval_Status__c = theActivity.PMI_Actual_Status__c;                        
                    } else {
                        pmia.Approval_Status__c = 'New';
                    }

                    actualsToUpdate.add(pmia);
                }

                theActivity.SalesProposal_Actuals_Updated__c = false;                
            }            
        }

        if (actualsToUpdate.size() > 0) {
            update actualsToUpdate;
            update activities;
        }
    }
}