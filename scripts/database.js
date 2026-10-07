/**
 * FLUENTLY - Database Controller (IndexedDB)
 * High-performance, persistent local database for chat conversations,
 * writing drafts, notes, and AI grammar review submissions.
 */

class FluentlyDB {
  constructor() {
    this.dbName = 'FluentlyAppDB';
    this.version = 1;
    this.db = null;
    this.isReady = false;
    this._readyPromise = this.init();
  }

  async init() {
    if (!window.indexedDB) {
      console.warn('IndexedDB not supported by browser. Falling back to in-memory/localStorage.');
      return null;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onupgradeneeded = (event) => {
        const db = event.target.result;

        // 1. Chat Messages Store
        if (!db.objectStoreNames.contains('chat_messages')) {
          const chatStore = db.createObjectStore('chat_messages', { keyPath: 'id', autoIncrement: true });
          chatStore.createIndex('scenarioKey', 'scenarioKey', { unique: false });
          chatStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // 2. Writing Notes & Drafts Store
        if (!db.objectStoreNames.contains('writing_notes')) {
          const notesStore = db.createObjectStore('writing_notes', { keyPath: 'id' });
          notesStore.createIndex('updatedAt', 'updatedAt', { unique: false });
          notesStore.createIndex('title', 'title', { unique: false });
        }

        // 3. AI Grammar Reviews & Analysis Submissions Store
        if (!db.objectStoreNames.contains('writing_reviews')) {
          const reviewsStore = db.createObjectStore('writing_reviews', { keyPath: 'id' });
          reviewsStore.createIndex('timestamp', 'timestamp', { unique: false });
          reviewsStore.createIndex('score', 'score', { unique: false });
        }
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isReady = true;
        console.log('IndexedDB FluentlyAppDB initialized successfully.');
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB initialization error:', event.target.error);
        reject(event.target.error);
      };
    });
  }

  async ready() {
    if (this.isReady && this.db) return this.db;
    return this._readyPromise;
  }

  // ==========================================
  // CHAT MESSAGES API
  // ==========================================

  async saveChatMessage({ scenarioKey, role, content, feedback = null }) {
    await this.ready();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('chat_messages', 'readwrite');
        const store = tx.objectStore('chat_messages');
        const message = {
          scenarioKey,
          role, // 'user' | 'bot'
          content,
          feedback,
          timestamp: Date.now()
        };
        const req = store.add(message);
        req.onsuccess = (e) => resolve({ id: e.target.result, ...message });
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getChatMessages(scenarioKey) {
    await this.ready();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('chat_messages', 'readonly');
        const store = tx.objectStore('chat_messages');
        const index = store.index('scenarioKey');
        const req = index.getAll(scenarioKey);

        req.onsuccess = (e) => {
          const results = e.target.result || [];
          results.sort((a, b) => a.timestamp - b.timestamp);
          resolve(results);
        };
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async clearChatMessages(scenarioKey) {
    await this.ready();
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('chat_messages', 'readwrite');
        const store = tx.objectStore('chat_messages');
        const index = store.index('scenarioKey');
        const req = index.openCursor(IDBKeyRange.only(scenarioKey));

        req.onsuccess = (e) => {
          const cursor = e.target.result;
          if (cursor) {
            store.delete(cursor.primaryKey);
            cursor.continue();
          } else {
            resolve(true);
          }
        };
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getAllChatCount() {
    await this.ready();
    if (!this.db) return 0;
    return new Promise((resolve) => {
      try {
        const tx = this.db.transaction('chat_messages', 'readonly');
        const countReq = tx.objectStore('chat_messages').count();
        countReq.onsuccess = () => resolve(countReq.result || 0);
        countReq.onerror = () => resolve(0);
      } catch (e) {
        resolve(0);
      }
    });
  }

  // ==========================================
  // WRITING NOTES & DRAFTS API
  // ==========================================

  async saveNote({ id = null, title, content, tags = [] }) {
    await this.ready();
    if (!this.db) return null;

    const noteId = id || 'note_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const now = Date.now();

    const note = {
      id: noteId,
      title: (title || 'Untitled Note').trim(),
      content: content || '',
      tags: Array.isArray(tags) ? tags : [],
      updatedAt: now,
      createdAt: id ? undefined : now
    };

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('writing_notes', 'readwrite');
        const store = tx.objectStore('writing_notes');

        if (id) {
          // Fetch existing to preserve createdAt
          const getReq = store.get(id);
          getReq.onsuccess = () => {
            const existing = getReq.result;
            note.createdAt = existing ? existing.createdAt : now;
            const putReq = store.put(note);
            putReq.onsuccess = () => resolve(note);
            putReq.onerror = (e) => reject(e.target.error);
          };
          getReq.onerror = () => {
            note.createdAt = now;
            const putReq = store.put(note);
            putReq.onsuccess = () => resolve(note);
            putReq.onerror = (e) => reject(e.target.error);
          };
        } else {
          note.createdAt = now;
          const putReq = store.put(note);
          putReq.onsuccess = () => resolve(note);
          putReq.onerror = (e) => reject(e.target.error);
        }
      } catch (err) {
        reject(err);
      }
    });
  }

