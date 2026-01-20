import {
  Component,
  ElementRef,
  input,
  output,
  model,
  viewChild,
  ChangeDetectionStrategy,
  effect,
  signal,
  computed
} from '@angular/core';
import { NgClass } from '@angular/common';
import { ChartErrorCode } from './chart-events';
import type { ChartSelectEvent, ChartErrorEvent } from './chart-events';
import type {
  CountriesData,
  SelectionExtra,
  DrawableCountries,
  Selection,
  ValidExtraData,
  DrawableCountry,
  CountryData
} from './data-types';
import { CountriesMapBaseComponent } from './base-map.component';
import { getName } from 'country-list';

const exists = (item: unknown): item is NonNullable<typeof item> =>
  typeof item !== 'undefined' && item !== null;

const countryNum = (item: CountryData): number =>
  parseInt(item.value?.toString(), 10);

const COUNTRY_CLASS = 'countryxx';
const OCEAN_ID = 'ocean';
const getStrokeWidth = (isHovered: boolean): string => (isHovered ? '0.2%' : '0.1%');
const getStrokeColor = (isHovered: boolean): string => (isHovered ? '#888' : '#afafaf');

const countryName = (countryCode: string): string => {
  return getName(countryCode) ?? countryCode;
};

@Component({
  selector: 'countries-map',
  standalone: true,
  imports: [NgClass, CountriesMapBaseComponent],
  templateUrl: './countries-map.component.html',
  styleUrl: './countries-map.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CountriesMapComponent {
  readonly data = input.required<CountriesData>();
  readonly countryLabel = input('Country');
  readonly valueLabel = input('Value');
  readonly showCaption = input(true);
  readonly captionBelow = input(true);
  readonly minValue = input<number>();
  readonly maxValue = input<number>();
  readonly minColor = input('oklch(100% 0 0)'); // white in oklch
  readonly maxColor = input('oklch(55% 0.25 25)'); // red in oklch
  readonly backgroundColor = input('white');
  readonly noDataColor = input('#CFCFCF');
  readonly exceptionColor = input('#FFEE58');

  readonly chartReady = output<void>();
  readonly chartError = output<ChartErrorEvent>();
  readonly chartSelect = output<ChartSelectEvent>();

  private readonly mapContent = viewChild.required(CountriesMapBaseComponent, { read: ElementRef });

  readonly loading = model(true);
  protected readonly selection = signal<Selection | null>(null);

  private mapData: DrawableCountries = {};

  protected readonly selectionValue = computed((): ValidExtraData | null => {
    const sel = this.selection();
    if (!sel) return null;
    return this.data()[sel.countryId]?.value ?? null;
  });

  constructor() {
    effect(() => {
      this.initializeMap();
    });
  }

  private getExtraSelected(country: string): SelectionExtra[] | null {
    const { extra } = this.data()[country];
    return extra ? Object.keys(extra).map((key) => ({ key, val: extra[key] })) : null;
  }

  private selectCountry(country?: string): void {
    this.selection.set(
      country
        ? {
            countryId: country,
            countryName: countryName(country),
            extra: this.getExtraSelected(country) ?? undefined
          }
        : null
    );
  }

  private initializeMap(): void {
    this.loading.set(true);
    const mapEl = this.mapContent().nativeElement;
    try {
      const data = this.data();
      if (data) {
        // Compute min/max in single pass if not provided
        let minVal = this.minValue();
        let maxVal = this.maxValue();

        if (!exists(minVal) || !exists(maxVal)) {
          for (const countryVal of Object.values(data)) {
            const numVal = countryNum(countryVal);
            if (!isNaN(numVal)) {
              if (!exists(minVal) || numVal < minVal) minVal = numVal;
              if (!exists(maxVal) || numVal > maxVal) maxVal = numVal;
            }
          }
        }

        minVal = minVal ?? 0;
        maxVal = maxVal ?? 1;
        const range = maxVal - minVal || 1;

        // Create drawable countries with percentage for CSS color-mix
        this.mapData = {};
        for (const [countryId, countryVal] of Object.entries(data)) {
          const numVal = countryNum(countryVal);
          let percentage: number;

          if (isNaN(numVal)) {
            percentage = -1; // Exception case
          } else if (numVal <= minVal) {
            percentage = 0;
          } else if (numVal >= maxVal) {
            percentage = 100;
          } else {
            percentage = ((numVal - minVal) / range) * 100;
          }

          this.mapData[countryId.toLowerCase()] = {
            ...countryVal,
            percentage
          } as DrawableCountry;
        }
      } else {
        this.mapData = {};
      }

      const svgMap = mapEl.children[0] as SVGSVGElement;
      svgMap.style.backgroundColor = this.backgroundColor();

      const noDataColor = this.noDataColor();
      const exceptionColor = this.exceptionColor();
      const minColor = this.minColor();
      const maxColor = this.maxColor();

      svgMap.querySelectorAll<SVGSVGElement>(`.${COUNTRY_CLASS}`).forEach((item) => {
        const mapItem = this.mapData[item.id.toLowerCase()];
        const isException = mapItem ? mapItem.percentage < 0 : false;
        const hasData = !!mapItem && mapItem.percentage >= 0;

        if (isException) {
          item.style.fill = exceptionColor;
        } else if (hasData) {
          // Use CSS color-mix with oklch for smooth color interpolation
          item.style.fill = `color-mix(in oklch, ${maxColor} ${mapItem.percentage}%, ${minColor})`;
        } else {
          item.style.fill = noDataColor;
        }

        item.onmouseenter = this.countryHover.bind(this, item, true);
        item.onmouseleave = this.countryHover.bind(this, item, false);
      });

      this.onChartReady();
    } catch (e) {
      this.onChartError({ id: ChartErrorCode.Loading, message: 'Could not load' });
    }
  }

  private countryHover(item: SVGElement, hovered: boolean): void {
    item.style.strokeWidth = getStrokeWidth(hovered);
    item.style.stroke = getStrokeColor(hovered);
    item.querySelectorAll<SVGElement>('.landxx').forEach((i) => {
      i.style.strokeWidth = getStrokeWidth(hovered);
      i.style.stroke = getStrokeColor(hovered);
    });
  }

  private onChartReady(): void {
    this.loading.set(false);
    this.chartReady.emit();
  }

  private onChartError(error: ChartErrorEvent): void {
    this.chartError.emit(error);
  }

  onMapSelect(ev: MouseEvent): void {
    const event: ChartSelectEvent = {
      selected: false,
      value: undefined,
      extra: undefined,
      country: ''
    };

    let newItem: SVGElement | null = null;

    if ((ev.target as SVGElement)?.id === OCEAN_ID) {
      this.selectCountry(undefined);
    } else {
      newItem = ev.target as SVGElement;
      while (newItem && !newItem.classList.contains(COUNTRY_CLASS)) {
        newItem = newItem.parentNode as SVGElement;
      }
    }

    const country = newItem ? this.mapData[newItem.id] : null;
    if (country) {
      event.selected = true;
      event.value = countryNum(country);
      event.country = newItem!.id.toUpperCase();
      event.extra = country.extra;
      this.selectCountry(event.country);
    } else {
      this.selectCountry(undefined);
    }
    this.chartSelect.emit(event);
  }
}
