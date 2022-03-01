import { ENDPOINT, JOIN_PATH } from "./common/path.js";
import { HEADERS, NOT_CONNECTED } from "./common/constants.js";


const selectLogin = document.querySelector(".select-login");
const splash = document.querySelector(".splash");
const loginSection = document.querySelector(".login");
const selectLoginBtnWrap = selectLogin.querySelector(".btn-wrap")
const loginForm = loginSection.querySelector("form");
const loginInputs = loginSection.querySelectorAll("input");
const loginBtn = loginSection.querySelector("form button");

// hello orange market
setTimeout(() => {
  selectLogin.classList.remove("show-effect");
  splash.classList.add("hidden");
}, 2100);

// 화면 이동 함수 (이메일 로그인, 회원가입)
function changeLoginWindow(event) {
  const className = event.target.className;
  
  if (className === "login-btn") {
    selectLogin.classList.add("hidden");
    loginSection.classList.remove("hidden");
  } else if (className === "join-btn") {
    location.href = JOIN_PATH;
  }
}

// 화면 이동 함수 (이메일 로그인, 회원가입)
selectLoginBtnWrap.addEventListener("click", changeLoginWindow);


// 로그인 화면에서 회원가입 화면으로 이동
document.querySelector(".login .link-btn-join").addEventListener("click", () => {
  location.href = JOIN_PATH;
});

// 로그인 input에 값 입력하면 btn 활성화
function stateHandle() {
  let check = 0;
  loginInputs.forEach((el) => {if (el.value !== "") check++})

  if (check === loginInputs.length) {
    loginBtn.disabled = false;
    loginBtn.classList = "l-button";
  } else {
    loginBtn.disabled = true;
    loginBtn.classList = "l-disabled-button";
  }
}

// 입력값들이 채워지면 버튼 활성화
loginForm.addEventListener("keyup", stateHandle)


// 로그인 통신
async function loginApi(event) {
  event.preventDefault();
  const user = {};
  loginInputs.forEach((el) => {user[el.name] = el.value});
  
  const reqOption = {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({user})
  };

  try {
    const res = await fetch(`${ENDPOINT}/user/login`, reqOption);
    const json = await res.json();
  
    if (json.status === 422) {
      // 화면에 에러 메세지 동적 생성
      const pwdWrap = document.querySelector(".pwd-wrap");
      const errorMsg = pwdWrap.querySelector(".err-msg");
      pwdWrap.classList.add("err");
      errorMsg.classList.remove("hidden");
      errorMsg.textContent = `*${json.message}`;
      alert(json.message);
    } else {
      // 토큰 저장 후 메인 피드 화면으로 이동
      localStorage.setItem("TOKEN", json.user.token);
      localStorage.setItem("ACCOUNTNAME", json.user.accountname);
      localStorage.setItem("PROFILE_IMAGE", json.user.image);
      location.href = "/";
    }
  } catch {
    alert(NOT_CONNECTED);
  }
};

// 로그인 기능 구현
loginBtn.addEventListener("click", loginApi);
