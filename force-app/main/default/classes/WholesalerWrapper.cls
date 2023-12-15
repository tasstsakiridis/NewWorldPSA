/**
 * Test Class:  PromotionalSalesAgreementController_Test
 */
public with sharing class WholesalerWrapper {
    @AuraEnabled 
    public string wholesalerId { get; set; }

    @AuraEnabled 
    public string wholesalerName { get; set; }

    @AuraEnabled 
    public string accountWholesalerId { get; set; }

    @AuraEnabled 
    public string accountWholesalerName { get; set; }
    
    public WholesalerWrapper() {

    }
}