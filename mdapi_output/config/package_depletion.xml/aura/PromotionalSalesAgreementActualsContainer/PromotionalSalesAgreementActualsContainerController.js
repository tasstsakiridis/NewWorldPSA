({
	doInit : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        component.set("v.psaId", myPageRef.state.c__psaId);
		console.log('[actualscontainer.doInit] psaId', component.get("v.psaId"));
	}
})