import { execute, query, queryOne, table } from "./db";

export type ActionType =
  | "LOGIN"
  | "LOGOUT"
  | "FAILED_LOGIN"
  | "PASSWORD_CHANGE"
  | "REGISTER"
  | "CREATE"
  | "READ"
  | "UPDATE"
  | "DELETE"
  | "API_REQUEST"
  | "ORDER_CREATE"
  | "ORDER_UPDATE"
  | "CART_ADD"
  | "CART_REMOVE"
  | "BUILD_CREATE"
  | "BUILD_DELETE"
  | "REVIEW_CREATE"
  | "REVIEW_DELETE";

export type EntityType =
  | "users"
  | "products"
  | "categories"
  | "components"
  | "orders"
  | "cart"
  | "builds"
  | "reviews"
  | "settings"
  | "auth";

export type Severity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface AuditLogData {
  userId?: string;
  userEmail?: string;
  userRole?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent?: string;
  actionType: ActionType;
  entityType?: EntityType;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
  requestMethod?: string;
  requestPath?: string;
  requestParams?: Record<string, unknown>;
  responseStatus?: number;
  durationMs?: number;
  status: "SUCCESS" | "FAILED" | "ERROR";
  errorMessage?: string;
}

export interface ErrorLogData {
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  userId?: string;
  ipAddress?: string;
  requestPath?: string;
  requestMethod?: string;
  requestBody?: Record<string, unknown>;
  severity?: Severity;
}

export interface LoginHistoryData {
  userId?: string;
  email: string;
  eventType: "LOGIN" | "LOGOUT" | "FAILED_LOGIN" | "PASSWORD_RESET";
  ipAddress: string;
  userAgent?: string;
  locationCity?: string;
  locationCountry?: string;
  success: boolean;
  failureReason?: string;
}

export async function logAudit(data: AuditLogData): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO ${table("audit_logs")} (
      user_id, user_email, user_role, session_id, ip_address, user_agent,
      action_type, entity_type, entity_id, old_value, new_value,
      request_method, request_path, request_params, response_status, duration_ms,
      status, error_message, timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, NOW())
    RETURNING id`,
    [
      data.userId || null,
      data.userEmail || null,
      data.userRole || null,
      data.sessionId || null,
      data.ipAddress,
      data.userAgent || null,
      data.actionType,
      data.entityType || null,
      data.entityId || null,
      data.oldValue ? JSON.stringify(data.oldValue) : null,
      data.newValue ? JSON.stringify(data.newValue) : null,
      data.requestMethod || null,
      data.requestPath || null,
      data.requestParams ? JSON.stringify(data.requestParams) : null,
      data.responseStatus || null,
      data.durationMs || null,
      data.status,
      data.errorMessage || null,
    ]
  );
  return result?.id || "";
}

export async function logError(data: ErrorLogData): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO ${table("error_logs")} (
      error_type, error_message, stack_trace, user_id, ip_address,
      request_path, request_method, request_body, severity, timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING id`,
    [
      data.errorType,
      data.errorMessage,
      data.stackTrace || null,
      data.userId || null,
      data.ipAddress || null,
      data.requestPath || null,
      data.requestMethod || null,
      data.requestBody ? JSON.stringify(data.requestBody) : null,
      data.severity || "MEDIUM",
    ]
  );
  return result?.id || "";
}

export async function logLoginHistory(data: LoginHistoryData): Promise<string> {
  const result = await queryOne<{ id: string }>(
    `INSERT INTO ${table("login_history")} (
      user_id, email, event_type, ip_address, user_agent,
      location_city, location_country, success, failure_reason, timestamp
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
    RETURNING id`,
    [
      data.userId || null,
      data.email,
      data.eventType,
      data.ipAddress,
      data.userAgent || null,
      data.locationCity || null,
      data.locationCountry || null,
      data.success,
      data.failureReason || null,
    ]
  );
  return result?.id || "";
}

