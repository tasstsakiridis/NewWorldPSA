import { LightningElement, api, wire } from 'lwc';
import { CurrentPageReference, NavigationMixin } from 'lightning/navigation';
import { fireEvent, registerListener, unregisterAllListeners } from 'c/pubsub';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

import CLIENT_FORM_FACTOR from '@salesforce/client/formFactor';

import userId from '@salesforce/user/Id';

import getPSA from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSA';
import getProducts from '@salesforce/apex/PromotionalSalesAgreement_Controller.getProducts';
import getPSAItemDetails from '@salesforce/apex/PromotionalSalesAgreement_Controller.getPSAItemDetails';

import LABEL_BACK from '@salesforce/label/c.Back';
import LABEL_HELP from '@salesforce/label/c.Help';
import LABEL_PRODUCT from '@salesforce/label/c.Product';
import LABEL_PRODUCTS from '@salesforce/label/c.Products';


export default class PromotionsalSalesAgreementItems extends NavigationMixin(LightningElement) {
    labels = {
        back         : { label: LABEL_BACK },
        help         : { label: LABEL_HELP },
        product      : { label: LABEL_PRODUCT, labelPlural: LABEL_PRODUCTS },
        viewSelected : { label: 'view selected' },
        allProducts  : { label: 'all products' }        
    };    
    
    @api psaId;
    @api recordTypeName;

    thePSA; 
    promotionId;
    psaItems = new Map();   
    canSubmitForApproval = false;
    error;
    pageNumber = 1;
    showPSADetailsForm = false;
    showBrandFilter = (CLIENT_FORM_FACTOR === "Large");
    selectedProductId;
    selectedProductName;
    selectedPSAItemId;
    loadProducts = true;

    get isThisTass() {
        return userId == '00530000005n92iAAA';
    }

    get isPhone() {
        return CLIENT_FORM_FACTOR === "Small";
    }
    get productLayoutSize() {
        console.log('[productlayoutsize]');
        if (this.isPhone) {
            return 12;
        } else {
            return this.showPSADetailsForm ? 6 : 9;
        }
    }

    get psaName() {
        return this.thePSA == null ? '' : this.thePSA.Name;
    }
    get psaStatus() {
        return this.thePSA == null ? 'New' : this.thePSA.Status__c;
    }
    get isLocked() {
        if (this.thePSA == null) {
            return false;
        } else {
            return this.thePSA.Status__c === 'Approved' || this.thePSA.Status__c === 'Submitted' || this.thePSA.Status__c == 'Pending Approval' || this.thePSA.Is_Approved__c;
        }
    }
    get isApproved() {
        return this.thePSA != null && this.thePSA.Is_Approved__c;
    }
    get captureVolumeInBottles() {
        return this.thePSA != null && this.thePSA.Market__r.Capture_Volume_in_Bottles__c;
    }
    get calcProductSplit() {
        if (this.thePSA != undefined) {
            console.log('[psaItems] calcProductSplit', this.thePSA.Market__r.Calculate_PSA_Product_Split__c);
        }
        return this.thePSA != null && this.thePSA.Market__r.Calculate_PSA_Product_Split__c;
    }
    get showTotalInvestment() {
        return this.thePSA != null && this.thePSA.Market__r.Calculate_PSA_Product_Split__c == false;
    }
    get totalBudget() {
        return this.thePSA == null || this.thePSA.Activity_Budget__c == undefined ? 0 : parseFloat(this.thePSA.Activity_Budget__c);
    }
    get totalPlannedSpend() {
        return this.thePSA == null || this.thePSA.Total_Planned_Spend__c == undefined ? 0 : parseFloat(this.thePSA.Total_Planned_Spend__c);
    }

