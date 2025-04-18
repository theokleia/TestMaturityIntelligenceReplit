import { QueryClient } from "@tanstack/react-query";
import { queryClient } from "./queryClient";

/**
 * Creates a properly formatted query URL with parameters
 * @param baseUrl The base API endpoint URL (e.g., "/api/test-suites")
 * @param params Optional query parameters object
 * @returns Formatted URL with query parameters
 */
export function createQueryUrl(baseUrl: string, params?: Record<string, any>): string {
  if (!params) return baseUrl;
  
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  });
  
  return `${baseUrl}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
}

/**
 * Invalidates all queries that start with the given URL prefix
 * @param prefix The URL prefix to match (e.g., "/api/test-suites")
 */
export function invalidateQueriesByPrefix(prefix: string): void {
  queryClient.invalidateQueries({ 
    predicate: (query) => {
      const queryKey = query.queryKey[0] as string;
      return typeof queryKey === 'string' && queryKey.startsWith(prefix);
    }
  });
}

/**
 * Utility type for resource endpoints
 */
export type ResourceEndpoint = 
  | "/api/test-suites" 
  | "/api/test-cases" 
  | "/api/projects" 
  | "/api/dimensions" 
  | "/api/levels" 
  | "/api/metrics" 
  | "/api/recommendations" 
  | "/api/assessments" 
  | "/api/templates";

/**
 * Invalidates queries for common resource endpoints
 * @param endpoint The resource endpoint to invalidate
 */
export function invalidateResource(endpoint: ResourceEndpoint): void {
  invalidateQueriesByPrefix(endpoint);
}