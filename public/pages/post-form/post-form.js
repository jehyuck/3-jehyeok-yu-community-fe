import { authClient } from "../../fetch/apiClient.js";
import { createPost, updatePost } from "../../fetch/postFormApi.js";
import { ImageHandler } from "../../fetch/imageApi.js";
const pNode = document.querySelector(".compose");
const target = new URLSearchParams(window.location.search).get("postId");

// 다른 텍스트나 이벤트 구성 필요
// 분기 필요 template 배치 끝나면 구성

const createPostTemplate = async (target) => {
  let dto;
  if (target) {
    const res = await authClient.get(`/posts/${target}`);
    const data = await res.json();
    dto = data.data;
  }
  return `       
    <h2 class="compose-title">게시글 ${dto ? "수정" : "작성"}</h2>
        <form id="postCreateForm" class="compose-form" novalidate>
          <div class="field">
            <label for="title" class="label"></label>
            <input
              id="title"
              name="title"
              type="text"
              maxlength="26"
              class="input"
              placeholder="제목을 입력해주세요. (최대 26글자)"
              value = "${dto ? dto.title : ""}"
              required
            />
            <p class="helper">제목은 26자 이내로 작성해주세요.</p>
          </div>

          <!-- 내용 -->
          <div class="field">
            <label for="content" class="label">내용 *</label>
            <textarea
              id="content"
              name="content"
              class="textarea"
              placeholder="내용을 입력해주세요."
              required
            >${dto ? dto.content : ""}</textarea>
            <p class="helper">게시글 본문은 LONGTEXT로 저장됩니다.</p>
          </div>

          <!-- 이미지 업로드 -->
          <div class="field">
            <span class="label">이미지</span>
            <label class="file">
              <input id="image" name="image" type="file" accept="image/*" />
              <span class="file-btn">파일 선택</span>
              <span class="file-name" id="fileName">파일을 선택해주세요.</span>
            </label>
          </div>

          <!-- 제출 -->
          <div class="actions">
            <button type="button" id="submitButton" class="btn primary full">
              ${dto ? "수정" : "생성"}
            </button>
          </div>
        </form>`;
};

document.addEventListener("DOMContentLoaded", async () => {
  const postTemplate = await createPostTemplate(target);
  pNode.innerHTML = postTemplate;

  // 이벤트 다는 과정
  const title = document.getElementById("title");
  const content = document.getElementById("content");
  const submitButton = document.getElementById("submitButton");

  // 이미지 업로드 관련
  const imageInput = document.getElementById("image");
  const fileName = document.getElementById("fileName");
  const imageHandler = new ImageHandler();
  let selectedFile = null;
  let imageObjectKey = null;

  // 이미지 파일 선택 이벤트
  imageInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) {
      fileName.textContent = "파일을 선택해주세요.";
      selectedFile = null;
      imageObjectKey = null;
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지만 업로드 해주세요.");
      imageInput.value = "";
      fileName.textContent = "파일을 선택해주세요.";
      selectedFile = null;
      imageObjectKey = null;
      return;
    }

    selectedFile = file;
    fileName.textContent = file.name;

    // presigned URL 발급받기
    try {
      // 수정 모드일 때는 patch 메소드와 postId 사용
      if (target) {
        imageObjectKey = await imageHandler.setUrl("post", "patch", target);
      } else {
        imageObjectKey = await imageHandler.setUrl("post");
      }
    } catch (error) {
      console.error("Presigned URL 발급 실패:", error);
      alert("이미지 업로드 준비에 실패했습니다.");
      selectedFile = null;
      imageObjectKey = null;
      fileName.textContent = "파일을 선택해주세요.";
    }
  });

  const helperOf = (input) => input.closest(".field")?.querySelector(".helper");

  function setHelper(input, msg, state) {
    const h = helperOf(input);
    if (!h) return;
    h.textContent = msg ?? "";
    h.classList.remove("error", "ok");
    if (state) h.classList.add(state);
  }

  function setFail(input, msg) {
    setHelper(input, msg, "error");
    return false;
  }

  function setOk(input, msg) {
    setHelper(input, msg, "ok");
    return true;
  }

  function validateTitle() {
    const v = title.value.trim();
    if (!v) return setFail(title, "제목을 입력하세요.");
    if (v.length > 26) return setFail(title, "제목은 26자 이내로 작성하세요.");
    return setOk(title, "좋아요.");
  }

  function validateContent() {
    const v = content.value.trim();
    if (!v) return setFail(content, "내용을 입력하세요.");
    return setOk(content, "좋아요.");
  }

  function updateSubmit() {
    const valid =
      helperOf(title)?.classList.contains("ok") &&
      helperOf(content)?.classList.contains("ok");
    submitButton.disabled = !valid;
    submitButton.style.backgroundColor = valid ? "#7F6AEE" : "#ACAOEB";
  }

  validateContent();
  validateTitle();
  updateSubmit();

  // addEventListner
  title.addEventListener("input", (e) => {
    validateTitle();
    updateSubmit();
  });
  content.addEventListener("input", (e) => {
    validateContent();
    updateSubmit();
  });
  submitButton.addEventListener("click", async (e) => {
    // 이미지 업로드 처리
    if (selectedFile && imageObjectKey) {
      try {
        imageHandler.setFile(selectedFile);
        await imageHandler.push();

        if (!imageHandler.ok()) {
          alert("이미지 업로드에 실패했습니다.");
          return;
        }
      } catch (error) {
        console.error("이미지 업로드 중 오류:", error);
        alert("이미지 업로드에 실패했습니다.");
        return;
      }
    }

    // 게시글 데이터 구성
    const body = {
      title: title.value.trim(),
      content: content.value.trim(),
    };

    // 이미지가 업로드되었다면 objectKey 추가
    if (selectedFile && imageHandler.ok()) {
      body.image = {
        objectKey: imageObjectKey,
        originalName: selectedFile.name,
      };
    }

    // 게시글 생성/수정
    target ? updatePost(target, body) : createPost(body);
  });
});
