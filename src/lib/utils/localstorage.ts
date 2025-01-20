export const setLocalStorage = <T>(name: string, items: T): void => {
  localStorage.setItem(name, JSON.stringify(items));
};

export const getLocalStorage = <T>(name: string): T => {
  const data = localStorage.getItem(name);
  if (data) {
    return JSON.parse(data) as T;
  } else {
    const defaultValue: T = [] as unknown as T;
    localStorage.setItem(name, JSON.stringify(defaultValue));
    return defaultValue;
  }
};
