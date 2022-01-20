const ENDPOINT = "http://146.56.183.55:5050";
const HEADERS = {
  "Authorization": `Bearer ${localStorage.getItem("TOKEN")}`,
  "Content-type": "application/json",
};
const hasFeed = document.querySelector(".has-feed-section");
const hasntFeed = document.querySelector(".hasnt-feed-section");

// 이미지 슬라이드 가로길이
const slideWidth = 304;
const slideMargin = 20;

// 페이지 접근 시 상황에 맞게 처리
window.onload = async () => {
  const reqOption = {
    method: "GET",
    headers: HEADERS,
  };
  const res = await fetch(`${ENDPOINT}/post/feed`, reqOption);
  if (!res.ok) { location.href = "/pages/404.html"; }
  const json = await res.json();

  if (json.posts.length === 0) {
    // follow가 없는 경우
    hasFeed.classList.add("hidden");
    hasntFeed.classList.remove("hidden");
  } else {
    // follow가 있는 경우
    paintPost(json.posts);
  }
};

// 포스트 컴포넌트
function paintPost(posts) {
  // follow가 있는 경우
  const feedList = document.querySelector(".feed-list");

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

    feedList.innerHTML += `
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
const feedList = document.querySelector(".feed-list");
feedList.addEventListener("click", (event) => {
  const currentNode = event.target;
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

// 검색화면으로 이동 버튼
const searchBtn = document.querySelector(".hasnt-feed-section button");
searchBtn.addEventListener("click", () => {
  location.href = "/pages/search.html";
});
