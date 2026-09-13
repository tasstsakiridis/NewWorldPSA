/**
 * Test Class:   Korea_PSA_Contract_Controller_Test
 */
public with sharing class Korea_PSA_Contract_Controller {

    public Promotion_Activity__c thePSA;
    public List<Promotion_Material_Item__c> promotionMaterialItems 	{ get; set; }
    public List<PMI_Actual__c> actuals 								{ get; set; }

    public String specialApprovalReason 							{ get; set; }
    
    public void setThePSA(Promotion_Activity__c pa) {
        
        // This is your original Production query
        thePSA = [SELECT Id, Name, RecordTypeId, RecordType.Name, Status__c, Market__c, Account__c, Account__r.Name, Account_Owner__c, Account_Owner_Sales_Region__c,
                  		Account__r.Promotional_Budget__c, Account__r.Promotional_Budget_Used__c, Account__r.Promotional_Budget_Remaining__c, Account_Promotional_Target_ROI__c,
                  		CreatedById, CreatedBy.Name, OwnerId, Owner.Name, Begin_Date__c, End_Date__c, Is_Length_in_Years__c, Length_of_Agreement__c, 
                  		Contact__c, Contact__r.Name, Contact__r.MobilePhone, Contact__r.Email, Activity_Budget__c, Planned_Fee__c, Total_Fee_Paid__c,
                  		Total_PSA_ROI__c, Total_PSA_Actual_ROI__c, Requires_Special_Approval__c, PMI_Actual_Status__c,
                         (SELECT Id, Name, Product_Custom__c, Product_Name__c, Plan_Volume__c, Plan_Volume_Bottles__c, Current_Volume__c, Current_Volume_Bottles__c, Plan_Rebate__c 
                             FROM Promotion_Material_Items__r),
                  		(SELECT Id, Year__c, Month_Name_Abbrev__c, Product_Name__c, Act_Qty__c, Act_Qty_Bottles__c, Promotion_Material_Item__r.Plan_Volume__c, Promotion_Material_Item__r.Plan_Volume_Bottles__c,
                        		Promotion_Material_Item__r.Plan_Rebate__c, Payment_Date__c, Promotion_Material_Item__r.Current_Volume__c, Promotion_Material_Item__r.Current_Volume_Bottles__c,
                         		Approval_Status__c, Rebate_Type__c
                        	FROM PMI_Actuals__r)
                  FROM Promotion_Activity__c 
                  WHERE Id = :pa.Id];
        
        specialApprovalReason = '';
        if (thePSA.Requires_Special_Approval__c) {
            if (thePSA.Account__r.Promotional_Budget__c < thePSA.Total_Fee_Paid__c) {
                specialApprovalReason = Label.Budget_Overrun;
            }
            if (thePSA.Account_Promotional_Target_ROI__c < thePSA.Total_PSA_Actual_ROI__c || thePSA.Total_PSA_ROI__c < thePSA.Total_PSA_Actual_ROI__c) {
                specialApprovalReason += ' and ' + Label.ROI_Threshold_Risk;
            }
        }
        
        actuals = new List<PMI_Actual__c>();
        for(PMI_Actual__c pmia : thePSA.PMI_Actuals__r) {
            if (pmia.Approval_Status__c == 'Submit' && pmia.Rebate_Type__c == 'Volume') {
                actuals.add(pmia);
            }
        }
    }

    public Promotion_Activity__c getThePSA() {
        return thePSA;
    }
    
}