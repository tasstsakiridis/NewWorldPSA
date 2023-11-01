/**
 * Test Class: UpdatePSATotals_Test
 */
 public with sharing class UpdatePSATotals {
    @InvocableMethod
    public static void UpdateTotals(List<String> activityIds) {

        PromotionalSalesAgreement_Controller.updateActualTotals(activityIds);
    }
}