const ENDPOINT = "http://146.56.183.55:5050";
const TOKEN = localStorage.getItem("TOKEN");
const myAccountName = localStorage.getItem("ACCOUNTNAME");
const HEADERS = {
  "Authorization" : `Bearer ${TOKEN}`,
  "Content-type" : "application/json"
}

// 이미지 슬라이드 가로길이
const slideWidth = 304;
const slideMargin = 20;

function searchParam(key) {
  return new URLSearchParams(location.search).get(key)
}

const $otherProfile = document.querySelector(".other-profile");
const $myProfile = document.querySelector(".my-profile");

const $userView = document.querySelector(".user-view");
const $followerBtn = $userView.querySelector(".follower-btn");
const $followingBtn = $userView.querySelector(".following-btn");
const $userImage = $userView.querySelector(".avartar-image");
const $userName = $userView.querySelector("strong");
const $accountName = $userView.querySelector("span");
const $intro = $userView.querySelector("p");

const $productView = document.querySelector(".product-view");
const $productList = $productView.querySelector("ul");

const $feedList = document.querySelector(".feed-list");
const $modal = document.querySelector(".modal");


// 접근한 사람 확인
const temp = searchParam("id")
const accountName = (temp && myAccountName != temp)
  ? searchParam("id")
  : myAccountName;

// 접근한 사람 확인 후 알맞은 정보 불러오기
if (myAccountName !== accountName) {
  // 다른 사람 프로필 보여주기
  $otherProfile.classList.remove("hidden");
  $myProfile.classList.add("hidden");
} else {
  // 내 프로필 보여주기
  $otherProfile.classList.add("hidden");
  $myProfile.classList.remove("hidden");
}

window.onload = async () => {
  // user view 그리기
  const userInfoJson = await getProfileDataAPI("profile");
  paintUserView(userInfoJson.profile);

  // 상품 그리기
  const productJson = await getProfileDataAPI("product");
  if (!productJson.data) {
    $productView.classList.add("hidden");
  } else {
    paintProductView(productJson.product);
  }

  // 게시물 그리기
  const postJson = await getProfileDataAPI("post", "userpost");
  paintPostListView(postJson.post)
  paintPostGridView(postJson.post)
}


/* user view ----------------------------------------------------- */

// 서버에서 Profile 관련된 데이터 불러오기 함수
async function getProfileDataAPI(path, path2=false) {
  const URL = (path2)
    ? `${ENDPOINT}/${path}/${accountName}/${path2}`
    : `${ENDPOINT}/${path}/${accountName}`;
  const reqOption = {
    method: "GET",
    headers: HEADERS
  }
  const res = await fetch(URL, reqOption);
  const json = await res.json();
  failConnectCheck(res, json);
  return json
}

// user view 그려주기 함수
function paintUserView(props) {
  $followerBtn.textContent = props.followerCount;
  $followingBtn.textContent = props.followingCount;
  $userImage.src = props.image;
  $userName.textContent = props.username;
  $accountName.textContent = props.accountname;
  $intro.textContent = props.intro;
  if (props.isfollow) {
    const followBtn = document.querySelector(".other-profile .m-button");
    followBtn.classList.add("on");
    followBtn.textContent = "언팔로우";
  }
}


// user View Event
$userView.addEventListener("click", (event) => {
  const currentNode = event.target;

  if (currentNode.className === "follower-btn") {
    // followers list로
    location.href = `/pages/followlist.html?id=${accountName}&page=follower`;

  } else if (currentNode.className === "following-btn") {
    // followings list로
    location.href = `/pages/followlist.html?id=${accountName}&page=following`;

  } else if (currentNode.className === "chat-btn") {
    // 채팅룸으로
    location.href = `/pages/chattingroom.html?id=${accountName}`;

  } else if (currentNode.name === "edit-profile-btn") {
    // 프로필 수정 페이지
    location.href = `/pages/profile.html?id=${accountName}`;

  } else if (currentNode.name === "create-product-btn") {
    // 상품 생성 페이지
    location.href = "/pages/product.html";

  } else if (currentNode.name === "follow-button") {
    // 팔로우 버튼
    handleFollowBtn(currentNode);
  }
});

// 팔로우 repaint 함수
async function handleFollowBtn(Node) {
  let state;
  let followerCount;

  if (Node.className.includes(" on")) {
    // 언팔로우하기
    followerCount = await followAPI("DELETE", "unfollow");
    state = "팔로우";
  } else {
    // 팔로우하기
    followerCount = await followAPI("POST", "follow");
    state = "언팔로우";
  }

  $followerBtn.textContent = followerCount;
  Node.textContent = state;
  Node.classList.toggle("on");
}

