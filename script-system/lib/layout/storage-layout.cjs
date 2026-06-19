/**

 * Cấu trúc thư mục upload chuẩn — đồng bộ docs/storage/README.md

 */

const STORAGE_UPLOAD_SUBDIRS = [

  "uploads/images/avatars",

  "uploads/images/posts",

  "uploads/images/events",

  "uploads/images/guides",

  "uploads/images/san-pham",

  "uploads/images/admincp",

  "uploads/files",

  "uploads/videos",

  "uploads/audio",

  "cache/resized",

];



/** Gợi ý STORAGE_DIR theo product line (local dev). */

const STORAGE_DIR_BY_LINE = {

  main: "D:/HUB/data/main",

  "hub-parent": "D:/HUB/data/hub-parent",

  "hub-checkin": "D:/HUB/data/hub-checkin",

  "store-sync": "D:/HUB/data/store-sync",

};



module.exports = {

  STORAGE_UPLOAD_SUBDIRS,

  STORAGE_DIR_BY_LINE,

};

