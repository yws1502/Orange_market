import { prevPage, accessCheck, showPage } from "./common/utility.js";
import { CHATTING_LIST_PATH } from "./common/path.js"


accessCheck();
showPage();

const $settingMoreBtn = document.querySelector(".more-btn");
const $modal = document.querySelector(".modal");
const $chatroom = document.querySelector(".chatting-room");
const $chatContainer = $chatroom.querySelector(".chatting-room .chatting-cont");
const $chatTextInput = document.querySelector("#chatTextInput");
const $chatSubmitBtn = document.querySelector(".chat-submit-btn");
const $scroll = document.querySelector("html");

$scroll.scrollTop = $scroll.scrollHeight;

$settingMoreBtn.addEventListener("click", () => {
  $modal.classList.remove("hidden");
  $modal.addEventListener("click", (event) => {
    const currentNode = event.target;
    if (currentNode.className === "modal") {
      $modal.classList.add("hidden");
    } else if (currentNode.tagName === "BUTTON") {
      location.href = CHATTING_LIST_PATH;
    }
  });
});

$chatTextInput.addEventListener("keyup", () => {
  if ($chatTextInput.value) {
    $chatSubmitBtn.classList.add("on");
    $chatSubmitBtn.disabled = false;
  }
});

$chatSubmitBtn.addEventListener("click", (event) => {
  event.preventDefault();
  const li = document.createElement("li");
  const date = new Date();
  const hour = date.getHours();
  const min =
    date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
  const currentTime = `${hour}:${min}`;

  li.className = "my-user";
  li.innerHTML = `
        <p class="sended-text">${$chatTextInput.value}</p>
        <em class="sended-time">${currentTime}</em>
      `;
  $chatContainer.appendChild(li);
  $scroll.scrollTop = $scroll.scrollHeight;
  $chatTextInput.value = "";
});

// 뒤로 가기 버튼
document.querySelector(".prev-btn")
  .addEventListener("click", prevPage);
