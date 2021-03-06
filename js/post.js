import { ENDPOINT, PROFILE_DETAIL_PATH } from "./common/path.js";
import { HEADERS_AUTH, NOT_CONNECTED } from "./common/constants.js";
import { accessCheck, searchParam, prevPage, showPage } from "./common/utility.js";
import { NOT_FOUND_PATH } from "./common/path.js";

// access check function

accessCheck();
const POSTID = searchParam("id");

const $textInput = document.querySelector("#textInput");
const $imageWrapper = document.querySelector(".post-input-section ul");
const $submitBtn = document.querySelector("#submitBtn");
const $imageInput = document.querySelector("#imageInput");
const $form = document.querySelector("form");

document.querySelector(".avatar-image").src = localStorage.getItem("PROFILE_IMAGE");

// 포스트 수정인 경우 값 불러오기
if (POSTID) {
  window.onload = async () => {
    const URL = `${ENDPOINT}/post/${POSTID}`;
    const reqOption = {
      method: "GET",
      headers: HEADERS_AUTH,
    };
    try {
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
      paintPreviewImage(images)
    } catch {
      location.href = NOT_FOUND_PATH;
    }
  }
}
showPage();

// 이미지 서버에 올리기
$imageInput.addEventListener("change", async () => {
  const limit = 3 - $imageWrapper.childElementCount;

  if ($imageInput.files.length > limit) {
    // 제한을 넘긴 경우
    const infoMsg = (limit)
      ? `업로드 갯수 제한이 넘었습니다. [${3-limit} / 3]`
      : "총 3장의 이미지만 업로드 가능합니다.";
    alert(infoMsg);
    // $imageInput에 files 값 초기화
    $imageInput.files = new DataTransfer().files;
  } else {
    stateBtnContol(true)
    const formData = new FormData();
    [].forEach.call($imageInput.files, ((file) => {
      formData.append("image", file);
    }));
    const stringImageUrl = await uploadImages(formData);
    const imageUrls = stringImageUrl.split(",");
    paintPreviewImage(imageUrls)
  };
});

// 이미지 API
async function uploadImages(formData) {
  const URL = `${ENDPOINT}/image/uploadfiles`;
  const reqOption = {
    method: "POST",
    body: formData
  };
  try {
    const res = await fetch(URL, reqOption);
    const json = await res.json();
    const result = json.map((file) => `${ENDPOINT}/${file.filename}`);
    return result.join(",");
  } catch {
    alert(NOT_CONNECTED);
  }
}

// 이미지 뿌려주기 함수
function paintPreviewImage(images) {
  // 사진을 뿌려준 것이 없고 한개만 들어온 경우
  if (!$imageWrapper.childElementCount
      && images.length === 1) {
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
  } else if (images.length > 0) {
    // 이미 이미지가 1개만 업로드 되어 있는 경우 처리
    if ($imageWrapper.childElementCount === 1) {
      $imageWrapper.children[0].querySelector("img")
        .classList.remove("single-image");
    }
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

// 게시물 게시
$form.addEventListener("submit", async (event) => {
  event.preventDefault();
  const postImages = $imageWrapper.querySelectorAll("img");
  const imageUrls = [].map.call(postImages, (el) => el.src);
  const stringImageUrl = imageUrls.join(",");
  const post = {
    content: $textInput.value,
    image: stringImageUrl
  };
  try {
    if (POSTID) {
      await uploadPost("PUT", post, POSTID);
    } else {
      await uploadPost("POST", post);
    }
    location.href = PROFILE_DETAIL_PATH;
  } catch {
    alert(NOT_CONNECTED);
  }
});

// 서버에 올리기
async function uploadPost(method, post, lastUrl=false) {
  const URL = (lastUrl)
    ? `${ENDPOINT}/post/${lastUrl}`
    : `${ENDPOINT}/post`;

  const reqOption = {
    method: method,
    headers: HEADERS_AUTH,
    body: JSON.stringify({ post }),
  };
  const res = await fetch(URL, reqOption);
}


// 뒤로 가기 버튼
document.querySelector(".prev-btn")
  .addEventListener("click", prevPage);


