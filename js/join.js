const joinSection = document.querySelector(".join");
const createProfile = document.querySelector(".create-profile");

// 회원가입 창 input 값이 채워진 경우 버튼 활성화
const joinForm = joinSection.querySelector("form");
const joinBtn = joinSection.querySelector("button");

const emailField = joinSection.querySelector(".email-input");
const emailInput = document.querySelector("#Email");
const pwdInput = document.querySelector("#Pwd");

// 이메일 비밀번호 둘다 입력했을 떄 button 활성화
function stateHandle() {
  if (emailInput.value === "" || pwdInput.value === "") {
    joinBtn.disabled = true;
    joinBtn.classList = "l-disabled-button";
  } else {
    joinBtn.disabled = false;
    joinBtn.classList = "l-button";
  }
}

// 이메일 validation
function validatier(event) {
  const mailFormat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  const parentNode = event.target.parentElement;

  // 이메일인 경우
  if (event.target.id === "Email") {
    if (event.target.value.match(mailFormat)) {
      parentNode.classList.remove("err");
    } else {
      parentNode.classList.add("err");
    }
  // 비밀번호인 경우
  } else {
    if (event.target.value.length < 6) {
      parentNode.classList.add("err");
    } else {
      parentNode.classList.remove("err");
    }
  }
}

joinForm.addEventListener("change", stateHandle);
emailInput.addEventListener("change", validatier);
pwdInput.addEventListener("change", validatier);

