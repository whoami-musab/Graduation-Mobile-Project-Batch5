// src/assets/listeningMap.ts this file

export const LISTENING_AUDIO: Record<string, any> = {
  // مسارات ملفات الصوت المخزنة محلياً
  "audio_1.mp3": require("../listening/audio_1.mp3"),
  "audio_2.mp3": require("../listening/audio_2.mp3"),
  "audio_3.mp3": require("../listening/audio_3.mp3"),
};

// دالة تستخرج ملف الصوت من اي مسار (Path)
export const pickAudioKey = (raw: any) => {
  const s = String(raw ?? "");
  const file = s.split("/").pop() || s;
  return file.trim();
};
