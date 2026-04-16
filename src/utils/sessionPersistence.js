const SESSION_STORAGE_KEY = 'eml-editor-session';
const NAMED_SESSIONS_STORAGE_KEY = 'eml-editor-named-sessions';
const SESSION_VERSION = 1;

const defaultMeta = {
  subject: '',
  from: '',
  to: '',
  cc: '',
  bcc: '',
};

const DATA_URL_PLACEHOLDER = '[removed-inline-image-for-browser-storage]';

function isDataUrl(value) {
  return typeof value === 'string' && value.startsWith('data:');
}

function sanitizeValueForBrowserStorage(value) {
  if (Array.isArray(value)) {
    return value.map(sanitizeValueForBrowserStorage);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValueForBrowserStorage(nestedValue)])
    );
  }

  if (isDataUrl(value)) {
    return DATA_URL_PLACEHOLDER;
  }

  return value;
}

function cloneElement(element) {
  return {
    ...element,
    props: { ...(element?.props || {}) },
  };
}

function normalizeElements(elements) {
  if (!Array.isArray(elements)) return [];

  return elements
    .filter((element) => element && typeof element === 'object' && typeof element.type === 'string')
    .map((element, index) => ({
      ...cloneElement(element),
      id: typeof element.id === 'string' && element.id.trim() ? element.id : `el-${index + 1}`,
    }));
}

export function getNextIdFromElements(elements) {
  const maxId = normalizeElements(elements).reduce((max, element) => {
    const match = /^el-(\d+)$/.exec(element.id || '');
    if (!match) return max;
    return Math.max(max, Number(match[1]));
  }, 0);

  return maxId + 1;
}

export function buildEditorSession(state) {
  const elements = normalizeElements(state?.elements);
  const elementIds = new Set(elements.map((element) => element.id));
  const selectedId = elementIds.has(state?.selectedId) ? state.selectedId : null;

  return {
    version: SESSION_VERSION,
    savedAt: new Date().toISOString(),
    emailMeta: { ...defaultMeta, ...(state?.emailMeta || {}) },
    elements,
    selectedId,
    ui: {
      leftPanelCollapsed: Boolean(state?.leftPanelCollapsed),
      rightPanelCollapsed: Boolean(state?.rightPanelCollapsed),
    },
  };
}

function buildBrowserStorageSession(state) {
  return sanitizeValueForBrowserStorage(buildEditorSession(state));
}

export function restoreEditorSession(session) {
  if (!session || typeof session !== 'object') {
    throw new Error('Invalid session data.');
  }

  const elements = normalizeElements(session.elements);
  const selectedId = elements.some((element) => element.id === session.selectedId) ? session.selectedId : null;

  return {
    emailMeta: { ...defaultMeta, ...(session.emailMeta || {}) },
    elements,
    selectedId,
    leftPanelCollapsed: Boolean(session.ui?.leftPanelCollapsed),
    rightPanelCollapsed: Boolean(session.ui?.rightPanelCollapsed),
    nextId: getNextIdFromElements(elements),
  };
}

export function loadSessionFromStorage() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    return restoreEditorSession(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveSessionToStorage(state) {
  const session = buildBrowserStorageSession(state);

  try {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
    return { ok: true, session };
  } catch (error) {
    return {
      ok: false,
      session,
      error,
      reason: error?.name === 'QuotaExceededError' ? 'quota-exceeded' : 'storage-write-failed',
    };
  }
}

export function clearSessionFromStorage() {
  window.localStorage.removeItem(SESSION_STORAGE_KEY);
}

export function getStoredDraftSummary() {
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const session = JSON.parse(raw);
    const subject = session?.emailMeta?.subject || 'Untitled Email';
    const elementCount = Array.isArray(session?.elements) ? session.elements.length : 0;

    return {
      subject,
      elementCount,
      savedAt: session?.savedAt || null,
    };
  } catch {
    return null;
  }
}

function getRawNamedSessions() {
  try {
    const raw = window.localStorage.getItem(NAMED_SESSIONS_STORAGE_KEY);
    if (!raw) return [];
    const sessions = JSON.parse(raw);
    return Array.isArray(sessions) ? sessions : [];
  } catch {
    return [];
  }
}

function setRawNamedSessions(sessions) {
  window.localStorage.setItem(NAMED_SESSIONS_STORAGE_KEY, JSON.stringify(sessions));
}

export function listNamedSessions() {
  return getRawNamedSessions()
    .filter((entry) => entry && typeof entry === 'object' && entry.id && entry.name && entry.session)
    .map((entry) => ({
      id: entry.id,
      name: entry.name,
      savedAt: entry.savedAt || entry.session?.savedAt || null,
      subject: entry.session?.emailMeta?.subject || 'Untitled Email',
      elementCount: Array.isArray(entry.session?.elements) ? entry.session.elements.length : 0,
    }))
    .sort((a, b) => new Date(b.savedAt || 0).getTime() - new Date(a.savedAt || 0).getTime());
}

export function saveNamedSession(name, state) {
  const trimmedName = `${name || ''}`.trim();
  if (!trimmedName) {
    throw new Error('Session name is required.');
  }

  const session = buildBrowserStorageSession(state);
  const sessions = getRawNamedSessions();
  const existing = sessions.find((entry) => entry.name.toLowerCase() === trimmedName.toLowerCase());
  const nextEntry = {
    id: existing?.id || `session-${Date.now()}`,
    name: trimmedName,
    savedAt: session.savedAt,
    session,
  };

  const nextSessions = existing
    ? sessions.map((entry) => (entry.id === existing.id ? nextEntry : entry))
    : [nextEntry, ...sessions];

  setRawNamedSessions(nextSessions);
  return nextEntry;
}

export function loadNamedSession(id) {
  const session = getRawNamedSessions().find((entry) => entry.id === id);
  if (!session) {
    throw new Error('Saved session not found.');
  }
  return restoreEditorSession(session.session);
}

export function deleteNamedSession(id) {
  const sessions = getRawNamedSessions();
  setRawNamedSessions(sessions.filter((entry) => entry.id !== id));
}

export function downloadSessionFile(state) {
  const session = buildEditorSession(state);
  const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  const subject = session.emailMeta.subject || 'email_session';

  anchor.href = url;
  anchor.download = `${subject.replace(/[^a-z0-9]/gi, '_') || 'email_session'}.session.json`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

export async function readSessionFile(file) {
  const text = await file.text();
  return restoreEditorSession(JSON.parse(text));
}
