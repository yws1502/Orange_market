const ENDPOINT = "http://146.56.183.55:5050";
const HEADERS = {
  "Authorization" : `Bearer ${localStorage.getItem("TOKEN")}`,
  "Content-type" : "application/json"
};
const hasFeed = document.querySelector(".has-feed-section");
const hasntFeed = document.querySelector(".hasnt-feed-section");

window.onload = async () => {
  const reqOption = {
    method: "GET",
    headers: HEADERS
  }
  const res = await fetch(`${ENDPOINT}/post/feed`, reqOption);
  const json = await res.json();
  console.log(json)
  if (json.posts.length === 0) {
    // follow가 없는 경우
    hasFeed.classList.add("hidden");
    hasntFeed.classList.remove("hidden");
  } else {
    // follow가 있는 경우
    const feedList = document.querySelector(".feed-list");

    json.posts.forEach((post, idx) => {
      const { author, content, createdAt, heartCount, hearted } = post;
      const postId = post.id;
      const postImage = post.image;
      const { accountname, username } = author;
      const userId = author._id;
      const userImage = author.image;

      // 잘못된 이미지 경로 기본 이미지로 바꿔주기
      const imageUrl = (userImage.match(/https*:\/\/[0-9.]*:5050/) !== null)
        ? userImage
        : "http://146.56.183.55:5050/Ellipse.png";

      feedList.innerHTML += `
      <li id=${postId} class="home-post">
          <img src=${imageUrl} alt="프로필 사진" class="avatar-img">
          <div class="content-wrap">
            <p class="text-wrap">
              <a href="/pages/profile.html?=id${userId}">
                <strong>애월읍 위니브 감귤농장</strong>
                <span>@ weniv_Mandarin</span>
              </a>
              <button type="button" class="more-btn">
                <span class="text-hide">설정 더보기 버트</span>
              </button>
            </p>
            <p class="post-content">Lorem, ipsum dolor sit amet consectetur adipisicing elit. Obcaecati beatae ipsam quaerat aperiam, dolor sapiente alias nihil dignissimos asperiores ex ipsa esse cum distinctio nostrum illum voluptatem ratione, earum ad?</p>
            <div class="slide-wrapper">
              <ul class="slide-list">
                <li class="slide">
                  <img src="/images/post-img-example.png" alt="포스트 사진" class="post-img"> 
                </li>
                <li class="slide">
                  <img src="/images/post-img-example.png" alt="포스트 사진" class="post-img"> 
                </li>
                <li class="slide">
                  <img src="/images/post-img-example.png" alt="포스트 사진" class="post-img"> 
                </li>
              </ul>
              <div class="control-btns">
                <button class="on" id="one"></button>
                <button id="two"></button>
                <button id="three"></button>
              </div>
            </div>
            <button 
              type="button"
              class="heart-btn"
              data-count="58"
            >58</button>
            <button
              type="button"
              class="comment-btn"
              data-count="12"
            >12</button>
            <span class="upload-date">2020년 10월 21일</span>
          </div>
        </li>
      `;
    });
  }
}

// 이미지 슬라이드
const slides = document.querySelector(".slide-list");
const slide = document.querySelectorAll(".slide-list .slide")
const slideControlWrap = document.querySelector(".control-btns");
const slideControlBtns = document.querySelectorAll(".control-btns button");
const slideWidth = 304;
const slideMargin = 20;
let slideCount = slide.length;
let currentIdx = 0;

// 이미지 슬라이드 wrapper 총 길이 계산
slides.style.width = (slideWidth + slideMargin) * slideCount - slideMargin + "px";

// 이미지 슬라이드 값 계산
function moveSlide(num) {
  slides.style.left = -num * (slideWidth + slideMargin) + "px";
  currentIdx = num;
}

// 이미지 슬라이드 이벤트
slideControlWrap.addEventListener("click", (event) => {
  const currentNode = event.target;

  if (currentNode.tagName === "BUTTON"
    && currentIdx < slideCount) {
    // 버튼 색 변경
    slideControlBtns[currentIdx].classList.toggle("on")
    currentNode.classList.toggle("on");

    // 슬라이드 이미지 변경
    switch (currentNode.id) {
      case "one":
        moveSlide(0); break
        case "two":
        moveSlide(1); break
        case "three":
        moveSlide(2); break
    }
  }
})

// 검색화면으로 이동 버튼
const searchBtn = document.querySelector(".hasnt-feed-section button");
searchBtn.addEventListener("click", () => {
  location.href = "/pages/search.html";
})