    pageRef;
    @wire(CurrentPageReference)
    setCurrentPageReference(currentPageReference) {
        this.pageRef = currentPageReference;
        this.currentPageReference = currentPageReference;
        console.log('[psaitems.setcurrentpagerefernce] pageref', currentPageReference);        
        this.psaId = currentPageReference.state.c__psaId;
        if (this.thePSA != null && this.psaId != this.thePSA.Id) {
            refreshApex(this.wiredAgreement);
        }
        if (currentPageReference.state.c__promotionId) {
            this.promotionId = currentPageReference.state.c__promotionId;
        }
        if (currentPageReference.state.c__productId) {
            this.productId = currentPageReference.state.c__productId;
        }
        if (currentPageReference.state.c__psaItemId) {
            this.psaItemId = currentPageReference.state.c__psaItemId;
        }
        if (currentPageReference.state.c__showPSADetailForm) {
            this.showPSADetailsForm = currentPageReference.state.c__showPSADetailForm;
        }
    }

    wiredAgreement;
    @wire(getPSA, {psaId: '$psaId'})
    wiredGetAgreement(value) {
        this.wiredAgreement = value;
        console.log('[psaItems.getPSA] psaId', this.psaId);
        console.log('[psaItems.getPSA] value', value);
        if (value.error) {
            this.error = value.error;
            this.thePSA = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.thePSA = value.data;
            this.recordTypeName = this.thePSA.RecordType.Name;
            if (this.thePSA.Account__r.RecordType.Name == 'Parent') {
                this.promotionId = this.thePSA.Promotions__r.find(p => p.Account__r.RecordType.Name == 'Parent').Id;
            } else {
                this.promotionId = this.thePSA.Promotions__r[0].Id;
            }
            if (this.thePSA.Promotion_Material_Items__r && this.thePSA.Promotion_Material_Items__r.length > 0) {
                this.psaItems.clear();
                this.thePSA.Promotion_Material_Items__r.forEach(pmi => {
                    this.psaItems.set(pmi.Product_Custom__c, pmi);
                });
                console.log('psaItems', this.psaItems);
                const newList = this.products.records.map(p => {
                    const newItem = {
                        id: p.id,
                        product: p.product,
                        psaItem: {}
                    };
    
                    if (this.psaItems.has(p.id)) {
                        newItem.psaItem = this.psaItems.get(p.id);
                    }
                    return newItem;
                })
                this.products = {
                    pageSize: this.products.pageSize,
                    pageNumber: this.products.pageNumber,
                    records: newList,
                    totalItemCount: this.products.totalItemCount
                };

                console.log('products', this.products);
    
            } else {
                this.psaItems.clear();
                if (this.products != undefined && this.products.records != undefined) {
                    this.products.records.forEach(p => p.psaItem = {});
                }
            }

            if (this.loadProducts) {
                //this.pageNumber = 1;
            } else {
                console.log('[handlesave] products', this.products);
                console.log('[psaItems.handlesavepsa] products', this.products);
    
            }

        }
    };

    brands;
    brandsSelected = '';
    products = {
        records: []
    };
    wiredProducts;
    @wire(getProducts, {pageNumber: '$pageNumber', brandsSelected: '$brandsSelected'})
    wiredGetProducts(value) {
        this.wiredProducts = value;
        console.log('[wiredgetproducts] value', value);
        if (value.error) {
            this.error = value.error;
            this.products = undefined;
        } else if (value.data) {
            this.error = undefined;
            const newList = value.data.records.map(p => {
                const obj = {
                    id: p.Id,
                    product: p,
                    psaItem: {}
                };
                if (this.psaItems.has(p.Id)) {
                    obj.psaItem = this.psaItems.get(p.Id);
                }
                return obj;
            });
            console.log('[psaItems.getProducts] psaItems', this.psaItems);
            console.log('[psaItems.getProducts] newList', newList);
            this.products = {
                pageSize: value.data.pageSize,
                pageNumber: value.data.pageNumber,
                records: newList,
                totalItemCount: value.data.totalItemCount
            };
            console.log('[getProducts] products', this.products);
            if (this.isPhone && this.isThisTass) {
                alert('finished loading products');
            }    
        }
    }

