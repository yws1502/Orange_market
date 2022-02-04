import { ENDPOINT, SEARCH_PATH, LOGIN_PATH } from "./path.js";
import { HEADERS_AUTH } from "./constants.js";

export async function accessCheck () {
  const URL = `${ENDPOINT}/user/checktoken`;
  const reqOption = {
    method: "GET",
    headers: HEADERS_AUTH,
  };
  const res = await fetch(URL, reqOption);
  const json = await res.json();
  // 접근 금지!
  if (!json.isValid) {
    location.href = LOGIN_PATH;
  }
}

export function transDateFormat(createdAt) {
  const date = new Date(createdAt);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

export function timeForToday(startDate) {
  const today = new Date();
  const timeValue = new Date(startDate);

  const betweenTime = Math.floor(
    (today.getTime() - timeValue.getTime()) / 1000 / 60
  );
  if (betweenTime < 1) return "방금 전";
  if (betweenTime < 60) return `${betweenTime}분 전`;

  const betweenTimeHour = Math.floor(betweenTime / 60);
  if (betweenTimeHour < 24) {
    return `${betweenTimeHour}시간 전`;
  }

  const betweenTimeDay = Math.floor(betweenTimeHour / 24);
  if (betweenTimeDay < 365) {
    return `${betweenTimeDay}일 전`;
  }

  return `${Math.floor(betweenTimeDay / 365)}년 전`;
}

export function searchParam(key) {
  return new URLSearchParams(location.search).get(key);
}

export function prevPage() { history.back(); }

export function searchPage () { location.href = SEARCH_PATH; }