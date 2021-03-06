import {
  ENDPOINT,
  NOT_FOUND_PATH,
  PROFILE_DETAIL_PATH,
} from "./common/path.js";
import { HEADERS_AUTH, NOT_CONNECTED } from "./common/constants.js";
import { accessCheck, searchParam, prevPage, showPage } from "./common/utility.js";


accessCheck();

const $inputList = document.querySelectorAll(".product-app input");
const $submitBtn = document.querySelector("#submitBtn");
const $previewImage = document.querySelector(".preview-image");
const $ProductApp = document.querySelector(".product-app");
const $imageInput = document.querySelector("#imageInput");

const productId = searchParam("id");

// 상품 수정으로 접근 시
if (productId) {
  // 페이지 로딩될 때 값들 뿌려주기
  window.onload = async () => {
    const URL = `${ENDPOINT}/product/detail/${productId}`
    const reqData = {
      method: "GET",
      headers: HEADERS_AUTH,
    };
    try {
      const res = await fetch(URL, reqData);
      const json = await res.json();
  
      // 예외 처리
      if (json.status === "404") {
        alert(json.message);
        location.href = NOT_FOUND_PATH;
      } else {
        const { itemImage, itemName, price, link } = json.product;
  
        // 해당 product 값 뿌리기
        $previewImage.src = itemImage;
        $previewImage.classList.remove("hidden");
        $inputList[1].value = itemName;
        $inputList[2].value = price;
        $inputList[3].value = link;
      }
    } catch {
      location.href = NOT_FOUND_PATH;
    }
  }
}
showPage();

// 서버에 이미지 올리기
async function uploadImage (formData) {
  try {
    const res = await fetch(`${ENDPOINT}/image/uploadfile`, {
      method: "POST",
      body: formData
    });
    const data = await res.json();
    return data.filename;
  } catch {
    alert(NOT_CONNECTED);
  }
}

// prevImage 변경
async function setPreviewImage() {
  const formData = new FormData();
  formData.append("image", $imageInput.files[0]);
  
  // 서버 통신으로 받은 이미지로 prev-image 변경
  const imageData = await uploadImage(formData); // filename 반환

  const imageUrl = `${ENDPOINT}/${imageData}`;
  $previewImage.src = imageUrl;
  $previewImage.classList.remove('hidden');
}
// 이미지 서버에 올리고 preview 이미지 변환
$imageInput.addEventListener("change", setPreviewImage);


// button 활성화 
function setEnabledBtn() {
  let check = 0;
  $inputList.forEach(el => { if (el.value !== "") check++ });
  if (check >= $inputList.length-1) {
    $submitBtn.className = "ms-button";
    $submitBtn.disabled = false;
  } else {
    $submitBtn.className = "ms-disabled-button";
    $submitBtn.disabled = true;
  }
}
// 버튼 활성화
$ProductApp.addEventListener("keyup", setEnabledBtn);

async function productAPI(method, productId=false) {
  const imageUrl = $previewImage.src;

  // 서버에 보낼 product 데이터 생성
  // $inputList = [input#imageInput, input#productName, input#productPrice, input#productLink]
  const product = { "itemImage": imageUrl, };
  [].slice.call($inputList, 1).forEach((el) => { 
    // price인 경우 정수로 변환
    product[el.name] = (el.name === "price") ? parseInt(el.value) : el.value;
  });

  const URL = (productId)
    ? `${ENDPOINT}/product/${productId}`
    : `${ENDPOINT}/product`;

  const reqData = {
    method: method,
    headers: HEADERS_AUTH,
    body: JSON.stringify({ product }),
  };
  try {
    const res = await fetch(URL, reqData);
    const json = await res.json();
  
    if (res.ok) {
      location.href = PROFILE_DETAIL_PATH;
    } else {
      const errMsg = (json)
        ? json.message
        : "파일전송에 실패했습니다.."
      alert(errMsg);
    }
  } catch {
    alert(NOT_CONNECTED);
  }
}

$submitBtn.addEventListener("click", () => {
  if (!productId) {
    // 상품 등록
    productAPI("POST");
  } else {
    // 상품 수정
    productAPI("PUT", productId);
  }
})


// 뒤로 가기 버튼
document.querySelector(".prev-btn")
  .addEventListener("click", prevPage);

