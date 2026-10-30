/**
 * Alpha Meteo Central API Client
 * Provides robust typed fetch, timeouts, and structured error handling.
 */

export interface ApiClientOptions extends RequestInit {
  timeoutMs?: number;
}

export class ApiError extends Error {
  public status: number;
  public data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: ApiClientOptions = {}
): Promise<T> {
  const { timeoutMs = 15000, headers, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const defaultHeaders: HeadersInit = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    signal: controller.signal,
  };

  try {
    const response = await fetch(endpoint, config);
    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorData: any = null;
      try {
        errorData = await response.json();
      } catch {
        errorData = await response.text();
      }
      throw new ApiError(
        `API call to ${endpoint} failed with HTTP ${response.status}`,
        response.status,
        errorData
      );
    }

    // Try parsing JSON, fallback to text
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return (await response.json()) as T;
    }
    return (await response.text()) as unknown as T;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === "AbortError") {
      throw new ApiError(`Request to ${endpoint} timed out after ${timeoutMs}ms`, 408);
    }
    throw error;
  }
}
