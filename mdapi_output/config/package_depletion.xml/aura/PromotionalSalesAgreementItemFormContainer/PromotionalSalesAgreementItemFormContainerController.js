({
	doInit : function(component, event, helper) {
        var myPageRef = component.get("v.pageReference");
        alert('product id: ' + myPageRef.state.c__productId + ', psaId: ' + myPageRef.state.c__psaId + ', promoid: ' + myPageRef.state.c__promotionId);
        component.set("v.psaId", myPageRef.state.c__psaId);
        component.set("v.productId", myPageRef.state.c__productId);
        component.set("v.psaItemId", myPageRef.state.c__psaItemId);
        component.set("v.promotionId", myPageRef.state.c__promotionId);
		console.log('[itemscontainer.doInit] psaId', component.get("v.psaId"));
	}
})