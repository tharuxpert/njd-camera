import path from "path";

export const VideoExtension = [".m4v", ".mp4", ".mov"];

export type MediaType = "image" | "video";

export const getMediaType = (uri: string) => {
  return VideoExtension.includes(path.extname(uri)) ? "video" : "image";
};
