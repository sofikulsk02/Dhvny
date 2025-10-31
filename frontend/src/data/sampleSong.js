// src/data/sampleSongs.js
// Re-usable sample song objects for local testing.
// Fields match what components expect: songId/id, title, artist, coverUrl, audioUrl, duration, tags, isLegend, liked

export const CLOUD_SONG = {
  songId: "cloud_hips_001",
  title: "Hips Don't Lie (Cloud Test)",
  artist: "Shakira ft. Wyclef Jean",
  coverUrl: null, // optional: put a cloudinary image URL here if you want a cover
  audioUrl:
    "https://res.cloudinary.com/desr9wxwa/video/upload/v1761460143/Shakira_-_Hips_Don_t_Lie_Official_4K_Video_ft._Wyclef_Jean_ha0ozb.mp3",
  duration: 232,
  tags: ["pop", "2000s", "test"],
  isLegend: false,
  liked: false,
};

export const SAMPLE_SMALL = {
  songId: "sample_trex_demo",
  title: "T-Rex Roar (Demo)",
  artist: "MDN Demo",
  coverUrl: null,
  audioUrl:
    "https://interactive-examples.mdn.mozilla.net/media/cc0-audio/t-rex-roar.mp3",
  duration: 6,
  tags: ["demo"],
  isLegend: false,
  liked: false,
};

export const DESPACITO = {
  songId: "despacito_001",
  title: "Despacito",
  artist: "Luis Fonsi ft. Daddy Yankee",
  coverUrl: null,
  audioUrl:
    "https://res.cloudinary.com/desr9wxwa/video/upload/v1761560165/Luis_Fonsi_-_Despacito_ft._Daddy_Yankee_nkfi4e.mp3",
  duration: 229, // 3:49
  tags: ["pop", "latin", "reggaeton"],
  isLegend: false,
  liked: false,
};

export const AAYAT = {
  songId: "aayat_001",
  title: "Aayat",
  artist: "Arijit Singh (Bajirao Mastani)",
  coverUrl: null,
  audioUrl:
    "https://res.cloudinary.com/desr9wxwa/video/upload/v1761560156/Aayat_Full_Song_with_Lyrics_Bajirao_Mastani_bhtdwh.mp3",
  duration: 312, // 5:12
  tags: ["bollywood", "romantic", "arijit singh"],
  isLegend: false,
  liked: false,
};

export const SAMPLE_LIST = [CLOUD_SONG, DESPACITO, AAYAT, SAMPLE_SMALL];

// default export (convenience)
export default {
  CLOUD_SONG,
  DESPACITO,
  AAYAT,
  SAMPLE_SMALL,
  SAMPLE_LIST,
};
