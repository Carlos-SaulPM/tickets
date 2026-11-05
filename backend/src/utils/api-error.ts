export class ApiError extends Error {
  readonly status: number;
  readonly issues?: unknown[];

  constructor(status: number, message: string, issues?: unknown[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;

    if (issues) this.issues = issues;
  }
}
