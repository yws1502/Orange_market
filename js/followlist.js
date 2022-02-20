import { ENDPOINT, PROFILE_DETAIL_PATH } from "./modules/path.js";
import { HEADERS_AUTH } from "./modules/constants.js";
import { accessCheck, searchParam, prevPage, showPage } from "./modules/utility.js";

accessCheck();

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
    headers: HEADERS_AUTH,
  };
  const res = await fetch(URL, reqOption);
  const json = await res.json();
  
  // user list 그려주기
  json.forEach((el) => {
    $followList.innerHTML += `
      <li id=follow-${el._id} class="user-follow">
        <a href="${PROFILE_DETAIL_PATH}?id=${el.accountname}">
          <img src=${el.image} alt="프로필 사진">
          <p>
            <strong>${el.username}</strong>
            <span>@ ${el.accountname}</span>
          </p>
        </a>
        <button
          type="button"
          name="follow-btn"
          data-account=${el.accountname}
          class="s-button">팔로우</button>
      </li>
    `;
    // 나랑 팔로우가 되어있는 경우
    if (el.isfollow) {
      const followBtn = document.querySelector(`#follow-${el._id} button`);
      followBtn.classList.add("on");
      followBtn.textContent = "취소";
    }
  });
  showPage();
}

$followList.addEventListener("click", (event) => {
  const currentNode = event.target;
  
  if (currentNode.name === "follow-btn") {
    handleFollowBtn(currentNode);
  }
});

// 팔로우 repaint 함수
async function handleFollowBtn(Node) {
  const account = Node.dataset.account;
  let state;

  if (Node.className.includes(" on")) {
    // 언팔로우하기
    await followAPI("DELETE", "unfollow", account);
    state = "팔로우";
  } else {
    // 팔로우하기
    await followAPI("POST", "follow", account);
    state = "취소";
  }

  Node.textContent = state;
  Node.classList.toggle("on");
}

// 팔로우 API 함수
async function followAPI(method, modePath, accountname) {
  const reqOption = {
    method: method,
    headers: HEADERS_AUTH,
  };
  await fetch(`${ENDPOINT}/profile/${accountname}/${modePath}`, reqOption);
}


const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", prevPage);
