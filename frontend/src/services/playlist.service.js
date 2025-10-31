// src/services/playlist.service.js
const wait = (ms = 300) => new Promise((r) => setTimeout(r, ms));

const playlistService = {
  save: async (payload) => {
    console.log("[playlistService] save", payload);
    await wait(300);
    return { ok: true, id: `pl_${Date.now()}`, ...payload };
  },
};

export default playlistService;
