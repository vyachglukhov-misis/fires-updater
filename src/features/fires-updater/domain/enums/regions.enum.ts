export enum REGIONS {
  KS = 'krasnoyarsk',
  NK = 'norilsk',
  HB = 'habarovsk',
}

export type Region = keyof typeof REGIONS;
