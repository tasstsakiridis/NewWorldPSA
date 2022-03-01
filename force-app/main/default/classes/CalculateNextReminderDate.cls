public with sharing class CalculateNextReminderDate {
    @InvocableMethod
    public static void calcNextReminderDate(List<Promotion_Activity__c> activities) {
        Date startDate;
        for(Promotion_Activity__c pa : activities) {            
            if (pa.Reminder_Date__c == null) {
                if (pa.End_Date__c.addMonths(-3) > pa.Begin_Date__c) {
                    pa.Reminder_Date__c = pa.End_Date__c.addDays(-45);
                } else if (pa.End_Date__c.addDays(-30) > pa.Begin_Date__c) {
                    pa.Reminder_Date__c = pa.End_Date__c.addDays(-30);
                } else {
                    pa.Reminder_Date__c = pa.End_Date__c;
                }
            } else {
                if (pa.Reminder_Date__c.addMonths(3) < pa.End_Date__c) {
                    pa.Reminder_Date__c = pa.Reminder_Date__c.addMonths(45);
                } else if (pa.Reminder_Date__c.addDays(30) < pa.End_Date__c) {
                    pa.Reminder_Date__c = pa.Reminder_Date__c.addDays(30);
                } else {
                    pa.Reminder_Date__c = pa.End_Date__c;
                }
            }
        }
        if (activities.size() > 0) {
            update activities;
        }
    }
}