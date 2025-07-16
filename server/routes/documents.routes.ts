import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { z } from "zod";
import { insertDocumentSchema } from "@shared/schema";
import { requireAuth } from "./auth.routes";

export function registerDocumentRoutes(app: Express) {
  // Documents CRUD
  app.get("/api/documents", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
      const type = req.query.type as string | undefined;
      const searchTerm = req.query.search as string | undefined;
      
      const documents = await storage.getDocuments({ 
        projectId, 
        folderId, 
        type, 
        searchTerm 
      });
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.get("/api/documents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const document = await storage.getDocument(id);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error fetching document:", error);
      res.status(500).json({ message: "Failed to fetch document" });
    }
  });

  app.post("/api/documents", requireAuth, async (req, res) => {
    try {
      const documentData = insertDocumentSchema.parse(req.body);
      const document = await storage.createDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid document data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create document" });
      }
    }
  });

  app.put("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const documentData = insertDocumentSchema.partial().parse(req.body);
      const document = await storage.updateDocument(id, documentData);
      
      if (!document) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.json(document);
    } catch (error) {
      console.error("Error updating document:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          message: "Invalid document data", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to update document" });
      }
    }
  });

  app.delete("/api/documents/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteDocument(id);
      
      if (!result) {
        return res.status(404).json({ message: "Document not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document:", error);
      res.status(500).json({ message: "Failed to delete document" });
    }
  });

  // Document folders CRUD
  app.get("/api/document-folders", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      
      const folders = await storage.getDocumentFolders({ projectId, parentId });
      res.json(folders);
    } catch (error) {
      console.error("Error fetching document folders:", error);
      res.status(500).json({ message: "Failed to fetch document folders" });
    }
  });

  app.post("/api/document-folders", requireAuth, async (req, res) => {
    try {
      const { name, projectId, parentId, description } = req.body;
      
      if (!name || !projectId) {
        return res.status(400).json({ 
          message: "name and projectId are required" 
        });
      }
      
      const folder = await storage.createDocumentFolder({
        name,
        projectId,
        parentId: parentId || null,
        description: description || null
      });
      
      res.status(201).json(folder);
    } catch (error) {
      console.error("Error creating document folder:", error);
      res.status(500).json({ message: "Failed to create document folder" });
    }
  });

  app.put("/api/document-folders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { name, description } = req.body;
      
      const folder = await storage.updateDocumentFolder(id, { name, description });
      
      if (!folder) {
        return res.status(404).json({ message: "Document folder not found" });
      }
      
      res.json(folder);
    } catch (error) {
      console.error("Error updating document folder:", error);
      res.status(500).json({ message: "Failed to update document folder" });
    }
  });

  app.delete("/api/document-folders/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteDocumentFolder(id);
      
      if (!result) {
        return res.status(404).json({ message: "Document folder not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting document folder:", error);
      res.status(500).json({ message: "Failed to delete document folder" });
    }
  });

  // Document analytics and search
  app.get("/api/documents/search", async (req, res) => {
    try {
      const query = req.query.q as string;
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      const type = req.query.type as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      
      const results = await storage.searchDocuments({
        query,
        projectId,
        type,
        limit
      });
      
      res.json(results);
    } catch (error) {
      console.error("Error searching documents:", error);
      res.status(500).json({ message: "Failed to search documents" });
    }
  });

  app.get("/api/documents/analytics", async (req, res) => {
    try {
      const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
      
      if (!projectId) {
        return res.status(400).json({ message: "projectId is required" });
      }
      
      const analytics = await storage.getDocumentAnalytics(projectId);
      res.json(analytics);
    } catch (error) {
      console.error("Error fetching document analytics:", error);
      res.status(500).json({ message: "Failed to fetch document analytics" });
    }
  });
}