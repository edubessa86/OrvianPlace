import { createClient } from "@/lib/supabase/client";

/**
 * Best-effort audit event. The user's normal authenticated session is used;
 * audit failures never block the primary business operation.
 */
export async function logAudit(
  action: string,
  entityType: string,
  entityId?: string | null,
  details: Record<string, unknown> = {},
) {
  try {
    const db = createClient();
    const { data: { user } } = await db.auth.getUser();
    if (!user) return;
    await db.from("audit_logs").insert({
      actor_id: user.id,
      action,
      entity_type: entityType,
      entity_id: entityId ?? null,
      details,
    });
  } catch {
    // Audit logging is best-effort; do not interrupt the main operation.
  }
}