    wiredPSAItem;
    @wire(getPSAItemDetails, { psaItemId: '$psaItemId'})
    wiredGetPSAItem(value) {
        this.wiredPSAItem = value;
        if (value.error) {
            this.error = value.error;
            this.psaItem = undefined;
        } else if (value.data) {
            this.error = undefined;
            this.psaItem = value.data;
            this.products.records.forEach(p => {
                if (p.product.Id === value.data.Product_Custom__c) {
                    console.log('[psaitems.getpsaitemdetails] product found updating psaitem');
                    p.psaItem = value.data; return true;
                }
            });
            this.psaItems.set(value.data.Product_Custom__c, value.data);
        }
    }
    
    get psaItemCount() {
        return this.psaItems ? this.psaItems.length : 0;
    }

    get isUKMarket() {
        return this.thePSA != undefined && this.thePSA.Market__r != undefined && this.thePSA.Market__r.Name == 'United Kingdom';
    }

    /** 
     * Constructor
     */
    connectedCallback() {
        registerListener('brandsSelected', this.handleBrandsSelected, this);

        //this.getAgreement(true);
    }

    disconnectedCallback() {
        unregisterAllListeners(this);
    }
    

    /**
     * Handle local component events
     */
    handleCancelButtonClick(event) {
        console.log('[handleCancelButtonClick]');
        try {
            this.showPSADetailsForm = false;
            this[NavigationMixin.Navigate]({
                type: 'standard__recordPage',
                attributes: {
                    recordId: this.psaId,
                    objectApiName: 'Promotion_Activity__c',
                    actionName: 'view'
                }
            }, true);
        }catch(ex) {
            console.log('[handelCancelButtonClick] exception', ex);
            if (this.isPhone && this.isThisTass) {
                alert('[psaItem.handlecancel] exception', ex);
            }
        }
    }

    handleShowSelectedChange(event) {
        if (event.detail.checked) {
            // fire event to hide all products that aren't on this PSA
        } else {
            // fire event to show all products
        }
    }

    handleProductSelected(event) {
        console.log('[productselected] productid', event.detail.productId, event.detail.psaItemId);
        this.selectedProductId = event.detail.productId;
        this.selectedPSAItemId = event.detail.psaItemId;
        this.selectedProductName = event.detail.productName;


        if (CLIENT_FORM_FACTOR === 'Large') {
            //this.showPSADetailsForm = true;
            this[NavigationMixin.Navigate](this.getUpdatedPageReference({
                c__psaId: this.psaId,
                c__productId: event.detail.productId,
                c__psaItemId: event.detail.psaItemId,
                c__promotionId: this.promotionId,
                c__showPSADetailForm: true
            }), true);
        } else {
            if (this.isThisTass) {
                alert('product selected: ' + event.detail.productId + ', psaitemid: ' + event.detail.psaItemId);
            }
            this[NavigationMixin.Navigate]({
                type: 'standard__component',
                attributes: {
                    componentName: 'c__PromotionalSalesAgreementItemFormContainer'
                },
                state: {
                    c__productId: event.detail.productId,
                    c__psaItemId: event.detail.psaItemId,
                    c__psaId: this.psaId,
                    c__promotionId: this.promotionId
                }
            });
        }
    }

