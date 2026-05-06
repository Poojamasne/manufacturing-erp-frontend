export const canUseLocalStorage = () =>
  typeof window !== "undefined" && typeof window.localStorage !== "undefined";

export function readStorageValue<T>(key: string, fallback: T): T {
  if (!canUseLocalStorage()) {
    return fallback;
  }

  try {
    const rawValue = window.localStorage.getItem(key);

    if (rawValue === null) {
      return fallback;
    }

    return JSON.parse(rawValue) as T;
  } catch {
    return fallback;
  }
}

export function writeStorageValue<T>(key: string, value: T): T {
  if (canUseLocalStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  return value;
}

export function removeStorageValue(key: string) {
  if (canUseLocalStorage()) {
    window.localStorage.removeItem(key);
  }
}

export function updateStorageValue<T>(
  key: string,
  fallback: T,
  updater: (currentValue: T) => T
) {
  const currentValue = readStorageValue(key, fallback);
  const nextValue = updater(currentValue);

  writeStorageValue(key, nextValue);

  return nextValue;
}