// 팔로우 API 함수
async function followAPI(method, modePath) {
  const reqOption = {
    method: method,
    headers: HEADERS
  };
  const res = await fetch(`${ENDPOINT}/profile/${accountName}/${modePath}`, reqOption);
  const json = await res.json();
  failConnectCheck(res, json);
  return json.profile.followerCount;
}

/* product view ----------------------------------------------------- */
// product view 그려주기 함수
function paintProductView(products) {
  products.forEach((el) => {
    const price = parseInt(el.price).toLocaleString("ko-KR");
    $productList.innerHTML += `
      <li
        id=${el.id}
        class="product"
        data-link=${el.link}
      >
        <img src=${el.itemImage} alt="상품 이미지">
        <strong>${el.itemName}</strong>
        <span>${price}원</span>
      </li>
    `;
  });
}

// product 영역 이벤트 추가
$productList.addEventListener("click", (event) => {
  const currentNode = event.target;
  const parentNode = currentNode.parentElement;

  if (accountName !== myAccountName) {
    // 다른 유저 디테일
    window.open(parentNode.dataset.link);
  } else if (parentNode.className === "product") {
    $modal.classList.remove("hidden");
    if ($modal.children[0].children.length < 3) {
      createModalTab(); // link-btn 생성
    }

    const productId = parentNode.id;
    const productLink = parentNode.dataset.link;

    $modal.addEventListener("click", (event) => {
      modalEvent(event, productId, productLink);
    });
  }
});

// 링크 버튼 생성
function createModalTab() {
  const li = document.createElement("li");
  const button = document.createElement("button");
  button.setAttribute("type", "button");
  button.className = "link-btn"
  button.textContent = "웹사이트에서 상품 보기"
  li.appendChild(button);
  $modal.children[0].appendChild(li); // ul에 넣어주기
}

// 모달 이벤트핸들러
function modalEvent(event, productId, productLink) {
  const currentNode = event.target;
  const currentClass = currentNode.className;
  if (currentClass === "modal") {
    // 모달 창 닫기
    $modal.classList.add("hidden")
  } else if (currentClass === "delete-btn") {
    // 상품 삭제 
    if (confirm("해당 상품을 삭제하시겠습니까?")) {
      deleteProduct(productId);
    }
  } else if (currentClass === "edit-btn") {
    // 상품 수정 페이지 이동
    location.href = `/pages/product.html?id=${productId}`;

  } else if (currentClass === "link-btn") {
    // 해당 링크로 이동
    window.open(productLink);
  }
}

// 상품 삭제 API
async function deleteProduct(productId) {
  const reqOption = {
    method: "DELETE",
    headers: HEADERS
  };
  const res = await fetch(`${ENDPOINT}/product/${productId}`, reqOption);
  const json = await res.json();
  alert(json.message)
}

/* post view ----------------------------------------------------- */
// post grid view 그려주기 함수
function paintPostGridView(posts) {
  const $feedGrid = document.querySelector(".feed-grid");
  posts.forEach((post) => {
    if (post.image) {
      const postId = post.id;
      const postImages = post.image.split(",");
      $feedGrid.innerHTML += `
        <li id=postGrid-${postId} class="grid-post">
          <img src=${postImages[0]} alt="포스트 이미지" class="post-img">
        </li>
      `;
      if (postImages.length > 1) {
        $feedGrid.querySelector(`#postGrid-${postId}`).classList.add("multi")
      }
    }
  });
}

// post list view 그려주기 함수
function paintPostListView(posts) {
  posts.forEach((post) => {
    const { author, commentCount, content, createdAt, heartCount, hearted } = post;
    const postId = post.id;
    const postImage = post.image;
    const { accountname, username } = author;
    const userImage = author.image;

    // 포스트에 이미지가 없다면 hidden하기
    const slideWrapperClassName = (postImage)
      ? "slide-wrapper"
      : "slide-wrapper hidden";

    // 좋아요 버튼 확인하기
    const heartBtnClass = (hearted)
      ? "heart-btn on"
      : "heart-btn";

    // 잘못된 이미지 경로 기본 이미지로 바꿔주기
    const userImageUrl = (userImage.match(/https*:\/\/[0-9.]*:5050/) !== null)
      ? userImage
      : "http://146.56.183.55:5050/Ellipse.png";

    // 날짜 변환
    const createDate = transDateFormat(createdAt);

    $feedList.innerHTML += `
      <li id=post-${post.id} class="home-post">
        <img src=${userImageUrl} alt="프로필 사진" class="avatar-img">
        <div class="content-wrap">
          <p class="text-wrap">
            <a href="/pages/profile_detail.html?id=${accountname}">
              <strong>${username}</strong>
              <span>@ ${accountname}</span>
            </a>
            <button type="button" class="more-btn">
              <span class="text-hide">설정 더보기 버트</span>
            </button>
          </p>
          <p class="post-content">${content}</p>

          <div class=${slideWrapperClassName}>
          </div>

          <button 
            type="button"
            class="${heartBtnClass}"
          >${heartCount}</button>
          <button
            type="button"
            class="comment-btn"
          >${commentCount}</button>
          <span class="upload-date">${createDate}</span>
        </div>
      </li>
    `;

    // 이미지가 있을 때만 그려주기
    if (postImage) {
      const postImageList = postImage.split(",");
      paintPostImage(postImageList, postId);

      // 각 포스트의 이미지 슬라이드 wrapper 총 길이 계산
      const slideList = document.querySelector(`#post-${postId} .slide-list`);
      const slideAll = slideList.querySelectorAll(".slide");

      let slideCount = slideAll.length;
      slideList.style.width = (slideWidth + slideMargin) * slideCount - slideMargin + "px";
    }
  });
}

