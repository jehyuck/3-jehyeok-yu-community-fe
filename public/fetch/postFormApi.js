import { authClient } from "./apiClient.js";

export const createPost = async (body) => {
  const res = await authClient.post("/posts", body);
  if (res.status === 204) {
    alert("게시물이 등록되었습니다.");
    window.location.href = `/post-list`;
  }
};

export const updatePost = async (src, body) => {
  const res = await authClient.put(`/posts/${src}`, body);
  if (res.status === 204) {
    alert("게시물이 수정되었습니다.");
    window.location.href = `/post/${src}`;
  }
};
