import React, { useState, useEffect } from "react";
import { X, ArrowLeft, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconWrapper } from "@/components/design-system/icon-wrapper";

interface DocumentViewerProps {
  documentId: string;
  title: string;
  onClose: () => void;
}

// Map document IDs to their file paths - using relative URLs
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
        
        // Create a sample markdown document for demonstration purposes
        // In a real scenario, you would fetch this from an API or file system
        let mockContent = '';
        
        if (documentId === 'core-framework') {
          mockContent = `# Adaptive Testing Maturity Framework (ATMF)

## Overview

The Adaptive Testing Maturity Framework (ATMF) is a revolutionary approach to software testing maturity that embraces AI-driven innovation while maintaining human-centric quality principles. Unlike traditional frameworks, ATMF focuses on adaptability to changing technology landscapes.

## Core Principles

1. **Continuous Adaptation** - Testing practices must evolve alongside development methodologies and technologies
2. **AI Augmentation** - Leverage AI to enhance, not replace, human testing expertise
3. **Data-Driven Decisions** - Use metrics and analytics to inform testing strategies
4. **Cross-Functional Collaboration** - Break down silos between testing, development, and operations

## Maturity Dimensions

ATMF evaluates testing maturity across five key dimensions:

* **Automation Intelligence** - Smart test automation that goes beyond simple record/playback
* **Test Design Evolution** - Advanced test case design methodologies including model-based and exploratory testing
* **Infrastructure Resilience** - Test environment stability and on-demand provisioning
* **Quality Metrics & Analytics** - Comprehensive measurement of test effectiveness and product quality
* **Organizational Alignment** - How well testing integrates into the broader development process

## Implementation Guide

### Step 1: Assessment

Begin with a comprehensive evaluation of your current testing practices against the ATMF dimensions.

### Step 2: Roadmap Development

Create a prioritized improvement plan based on identified gaps.

### Step 3: Incremental Implementation

Follow an agile approach to implementing changes, with regular feedback loops.

### Step 4: Continuous Monitoring

Establish metrics to track progress and adjust the approach as needed.`;
        } else if (documentId === 'framework-comparison') {
          mockContent = `# Framework Comparison: ATMF vs. Traditional Testing Frameworks

## Introduction

This document provides a comparative analysis between the Adaptive Testing Maturity Framework (ATMF) and traditional testing frameworks including TMMi, TPI, and ISO/IEC/IEEE 29119.

## Comparison Matrix

| Feature | ATMF | TMMi | TPI | ISO/IEC/IEEE 29119 |
|---------|------|------|-----|-------------------|
| AI Integration | ★★★★★ | ★☆☆☆☆ | ★★☆☆☆ | ★☆☆☆☆ |
| Adaptability | ★★★★★ | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ |
| DevOps Alignment | ★★★★☆ | ★★☆☆☆ | ★★★☆☆ | ★★☆☆☆ |
| Implementation Complexity | ★★☆☆☆ | ★★★★★ | ★★★★☆ | ★★★★★ |
| Industry Adoption | ★★☆☆☆ | ★★★★☆ | ★★★★☆ | ★★★☆☆ |

## Key Differences

### ATMF vs. TMMi

TMMi follows a staged approach with 5 maturity levels, while ATMF uses a continuous dimensional approach that allows organizations to advance in specific areas based on their needs.

### ATMF vs. TPI

TPI provides a more prescriptive approach with specific key areas and checkpoints. ATMF focuses more on adaptability and integration of modern testing practices.

### ATMF vs. ISO/IEC/IEEE 29119

ISO/IEC/IEEE 29119 provides a comprehensive set of standards for software testing but lacks specific guidance on emerging technologies like AI. ATMF is built with these technologies at its core.

## Adoption Considerations

When choosing between ATMF and traditional frameworks, consider:

1. Your organization's current technological maturity
2. The pace of change in your industry
3. Your reliance on emerging technologies like AI and ML
4. Your development methodology (Agile, DevOps, etc.)`;
        } else if (documentId === 'ai-ethics') {
          mockContent = `# AI Ethics and Governance in Testing

## Introduction

This supplement to the ATMF framework addresses the ethical considerations and governance frameworks necessary for responsible AI implementation in testing processes.

## Core Principles

### Transparency

All AI-driven testing systems should be explainable, with clear documentation on how decisions are made.

### Fairness

AI systems should be tested for bias and ensure equitable outcomes across different user groups.

### Privacy

Test data used for AI training must protect user privacy and comply with relevant regulations.

### Human Oversight

AI systems should augment human testers, not replace critical thinking and judgment.

## Governance Framework

### Policy Development

1. Establish clear policies for AI use in testing
2. Define boundaries for AI decision-making
3. Create escalation paths for ethical concerns

### Implementation Oversight

1. Regular ethical reviews of AI testing systems
2. Cross-functional governance committee
3. Continuous monitoring for unintended consequences

## Risk Assessment Model

| Risk Category | Examples | Mitigation Strategies |
|---------------|----------|----------------------|
| Bias | Gender bias in UI testing | Diverse training data, fairness metrics |
| Privacy | Exposing PII in test data | Anonymization, synthetic data |
| Security | Model poisoning | Adversarial testing, model validation |
| Transparency | Black-box testing decisions | Explainability tools, decision logging |

## Responsible AI Testing Patterns

### Pattern 1: Ethical Test Data Management

Techniques for creating representative test data that doesn't perpetuate biases.

### Pattern 2: Explainable Test Results

Methods for ensuring AI-generated test results can be understood by humans.

### Pattern 3: Continuous Ethical Monitoring

Processes for ongoing evaluation of AI testing systems for ethical concerns.

## Regulatory Compliance

Guidelines for ensuring AI testing practices comply with:

* EU AI Act
* GDPR
* Industry-specific regulations
* Corporate ethical standards`;
        } else if (documentId === 'case-studies') {
          mockContent = `# ATMF Implementation Case Studies

## Financial Services: Global Banking Corporation

### Background
Global Banking Corporation (GBC) is a multinational financial institution with over 50,000 employees and 20 million customers worldwide.

### Challenges
* Legacy testing processes focused on manual regression
* Siloed testing teams across different banking products
* Regulatory compliance requirements creating testing bottlenecks
* Growing backlog of automated test maintenance

### ATMF Implementation
GBC adopted ATMF with an initial focus on the Automation Intelligence and Quality Metrics dimensions.

**Key initiatives:**
1. Consolidated test automation frameworks across products
2. Implemented AI-driven test selection to reduce regression testing time
3. Created unified quality dashboard for executive visibility
4. Established cross-functional testing guilds

### Results
* 65% reduction in regression testing time
* 40% improvement in defect detection efficiency
* $3.2M annual cost savings from reduced manual testing
* Regulatory compliance testing time reduced by 50%

## Healthcare: MediTech Solutions

### Background
MediTech Solutions develops electronic health record systems used by hospitals and clinics nationwide.

### Challenges
* High-risk domain requiring extensive validation
* Complex integration testing requirements
* Limited testing environments
* Strict data privacy constraints

### ATMF Implementation
MediTech focused primarily on Infrastructure Resilience and Test Design Evolution dimensions.

**Key initiatives:**
1. Implemented containerized test environments with synthetic patient data
2. Adopted model-based testing for complex clinical workflows
3. Created specialized performance testing framework for critical patient-facing systems
4. Developed risk-based testing strategy using AI for risk assessment

### Results
* Testing environment provisioning time reduced from weeks to hours
* Test coverage increased by 35% while reducing test case count by 20%
* Zero critical defects in production releases for 12 consecutive months
* Achieved regulatory certification in half the usual time

## E-Commerce: ShopDirect

### Background
ShopDirect is a rapidly growing e-commerce platform handling over 5,000 transactions per minute during peak periods.

### Challenges
* Frequent releases (multiple per day)
* Complex microservices architecture
* Seasonal traffic spikes requiring extensive performance testing
* Mobile and web platforms requiring cross-platform testing

### ATMF Implementation
ShopDirect implemented all five ATMF dimensions with a heavy emphasis on Organizational Alignment and Automation Intelligence.

**Key initiatives:**
1. Embedded testers within development teams
2. Implemented visual AI testing for UI verification
3. Created chaos engineering framework for resilience testing
4. Developed self-healing test automation framework

### Results
* Release frequency increased from weekly to daily without quality impact
* 90% reduction in visual regression defects
* Successful handling of 3x normal traffic during sales events with zero downtime
* Testing cycle time reduced from days to hours`;
        } else if (documentId === 'assessment-templates') {
          mockContent = `# ATMF Assessment Templates

## Assessment Overview

These templates provide structured guidance for evaluating your organization's testing maturity across the five ATMF dimensions.

## How to Use These Templates

1. Assemble a cross-functional team including QA, development, and operations
2. Complete each dimensional assessment independently
3. Score each capability on a scale of 1-5
4. Identify gaps and prioritize improvement areas
5. Develop a roadmap for advancing maturity

## Automation Intelligence Assessment

### Capability Evaluation

| Capability | Level 1 | Level 3 | Level 5 | Your Score |
|------------|---------|---------|---------|------------|
| Test Selection | Manual selection | Rule-based selection | AI-driven smart selection | |
| Self-healing | No self-healing | Basic retry logic | Advanced element location strategies | |
| Coverage Analysis | Manual tracking | Automated code coverage | Intelligent feature coverage | |
| Test Generation | Manual scripting | Template-based generation | AI-generated test cases | |
| Maintenance Efficiency | High maintenance | Modular framework | Self-maintaining tests | |

### Qualitative Questions

1. How do you determine which tests to run for each code change?
2. What percentage of test failures are due to environment/test issues vs. actual defects?
3. How do you measure the effectiveness of your automation strategy?

## Test Design Evolution Assessment

### Capability Evaluation

| Capability | Level 1 | Level 3 | Level 5 | Your Score |
|------------|---------|---------|---------|------------|
| Requirements Mapping | Manual traceability | Semi-automated mapping | AI-assisted coverage analysis | |
| Test Modeling | No models | Basic state modeling | Advanced model-based testing | |
| Data-Driven Testing | Hard-coded test data | External data sources | Intelligent test data generation | |
| Exploratory Testing | Ad-hoc exploration | Structured sessions | ML-augmented exploration | |
| Risk-Based Testing | Informal assessment | Structured risk analysis | Predictive risk modeling | |

### Qualitative Questions

1. How do you ensure test cases adequately cover business requirements?
2. What approaches do you use for generating test data?
3. How do you incorporate user journeys into your test design?

## Infrastructure Resilience Assessment

[Additional assessment sections would follow this pattern]`;
        }
        
        if (mockContent) {
          setContent(mockContent);
          setLoading(false);
        } else {
          throw new Error("Document content not available");
        }
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
    let inTable = false;
    let tableHeaders: string[] = [];
    let tableRows: string[][] = [];
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
      
      // Table row detection
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        const cells = line.trim().split('|').slice(1, -1).map(cell => cell.trim());
        
        // Check if this is a header separator row like |---|---|---|
        const isSeparatorRow = cells.every(cell => /^-+$/.test(cell.replace(/:/g, '').trim()));
        
        if (isSeparatorRow) {
          // This is a separator row, just mark that we're in a table
          inTable = true;
        } else if (!inTable) {
          // This is the first row of a new table - it's the header
          inTable = true;
          tableHeaders = cells;
        } else {
          // This is a content row
          tableRows.push(cells);
        }
        return;
      } else if (inTable) {
        // We've exited the table
        const tableElement = (
          <div key={`table-${index}`} className="my-6 w-full overflow-x-auto rounded-lg border border-white/20">
            <table className="w-full border-collapse">
              <thead className="bg-card/80">
                <tr>
                  {tableHeaders.map((header, i) => (
                    <th key={`th-${i}`} className="border-b border-white/20 p-3 text-left font-semibold text-white">
                      {processInlineFormatting(header)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, rowIndex) => (
                  <tr key={`tr-${rowIndex}`} className={rowIndex % 2 === 0 ? "bg-card/60" : "bg-card/30"}>
                    {row.map((cell, cellIndex) => (
                      <td key={`td-${rowIndex}-${cellIndex}`} className="border-t border-white/10 p-3 text-text-muted">
                        {processInlineFormatting(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        
        result.push(tableElement);
        inTable = false;
        tableHeaders = [];
        tableRows = [];
      }
      
      // Regular paragraph
      if (!inOrderedList && !inUnorderedList && !inTable) {
        const processedContent = processInlineFormatting(line);
        result.push(<p key={index} className="my-2 text-gray-300">{processedContent}</p>);
      }
    });
    
    // Close any open lists at the end
    if (inOrderedList || inUnorderedList) {
      result.push(
        inOrderedList 
          ? <ol key="final-ordered-list" className="list-decimal pl-8 my-4 space-y-1">{listItems}</ol>
          : <ul key="final-unordered-list" className="list-disc pl-8 my-4 space-y-1">{listItems}</ul>
      );
    }
    
    // Close any open table at the end
    if (inTable && tableHeaders.length > 0) {
      const tableElement = (
        <div key="final-table" className="my-6 w-full overflow-x-auto rounded-lg border border-white/20">
          <table className="w-full border-collapse">
            <thead className="bg-card/80">
              <tr>
                {tableHeaders.map((header, i) => (
                  <th key={`th-${i}`} className="border-b border-white/20 p-3 text-left font-semibold text-white">
                    {processInlineFormatting(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row, rowIndex) => (
                <tr key={`tr-${rowIndex}`} className={rowIndex % 2 === 0 ? "bg-card/60" : "bg-card/30"}>
                  {row.map((cell, cellIndex) => (
                    <td key={`td-${rowIndex}-${cellIndex}`} className="border-t border-white/10 p-3 text-text-muted">
                      {processInlineFormatting(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      
      result.push(tableElement);
    }
    
    return result;
  };
  
  // Function to process inline formatting (bold, italic, links)
  const processInlineFormatting = (text: string) => {
    if (!text) return null;
    
    // Process bold and italic
    let segments = [];
    let remainingText = text;
    let lastIndex = 0;
    
    // Bold
    const boldRegex = /\*\*(.*?)\*\*/g;
    let boldMatch;
    let segmentIndex = 0;
    
    while ((boldMatch = boldRegex.exec(text)) !== null) {
      if (boldMatch.index > lastIndex) {
        // Add text before the bold part
        segments.push(
          <span key={`text-${segmentIndex++}`}>
            {remainingText.substring(0, boldMatch.index - lastIndex)}
          </span>
        );
      }
      
      // Add the bold part
      segments.push(
        <strong key={`bold-${segmentIndex++}`} className="font-bold">
          {boldMatch[1]}
        </strong>
      );
      
      // Update remaining text
      remainingText = remainingText.substring(boldMatch.index - lastIndex + boldMatch[0].length);
      lastIndex = boldMatch.index + boldMatch[0].length;
    }
    
    // Add any remaining text
    if (remainingText) {
      segments.push(<span key={`text-${segmentIndex++}`}>{remainingText}</span>);
    }
    
    // If no bold matches were found, process italic
    if (segments.length === 0) {
      segments = [<span key="original-text">{text}</span>];
    }
    
    // Process italic in each segment that is a span (not already bold)
    const processedSegments = segments.map((segment, index) => {
      if (segment.type !== 'span') {
        return segment;
      }
      
      const segmentText = segment.props.children;
      if (typeof segmentText !== 'string') {
        return segment;
      }
      
      const italicParts = [];
      let italicRemaining = segmentText;
      let italicLastIndex = 0;
      let italicSegmentIndex = 0;
      
      const italicRegex = /\*(.*?)\*/g;
      let italicMatch;
      
      while ((italicMatch = italicRegex.exec(segmentText)) !== null) {
        if (italicMatch.index > italicLastIndex) {
          // Add text before the italic part
          italicParts.push(
            <span key={`text-${index}-${italicSegmentIndex++}`}>
              {italicRemaining.substring(0, italicMatch.index - italicLastIndex)}
            </span>
          );
        }
        
        // Add the italic part
        italicParts.push(
          <em key={`italic-${index}-${italicSegmentIndex++}`} className="italic">
            {italicMatch[1]}
          </em>
        );
        
        // Update remaining text
        italicRemaining = italicRemaining.substring(italicMatch.index - italicLastIndex + italicMatch[0].length);
        italicLastIndex = italicMatch.index + italicMatch[0].length;
      }
      
      // Add any remaining text
      if (italicRemaining) {
        italicParts.push(
          <span key={`text-${index}-${italicSegmentIndex++}`}>
            {italicRemaining}
          </span>
        );
      }
      
      return italicParts.length > 0 ? <React.Fragment key={`italic-wrapper-${index}`}>{italicParts}</React.Fragment> : segment;
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