export const INDIAN_EXCHANGES = ['NSE', 'BSE'] as const;

export const GOAL_CATEGORIES = [
  'retirement',
  'education',
  'home',
  'wealth_building',
  'tax_saving',
  'emergency',
  'vacation',
  'other',
] as const;

export const RISK_LEVELS = ['low', 'medium', 'high'] as const;

export const ASSET_TYPES = ['mutual_fund', 'stock'] as const;

export const REBALANCING_FREQUENCIES = [
  'monthly',
  'quarterly',
  'half-yearly',
  'yearly',
] as const;

export const MARKET_HOURS = {
  TIMEZONE: 'Asia/Kolkata',
  OPEN_HOUR: 9,
  OPEN_MINUTE: 15,
  CLOSE_HOUR: 15,
  CLOSE_MINUTE: 30,
};
