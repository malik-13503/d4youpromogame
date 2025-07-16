import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertRegistrationSchema, loginSchema, updateUserSchema } from "@shared/schema";
import { z } from "zod";
import { sendWinnerEmail, sendTestEmail, WinnerEmailData } from "./emailTemplates";
import path from "path";

// Extend Request type to include session
interface AuthRequest extends Request {
  session: any;
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize default admin user
  await storage.createDefaultAdmin();

  // Authentication middleware
  const requireAuth = async (req: AuthRequest, res: Response, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/auth/login", async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(validatedData.username);
      if (!user || user.password !== validatedData.password) {
        return res.status(401).json({ 
          message: "Invalid username or password" 
        });
      }
      
      // Store user session
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({ 
        message: "Login successful", 
        user: { id: user.id, username: user.username, role: user.role }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data provided", 
          errors: error.errors 
        });
      }
      
      console.error("Login error:", error);
      res.status(500).json({ 
        message: "Login failed. Please try again." 
      });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req: AuthRequest, res: Response) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check auth status
  app.get("/api/auth/me", async (req: AuthRequest, res: Response) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await storage.getUser(req.session.userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({ 
      user: { id: user.id, username: user.username, role: user.role }
    });
  });

  // Registration endpoint
  app.post("/api/register", async (req, res) => {
    try {
      const validatedData = insertRegistrationSchema.parse(req.body);
      
      // Check duplicate email setting
      const emailCheckSetting = await storage.getSetting('duplicate_email_check');
      const emailCheckEnabled = emailCheckSetting?.value === 'true';
      
      if (emailCheckEnabled) {
        const existingRegistration = await storage.getRegistrationByEmail(validatedData.email);
        if (existingRegistration) {
          return res.status(400).json({ 
            message: "Email already registered. Please use a different email address." 
          });
        }
      }
      
      const registration = await storage.createRegistration(validatedData);
      res.json({ 
        message: "Registration successful!", 
        id: registration.id 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data provided", 
          errors: error.errors 
        });
      }
      
      console.error("Registration error:", error);
      res.status(500).json({ 
        message: "Failed to register. Please try again." 
      });
    }
  });

  // Get registration count for trust indicator
  app.get("/api/stats", async (req, res) => {
    try {
      const count = await storage.getRegistrationCount();
      res.json({ registrationCount: count });
    } catch (error) {
      console.error("Stats error:", error);
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  // Admin routes (protected)
  app.get("/api/admin/registrations", requireAuth, async (req, res) => {
    try {
      const registrations = await storage.getAllRegistrations();
      res.json(registrations);
    } catch (error) {
      console.error("Admin registrations error:", error);
      res.status(500).json({ message: "Failed to fetch registrations" });
    }
  });

  app.delete("/api/admin/registrations/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid registration ID" });
      }
      
      await storage.deleteRegistration(id);
      res.json({ message: "Registration deleted successfully" });
    } catch (error) {
      console.error("Admin delete error:", error);
      res.status(500).json({ message: "Failed to delete registration" });
    }
  });

  // Bulk delete registrations
  app.post("/api/admin/registrations/bulk-delete", requireAuth, async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ message: "Invalid or empty IDs array" });
      }

      // Validate all IDs are numbers
      const validIds = ids.filter(id => typeof id === 'number' && !isNaN(id));
      if (validIds.length !== ids.length) {
        return res.status(400).json({ message: "All IDs must be valid numbers" });
      }

      await storage.bulkDeleteRegistrations(validIds);
      res.json({ message: `${validIds.length} registrations deleted successfully` });
    } catch (error) {
      console.error("Bulk delete error:", error);
      res.status(500).json({ message: "Failed to delete registrations" });
    }
  });

  // Update admin credentials
  app.put("/api/admin/update-credentials", requireAuth, async (req: AuthRequest, res: Response) => {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const updatedUser = await storage.updateUser(userId!, validatedData);
      
      // Update session if username changed
      if (validatedData.username) {
        req.session.username = validatedData.username;
      }
      
      res.json({ 
        message: "Credentials updated successfully",
        user: { id: updatedUser.id, username: updatedUser.username, role: updatedUser.role }
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data provided", 
          errors: error.errors 
        });
      }
      
      console.error("Update credentials error:", error);
      res.status(500).json({ 
        message: "Failed to update credentials" 
      });
    }
  });

  // Email routes
  app.post("/api/email/winner", async (req, res) => {
    try {
      const winnerEmailSchema = z.object({
        userEmail: z.string().email(),
        userName: z.string().min(1),
        prizeName: z.string().min(1),
        prizeValue: z.string().min(1),
        phoneNumber: z.string().min(1)
      });

      const validatedData = winnerEmailSchema.parse(req.body);
      
      const success = await sendWinnerEmail(validatedData);
      
      if (success) {
        res.json({ message: "Winner email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send winner email" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data provided", 
          errors: error.errors 
        });
      }
      
      console.error("Email sending error:", error);
      res.status(500).json({ message: "Failed to send email" });
    }
  });

  // Test email route (for testing purposes)
  app.post("/api/email/test", async (req, res) => {
    try {
      const testEmailSchema = z.object({
        email: z.string().email()
      });

      const { email } = testEmailSchema.parse(req.body);
      
      const success = await sendTestEmail(email);
      
      if (success) {
        res.json({ message: "Test email sent successfully" });
      } else {
        res.status(500).json({ message: "Failed to send test email" });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid email format", 
          errors: error.errors 
        });
      }
      
      console.error("Test email error:", error);
      res.status(500).json({ message: "Failed to send test email" });
    }
  });

  // Public settings routes (for frontend consumption)
  app.get("/api/settings/video_requirement_enabled", async (req, res) => {
    try {
      const setting = await storage.getSetting("video_requirement_enabled");
      
      if (!setting) {
        // Default to true if setting doesn't exist
        res.json({ value: "true" });
      } else {
        res.json(setting);
      }
    } catch (error) {
      console.error("Setting fetch error:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  // Settings routes (admin protected)
  app.get("/api/admin/settings", requireAuth, async (req, res) => {
    try {
      const settings = await storage.getAllSettings();
      res.json(settings);
    } catch (error) {
      console.error("Settings fetch error:", error);
      res.status(500).json({ message: "Failed to fetch settings" });
    }
  });

  app.get("/api/admin/settings/:key", requireAuth, async (req, res) => {
    try {
      const { key } = req.params;
      const setting = await storage.getSetting(key);
      
      if (!setting) {
        return res.status(404).json({ message: "Setting not found" });
      }
      
      res.json(setting);
    } catch (error) {
      console.error("Setting fetch error:", error);
      res.status(500).json({ message: "Failed to fetch setting" });
    }
  });

  app.put("/api/admin/settings/:key", requireAuth, async (req, res) => {
    try {
      const { key } = req.params;
      const updateSettingSchema = z.object({
        value: z.string(),
        description: z.string().optional(),
      });
      
      const { value, description } = updateSettingSchema.parse(req.body);
      
      const setting = await storage.setSetting(key, value, description);
      res.json({ message: "Setting updated successfully", setting });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid data provided", 
          errors: error.errors 
        });
      }
      
      console.error("Setting update error:", error);
      res.status(500).json({ message: "Failed to update setting" });
    }
  });

  // Serve logo image
  app.get("/logo.png", (req, res) => {
    const logoPath = path.resolve("attached_assets/logo_1752555507955.png");
    res.sendFile(logoPath, (err) => {
      if (err) {
        console.error("Error serving logo:", err);
        res.status(404).send("Logo not found");
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
