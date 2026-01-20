import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'countries-map-base',
  standalone: true,
  templateUrl: './base-map.component.svg',
  styles: [':host { display: block; }'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountriesMapBaseComponent {}
