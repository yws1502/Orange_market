const ENDPOINT = "https://api.mandarin.cf/";
const TOKEN = localStorage.getItem("TOKEN");
const myAccountName = localStorage.getItem("ACCOUNTNAME");
const HEADERS = {
  "Authorization" : `Bearer ${TOKEN}`,
  "Content-type" : "application/json"
}

// access check function
async function accessCheck() {
  const URL = `${ENDPOINT}/user/checktoken`;
  const reqOption = {
    method: "GET",
    headers: HEADERS
  };
  const res = await fetch(URL, reqOption);
  const json = await res.json();
  // 접근 금지!
  if (!json.isValid) { location.href = "/pages/login.html" }
}
accessCheck();

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
    headers: HEADERS
  };
  await fetch(`${ENDPOINT}/profile/${accountname}/${modePath}`, reqOption);
}



// 뒤로 가기 버튼
const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", () => {
  history.back();
});
