# Countries Map

World countries datamaps component for Angular. A drop-in replacement for the original `countries-map` library, modernized for Angular 19+ with no ESM compatibility issues.

## Features

- **Standalone Components**: Built with Angular's modern standalone component architecture
- **No chroma-js Dependency**: Uses native CSS `color-mix()` with `oklch` color space for smooth color interpolation
- **No ESM Issues**: Uses the lightweight `country-list` package instead of `@jagomf/countrieslist`
- **Angular 19+ Compatible**: Fully compatible with the latest Angular versions
- **Zero Runtime Color Computation**: Colors are calculated dynamically by the browser using CSS

## Installation

```bash
npm install ng-countries-map country-list
```

## Usage

```typescript
import { Component } from '@angular/core';
import { CountriesMapComponent, CountriesData } from 'ng-countries-map';

@Component({
  selector: 'app-example',
  standalone: true,
  imports: [CountriesMapComponent],
  template: `
    <countries-map
      [data]="mapData"
      countryLabel="Country"
      valueLabel="Population"
      [showCaption]="true"
      minColor="oklch(95% 0.05 200)"
      maxColor="oklch(45% 0.25 25)"
      (chartSelect)="onSelect($event)"
    />
  `
})
export class ExampleComponent {
  mapData: CountriesData = {
    US: { value: 331, extra: { capital: 'Washington D.C.' } },
    CN: { value: 1412, extra: { capital: 'Beijing' } },
    // ... more countries
  };

  onSelect(event: ChartSelectEvent) {
    console.log('Selected:', event.country, event.value);
  }
}
```

## Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `data` | `CountriesData` | **required** | Map of country codes to values |
| `countryLabel` | `string` | `'Country'` | Label shown in caption |
| `valueLabel` | `string` | `'Value'` | Label for the value |
| `showCaption` | `boolean` | `true` | Whether to show the caption |
| `captionBelow` | `boolean` | `true` | Position caption below the map |
| `minValue` | `number` | auto | Minimum value for color scale |
| `maxValue` | `number` | auto | Maximum value for color scale |
| `minColor` | `string` | `'oklch(100% 0 0)'` | Color for minimum values |
| `maxColor` | `string` | `'oklch(55% 0.25 25)'` | Color for maximum values |
| `backgroundColor` | `string` | `'white'` | Map background color |
| `noDataColor` | `string` | `'#CFCFCF'` | Color for countries without data |
| `exceptionColor` | `string` | `'#FFEE58'` | Color for exception cases |

## Outputs

| Output | Type | Description |
|--------|------|-------------|
| `chartReady` | `EventEmitter<void>` | Emitted when the map is loaded |
| `chartError` | `EventEmitter<ChartErrorEvent>` | Emitted on error |
| `chartSelect` | `EventEmitter<ChartSelectEvent>` | Emitted when a country is selected |

## Using OKLCH Colors

This library uses modern CSS `color-mix()` with `oklch` color space for perceptually uniform color interpolation. You can use any valid CSS color, but `oklch` provides the best results:

```typescript
// OKLCH format: oklch(lightness chroma hue)
minColor = 'oklch(95% 0.05 200)';  // Light cyan
maxColor = 'oklch(45% 0.25 25)';   // Dark red

// You can also use traditional formats
minColor = 'white';
maxColor = 'red';
```

## Migration from v4.x

This version is a drop-in replacement with the following improvements:

1. **No more chroma-js**: Colors are now handled via CSS `color-mix()` in `oklch` color space
2. **No more @jagomf/countrieslist**: Uses the simpler `country-list` package
3. **Standalone components**: No need to import a module, just import the component directly
4. **No ESM issues**: All dependencies are CommonJS-compatible

## Credits

This library is inspired by and based on [jagomf/countries-map](https://github.com/jagomf/countries-map) by Jago MF. Thank you for the original implementation and the embedded SVG world map!

## Repository

[https://github.com/tailosoft/countries-map](https://github.com/tailosoft/countries-map)

## License

MIT
