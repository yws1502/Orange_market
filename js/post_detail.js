import {
  accessCheck,
  searchParam,
  transDateFormat,
  prevPage,
  timeForToday,
  showPage
} from "./common/utility.js";
import {
  ENDPOINT,
  POST_DETAIL_PATH,
  PROFILE_DETAIL_PATH,
  NOT_FOUND_PATH,
} from "./common/path.js";
import {
  MY_ACCOUNTNAME,
  HEADERS_AUTH,
  SLIDE_WIDTH,
  SLIDE_MARGIN,
  NOT_CONNECTED,
} from "./common/constants.js";


const $homePost = document.querySelector(".home-post");
const $commentList = document.querySelector(".comment-view ul");
const $commentInput = document.querySelector("#commentInput");
const $commentForm = document.querySelector(".comment form");
const $modal = document.querySelector(".modal");

const POSTID = searchParam("id");

// 페이지 접근 시 상황에 맞게 처리
window.onload = async () => {
  accessCheck();

  const reqOption = {
    method: "GET",
    headers: HEADERS_AUTH,
  };
  try {
    const postJson = await getDataAPI(`${ENDPOINT}/post/${POSTID}`, reqOption);
    const commentsJson = await getDataAPI(`${ENDPOINT}/post/${POSTID}/comments`, reqOption);
  
    paintPost(postJson.post);
    paintComments(commentsJson.comments);
  } catch {
    location.href = NOT_FOUND_PATH;
  }

  showPage();
};

async function getDataAPI(URL, reqOption) {
  const res = await fetch(URL, reqOption);
  return await res.json();
}


/* 포스트 ---------------------------------------------------------- */
// 포스트 그리기
function paintPost(post) {
  $homePost.innerHTML += createFeed(post);

  // 이미지가 있을 때만 그려주기
  if (post.image) { paintPostImage(post.image); }
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

  return `
  <img src=${author.image} alt="프로필 사진" class="avatar-img">
  <div class="content-wrap">
    <p class="text-wrap">
      <a href="${PROFILE_DETAIL_PATH}?id=${accountname}">
        <strong>${username}</strong>
        <span class="post-accountname">@ ${accountname}</span>
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
  `;
}

// 포스트 이미지 생성 함수
function paintPostImage(postImage) {
  const postImageList = postImage.split(",");

  const slideWrapper = document.querySelector(`.slide-wrapper`);
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
async function heartAPI(route, method, POSTID, count) {
  const reqOption = {
    method: method,
    headers: HEADERS_AUTH,
  };
  try {
    const res = await fetch(`${ENDPOINT}/post/${POSTID}/${route}`, reqOption);
    const json = await res.json();
    if (json.status === 404) {
      alert("존재하지 않는 게시글입니다.");
      location.href = NOT_FOUND_PATH;
    }

    const resultCount = (method === "POST")
      ? +count + 1
      : +count - 1;
    return resultCount
  } catch {
    alert(NOT_CONNECTED);
  }

}


async function paintHeart(Node) {
  const heartCount = (Node.className.includes("on"))
    ? await heartAPI("unheart", "DELETE", POSTID, Node.textContent)
    : await heartAPI("heart", "POST", POSTID, Node.textContent);

  Node.classList.toggle("on");
  Node.textContent = heartCount;
}

// 포스트 이벤트
$homePost.addEventListener("click", (event) => {
  const currentNode = event.target;

  if (currentNode.parentElement.className === "control-btns") {
    slideAnimation(currentNode);

  } else if (currentNode.className.includes("heart-btn")) {
    paintHeart(currentNode);

  }
});


/* 댓글 ---------------------------------------------------------- */

// 댓글 그리기
function paintComments(comments) {
  comments.forEach((el) => {
    const { author, content, createdAt, id } = el;
    const { accountname, image, username } = author;

    $commentList.innerHTML += `
    <li>
      <img src=${image} alt="프로필 사진">
      <div>
        <a href="${PROFILE_DETAIL_PATH}?id=${accountname}">
          <strong>${username}</strong>
          <em>${timeForToday(createdAt)}</em>
        </a>
        <button data-id=${id} class="more-btn">
          <span class="text-hide">더보기 버튼</span>
        </button>
        <p>${content}</p>
      </div>
    </li>
    `;
  });
}

// 버튼 활성화 이벤트
$commentInput.addEventListener("keyup", (event) => {
  const submitBtn = event.target.nextElementSibling;
  if ($commentInput.value) {
    submitBtn.classList.add("on");
  } else {
    submitBtn.classList.remove("on");
  }
});

// 댓글 생성 기능
$commentForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const URL = `${ENDPOINT}/post/${POSTID}/comments`;
  const comment = { content: $commentInput.value }
  const reqOption = {
    method: "POST",
    headers: HEADERS_AUTH,
    body: JSON.stringify({ comment }),
  };
  try {
    const res = await fetch(URL, reqOption);
    const json = await res.json();
  
    if (res.ok) {
      location.href = `${POST_DETAIL_PATH}?id=${POSTID}`;
    } else {
      alert(json.message);
    }
  } catch {
    alert(NOT_CONNECTED);
  }
});

// 댓글 이벤트 달기
$commentList.addEventListener("click", (event) => {
  const currentNode = event.target;
  if (currentNode.className === "more-btn") {
    const commentId = currentNode.dataset.id;
    $modal.classList.remove("hidden");
    const postAccountName 
    = document.querySelector(".post-accountname").textContent.split(" ")[1];

    if (postAccountName !== MY_ACCOUNTNAME) {
      $modal.querySelector(".delete-btn").remove();
    }

    $modal.addEventListener("click", async (event) => {
      event.preventDefault();
      const currentNode = event.target;
      const currentClass = currentNode.className;
      if (currentClass === "modal") {
        $modal.classList.add("hidden");
      } else if (currentClass === "delete-btn") {
        if (confirm("댓글을 삭제하시겠습니까?")) {
          await commentAPI("DELETE", commentId);
          location.href = `${POST_DETAIL_PATH}?id=${POSTID}`;
        }
      } else if (currentClass === "report-btn") {
        await commentAPI("GET", commentId, "report");
      }
      $modal.classList.add("hidden");
    });
  }
});

async function commentAPI(method, commentId, lastUrl=false) {
  const URL = (!lastUrl)
    ? `${ENDPOINT}/post/${POSTID}/comments/${commentId}`
    : `${ENDPOINT}/post/${POSTID}/comments/${commentId}/${lastUrl}`;
  
  const reqOption = {
    method: method,
    headers: HEADERS_AUTH,
  };
  try {
    const res = await fetch(URL, reqOption);
    const json = await res.json();
  
    alert(json.message);
  } catch {
    alert(NOT_CONNECTED);
  }
}


// 뒤로 가기 버튼
const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", prevPage);
