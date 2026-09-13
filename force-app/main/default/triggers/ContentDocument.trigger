/**
 * Test Class:  ContentDocumentLink_Test, GenericAttachmentUtility_Test
 */
trigger ContentDocument on ContentDocument (before delete, before insert, before update) {

    Set<Id> SODIds = new Set<Id>();
    Set<Id> promoIds = new Set<Id>();
    Set<Id> activityIds = new Set<Id>();
    Set<Id> sampleOrderIds = new Set<Id>();
    Set<Id> contentDocumentIds = new Set<Id>();
    Set<Id> sealIds = new Set<Id>();
    Set<Id> changeRequestIds = new Set<Id>();
    Set<Id> documentIds = Trigger.oldmap == null ? new Set<Id>() : Trigger.oldmap.keySet();

    List<ContentVersion> versions = [SELECT Id, ContentDocumentId, FirstPublishLocationId FROM ContentVersion WHERE FirstPublishLocationId != null AND ContentDocumentId =:documentIds];
    
    List<GroupMember> groupMembers = [SELECT Id, UserOrGroupId 
                                        FROM GroupMember 
                                        WHERE Group.DeveloperName = 'KOREA_PSA_Attachment_Management' 
                                          AND UserOrGroupId = :UserInfo.getUserId()];
    
    for(ContentVersion cv : versions) {
        try{
            contentDocumentIds.add(cv.ContentDocumentId);
            System.debug('cv.objecttype: ' + cv.FirstPublishLocationId.getSobjectType().getDescribe().getName());
            //Compensating Controls - Levites
            if (Trigger.isDelete) {
                if(cv.FirstPublishLocationId.getSobjectType().getDescribe().getName() == 'SOD__c'){
                    SODIds.add(cv.FirstPublishLocationId);
                }
                
                if(cv.FirstPublishLocationId.getSobjectType().getDescribe().getName() == 'Promotion__c'){
                    promoIds.add(cv.FirstPublishLocationId);
                }
                
                if (cv.FirstPublishLocationId.getSobjectType().getDescribe().getName() == 'Promotion_Activity__c') {
                    activityIds.add(cv.FirstPublishLocationId);
                }
                
                if (cv.FirstPublishLocationId.getSobjectType().getDescribe().getName() == 'SAP_Interfaced_Data__c') {
                    sampleOrderIds.add(cv.FirstPublishLocationId);
                }
                
            }
            if (cv.FirstPublishLocationId.getSObjectType().getDescribe().getName() == 'Seal__c') {
                sealIds.add(cv.FirstPublishLocationId);
            }
            if (cv.FirstPublishLocationId.getSobjectType().getDescribe().getName() == 'Pricing_Change_Request__c') {
                changeRequestIds.add(cv.FirstPublishLocationId);
            }
        }catch(Exception e){
            system.debug('Exception looping through trigger.new: '+e);	
        }		        
    }
    
    if(!SODIds.isEmpty()){
        try{
            List<SOD__c> SODSet = new List<SOD__c>();
            for(SOD__c r:[SELECT Id, Files_Attached__c, (SELECT Id, ContentDocumentId FROM AttachedContentDocuments) FROM SOD__c WHERE Id in:SODIds]){
                if(r.AttachedContentDocuments.isEmpty() || (r.AttachedContentDocuments.size() == 1 && Trigger.oldmap.containsKey(r.AttachedContentDocuments.get(0).ContentDocumentId))){
                    r.Files_Attached__c = false;
                }
                if (!SODSet.contains(r)) {
                	SODSet.add(r);                    
                }
            }
            update SODSet;
            
        }catch(Exception e){
            system.debug('Exception querying for SOD: '+e);			
        }
    }
    
    System.debug('promotions:' +promoIds);
    if (!promoIds.isEmpty()) {
        ContentDocumentTriggerHelper.checkPromotionFiles(promoIds, contentDocumentIds);
        /*
        try {
            List<Promotion__c> promotionsToUpdate = new List<Promotion__c>();
            for(Promotion__c p : [SELECT Id, Image_Attached__c, (SELECT Id, ContentDocumentId FROM AttachedContentDocuments) FROM Promotion__c WHERE Id=:promoIds]) {
                System.debug('p.attachedcontentdocuments: ' + p.AttachedContentDocuments);
                System.debug('Trigger.oldmap' + Trigger.oldMap.keySet());
                if (p.AttachedContentDocuments.isEmpty() || (p.AttachedContentDocuments.size() == 1 && Trigger.oldMap.containsKey(p.AttachedContentDocuments.get(0).ContentDocumentId))) {
                    p.Image_Attached__c = false;

                    if (!promotionsToUpdate.contains(p)) {
                        promotionsToUpdate.add(p);
                    }
                }
            }

            System.debug('promotions to update: ' + promotionsToUpdate);
            if (!promotionsToUpdate.isEmpty()) {
                update promotionsToUpdate;
            }
        }catch(Exception ex) {
            System.debug('Exception trying to update promotions. ' + ex);
        }
         */
    }

    if (!activityIds.isEmpty()) {
        try {
            Set<Promotion_Activity__c> activitiesToUpdate = new Set<Promotion_Activity__c>();
            Map<Id, Promotion_Activity__c> activitiesMap = new Map<Id, Promotion_Activity__c>([SELECT Id, Has_Attachment__c, RecordType.DeveloperName, Status__c,
                                                                                               (SELECT Id, ContentDocumentId FROM AttachedContentDocuments) 
                                                                                              FROM Promotion_Activity__c 
                                                                                             WHERE Id=:activityIds]);
            for(Promotion_Activity__c p : activitiesMap.values()) {
                System.debug('p.attachedcontentdocuments: ' + p.AttachedContentDocuments);
                p.Has_Attachment__c = !p.AttachedContentDocuments.isEmpty();
                p.File_Uploaded__c = !p.AttachedContentDocuments.isEmpty();
                activitiesToUpdate.add(p);
            }
            if (!activitiesToUpdate.isEmpty()) {
                update new List<Promotion_Activity__c>(activitiesToUpdate);
            }
            //if (Trigger.isDelete) {
                for(ContentVersion cv : versions) {
                    if (activitiesMap.containsKey(cv.FirstPublishLocationId)) {
                        Promotion_Activity__c p = activitiesMap.get(cv.FirstPublishLocationId);
                        if (p.RecordType.DeveloperName == 'KR_PSA' && !groupMembers.isEmpty()) {
                            ContentDocument cd = Trigger.oldMap.get(cv.ContentDocumentId);
                            cd.addError('Files cannot be added or deleted for a record with status "approved".');                                        
                        }
                    }
                }             
                
            //}
            
        } catch(Exception ex) {
            System.debug('Exception trying to update promotions. ' + ex);            
        }
    }
    System.debug('# of sampleorderids: ' + sampleOrderIds.size());
    if (!sampleOrderIds.isEmpty()) {
        try {
            Set<SAP_Interfaced_Data__c> sampleordersToUpdate = new Set<SAP_Interfaced_Data__c>();
            for(SAP_Interfaced_Data__c l : [SELECT Id, File_Uploaded__c, (SELECT Id, ContentDocumentId FROM AttachedContentDocuments) FROM SAP_Interfaced_Data__c WHERE ID=:sampleOrderIds]) {
                l.File_Uploaded__c = !l.AttachedContentDocuments.isEmpty();
                sampleOrdersToUpdate.add(l);
            }
            if (!sampleOrdersToUpdate.isEmpty()) {
                update new List<SAP_Interfaced_Data__c>(sampleOrdersToUpdate);
            }
        } catch(Exception ex) {
            System.debug('Exception trying to update Sample Orders. ' + ex);
        }
    }
    
    if (!sealIds.isEmpty()) {
        try {
            Map<Id, Seal__c> seals = new Map<Id, Seal__c>([SELECT Id, Status__c, RecordTypeId 
                                                             FROM Seal__c 
                                                            WHERE Id IN :sealIds 
                                                              AND (Status__c = 'Approved' OR Status__c = 'Completed')
                                                              AND RecordType.Name LIKE 'CHN Seal%']);
            
            for(ContentVersion cv : versions) {
                if (seals.containsKey(cv.FirstPublishLocationId)) {
                    ContentDocument cd = Trigger.oldMap.get(cv.ContentDocumentId);
                    cd.addError('Files cannot be added or deleted for a record with status "approved" or "completed".');                
                }
            }             
        } catch(Exception ex) {
            System.debug('Exception trying to update seals. ' + ex);
        }
    }
    if (!changeRequestIds.isEmpty()) {
        try {
            Map<Id, Pricing_Change_Request__c> pricingChangeRequests = new Map<Id, Pricing_Change_Request__c>([SELECT Id, Approval_Status__c 
                                                                                        	FROM Pricing_Change_Request__c 
                                                                                           WHERE Id IN :changeRequestIds
                                                                                             AND (Approval_Status__c = 'Submitted' OR Approval_Status__c = 'Approved')
                                                                                             AND RecordType.Name = 'Pricing Change Request - GTR']);
            
            for (ContentVersion cv : versions) {
                if (pricingChangeRequests.containsKey(cv.FirstPublishLocationId)) {
                    //Pricing_Change_Request__c pcr = pricingChangeRequests.get(cv.FirstPublishLocationId);
                    ContentDocument cd = Trigger.isInsert ? Trigger.newMap.get(cv.ContentDocumentId) : Trigger.oldMap.get(cv.ContentDocumentId);
                    cd.addError('Files cannot be added, deleted or updates for a record with status "Submited or "Approved"');
                }
            }
        } catch(Exception ex) {
            System.debug('Exception tring to upload attachement for Pricing Change Request. ' + ex);
        }
    }
}