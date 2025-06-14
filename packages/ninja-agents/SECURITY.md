# Security Guide - Ninja Agents SDK

This guide provides comprehensive security guidelines and best practices for implementing secure applications with the Ninja Agents SDK.

## 🔒 Security Overview

The Ninja Agents SDK handles sensitive data including API keys, user inputs, and AI-generated content. Proper security implementation is crucial for protecting your application and users.

### Security Principles

1. **Defense in Depth**: Multiple layers of security controls
2. **Least Privilege**: Minimal necessary permissions and access
3. **Input Validation**: Comprehensive validation of all inputs
4. **Secure by Default**: Safe default configurations
5. **Audit and Monitoring**: Comprehensive logging and monitoring

## 🔑 API Key Security

### 1. Secure Storage

#### Environment Variables
```bash
# ✅ Good: Use environment variables
OPENAI_API_KEY=sk-your-actual-api-key-here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# ❌ Bad: Never commit API keys to version control
# OPENAI_API_KEY=sk-1234567890abcdef
```

#### Secure Configuration
```typescript
// ✅ Good: Validate API key presence and format
function validateApiKey(apiKey: string | undefined): string {
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is required');
  }
  
  if (!apiKey.startsWith('sk-')) {
    throw new Error('Invalid OpenAI API key format');
  }
  
  if (apiKey.length < 20) {
    throw new Error('OpenAI API key appears to be invalid');
  }
  
  return apiKey;
}

const openai = new OpenAI({
  apiKey: validateApiKey(process.env.OPENAI_API_KEY)
});
```

#### Key Rotation
```typescript
// ✅ Good: Support for key rotation
class SecureApiKeyManager {
  private currentKey: string;
  private backupKey?: string;
  
  constructor() {
    this.currentKey = validateApiKey(process.env.OPENAI_API_KEY);
    this.backupKey = process.env.OPENAI_API_KEY_BACKUP;
  }
  
  getCurrentKey(): string {
    return this.currentKey;
  }
  
  async rotateKey(newKey: string): Promise<void> {
    validateApiKey(newKey);
    this.backupKey = this.currentKey;
    this.currentKey = newKey;
    
    // Test new key
    const testClient = new OpenAI({ apiKey: newKey });
    await testClient.models.list();
    
    console.log('API key rotation successful');
  }
  
  async fallbackToBackup(): Promise<void> {
    if (!this.backupKey) {
      throw new Error('No backup API key available');
    }
    
    this.currentKey = this.backupKey;
    console.log('Fell back to backup API key');
  }
}
```

### 2. Runtime Protection

#### API Key Masking
```typescript
// ✅ Good: Mask API keys in logs
class SecureLogger extends Logger {
  private maskSensitiveData(message: string): string {
    return message
      .replace(/sk-[a-zA-Z0-9]{48}/g, 'sk-***MASKED***')
      .replace(/Bearer sk-[a-zA-Z0-9]{48}/g, 'Bearer sk-***MASKED***')
      .replace(/"apiKey":\s*"[^"]+"/g, '"apiKey": "***MASKED***"');
  }
  
  info(message: string, metadata?: Record<string, any>, ...args: any[]): void {
    const maskedMessage = this.maskSensitiveData(message);
    const maskedMetadata = this.maskMetadata(metadata);
    super.info(maskedMessage, maskedMetadata, ...args);
  }
  
  private maskMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return metadata;
    
    const masked = { ...metadata };
    const sensitiveKeys = ['apiKey', 'token', 'key', 'secret', 'password'];
    
    for (const key of sensitiveKeys) {
      if (key in masked) {
        masked[key] = '***MASKED***';
      }
    }
    
    return masked;
  }
}
```

## 🛡️ Input Validation and Sanitization

### 1. Comprehensive Input Validation

