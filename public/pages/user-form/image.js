import { ImageHandler } from "../../fetch/imageApi.js";

export const emptyTemplate =
  () => `  <label for="profile" class="profile-label">
    <div class="profile-preview" id="preview"></div>
    <span class="plus-icon" id="plus">+</span>
  </label>
  <input id="profile" name="profile" type="file" accept="image/*" hidden />
  <button type="button" class="remove-btn" id="removeBtn" style="display:none;">삭제</button>
  <p class="helper">프로필 사진을 선택하세요.</p> `;

export class ProfileUploader {
  constructor(root, { onImageChange } = {}) {
    this.root = root;
    this.input = root.querySelector("#profile");
    this.preview = root.querySelector("#preview");
    this.plus = root.querySelector("#plus");
    this.helper = root.querySelector(".helper");
    this.removeBtn = root.querySelector("#removeBtn");

    this.imageId = "default";
    this.onImageChange = onImageChange;
    this.imageHandler = new ImageHandler();
    this.imageOriginalName = "default";
    this.hasExistingImage = false;
    this.initEvents();
  }

  initEvents() {
    this.input.addEventListener("change", (e) => this.renderImage(e));
    this.removeBtn.addEventListener("click", () => this.renderEmpty());
  }

  async setUrl(mode = "profile", method = "get") {
    this.imageId = await this.imageHandler.setUrl(mode, method);
  }

  renderEmpty() {
    if (this.blobUrl) {
      URL.revokeObjectURL(this.blobUrl);
      this.blobUrl = null;
    }

    this.preview.style.backgroundImage = "";
    this.plus.style.display = "block";
    this.helper.style.display = "block";
    this.removeBtn.style.display = "none";
    this.input.value = "";
    this.imageId = "default";
    this.imageOriginalName = "default";

    if (this.onImageChange) this.onImageChange(null);
  }

  async renderImage(e) {
    const file = e.target.files?.[0];

    if (!file || !file.type.startsWith("image/")) {
      alert("이미지만 업로드 해주세요.");
      this.renderEmpty();
      return;
    }

    if (file.name === "default") {
      alert("default를 파일명을 가진 사진은 업로드가 불가능합니다.");
      this.renderEmpty();
      return;
    }
    this.imageOriginalName = file.name;
    this.imageHandler.setFile(file);
    await this.imageHandler.push();

    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    this.blobUrl = URL.createObjectURL(file);

    this.preview.style.backgroundImage = `url('${this.blobUrl}')`;
    this.helper.style.display = "none";
    this.plus.style.display = "none";
    this.removeBtn.style.display = "block";

    if (this.onImageChange) this.onImageChange(this.imageId);
  }

  // 기존 프로필 이미지 로드
  loadExistingImage(presignedUrl, objectKey, originalName = "profile") {
    if (!presignedUrl) return;

    this.preview.style.backgroundImage = `url('${presignedUrl}')`;
    this.helper.style.display = "none";
    this.plus.style.display = "none";
    this.removeBtn.style.display = "block";

    this.imageId = objectKey;
    this.imageOriginalName = originalName;
    this.hasExistingImage = true;

    if (this.onImageChange) this.onImageChange(this.imageId);
  }

  getImageDto() {
    // 새 이미지가 업로드된 경우에만 반환 (기존 이미지가 로드된 상태에서는 null)
    if (this.hasExistingImage && !this.imageHandler.ok()) {
      return null;
    }

    return this.imageHandler.ok()
      ? {
          originalName: this.imageOriginalName,
          objectKey: this.imageId,
        }
      : null;
  }
}
