import { Component, inject, OnInit, signal } from '@angular/core';
import { VehicleType } from '../../types/vehicle';
import { VehicleServices } from '../../core/services/vehicle-services';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class Home implements OnInit {
  private vehicleService=inject(VehicleServices);
  protected types= signal<VehicleType[]>([]);
  
  ngOnInit(): void {
    this.getTypes();

  }

  getTypes(){
    this.vehicleService.getVehicleTypesForMakeId(448).subscribe({
      next: result => {
        this.types.set(result) // Update the signal with the result
        console.log(this.types);
      }
    });
  }
}