#### Schema-Based Validation
```typescript
import { z } from 'zod';

// ✅ Good: Strict input validation schemas
const userInputSchema = z.object({
  query: z.string()
    .min(1, 'Query cannot be empty')
    .max(10000, 'Query too long')
    .refine(
      (input) => !containsMaliciousPatterns(input),
      'Input contains potentially malicious content'
    ),
  userId: z.string().uuid('Invalid user ID format'),
  sessionId: z.string().uuid('Invalid session ID format').optional(),
  context: z.record(z.any()).optional()
});

function containsMaliciousPatterns(input: string): boolean {
  const maliciousPatterns = [
    // Script injection
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi,
    
    // SQL injection patterns
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b)/gi,
    /(UNION\s+SELECT)/gi,
    /(\bOR\s+1\s*=\s*1\b)/gi,
    
    // Command injection
    /(\b(eval|exec|system|shell_exec)\s*\()/gi,
    /(&&|\|\||\;|\|)/g,
    
    // Path traversal
    /(\.\.\/|\.\.\\)/g,
    
    // XSS patterns
    /on\w+\s*=/gi,
    /<iframe/gi,
    /<object/gi,
    /<embed/gi
  ];
  
  return maliciousPatterns.some(pattern => pattern.test(input));
}
```

#### Secure Shuriken Implementation
```typescript
// ✅ Good: Secure shuriken with comprehensive validation
const secureWebSearchShuriken = new Shuriken(
  'secure_web_search',
  'Perform secure web search with input validation',
  z.object({
    query: z.string()
      .min(1)
      .max(500)
      .refine(query => !containsMaliciousPatterns(query)),
    maxResults: z.number().min(1).max(20).default(5),
    safeSearch: z.boolean().default(true),
    userId: z.string().uuid()
  }),
  async (params) => {
    // Additional runtime validation
    await validateUserPermissions(params.userId, 'web_search');
    
    // Sanitize query
    const sanitizedQuery = sanitizeSearchQuery(params.query);
    
    // Rate limiting
    await checkRateLimit(params.userId, 'web_search');
    
    // Perform search with safety measures
    return await performSecureWebSearch(sanitizedQuery, {
      maxResults: params.maxResults,
      safeSearch: params.safeSearch,
      userId: params.userId
    });
  }
);

async function validateUserPermissions(userId: string, action: string): Promise<void> {
  // Check user permissions in database
  const hasPermission = await checkUserPermission(userId, action);
  if (!hasPermission) {
    throw new Error(`User ${userId} does not have permission for ${action}`);
  }
}

function sanitizeSearchQuery(query: string): string {
  return query
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/['"]/g, '') // Remove quotes
    .replace(/[;&|]/g, '') // Remove command separators
    .trim();
}
```

### 2. Content Filtering

#### Output Sanitization
```typescript
// ✅ Good: Sanitize AI-generated content
class SecureContentFilter {
  private static readonly SENSITIVE_PATTERNS = [
    // Personal information
    /\b\d{3}-\d{2}-\d{4}\b/g, // SSN
    /\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, // Credit card
    /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, // Email
    /\b\d{3}-\d{3}-\d{4}\b/g, // Phone number
    
    // Potentially harmful content
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /data:text\/html/gi
  ];
  
  static sanitizeOutput(content: string): string {
    let sanitized = content;
    
    // Replace sensitive patterns
    this.SENSITIVE_PATTERNS.forEach(pattern => {
      if (pattern.source.includes('\\d{3}-\\d{2}-\\d{4}')) {
        sanitized = sanitized.replace(pattern, '[SSN-REDACTED]');
      } else if (pattern.source.includes('\\d{4}\\s?\\d{4}')) {
        sanitized = sanitized.replace(pattern, '[CARD-REDACTED]');
      } else if (pattern.source.includes('@')) {
        sanitized = sanitized.replace(pattern, '[EMAIL-REDACTED]');
      } else if (pattern.source.includes('\\d{3}-\\d{3}-\\d{4}')) {
        sanitized = sanitized.replace(pattern, '[PHONE-REDACTED]');
      } else {
        sanitized = sanitized.replace(pattern, '[CONTENT-FILTERED]');
      }
    });
    
    return sanitized;
  }
  
  static validateContent(content: string): boolean {
    // Check for prohibited content
    const prohibitedPatterns = [
      /\b(password|secret|token|key)\s*[:=]\s*\S+/gi,
      /\b(api[_-]?key|access[_-]?token)\s*[:=]\s*\S+/gi
    ];
    
    return !prohibitedPatterns.some(pattern => pattern.test(content));
  }
}

// Enhanced Kata with content filtering
class SecureKata extends Kata {
  async execute(userQuery: string): Promise<ExecutionResult<string | any>> {
    // Validate input
    if (!SecureContentFilter.validateContent(userQuery)) {
      throw new Error('Input contains prohibited content');
    }
    
    const result = await super.execute(userQuery);
    
    // Sanitize output
    if (typeof result.result === 'string') {
      result.result = SecureContentFilter.sanitizeOutput(result.result);
    }
    
    return result;
  }
}
```

