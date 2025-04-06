import { useState, useEffect } from "react";
import { X, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconWrapper } from "@/components/design-system/icon-wrapper";

interface DocumentViewerProps {
  documentId: string;
  title: string;
  onClose: () => void;
}

// Map document IDs to their file paths
const documentPaths: Record<string, string> = {
  "core-framework": "/attached_assets/atmf-framework_v3.md",
  "framework-comparison": "/attached_assets/framework-comparison_v2.md",
  "ai-ethics": "/attached_assets/ai-ethics-supplement_v3.md",
  "case-studies": "/attached_assets/case-studies_v3.md",
  "assessment-templates": "/attached_assets/case-studies_v3.md", // Placeholder - same file for now
};

export function DocumentViewer({ documentId, title, onClose }: DocumentViewerProps) {
  const [content, setContent] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true);
        const filePath = documentPaths[documentId];
        
        if (!filePath) {
          throw new Error("Document not found");
        }
        
        const response = await fetch(filePath);
        
        if (!response.ok) {
          throw new Error("Failed to load document");
        }
        
        const text = await response.text();
        setContent(text);
        setLoading(false);
      } catch (err) {
        console.error("Error loading document:", err);
        setError(err instanceof Error ? err.message : "Unknown error occurred");
        setLoading(false);
      }
    };
    
    fetchDocument();
  }, [documentId]);

  // Function to convert markdown to HTML (very simple implementation)
  const formatMarkdown = (markdown: string) => {
    // Split the content by line breaks
    const lines = markdown.split("\n");
    
    // Process each line
    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("# ")) {
        return <h1 key={index} className="text-2xl font-bold my-4">{line.substring(2)}</h1>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={index} className="text-xl font-bold my-3">{line.substring(3)}</h2>;
      }
      if (line.startsWith("### ")) {
        return <h3 key={index} className="text-lg font-bold my-2">{line.substring(4)}</h3>;
      }
      if (line.startsWith("#### ")) {
        return <h4 key={index} className="text-base font-bold my-2">{line.substring(5)}</h4>;
      }
      
      // Lists
      if (line.startsWith("- ")) {
        return <li key={index} className="ml-6 list-disc my-1">{line.substring(2)}</li>;
      }
      if (line.startsWith("1. ") || line.startsWith("2. ") || line.startsWith("3. ")) {
        return <li key={index} className="ml-6 list-decimal my-1">{line.substring(3)}</li>;
      }
      
      // Horizontal rule
      if (line.startsWith("---")) {
        return <hr key={index} className="my-4 border-t border-white/10" />;
      }
      
      // Bold and italic text (basic implementation)
      let processedLine = line;
      processedLine = processedLine.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      processedLine = processedLine.replace(/\*(.*?)\*/g, "<em>$1</em>");
      
      // Empty line as paragraph break
      if (line.trim() === "") {
        return <div key={index} className="my-2"></div>;
      }
      
      // Regular paragraph
      return <p key={index} className="my-1" dangerouslySetInnerHTML={{ __html: processedLine }} />;
    });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-atmf-main w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden border border-white/10">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h2 className="text-lg font-semibold">{title}</h2>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="flex items-center">
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          )}
          
          {error && (
            <div className="flex flex-col items-center justify-center h-full">
              <IconWrapper color="purple" size="lg" className="mb-4">
                <X className="h-8 w-8" />
              </IconWrapper>
              <h3 className="text-lg font-medium mb-2">Error Loading Document</h3>
              <p className="text-text-muted">{error}</p>
              <Button className="mt-4" onClick={onClose}>Close</Button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="prose prose-invert max-w-none">
              {formatMarkdown(content)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}