export interface OutputSuccess {
  success: true;
}

export interface OutputError {
  success: false;
  validationErrors?: { field: string; error: string }[];
  databaseError?: string;
}

export type Output = OutputSuccess | OutputError;
