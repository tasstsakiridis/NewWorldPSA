/**
 * Test Class:  Mexico_SampleOrder_PDF_Test
 */
public with sharing class Mexico_SampleOrder_PDF_Controller {

    public SAP_Interfaced_Data__c theSampleOrder;
    public void setTheSampleOrder(SAP_Interfaced_Data__c sampleOrder) {
        theSampleOrder = [SELECT Id, Name, RecordTypeId, RecordType.Name, Account__c, Account__r.Name, Approval_Status__c, Business_Name__c,
                                Business_Address__c, Business_Address2__c, Business_City__c, Business_State__c, Business_Postcode__c, Business_Country__c,
                                Classification__c, Contact_Name__c, Contact_Phone__c, Order_Number__c, Requested_By__c, CreatedBy.Name, 
                                Requested_Delivery_Date__c, Shipping_Instructions__c, Storage_Locker__c, Storage_Locker__r.Name,
                                (SELECT Id, Name, Product__c, Product_Code__c, Product__r.Name, Quantity__c, Product__r.Price__c, Line_Item_Total__c 
                                   FROM SAP_Interfaced_Data_Items__r)
                            FROM SAP_Interfaced_Data__c 
                            WHERE Id =:sampleOrder.Id];

        requestedBy = theSampleOrder.Requested_By__c;
        requestedDate = theSampleOrder.Requested_Delivery_Date__c;
        requestedDay = (('00') + String.valueOf(requestedDate.day())).right(2);
        requestedMonth = (('00') + String.valueOf(requestedDate.month())).right(2);
        requestedYear = String.valueOf(requestedDate.year());

        orderTotal = 0;
        totalOrderQuantity = 0;
        for(SAP_Interfaced_Data_Item__c item : theSampleOrder.SAP_Interfaced_Data_Items__r) {
            orderTotal += item.Line_Item_Total__c;
            totalOrderQuantity += item.Quantity__c;
        }

    }
    public SAP_Interfaced_Data__c getTheSampleOrder() {
        return theSampleOrder;
    }

    public Date requestedDate               { get; set; }

    public String requestedBy               { get; set; }
    public String requestedDay              { get; set; }
    public String requestedMonth            { get; set; }
    public String requestedYear             { get; set; }
    public Decimal orderTotal               { get; set; }
    public Decimal totalOrderQuantity       { get; set; }
    
}