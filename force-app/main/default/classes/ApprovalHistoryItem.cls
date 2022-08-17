/**
 * Test Class:  ApprovalHistoryClass_Test
 */
global class ApprovalHistoryItem {
    @AuraEnabled 
    public String Actor { get; set; }

    @AuraEnabled 
    public String Status { get; set; } 

    @AuraEnabled 
    public String CompletedDate { get; set; }

    @AuraEnabled 
    public DateTime RawCompletedDate { get; set; }

    @AuraEnabled
    public String Comments { get; set; }   

    @AuraEnabled 
    public String ActorRole { get; set; }        

    @AuraEnabled 
    public String StepName { get; set; } 

    public ApprovalHistoryItem() {
        this.Actor = '';
        this.Status = '';
        this.Comments = '';
        this.ActorRole = '';
        this.StepName = System.Label.Submitted;

        DateTime now = DateTime.now();
        this.CompletedDate = now.format('EE, dd MMM YYYY, h:mm a');
        this.RawCompletedDate = now;
    }

    public ApprovalHistoryItem(String actor, String status, String comments, DateTime completedDate) {
        this.Actor = actor;
        this.Status = status;
        this.Comments = comments;
        this.CompletedDate = completedDate.format('EE, dd MMM YYYY, h:mm a');
        this.RawCompletedDate = completedDate;
    }
    public ApprovalHistoryItem(String actor, String status, String comments, DateTime completedDate, String actorRole) {
        this.Actor = actor;
        this.Status = status;
        this.Comments = comments;
        this.CompletedDate = completedDate.format('EE, dd MMM YYYY, h:mm a');
        this.RawCompletedDate = completedDate;
        this.ActorRole = actorRole;
    }
    public ApprovalHistoryItem(String actor, String status, String comments, DateTime completedDate, String actorRole, String stepName) {
        this.Actor = actor;
        this.Status = status;        
        this.Comments = comments;
        this.CompletedDate = completedDate.format('EE, dd MMM YYYY, h:mm a');
        this.RawCompletedDate = completedDate;
        this.StepName = stepName;
    }
    public ApprovalHistoryItem(String actor, String status, String comments, DateTime completedDate, String formattedCompletedDate, String actorRole, String stepName) {
        this.Actor = actor;
        this.Status = status;        
        this.Comments = comments;
        this.CompletedDate = formattedCompletedDate;
        this.RawCompletedDate = completedDate;
        this.StepName = stepName;
    }
}