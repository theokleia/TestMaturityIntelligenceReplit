import { TestCase, TestSuite } from "@/hooks/test-management";

/**
 * Get the appropriate color class for test case status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "draft":
      return "bg-orange-500/20 text-orange-500 border-orange-500/20";
    case "ready":
      return "bg-blue-500/20 text-blue-500 border-blue-500/20";
    case "in-progress":
      return "bg-purple-500/20 text-purple-500 border-purple-500/20";
    case "blocked":
      return "bg-red-500/20 text-red-500 border-red-500/20";
    case "completed":
      return "bg-green-500/20 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/20 text-gray-500 border-gray-500/20";
  }
};

/**
 * Get the appropriate color class for test case priority
 */
export const getPriorityColor = (priority: string): string => {
  switch (priority) {
    case "high":
      return "bg-red-500/20 text-red-500 border-red-500/20";
    case "medium":
      return "bg-yellow-500/20 text-yellow-500 border-yellow-500/20";
    case "low":
      return "bg-green-500/20 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/20 text-gray-500 border-gray-500/20";
  }
};

/**
 * Get the appropriate color class for test case severity
 */
export const getSeverityColor = (severity: string): string => {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-500 border-red-500/20";
    case "high":
      return "bg-orange-500/20 text-orange-500 border-orange-500/20";
    case "normal":
      return "bg-blue-500/20 text-blue-500 border-blue-500/20";
    case "low":
      return "bg-green-500/20 text-green-500 border-green-500/20";
    default:
      return "bg-gray-500/20 text-gray-500 border-gray-500/20";
  }
};

/**
 * Format a date string for display
 */
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

/**
 * Find a test suite by ID in an array of test suites
 */
export const findTestSuiteById = (
  suites: TestSuite[] | undefined,
  suiteId: number | undefined
): TestSuite | undefined => {
  if (!suites || !suiteId) return undefined;
  return suites.find(suite => suite.id === suiteId);
};

/**
 * Capitalize first letter of a string
 */
export const capitalizeFirstLetter = (str: string): string => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};