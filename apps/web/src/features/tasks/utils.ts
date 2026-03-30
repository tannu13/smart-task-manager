import { ApiClientError } from "@/lib/api-client";

export const formatTaskDate = (value: string) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export const getErrorMessage = (error: unknown) => {
  if (error instanceof ApiClientError) {
    return error.message;
  }

  return "Something unexpected happened.";
};
