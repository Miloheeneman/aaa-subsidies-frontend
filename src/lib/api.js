import axios from "axios";

import { getToken, removeToken } from "./auth.js";

const baseURL = import.meta.env.VITE_API_URL || "/api/v1";

export const api = axios.create({
  baseURL,
  withCredentials: false,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (resp) => resp,
  (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      removeToken();
      if (
        typeof window !== "undefined" &&
        !["/login", "/register"].some((p) =>
          window.location.pathname.startsWith(p),
        )
      ) {
        // Soft redirect to login with a return-to hint.
        const returnTo = window.location.pathname + window.location.search;
        window.location.assign(
          `/login?next=${encodeURIComponent(returnTo)}`,
        );
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Upload a file directly to a presigned URL (R2 / S3-compatible).
 * Uses raw fetch instead of our authenticated axios instance because the
 * presigned URL must not carry our JWT.
 */
export async function uploadToPresignedUrl(
  url,
  file,
  { contentType, onProgress } = {},
) {
  return await new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url, true);
    if (contentType) {
      xhr.setRequestHeader("Content-Type", contentType);
    }
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(xhr);
      } else {
        reject(
          new Error(
            `Upload mislukt (HTTP ${xhr.status}). ${xhr.responseText || ""}`.trim(),
          ),
        );
      }
    };
    xhr.onerror = () =>
      reject(new Error("Netwerkfout tijdens upload naar opslag."));
    xhr.send(file);
  });
}

export function apiErrorMessage(error, fallback = "Er is iets misgegaan.") {
  const detail = error?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0];
    if (typeof first?.msg === "string") return first.msg;
  }
  if (error?.message) return error.message;
  return fallback;
}

export default api;
