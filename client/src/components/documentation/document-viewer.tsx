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

  // Function to convert markdown to HTML with improved processing
  const formatMarkdown = (markdown: string) => {
    // Split the content by line breaks
    const lines = markdown.split("\n");
    
    // Track list state
    let inOrderedList = false;
    let inUnorderedList = false;
    let listItems: JSX.Element[] = [];
    let result: JSX.Element[] = [];
    
    // Process each line
    lines.forEach((line, index) => {
      // Headers
      if (line.startsWith("# ")) {
        // Close any open lists
        if (inOrderedList || inUnorderedList) {
          result.push(
            inOrderedList 
              ? <ol key={`list-${index}`} className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>
              : <ul key={`list-${index}`} className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>
          );
          listItems = [];
          inOrderedList = false;
          inUnorderedList = false;
        }
        result.push(<h1 key={index} className="text-2xl font-bold my-6 text-white">{line.substring(2)}</h1>);
        return;
      }
      
      if (line.startsWith("## ")) {
        // Close any open lists
        if (inOrderedList || inUnorderedList) {
          result.push(
            inOrderedList 
              ? <ol key={`list-${index}`} className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>
              : <ul key={`list-${index}`} className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>
          );
          listItems = [];
          inOrderedList = false;
          inUnorderedList = false;
        }
        result.push(<h2 key={index} className="text-xl font-bold my-5 text-white">{line.substring(3)}</h2>);
        return;
      }
      
      if (line.startsWith("### ")) {
        // Close any open lists
        if (inOrderedList || inUnorderedList) {
          result.push(
            inOrderedList 
              ? <ol key={`list-${index}`} className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>
              : <ul key={`list-${index}`} className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>
          );
          listItems = [];
          inOrderedList = false;
          inUnorderedList = false;
        }
        result.push(<h3 key={index} className="text-lg font-bold my-4 text-white">{line.substring(4)}</h3>);
        return;
      }
      
      if (line.startsWith("#### ")) {
        // Close any open lists
        if (inOrderedList || inUnorderedList) {
          result.push(
            inOrderedList 
              ? <ol key={`list-${index}`} className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>
              : <ul key={`list-${index}`} className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>
          );
          listItems = [];
          inOrderedList = false;
          inUnorderedList = false;
        }
        result.push(<h4 key={index} className="text-base font-bold my-3 text-white">{line.substring(5)}</h4>);
        return;
      }
      
      // Lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        // If we were in an ordered list, close it
        if (inOrderedList) {
          result.push(<ol key={`list-${index}`} className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>);
          listItems = [];
          inOrderedList = false;
        }
        
        inUnorderedList = true;
        const content = line.substring(2);
        // Process bold and italic in list items
        const processedContent = processInlineFormatting(content);
        listItems.push(<li key={`li-${index}`}>{processedContent}</li>);
        return;
      }
      
      if (/^\d+\.\s/.test(line)) {
        // If we were in an unordered list, close it
        if (inUnorderedList) {
          result.push(<ul key={`list-${index}`} className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>);
          listItems = [];
          inUnorderedList = false;
        }
        
        inOrderedList = true;
        const content = line.replace(/^\d+\.\s/, '');
        // Process bold and italic in list items
        const processedContent = processInlineFormatting(content);
        listItems.push(<li key={`li-${index}`}>{processedContent}</li>);
        return;
      }
      
      // If we're not on a list item anymore but we were in a list, close the list
      if ((inOrderedList || inUnorderedList) && !line.startsWith("- ") && !line.startsWith("* ") && !/^\d+\.\s/.test(line)) {
        result.push(
          inOrderedList 
            ? <ol key={`list-${index}`} className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>
            : <ul key={`list-${index}`} className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>
        );
        listItems = [];
        inOrderedList = false;
        inUnorderedList = false;
      }
      
      // Horizontal rule
      if (line.startsWith("---")) {
        result.push(<hr key={index} className="my-6 border-t border-white/20" />);
        return;
      }
      
      // Empty line as paragraph break
      if (line.trim() === "") {
        if (!inOrderedList && !inUnorderedList) {
          result.push(<div key={index} className="my-2"></div>);
        }
        return;
      }
      
      // Regular paragraph
      if (!inOrderedList && !inUnorderedList) {
        const processedContent = processInlineFormatting(line);
        result.push(<p key={index} className="my-2 text-gray-300">{processedContent}</p>);
      }
    });
    
    // Close any open lists at the end
    if (inOrderedList || inUnorderedList) {
      result.push(
        inOrderedList 
          ? <ol className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>
          : <ul className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>
      );
    }
    
    return result;
  };
  
  // Function to process inline formatting (bold, italic, links)
  const processInlineFormatting = (text: string) => {
    // Process bold and italic
    let segments = [];
    let remainingText = text;
    let lastIndex = 0;
    
    // Bold
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch.index > lastIndex) {
        // Add text before the bold part
        segments.push(remainingText.substring(0, boldMatch.index - lastIndex));
      }
      
      // Add the bold part
      segments.push(<strong key={`bold-${boldMatch.index}`} className="font-bold">{boldMatch[1]}</strong>);
      
      // Update remaining text
      remainingText = remainingText.substring(boldMatch.index - lastIndex + boldMatch[0].length);
      lastIndex = boldMatch.index + boldMatch[0].length;
    }
    
    // Add any remaining text
    if (remainingText) {
      segments.push(remainingText);
    }
    
    // If no bold matches were found, process italic
    if (segments.length === 0) {
      segments = [text];
    }
    
    // Process italic in each segment
    const processedSegments = segments.map((segment, index) => {
      if (typeof segment !== 'string') {
        return segment;
      }
      
      const italicParts = [];
      let italicRemaining = segment;
      let italicLastIndex = 0;
      
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      
      while ((italicMatch = italicRegex.exec(segment)) !== null) {
        if (italicMatch.index > italicLastIndex) {
          // Add text before the italic part
          italicParts.push(italicRemaining.substring(0, italicMatch.index - italicLastIndex));
        }
        
        // Add the italic part
        italicParts.push(<em key={`italic-${index}-${italicMatch.index}`} className="italic">{italicMatch[1]}</em>);
        
        // Update remaining text
        italicRemaining = italicRemaining.substring(italicMatch.index - italicLastIndex + italicMatch[0].length);
        italicLastIndex = italicMatch.index + italicMatch[0].length;
      }
      
      // Add any remaining text
      if (italicRemaining) {
        italicParts.push(italicRemaining);
      }
      
      return italicParts.length > 0 ? <>{italicParts}</> : segment;
    });
    
    return <>{processedSegments}</>;
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-50 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-atmf-dark w-full max-w-5xl h-[90vh] rounded-xl flex flex-col overflow-hidden border border-white/10 shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-atmf-main">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onClose} className="mr-3 hover:bg-black/20">
              <ArrowLeft className="h-5 w-5 text-white" />
            </Button>
            <h2 className="text-lg font-semibold text-white">{title}</h2>
          </div>
          <div className="flex items-center space-x-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center border-white/20 text-white hover:bg-primary/20 hover:text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
            <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-black/20">
              <X className="h-5 w-5 text-white" />
            </Button>
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 bg-atmf-dark">
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
              <h3 className="text-lg font-medium mb-2 text-white">Error Loading Document</h3>
              <p className="text-text-muted">{error}</p>
              <Button className="mt-4" onClick={onClose}>Close</Button>
            </div>
          )}
          
          {!loading && !error && (
            <div className="max-w-none">
              <div className="max-w-4xl mx-auto">
                {formatMarkdown(content)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}