## 🔐 Authentication and Authorization

### 1. User Authentication

#### JWT Token Validation
```typescript
import jwt from 'jsonwebtoken';

interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
}

class AuthenticationService {
  private readonly jwtSecret: string;
  
  constructor() {
    this.jwtSecret = process.env.JWT_SECRET || (() => {
      throw new Error('JWT_SECRET environment variable is required');
    })();
  }
  
  validateToken(token: string): AuthenticatedUser {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as any;
      
      return {
        userId: decoded.sub,
        email: decoded.email,
        roles: decoded.roles || [],
        permissions: decoded.permissions || []
      };
    } catch (error) {
      throw new Error('Invalid authentication token');
    }
  }
  
  hasPermission(user: AuthenticatedUser, permission: string): boolean {
    return user.permissions.includes(permission) ||
           user.roles.some(role => this.getRolePermissions(role).includes(permission));
  }
  
  private getRolePermissions(role: string): string[] {
    const rolePermissions = {
      'admin': ['*'],
      'user': ['agent.execute', 'agent.query'],
      'readonly': ['agent.query']
    };
    
    return rolePermissions[role] || [];
  }
}
```

#### Secure Runtime with Authentication
```typescript
class AuthenticatedRuntime extends KataRuntime {
  constructor(
    openai: OpenAI,
    logger: Logger,
    memory?: Memory,
    private authService = new AuthenticationService()
  ) {
    super(openai, logger, memory);
  }
  
  async executeWithAuth(
    token: string,
    agent: Shinobi,
    query: string,
    requiredPermission = 'agent.execute'
  ) {
    // Validate authentication
    const user = this.authService.validateToken(token);
    
    // Check permissions
    if (!this.authService.hasPermission(user, requiredPermission)) {
      throw new Error(`Insufficient permissions for ${requiredPermission}`);
    }
    
    // Log authenticated execution
    await this.logger.info('Authenticated execution started', {
      userId: user.userId,
      permission: requiredPermission,
      agentRole: agent.getConfig().role
    });
    
    // Execute with user context
    return await agent.execute(query);
  }
}
```

### 2. Rate Limiting

#### User-Based Rate Limiting
```typescript
class RateLimiter {
  private userRequests = new Map<string, number[]>();
  private readonly windowMs: number;
  private readonly maxRequests: number;
  
  constructor(windowMs = 60000, maxRequests = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    
    // Clean up old entries periodically
    setInterval(() => this.cleanup(), this.windowMs);
  }
  
  checkLimit(userId: string): boolean {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    // Get user's request history
    const userHistory = this.userRequests.get(userId) || [];
    
    // Filter to current window
    const recentRequests = userHistory.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= this.maxRequests) {
      return false;
    }
    
    // Add current request
    recentRequests.push(now);
    this.userRequests.set(userId, recentRequests);
    
    return true;
  }
  
  getRemainingRequests(userId: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const userHistory = this.userRequests.get(userId) || [];
    const recentRequests = userHistory.filter(timestamp => timestamp > windowStart);
    
    return Math.max(0, this.maxRequests - recentRequests.length);
  }
  
  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    
    for (const [userId, timestamps] of this.userRequests.entries()) {
      const recentRequests = timestamps.filter(timestamp => timestamp > windowStart);
      
      if (recentRequests.length === 0) {
        this.userRequests.delete(userId);
      } else {
        this.userRequests.set(userId, recentRequests);
      }
    }
  }
}

// Usage in secure runtime
class RateLimitedRuntime extends AuthenticatedRuntime {
  private rateLimiter = new RateLimiter(60000, 100); // 100 requests per minute
  
  async executeWithAuth(token: string, agent: Shinobi, query: string) {
    const user = this.authService.validateToken(token);
    
    // Check rate limit
    if (!this.rateLimiter.checkLimit(user.userId)) {
      const remaining = this.rateLimiter.getRemainingRequests(user.userId);
      throw new Error(`Rate limit exceeded. ${remaining} requests remaining.`);
    }
    
    return await super.executeWithAuth(token, agent, query);
  }
}
```

