public with sharing class UK_PSA_Generate_DocuSign_Controller {
    public Promotion_Activity__c psa { get; set; }
	public String actionUrl { get; set; }

	public UK_PSA_Generate_DocuSign_Controller(ApexPages.StandardController controller) {
		this.psa = (Promotion_Activity__c)controller.getRecord();
		Id recid = ApexPages.currentPage().getParameters().get('id');
        System.debug('recId: ' + recId);
		if (recid != null) {
			// Get this deals details
			this.psa = [SELECT Id, Name,  FROM Promotion_Activity__c WHERE Id =: recid];
        }        
    }    
}