import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';

import { combineLatest, BehaviorSubject, EMPTY, Subject, Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

import { ProductService } from './product.service';
import { ProductCategoryService } from '../product-categories/product-category.service';
import { Product } from './product';
import { ProductCategory } from '../product-categories/product-category';

@Component({
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProductListComponent implements OnInit {
  pageTitle = 'Product List';

  private errorMessageSubject = new Subject<string>();
  errorMessage$ = this.errorMessageSubject.asObservable();

  private categorySelectedSubject = new BehaviorSubject<number>(0);
  categorySelectedAction$ = this.categorySelectedSubject.asObservable();

  products$: Observable<Product[] | [Product[], number]>;
  categories$: Observable<ProductCategory[]>;
  vm$: Observable<{products: Product[] | [Product[], number], categories: ProductCategory[]}>;

 // Whether data is currently loading
      // NOTE: Could also display a loading indicator icon while loading.
      isLoading$ = this.productService.isLoadingAction$;

  constructor(private productService: ProductService,
              private productCategoryService: ProductCategoryService) {

                console.log('constr');
 // Action stream

      // Merge Data stream with Action stream
      // To filter to the selected category
      this.products$ = combineLatest([
        this.productService.productsWithCRUD$,
        this.categorySelectedAction$
      ])
        .pipe(
          map(([products, selectedCategoryId]) =>
            products.filter(product =>
              selectedCategoryId ? product.categoryId === selectedCategoryId : true
            )),
          catchError(err => {
            this.errorMessageSubject.next(err);
            return EMPTY;
          })
        );

      // Categories for drop down list
      this.categories$ = this.productCategoryService.productCategories$
        .pipe(
          catchError(err => {
            this.errorMessageSubject.next(err);
            return EMPTY;
          })
        );

      // Combine the streams for the view
      this.vm$ = combineLatest([
        this.products$,
        this.categories$
      ])
        .pipe(
          map(([products, categories]) =>
            ({ products, categories }))
        );
              }


    ngOnInit() {
console.log('nginit');
this.onRefresh();


    }

  onAdd(): void {
    this.productService.addProduct();
  }

  onDelete(product: Product): void {
    this.productService.deleteProduct(product);
  }

  onRefresh(): void {
    this.productService.refreshData();
  }

  onSelected(categoryId: string): void {
    this.categorySelectedSubject.next(+categoryId);
  }

  onUpdate(product: Product): void {
    this.productService.updateProduct(product);
  }

}
