export enum AppStep {
  UPLOAD_TEMPLATE = 0,
  RECORD_AUDIO = 1,
  PROCESSING = 2,
  RESULT = 3,
}

export interface ReportResult {
  html: string;
  tokenUsage: number;
}

export interface AudioState {
  blob: Blob | null;
  url: string | null;
  duration: number;
}