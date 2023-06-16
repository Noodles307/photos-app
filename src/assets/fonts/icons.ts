export type IconsId =
  | "audio"
  | "circle-loader"
  | "context-menu"
  | "directory"
  | "download"
  | "empty"
  | "eye"
  | "file"
  | "folder"
  | "image"
  | "logout"
  | "logs"
  | "metrics"
  | "play"
  | "plus"
  | "select-all"
  | "users"
  | "video";

export type IconsKey =
  | "Audio"
  | "CircleLoader"
  | "ContextMenu"
  | "Directory"
  | "Download"
  | "Empty"
  | "Eye"
  | "File"
  | "Folder"
  | "Image"
  | "Logout"
  | "Logs"
  | "Metrics"
  | "Play"
  | "Plus"
  | "SelectAll"
  | "Users"
  | "Video";

export enum Icons {
  Audio = "audio",
  CircleLoader = "circle-loader",
  ContextMenu = "context-menu",
  Directory = "directory",
  Download = "download",
  Empty = "empty",
  Eye = "eye",
  File = "file",
  Folder = "folder",
  Image = "image",
  Logout = "logout",
  Logs = "logs",
  Metrics = "metrics",
  Play = "play",
  Plus = "plus",
  SelectAll = "select-all",
  Users = "users",
  Video = "video",
}

export const ICONS_CODEPOINTS: { [key in Icons]: string } = {
  [Icons.Audio]: "61697",
  [Icons.CircleLoader]: "61698",
  [Icons.ContextMenu]: "61699",
  [Icons.Directory]: "61700",
  [Icons.Download]: "61701",
  [Icons.Empty]: "61702",
  [Icons.Eye]: "61703",
  [Icons.File]: "61704",
  [Icons.Folder]: "61705",
  [Icons.Image]: "61706",
  [Icons.Logout]: "61707",
  [Icons.Logs]: "61708",
  [Icons.Metrics]: "61709",
  [Icons.Play]: "61710",
  [Icons.Plus]: "61711",
  [Icons.SelectAll]: "61712",
  [Icons.Users]: "61713",
  [Icons.Video]: "61714",
};
