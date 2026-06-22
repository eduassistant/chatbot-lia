const STORAGE_KEY = "lia:anonymousConversationId";

export function isValidUuid(value: string | null | undefined) {
  if (!value) {
    return false;
  }

  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export function createConversationId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (character) => {
    const randomValue = crypto.getRandomValues(new Uint8Array(1))[0];
    return (Number(character) ^ (randomValue & (15 >> (Number(character) / 4)))).toString(16);
  });
}

export function getStoredConversationId() {
  if (typeof window === "undefined") {
    return null;
  }

  const value = window.localStorage.getItem(STORAGE_KEY);
  return isValidUuid(value) ? value : null;
}

export function persistConversationId(conversationId: string) {
  if (typeof window === "undefined" || !isValidUuid(conversationId)) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, conversationId);
}

export function getOrCreateConversationId() {
  const storedConversationId = getStoredConversationId();

  if (storedConversationId) {
    return storedConversationId;
  }

  const conversationId = createConversationId();
  persistConversationId(conversationId);
  return conversationId;
}

export function resetStoredConversationId() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }

  const conversationId = createConversationId();
  persistConversationId(conversationId);
  return conversationId;
}
