import type { Express, Request, Response } from "express";
import { storage } from "../storage";
import { requireAuth, requireAdmin } from "./auth.routes";

export function registerSettingsRoutes(app: Express) {
  // Global settings routes - protected for admin use
  app.get("/api/global-settings", requireAdmin, async (req, res) => {
    try {
      const category = req.query.category as string | undefined;
      const settings = await storage.getGlobalSettings(category);
      res.json(settings);
    } catch (error) {
      console.error("Error fetching global settings:", error);
      res.status(500).json({ message: "Failed to fetch global settings" });
    }
  });
  
  app.get("/api/global-settings/:key", requireAdmin, async (req, res) => {
    try {
      const key = req.params.key;
      const setting = await storage.getGlobalSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: `Setting with key '${key}' not found` });
      }
      
      res.json(setting);
    } catch (error) {
      console.error(`Error fetching global setting '${req.params.key}':`, error);
      res.status(500).json({ message: "Failed to fetch global setting" });
    }
  });
  
  app.post("/api/global-settings", requireAdmin, async (req, res) => {
    try {
      const setting = req.body;
      const result = await storage.createGlobalSetting(setting);
      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating global setting:", error);
      res.status(500).json({ message: "Failed to create global setting" });
    }
  });
  
  app.patch("/api/global-settings/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const setting = req.body;
      const result = await storage.updateGlobalSetting(id, setting);
      
      if (!result) {
        return res.status(404).json({ message: `Setting with id ${id} not found` });
      }
      
      res.json(result);
    } catch (error) {
      console.error(`Error updating global setting ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to update global setting" });
    }
  });

  app.delete("/api/global-settings/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storage.deleteGlobalSetting(id);
      
      if (!result) {
        return res.status(404).json({ message: `Setting with id ${id} not found` });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error(`Error deleting global setting ${req.params.id}:`, error);
      res.status(500).json({ message: "Failed to delete global setting" });
    }
  });
}