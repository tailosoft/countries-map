import { CountryExtraData } from './data-types';

export interface ChartSelectEvent {
  selected: boolean;
  value?: number;
  country: string;
  extra?: CountryExtraData;
}

export enum ChartErrorCode {
  Loading = 'loading'
}

export interface ChartErrorEvent {
  id: string | ChartErrorCode;
  message: string;
  detailedMessage?: string;
}
