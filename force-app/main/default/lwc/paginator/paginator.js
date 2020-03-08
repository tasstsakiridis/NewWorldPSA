import { LightningElement, api } from 'lwc';

export default class Paginator extends LightningElement {
    /* The current page number */
    @api pageNumber;

    /* The number of items on a page */
    @api pageSize;

    /* The total number of items in the list */
    @api totalItemCount;

    /* The type of object in the list */
    @api objectType;

    handlePrevious() {
        this.dispatchEvent(new CustomEvent('previous'));
    }

    handleNext() {
        this.dispatchEvent(new CustomEvent('next'));
    }

    get currentPageNumber() {
        return this.totalItemCount === 0 ? 0 : this.pageNumber;
    }

    get isFirstPage() {
        console.log('this.pageNumber', this.pageNumber);
        return this.pageNumber === 1;
    }

    get isLastPage() {
        return this.pageNumber >= this.totalPages;
    }

    get totalPages() {
        console.log('pageSize', this.pageSize);
        console.log('totalItemCount', this.totalItemCount);
        return Math.ceil(this.totalItemCount / this.pageSize);
    }
}