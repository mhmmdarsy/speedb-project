import type { NavigateFunction } from 'react-router-dom';

/**
 * Navigate back safely.
 * Jika history kosong, fallback ke path default.
 */
export function goBack(navigate: NavigateFunction, fallback: string = '/') {
  if (window.history.length > 1) {
    navigate(-1);
  } else {
    navigate(fallback, { replace: true });
  }
}

/**
 * Navigate to path dengan replace (tanpa nambah history).
 * Cocok untuk login / redirect auth.
 */
export function goReplace(navigate: NavigateFunction, path: string) {
  navigate(path, { replace: true });
}

/**
 * Navigate normal (push).
 */
export function goTo(navigate: NavigateFunction, path: string) {
  navigate(path);
}
