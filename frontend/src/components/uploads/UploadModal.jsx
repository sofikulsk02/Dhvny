// src/components/upload/UploadModal.jsx
import React, { useState } from "react";
import uploadService from "../../services/upload.service";

/**
 * UploadModal - UI for file upload and YouTube link ingestion
 */
export default function UploadModal({
  open = false,
  onClose = () => {},
  onFinish = () => {},
}) {
  const [file, setFile] = useState(null);
  const [yt, setYt] = useState("");
  const [status, setStatus] = useState(null);

  if (!open) return null;

  async function handleUpload(e) {
    e?.preventDefault?.();
    try {
      setStatus("uploading");
      if (file) {
        const res = (await uploadService.uploadFile?.(file)) ?? {
          ok: true,
          id: Date.now(),
        };
        setStatus("done");
        onFinish(res);
      } else if (yt.trim()) {
        // enqueue convert worker
        const res = (await uploadService.enqueueYoutube?.(yt)) ?? {
          queued: true,
          id: Date.now(),
        };
        setStatus("queued");
        onFinish(res);
      } else {
        alert("Choose a file or paste a YouTube link");
        setStatus(null);
      }
    } catch (err) {
      console.error("upload error", err);
      setStatus("error");
    }
  }

  return (
    <div className="fixed inset-0 z-60 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="w-full bg-white rounded-t-lg p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold">Upload / Add Song</h3>
          <button onClick={onClose} className="text-gray-500">
            Close
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Audio file</label>
            <input
              type="file"
              accept="audio/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Or Paste YouTube URL
            </label>
            <input
              value={yt}
              onChange={(e) => setYt(e.target.value)}
              placeholder="https://youtube.com/..."
              className="w-full px-3 py-2 border rounded"
            />
            <div className="text-xs text-gray-400 mt-1">
              We will enqueue a conversion job and add audio to your library
              when ready.
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-2 bg-indigo-600 text-white rounded"
            >
              Submit
            </button>
          </div>
        </form>

        <div className="mt-3 text-sm text-gray-500">
          {status === "uploading" && "Uploading..."}
          {status === "queued" && "YouTube job queued"}
          {status === "done" && "Upload done"}
          {status === "error" && "Upload failed"}
        </div>
      </div>
    </div>
  );
}
