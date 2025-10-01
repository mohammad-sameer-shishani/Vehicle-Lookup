import { Component, inject, input, OnInit } from '@angular/core';
import { VehicleServices } from '../../core/services/vehicle-services';
import { VehicleType } from '../../types/vehicle';

@Component({
  selector: 'app-dropdown',
  imports: [],
  templateUrl: './dropdown.html',
  styleUrl: './dropdown.css'
})
export class Dropdown implements OnInit {
  title=input<string>('Dropdown');
  protected makes:VehicleType[]=[];
  private vehicleService=inject(VehicleServices);
  

  ngOnInit(): void {
  //  this.getVehicleTypesForMakeId(448);
  }
  
  myFunction(): void {
    const dropdown = document.getElementById("myDropdown");
    if (dropdown) {
      dropdown.classList.toggle("show");
    }
  }
  
  // getVehicleTypesForMakeId(makeId: number): void {
  //   this.vehicleService.getVehicleTypesForMakeId(makeId).subscribe({
  //     next: (res) => {
  //       this.makes=res;
  //     },
  //     error: (err) => {
  //       console.log(err);
  //     }
  //   });
  // }

  filterFunction(): void {
    const input = document.getElementById("myInput") as HTMLInputElement | null;
    const div = document.getElementById("myDropdown");
    if (!input || !div) return;
    
    const filter = input.value.toUpperCase();
    const anchors = div.getElementsByTagName("a");
    
    for (let i = 0; i < anchors.length; i++) {
      const txtValue = anchors[i].textContent || anchors[i].innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        anchors[i].style.display = "";
      } else {
        anchors[i].style.display = "none";
      }
    }
  }
  
}
