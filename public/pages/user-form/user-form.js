import { authClient } from "../../api/apiClient.js";
import { BASE_URL } from "../../api/config.js";
import {
  submitPasswordUpdate,
  submitProfileUpdate,
  submitSignup,
} from "./submitHandler.js";
import {
  updateSubmitDisabled,
  validateEmail,
  validateNickname,
  validatePassword,
  validatePasswordAll,
  validatePasswordConfirm,
  validateProfileAll,
  validateSignupAll,
} from "./validation.js";
import { VIEW_MODE } from "./viewMode.js";

document.addEventListener("DOMContentLoaded", async () => {
  // 모드 결정
  const params = new URLSearchParams(window.location.search);
  const mode = params.get("mode") ?? "signup";

  const spec = VIEW_MODE[mode];
  const elements = {
    nickname: document.getElementById("nickname"),
    email: document.getElementById("email"),
    password: document.getElementById("password"),
    passwordConfirm: document.getElementById("passwordConfirm"),

    profileInput: document.getElementById("profile"),
    previewEl: document.getElementById("preview"),
    plusEl: document.getElementById("plus"),
    removeBtnEl: document.getElementById("removeBtn"),
    helperProfileEl: document.querySelector("#sectionProfileImage .helper"),

    //이메일 내부
    emailSection: document.getElementById("sectionEmail"),
    emailDupButton: document.getElementById("emailDupButton"),
    emailHelper: document.getElementById("emailHelper"),
  };

  // 검증/제출 핸들러 설정
  const validateHandler =
    mode === "signup"
      ? validateSignupAll
      : mode === "profile"
      ? validateProfileAll
      : validatePasswordAll;

  const submitHandler =
    mode === "signup"
      ? submitSignup
      : mode === "profile"
      ? submitProfileUpdate
      : submitPasswordUpdate;

  // 고정 요소 설정
  const pageTitle = document.getElementById("page-title");
  const submitBtn = document.getElementById("submit-button");
  const backLink = document.getElementById("back-link");
  pageTitle.textContent = spec.title;
  submitBtn.textContent = spec.submitText;
  backLink.textContent = spec.backLinkText;
  backLink.href = spec.backLinkHref;

  const sectionIds = [
    "sectionProfileImage",
    "sectionEmail",
    "sectionNickname",
    "sectionPassword",
    "sectionPasswordConfirm",
  ];

  sectionIds.forEach((id) => {
    const sec = document.getElementById(id);
    if (!sec) return;
    const active = spec.show.includes(id);

    if (active) {
      sec.style.display = "";
      sec.querySelectorAll("input, button, select, textarea").forEach((n) => {
        n.disabled = false;
      });
    } else {
      sec.style.display = "none";
      sec.querySelectorAll("input, button, select, textarea").forEach((n) => {
        n.disabled = true;
      });
    }
  });
  if (mode !== "signup" && elements.emailSection) {
    const res = await authClient.get("/users/me");
    const dto = await res.json();
    if (elements.emailDupButton) {
      elements.emailDupButton.style.display = "none";
    }

    if (elements.emailHelper) {
      elements.emailHelper.classList.add("is-hidden");
    }

    if (elements.email) {
      const email = elements.email;
      email.classList.add("readonly");
      email.setAttribute("readonly", "readonly");
      email.placeholder = dto?.email;
    }

    if (mode === "profile" && elements.nickname) {
      elements.nickname.textContent = dto?.nickname | undefined;
    }
  }
  function refreshButton() {
    const ok = validateHandler(elements);
    updateSubmitDisabled(submitBtn, ok);
  }

  if (elements.email) {
    elements.email.addEventListener("input", () => {
      validateEmail(elements.email);
      refreshButton();
    });
    elements.email.addEventListener("blur", () => {
      validateEmail(elements.email);
      refreshButton();
    });
  }

  if (elements.nickname) {
    elements.nickname.addEventListener("input", () => {
      validateNickname(elements.nickname);
      refreshButton();
    });
  }

  if (elements.password) {
    elements.password.addEventListener("input", () => {
      validatePassword(elements.password, elements.passwordConfirm);
      refreshButton();
    });
  }

  if (elements.passwordConfirm) {
    elements.passwordConfirm.addEventListener("input", () => {
      validatePasswordConfirm(elements.password, elements.passwordConfirm);
      refreshButton();
    });
  }
  refreshButton();
  submitBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    refreshButton();
    if (submitBtn.disabled) return;
    await submitHandler(elements);
  });
});
