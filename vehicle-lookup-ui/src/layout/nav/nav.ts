import { Component, OnInit, signal } from '@angular/core';
import { RouterLink ,RouterLinkActive} from "@angular/router";
import { themes } from '../theme';

@Component({
  selector: 'app-nav',
  imports: [RouterLink,RouterLinkActive],
  templateUrl: './nav.html',
  styleUrl: './nav.css'
})
export class Nav implements OnInit{
  protected themes=themes;
  protected selecetedTheme = signal<string>(localStorage.getItem('theme') || 'light');

  ngOnInit(){
    document.documentElement.setAttribute('data-theme', this.selecetedTheme());
  }

handleSelectTheme(theme:string){
  this.selecetedTheme.set(theme);
  localStorage.setItem('theme',theme);
  document.documentElement.setAttribute('data-theme', theme);
  const elem = document.activeElement as HTMLElement;
  if (elem) {
    elem.blur();
  }
}


}
