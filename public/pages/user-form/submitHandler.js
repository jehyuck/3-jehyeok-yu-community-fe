import { signin } from "../../fetch/loginApi.js";
import { authClient } from "../../fetch/apiClient.js";

export async function submitSignup(dto) {
  const { email, nickname, password, image } = dto;
  const res = await signin({
    email: email.value.trim(),
    nickname: nickname.value.trim(),
    password: password.value,
    image: image,
  });
  if (res.status === 200) {
    alert("회원가입이 완료되었습니다.");
    window.location.href = "/login";
  } else {
    alert("회원가입에 실패했습니다.");
  }
}

export async function submitProfileUpdate(dto) {
  const { nickname, image } = dto;

  // 프로필 정보 업데이트 (닉네임 + 이미지 objectKey)
  const updateData = {
    nickname: nickname.value.trim(),
  };

  // 이미지가 업로드되었으면 objectKey와 originalName 포함
  if (image && image.objectKey) {
    updateData.image = {
      objectKey: image.objectKey,
      originalName: image.originalName,
    };
  }
  try {
    const res = await authClient.put("/users/me", updateData);
    if (res.status === 204) {
      alert("프로필이 업데이트되었습니다.");
      window.location.href = "/post-list";
    } else {
      alert("프로필 업데이트에 실패했습니다.");
    }
  } catch (error) {
    console.error("프로필 업데이트 실패:", error);
    alert("프로필 업데이트에 실패했습니다.");
  }
}

export async function submitPasswordUpdate(dto) {
  const { password } = dto;
  const updateData = {
    password: password.value,
  };

  try {
    const res = await authClient.put("/users/me/password", updateData);
    if (res.status === 204) {
      alert("비밀번호가 변경되었습니다.");
      window.location.href = "/post-list";
    } else {
      alert("비밀번호 변경에 실패했습니다.");
    }
  } catch (error) {
    console.error("비밀번호 변경 실패:", error);
    alert("비밀번호 변경에 실패했습니다.");
  }
}
