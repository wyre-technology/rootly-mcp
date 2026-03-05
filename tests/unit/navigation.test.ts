import { describe, it, expect } from 'vitest';
import { getState, getNavigationTools, getBackTool } from '../../src/domains/navigation.js';

describe('navigation', () => {
  it('getNavigationTools — returns rootly_navigate and rootly_status', () => {
    const tools = getNavigationTools();
    const names = tools.map((t) => t.name);
    expect(names).toContain('rootly_navigate');
    expect(names).toContain('rootly_status');
  });

  it('getBackTool — returns rootly_back', () => {
    expect(getBackTool().name).toBe('rootly_back');
  });

  it('getState — initialises with null domain for new session', () => {
    const state = getState('test-session-nav');
    expect(state.currentDomain).toBeNull();
  });

  it('getState — persists state across calls for same session', () => {
    const state = getState('test-session-persist');
    state.currentDomain = 'alerts';
    const state2 = getState('test-session-persist');
    expect(state2.currentDomain).toBe('alerts');
  });

  it('getState — separate sessions do not share state', () => {
    const stateA = getState('session-a');
    stateA.currentDomain = 'incidents';
    const stateB = getState('session-b');
    expect(stateB.currentDomain).toBeNull();
  });
});