export async function getAuditLogs(filters: {
  userId?: string;
  actionType?: ActionType;
  entityType?: EntityType;
  startDate?: Date;
  endDate?: Date;
  ipAddress?: string;
  limit?: number;
  offset?: number;
}): Promise<{ logs: AuditLogRow[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.userId) {
    conditions.push(`user_id = $${paramIndex++}`);
    params.push(filters.userId);
  }
  if (filters.actionType) {
    conditions.push(`action_type = $${paramIndex++}`);
    params.push(filters.actionType);
  }
  if (filters.entityType) {
    conditions.push(`entity_type = $${paramIndex++}`);
    params.push(filters.entityType);
  }
  if (filters.startDate) {
    conditions.push(`timestamp >= $${paramIndex++}`);
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push(`timestamp <= $${paramIndex++}`);
    params.push(filters.endDate);
  }
  if (filters.ipAddress) {
    conditions.push(`ip_address = $${paramIndex++}`);
    params.push(filters.ipAddress);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const logs = await query<AuditLogRow>(
    `SELECT * FROM ${table("audit_logs")} ${whereClause} ORDER BY timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  );

  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${table("audit_logs")} ${whereClause}`,
    params
  );

  return {
    logs,
    total: parseInt(countResult?.count || "0"),
  };
}

export async function getErrorLogs(filters: {
  resolved?: boolean;
  severity?: Severity;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ errors: ErrorLogRow[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.resolved !== undefined) {
    conditions.push(`resolved = $${paramIndex++}`);
    params.push(filters.resolved);
  }
  if (filters.severity) {
    conditions.push(`severity = $${paramIndex++}`);
    params.push(filters.severity);
  }
  if (filters.startDate) {
    conditions.push(`timestamp >= $${paramIndex++}`);
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push(`timestamp <= $${paramIndex++}`);
    params.push(filters.endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const errors = await query<ErrorLogRow>(
    `SELECT * FROM ${table("error_logs")} ${whereClause} ORDER BY timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  );

  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${table("error_logs")} ${whereClause}`,
    params
  );

  return {
    errors,
    total: parseInt(countResult?.count || "0"),
  };
}

export async function getLoginHistory(filters: {
  userId?: string;
  email?: string;
  eventType?: "LOGIN" | "LOGOUT" | "FAILED_LOGIN" | "PASSWORD_RESET";
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}): Promise<{ history: LoginHistoryRow[]; total: number }> {
  const conditions: string[] = [];
  const params: unknown[] = [];
  let paramIndex = 1;

  if (filters.userId) {
    conditions.push(`user_id = $${paramIndex++}`);
    params.push(filters.userId);
  }
  if (filters.email) {
    conditions.push(`email ILIKE $${paramIndex++}`);
    params.push(`%${filters.email}%`);
  }
  if (filters.eventType) {
    conditions.push(`event_type = $${paramIndex++}`);
    params.push(filters.eventType);
  }
  if (filters.startDate) {
    conditions.push(`timestamp >= $${paramIndex++}`);
    params.push(filters.startDate);
  }
  if (filters.endDate) {
    conditions.push(`timestamp <= $${paramIndex++}`);
    params.push(filters.endDate);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;

  const history = await query<LoginHistoryRow>(
    `SELECT * FROM ${table("login_history")} ${whereClause} ORDER BY timestamp DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    [...params, limit, offset]
  );

  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${table("login_history")} ${whereClause}`,
    params
  );

  return {
    history,
    total: parseInt(countResult?.count || "0"),
  };
}

export async function resolveError(errorId: string, resolvedBy: string): Promise<void> {
  await execute(
    `UPDATE ${table("error_logs")} SET resolved = true, resolved_by = $1, resolved_at = NOW() WHERE id = $2`,
    [resolvedBy, errorId]
  );
}

export interface AuditLogRow {
  id: string;
  timestamp: Date;
  user_id: string | null;
  user_email: string | null;
  user_role: string | null;
  session_id: string | null;
  ip_address: string;
  user_agent: string | null;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  old_value: Record<string, unknown> | null;
  new_value: Record<string, unknown> | null;
  request_method: string | null;
  request_path: string | null;
  request_params: Record<string, unknown> | null;
  response_status: number | null;
  duration_ms: number | null;
  status: string;
  error_message: string | null;
}

export interface ErrorLogRow {
  id: string;
  timestamp: Date;
  error_type: string;
  error_message: string;
  stack_trace: string | null;
  user_id: string | null;
  ip_address: string | null;
  request_path: string | null;
  request_method: string | null;
  request_body: Record<string, unknown> | null;
  severity: string;
  resolved: boolean;
  resolved_by: string | null;
  resolved_at: Date | null;
}

export interface LoginHistoryRow {
  id: string;
  user_id: string | null;
  email: string;
  event_type: string;
  ip_address: string;
  user_agent: string | null;
  location_city: string | null;
  location_country: string | null;
  success: boolean;
  failure_reason: string | null;
  timestamp: Date;
}

export function getClientIP(request: Request): string {
  const headers = request.headers;
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }
  const cfIP = headers.get("cf-connecting-ip");
  if (cfIP) {
    return cfIP;
  }
  return "unknown";
}

export function getUserAgent(request: Request): string {
  return request.headers.get("user-agent") || "unknown";
}