// src/services/upload.service.js
const wait = (ms = 400) => new Promise((r) => setTimeout(r, ms));

const uploadService = {
  uploadFile: async (file) => {
    console.log("[uploadService] uploadFile", file);
    await wait(600);
    return {
      ok: true,
      id: Date.now(),
      filename: file?.name ?? "uploaded_audio",
    };
  },

  enqueueYoutube: async (ytUrl) => {
    console.log("[uploadService] enqueueYoutube", ytUrl);
    await wait(300);
    // simulate a job id
    return { ok: true, queued: true, jobId: `job_${Date.now()}` };
  },
};

export default uploadService;
