import { Request, Response } from "express";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { projects } from "@shared/schema";
import { analyzeDocumentContent } from "../openai-service";

// Handle document analysis API request
export async function handleDocumentAnalysis(req: Request, res: Response) {
  try {
    const { content, fileName, fileType, projectId } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: "Document content is required" });
    }
    
    // Get project type if project ID is provided
    let projectType = "general";
    if (projectId) {
      const project = await db.query.projects.findFirst({
        where: eq(projects.id, projectId),
      });
      
      if (project) {
        projectType = project.projectType || "general";
      }
    }
    
    console.log(`Document analysis API called for file: ${fileName}, type: ${fileType}, project type: ${projectType}`);
    
    // Call the OpenAI service to analyze the document
    const analysisResult = await analyzeDocumentContent(
      content,
      fileName || "document",
      fileType || "text/plain",
      projectType
    );
    
    return res.json(analysisResult);
  } catch (error) {
    console.error("Error in document analysis API:", error);
    return res.status(500).json({ 
      error: "Failed to analyze document", 
      suggestedTags: [],
      description: "An error occurred while analyzing the document."
    });
  }
}