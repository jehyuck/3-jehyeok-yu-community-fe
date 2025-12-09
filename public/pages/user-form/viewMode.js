export const VIEW_MODE = {
  signup: {
    title: "회원가입",
    show: [
      "sectionProfileImage",
      "sectionEmail",
      "sectionNickname",
      "sectionPassword",
      "sectionPasswordConfirm",
    ],
    submitText: "회원가입",
    backLinkText: "로그인하러 가기",
    backLinkHref: "/login",
  },

  profile: {
    title: "프로필 변경",
    show: ["sectionProfileImage", "sectionNickname", "sectionEmail"],
    submitText: "저장",
    backLinkText: "돌아가기",
    backLinkHref: "/post-list",
  },

  password: {
    title: "비밀번호 변경",
    show: ["sectionPassword", "sectionPasswordConfirm"],
    submitText: "비밀번호 변경",
    backLinkText: "돌아가기",
    backLinkHref: "/post-list",
  },
};
