const TOKEN = localStorage.getItem("TOKEN");
const ENDPOINT = "http://146.56.183.55:5050";
const HEADERS = {
  "Authorization" : `Bearer ${TOKEN}`,
  "Content-type" : "application/json"
};

function searchParam(key) {
  return new URLSearchParams(location.search).get(key);
}

const POSTID = searchParam("id");

const $textInput = document.querySelector("#textInput");
const $imageWrapper = document.querySelector(".post-input-section ul");
const $submitBtn = document.querySelector("#submitBtn");

// 포스트 수정인 경우 값 불러오기
if (POSTID) {
  window.onload = async () => {
    const URL = `${ENDPOINT}/post/${POSTID}`;
    const reqOption = {
      method: "GET",
      headers: HEADERS
    };
    const res = await fetch(URL, reqOption);
    const json = await res.json();

    // 잘못된 접근인 경우 경고 후 뒤로 가기
    if (json.status === 404) {
      alert(json.message);
      history.back();
    }
    const content = json.post.content;
    const stringImage = json.post.image;
    const images = stringImage.split(",");

    $textInput.value = content;
    resizeHeight($textInput); // 높이 맞춰주기
    paintImage(images)
  }
}

// 이미지 뿌려주기 함수
function paintImage(images) {
  if (images.length && images.length === 1) {
    $imageWrapper.innerHTML += `
    <li>
      <img
      src=${images[0]}
      alt="게시물 사진"
      class="single-image"
      >
      <button type="button">
        <span class="text-hide">사진 업로드 취소하기</span>
      </button>
    </li>
    `;
  } else if (images.length > 1) {
    images.forEach((image) => {
      $imageWrapper.innerHTML += `
      <li>
          <img
            src=${image}
            alt="게시물 사진"
          >
          <button type="button">
            <span class="text-hide">사진 업로드 취소하기</span>
          </button>
      </li>
      `;
    });
  }
}

// 이미지 취소
$imageWrapper.addEventListener("click", (event) => {
  const currentNode = event.target;
  if (currentNode.tagName === "BUTTON") {
    currentNode.parentElement.remove()
    const $lis = $imageWrapper.children;
    // 만약 삭제 후 이미지가 1개가 남는 다면 single-image 클래스 추가
    if ($lis.length === 1) {
      $lis[0].querySelector("img").classList.add("single-image");
    }
  }
})

// textarea 이벤트
$textInput.addEventListener("keyup", () => {
  resizeHeight($textInput);
  if ($textInput.value) {
    stateBtnContol(true);
  } else {
    stateBtnContol(false);
  }
});

// 버튼 활성화 함수 true를 넘겨준 경우 활성화
function stateBtnContol(state) {
  $submitBtn.className = (state === true)
    ? "ms-button"
    : "ms-disabled-button";
  $submitBtn.disabled = !state;
}

// textarea 높이 조절 함수
function resizeHeight($node) {
  $node.style.height = "0px";
  $node.style.height = `${($node.scrollHeight)}px`;
}

// 뒤로 가기 버튼
const prevBtn = document.querySelector(".prev-btn");

prevBtn.addEventListener("click", () => {
  history.back();
});

