"use client";

import type { FC, SVGProps } from "react";
import {
  WordIcon,
  ExcelIcon,
  PowerPointIcon,
  PdfIcon,
  ImageIcon,
  VideoIcon,
  AudioIcon,
  ArchiveIcon,
  CodeIcon,
  TxtIcon,
  GenericDocIcon,
} from "../svg";

const ICON_MAP: Record<string, FC<SVGProps<SVGSVGElement>>> = {
  doc: WordIcon,
  docx: WordIcon,
  docm: WordIcon,
  dotx: WordIcon,
  xls: ExcelIcon,
  xlsx: ExcelIcon,
  xlsm: ExcelIcon,
  xlsb: ExcelIcon,
  csv: ExcelIcon,
  ppt: PowerPointIcon,
  pptx: PowerPointIcon,
  pps: PowerPointIcon,
  ppsx: PowerPointIcon,
  pdf: PdfIcon,
  jpg: ImageIcon,
  jpeg: ImageIcon,
  png: ImageIcon,
  gif: ImageIcon,
  webp: ImageIcon,
  svg: ImageIcon,
  bmp: ImageIcon,
  ico: ImageIcon,
  mp4: VideoIcon,
  webm: VideoIcon,
  mov: VideoIcon,
  avi: VideoIcon,
  mkv: VideoIcon,
  mp3: AudioIcon,
  wav: AudioIcon,
  aac: AudioIcon,
  ogg: AudioIcon,
  flac: AudioIcon,
  wma: AudioIcon,
  zip: ArchiveIcon,
  rar: ArchiveIcon,
  "7z": ArchiveIcon,
  tar: ArchiveIcon,
  gz: ArchiveIcon,
  tgz: ArchiveIcon,
  bz2: ArchiveIcon,
  json: CodeIcon,
  xml: CodeIcon,
  yaml: CodeIcon,
  yml: CodeIcon,
  ts: CodeIcon,
  tsx: CodeIcon,
  js: CodeIcon,
  jsx: CodeIcon,
  css: CodeIcon,
  scss: CodeIcon,
  less: CodeIcon,
  html: CodeIcon,
  htm: CodeIcon,
  txt: TxtIcon,
  rtf: TxtIcon,
  log: TxtIcon,
  md: TxtIcon,
};

function getFileExtension(filename: string): string {
  const dot = filename.lastIndexOf(".");
  if (dot === -1) return "";
  return filename.slice(dot + 1).toLowerCase();
}

function FileTypeIcon({ filename, className = "" }: { filename: string; className?: string }) {
  const ext = getFileExtension(filename);
  const Icon = ICON_MAP[ext] || GenericDocIcon;
  return (
    <div className={"flex size-12 items-center justify-center rounded-md border border-border bg-muted " + className}>
      <Icon className="size-7" />
    </div>
  );
}

function FileTypeIconSm({ filename, className = "" }: { filename: string; className?: string }) {
  const ext = getFileExtension(filename);
  const Icon = ICON_MAP[ext] || GenericDocIcon;
  return (
    <span className={"inline-flex shrink-0 " + className}>
      <Icon className="size-4" />
    </span>
  );
}

export { FileTypeIcon, FileTypeIconSm };
