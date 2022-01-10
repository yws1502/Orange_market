// join page path
const joinPath = "/pages/join.html";

// 초기 화면 3초 동안 보여주기
const splash = document.querySelector(".splash");
const selectLogin = document.querySelector(".select-login");
const loginSection = document.querySelector(".login");

// hello orange market
setTimeout(() => {
  splash.classList.add("hidden");
  selectLogin.classList.remove("hidden");
}, 700);

// 이메일 로그인, 회원가입으로 이동하는 버튼
const selectBtnWrap = selectLogin.querySelector(".btn-wrap")

selectBtnWrap.addEventListener("click", (event) => {
  const className = event.target.className;
  if (className === "login-btn") {
    selectLogin.classList.add("hidden");
    loginSection.classList.remove("hidden");
  } else if (className === "join-btn") {
    location.href = joinPath;
  }
});

// 로그인 화면에서 회원가입 화면으로 이동
const joinLinkBtn = loginSection.querySelector(".link-btn-join");

joinLinkBtn.addEventListener("click", () => {
  location.href = joinPath;
});

// 로그인 input에 값 입력하면 btn 활성화
const loginForm = loginSection.querySelector("form");
const loginBtn = loginSection.querySelector("form button");

function stateHandle(event) {
  if (event.target.value === "") {
    loginBtn.disabled = true;
    loginBtn.classList = "l-disabled-button";
  } else {
    loginBtn.disabled = false;
    loginBtn.classList = "l-button";
  }
}

loginForm.addEventListener("change", stateHandle);
