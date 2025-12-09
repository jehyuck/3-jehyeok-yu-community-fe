import { authClient } from "./apiClient.js";

export class ImageHandler {
  constructor() {
    this.presignedPatchUrl = undefined;
    this.objectKey = undefined;
    this.file = undefined;
    this.status = false;
  }

  async setUrl(mode = "profile", method = "get", postId = null) {
    let url;

    // 수정 모드일 때는 다른 엔드포인트 사용
    if (mode === "post" && method === "patch" && postId) {
      // 게시글 수정
      url = `/posts/${postId}/images/url-patch`;
    } else if (mode === "profile" && method === "patch") {
      // 프로필 수정
      url = `/users/me/images/url-patch`;
    } else {
      // 첫 등록
      url = `/images/url?mode=${mode}`;
    }

    const res = await authClient.get(url);
    if (!res.ok) {
      console.error("프리사인 URL 발급 실패");
      return;
    }

    const data = await res.json();

    this.presignedPatchUrl = data.data.presignedPatchUrl;
    this.objectKey = data.data.objectKey;
    return this.objectKey;
  }

  setFile(file) {
    this.file = file;
  }

  async push() {
    if (!this.file) {
      console.error("파일이 등록되어 있지 않아 이미지 저장에 실패했습니다.");
      return;
    }
    if (!this.presignedPatchUrl) {
      console.error("프리사인 URL이 없습니다. 먼저 setUrl()을 호출하세요.");
      return;
    }

    try {
      const res = await fetch(this.presignedPatchUrl, {
        method: "PUT",
        headers: {
          "Content-Type": this.file.type,
        },
        body: this.file,
      });

      if (res.ok) {
        this.status = true;
        return;
      } else {
        console.error("파일 업로드 실패:", res.status, res.statusText);
      }
    } catch (err) {
      console.error("업로드 중 오류:", err);
    }
    this.status = false;
  }

  ok() {
    return this.status;
  }
}
