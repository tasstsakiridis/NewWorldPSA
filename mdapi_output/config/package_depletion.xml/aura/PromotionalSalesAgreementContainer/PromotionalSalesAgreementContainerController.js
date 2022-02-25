({
	doInit : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        var psaId = myPageRef.state.c__psaId;
        component.set("v.psaId", psaId);
		console.log('[itemscontainer.doInit] psaId', component.get("v.psaId"));
	}
})