    handleClosePSADetailForm() {
        try {
        console.log('[psaItems.handleClosePSADetailForm]');
        this.showPSADetailsForm = false;
        }catch(ex) {
            console.log('[psaitems.handleClosePSAForm] exception', ex);
        }
    }
    handlePSAUpdated(event) {
        console.log('[psaItems.handlePSAUpdated] event', JSON.parse(JSON.stringify(event)));
        this.wiredAgreement = refreshApex(this.wiredAgreement);
        this.thePSA = this.wiredAgreement.data;
        if (event.action == 'delete') {
            this.showPSADetailsForm = false;
        }
    }
    handleSavePSADetails(event) {
        try {
            console.log('[psaItems.handlesavepsa] detail', JSON.parse(JSON.stringify(event.detail)));
            console.log('[psaItems.handlesavepsa] psaItemId', event.detail.psaItemId);
            console.log('[psaItems.handlesavepsa] volume', event.detail.volume);
            console.log('[psaItems.handlesavepsa] discount', event.detail.discount);
            console.log('[psaItems.handlesavepsa] investment', event.detail.totalInvestment);

            refreshApex(this.wiredAgreement);
            if (event.detail.action == 'delete') {
                this.showPSADetailsForm = false;
            }
            /*
            if (event.detail.psaItemId == undefined) {
                refreshApex(this.wiredAgreement);
            } else {  
                const item = this.psaItems.get(event.detail.productId); 
                const newItem = Object.assign({}, item);
                newItem.Plan_Rebate__c = event.detail.discount;
                newItem.Plan_Volume__c = event.detail.volume;
                newItem.Total_Investment__c = event.detail.totalInvestment;
                console.log('[psaitems.handlesave] newitem', newItem);
                this.psaItems.set(event.detail.productId, newItem);
                this.products.records.forEach(p => {
                    if (p.product.Id === event.detail.productId) {
                        p.psaItem = newItem;
                        console.log('[psaitems.handlesave] product found updating psaitem');
                        return true;
                    }
                });
            }
            */
            //this.getAgreement(false);


        //const psaItemId = event.detail;
        //this.getPSAItem(psaItemId);
        }catch(ex) {
            console.log('[psaItems.handlesavepsa] exception', ex);
        }
        /*
        const newList;
        if (this.brandsSelected && this.brandsSelected.length > 0) {
            newList = this.wiredProducts.data.records.filter(product => brandsSelected.indexOf(product.Brand__c) > -1);
        } else {
            newList = this.wiredProducts.data.records;
        }
        this.products = {
            pageSize: this.wiredProducts.data.pageSize,
            pageNumber: 1,
            records: newList,
            totalItemCount: newList == null ? 0 : newList.length
        };
        */
    }

    /**
     * Helper functions
     */
    getUpdatedPageReference(stateChanges) {
        console.log('[psaitems.getupdatedpagereference] statechanges', stateChanges);
        return Object.assign({}, this.currentPageReference, {
            state: Object.assign({}, this.currentPageReference.state, stateChanges)
        });
    }

    handleBrandsSelected(brandsSelected) {
        console.log('[productItems.handleBrandsSelected] brands', brandsSelected);
        console.log('[productItems.handleBrandsSelected] wiredProducts', this.wiredProducts.data);
        try {
            if (brandsSelected.length == 0) {
                this.brandsSelected = '';
            } else {
                this.brandsSelected = brandsSelected.join(',');
            }
            /*
            this.brandsSelected = brandsSelected;
            let filteredProducts;

            if (brandsSelected.length > 0) {
                filteredProducts = this.wiredProducts.data.records.filter(product => brandsSelected.indexOf(product.Brand__c) > -1);
            } else {
                filteredProducts = this.wiredProducts.data.records;
            }
            
            const newList = filteredProducts.map(p => {
                const obj = {
                    id: p.Id,
                    product: p,
                    psaItem: {}
                };
                if (this.psaItems.has(p.Id)) {
                    obj.psaItem = this.psaItems.get(p.Id);
                }

                return obj;
            });
            this.products = {
                pageSize: this.wiredProducts.data.pageSize,
                pageNumber: 1,
                records: newList,
                totalItemCount: newList == null ? 0 : newList.length
            };
            console.log('[productItems.handleBrandsSelected] products', this.products);
            */
        }catch(ex) {
            console.log('[productItems.handleBrandsSelected] exception', ex);
        }
        
    }

    handleNextPage(event) {
        this.pageNumber++;
    }
    handlePreviousPage(event) {
        this.pageNumber--;
    }
}