export type ReportType = 'fund_analysis' | 'stock_analysis' | 'portfolio_summary';

export type ReportStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IReport {
  _id: string;
  userId: string;
  type: ReportType;
  status: ReportStatus;
  schemeCode?: number;
  symbol?: string;
  downloadUrl?: string;
  expiresAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}
