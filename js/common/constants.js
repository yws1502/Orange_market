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

export const NOT_CONNECTED = "서버와 통신이 원활하지 않습니다. 잠시 후 다시 시도해주세요. \n 문의사항이 있는 경우 연락남겨주세요 [woosang0430@gmail.com]";
