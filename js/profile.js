import { ENDPOINT } from "./common/path.js";
import {
  MY_ACCOUNTNAME,
  HEADERS_AUTH,
  NOT_CONNECTED,
} from "./common/constants.js";
import { accessCheck, prevPage, showPage } from "./common/utility.js";
import { NOT_FOUND_PATH } from "./common/path.js";


accessCheck();

// 이메일 비밀번호 둘다 입력했을 떄 button 활성화
const $setProfileSection = document.querySelector(".set-profile");
const $setProfileBtn = document.querySelector("#submitBtn");
const $imageInput = document.querySelector(".image-input-wrap #imageInput");
const $previewImage = document.querySelector(".image-input-wrap .previewImage");
const $accountInput = document.querySelector("#accountInput")
const $form = document.querySelector("form");
const $totalInputList = document.querySelectorAll("form input");

// 기존 profile 정보 가져와서 채우기
window.onload = async () => {
  const URL = `${ENDPOINT}/profile/${MY_ACCOUNTNAME}`;
  const reqOption = {
    method: "GET",
    headers: HEADERS_AUTH,
  };
  try {
    const res = await fetch(URL, reqOption);
    const json = await res.json();
  
    const { username, accountname, image, intro } = json.profile;
    $previewImage.src = image;
    $totalInputList[1].value = username;
    $totalInputList[2].value = accountname;
    $totalInputList[3].value = intro;
  } catch {
    location.href = NOT_FOUND_PATH;
  }
  showPage();
}

// validation
function validator(event) {
  const regex = /^[a-zA-Z0-9._]+$/;
  const parentNode = event.target.parentElement;
  let inputNode = event.target;

  if (inputNode.id === "accountInput") {
    if (inputNode.value.match(regex)) {
      parentNode.classList.remove("err");
    } else {
      parentNode.classList.add("err");
    }
  }
}

$accountInput.addEventListener("change", validator);

// 프로필 preview 설정 화면
// 서버에 이미지 올리기
async function uploadImage(formData) {
  const res = await fetch(`${ENDPOINT}/image/uploadfile`, {
      method: "POST",
      body: formData
  });
  const json = await res.json();
  return json.filename;
}

// previewImage 변경
async function setPreviewImage() {
  const formData = new FormData();
  formData.append("image", $imageInput.files[0]);
  
  try {
    const imageData = await uploadImage(formData); // filename 반환
    const imageUrl = `${ENDPOINT}/${imageData}`;
    $previewImage.src = imageUrl;
  } catch {
    alert(NOT_CONNECTED);
  }
}

$imageInput.addEventListener("change", setPreviewImage);

// 버튼 활성화 함수
function stateHandle(inputList, inputBtn, limit) {
  let check = 0;
  inputList.forEach((el) => { if (el.value !== "") { check++ }; })
  if (check >= limit) {
    inputBtn.disabled = false;
    inputBtn.classList = "m-button";
  } else {
    inputBtn.disabled = true;
    inputBtn.classList = "m-disabled-button";
  }
}

// 프로필 설정 버튼 활성화
$setProfileSection.addEventListener("change", () => {
  const limit = $totalInputList.length - 2;
  stateHandle($totalInputList, $setProfileBtn, limit)
});


// 회원가입 및 프로필 생성
async function updateProfile(event) {
  event.preventDefault();
  const user = {};
  $totalInputList.forEach(async (node) => {
    // 이미지인 경우와 아닌 경우 처리
    user[node.name] = (node.type === "file")
      ? $previewImage.src
      : node.value
  });

  const reqOption = {
    method: "PUT",
    headers: HEADERS_AUTH,
    body: JSON.stringify({ user }),
  };

  try {
    const res = await fetch(`${ENDPOINT}/user`, reqOption);
    const json = await res.json();
    if (json.status) {
      alert(json.message);
    } else {
      // 새로운 accountname 갱신
      const newAccountName = json.user.accountname;
      localStorage.setItem("ACCOUNTNAME", newAccountName);
      location.href = PROFILE_DETAIL_PATH;
    }
  } catch {
    alert(NOT_CONNECTED);
  }
}

$form.addEventListener("submit", updateProfile);

// 뒤로 가기 버튼
document.querySelector(".prev-btn")
  .addEventListener("click", prevPage);

