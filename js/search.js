const TOKEN = localStorage.getItem("TOKEN");
const ENDPOINT = "http://146.56.183.55:5050";
const SEARCH_API = ENDPOINT + "/user/searchuser/?keyword=";
const defaultImage = "http://146.56.183.55:5050/Ellipse.png";

const HEADERS = {
  "Authorization" : `Bearer ${TOKEN}`,
  "Content-type" : "application/json"
};

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
  removeAllChilden(userList);

  const reqOption = {
    method: "GET",
    headers: HEADERS
  };
  const searchValue = event.target.value;
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

        // 잘못된 이미지 경로 예외 처리
        const userImageUrl = 
        (image.match(/http:\/\/[0-9].*:5050\//) && !image.match(/undefined/))
        ? image
        : defaultImage;
  
        const li = document.createElement("li");
        li.className = "user-search";
        li.innerHTML = `
          <a href="/pages/profile_detail.html?id=${accountname}">
            <img src=${userImageUrl} alt="프로필 사진" class="avatar-img">
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
};

document.querySelector("form").addEventListener("keyup", paintUserList);

// 뒤로 가기 버튼
const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", () => {
  history.back();
});
