/**
 * Atlas Command G0 contracts: presentation-only. Server-side Core / AKH / Hermes
 * remain authoritative for identity, source permissions and tool execution.
 * No live gateway or voice integration is implemented in this file.
 */
export type KnowledgeKind = "project" | "document" | "decision" | "agent" | "teardown" | "note";
export type KnowledgeState = "draft" | "review" | "verified" | "published" | "archived";

export interface GalaxyNode {
  id: string;
  kind: KnowledgeKind;
  label: string;
  group: string;
  version: string;
  sourceRef?: string;
  lifecycle: KnowledgeState;
}
export interface GalaxyLink { source: string; target: string; relation: string }
export interface GalaxyPayload {
  schemaVersion: "0.1";
  tenantId: string;
  nodes: GalaxyNode[];
  links: GalaxyLink[];
  generatedAt: string;
}

/**
 * Defensive UI check only. The Knowledge Gateway MUST authorize sources and
 * relationships before serializing this payload. A frontend check is not ACL.
 */
export function validateGalaxyPayload(value: GalaxyPayload, expectedTenantId: string): boolean {
  if (!expectedTenantId || !value || value.tenantId !== expectedTenantId || value.schemaVersion !== "0.1") return false;
  if (!Array.isArray(value.nodes) || !Array.isArray(value.links)) return false;
  if (!Number.isFinite(Date.parse(value.generatedAt))) return false;
  const ids = new Set<string>();
  for (const node of value.nodes) {
    if (!node || typeof node.id !== "string" || !node.id.trim() ||
        typeof node.label !== "string" || !node.label.trim() ||
        typeof node.group !== "string" || typeof node.version !== "string" ||
        !["project", "document", "decision", "agent", "teardown", "note"].includes(node.kind) ||
        !["draft", "review", "verified", "published", "archived"].includes(node.lifecycle) ||
        ids.has(node.id)) return false;
    ids.add(node.id);
  }
  return value.links.every(link =>
    !!link && ids.has(link.source) && ids.has(link.target) &&
    typeof link.relation === "string" && link.relation.length > 0
  );
}

export type HelenaVoiceState = "idle" | "listening" | "thinking" | "speaking" | "interrupted" | "error";
export type AudioOwner = "hermes" | "browser" | "none";

/** Never run browser TTS alongside an active Hermes playback stream. */
export function canStartBrowserTts(owner: AudioOwner, state: HelenaVoiceState): boolean {
  return owner === "browser" && state !== "interrupted" && state !== "error";
}

export interface HelenaTurn {
  sessionRef: string; // opaque server-issued identifier; not a credential
  tenantId: string;
  text: string;
}

export type CommandEvent =
  | { type: "voice.state"; state: HelenaVoiceState; audioOwner: AudioOwner }
  | { type: "helena.response"; sessionRef: string; text: string; citations: string[] }
  | { type: "knowledge.focus"; nodeIds: string[] }
  | { type: "rea.progress"; jobRef: string; stage: "queued" | "running" | "review" | "failed" }
  | { type: "connection.error"; message: string };
