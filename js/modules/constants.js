export const TOKEN = localStorage.getItem("TOKEN");
export const MY_ACCOUNTNAME = localStorage.getItem("ACCOUNTNAME");

export const HEADERS_AUTH = {
  Authorization: `Bearer ${TOKEN}`,
  "Content-type": "application/json",
};
export const HEADERS = {
  "Content-Type": "application/json",
};

// 이미지 슬라이드 가로길이
export const SLIDE_WIDTH = 304;
export const SLIDE_MARGIN = 20;
