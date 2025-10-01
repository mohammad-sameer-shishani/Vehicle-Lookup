import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { Vehicles } from '../features/vehicles/vehicles';

export const routes: Routes = [
    { path: '', component: Home},
    { path : 'vehicles', component: Vehicles },
    // { path : '**', redirectTo: '/' },
];
