// vehicles.ts
import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { toSignal } from '@angular/core/rxjs-interop';

import { startWith, Subject } from 'rxjs';

import { VehicleServices } from '../../core/services/vehicle-services';
import type { Car, VehicleType } from '../../types/vehicle';

// minimal make shape
type Make = { id: number; name: string };

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
    NgxMatSelectSearchModule,
  ],
  templateUrl: './vehicles.html',
  styleUrls: ['./vehicles.css'],
})
export class Vehicles implements OnInit, AfterViewInit, OnDestroy {
  // controls
  makeIdCtrl = new FormControl<number | null>(null);
  yearCtrl   = new FormControl<number | null>(null);

  // state (signals)
  readonly title = signal('Find Vehicles');

  // makes + search/paging
  readonly makes        = signal<Make[]>([]);
  readonly makesLoading = signal(false);
  readonly makesError   = signal<string | null>(null);
  readonly makesSearch  = signal<string>(''); // server-side search term

  // results (vehicle types + cars)
  readonly vehicleTypes   = signal<VehicleType[]>([]);
  readonly vehicleLoading = signal(false);
  readonly vehicleError   = signal<string | null>(null);

  readonly cars        = signal<Car[]>([]);
  readonly carsLoading = signal(false);
  readonly carsError   = signal<string | null>(null);

  // years
  readonly minYear = 1950;
  readonly maxYear = new Date().getFullYear();
  readonly years   = signal<number[]>(
    Array.from({ length: (this.maxYear - this.minYear + 1) }, (_, i) => this.maxYear - i)
  );

 // turn form control valueChanges into signals
readonly selectedMakeId = toSignal(
  this.makeIdCtrl.valueChanges.pipe(startWith(this.makeIdCtrl.value)),
  { initialValue: this.makeIdCtrl.value }
);

readonly selectedYear = toSignal(
  this.yearCtrl.valueChanges.pipe(startWith(this.yearCtrl.value)),
  { initialValue: this.yearCtrl.value }
);

// use a computed that depends on signals (so it actually updates)
readonly canSearch = computed(
  () => this.selectedMakeId() != null && this.selectedYear() != null
);
  // paging
  private page = 1;
  private readonly pageSize = 20;
  private endOfMakes = false;

  private readonly api = inject(VehicleServices);
  private readonly destroy$ = new Subject<void>();

  // reference to the make select (for scroll hook)
  @ViewChild('makeSelect', { static: false }) makeSelect!: MatSelect;

  // lifecycle
  ngOnInit(): void {
    this.loadMakes(true); // initial load for makes
  }

  ngAfterViewInit(): void {
    // INF. SCROLL: hook panel scroll, load more when near bottom
    this.makeSelect.openedChange.subscribe(open => {
      if (!open) return;

      const panel = document.querySelector('.cdk-overlay-pane .mat-mdc-select-panel') as HTMLElement | null;
      if (!panel) return;

      const onScroll = () => {
        if (this.makesLoading() || this.endOfMakes) return;
        const nearBottom = panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 64;
        if (nearBottom) this.onLoadMoreMakes();
      };

      panel.addEventListener('scroll', onScroll);

      // clean up when it closes
      const sub = this.makeSelect.openedChange.subscribe(o => {
        if (!o) {
          panel.removeEventListener('scroll', onScroll);
          sub.unsubscribe();
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // UI handlers
  onSearchClick(): void {
    if (!this.canSearch()) return;

    const makeId = this.makeIdCtrl.value as number;
    const year   = this.yearCtrl.value as number;

    // reset
    this.vehicleTypes.set([]);
    this.cars.set([]);
    this.vehicleError.set(null);
    this.carsError.set(null);

    // Vehicle Types (by make)
    this.vehicleLoading.set(true);
    this.api.getVehicleTypesForMakeId(makeId).subscribe({
      next: (list: any[]) => {
        const normalized: VehicleType[] = (list ?? []).map(x => ({
          vehicleTypeId:   x.vehicleTypeId ?? x.id ?? x.value ?? x.key,
          vehicleTypeName: x.vehicleTypeName ?? x.name ?? x.label ?? x.text,
        }));
        this.vehicleTypes.set(normalized);
      },
      error: () => this.vehicleError.set('Failed to load vehicle types.'),
      complete: () => this.vehicleLoading.set(false),
    });

   // Cars / Models (by make + year)
this.carsLoading.set(true);
this.api.getModelsForMakeIdYear(makeId, year).subscribe({
  next: (rows: any[]) => {
    // Normalize to your Car type: { make_ID, make_Name, model_ID, model_Name }
    const normalized: Car[] = (rows ?? []).map((x: any) => ({
      make_ID:    x.make_ID    ?? x.Make_ID    ?? x.makeId    ?? x.MakeId    ?? x.make_id    ?? null,
      make_Name:  x.make_Name  ?? x.Make_Name  ?? x.makeName  ?? x.MakeName  ?? x.make_name  ?? '',
      model_ID:   x.model_ID   ?? x.Model_ID   ?? x.modelId   ?? x.ModelId   ?? x.model_id   ?? null,
      model_Name: x.model_Name ?? x.Model_Name ?? x.modelName ?? x.ModelName ?? x.model_name ?? '',
    }));
    this.cars.set(normalized);
  },
  error: () => this.carsError.set('Failed to load models.'),
  complete: () => this.carsLoading.set(false),
});

  }

  onClearSelection(): void {
    this.makeIdCtrl.setValue(null);
    this.yearCtrl.setValue(null);
    this.vehicleTypes.set([]);
    this.cars.set([]);
    this.vehicleError.set(null);
    this.carsError.set(null);
  }

  onSearchMakes(): void {
    this.loadMakes(true);
  }

  onLoadMoreMakes(): void {
    if (this.endOfMakes || this.makesLoading()) return;
    this.page += 1;
    this.loadMakes(false);
  }

  // data loaders
  private loadMakes(reset: boolean): void {
    if (reset) {
      this.page = 1;
      this.endOfMakes = false;
      this.makes.set([]);
      this.makesError.set(null);
    }
    if (this.endOfMakes) return;

    this.makesLoading.set(true);
    this.api.getAllMakes(this.page, this.pageSize, this.makesSearch()).subscribe({
      next: (res: any) => {
        const items: Make[] = (res?.items ?? []).map((x: any) => ({
          id:   x.id ?? x.makeId ?? x.value ?? x.key,
          name: x.name ?? x.makeName ?? x.label ?? x.text,
        }));
        this.makes.set(reset ? items : [...this.makes(), ...items]);
        if (!items.length || items.length < this.pageSize) this.endOfMakes = true;
      },
      error: () => {
        this.makesError.set('Failed to load makes.');
        this.endOfMakes = true;
      },
      complete: () => this.makesLoading.set(false),
    });
  }

  // trackBys
  trackByMake = (_: number, m: Make) => m.id;
  trackByYear = (_: number, y: number) => y;
  trackByVehicleType = (_: number, v: VehicleType) => v.vehicleTypeId;
  trackByCar = (_: number, c: Car) => c.model_ID;
}