  async getNotes() {
    await this.ready();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('writing_notes', 'readonly');
        const store = tx.objectStore('writing_notes');
        const req = store.getAll();

        req.onsuccess = (e) => {
          const results = e.target.result || [];
          results.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
          resolve(results);
        };
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteNote(id) {
    await this.ready();
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('writing_notes', 'readwrite');
        const store = tx.objectStore('writing_notes');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // ==========================================
  // AI GRAMMAR REVIEWS & SUBMISSIONS API
  // ==========================================

  async saveReview(reviewData) {
    await this.ready();
    if (!this.db) return null;

    const id = reviewData.id || 'rev_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
    const item = {
      id,
      title: reviewData.title || (reviewData.originalText ? reviewData.originalText.slice(0, 45) + '...' : 'Writing Analysis'),
      originalText: reviewData.originalText || '',
      polishedText: reviewData.polishedText || '',
      score: reviewData.score !== undefined ? reviewData.score : null,
      gradeLabel: reviewData.gradeLabel || '',
      metrics: reviewData.metrics || {},
      issues: reviewData.issues || [],
      vocabSuggestions: reviewData.vocabSuggestions || [],
      wordCount: reviewData.wordCount || 0,
      userNote: reviewData.userNote || '',
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('writing_reviews', 'readwrite');
        const store = tx.objectStore('writing_reviews');
        const req = store.put(item);
        req.onsuccess = () => resolve(item);
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async getReviews() {
    await this.ready();
    if (!this.db) return [];

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('writing_reviews', 'readonly');
        const store = tx.objectStore('writing_reviews');
        const req = store.getAll();

        req.onsuccess = (e) => {
          const results = e.target.result || [];
          results.sort((a, b) => b.timestamp - a.timestamp);
          resolve(results);
        };
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async updateReviewNotes(id, userNote) {
    await this.ready();
    if (!this.db) return null;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('writing_reviews', 'readwrite');
        const store = tx.objectStore('writing_reviews');
        const getReq = store.get(id);

        getReq.onsuccess = () => {
          const item = getReq.result;
          if (!item) {
            resolve(null);
            return;
          }
          item.userNote = userNote;
          const putReq = store.put(item);
          putReq.onsuccess = () => resolve(item);
          putReq.onerror = (e) => reject(e.target.error);
        };
        getReq.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  async deleteReview(id) {
    await this.ready();
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction('writing_reviews', 'readwrite');
        const store = tx.objectStore('writing_reviews');
        const req = store.delete(id);
        req.onsuccess = () => resolve(true);
        req.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }

  // ==========================================
  // EXPORT, IMPORT & STATS
  // ==========================================

  async getDatabaseStats() {
    await this.ready();
    if (!this.db) return { chatCount: 0, notesCount: 0, reviewsCount: 0 };

    const [chatCount, notes, reviews] = await Promise.all([
      this.getAllChatCount(),
      this.getNotes(),
      this.getReviews()
    ]);

    return {
      chatCount,
      notesCount: notes.length,
      reviewsCount: reviews.length
    };
  }

  async exportAllData() {
    await this.ready();
    if (!this.db) return null;

    const [notes, reviews] = await Promise.all([
      this.getNotes(),
      this.getReviews()
    ]);

    const chatMessages = await new Promise((resolve) => {
      try {
        const tx = this.db.transaction('chat_messages', 'readonly');
        const store = tx.objectStore('chat_messages');
        const req = store.getAll();
        req.onsuccess = (e) => resolve(e.target.result || []);
        req.onerror = () => resolve([]);
      } catch (e) {
        resolve([]);
      }
    });

    return {
      appName: 'Fluently',
      version: 1,
      exportedAt: new Date().toISOString(),
      data: {
        chat_messages: chatMessages,
        writing_notes: notes,
        writing_reviews: reviews
      }
    };
  }

  async clearAllData() {
    await this.ready();
    if (!this.db) return false;

    return new Promise((resolve, reject) => {
      try {
        const tx = this.db.transaction(['chat_messages', 'writing_notes', 'writing_reviews'], 'readwrite');
        tx.objectStore('chat_messages').clear();
        tx.objectStore('writing_notes').clear();
        tx.objectStore('writing_reviews').clear();

        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      } catch (err) {
        reject(err);
      }
    });
  }
}

// Global Singleton Instance
window.fluentlyDB = new FluentlyDB();
