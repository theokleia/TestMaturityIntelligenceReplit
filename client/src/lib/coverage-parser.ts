/**
 * Utility functions for parsing test suite coverage data
 */

export interface ParsedCoverage {
  jiraTickets: string[];
  compliance: string[];
  documents: string[];
  raw: string;
}

/**
 * Parse the structured coverage text from test suites
 * Format: "JIRA_TICKETS: XAM-123, XAM-124 | COMPLIANCE: GDPR data processing | DOCUMENTS: User authentication section"
 */
export function parseCoverage(coverageText: string | null): ParsedCoverage {
  if (!coverageText) {
    return {
      jiraTickets: [],
      compliance: [],
      documents: [],
      raw: ''
    };
  }

  const parsed: ParsedCoverage = {
    jiraTickets: [],
    compliance: [],
    documents: [],
    raw: coverageText
  };

  // Split by pipe separator and process each section
  const sections = coverageText.split('|').map(s => s.trim());

  sections.forEach(section => {
    if (section.startsWith('JIRA_TICKETS:')) {
      const ticketsText = section.replace('JIRA_TICKETS:', '').trim();
      if (ticketsText && ticketsText !== 'None') {
        parsed.jiraTickets = ticketsText.split(',').map(t => t.trim()).filter(t => t.length > 0);
      }
    } else if (section.startsWith('COMPLIANCE:')) {
      const complianceText = section.replace('COMPLIANCE:', '').trim();
      if (complianceText && complianceText !== 'None') {
        parsed.compliance = complianceText.split(',').map(c => c.trim()).filter(c => c.length > 0);
      }
    } else if (section.startsWith('DOCUMENTS:')) {
      const documentsText = section.replace('DOCUMENTS:', '').trim();
      if (documentsText && documentsText !== 'None') {
        parsed.documents = documentsText.split(',').map(d => d.trim()).filter(d => d.length > 0);
      }
    }
  });

  return parsed;
}

/**
 * Format coverage data back to the structured text format
 */
export function formatCoverage(coverage: Partial<ParsedCoverage>): string {
  const parts: string[] = [];

  if (coverage.jiraTickets && coverage.jiraTickets.length > 0) {
    parts.push(`JIRA_TICKETS: ${coverage.jiraTickets.join(', ')}`);
  }

  if (coverage.compliance && coverage.compliance.length > 0) {
    parts.push(`COMPLIANCE: ${coverage.compliance.join(', ')}`);
  }

  if (coverage.documents && coverage.documents.length > 0) {
    parts.push(`DOCUMENTS: ${coverage.documents.join(', ')}`);
  }

  return parts.join(' | ');
}

/**
 * Get a summary of coverage for display
 */
export function getCoverageSummary(coverageText: string | null): string {
  const parsed = parseCoverage(coverageText);
  const summary: string[] = [];

  if (parsed.jiraTickets.length > 0) {
    summary.push(`${parsed.jiraTickets.length} Jira ticket${parsed.jiraTickets.length > 1 ? 's' : ''}`);
  }

  if (parsed.compliance.length > 0) {
    summary.push(`${parsed.compliance.length} compliance requirement${parsed.compliance.length > 1 ? 's' : ''}`);
  }

  if (parsed.documents.length > 0) {
    summary.push(`${parsed.documents.length} document section${parsed.documents.length > 1 ? 's' : ''}`);
  }

  return summary.length > 0 ? summary.join(', ') : 'No coverage data';
}