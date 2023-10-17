import { Component } from '@angular/core';

@Component({
  selector: 'app-sidenav-buttons',
  templateUrl: './sidenav-buttons.component.html',
  styleUrls: ['./sidenav-buttons.component.css'],
})
export class SidenavButtonsComponent {
  Options: string[] = [
    'Implementation Levels',
    'Matrix',
    'Mappings',
    // 'Usage',
    // 'Teams',
    // 'About Us',
  ];
  Icons: string[] = [
    'pie_chart',
    'table_chart',
    'timeline',
    // 'description',
    // 'people',
    // 'info',
  ];
  Routing: string[] = [
    '/',
    '/metrix',
    '/mapping',
    // '/usage',
    // '/teams',
    // '/about',
  ];
  constructor() {}
}
