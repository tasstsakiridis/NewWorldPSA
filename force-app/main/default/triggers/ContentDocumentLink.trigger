/**
 * Test Class:  ContentDocumentLink_Test, GenericAttachmentUtility_Test
 */
trigger ContentDocumentLink on ContentDocumentLink (after delete, after insert, after update) {
    String kpPromotion = Promotion__c.SObjectType.getDescribe().getKeyPrefix();
    System.debug('[ContentDocumentLink trigger]');
    //Compensating Controls - Levites
    Set<Id> SODIds = new Set<Id>();
    Set<Id> promoIds = new Set<Id>();
    Set<Id> activityIds = new Set<Id>();
    Set<Id> documentIds = new Set<Id>();
    Set<Id> sampleOrderIds = new Set<Id>();
    Set<Id> keyTaskIds = new Set<Id>();//Added by Bernardo on June 22
    Set<Id> sealIds = new Set<Id>();
    Set<Id> changeRequestIds = new Set<Id>();
    Set<String> imageTypes = new Set<String>{'png','jpg','jpeg','gif','tif'};
    Set<String> documentTypes = new Set<String>{'doc', 'docx', 'pdf', 'xls', 'xlsx', 'ppt', 'pptx'};


    String fileType = '';
    String parentId = '';
    
    List<GroupMember> groupMembers = [SELECT Id, UserOrGroupId 
                                        FROM GroupMember 
                                        WHERE Group.DeveloperName = 'KOREA_PSA_Attachment_Management' 
                                          AND UserOrGroupId = :UserInfo.getUserId()];
    
       
	if(!Trigger.isDelete){
		for(ContentDocumentLink a :Trigger.new){			
			try{				
                //Compensating Controls - Levites
                if(a.LinkedEntityId.getSobjectType().getDescribe().getName() == 'SOD__c'){
					SODIds.add(a.LinkedEntityId);
				}
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Promotion__c') {
                    promoIds.add(a.LinkedEntityId);
                    documentIds.add(a.ContentDocumentId);
                    
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Promotion_Activity__c') {
                    activityIds.add(a.LinkedEntityId);
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'SAP_Interfaced_Data__c') {
                    sampleOrderIds.add(a.LinkedEntityId);
                }
                if(a.LinkedEntityId.getSobjectType() == Key_Task__c.SobjectType){//Added by Bernardo on June 22
                    keyTaskIds.add(a.LinkedEntityId);
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Seal__c') {
                    sealIds.add(a.LinkedEntityId);
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Pricing_Change_Request__c') {
                    changeRequestIds.add(a.LinkedEntityId);
                }
			}catch(Exception e){
				system.debug('Exception looping through trigger.new: '+e);	
			}		
		}	
	}else{
		for(ContentDocumentLink a:Trigger.old){
			try{
                System.debug('linkedType: ' + a.LinkedEntityId.getSobjectType().getDescribe().getName());
                System.debug('id: ' + a.LinkedEntityId);
                System.debug('document.filetype: ' + a.ContentDocument.FileType);
                  
                //Compensating Controls - Levites
                if(a.LinkedEntityId.getSobjectType().getDescribe().getName() == 'SOD__c'){
					SODIds.add(a.LinkedEntityId);
				}
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Promotion__c') {
                    promoIds.add(a.LinkedEntityId);
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Promotion_Activity__c') {
                    activityIds.add(a.LinkedEntityId);
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'SAP_Interfaced_Data__c') {
                    sampleOrderIds.add(a.LinkedEntityId);
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Seal__c') {
                    sealIds.add(a.LinkedEntityId);
                }
                if (a.LinkedEntityId.getSObjectType().getDescribe().getName() == 'Pricing_Change_Request__c') {
                    changeRequestIds.add(a.LinkedEntityId);
                }
                
			}catch(Exception e){
				system.debug('Exception looping through trigger.old: '+e);	
			}
		}
	}
        
    if(!SODIds.isEmpty()){
        try{
            set<SOD__c> SODSet = new set<SOD__c>();
            for(SOD__c r:[SELECT Id, Files_Attached__c, (SELECT Id FROM AttachedContentDocuments) FROM SOD__c WHERE Id in:SODIds]){
                if(!r.AttachedContentDocuments.isEmpty()){
                    r.Files_Attached__c = true;
                    system.debug('In the True Statement');	
                }else{
                    r.Files_Attached__c = false;
                    system.debug('In the False Statement');	
                }
                SODSet.add(r);
            }
            list<SOD__c> SODToUpdate = new list<SOD__c>();
            SODToUpdate.addAll(SODSet);
            update SODToUpdate;
            
        }catch(Exception e){
            system.debug('Exception querying for SOD: '+e);			
        }
    }
    if (!promoIds.isEmpty()) {
        ContentDocumentTriggerHelper.checkPromotionFiles(promoIds);
        /*
        try {
            List<Promotion__c> promotions = [SELECT Id, Image_Attached__c, Document_Attached__c, (SELECT Id, ContentDocumentId, FileType FROM AttachedContentDocuments) FROM Promotion__c WHERE Id =:promoIds];
            List<Promotion__c> promotionsToUpdate = new List<Promotion__c>();
            Set<Id> linkedIds = new Set<Id>();
            for(Promotion__c p: promotions) {
                System.debug('has attached documents: ' + p.AttachedContentDocuments.isEmpty());
                if (p.AttachedContentDocuments.isEmpty()) {
                    p.Image_Attached__c = false;
                    p.Document_Attached__c = false;
                    promotionsToUpdate.add(p);
                } else {
                    for(Integer i = 0; i < p.AttachedContentDocuments.size();i++) {
                        System.debug('document: ' + p.AttachedContentDocuments.get(i).ContentDocumentId + ' fileType: ' + p.AttachedContentDocuments.get(i).FileType);
                        if (imageTypes.contains(p.AttachedContentDocuments.get(i).FileType.toLowerCase())) {
                            if (!p.Image_Attached__c) {
                                p.Image_Attached__c = true;
                                promotionsToUpdate.add(p);
                            }
                        }
                        else if(documentTypes.contains(p.AttachedContentDocuments.get(i).FileType.toLowerCase())){
                            if (!p.Document_Attached__c) {
                                p.Document_Attached__c = true;
                                promotionsToUpdate.add(p);
                            }
                        }
                    }
                }
            }
            System.debug('promotions to update: ' + promotionsToUpdate);
            
            if (!promotionsToUpdate.isEmpty()) {
                update promotionsToUpdate;
            }
        } catch(Exception ex) {
            System.debug('Exception updating Promotions Image Attached: ' + ex);
        }
         */
    }
    if (!activityIds.isEmpty()) {
        try {
            Set<Promotion_Activity__c> activitiesToUpdate = new Set<Promotion_Activity__c>();
            Map<Id, Promotion_Activity__c> activitiesMap = new Map<Id, Promotion_Activity__c>([SELECT Id, Has_Attachment__c, RecordType.DeveloperName, Market__r.Name, Status__c,
                                                                                                  (SELECT Id, ContentDocumentId FROM AttachedContentDocuments) 
                                                                                                FROM Promotion_Activity__c 
                                                                                               WHERE Id=:activityIds]);
            for(Promotion_Activity__c p : activitiesMap.values()) {
                System.debug('p.attachedcontentdocuments: ' + p.AttachedContentDocuments);
                p.Has_Attachment__c = !p.AttachedContentDocuments.isEmpty();
                
                activitiesToUpdate.add(p);
            }
            if (!activitiesToUpdate.isEmpty()) {
                update new List<Promotion_Activity__c>(activitiesToUpdate);
            }   
            
            System.debug('[contentDocumentLink.trigger] after update activities');
            List<ContentDocumentLink> l = Trigger.isInsert ? Trigger.new : Trigger.old;
            for (ContentDocumentLink cdl : l) {
                System.debug('[contentDocumentLink.trigger] processing activity: ' + cdl.LinkedEntityId);
                if (activitiesMap.containsKey(cdl.LinkedEntityId)) {
                    Promotion_Activity__c p = activitiesMap.get(cdl.LinkedEntityId);
                    System.debug('[contentDocumentLink.trigger] activity.recordtype: ' + p.RecordType.DeveloperName + ', status: ' + p.Status__c);
                    if (p.RecordType.DeveloperName == 'KR_PSA' && !groupMembers.isEmpty()) {
                    	cdl.addError('Files cannot be added, deleted or updates for a record with status of "Approved"');                        
                    }
                }
            }
            
        }catch(Exception ex) {
     		System.debug('Exception updating Promotion Activities Has Attachment: ' + ex);       
        }   
    }
    if (!sampleOrderIds.isEmpty()) {
        try {
            Set<SAP_Interfaced_Data__c> sampleOrdersToUpdate = new Set<SAP_Interfaced_Data__c>();
            for(SAP_Interfaced_Data__c p : [SELECT Id, Has_Attachment__c, File_Uploaded__c, (SELECT Id, ContentDocumentId FROM AttachedContentDocuments) FROM SAP_Interfaced_Data__c WHERE Id=:sampleOrderIds]) {
                System.debug('p.attachedcontentdocuments: ' + p.AttachedContentDocuments);
                p.Has_Attachment__c = !p.AttachedContentDocuments.isEmpty();
                p.File_Uploaded__c = !p.AttachedContentDocuments.isEmpty();
                sampleOrdersToUpdate.add(p);
            }
            if (!sampleOrdersToUpdate.isEmpty()) {
                update new List<SAP_Interfaced_Data__c>(sampleOrdersToUpdate);
            }
        }catch(Exception ex) {
     		System.debug('Exception updating Sample Orders Has Attachment: ' + ex);
        }
    }

    if(!keyTaskIds.isEmpty()){//Added by Bernardo on June 22
        try{
            List<Key_Task__c> keyTaskList = [Select Id, Image_Attached__c, (SELECT Id, ContentDocumentId, FileType FROM AttachedContentDocuments) From Key_Task__c Where Id IN : keyTaskIds];
            List<Key_Task__c> keyTasksToUpdate = new List<Key_Task__c>();
            Set<Id> linkedKeyTaskIds = new Set<Id>();
            for(Key_Task__c kt: keyTaskList) {
                if (kt.AttachedContentDocuments.isEmpty()) {
                    kt.Image_Attached__c = false;
                    keyTasksToUpdate.add(kt);
                }
                else{
                    for(Integer i = 0; i < kt.AttachedContentDocuments.size(); i++) {
                        if (imageTypes.contains(kt.AttachedContentDocuments.get(i).FileType.toLowerCase())) {
                            if (!kt.Image_Attached__c) {
                                kt.Image_Attached__c = true;
                                keyTasksToUpdate.add(kt);
                            }
                        }
                    }
                }
            }

            if (!keyTasksToUpdate.isEmpty()) {
                update keyTasksToUpdate;
            }
        }
        catch(Exception ex){
            System.debug('Exception querying/updating for Key Task Image Attache: '+ ex);
        }
    }
    
    if (!sealIds.isEmpty()) {
        try {
            Map<Id, Seal__c> seals = new Map<Id, Seal__c>([SELECT Id, Status__c, RecordTypeId 
                                                             FROM Seal__c 
                                                            WHERE Id IN :sealIds 
                                                              AND (Status__c = 'Approved' OR Status__c = 'Completed')
                                                              AND RecordType.Name LIKE 'CHN Seal%']);
            
            List<ContentDocumentLink> l = Trigger.isInsert ? Trigger.new : Trigger.old;
            for(ContentDocumentLink cdl : l) {
                if (seals.containsKey(cdl.LinkedEntityId)) {
                    cdl.addError('Files cannot be added or deleted for a record with status "approved" or "completed".');                
                }
            } 
        } catch(Exception ex) {
            System.debug('Exception adding/deleting document from Seal. ' + ex);
        }
    }
    
    if (!changeRequestIds.isEmpty()) {
        try {
            Map<Id, Pricing_Change_Request__c> pricingChangeRequests = new Map<Id, Pricing_Change_Request__c>([SELECT Id, Approval_Status__c 
                                                                                        	FROM Pricing_Change_Request__c 
                                                                                           WHERE Id IN :changeRequestIds
                                                                                             AND (Approval_Status__c = 'Submitted' OR Approval_Status__c = 'Approved')
                                                                                             AND RecordType.Name = 'Pricing Change Request - GTR']);
            
            List<ContentDocumentLink> l = Trigger.isInsert ? Trigger.new : Trigger.old;
            for (ContentDocumentLink cdl : l) {
                if (pricingChangeRequests.containsKey(cdl.LinkedEntityId)) {
                    cdl.addError('Files cannot be added, deleted or updates for a record with status "Submited or "Approved"');
                }
            }
        } catch(Exception ex) {
            System.debug('Exception tring to upload attachement for Pricing Change Request. ' + ex);
        }
    }
    
}