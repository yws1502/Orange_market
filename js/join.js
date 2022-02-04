import { ENDPOINT, LOGIN_PATH } from "./modules/path.js";
import { HEADERS } from "./modules/constants.js";


const joinSection = document.querySelector(".join");
const joinInputList = document.querySelectorAll(".join input");
const nextBtn = document.querySelector(".join button");
// 이메일 비밀번호 둘다 입력했을 떄 button 활성화
const emailInput = document.querySelector("#Email");
const pwdInput = document.querySelector("#Pwd");
const pwdConfirmInput = document.querySelector("#PwdConfirm");
const setProfileSection = document.querySelector(".set-profile");
const setProfileInputList = document.querySelectorAll(".set-profile input")
const setProfileBtn = document.querySelector(".set-profile button");
const imageInput = document.querySelector(".image-input-wrap #imageInput");
const previewImage = document.querySelector(".image-input-wrap .previewImage");
const form = document.querySelector("form");
const totalInputList = document.querySelectorAll("form input");


// 버튼 활성화 함수
function stateHandle(inputList, inputBtn, limit) {
  let check = 0;
  inputList.forEach((el) => { if (el.value !== "") { check++ }; })
  if (check >= limit) {
    inputBtn.disabled = false;
    inputBtn.classList = "l-button";
  } else {
    inputBtn.disabled = true;
    inputBtn.classList = "l-disabled-button";
  }
}

// validation
function validator(event) {
  const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const stringNumberFormay = /^[a-zA-Z0-9._]+$/;
  let resultBool;
  const parentNode = event.target.parentElement;
  let inputNode = event.target;

  function check(regex, length) {
    if ((regex && inputNode.value.match(regex))
      || (length && inputNode.value.length >= length)) {
      parentNode.classList.remove("err");
      return true
    }
    else {
      parentNode.classList.add("err");
      inputNode.value = ""
      return false
    }
  }
  if (event.target.id === "Email") { 
    resultBool = check(mailFormat);
  } else if (event.target.id === "Pwd") { 
    resultBool = check(null, 6);
  } else {
    // 계정 검사인 경우
    resultBool = check(stringNumberFormay);
  }
  return resultBool;
}

async function emailValidator(event) {
  const parentNode = event.target.parentElement;
  if (validator(event)) {
    user = { "email": event.target.value };
    const reqOption = {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ user })
    };
    const res = await fetch(`${ENDPOINT}/user/emailvalid`, reqOption);
    const json = await res.json();

    // 사용이 불가한 이메일인 경우 처리
    if (json.message !== "사용 가능한 이메일 입니다.") {
      parentNode.classList.add("err");
      const errMsg = parentNode.querySelector(".err-msg");
      errMsg.textContent = `*${json.message}`;
    } else {
      parentNode.classList.remove("err");
    }
  } else {
    const errMsg = parentNode.querySelector(".err-msg");
    errMsg.textContent = "*이메일 형식이 맞지 않습니다.";
  }
}

// 회원가입 창 input 값이 채워진 경우 버튼 활성화
joinSection.addEventListener("change", () => {
  stateHandle(joinInputList, nextBtn, joinInputList.length)
});

// input값 validation
emailInput.addEventListener("change", emailValidator);
pwdInput.addEventListener("change", validator);
pwdConfirmInput.addEventListener("change", (event) => {
  const currentNode = event.target;
  const parentNode = event.target.parentElement;
  if (currentNode.value !== pwdInput.value) {
    parentNode.classList.add("err");
    currentNode.value = "";
  } else {
    parentNode.classList.remove("err");
  }
})

// 프로필 설정 페이지로 보여주기 버튼
nextBtn.addEventListener("click", (event) => {
  event.preventDefault();
  joinSection.classList.add("hidden");
  setProfileSection.classList.remove("hidden");
});


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

// 사용자가 프로필 사진을 설정 안한 경우
async function uploadDefaultImage() {
  const dataForm = new FormData();
  const defaultImage = new File(["foo"], previewImage.src, { type: "image/png" });
  dataForm.append("image", defaultImage);

  const imageData = await uploadImage(dataForm);
  const imageUrl = `${ENDPOINT}/${imageData}`;

  return imageUrl;
}

// prevImage 변경
async function setPrevImage() {
  const formData = new FormData();
  formData.append("image", imageInput.files[0]);
  
  // 서버 통신으로 받은 이미지로 prev-image 변경
  const imageData = await uploadImage(formData); // filename 반환
  const imageUrl = `${ENDPOINT}/${imageData}`;
  previewImage.src = imageUrl;
}

imageInput.addEventListener("change", setPrevImage);


// 프로필 설정 버튼 활성화
setProfileSection.addEventListener("change", () => {
  stateHandle(setProfileInputList, setProfileBtn, setProfileInputList.length - 2)
});

accountInput.addEventListener("change", validator);


// 회원가입 및 프로필 생성
async function createUser(event) {
  event.preventDefault();
  const user = {};
  totalInputList.forEach(async (node) => {
    // 비밀번호 재확인은 무시하고 나머지만
    if (node.id !== "PwdConfirm") {
      if (node.type === "file") {
        // 이미지인 경우
        const imageUrl = (node.value === "")
          ? await uploadDefaultImage() // default image
          : previewImage.src; // set profile image
        user[node.name] = imageUrl;
      } else {
        // 이미지가 아닌 경우
        user[node.name] = node.value;
      }
    }
  });

  const reqOption = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({user})
  }

  const res = await fetch(`${ENDPOINT}/user`, reqOption);
  const json = await res.json();

  if (json.status) {
    alert(json.message);
  } else {
    location.href = LOGIN_PATH;
  }
}

form.addEventListener("submit", createUser);
