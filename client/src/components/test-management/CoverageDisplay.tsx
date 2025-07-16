import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bug, FileText, Shield } from "lucide-react";
import { parseCoverage, type ParsedCoverage } from "@/lib/coverage-parser";

interface CoverageDisplayProps {
  coverageText: string | null;
  className?: string;
}

export function CoverageDisplay({ coverageText, className }: CoverageDisplayProps) {
  const coverage = parseCoverage(coverageText);

  if (!coverageText || (coverage.jiraTickets.length === 0 && coverage.compliance.length === 0 && coverage.documents.length === 0)) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-text-muted">Coverage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-text-muted">No coverage data available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Coverage Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {coverage.jiraTickets.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Bug className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Jira Tickets ({coverage.jiraTickets.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {coverage.jiraTickets.map((ticket, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {ticket}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {coverage.compliance.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Compliance Requirements ({coverage.compliance.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {coverage.compliance.map((req, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  {req}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {coverage.documents.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileText className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Knowledge Documents ({coverage.documents.length})</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {coverage.documents.map((doc, index) => (
                <Badge key={index} variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                  {doc}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Compact coverage display for use in cards or lists
 */
export function CompactCoverageDisplay({ coverageText, className }: CoverageDisplayProps) {
  const coverage = parseCoverage(coverageText);

  if (!coverageText || (coverage.jiraTickets.length === 0 && coverage.compliance.length === 0 && coverage.documents.length === 0)) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 text-xs text-text-muted ${className || ''}`}>
      {coverage.jiraTickets.length > 0 && (
        <div className="flex items-center gap-1">
          <Bug className="h-3 w-3 text-blue-500" />
          <span>{coverage.jiraTickets.length} tickets</span>
        </div>
      )}
      
      {coverage.compliance.length > 0 && (
        <div className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-green-500" />
          <span>{coverage.compliance.length} compliance</span>
        </div>
      )}
      
      {coverage.documents.length > 0 && (
        <div className="flex items-center gap-1">
          <FileText className="h-3 w-3 text-purple-500" />
          <span>{coverage.documents.length} docs</span>
        </div>
      )}
    </div>
  );
}