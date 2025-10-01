import { Routes } from '@angular/router';
import { Home } from '../features/home/home';
import { Vehicles } from '../features/vehicles/vehicles';
import { aboutme} from '../features/aboutme/aboutme';

export const routes: Routes = [
    { path: '', component: Home},
    { path : 'vehicles', component: Vehicles },
    { path : 'aboutme', component: aboutme },
    { path : '**', redirectTo: '/' },
];
