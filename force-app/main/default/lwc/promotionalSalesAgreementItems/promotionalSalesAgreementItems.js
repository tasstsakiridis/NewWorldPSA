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

import CANCEL_LABEL from '@salesforce/label/c.Cancel';
import CHANGE_LABEL from '@salesforce/label/c.Change';
import SAVE_AND_CLOSE_LABEL from '@salesforce/label/c.Save_and_Close';
import SAVE_LABEL from '@salesforce/label/c.Save';
import SKIP_LABEL from '@salesforce/label/c.Skip';
import RECORD_TYPE_LABEL from '@salesforce/label/c.RecordType';
import DURATION_LABEL from '@salesforce/label/c.Duration';
import YES_LABEL from '@salesforce/label/c.Yes';
import NO_LABEL from '@salesforce/label/c.No';
import ITEMS_LABEL from '@salesforce/label/c.Items';
import CLONE_LABEL from '@salesforce/label/c.Clone';
import HELP_LABEL from '@salesforce/label/c.help';

export default class PromotionsalSalesAgreementItems extends NavigationMixin(LightningElement) {
    labels = {
        cancel       : { label: CANCEL_LABEL },
        change       : { label: CHANGE_LABEL, labelLowercase: CHANGE_LABEL.toLowerCase() },
        save         : { label: SAVE_LABEL },
        recordType   : { label: RECORD_TYPE_LABEL },
        yes          : { label: YES_LABEL },
        no           : { label: NO_LABEL },
        help         : { label: HELP_LABEL },
        selectAll    : { label: 'Select All' },
        deSelectAll  : { label: 'DeSelect All' },
        search       : { label: 'Search' },
        searchBy     : { label: 'Search by %0' },
        product      : { label: 'Product', labelPlural: 'Products' },
        viewSelected : { label: 'view selected' },
        allProducts  : { label: 'all products' }        
    };    
    
    @api psaId;

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

    @wire(CurrentPageReference) pageRef;

    //wiredAgreement;
    //@wire(getPSA, {psaId: '$psaId'})
    //wiredGetAgreement(value) {
    //    this.wiredAgreement = value;
    getAgreement(loadProducts) {
        console.log('[psaItems.getPSA] psaId', this.psaId);
        getPSA({psaId: this.psaId})
            .then(record => {
                console.log('[psaItems.getPSA] getpsa', record);
                this.error = undefined;
                this.thePSA = record;
                this.promotionId = this.thePSA.Promotions__r[0].Id;
                if (this.thePSA.Promotion_Material_Items__r && this.thePSA.Promotion_Material_Items__r.length > 0) {
                    this.psaItems.clear();
                    this.thePSA.Promotion_Material_Items__r.forEach(pmi => {
                        this.psaItems.set(pmi.Product_Custom__c, pmi);
                    });
                    console.log('psaItems', this.psaItems);
                    console.log('products', this.products);
        
                }

                if (loadProducts) {
                    this.getProductList();
                } else {
                    console.log('[handlesave] products', this.products);
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
                    console.log('[psaItems.handlesavepsa] products', this.products);
        
                }

        
            })
            .catch(error => {
                this.error = error;
                this.thePSA = undefined;    
            });
    };

    brands;
    products = {
        records: []
    };
    wiredProducts;
    getProductList() {
        console.log('[getProductList]');
        try {
            if (this.isThisTass && this.isPhone) {
                alert('loading products');
            }
        getProducts({pageNumber: this.pageNumber}) 
            .then(result => {
                console.log('[getProducts] result', result);
                const newList = result.records.map(p => {
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
                    pageSize: result.pageSize,
                    pageNumber: result.pageNumber,
                    records: newList,
                    totalItemCount: result.totalItemCount
                };
                this.wiredProducts = this.products;
                console.log('[getProducts] products', this.products);
                if (this.isPhone && this.isThisTass) {
                    alert('finished loading products');
                }
            })
            .catch(error => {
                this.error = error;
                this.products = undefined;
            });
            
        }catch(ex) {
            console.log('[getproducts] exception', ex);
        }
    }

    getPSAItem(psaItemId) {
        getPSAItemDetails({psaItemId: psaItemId})
            .then(result => {
                try {
                    console.log('[psaitems.getpsaitemdetails] psaitem', result);
                    console.log('[psaItems.getpsaitemdetails] wiredproducts', this.wiredProducts);
                    this.wiredProducts.records.forEach(p => {
                        if (p.product.Id === result.Product_Custom__c) {
                            p.psaItem = result; return true;
                        }
                    });
                    this.products.records.forEach(p => {
                        if (p.product.Id === result.Product_Custom__c) {
                            console.log('[psaitems.getpsaitemdetails] product found updating psaitem');
                            p.psaItem = result; return true;
                        }
                    });
                    this.psaItems.set(result.Product_Custom__c, result);
                    console.log('[psaItems.getpsaitemdetails] products', this.products);
                    console.log('[psaItems.getpsaitemdetails] psaItems', this.psaItems);
                }catch(ex) {
                    console.log('[psaitems.getpsaitemdetails] exception', ex);
                }
            })
            .catch(error => {
                this.error = error;
                console.log('[psaitems.getpsaitemDetails] error', error);
                /*
                this.dispatchEvent(
                    new ShowToastEvent({
                        title: 'Error getting details of updated Promotional Sales Agreement Item',
                        message: error.body.message,
                        variant: 'error'
                    }),
                );
                */
            });
    }
    
    get psaItemCount() {
        return this.psaItems ? this.psaItems.length : 0;
    }

    /** 
     * Constructor
     */
    connectedCallback() {
        registerListener('brandsSelected', this.handleBrandsSelected, this);

        this.getAgreement(true);
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
            this.showPSADetailsForm = true;
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
    handleSavePSADetails(event) {
        try {
            console.log('[psaItems.handlesavepsa] volume', event.detail.volume);
            console.log('[psaItems.handlesavepsa] discount', event.detail.discount);
            console.log('[psaItems.handlesavepsa] investment', event.detail.totalInvestment);
            /*
            this.wiredAgreement = refreshApex(this.wiredAgreement);
            this.thePSA = this.wiredAgreement.data;
            if (this.thePSA.Promotion_Material_Items__r && this.thePSA.Promotion_Material_Items__r.length > 0) {
                this.psaItems.clear();
                this.thePSA.Promotion_Material_Items__r.forEach(pmi => {
                    this.psaItems.set(pmi.Product_Custom__c, pmi);
                });
                console.log('psaItems', this.psaItems);
            }
            */
            this.getAgreement(false);


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
    handleBrandsSelected(brandsSelected) {
        console.log('[productItems.handleBrandsSelected] brands', brandsSelected);
        console.log('[productItems.handleBrandsSelected] wiredProducts', this.wiredProducts.data);
        try {
            this.brandsSelected = brandsSelected;
            let newList;
            if (brandsSelected.length > 0) {
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
            console.log('[productItems.handleBrandsSelected] products', this.products);
        }catch(ex) {
            console.log('[productItems.handleBrandsSelected] exception', ex);
        }
    }
}