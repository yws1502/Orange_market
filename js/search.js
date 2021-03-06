import { ENDPOINT, PROFILE_DETAIL_PATH } from "./common/path.js";
import { HEADERS_AUTH, NOT_CONNECTED } from "./common/constants.js";
import { accessCheck, prevPage, showPage } from "./common/utility.js";


accessCheck();
showPage();
// 기존에 있던 목록 지우기
function removeAllChilden(parentNode) {
  while (parentNode.hasChildNodes()) {
    parentNode.removeChild(parentNode.firstChild);
  } 
}

// 검색 결과 유저 정보 화면에 보여주기
async function paintUserList(event) {
  const userList = document.querySelector(".search-user-list");
  const emptyUser = document.querySelector(".empty-user");
  const SEARCH_API = ENDPOINT + "/user/searchuser/?keyword=";
  removeAllChilden(userList);
  
  const reqOption = {
    method: "GET",
    headers: HEADERS_AUTH,
  };
  const searchValue = event.target.value;

  try {
    const res = await fetch(`${SEARCH_API}${searchValue}`, reqOption);
    const json = await res.json();
  
    if (json[0]) {
      // 검색 유저가 있는 경우
      emptyUser.classList.add("hidden");
      const frag = document.createDocumentFragment("ul");
        json.forEach((user) => {
          const { accountname, image, username } = user;
  
          // 검색 키워드 하이라이트
          const userName = username.replace(
            searchValue,
            `<span class="highlight">${searchValue}</span>`
          );
  
          const li = document.createElement("li");
          li.className = "user-search";
          li.innerHTML = `
            <a href="${PROFILE_DETAIL_PATH}?id=${accountname}">
              <img src=${image} alt="프로필 사진" class="avatar-img">
              <p class="user-info">
                <strong>${userName}</strong>
                <span>@ ${accountname}</span>
              </p>
            </a>
          `;
          frag.appendChild(li);
        });
      userList.appendChild(frag);
    } else {
      // 검색한 유저가 없는 경우
      emptyUser.classList.remove("hidden");
    }
  } catch {
    alert(NOT_CONNECTED);
  }
};

document.querySelector("form").addEventListener("keyup", paintUserList);

// 뒤로 가기 버튼
document.querySelector(".prev-btn")
  .addEventListener("click", prevPage);
