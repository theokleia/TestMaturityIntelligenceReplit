import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { storage } from "../../storage";

/**
 * AI Client Manager
 * Handles client initialization and configuration for both OpenAI and Anthropic
 */

export interface AIClientConfig {
  openai: {
    apiKey: string;
    model: string;
  };
  anthropic: {
    apiKey: string;
    model: string;
  };
}

export class AIClientManager {
  private openaiClient: OpenAI | null = null;
  private anthropicClient: Anthropic | null = null;
  private config: AIClientConfig | null = null;

  /**
   * Get OpenAI client with API key from global settings (or fallback to env var)
   */
  async getOpenAIClient(): Promise<OpenAI> {
    if (!this.openaiClient || !this.config) {
      await this.initializeClients();
    }
    return this.openaiClient!;
  }

  /**
   * Get Anthropic client with API key from global settings
   */
  async getAnthropicClient(): Promise<Anthropic> {
    if (!this.anthropicClient || !this.config) {
      await this.initializeClients();
    }
    return this.anthropicClient!;
  }

  /**
   * Get the configured OpenAI model from global settings (or use default)
   */
  async getOpenAIModel(): Promise<string> {
    if (!this.config) {
      await this.initializeClients();
    }
    return this.config!.openai.model;
  }

  /**
   * Get the configured Anthropic model from global settings
   */
  async getAnthropicModel(): Promise<string> {
    if (!this.config) {
      await this.initializeClients();
    }
    return this.config!.anthropic.model;
  }

  /**
   * Initialize both AI clients with configuration from settings
   */
  private async initializeClients(): Promise<void> {
    try {
      this.config = await this.loadConfiguration();
      
      // Initialize OpenAI client
      this.openaiClient = new OpenAI({ 
        apiKey: this.config.openai.apiKey 
      });

      // Initialize Anthropic client
      this.anthropicClient = new Anthropic({ 
        apiKey: this.config.anthropic.apiKey 
      });

      console.log("AI clients initialized successfully");
    } catch (error) {
      console.error("Error initializing AI clients:", error);
      throw new Error("Failed to initialize AI clients");
    }
  }

  /**
   * Load AI configuration from global settings with fallbacks
   */
  private async loadConfiguration(): Promise<AIClientConfig> {
    const config: AIClientConfig = {
      openai: {
        apiKey: process.env.OPENAI_API_KEY || '',
        model: 'gpt-4o' // Default model
      },
      anthropic: {
        apiKey: process.env.ANTHROPIC_API_KEY || '',
        model: 'claude-3-7-sonnet-20250219' // Default model
      }
    };

    try {
      // Try to get OpenAI settings from database
      const openaiKeySettings = await storage.getGlobalSetting("openai_api_key");
      if (openaiKeySettings?.value) {
        config.openai.apiKey = openaiKeySettings.value;
      }

      const openaiModelSettings = await storage.getGlobalSetting("openai_model");
      if (openaiModelSettings?.value) {
        config.openai.model = openaiModelSettings.value;
      }

      // Try to get Anthropic settings from database
      const anthropicKeySettings = await storage.getGlobalSetting("anthropic_api_key");
      if (anthropicKeySettings?.value) {
        config.anthropic.apiKey = anthropicKeySettings.value;
      }

      const anthropicModelSettings = await storage.getGlobalSetting("anthropic_model");
      if (anthropicModelSettings?.value) {
        config.anthropic.model = anthropicModelSettings.value;
      }

    } catch (dbError) {
      console.warn("Database error when loading AI configuration, using environment variables:", dbError);
    }

    // Validate configuration
    if (!config.openai.apiKey) {
      console.warn("OpenAI API key not found in global settings or environment variables");
    }
    if (!config.anthropic.apiKey) {
      console.warn("Anthropic API key not found in global settings or environment variables");
    }

    return config;
  }

  /**
   * Make OpenAI API call with error handling
   */
  async callOpenAI(
    messages: Array<{ role: "system" | "user" | "assistant"; content: string }>,
    options: { 
      max_tokens?: number; 
      temperature?: number; 
      response_format?: { type: "json_object" } | { type: "text" } 
    } = {}
  ): Promise<OpenAI.Chat.Completions.ChatCompletion> {
    try {
      const client = await this.getOpenAIClient();
      const model = await this.getOpenAIModel();
      
      return await client.chat.completions.create({
        model,
        messages,
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7,
        response_format: options.response_format
      });
    } catch (error: unknown) {
      console.error("Error calling OpenAI API:", error);
      if (error instanceof Error) {
        throw new Error(`OpenAI API error: ${error.message}`);
      } else {
        throw new Error("Unknown error calling OpenAI API");
      }
    }
  }

  /**
   * Make Anthropic API call with error handling
   */
  async callAnthropic(
    messages: Array<{ role: "user" | "assistant"; content: string }>,
    systemPrompt?: string,
    options: { 
      max_tokens?: number; 
      temperature?: number;
    } = {}
  ): Promise<Anthropic.Messages.Message> {
    try {
      const client = await this.getAnthropicClient();
      const model = await this.getAnthropicModel();
      
      const requestParams: Anthropic.Messages.MessageCreateParams = {
        model,
        messages,
        max_tokens: options.max_tokens || 1000,
        temperature: options.temperature || 0.7
      };

      if (systemPrompt) {
        requestParams.system = systemPrompt;
      }
      
      return await client.messages.create(requestParams);
    } catch (error: unknown) {
      console.error("Error calling Anthropic API:", error);
      if (error instanceof Error) {
        throw new Error(`Anthropic API error: ${error.message}`);
      } else {
        throw new Error("Unknown error calling Anthropic API");
      }
    }
  }

  /**
   * Refresh clients with updated configuration
   */
  async refreshClients(): Promise<void> {
    this.openaiClient = null;
    this.anthropicClient = null;
    this.config = null;
    await this.initializeClients();
  }
}

// Singleton instance
export const aiClientManager = new AIClientManager();