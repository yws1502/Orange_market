const joinSection = document.querySelector(".join");
const nextBtn = document.querySelector(".join button");

// 이메일 비밀번호 둘다 입력했을 떄 button 활성화
const emailInput = document.querySelector("#Email");
const pwdInput = document.querySelector("#Pwd");

function stateHandle(inputValue1, inputValue2, inputBtn) {
  if (inputValue1 === "" || inputValue2 === "") {
    inputBtn.disabled = true;
    inputBtn.classList = "l-disabled-button";
  } else {
    inputBtn.disabled = false;
    inputBtn.classList = "l-button";
  }
}

// validation
function validator(event) {
  const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const stringNumberFormay = /^[a-zA-Z0-9._]+$/;
  const parentNode = event.target.parentElement;

  // 이메일인 경우
  if (event.target.id === "Email") {
    if (event.target.value.match(mailFormat)) {
      parentNode.classList.remove("err");
    } else {
      parentNode.classList.add("err");
      event.target.value = "";
    }
  // 비밀번호인 경우
  } else if (event.target.id === "Pwd") {
    if (event.target.value.length > 6) {
      parentNode.classList.remove("err");
    } else {
      parentNode.classList.add("err");
      event.target.value = "";
    }
  } else {
    // 계정 아이디인 경우
    if (event.target.value.match(stringNumberFormay)) {
      parentNode.classList.remove("err");
    } else {
      parentNode.classList.add("err");
      event.target.value = "";
    }
  }
}

// 회원가입 창 input 값이 채워진 경우 버튼 활성화
joinSection.addEventListener("change", () => {
  stateHandle(emailInput.value, pwdInput.value, nextBtn)
});
emailInput.addEventListener("change", validator);
pwdInput.addEventListener("change", validator);

// 프로필 설정 페이지로 이동 버튼
const setProfileSection = document.querySelector(".set-profile");

nextBtn.addEventListener("click", (event) => {
  event.preventDefault();
  joinSection.classList.add("hidden");
  setProfileSection.classList.remove("hidden");
});


// 프로필 preview 설정 화면
const imgInput = document.querySelector(".img-input-wrap #imgInput");

function readImage(input) {
  // input type file에 이미지가 있다면
  if (input.files && input.files[0].type === "image/png") {
    // fileReader 객체 생성 후 원하는 곳에 src를 넣어준다.
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const avatarImg = document.querySelector(".img-input-wrap img");
      avatarImg.src = event.target.result;
    }
    reader.readAsDataURL(input.files[0]);
  }
}

imgInput.addEventListener("change", (event) => {
  readImage(event.target);
});

// set profile 버튼 활성화

const userNameInput = document.querySelector(".set-profile #userNameInput");
const accountInput = document.querySelector(".set-profile #accountInput");
const setProfileBtn = document.querySelector(".set-profile button");

setProfileSection.addEventListener("change", () => {
  stateHandle(userNameInput.value, accountInput.value, setProfileBtn)
});
accountInput.addEventListener("change", validator);
