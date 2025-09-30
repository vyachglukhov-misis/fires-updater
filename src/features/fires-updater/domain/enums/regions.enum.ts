export enum REGIONS {
  KS = 'krasnoyarsk',
  HB = 'habarovsk',
}

export type Region = keyof typeof REGIONS;