## 🔍 Audit and Monitoring

### 1. Security Logging

#### Comprehensive Security Audit Log
```typescript
class SecurityAuditLogger extends Logger {
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    await this.info('Security Event', {
      eventType: event.type,
      severity: event.severity,
      userId: event.userId,
      ipAddress: event.ipAddress,
      userAgent: event.userAgent,
      timestamp: event.timestamp,
      details: event.details,
      riskScore: event.riskScore
    });
    
    // Alert on high-risk events
    if (event.severity === 'HIGH' || event.riskScore > 8) {
      await this.sendSecurityAlert(event);
    }
  }
  
  private async sendSecurityAlert(event: SecurityEvent): Promise<void> {
    // Implement alerting mechanism (email, Slack, PagerDuty, etc.)
    console.error('HIGH RISK SECURITY EVENT:', event);
  }
  
  async logAuthenticationAttempt(
    userId: string,
    success: boolean,
    ipAddress: string,
    userAgent: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'AUTHENTICATION_ATTEMPT',
      severity: success ? 'LOW' : 'MEDIUM',
      userId,
      ipAddress,
      userAgent,
      timestamp: new Date(),
      details: { success },
      riskScore: success ? 1 : 5
    });
  }
  
  async logPermissionDenied(
    userId: string,
    resource: string,
    action: string,
    ipAddress: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'PERMISSION_DENIED',
      severity: 'MEDIUM',
      userId,
      ipAddress,
      userAgent: '',
      timestamp: new Date(),
      details: { resource, action },
      riskScore: 6
    });
  }
  
  async logSuspiciousActivity(
    userId: string,
    activity: string,
    details: Record<string, any>,
    ipAddress: string
  ): Promise<void> {
    await this.logSecurityEvent({
      type: 'SUSPICIOUS_ACTIVITY',
      severity: 'HIGH',
      userId,
      ipAddress,
      userAgent: '',
      timestamp: new Date(),
      details: { activity, ...details },
      riskScore: 8
    });
  }
}

interface SecurityEvent {
  type: 'AUTHENTICATION_ATTEMPT' | 'PERMISSION_DENIED' | 'SUSPICIOUS_ACTIVITY' | 'DATA_ACCESS' | 'SYSTEM_BREACH';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  userId: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  details: Record<string, any>;
  riskScore: number; // 1-10 scale
}
```

### 2. Anomaly Detection

