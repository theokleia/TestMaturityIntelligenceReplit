import { useState } from "react";

import { PageContainer } from "@/components/design-system/page-container";
import { ATMFCard } from "@/components/design-system/atmf-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Book, ArrowRight, FileText, BookOpen, Users, FileCode } from "lucide-react";
import { IconWrapper } from "@/components/design-system/icon-wrapper";
import { DocumentViewer } from "@/components/documentation/document-viewer";

interface DocumentCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: "blue" | "purple" | "teal";
  type: string;
}

interface DocumentSection {
  id: string;
  title: string;
  documents: DocumentCard[];
}

export default function ATMF() {
  const [activeTab, setActiveTab] = useState("framework");
  const [selectedDocument, setSelectedDocument] = useState<{id: string; title: string} | null>(null);
  
  const documentSections: DocumentSection[] = [
    {
      id: "framework",
      title: "ATMF Framework",
      documents: [
        {
          id: "core-framework",
          title: "Adaptive Testing Maturity Framework",
          description: "Comprehensive guide to the ATMF including core principles, dimensions, maturity levels, and implementation guidance.",
          icon: <Book className="h-6 w-6" />,
          color: "blue",
          type: "framework"
        },
        {
          id: "framework-comparison",
          title: "Framework Comparison",
          description: "Comparative analysis between ATMF and traditional testing frameworks like TMMi, TPI, and ISO/IEC/IEEE 29119.",
          icon: <FileText className="h-6 w-6" />,
          color: "purple",
          type: "framework"
        },
        {
          id: "ai-ethics",
          title: "AI Ethics and Governance",
          description: "Supplement covering AI ethics principles, governance frameworks, and responsible testing practices for AI systems.",
          icon: <BookOpen className="h-6 w-6" />,
          color: "teal",
          type: "framework"
        }
      ]
    },
    {
      id: "implementation",
      title: "Implementation Guides",
      documents: [
        {
          id: "case-studies",
          title: "Case Studies",
          description: "Detailed case studies of ATMF implementations across various organizations and industries with lessons learned.",
          icon: <Users className="h-6 w-6" />,
          color: "blue",
          type: "implementation"
        },
        {
          id: "assessment-templates",
          title: "Assessment Templates",
          description: "Templates and tools for conducting ATMF assessments and creating maturity improvement roadmaps.",
          icon: <FileCode className="h-6 w-6" />,
          color: "purple",
          type: "implementation"
        }
      ]
    }
  ];
  
  const filteredDocuments = documentSections.find(section => section.id === activeTab)?.documents || [];
  
  return (
    <>
      <PageContainer 
        title="ATMF"
        subtitle="Access comprehensive documentation about the Adaptive Testing Maturity Framework (ATMF)"
      >
        <Tabs defaultValue="framework" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-white/10 mb-6">
            <TabsList className="bg-transparent border-b-0">
              {documentSections.map((section) => (
                <TabsTrigger 
                  key={section.id} 
                  value={section.id}
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-primary data-[state=active]:border-b-2 rounded-none border-b-2 border-transparent px-4 py-2"
                >
                  {section.title}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          
          {documentSections.map((section) => (
            <TabsContent key={section.id} value={section.id} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.documents.map((doc) => (
                  <ATMFCard key={doc.id} neonEffect={doc.color} className="flex flex-col h-full">
                    <div className="p-6 flex-1">
                      <div className="flex items-start mb-4">
                        <IconWrapper color={doc.color} size="md">
                          {doc.icon}
                        </IconWrapper>
                      </div>
                      <h3 className="text-lg font-semibold mb-2">{doc.title}</h3>
                      <p className="text-sm text-text-muted mb-4">{doc.description}</p>
                    </div>
                    <div className="px-6 pb-6 mt-auto">
                      <Button 
                        className="w-full justify-between group" 
                        onClick={() => setSelectedDocument({ id: doc.id, title: doc.title })}
                      >
                        Read Document
                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </div>
                  </ATMFCard>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
        
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Recent Updates</h2>
          <div className="glassmorphism border border-white/10 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Book className="h-5 w-5 text-primary" />
                </div>
                <div className="ml-4">
                  <div className="flex items-center">
                    <h3 className="font-medium">AI Ethics Supplement Updated</h3>
                    <span className="ml-2 text-xs bg-[#2FFFAA]/20 text-[#2FFFAA] px-2 py-0.5 rounded-full">New</span>
                  </div>
                  <p className="text-sm text-text-muted mt-1">Added new section on Responsible AI Testing Patterns and updated compliance guidance.</p>
                  <p className="text-xs text-text-muted mt-2">Updated 3 days ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-[#8A56FF]/20 flex items-center justify-center flex-shrink-0">
                  <Users className="h-5 w-5 text-[#8A56FF]" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">New Case Study: Healthcare Implementation</h3>
                  <p className="text-sm text-text-muted mt-1">Added detailed case study of ATMF implementation in a healthcare organization.</p>
                  <p className="text-xs text-text-muted mt-2">Updated 1 week ago</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="h-10 w-10 rounded-full bg-[#2E75FF]/20 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-5 w-5 text-[#2E75FF]" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium">Framework Comparison Updated</h3>
                  <p className="text-sm text-text-muted mt-1">Updated comparison matrix with the latest industry standards and frameworks.</p>
                  <p className="text-xs text-text-muted mt-2">Updated 2 weeks ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6">Popular Resources</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glassmorphism border border-white/10 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-medium mb-2">Getting Started Guide</h3>
              <p className="text-sm text-text-muted mb-4 flex-1">Quick introduction to ATMF for new practitioners and organizations.</p>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => setSelectedDocument({ id: "core-framework", title: "Getting Started with ATMF" })}
              >
                View Guide
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="glassmorphism border border-white/10 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-medium mb-2">Assessment Templates</h3>
              <p className="text-sm text-text-muted mb-4 flex-1">Ready-to-use templates for conducting ATMF maturity assessments.</p>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => setSelectedDocument({ id: "assessment-templates", title: "Assessment Templates" })}
              >
                Download Templates
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            
            <div className="glassmorphism border border-white/10 rounded-xl p-6 flex flex-col">
              <h3 className="text-lg font-medium mb-2">Certification Guide</h3>
              <p className="text-sm text-text-muted mb-4 flex-1">Information about ATMF certification process for individuals and organizations.</p>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                onClick={() => setSelectedDocument({ id: "core-framework", title: "ATMF Certification Guide" })}
              >
                Explore Certification
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </PageContainer>
      
      {selectedDocument && (
        <DocumentViewer
          documentId={selectedDocument.id}
          title={selectedDocument.title}
          onClose={() => setSelectedDocument(null)}
        />
      )}
    </>
  );
}