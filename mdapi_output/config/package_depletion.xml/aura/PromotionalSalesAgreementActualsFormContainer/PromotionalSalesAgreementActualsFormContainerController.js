({
	doInit : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        component.set("v.psaId", myPageRef.state.c__psaId);
        component.set("v.pmiId", myPageRef.state.c__pmiId);
        component.set("v.pmiaId", myPageRef.state.c__pmiaId);
        component.set("v.promotionId", myPageRef.state.c__promotionId);
		console.log('[actualscontainer.doInit] psaId', component.get("v.psaId"));
	}
})