#### Behavioral Analysis
```typescript
class SecurityAnalyzer {
  private userBehaviorProfiles = new Map<string, UserBehaviorProfile>();
  
  async analyzeRequest(
    userId: string,
    request: AgentRequest,
    context: RequestContext
  ): Promise<SecurityAnalysis> {
    const profile = this.getUserProfile(userId);
    const anomalies = await this.detectAnomalies(profile, request, context);
    
    // Update profile with new data
    this.updateProfile(userId, request, context);
    
    return {
      riskScore: this.calculateRiskScore(anomalies),
      anomalies,
      recommendations: this.generateRecommendations(anomalies)
    };
  }
  
  private async detectAnomalies(
    profile: UserBehaviorProfile,
    request: AgentRequest,
    context: RequestContext
  ): Promise<Anomaly[]> {
    const anomalies: Anomaly[] = [];
    
    // Check for unusual request patterns
    if (this.isUnusualRequestFrequency(profile, context)) {
      anomalies.push({
        type: 'UNUSUAL_FREQUENCY',
        severity: 'MEDIUM',
        description: 'Request frequency significantly higher than normal'
      });
    }
    
    // Check for unusual query content
    if (await this.isUnusualQueryContent(profile, request.query)) {
      anomalies.push({
        type: 'UNUSUAL_CONTENT',
        severity: 'HIGH',
        description: 'Query content differs significantly from user\'s normal patterns'
      });
    }
    
    // Check for unusual access times
    if (this.isUnusualAccessTime(profile, context.timestamp)) {
      anomalies.push({
        type: 'UNUSUAL_TIME',
        severity: 'LOW',
        description: 'Access time outside normal usage hours'
      });
    }
    
    // Check for unusual IP address
    if (this.isUnusualIPAddress(profile, context.ipAddress)) {
      anomalies.push({
        type: 'UNUSUAL_LOCATION',
        severity: 'HIGH',
        description: 'Request from unusual IP address or location'
      });
    }
    
    return anomalies;
  }
  
  private calculateRiskScore(anomalies: Anomaly[]): number {
    const severityWeights = { LOW: 1, MEDIUM: 3, HIGH: 7, CRITICAL: 10 };
    const totalScore = anomalies.reduce(
      (sum, anomaly) => sum + severityWeights[anomaly.severity],
      0
    );
    
    return Math.min(10, totalScore);
  }
  
  private generateRecommendations(anomalies: Anomaly[]): string[] {
    const recommendations: string[] = [];
    
    if (anomalies.some(a => a.type === 'UNUSUAL_LOCATION')) {
      recommendations.push('Require additional authentication for this session');
    }
    
    if (anomalies.some(a => a.type === 'UNUSUAL_FREQUENCY')) {
      recommendations.push('Apply stricter rate limiting');
    }
    
    if (anomalies.some(a => a.severity === 'HIGH' || a.severity === 'CRITICAL')) {
      recommendations.push('Flag for manual review');
    }
    
    return recommendations;
  }
}

interface UserBehaviorProfile {
  userId: string;
  normalRequestFrequency: number;
  commonQueryPatterns: string[];
  usualAccessHours: number[];
  knownIPAddresses: string[];
  lastUpdated: Date;
}

interface Anomaly {
  type: 'UNUSUAL_FREQUENCY' | 'UNUSUAL_CONTENT' | 'UNUSUAL_TIME' | 'UNUSUAL_LOCATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
}

interface SecurityAnalysis {
  riskScore: number;
  anomalies: Anomaly[];
  recommendations: string[];
}
```

## 🛡️ Data Protection

### 1. Data Encryption

