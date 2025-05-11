/**
 * Handler for the whisper suggestions API endpoint
 * - For settings page: Checks Jira and GitHub integration status
 * - For projects page: Analyzes project organization and activity
 * - For other pages: Uses standard AI-generated suggestions
 */

import { Request, Response } from "express";
import { generateWhisperSuggestions } from "../openai-service";
import { storage } from "../storage";

export async function handleWhisperSuggestions(req: Request, res: Response) {
  try {
    const { projectId, projectName, contextPath, contextData } = req.body;
    
    // Check for required parameters
    if (!projectId && !projectName) {
      return res.status(400).json({ 
        message: "Either projectId or projectName is required" 
      });
    }
    
    // If projectId is provided, fetch the full project details
    if (projectId) {
      const project = await storage.getProject(parseInt(projectId));
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      
      // For projects page, add extra context data about project counts and activity
      let enhancedContextData = contextData || {};
      
      if (contextPath && contextPath.includes("projects")) {
        try {
          // Get all projects to analyze
          const allProjects = await storage.getProjects();
          
          // Compute active and archived project counts
          const activeProjects = allProjects.filter(p => p.status !== "archived");
          const archivedProjects = allProjects.filter(p => p.status === "archived");
          
          // Find projects that haven't been updated in over 20 days
          const now = new Date();
          const inactiveProjects = activeProjects.filter(p => {
            if (!p.updatedAt) return false;
            const lastUpdated = new Date(p.updatedAt);
            const diffDays = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
            return diffDays > 20;
          });
          
          // Add project organization data to context
          enhancedContextData = {
            ...enhancedContextData,
            activeProjectsCount: activeProjects.length,
            archivedProjectsCount: archivedProjects.length,
            inactiveProjectsCount: inactiveProjects.length,
            inactiveProjectNames: inactiveProjects.map(p => p.name),
            totalProjects: allProjects.length
          };
          
          console.log("Enhanced context data for projects page:", enhancedContextData);
        } catch (error) {
          console.error("Error enhancing context data for projects page:", error);
        }
      }
      
      // For settings page, check Jira and GitHub integration status
      if (contextPath && contextPath.includes("settings")) {
        try {
          // Check Jira integration
          const hasJiraIntegration = Boolean(
            project.jiraUrl && 
            project.jiraProjectId && 
            project.jiraApiKey
          );
          
          // Check GitHub integration
          const hasGitHubIntegration = Boolean(
            project.githubRepo && 
            project.githubToken
          );
          
          // Add integration status to context
          enhancedContextData = {
            ...enhancedContextData,
            hasJiraIntegration,
            hasGitHubIntegration,
            integrationsConfigured: hasJiraIntegration && hasGitHubIntegration,
            missingIntegrations: []
          };
          
          // Add list of missing integrations
          if (!hasJiraIntegration) {
            enhancedContextData.missingIntegrations.push('Jira');
          }
          
          if (!hasGitHubIntegration) {
            enhancedContextData.missingIntegrations.push('GitHub');
          }
          
          console.log("Enhanced context data for settings page:", enhancedContextData);
        } catch (error) {
          console.error("Error enhancing context data for settings page:", error);
        }
      }
      
      console.log(`Whisper API called for project ID: ${projectId} - ${project.name}, path: ${contextPath}`);
      
      // Use real AI-generated suggestions based on project data
      const suggestions = await generateWhisperSuggestions(
        project,
        contextPath || "",
        enhancedContextData
      );
      
      return res.json(suggestions);
    }
    
    // Fallback for backward compatibility if only projectName is provided
    const projects = await storage.getProjects();
    const project = projects.find(p => p.name === projectName);
    
    if (project) {
      console.log(`Whisper API called for project name: ${projectName} (ID: ${project.id}), path: ${contextPath}`);
      
      // Add specialized context based on page
      let enhancedContextData = contextData || {};
      
      // Use real AI-generated suggestions based on project data
      const suggestions = await generateWhisperSuggestions(
        project,
        contextPath || "",
        enhancedContextData
      );
      
      return res.json(suggestions);
    }
    
    // Fallback to static suggestions for backward compatibility
    console.log("Whisper API called for project:", projectName, "path:", contextPath);
    
    const suggestions = {
      suggestions: [
        `Monitor battery usage in ${projectName} devices`,
        "Implement regular OTA update tests",
        "Add security penetration tests to pipeline"
      ],
      priority: "medium"
    };
    
    res.json(suggestions);
  } catch (error) {
    console.error("Error generating whisper suggestions:", error);
    res.status(500).json({ 
      message: "Failed to generate whisper suggestions",
      suggestions: [],
      priority: "low"
    });
  }
}