import { SLIDE_MARGIN, SLIDE_WIDTH, HEADERS_AUTH } from "./modules/constants.js";
import { ENDPOINT, POST_DETAIL_PATH, NOT_FOUND_PATH } from "./modules/path.js";
import { accessCheck, transDateFormat, searchPage, showPage } from "./modules/utility.js";


window.onload = async () => {
  accessCheck();

  const $hasFeed = document.querySelector(".has-feed-section");
  const $hasntFeed = document.querySelector(".hasnt-feed-section");

  const reqOption = {
    method: "GET",
    headers: HEADERS_AUTH,
  };
  const res = await fetch(`${ENDPOINT}/post/feed?limit=40`, reqOption);
  const json = await res.json();

  if (json.posts.length === 0) {
    // follow가 없는 경우
    $hasFeed.classList.add("hidden");
    $hasntFeed.classList.remove("hidden");
  } else {
    // follow가 있는 경우
    paintPost(json.posts);
  }
  showPage();
};

function paintPost(posts) {
  const $feedContainer = document.querySelector(".feed-list");

  posts.forEach((post) => {
    $feedContainer.innerHTML += createFeed(post);

    if (post.image) { paintPostImage(post.image, post.id); }
  });
}

function createFeed(post) {
  const { author } = post;
  const { accountname, username } = author;

  const slideWrapperClassName = (post.image)
    ? "slide-wrapper"
    : "slide-wrapper hidden";

  const heartBtnClassName = (post.hearted)
    ? "heart-btn on"
    : "heart-btn";

  const createDate = transDateFormat(post.createdAt);

  return (`
    <li id=post-${post.id} class="home-post">
      <img src=${author.image} alt="프로필 사진" class="avatar-img">
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
        <p class="post-content">${post.content}</p>

        <div class=${slideWrapperClassName}>
        </div>

        <button 
          type="button"
          class="${heartBtnClassName}"
        >${post.heartCount}</button>
        <button
          type="button"
          class="comment-btn"
        >${post.commentCount}</button>
        <span class="upload-date">${createDate}</span>
      </div>
    </li>
  `);
}


function paintPostImage(postImage, postId) {
  const postImageList = postImage.split(",");

  const slideWrapper = document.querySelector(`#post-${postId} .slide-wrapper`);
  const slideList = document.createElement("ul");
  const controlBtns = document.createElement("div");
  slideList.className = "slide-list";
  controlBtns.className = "control-btns";

  slideList.innerHTML += `
  <li class="slide">
    <img src=${postImageList[0]} alt="포스트 사진" class="post-img"> 
  </li>
  `;
  controlBtns.innerHTML += `
    <button type="button" class="on" name="0"></button>
  `;

  if (postImageList.length === 1) {
    slideWrapper.appendChild(slideList);
  } else {
    for (let i = 1; i < postImageList.length; i++) {
      slideList.innerHTML += `
      <li class="slide">
        <img src=${postImageList[i]} alt="포스트 사진" class="post-img"> 
      </li>
      `;
      controlBtns.innerHTML += `
        <button type="button" name=${i}></button>
      `;
    }
    slideWrapper.appendChild(slideList);
    slideWrapper.appendChild(controlBtns);
  }

  // 각 포스트의 이미지 슬라이드 wrapper 총 길이 계산
  let slideCount = slideList.childElementCount;
  slideList.style.width = (SLIDE_WIDTH + SLIDE_MARGIN) * slideCount - SLIDE_MARGIN + "px";
}

// 이미지 슬라이드 이동 계산 함수
function moveSlide(num, slideList) {
  slideList.style.left = -num * (SLIDE_WIDTH + SLIDE_MARGIN) + "px";
}

function slideAnimation(Node) {
  const ControlList = Node.parentElement; // .control-btns div
  const ControlBtnAll = ControlList.querySelectorAll("button"); // button list
  const slideList = ControlList.previousElementSibling; // .slide-list ul

  // 이전에 선택되어 있던 위치와 이동할 위치 찾기
  let prevIdx;
  let moveIdx;
  ControlBtnAll.forEach((el, idx) => {
    if (el.className === "on") {
      prevIdx = idx;
    } else if (+Node.name === idx) {
      moveIdx = idx;
    }
  });
  ControlBtnAll[prevIdx].classList.remove("on");
  Node.classList.add("on");
  moveSlide(moveIdx, slideList);
}

// 좋아요 기능 통신
async function heartAPI(route, method, postId, count) {
  const reqOption = {
    method: method,
    headers: HEADERS_AUTH,
  };
  const res = await fetch(`${ENDPOINT}/post/${postId}/${route}`, reqOption);
  const json = await res.json();
  if (json.status === 404) {
    alert("존재하지 않는 게시글입니다.");
    location.href = NOT_FOUND_PATH;
  }
  const resultCount = (method === "POST") ? +count + 1 : +count - 1
  return resultCount
}


async function paintHeart(Node, postId) {
  const heartCount = (Node.className.includes("on"))
    ? await heartAPI("unheart", "DELETE", postId, Node.textContent)
    : await heartAPI("heart", "POST", postId, Node.textContent);

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
      location.href = `${POST_DETAIL_PATH}?id=${postId}`;
    }
});

document.querySelector(".hasnt-feed-section button")
  .addEventListener("click", searchPage);
