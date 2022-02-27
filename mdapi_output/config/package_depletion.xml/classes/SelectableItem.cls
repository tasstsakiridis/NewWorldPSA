public class SelectableItem {
    @AuraEnabled
    public Object item { get; set; }
    
    @AuraEnabled 
    public String id { get; set; }

    @AuraEnabled 
    public String itemId { get; set; }
    
    @AuraEnabled 
    public Boolean isSelected { get; set; }

}
