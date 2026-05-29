/**
 * Firebase mock — native modules disabled for local simulator builds.
 * Replace with the real @react-native-firebase implementation once native
 * pods are properly configured.
 */

// ── Auth mock ──────────────────────────────────────────────────────────────

const authListeners: Array<(user: any) => void> = [];
let currentUser: any = null;

export const firebaseAuth = {
  get currentUser() {
    return currentUser;
  },
  onAuthStateChanged(cb: (user: any) => void) {
    authListeners.push(cb);
    cb(currentUser);
    return () => {
      const idx = authListeners.indexOf(cb);
      if (idx !== -1) authListeners.splice(idx, 1);
    };
  },
  async createUserWithEmailAndPassword(email: string, _password: string) {
    currentUser = { uid: `mock-${Date.now()}`, email, getIdToken: async () => 'mock-token' };
    authListeners.forEach(l => l(currentUser));
    return { user: currentUser };
  },
  async signInWithEmailAndPassword(email: string, _password: string) {
    currentUser = { uid: `mock-${email}`, email, getIdToken: async () => 'mock-token' };
    authListeners.forEach(l => l(currentUser));
    return { user: currentUser };
  },
  async signOut() {
    currentUser = null;
    authListeners.forEach(l => l(null));
  },
};

// ── Firestore mock ─────────────────────────────────────────────────────────

const store: Record<string, Record<string, any>> = {};
const snapshotListeners: Record<string, Array<() => void>> = {};

function notifyListeners(colName: string) {
  (snapshotListeners[colName] ?? []).forEach(cb => cb());
}

function makeQuery(colName: string, filters: Array<[string, string, any]>) {
  function matchDoc(doc: any) {
    return filters.every(([field, op, val]) => {
      if (op === '==') return doc[field] === val;
      if (op === '>=') return doc[field] >= val;
      if (op === '<=') return doc[field] <= val;
      return true;
    });
  }

  function getSnapshot() {
    const docs = Object.entries(store[colName] ?? {})
      .filter(([, d]) => matchDoc(d))
      .map(([id, d]) => ({ id, data: () => d, exists: true }));
    return { docs };
  }

  return {
    where(field: string, op: string, val: any) {
      return makeQuery(colName, [...filters, [field, op, val]]);
    },
    onSnapshot(onChange: (snap: any) => void, _onError?: (e: Error) => void) {
      const cb = () => onChange(getSnapshot());
      snapshotListeners[colName] = [...(snapshotListeners[colName] ?? []), cb];
      cb();
      return () => {
        snapshotListeners[colName] = (snapshotListeners[colName] ?? []).filter(l => l !== cb);
      };
    },
    async get() {
      return getSnapshot();
    },
  };
}

export const db = {
  collection: (name: string) => ({
    where(field: string, op: string, val: any) {
      return makeQuery(name, [[field, op, val]]);
    },
    async add(data: any) {
      const id = `mock-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      store[name] = { ...(store[name] ?? {}), [id]: { ...data, id } };
      notifyListeners(name);
      return { id };
    },
    doc(id: string) {
      return {
        async get() {
          const d = (store[name] ?? {})[id];
          return { id, data: () => d, exists: !!d };
        },
        async update(data: any) {
          if (store[name]?.[id]) {
            store[name][id] = { ...store[name][id], ...data };
            notifyListeners(name);
          }
        },
        async delete() {
          if (store[name]?.[id]) {
            delete store[name][id];
            notifyListeners(name);
          }
        },
      };
    },
  }),
};

export const EVENTS_COLLECTION = 'events';
