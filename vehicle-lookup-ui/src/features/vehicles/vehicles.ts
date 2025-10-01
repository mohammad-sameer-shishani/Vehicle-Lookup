// vehicles.ts
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  signal,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { catchError, debounceTime, distinctUntilChanged, filter, map, of, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { VehicleServices } from '../../core/services/vehicle-services';
import { VehicleType } from '../../types/vehicle';

interface Make { id: number; name: string; }

@Component({
  selector: 'app-vehicles',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatIconModule,
    MatProgressSpinnerModule,
    NgxMatSelectSearchModule
  ],
  templateUrl: './vehicles.html',
  styleUrls: ['./vehicles.css']
})
export class Vehicles implements OnInit, AfterViewInit, OnDestroy {
  protected title = signal('Makes');

  // Material select ref (for scroll handling)
  @ViewChild(MatSelect, { static: false }) matSelect!: MatSelect;

  // selection + search
  makeIdCtrl = new FormControl<number | null>(null);
  makeSearchCtrl = new FormControl<string>('');
  yearCtrl = new FormControl<number | null>(null);

  // list bound to the dropdown
  makes: Make[] = [];
  makesSignal= signal<Make[]>([]);
   
  // paging state
  private page = 1;
  private readonly pageSize = 10;
  private searchTerm = '';
  loading = false;        // when fetching the first page or search reset
  loadingMore = false;    // when fetching next pages
  endOfList = false;      // true when server says no more data

  
  // vehicle types for the selected make
  vehicleTypes = signal<VehicleType[]>([]);
  vehicleTypesLoading = signal<boolean>(false);
  vehicleTypesError = signal<string | null>(null);

  years = [] as number[];
  private destroy$ = new Subject<void>();
  private vehicleService = inject(VehicleServices);

  ngOnInit(): void {
    // load first page on init
    this.resetAndLoad();

    // server-side search
    this.makeSearchCtrl.valueChanges
      .pipe(debounceTime(1000), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe(term => {
        this.searchTerm = (term ?? '').trim();
        this.resetAndLoad(); // resets to page 1 and fetches with new search term
      });

    // optional: update title when a make is chosen
    this.makeIdCtrl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(id => {
      const m = this.makes.find(x => x.id === id);
      // this.title.set(m ? m.name : 'Makes');
    });

     // --- WHEN A MAKE IS SELECTED, LOAD ITS VEHICLE TYPES ---
    this.makeIdCtrl.valueChanges.pipe(
      // only proceed with real ids
      filter((id): id is number => id != null),
      distinctUntilChanged(),
      tap(() => {
        this.vehicleTypesLoading.set(true);
        this.vehicleTypesError.set(null);
        this.vehicleTypes.set([]);           // clear previous types
      }),
      switchMap(id =>
        this.vehicleService.getVehicleTypesForMakeId(id).pipe(
          // normalize to {vehicleTypeId, vehicleTypeName}[]
          map((list: any[]) => (list ?? []).map(x => ({
            vehicleTypeId: x.vehicleTypeId ?? x.id ?? x.value ?? x.key,
            vehicleTypeName: x.vehicleTypeName ?? x.name ?? x.label ?? x.text
          }) as VehicleType)),
          catchError(err => {
            this.vehicleTypesError.set('Failed to load vehicle types.');
            return of([] as VehicleType[]);
          })
        )
      ),
      takeUntil(this.destroy$)
    ).subscribe(types => {
      this.vehicleTypes.set(types);
      this.vehicleTypesLoading.set(false);
    });
    
    for (let year = 1950; year <= new Date().getFullYear(); year++) {
      this.years.push(year);
    }
  }


  ngAfterViewInit(): void {
    // Hook into panel open to attach scroll listener
    this.matSelect.openedChange
      .pipe(takeUntil(this.destroy$))
      .subscribe(open => {
        if (!open) return;

        // Panel element is the scroll container
        const panel = document.querySelector('.cdk-overlay-pane .mat-mdc-select-panel') as HTMLElement | null;
        if (!panel) return;

        const onScroll = () => {
          if (this.loading || this.loadingMore || this.endOfList) return;
          const nearBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 64;
          if (nearBottom) this.loadNextPage();
        };

        panel.addEventListener('scroll', onScroll);
        // Clean up when panel closes
        const sub = this.matSelect.openedChange.subscribe(o => {
          if (!o) {
            panel.removeEventListener('scroll', onScroll);
            sub.unsubscribe();
          }
        });
      });
  }

  private resetAndLoad() {
    this.page = 1;
    this.endOfList = false;
    this.makes = [];
    this.refreshFromApi(this.makes);
    this.fetchPage(true);
  }

  private loadNextPage() {
    if (this.endOfList) return;
    this.page += 1;
    this.fetchPage(false);
  }

  private fetchPage(isFirstPage: boolean) {
    if (isFirstPage) {
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.vehicleService.getAllMakes(this.page, this.pageSize, this.searchTerm)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: res => {
          const items = (res?.items ?? []).map((x: any) => ({
            id: x.id ?? x.makeId ?? x.value ?? x.key,
            name: x.name ?? x.makeName ?? x.label ?? x.text
          })) as Make[];

          // Append or set
          this.makes = isFirstPage ? items : [...this.makes, ...items];
          this.refreshFromApi(this.makes);
          // If returned less than page size, no more pages
          if (!items.length || items.length < this.pageSize) {
            this.endOfList = true;
          }
        },
        error: () => {
          // On error, stop further loading attempts for this session
          this.endOfList = true;
        },
        complete: () => {
          this.loading = false;
          this.loadingMore = false;
        }
      });
  }

  trackById = (_: number, item: Make) => item.id;
  clearSelection() { this.makeIdCtrl.setValue(null); }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  refreshFromApi(newData: Make[]) {
    this.makesSignal.set(newData);
  }
}
