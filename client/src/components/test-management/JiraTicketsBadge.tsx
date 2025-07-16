import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface JiraTicketsBadgeProps {
  jiraTicketIds?: string[];
  jiraTickets?: Array<{
    key: string;
    summary: string;
  }>;
  className?: string;
}

export function JiraTicketsBadge({ jiraTicketIds, jiraTickets, className }: JiraTicketsBadgeProps) {
  // Use jiraTickets if available, otherwise fall back to jiraTicketIds
  const tickets = jiraTickets || (jiraTicketIds?.map(id => ({ key: id, summary: 'Loading...' })) || []);
  
  if (tickets.length === 0) {
    return <span className="text-text-muted text-xs">—</span>;
  }

  if (tickets.length === 1) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <Badge variant="outline" className={`text-xs font-mono ${className}`}>
              {tickets[0].key}
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            <div className="max-w-xs">
              <div className="font-medium">{tickets[0].key}</div>
              <div className="text-xs text-text-muted mt-1">{tickets[0].summary}</div>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <Badge variant="outline" className={`text-xs cursor-help ${className}`}>
            {tickets.length}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="max-w-xs space-y-2">
            <div className="font-medium text-xs">Jira Tickets ({tickets.length})</div>
            {tickets.map((ticket, index) => (
              <div key={index} className="border-t pt-2 first:border-t-0 first:pt-0">
                <div className="font-medium text-xs">{ticket.key}</div>
                <div className="text-xs text-text-muted mt-1">{ticket.summary}</div>
              </div>
            ))}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}