#### Encryption at Rest
```typescript
import crypto from 'crypto';

class DataEncryption {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32;
  private readonly ivLength = 16;
  private readonly tagLength = 16;
  
  constructor(private encryptionKey: string) {
    if (encryptionKey.length !== this.keyLength * 2) { // Hex string
      throw new Error('Encryption key must be 64 hex characters (32 bytes)');
    }
  }
  
  encrypt(data: string): EncryptedData {
    const iv = crypto.randomBytes(this.ivLength);
    const key = Buffer.from(this.encryptionKey, 'hex');
    
    const cipher = crypto.createCipherGCM(this.algorithm, key, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const tag = cipher.getAuthTag();
    
    return {
      encrypted,
      iv: iv.toString('hex'),
      tag: tag.toString('hex')
    };
  }
  
  decrypt(encryptedData: EncryptedData): string {
    const key = Buffer.from(this.encryptionKey, 'hex');
    const iv = Buffer.from(encryptedData.iv, 'hex');
    const tag = Buffer.from(encryptedData.tag, 'hex');
    
    const decipher = crypto.createDecipherGCM(this.algorithm, key, iv);
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

interface EncryptedData {
  encrypted: string;
  iv: string;
  tag: string;
}

// Secure memory implementation with encryption
class EncryptedMemory extends Memory {
  private encryption: DataEncryption;
  
  constructor(config: MemoryConfig & { encryptionKey: string }) {
    super(config);
    this.encryption = new DataEncryption(config.encryptionKey);
  }
  
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string> {
    // Encrypt sensitive fields
    const encryptedEntry = {
      ...entry,
      message: this.encryption.encrypt(entry.message),
      metadata: entry.metadata ? 
        this.encryption.encrypt(JSON.stringify(entry.metadata)) : 
        undefined
    };
    
    return await super.log(encryptedEntry);
  }
  
  async queryLogs(filters: any): Promise<LogEntry[]> {
    const encryptedLogs = await super.queryLogs(filters);
    
    // Decrypt logs before returning
    return encryptedLogs.map(log => ({
      ...log,
      message: this.encryption.decrypt(log.message as any),
      metadata: log.metadata ? 
        JSON.parse(this.encryption.decrypt(log.metadata as any)) : 
        undefined
    }));
  }
}
```

### 2. Data Minimization

#### Privacy-Preserving Data Handling
```typescript
class PrivacyPreservingMemory extends Memory {
  private readonly retentionPeriods = {
    debug: 7 * 24 * 60 * 60 * 1000,    // 7 days
    info: 30 * 24 * 60 * 60 * 1000,    // 30 days
    warn: 90 * 24 * 60 * 60 * 1000,    // 90 days
    error: 365 * 24 * 60 * 60 * 1000   // 1 year
  };
  
  async log(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<string> {
    // Remove PII before logging
    const sanitizedEntry = this.removePII(entry);
    
    // Set retention period
    const retentionPeriod = this.retentionPeriods[entry.level];
    const expiresAt = new Date(Date.now() + retentionPeriod);
    
    return await super.log({
      ...sanitizedEntry,
      metadata: {
        ...sanitizedEntry.metadata,
        expiresAt: expiresAt.toISOString()
      }
    });
  }
  
  private removePII(entry: Omit<LogEntry, 'id' | 'timestamp'>): typeof entry {
    return {
      ...entry,
      message: this.sanitizePII(entry.message),
      metadata: this.sanitizeMetadata(entry.metadata)
    };
  }
  
  private sanitizePII(text: string): string {
    return text
      // Email addresses
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
      // Phone numbers
      .replace(/\b\d{3}-\d{3}-\d{4}\b/g, '[PHONE]')
      // SSN
      .replace(/\b\d{3}-\d{2}-\d{4}\b/g, '[SSN]')
      // Credit card numbers
      .replace(/\b\d{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/g, '[CARD]')
      // IP addresses
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]');
  }
  
  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return metadata;
    
    const sanitized = { ...metadata };
    const piiFields = ['email', 'phone', 'ssn', 'creditCard', 'address'];
    
    piiFields.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
  
  // Automatic cleanup of expired logs
  async cleanupExpiredLogs(): Promise<void> {
    const now = new Date();
    
    // This would be implemented based on your storage backend
    // For Supabase:
    if (this.supabase) {
      await this.supabase
        .from('logs')
        .delete()
        .lt('metadata->expiresAt', now.toISOString());
    }
  }
}
```

## 🚨 Incident Response

### 1. Security Incident Detection

