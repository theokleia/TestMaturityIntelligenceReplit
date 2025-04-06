import React from "react";
import { Button } from "@/components/ui/button";
import { ATMFCard } from "@/components/design-system/atmf-card";
import { X } from "lucide-react";

interface SimpleDocumentViewerProps {
  documentId: string;
  title: string;
  onClose: () => void;
}

export function SimpleDocumentViewer({ documentId, title, onClose }: SimpleDocumentViewerProps) {
  return (
    <ATMFCard className="fixed inset-4 z-50 flex flex-col overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-white/10">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="p-6 overflow-auto">
        <h3 className="text-lg mb-4">Document ID: {documentId}</h3>
        <p className="mb-4">
          This is a placeholder for the document content. In the next phase, 
          we'll implement the full document viewer with markdown rendering capability.
        </p>
      </div>
    </ATMFCard>
  );
}