export type UpsertResult = {
  success: true;
} | {
  success: false;
  validationErrors?: { field: string; error: string }[];
  databaseError?: string;
};
