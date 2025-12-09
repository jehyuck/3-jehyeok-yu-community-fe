import { authClient } from "../../fetch/apiClient.js";
import { logout } from "../../fetch/loginApi.js";
import { getAccessToken } from "../../fetch/sessionStorage.js";

export class AvatarComponent {
  constructor(targetSelector = ".h-actions", options = {}) {
    this.targetSelector = targetSelector;
    this.mount = null;
    this.avatarBtn = null;
    this.dropdown = null;
    this.token = getAccessToken();

    const { useDropdown = true, onAvatarClick = null } = options;

    this.useDropdown = useDropdown;
    this.onAvatarClick = onAvatarClick;
  }
  baseHtml() {
    if (this.useDropdown) {
      return `<div class="h-menu">
        <button
          id="h-avatar"
          aria-label="profile"
          aria-haspopup="true"
          aria-expanded="false"
        ></button>

        <nav id="profileMenu" class="menu-panel" hidden>
          <a href="/user-form?mode=profile" class="menu-item">회원정보수정</a>
          <a href="/user-form?mode=password" class="menu-item">비밀번호수정</a>
          <button type="button" id="menuLogout" class="menu-item">
            로그아웃
          </button>
        </nav>
      </div>`;
    }

    return `<button
        id="h-avatar"
        class="avatar-only"
        aria-label="profile"
      ></button>`;
  }

  init() {
    if (this.targetSelector instanceof Element) {
      this.mount = this.targetSelector;
    } else {
      this.mount = document.querySelector(this.targetSelector);
    }

    if (!this.mount) {
      console.error(
        "AvatarComponent mount 요소가 없습니다.",
        this.targetSelector
      );
      return;
    }

    this.mount.insertAdjacentHTML("beforeend", this.baseHtml());

    this.avatarBtn = this.mount.querySelector("#h-avatar");
    this.dropdown = this.mount.querySelector("#profileMenu");

    if (!this.token) {
      this.avatarBtn.hidden = true;
      return;
    }

    if (this.useDropdown) {
      this.initProfileHeaderEvents();
    } else {
      this.avatarBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.onAvatarClick(e);
      });
    }
  }

  async loadAvatar() {
    try {
      let url = undefined;

      const endpoint = `/users/me`;
      const res = await authClient.get(endpoint);
      if (!res.ok) return;

      const dto = await res.json();
      url = dto.data.imagePath;

      this.avatarBtn.innerHTML = `
        <img src="${url}" class="h-avatar-img" alt="profile"/>`;
    } catch (err) {
      console.error("Avatar load error:", err);
    }
  }

  // 게시글 관련 아바타 로딩 (특정 사용자의 프로필 조회)
  async loadPostAvatar(thumbnailPath) {
    try {
      let url = undefined;

      if (!thumbnailPath) {
        url = "/assets/default-profile.png";
      } else {
        url = thumbnailPath;
      }

      this.avatarBtn.innerHTML = `
        <img src="${url}" class="h-avatar-img" alt="profile"/>
      `;
    } catch (err) {
      console.error("Post avatar load error:", err);
      // 에러 시 기본 프로필 표시
      this.avatarBtn.innerHTML = `
        <img src="/assets/default-profile.png" class="h-avatar-img" alt="profile"/>
      `;
    }
  }

  initProfileHeaderEvents() {
    this.loadAvatar();
    this.bindEvents();
  }

  bindEvents() {
    const logoutBtn = this.mount.querySelector("#menuLogout");
    logoutBtn?.addEventListener("click", logout);

    this.avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleDropdown();
    });

    document.addEventListener("click", (e) => {
      if (!this.mount.contains(e.target)) {
        this.hideDropdown();
      }
    });
  }

  toggleDropdown() {
    const isOpen = !this.dropdown.hidden;
    this.dropdown.hidden = isOpen;
    this.avatarBtn.setAttribute("aria-expanded", String(!isOpen));
  }

  hideDropdown() {
    if (!this.dropdown.hidden) {
      this.dropdown.hidden = true;
      this.avatarBtn.setAttribute("aria-expanded", "false");
    }
  }
}
