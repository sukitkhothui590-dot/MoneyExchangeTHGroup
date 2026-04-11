export interface DenominationRate {
  denom: string;
  buy: number;
  sell: number;
}

export interface CurrencyRate {
  code: string;
  name: string;
  flag: string;
  buy: number;
  sell: number;
  denominations?: DenominationRate[];
}

export interface RateData {
  rates: CurrencyRate[];
  lastUpdated: string;
  branch: string;
}
