({
	doInit : function(component, event, helper) {
        
        var myPageRef = component.get("v.pageReference");
        var recordTypeId = myPageRef.state.recordTypeId;
        var accountId;
        var additionalParams = myPageRef.state.additionalParams.split('&');
        for(var i = 0; i < additionalParams.length; i++) {
            var keyValues = additionalParams[i].split('=');
            if (keyValues[0].indexOf('_lkid') >= 0) {
                accountId = keyValues[1];
                break;
            }
        }
        component.set("v.accountId", accountId);
        component.set("v.recordTypeId", recordTypeId);
		console.log('[container.doInit] page parameters', JSON.parse(JSON.stringify(myPageRef.state)));
        
	}
})