// 포스트 이미지 생성 함수
function paintPostImage(postImageList, postId) {
  const slideWrapper = document.querySelector(`#post-${postId} .slide-wrapper`);
  const slideList = document.createElement("ul");
  const controlBtns = document.createElement("div");
  slideList.className = "slide-list";
  controlBtns.className = "control-btns";

  const btnIdList = ["one", "two", "three"];

  slideList.innerHTML += `
  <li class="slide">
    <img src=${postImageList[0]} alt="포스트 사진" class="post-img"> 
  </li>
  `;
  controlBtns.innerHTML += `
    <button type="button" class="on" name=${btnIdList[0]}></button>
  `;

  if (postImageList.length === 1) {
    slideWrapper.appendChild(slideList);
  } else {
    for (let i = 1; i < 3; i++) {
      slideList.innerHTML += `
      <li class="slide">
        <img src=${postImageList[i]} alt="포스트 사진" class="post-img"> 
      </li>
      `;
      controlBtns.innerHTML += `
        <button type="button" name=${btnIdList[i]}></button>
      `;
    }
    slideWrapper.appendChild(slideList);
    slideWrapper.appendChild(controlBtns);
  }
}

// 날짜 포멧 변환함수 
function transDateFormat(createdAt) {
  const date = new Date(createdAt)
  const year = date.getFullYear(); 
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${year}년 ${month}월 ${day}일`;
}

// 이미지 슬라이드 이동 계산 함수
function moveSlide(num, slideList) {
  slideList.style.left = -num * (slideWidth + slideMargin) + "px";
}

function slideAnimation(Node) {
  const ControlList = Node.parentElement; // .control-btns div
  const ControlBtnAll = ControlList.querySelectorAll("button"); // button list
  const slideList = ControlList.previousElementSibling; // .slide-list ul

  // 이전에 선택되어 있던 위치 찾기
  let prevIdx;
  ControlBtnAll.forEach((el, idx) => {
    if (el.className === "on") prevIdx = idx;
  });
  ControlBtnAll[prevIdx].classList.remove("on");
  Node.classList.add("on");

  switch (Node.name) {
    case "one":
      moveSlide(0, slideList);
      break;
    case "two":
      moveSlide(1, slideList);
      break;
    case "three":
      moveSlide(2, slideList);
      break;
  }
}

// 좋아요 기능 통신
async function heartAPI(route, method, postId, count) {
  const reqOption = {
    method: method,
    headers: HEADERS
  }
  const res = await fetch(`${ENDPOINT}/post/${postId}/${route}`, reqOption);
  const json = await res.json();
  if (json.status === 404) {
    alert("존재하지 않는 게시글입니다.");
    location.href = "/pages/404.html";
  }
  const resultCount = (method === "POST") ? +count + 1 : +count - 1
  return resultCount
}


async function paintHeart(Node, postId) {
  let heartCount;
  if (Node.className.includes("on")) {
    // 좋아요 취소
    heartCount = await heartAPI("unheart", "DELETE", postId, Node.textContent)
  } else {
    // 좋아요
    heartCount = await heartAPI("heart", "POST", postId, Node.textContent)
  }
  Node.classList.toggle("on");
  Node.textContent = heartCount;
}

// 각 포스트 이벤트
$feedList.addEventListener("click", (event) => {
  const currentNode = event.target;
  console.log(currentNode);
  const currentPost = event.path.find((node) => {
    return node.id.split("-")[0] === "post"
  });
  const postId = currentPost.id.split("-")[1];

  if (currentNode.parentElement.className === "control-btns") {
    slideAnimation(currentNode);

  } else if (currentNode.className.includes("heart-btn")) {
    paintHeart(currentNode, postId);

  } else if (currentNode.className === "comment-btn"
    || currentNode.className === "post-img") {
      location.href = `/pages/post_detail.html/?id=${postId}`
    }
});


// 뒤로 가기 버튼
const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", () => {
  history.back();
});

// 에러 처리
function failConnectCheck(res, json) {
  if (!res.ok) {
    alert(json.message);
    location.href = "/pages/404.html";
  }
}
