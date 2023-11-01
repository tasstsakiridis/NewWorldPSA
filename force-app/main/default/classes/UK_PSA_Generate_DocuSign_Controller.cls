public with sharing class UK_PSA_Generate_DocuSign_Controller {
    public Promotion_Activity__c psa { get; set; }
	public User currentUser { get; set; }

	public UK_PSA_Generate_DocuSign_Controller(ApexPages.StandardController controller) {
		this.currentUser = [SELECT Id, Name, FirstName, LastName, Email, Manager_FirstName__c, Manager_LastName__c, Manager_Email__c
							  FROM User
							  WHERE Id =:UserInfo.getUserId()];

		this.psa = (Promotion_Activity__c)controller.getRecord();
		Id recid = ApexPages.currentPage().getParameters().get('id');
        System.debug('recId: ' + recId);
		if (recid != null) {
			// Get this deals details
			this.psa = [SELECT Id, Name, Market__c, Market_Name__c, Contact_First_Name__c, Contact_Last_Name__c, Contact_Email__c,
								Finance_Manager_FirstName__c, Finance_Manager_LastName__c, Finance_Manager_Email__c
						  FROM Promotion_Activity__c 
						  WHERE Id =: recid];
        }        
    }    
}