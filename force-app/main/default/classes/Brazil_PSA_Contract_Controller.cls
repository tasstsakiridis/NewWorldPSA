public with sharing class Brazil_PSA_Contract_Controller {
    public Promotion_Activity__c thePSA;
    public void setThePSA(Promotion_Activity__c pa) {
        thePSA = [SELECT Id, Name, RecordTypeId, RecordType.Name, Status__c, Market__c, Market_Filter__c, Account__c, Account__r.Name, Account__r.English_Name__c,
                         Total_Listing_Fee__c, Account__r.ShippingStreet, Account__r.ILN_Code__c, Account__r.Tax_Number_PL__c,
                         Number_of_Payments__c, Begin_Date__c, End_Date__c, Is_Length_in_Years__c, Length_of_Agreement__c,
                         CreatedById, CreatedBy.Name, CreatedBy.MobilePhone, CreatedBy.Email, Contact__c, Contact__r.Name, Contact__r.MobilePhone, Contact__r.Email,
                  		 Activity_Budget__c, Account__r.Owner.Name, Account__r.Owner.Manager.Name, Account__r.ShippingPostalCode,
                  	(SELECT Id, Name, Product__c, Product_Name__c, Plan_Volume__c, Plan_Volume_Bottles__c
                       FROM Promotion_Material_Items__r)
           		    FROM Promotion_Activity__c 
		            WHERE Id =:pa.Id];

        ownerName = thePSA.Account__r.Owner.Name;
        ownerManagerName = thePSA.Account__r.Owner.Manager.Name;
        numberOfPayments = Integer.valueOf(thePSA.Number_of_Payments__c);
        totalBudget = thePSA.Activity_Budget__c;
        promotionMaterialItems = thePSA.Promotion_Material_Items__r;
        formattedTotalBudget = NumberToWords.english_number(thePSA.Activity_Budget__c);
        System.debug('formatted total listing fee: ' + formattedTotalBudget);

        firstPaymentAmount = thePSA.Activity_Budget__c;
        secondPaymentAmount = 0;
        thirdPaymentAmount = 0;
        fourthPaymentAmount = 0;
        if (numberOfPayments == 2) {
            firstPaymentAmount = thePSA.Activity_Budget__c * 0.6;
            secondPaymentAmount = thePSA.Activity_Budget__c - firstPaymentAmount;
        } else if (numberOfPayments == 3) {
            firstPaymentAmount = thePSA.Activity_Budget__c * 0.5;
            secondPaymentAmount = (thePSA.Activity_Budget__c - firstPaymentAmount) * 0.3;
            thirdPaymentAmount = thePSA.Activity_Budget__c - firstPaymentAmount - secondPaymentAmount;
        } else if (numberOfPayments == 4) {
            firstPaymentAmount = thePSA.Activity_Budget__c * 0.4;
            secondPaymentAmount = (thePSA.Activity_Budget__c - firstPaymentAmount) * 0.4;
            thirdPaymentAmount = (thePSA.Activity_Budget__c - firstPaymentAmount - secondPaymentAmount) * 0.2;
            fourthPaymentAmount = thePSA.Activity_Budget__c - firstPaymentAmount - secondPaymentAmount - thirdPaymentAmount;
        }

        formattedFirstPaymentAmount = NumberToWords.english_number(firstPaymentAmount);
        formattedSecondPaymentAmount = NumberToWords.english_number(secondPaymentAmount);
        formattedThirdPaymentAmount = NumberToWords.english_number(thirdPaymentAmount);
        formattedFourthPaymentAmount = NumberToWords.english_number(fourthPaymentAmount);

        formattedLengthOfAgreement = NumberToWords.english_number(thePSA.Length_of_Agreement__c);

        ApprovalHistory history = new ApprovalHistory();
        DateTime completedDate;

        List<ProcessInstance> piList = [SELECT Id, CreatedDate, TargetObjectid, Status, ElapsedTimeInDays, ElapsedTimeInHours, ElapsedTimeInMinutes, 
                                            (SELECT Id, CreatedDate, StepStatus, Comments, Actor.Name, Actor.UserRole.Name, ElapsedTimeInDays, ElapsedTimeInHours, 
                                                    ElapsedTimeInMinutes, IsPending 
                                                FROM StepsAndWorkItems 
                                            ORDER BY ProcessNodeId) 
                                        FROM ProcessInstance 
                                        WHERE TargetObjectId =:thePSA.Id 
                                    ORDER BY CreatedDate];      
        if (piList != null && piList.size() > 0) {
            history.CreatedDate = piList.get(0).CreatedDate.format('EE, dd MMM YYYY, h:mm a');
            for (ProcessInstance pi : piList) {
                if (pi.StepsAndWorkItems != null) {
                    System.debug('# of work items: ' + pi.StepsAndWorkItems.size());
                }
                if (pi.StepsAndWorkItems != null && pi.StepsAndWorkItems.size() > 0) {                        
                    for(Integer i = 0; i < pi.StepsAndWorkitems.size(); i++) {
                        System.debug('actor: ' + pi.StepsAndWorkItems[i].Actor.Name + ', status: ' + pi.StepsAndWorkItems[i].StepStatus);

                        completedDate = pi.CreatedDate;
                        if (pi.StepsAndWorkItems[i].ElapsedTimeInMinutes != null) {
                            completedDate = pi.CreatedDate.addMinutes((Integer)pi.StepsAndWorkItems[i].ElapsedTimeInMinutes);
                        }

                        history.items.add(new ApprovalHistoryItem(pi.StepsAndWorkItems[i].Actor.Name, pi.StepsAndWorkItems[i].StepStatus, pi.StepsAndWorkItems[i].Comments, completedDate, pi.StepsAndWorkItems[i].Actor.UserRole.Name));
                    }                    
                }
            }
        }        

        psaApprovalHistory = history;
    }
    public Promotion_Activity__c getThePSA() {
        return thePSA;
    }

    public List<Promotion_Material_Item__c> promotionMaterialItems { get; set; }
    public String ownerName { get; set; }
    public String ownerManagerName { get; set; }
    public Decimal totalBudget { get; set; }
    public String formattedTotalBudget { get; set; }
    public Decimal totalPlanVolume { get; set; }
    public Integer numberOfPayments { get; set; }
    public Decimal firstPaymentAmount { get; set; }
    public String formattedFirstPaymentAmount { get; set; }
    public Decimal secondPaymentAmount { get; set; }
    public String formattedSecondPaymentAmount { get; set; }
    public Decimal thirdPaymentAmount { get; set; }
    public String formattedThirdPaymentAmount { get; set; }
    public Decimal fourthPaymentAmount { get; set; }
    public String formattedFourthPaymentAmount { get; set; }
    public String formattedLengthOfAgreement { get; set; }
    public ApprovalHistory psaApprovalHistory { get; set; }
    
}