const TOKEN = localStorage.getItem("TOKEN");
const ENDPOINT = "http://146.56.183.55:5050";
const MYACCOUNTNAME = localStorage.getItem("ACCOUNTNAME");

const HEADERS = {
  "Authorization" : `Bearer ${TOKEN}`,
  "Content-type" : "application/json"
};

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

const $homePost = document.querySelector(".home-post");
const $commentList = document.querySelector(".comment-view ul");
const $commentInput = document.querySelector("#commentInput");
const $commentForm = document.querySelector(".comment form");
const $modal = document.querySelector(".modal");

function searchParam(key) {
  return new URLSearchParams(location.search).get(key);
}

const POSTID = searchParam("id");

// 이미지 슬라이드 가로길이
const slideWidth = 304;
const slideMargin = 20;

// 페이지 접근 시 상황에 맞게 처리
window.onload = async () => {
  const reqOption = {
    method: "GET",
    headers: HEADERS,
  };
  const postJson = await getDataAPI(`${ENDPOINT}/post/${POSTID}`, reqOption);
  const commentsJson = await getDataAPI(`${ENDPOINT}/post/${POSTID}/comments`, reqOption);

  paintPost(postJson.post);
  paintComments(commentsJson.comments);
};

async function getDataAPI(URL, reqOption) {
  const res = await fetch(URL, reqOption);
  return await res.json();
}


/* 포스트 ---------------------------------------------------------- */
// 포스트 그리기
function paintPost(post) {
  const { author, commentCount, content, createdAt, heartCount, hearted } = post;
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

  $homePost.innerHTML += `
    <img src=${userImageUrl} alt="프로필 사진" class="avatar-img">
    <div class="content-wrap">
      <p class="text-wrap">
        <a href="/pages/profile_detail.html?id=${accountname}">
          <strong>${username}</strong>
          <span class="post-accountname">@ ${accountname}</span>
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
  `;

  // 이미지가 있을 때만 그려주기
  if (postImage) {
    const postImageList = postImage.split(",");
    paintPostImage(postImageList);

    // 각 포스트의 이미지 슬라이드 wrapper 총 길이 계산
    const slideList = document.querySelector(`.slide-list`);
    const slideAll = slideList.querySelectorAll(".slide");

    let slideCount = slideAll.length;
    slideList.style.width = (slideWidth + slideMargin) * slideCount - slideMargin + "px";
  }
}

// 포스트 이미지 생성 함수
function paintPostImage(postImageList) {
  const slideWrapper = document.querySelector(`.slide-wrapper`);
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
async function heartAPI(route, method, POSTID, count) {
  const reqOption = {
    method: method,
    headers: HEADERS
  }
  const res = await fetch(`${ENDPOINT}/post/${POSTID}/${route}`, reqOption);
  const json = await res.json();
  if (json.status === 404) {
    alert("존재하지 않는 게시글입니다.");
    location.href = "/pages/404.html";
  }
  const resultCount = (method === "POST") ? +count + 1 : +count - 1
  return resultCount
}


async function paintHeart(Node) {
  let heartCount;
  if (Node.className.includes("on")) {
    // 좋아요 취소
    heartCount = await heartAPI("unheart", "DELETE", POSTID, Node.textContent)
  } else {
    // 좋아요
    heartCount = await heartAPI("heart", "POST", POSTID, Node.textContent)
  }
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
        <a href="/pages/profile_detail.html?id=${accountname}">
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

// 생성일자와 현재 시간 비교 함수
function timeForToday(startDate) {
  const today = new Date();
  const timeValue = new Date(startDate);

  const betweenTime = Math.floor((today.getTime() - timeValue.getTime()) / 1000 / 60);
  if (betweenTime < 1) return "방금 전";
  if (betweenTime < 60) return `${betweenTime}분 전`;

  const betweenTimeHour = Math.floor(betweenTime / 60);
  if (betweenTimeHour < 24) {
    return `${betweenTimeHour}시간 전`
  };

  const betweenTimeDay = Math.floor(betweenTimeHour / 24 );
  if (betweenTimeDay < 365) {
    return `${betweenTimeDay}일 전`
  };

  return `${Math.floor(betweenTimeDay / 365)}년 전`;
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
    headers: HEADERS,
    body: JSON.stringify({ comment })
  }
  const res = await fetch(URL, reqOption);
  const json = await res.json();

  if (res.ok) {
    location.href = `/pages/post_detail.html?id=${POSTID}`;
  } else {
    alert(json.message)
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

    if (postAccountName !== MYACCOUNTNAME) {
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
          location.href = `/pages/post_detail.html?id=${POSTID}`;
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
    headers: HEADERS
  }
  const res = await fetch(URL, reqOption);
  const json = await res.json();

  alert(json.message);
}


// 뒤로 가기 버튼
const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", () => {
  history.back();
});
