/**
 * Description:  Controller class for the PromotionalSalesAgreement_Preview visualforce page which shows the Brazil PSA Contract email template as a preview
 * Test Class :  PromotionalSalesAgreementController_Test
 *
 */ 
public class PSA_Preview_Controller {
	private final Promotion_Activity__c psa;
    
    public PSA_Preview_Controller() {
        String psaId = ApexPages.currentPage().getParameters().get('id');
        psa = [SELECT Id, Name, RecordTypeId, RecordType.Name, Account__c, Account__r.Name, Account__r.RecordTypeId, Account__r.RecordType.Name,
                                            Account__r.ShippingStreet, Account__r.ShippingCity, Account__r.ShippingState, Account__r.ShippingCountry, Account__r.ShippingPostalCode,
                                            Contact__c, Contact__r.Name, Contact__r.Email, Begin_Date__c, End_Date__c, Length_of_Agreement__c, Is_Length_in_Years__c, Channel__c,
                                            Premise__c, Market__c, Market__r.Name, Status__c, Wholesaler_Preferred__c, Wholesaler_Preferred_Name__c,
                                            Wholesaler_Alternate__c, Wholesaler_Alternate_Name__c, Total_Volume__c, Total_Discount__c, Total_Investment__c, 
                                            Total_Listing_Fee__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity__c, Total_Promotional_Activity_Paid__c, 
                                            Total_Training_and_Advocacy__c, Evaluation_Comments__c, Is_Approved__c, Date_Approved__c, Total_Training_and_Advocacy_Paid__c, 
                                            Total_Actual_Volume__c, Purchase_Order__c, MPO_Prestige__c, Original_Total_Investment__c, Market__r.Change_Threshold_Amount__c,
                                            Market__r.Promotion_Discount_Threshold__c, Reminder_Date__c, Next_Email_Date__c, Market__r.Capture_Volume_in_Bottles__c,
                                            Number_of_Payments__c, Activity_Budget__c, Market__r.Capture_PSA_Budget__c, Market__r.Calculate_PSA_Product_Split__c,
                                            Total_Planned_Spend__c, Total_Payments_Paid__c, Percentage_Visibility__c, Total_Volume_Bottles__c, Total_Actual_Volume_Bottles__c,
                                            Market__r.Capture_End_Date__c,
                                            (SELECT Id, Account__c, AccountName__c, Account__r.RecordTypeId, Account__r.RecordType.Name, Account__r.ShippingStreet, 
                                                    Account__r.ShippingCity, Account__r.ShippingState, Account__r.ShippingCountry, Account__r.ShippingPostalCode, 
                                                    Total_Actual_Qty__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c, Total_Training_and_Advocacy_Paid__c 
                                                    FROM Promotions__r),
                                            (SELECT Id, Promotion__c, Product_Custom__c, Product_Name__c, Brand__c, Approval_Status__c, Plan_Volume__c, Plan_Rebate__c, 
                                                    Brand_Status__c, Drink_Strategy__c, Outlet_to_Provide__c, Status__c, Listing_Fee__c, Promotional_Activity__c,
                                                    Promotional_Activity_Value__c, Quantity__c, Training_and_Advocacy__c, Training_and_Advocacy_Value__c,
                                                    Total_Investment__c, Comments_Long__c, Total_Listing_Fee_Paid__c, Total_Promotional_Activity_Paid__c,
                                                    Total_Training_and_Advocacy_Paid__c, Original_Plan_Volume__c, Original_Plan_Rebate__c, Original_Listing_Fee__c,
                                                    Original_Promotional_Activity__c, Original_Training_Advocacy__c, Total_Actual_Volume__c, Previous_Plan_Volume__c, 
                                                    Previous_Plan_Rebate__c, Previous_Listing_Fee__c, Previous_Promotional_Activity__c, Previous_Training_Advocacy__c,
                                                    Proposed_Plan_Volume__c, Proposed_Plan_Rebate__c, Proposed_Listing_Fee__c, Proposed_Promotional_Activity_Value__c,
                                                    Proposed_Training_Advocacy_Value__c, Product_Pack_Qty__c, Product_Custom__r.Gross_Profit_per_Case__c,
                                                    CurrencyISOCode, Product_Split__c, Total_Payments_Paid__c                                                    
                                                    FROM Promotion_Material_Items__r), 
                                            (SELECT Id, Activity__c, Promotion__c, Promotion_Material_Item__c, Account__c, Account_Name__c, Act_Qty__c,
                                                    Approval_Status__c, Brand_Name__c, External_Key__c, Payment_Date__c, Period__c, RecordTypeId, 
                                                    Product__c, Product_Name__c, Actual_Wholesaler__c, Actual_Wholesaler__r.Name, Listing_Fee__c,
                                                    Promotional_Activity__c, Training_and_Advocacy__c, Rebate_Type__c, Rebate_Amount__c, Has_Totals__c,
                                                    Product_Pack_Qty__c
                                                    FROM PMI_Actuals__r ORDER BY Payment_Date__c),
                                            (SELECT Id, ContentDocumentId, ContentDocument.Title, ContentDocument.FileType, ContentDocument.FileExtension,
                                                    ContentDocument.LatestPublishedVersionId FROM ContentDocumentLinks) 
                                      FROM Promotion_Activity__c 
                                     WHERE Id =:psaId];
    }
    
    public Promotion_Activity__c getPsa() {
        return psa;
    }
}