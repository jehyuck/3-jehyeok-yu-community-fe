import { authClient } from "./apiClient.js";

// 현재 로그인한 사용자 정보 조회
export const getCurrentUser = async () => {
  const res = await authClient.get("/users/me");
  if (res.status === 200) return await res.json();
  throw new Error("사용자 정보 조회 실패");
};
export const getPost = async (path) => {
  const res = await authClient.get(`/posts/${path}`);
  if (res.status === 200) return await res.json();

  if (res.status === 404) window.location.href = "/post-list";
};

// 댓글 관련 API
export const createComment = async (postId, content) => {
  const res = await authClient.post(`/posts/${postId}/comments`, { content });
  if (res.status === 201) return;
  throw new Error("댓글 작성 실패");
};

export const getComments = async (postId) => {
  const res = await authClient.get(`/posts/${postId}/comments`);
  if (res.status === 200) return await res.json();
  throw new Error("댓글 조회 실패");
};

// 좋아요 관련 API
export const toggleLike = async (postId, userId) => {
  const res = await authClient.put(`/posts/${postId}/users/${userId}/like`);
  if (res.status === 200) return await res.json();
  throw new Error("좋아요 토글 실패");
};

// 댓글 수정
export const updateComment = async (commentId, content) => {
  const res = await authClient.put(`/comments/${commentId}`, { content });
  if (res.status === 204) return;
  throw new Error("댓글 수정 실패");
};

// 댓글 삭제
export const deleteComment = async (commentId) => {
  const res = await authClient.del(`/comments/${commentId}`);
  if (res.status === 204) return;
  throw new Error("댓글 삭제 실패");
};

// 게시글 삭제
export const deletePost = async (postId) => {
  const res = await authClient.del(`/posts/${postId}`);
  if (res.status === 204) return;
  throw new Error("게시글 삭제 실패");
};