#### Automated Incident Response
```typescript
class SecurityIncidentManager {
  private incidents = new Map<string, SecurityIncident>();
  
  async handleSecurityEvent(event: SecurityEvent): Promise<void> {
    const incidentId = this.generateIncidentId(event);
    
    // Check if this is part of an existing incident
    const existingIncident = this.findRelatedIncident(event);
    
    if (existingIncident) {
      await this.updateIncident(existingIncident.id, event);
    } else {
      await this.createIncident(incidentId, event);
    }
    
    // Trigger automated response if needed
    await this.triggerAutomatedResponse(event);
  }
  
  private async createIncident(id: string, event: SecurityEvent): Promise<void> {
    const incident: SecurityIncident = {
      id,
      type: this.classifyIncident(event),
      severity: event.severity,
      status: 'OPEN',
      events: [event],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.incidents.set(id, incident);
    
    await this.notifySecurityTeam(incident);
  }
  
  private async triggerAutomatedResponse(event: SecurityEvent): Promise<void> {
    switch (event.type) {
      case 'AUTHENTICATION_ATTEMPT':
        if (event.severity === 'HIGH') {
          await this.lockUserAccount(event.userId);
        }
        break;
        
      case 'SUSPICIOUS_ACTIVITY':
        await this.increaseMonitoring(event.userId);
        break;
        
      case 'SYSTEM_BREACH':
        await this.emergencyShutdown();
        break;
    }
  }
  
  private async lockUserAccount(userId: string): Promise<void> {
    // Implement account locking logic
    console.log(`SECURITY: Locking user account ${userId}`);
  }
  
  private async increaseMonitoring(userId: string): Promise<void> {
    // Implement enhanced monitoring
    console.log(`SECURITY: Increasing monitoring for user ${userId}`);
  }
  
  private async emergencyShutdown(): Promise<void> {
    // Implement emergency procedures
    console.log('SECURITY: Emergency shutdown initiated');
  }
}

interface SecurityIncident {
  id: string;
  type: 'AUTHENTICATION_FAILURE' | 'UNAUTHORIZED_ACCESS' | 'DATA_BREACH' | 'SYSTEM_COMPROMISE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  events: SecurityEvent[];
  createdAt: Date;
  updatedAt: Date;
}
```

## 📋 Security Checklist

### Pre-Production Security Checklist

- [ ] **API Key Security**
  - [ ] API keys stored in environment variables
  - [ ] API keys not committed to version control
  - [ ] API key rotation mechanism implemented
  - [ ] API keys masked in logs

- [ ] **Input Validation**
  - [ ] All user inputs validated with Zod schemas
  - [ ] Malicious pattern detection implemented
  - [ ] Input sanitization for all text fields
  - [ ] File upload validation (if applicable)

- [ ] **Authentication & Authorization**
  - [ ] JWT token validation implemented
  - [ ] Role-based access control configured
  - [ ] Permission checks for all operations
  - [ ] Session management implemented

- [ ] **Rate Limiting**
  - [ ] User-based rate limiting implemented
  - [ ] API endpoint rate limiting configured
  - [ ] DDoS protection measures in place

- [ ] **Data Protection**
  - [ ] Sensitive data encryption at rest
  - [ ] PII removal from logs
  - [ ] Data retention policies implemented
  - [ ] Secure data transmission (HTTPS)

- [ ] **Monitoring & Logging**
  - [ ] Security event logging implemented
  - [ ] Anomaly detection configured
  - [ ] Security alerts set up
  - [ ] Incident response procedures documented

- [ ] **Infrastructure Security**
  - [ ] Secure deployment configuration
  - [ ] Network security measures
  - [ ] Regular security updates
  - [ ] Backup and recovery procedures

### Security Testing Checklist

- [ ] **Penetration Testing**
  - [ ] Input validation bypass attempts
  - [ ] Authentication mechanism testing
  - [ ] Authorization bypass testing
  - [ ] Session management testing

- [ ] **Vulnerability Assessment**
  - [ ] Dependency vulnerability scanning
  - [ ] Code security analysis
  - [ ] Configuration security review
  - [ ] Infrastructure security assessment

- [ ] **Compliance Verification**
  - [ ] GDPR compliance (if applicable)
  - [ ] CCPA compliance (if applicable)
  - [ ] Industry-specific compliance requirements
  - [ ] Data protection regulation compliance

This comprehensive security guide provides the foundation for building secure applications with the Ninja Agents SDK. Regular security reviews and updates are essential to maintain protection against evolving threats.