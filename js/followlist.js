const ENDPOINT = "http://146.56.183.55:5050";
const TOKEN = localStorage.getItem("TOKEN");
const myAccountName = localStorage.getItem("ACCOUNTNAME");
const HEADERS = {
  "Authorization" : `Bearer ${TOKEN}`,
  "Content-type" : "application/json"
}

function searchParam(key) {
  return new URLSearchParams(location.search).get(key)
}

const $Title = document.querySelector(".follow-nav h1");
const $followList = document.querySelector(".user-follow-list");

const accessPage = searchParam("page");
const accessAccount = searchParam("id");

// 어떤 페이지로 접근했는지 확인
const currentPage = (accessPage === "follower")
  ? "Followers"
  : "Followings";
$Title.textContent = currentPage;

window.onload = async () => {
  const URL = `${ENDPOINT}/profile/${accessAccount}/${accessPage}`;
  const reqOption = {
    method: "GET",
    headers: HEADERS
  }
  const res = await fetch(URL, reqOption);
  const json = await res.json();
  
  // user list 그려주기
  json.forEach((el) => {
    $followList.innerHTML += `
      <li id=follow-${el._id} class="user-follow">
        <a href="/pages/profile_detail.html?id=${el.accountname}">
          <img src=${el.image} alt="프로필 사진">
          <p>
            <strong>${el.username}</strong>
            <span>@ ${el.accountname}</span>
          </p>
        </a>
        <button type="button" name="follow-btn" class="s-button">팔로우</button>
      </li>
    `;
    // 나랑 팔로우가 되어있는 경우
    if (el.isfollow) {
      const followBtn = document.querySelector(`#follow-${el._id} button`);
      followBtn.classList.add("on");
      followBtn.textContent = "취소";
    }
  });
}


// 뒤로 가기 버튼
const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", () => {
  history.back();
});
