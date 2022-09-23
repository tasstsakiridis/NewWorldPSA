/**
 * Test Class:  Brazil_PSA_Contract_Controller_Test
 */
public with sharing class Brazil_PSA_Contract_Controller {
    public Promotion_Activity__c thePSA;
    public void setThePSA(Promotion_Activity__c pa) {
        thePSA = [SELECT Id, Name, RecordTypeId, RecordType.Name, Status__c, Market__c, Market_Filter__c, Account__c, Account__r.Name, Account__r.English_Name__c,
                         Total_Listing_Fee__c, Account__r.ShippingStreet, Account__r.ILN_Code__c, Account__r.Tax_Number_PL__c,
                         Number_of_Payments__c, Begin_Date__c, End_Date__c, Is_Length_in_Years__c, Length_of_Agreement__c, CreatedDate,
                         CreatedById, CreatedBy.Name, CreatedBy.MobilePhone, CreatedBy.Email, Contact__c, Contact__r.Name, Contact__r.MobilePhone, Contact__r.Email,
                  		 Activity_Budget__c, Account__r.Owner.Name, Account__r.Owner.Manager.Name, Account__r.ShippingPostalCode, Date_Approved__c,
                           Percentage_Visibility__c, Account__r.Payment_Account__c, Account__r.Payment_Account_Bank__c, Account__r.Payment_Account_Agency__c,
                  	(SELECT Id, Name, Product__c, Product_Name__c, Plan_Volume__c, Plan_Volume_Bottles__c 
                       FROM Promotion_Material_Items__r)
           		    FROM Promotion_Activity__c 
		            WHERE Id =:pa.Id];

        ownerName = thePSA.Account__r.Owner.Name;
        ownerManagerName = thePSA.Account__r.Owner.Manager.Name;
        numberOfPayments = Integer.valueOf(thePSA.Number_of_Payments__c);
        totalBudget = formatCurrencyValue(thePSA.Activity_Budget__c);
        
        promotionMaterialItems = thePSA.Promotion_Material_Items__r;
        percentageVisibility= thePSA.Percentage_Visibility__c;
        
        formattedPercentageVisibility = Num2Words.convert(thePSA.Percentage_Visibility__c, 'pt_BR');
        formattedTotalBudget = Num2Words.convert(thePSA.Activity_Budget__c, 'pt_BR');

        dateApproved = getFormattedDate(thePSA.Date_Approved__c);
        dateCreated = getFormattedDate(thePSA.CreatedDate.date());

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

        formattedFirstPaymentAmount = formatCurrencyValue(firstPaymentAmount);
        translatedFirstPaymentAmount = Num2Words.convert(firstPaymentAmount, 'pt_BR');
        formattedSecondPaymentAmount = formatCurrencyValue(secondPaymentAmount);
        translatedSecondPaymentAmount = Num2Words.convert(secondPaymentAmount, 'pt_BR');
        formattedThirdPaymentAmount = formatCurrencyValue(thirdPaymentAmount);
        translatedThirdPaymentAmount = Num2Words.convert(thirdPaymentAmount, 'pt_BR');
        formattedFourthPaymentAmount = formatCurrencyValue(fourthPaymentAmount);
        translatedFourthPaymentAmount = Num2Words.convert(fourthPaymentAmount, 'pt_BR');
        formattedLengthOfAgreement = NumberToWords.english_number(thePSA.Length_of_Agreement__c);

        ApprovalHistory history = new ApprovalHistory();
        DateTime completedDate;
        String formattedCompletedDate;

        List<ProcessInstance> piList = [SELECT Id, CreatedDate, TargetObjectid, Status, ElapsedTimeInDays, ElapsedTimeInHours, ElapsedTimeInMinutes, 
                                            (SELECT Id, CreatedDate, StepStatus, Comments, Actor.Name, Actor.UserRole.Name, Actor.Title, ElapsedTimeInDays, ElapsedTimeInHours, 
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

                        completedDate = pi.StepsAndWorkItems[i].CreatedDate;
                        formattedCompletedDate = getFormattedDate(pi.StepsAndWorkItems[i].CreatedDate.date());
                        //if (pi.StepsAndWorkItems[i].ElapsedTimeInMinutes != null) {
                        //    completedDate = pi.CreatedDate.addMinutes((Integer)pi.StepsAndWorkItems[i].ElapsedTimeInMinutes);
                        //}

                        System.debug('[PSA_Contract_Controller] status: ' + pi.StepsAndWorkItems[i].StepStatus);
                        ApprovalHistoryItem ahi = new ApprovalHistoryItem(pi.StepsAndWorkItems[i].Actor.Name, pi.StepsAndWorkItems[i].StepStatus, pi.StepsAndWorkItems[i].Comments, pi.StepsAndWorkItems[i].CreatedDate, formattedCompletedDate, pi.StepsAndWorkItems[i].Actor.Title, '');
                        System.debug('[PSA_Contract_Controller] history item: ' + ahi);
                        history.items.add(ahi);
                    }                    
                }
            }
        }        

        psaApprovalHistory = history;
    }
    private String getFormattedDate(Date theDate) {
        String formattedDate = '';

        if (theDate != null) {
            Integer month = theDate.month();
            String monthName = '';
            if (month == 1) {
                monthName = 'Janeiro';
            } else if (month == 2) {
                monthName = 'Fevereiro';
            } else if (month == 3) {
                monthName = 'Março';
            } else if (month == 4) {
                monthName = 'Abril';
            } else if (month == 5) {
                monthName = 'Maio';
            } else if (month == 6) {
                monthName = 'Junho';
            } else if (month == 7) {
                monthName = 'Julho';
            } else if (month == 8) {
                monthName = 'Agosto';
            } else if (month == 9) {
                monthName = 'Setembro';
            } else if (month == 10) {
                monthName = 'Outubro';
            } else if (month == 11) {
                monthName = 'Novembro';
            } else if (month == 12) {
                monthname = 'Dezembro';
            }
            formattedDate = theDate.day() + ' de ' + monthName + ' de ' + theDate.year();
        }

        return formattedDate;
    }
    private String formatCurrencyValue(Decimal value) {
        Long divisor = 10;
        String returnValue = value.format();
        if (Math.mod(value.longValue(), divisor) == 0) {
            returnValue += ',00';
        }
        return returnValue;
    }
    public Promotion_Activity__c getThePSA() {
        return thePSA;
    }

    public List<Promotion_Material_Item__c> promotionMaterialItems { get; set; }
    public String ownerName { get; set; }
    public String ownerManagerName { get; set; }
    public String totalBudget { get; set; }
    public String formattedTotalBudget { get; set; }
    public Decimal totalPlanVolume { get; set; }
    public Integer numberOfPayments { get; set; }
    public Decimal firstPaymentAmount { get; set; }
    public String formattedFirstPaymentAmount { get; set; }
    public String translatedFirstPaymentAmount { get; set; }
    public Decimal secondPaymentAmount { get; set; }
    public String formattedSecondPaymentAmount { get; set; }
    public String translatedSecondPaymentAmount { get; set; }
    public Decimal thirdPaymentAmount { get; set; }
    public String formattedThirdPaymentAmount { get; set; }
    public String translatedThirdPaymentAmount { get; set; }
    public Decimal fourthPaymentAmount { get; set; }
    public String formattedFourthPaymentAmount { get; set; }
    public String translatedFourthPaymentAmount { get; set; }
    public String formattedLengthOfAgreement { get; set; }
    public Decimal percentageVisibility{get; set; }
    public String formattedPercentageVisibility { get; set; }
    public String currencyFormatString { get; set; }
    public ApprovalHistory psaApprovalHistory { get; set; }
    public String dateApproved { get; set; }
    public String dateCreated { get; set; }
    
}