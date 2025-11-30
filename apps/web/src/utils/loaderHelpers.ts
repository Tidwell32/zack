/**
 * Extracts query parameters from the loader request URL
 * @param request - The loader request object
 * @returns Object with all query parameters as key-value pairs
 */
export const getQueryParams = (request: Request): Record<string, string | undefined> => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const params: Record<string, string | undefined> = {};
  searchParams.forEach((value, key) => {
    params[key] = value || undefined;
  });

  return params;
};

/**
 * Extracts specific query parameters from the loader request URL
 * Useful when you only care about certain params
 */
export const getSpecificQueryParams = <T>(request: Request, keys: Array<keyof T>): T => {
  const url = new URL(request.url);
  const searchParams = url.searchParams;

  const params: Record<string, string | undefined> = {};
  keys.forEach((key) => {
    const value = searchParams.get(key as string);
    params[key as string] = value ?? undefined;
  });

  return params as T;
};
