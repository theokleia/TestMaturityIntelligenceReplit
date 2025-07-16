import type { Express, Request, Response } from "express";
import { setupAuth } from "../auth";

// Authentication middleware
export function requireAuth(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

// Admin authentication middleware
export function requireAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Unauthorized. Admin access required." });
  }
  
  next();
}

export function registerAuthRoutes(app: Express) {
  // Setup authentication
  setupAuth(app);

  // User profile routes
  app.get("/api/user", requireAuth, async (req, res) => {
    try {
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      res.status(500).json({ message: "Failed to fetch user profile" });
    }
  });

  app.put("/api/user/profile", requireAuth, async (req, res) => {
    try {
      // Update user profile logic would go here
      res.json({ message: "Profile updated successfully" });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });
}