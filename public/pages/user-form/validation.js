export function helperOf(input) {
  return input.closest(".field")?.querySelector(".helper");
}

export function setHelper(input, msg, state) {
  const h = helperOf(input);
  if (!h) return;
  h.textContent = msg ?? "";
  h.classList.remove("error", "ok");
  if (state) h.classList.add(state);
}

export function setFail(input, msg) {
  setHelper(input, msg, "error");
  return false;
}
export function setOk(input, msg) {
  setHelper(input, msg, "ok");
  return true;
}

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const pwLenMin = 8;
const pwLenMax = 20;
const pwReHasLetter = /[A-Za-z]/;
const pwReHasDigit = /[0-9]/;
const pwReHasSpecial = /[^A-Za-z0-9]/;
const nickRe = /^[A-Za-z0-9가-힣]{2,10}$/;

// 단일 필드 validate 함수들
export function validateEmail(emailEl) {
  if (!emailEl) return true; // 모드에 따라 없을 수 있음
  const v = emailEl.value.trim();
  if (!v) return setFail(emailEl, "이메일을 입력하세요.");
  if (!emailRe.test(v))
    return setFail(emailEl, "올바른 이메일 형식이 아닙니다.");
  return setOk(emailEl, "좋아요.");
}

export function validatePassword(passwordEl, passwordConfirmEl) {
  if (!passwordEl) return true; // 이 모드에서는 비밀번호 안 쓸 수도 있음
  const v = passwordEl.value;
  if (!v) return setFail(passwordEl, "비밀번호를 입력하세요.");
  if (v.length < pwLenMin || v.length > pwLenMax) {
    return setFail(
      passwordEl,
      `비밀번호는 ${pwLenMin}자 이상 ${pwLenMax}자 이하이어야 합니다.`
    );
  }
  if (
    !pwReHasLetter.test(v) ||
    !pwReHasDigit.test(v) ||
    !pwReHasSpecial.test(v)
  ) {
    return setFail(passwordEl, "영문/숫자/특수문자를 모두 포함하세요.");
  }
  // passwordConfirm도 같이 업데이트
  if (passwordConfirmEl) {
    validatePasswordConfirm(passwordEl, passwordConfirmEl);
  }
  return setOk(passwordEl, "사용 가능한 비밀번호입니다.");
}

export function validatePasswordConfirm(passwordEl, passwordConfirmEl) {
  if (!passwordConfirmEl) return true;
  const v = passwordConfirmEl.value;
  if (!v) return setFail(passwordConfirmEl, "비밀번호를 다시 입력하세요.");
  if (v !== passwordEl.value)
    return setFail(passwordConfirmEl, "비밀번호가 일치하지 않습니다.");
  return setOk(passwordConfirmEl, "일치합니다.");
}

export function validateNickname(nicknameEl) {
  if (!nicknameEl) return true;
  const v = nicknameEl.value.trim();
  if (!v) return setFail(nicknameEl, "닉네임을 입력하세요.");
  if (!nickRe.test(v))
    return setFail(nicknameEl, "닉네임은 2~10자, 한글/영문/숫자만 가능합니다.");
  return setOk(nicknameEl, "좋아요.");
}

// 모드별 전체 검증 함수들
export function validateSignupAll(els) {
  const r1 = validateEmail(els.email);
  const r2 = validatePassword(els.password, els.passwordConfirm);
  const r3 = validatePasswordConfirm(els.password, els.passwordConfirm);
  const r4 = validateNickname(els.nickname);
  return r1 && r2 && r3 && r4;
}

export function validateProfileAll(els) {
  // 프로필 변경은 닉네임만 체크한다고 가정
  const r1 = validateNickname(els.nickname);
  return r1;
}

export function validatePasswordAll(els) {
  // 비밀번호 변경은 비밀번호/확인만 체크
  const r1 = validatePassword(els.password, els.passwordConfirm);
  const r2 = validatePasswordConfirm(els.password, els.passwordConfirm);
  return r1 && r2;
}

// 버튼 활성화 제어
export function updateSubmitDisabled(submitBtn, ok) {
  submitBtn.disabled = !ok;
}
