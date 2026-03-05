import { randomUUID } from 'node:crypto';
import type { Server } from '@modelcontextprotocol/sdk/server/index.js';

type TrackedElicitation = {
  status: 'pending' | 'complete';
  completionNotifier: (() => Promise<void>) | undefined;
  completeResolver: () => void;
  completedPromise: Promise<void>;
  createdAt: Date;
  sessionId: string;
};

const elicitationsMap = new Map<string, TrackedElicitation>();

/**
 * Throw a URL elicitation — redirects the user to a URL to supply
 * sensitive data outside the LLM context (e.g. OAuth flow).
 * The tool execution is suspended until completeUrlElicitation() is called.
 */
export function throwUrlElicitation(
  server: Server,
  sessionId: string,
  url: string,
  message: string
): never {
  const elicitationId = randomUUID();
  let completeResolver!: () => void;
  const completedPromise = new Promise<void>((resolve) => {
    completeResolver = resolve;
  });

  // SDK: creates a notifier that signals the client the elicitation is complete
  const completionNotifier = server.createElicitationCompletionNotifier(elicitationId) as
    | (() => Promise<void>)
    | undefined;

  elicitationsMap.set(elicitationId, {
    status: 'pending',
    completedPromise,
    completeResolver,
    createdAt: new Date(),
    sessionId,
    completionNotifier,
  });

  // Throw the URL elicitation error — the SDK catches this and sends it to the client
  // The client is expected to open the URL and wait for completion
  throw Object.assign(
    new Error(`URL elicitation required: ${url} (id: ${elicitationId})`),
    { __urlElicitation: true, url, message, elicitationId }
  );
}

/**
 * Mark a URL elicitation as complete (called from your HTTP route after
 * the user submits the form at the elicitation URL).
 */
export async function completeUrlElicitation(elicitationId: string): Promise<void> {
  const elicitation = elicitationsMap.get(elicitationId);
  if (!elicitation) throw new Error(`Unknown elicitation: ${elicitationId}`);

  elicitation.status = 'complete';
  await elicitation.completionNotifier?.();
  elicitation.completeResolver();
  elicitationsMap.delete(elicitationId);
}

/**
 * Wait for a URL elicitation to complete (suspends tool execution).
 */
export async function waitForElicitation(elicitationId: string): Promise<void> {
  const elicitation = elicitationsMap.get(elicitationId);
  if (!elicitation) throw new Error(`Unknown elicitation: ${elicitationId}`);
  await elicitation.completedPromise;
}

/** Returns all pending elicitation IDs (useful for admin/health endpoints). */
export function getPendingElicitations(): string[] {
  return [...elicitationsMap.entries()]
    .filter(([, e]) => e.status === 'pending')
    .map(([id]) => id);
}
