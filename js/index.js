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
