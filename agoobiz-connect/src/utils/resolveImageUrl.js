import { API_ORIGIN } from "../api/api";

// Product images come back as backend-relative paths (e.g. "/uploads/products/x.jpg").
// The React dev server runs on a different port than the API, so these need
// to be resolved against the backend's own origin, not treated as relative.
export function resolveImageUrl(path) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  return `${API_ORIGIN}${path}`;
}