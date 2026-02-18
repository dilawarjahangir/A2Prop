import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import UnlockAiMapModal from "../components/UnlockAiMapModal.jsx";
import { request } from "../api/client.js";

const STORAGE_KEY = "aiMapUnlocked";
const STORAGE_CONTACT_KEY = "aiMapContact";

const AiMapLockContext = createContext(null);

const readStoredFlag = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const readStoredContact = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_CONTACT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const AiMapLockProvider = ({ children }) => {
  const [isUnlocked, setIsUnlocked] = useState(readStoredFlag);
  const [contact, setContact] = useState(readStoredContact);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const successRef = useRef(null);

  const persist = useCallback((payload) => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEY, "true");
      if (payload) {
        window.localStorage.setItem(STORAGE_CONTACT_KEY, JSON.stringify(payload));
      }
    } catch {
      // fail silently to avoid breaking UX
    }
  }, []);

  const openUnlockModal = useCallback((onSuccess) => {
    successRef.current = onSuccess || null;
    setIsModalOpen(true);
  }, []);

  const closeUnlockModal = useCallback(() => {
    setIsModalOpen(false);
    successRef.current = null;
  }, []);

  const unlock = useCallback(
    async (payload) => {
      try {
        await request("/api/v1/notifications/ai-map", {
          method: "POST",
          body: payload,
          timeout: 8000,
        });
      } catch (err) {
        // log to console but don't block unlock flow
        console.warn("AI Map email send failed", err?.message || err);
      }

      setIsUnlocked(true);
      setContact(payload);
      persist(payload);
      setIsModalOpen(false);

      const cb = successRef.current;
      successRef.current = null;
      if (typeof cb === "function") {
        cb();
      }
    },
    [persist],
  );

  useEffect(() => {
    // sync in case storage changes in another tab
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) {
        setIsUnlocked(event.newValue === "true");
      }
      if (event.key === STORAGE_CONTACT_KEY && event.newValue) {
        try {
          setContact(JSON.parse(event.newValue));
        } catch {
          setContact(null);
        }
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  const value = {
    isUnlocked,
    contact,
    openUnlockModal,
    closeUnlockModal,
    unlock,
    isModalOpen,
  };

  return (
    <AiMapLockContext.Provider value={value}>
      {children}
      <UnlockAiMapModal
        open={isModalOpen}
        onClose={closeUnlockModal}
        onSubmit={unlock}
        initialData={contact}
      />
    </AiMapLockContext.Provider>
  );
};

export const useAiMapLock = () => {
  const ctx = useContext(AiMapLockContext);
  if (!ctx) {
    throw new Error("useAiMapLock must be used within AiMapLockProvider");
  }
  return ctx;
};
