export type ApiErrorDetail = {
  field: string;
  message: string;
};

type ApiErrorBody = {
  code?: string;
  message?: string;
  details?: ApiErrorDetail[];
};

export class ApiClientError extends Error {
  status: number;
  code?: string;
  details?: ApiErrorDetail[];

  constructor(
    message: string,
    status: number,
    code?: string,
    details?: ApiErrorDetail[],
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const FALLBACK_API_BASE_URL = "http://localhost:4000";

const getApiBaseUrl = () =>
  (import.meta.env.VITE_API_BASE_URL || FALLBACK_API_BASE_URL).replace(
    /\/+$/,
    "",
  );

const resolveErrorBody = (payload: unknown): ApiErrorBody | null => {
  if (!payload || typeof payload !== "object" || !("error" in payload)) {
    return null;
  }

  const error = (payload as { error: ApiErrorBody }).error;
  return error && typeof error === "object" ? error : null;
};

export const request = async <T>(
  path: string,
  init?: RequestInit,
): Promise<T> => {
  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        ...init?.headers,
      },
    });
  } catch {
    throw new ApiClientError(
      "Unable to reach the API. Make sure the backend is running and CORS allows the web app origin.",
      0,
      "NETWORK_ERROR",
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers
    .get("content-type")
    ?.includes("application/json");
  const payload = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorBody = resolveErrorBody(payload);

    throw new ApiClientError(
      errorBody?.message || "Something went wrong while talking to the API.",
      response.status,
      errorBody?.code,
      errorBody?.details,
    );
  }

  return payload as T;
};
