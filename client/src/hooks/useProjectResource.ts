import { UseQueryOptions, useQuery } from "@tanstack/react-query";
import { useProject } from "@/context/ProjectContext";
import { createQueryUrl } from "@/lib/queryUtils";

/**
 * A custom hook that automatically adds project context to resource queries
 * @param resourceUrl The base API endpoint URL (e.g., "/api/test-suites")
 * @param filters Optional additional filters
 * @param options Optional useQuery options
 * @returns Query result with project context automatically applied
 */
export function useProjectResource<T>(
  resourceUrl: string,
  filters?: Record<string, any>,
  options?: Omit<UseQueryOptions<T, Error, T, (string | Record<string, any>)[]>, "queryKey">
) {
  const { selectedProject } = useProject();
  const projectId = selectedProject?.id;
  
  // Merge projectId with other filters when a project is selected
  const mergedFilters = { 
    ...(filters || {}), 
    ...(projectId ? { projectId } : {}) 
  };
  
  const url = createQueryUrl(resourceUrl, mergedFilters);
  
  return useQuery<T, Error, T, (string | Record<string, any>)[]>({
    queryKey: [url, mergedFilters],
    refetchOnWindowFocus: false,
    ...(options || {})
  });
}