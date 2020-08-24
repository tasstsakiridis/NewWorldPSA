public with sharing class CalculateNextActualsReminderDate {
    @InvocableMethod
    public static void calcNextActualsReminderDate(List<Promotion_Activity__c> activities) {
        Date startDate;
        for(Promotion_Activity__c pa : activities) {
            
            startDate = pa.Begin_Date__c;
            if (pa.Next_Email_Date__c != null) {
                startDate = pa.Next_Email_Date__c;
            }
            if (startDate.addMonths(3) > pa.End_Date__c) {
                if (startDate.addDays(30) > pa.End_Date__c) {
                    pa.Next_Email_Date__c = pa.End_Date__c;
                } else {
                    pa.Next_Email_Date__c = startDate.addDays(30);
                } 
            } else {
                pa.Next_Email_Date__c = startDate.addMonths(3);
            }

        }
        if (activities.size() > 0) {
            List<Promotion_Activity__c> paList = new List<Promotion_Activity__c>();
            for(Promotion_Activity__c pa : activities) {
                paList.add(new Promotion_Activity__c(
                                    Id=pa.Id, 
                                    Next_Email_Date__c = pa.Next_Email_Date__c
                            ));
            }
            update paList;
        }
    }
}
