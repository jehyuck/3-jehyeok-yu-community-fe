import {
  getPost,
  createComment,
  getComments,
  updateComment,
  deleteComment,
  deletePost,
  toggleLike,
  getCurrentUser,
} from "../../fetch/postApi.js";
import { AvatarComponent } from "../../semantics/header/avatar.js";

const createPostTemplate = (dto) => {
  const hasImage = !!dto.postImagePath;

  const imageSection = hasImage
    ? `<figure class="post-image">
        <img src="${dto.postImagePath}" alt="게시글 이미지" class="post-image-content" />
      </figure>`
    : "";

  return `<h1 class="post-title">${dto.title}</h1>

        <div class="post-meta">
          <div class="author">
            <span class="avatar"></span>
            <div class="who" id="user_${dto.authorId}">
              <strong class="name">${dto.nickname}</strong>
              <time class="time">${new Date(
                dto.createdAt
              ).toLocaleDateString()}</time>
            </div>
          </div>
          ${
            dto.owner
              ? `<div class="post-actions">
            <a class="btn ghost" href="/post-form?postId=${dto.postId}" id="btnEdit"
              >수정</a
            >
            <button class="btn danger" id="btnDelete">삭제</button>
          </div>`
              : ""
          }
        </div>

        ${imageSection}
            <p><br/></p>
            <p><br/></p>

        <div class="post-body">${dto.content}</div>

        <ul class="post-stats">
          <li class="stat">
            <button id="likeBtn" class="btn like-btn ${
              dto.liked ? "liked" : ""
            }" type="button">
              <span class="heart-icon">${dto.liked ? "❤️" : "🤍"}</span>
              <span class="num">${dto.likeCount}</span>
            </button>
            <span class="label">좋아요</span>
          </li>
          <li class="stat">
            <span class="num">${
              dto.viewCount
            }</span><span class="label">조회수</span>
          </li>
          <li class="stat">
            <span class="num">${
              dto.commentCount
            }</span><span class="label">댓글</span>
          </li>
        </ul>`;
};

// 댓글 작성 템플릿
const createCommentWriteTemplate = () => `
  <section class="comment-write card">
    <label class="label" for="comment">댓글을 남겨주세요!</label>
    <textarea
      id="comment"
      class="textarea"
      placeholder="댓글을 입력하세요."
      required
    ></textarea>
    <div class="actions r">
      <button type="button" id="commentSubmitBtn" class="btn primary">댓글 등록</button>
    </div>
  </section>
`;

// 댓글 리스트 템플릿
const createCommentListTemplate = (comments) => {
  if (!comments || comments.length === 0) {
    return '<div class="no-comments">댓글이 없습니다.</div>';
  }

  return `<ul class="comment-list">
      ${comments
        .map(
          (comment) => `
        <li class="comment card" data-comment-id="${comment.commentId || ""}">
          <div class="c-head">
            <span class="avatar sm"></span>
            <strong class="name">${comment.authorNickname}</strong>
            <time class="time">${new Date(
              comment.createdAt
            ).toLocaleString()}</time>
            <div class="gap"></div>
            ${
              comment.owner
                ? `
              <button class="btn ghost sm">수정</button>
              <button class="btn danger sm btnCommentDelete">삭제</button>
            `
                : ""
            }
          </div>
          <p class="c-body">${comment.contents}</p>
        </li>
        </div>
        </ul>
      `
        )
        .join("")}
  `;
};

document.addEventListener("DOMContentLoaded", async () => {
  const parsedPath = window.location.pathname.split("/");
  const dto = await getPost(parsedPath[2]);

  const postNode = document.querySelector(".post");

  postNode.innerHTML = createPostTemplate(dto.data);
  postNode.classList.toggle("has-image", dto.postImagePath);
  postNode.classList.toggle("no-image", !dto.postImagePath);

  // 게시글 작성자의 아바타 컴포넌트 초기화
  const avatarSelector = ".post .avatar";
  const avatarComp = new AvatarComponent(avatarSelector, {
    useDropdown: false,
    onAvatarClick: () => {
      window.location.href = `/users/${dto.data.authorId}`;
    },
  });
  avatarComp.init();
  avatarComp.loadPostAvatar(dto.data.authorThumbnailPath);

  // 좋아요 기능 초기화
  await initLikeFeature(parsedPath[2], dto.data.likeCount, dto.data.liked);

  // 댓글 기능 초기화
  await initComments(parsedPath[2]);

  // 삭제 버튼 이벤트 (본인 게시글일 경우에만)
  if (dto.data.owner) {
    const deleteBtn = document.getElementById("btnDelete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", async () => {
        if (confirm("게시글을 삭제하시겠습니까?")) {
          try {
            await deletePost(parsedPath[2]);
            alert("게시글이 삭제되었습니다.");
            window.location.href = "/post-list";
          } catch (error) {
            console.error("게시글 삭제 실패:", error);
            alert("게시글 삭제에 실패했습니다.");
          }
        }
      });
    }
  }
});

// 댓글 기능 초기화
async function initComments(postId) {
  // 댓글 작성 폼 추가
  const commentWriteContainer = document.querySelector(".comment-write");
  if (commentWriteContainer) {
    commentWriteContainer.innerHTML = createCommentWriteTemplate();
  }

  // 댓글 리스트 로드 및 표시
  await loadComments(postId);

  // 댓글 작성 이벤트 바인딩
  const commentSubmitBtn = document.getElementById("commentSubmitBtn");
  const commentTextarea = document.getElementById("comment");

  if (commentSubmitBtn && commentTextarea) {
    commentSubmitBtn.addEventListener("click", async () => {
      const content = commentTextarea.value.trim();
      if (!content) {
        alert("댓글 내용을 입력해주세요.");
        return;
      }

      try {
        await createComment(postId, content);
        commentTextarea.value = "";
        await loadComments(postId);
      } catch (error) {
        console.error("댓글 작성 실패:", error);
        alert("댓글 작성에 실패했습니다.");
      }
    });
  }
}

// 댓글 리스트 로드 및 표시
async function loadComments(postId) {
  try {
    const response = await getComments(postId);
    const comments = response.data.comments || [];

    const commentListContainer = document.querySelector(".comment-list");
    if (commentListContainer) {
      commentListContainer.innerHTML = createCommentListTemplate(comments);
    }

    comments.forEach((comment, index) => {
      const commentElement = commentListContainer.children[index];
      if (commentElement) {
        const avatarElement = commentElement.querySelector(".avatar");
        if (avatarElement && comment.authorThumbnailPath) {
          const commentAvatar = new AvatarComponent(avatarElement, {
            useDropdown: false,
            onAvatarClick: () => {
              window.location.href = `/users/${comment.userId || ""}`;
            },
          });
          commentAvatar.init();
          commentAvatar.loadPostAvatar(comment.authorThumbnailPath);
        }

        // 수정/삭제 버튼 이벤트 (본인 댓글일 경우에만)
        if (comment.owner) {
          const editBtn = commentElement.querySelector(".btn.ghost");
          const deleteBtn = commentElement.querySelector(".btnCommentDelete");

          // 수정 버튼 이벤트
          if (editBtn) {
            editBtn.addEventListener("click", () => {
              startCommentEdit(
                commentElement,
                comment.commentId,
                comment.contents
              );
            });
          }

          // 삭제 버튼 이벤트
          if (deleteBtn) {
            deleteBtn.addEventListener("click", async () => {
              if (confirm("댓글을 삭제하시겠습니까?")) {
                try {
                  await deleteComment(comment.commentId);
                  commentElement.remove();
                } catch (error) {
                  console.error("댓글 삭제 실패:", error);
                  alert("댓글 삭제에 실패했습니다.");
                }
              }
            });
          }
        }
      }
    });
  } catch (error) {
    console.error("댓글 로드 실패:", error);
    const commentListContainer = document.querySelector(".comment-list");
    if (commentListContainer) {
      commentListContainer.innerHTML =
        '<div class="error">댓글을 불러오는데 실패했습니다.</div>';
    }
  }
}

// 댓글 수정 모드 시작
function startCommentEdit(commentElement, commentId, originalContent) {
  const commentBody = commentElement.querySelector(".c-body");
  const actionButtons = commentElement.querySelector(".gap").parentElement;

  // 현재 내용 저장
  const currentContent = commentBody.textContent;

  // 댓글 내용을 textarea로 변경
  const textarea = document.createElement("textarea");
  textarea.value = currentContent;
  textarea.className = "textarea comment-edit-textarea";
  commentBody.replaceWith(textarea);

  // 버튼들을 확인/취소로 변경
  const confirmBtn = document.createElement("button");
  confirmBtn.textContent = "확인";
  confirmBtn.className = "btn primary sm";

  const cancelBtn = document.createElement("button");
  cancelBtn.textContent = "취소";
  cancelBtn.className = "btn ghost sm";
  cancelBtn.id = "cancelBtn";

  // 기존 버튼들 숨기기 및 참조 저장
  const editBtn = actionButtons.querySelector(".btn.ghost");
  const deleteBtn = actionButtons.querySelector(".btnCommentDelete");

  // 수정할 요소에 참조 저장 (나중에 복원하기 위해)
  commentElement._originalButtons = { editBtn, deleteBtn };

  if (editBtn) editBtn.setAttribute("hidden", "true");
  if (deleteBtn) deleteBtn.setAttribute("hidden", "true");

  // 확인/취소 버튼 추가
  actionButtons.appendChild(confirmBtn);
  actionButtons.appendChild(cancelBtn);

  // 확인 버튼 이벤트
  confirmBtn.addEventListener("click", async () => {
    const newContent = textarea.value.trim();
    if (!newContent) {
      alert("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      await updateComment(commentId, newContent);
      endCommentEdit(commentElement, newContent, true);
    } catch (error) {
      console.error("댓글 수정 실패:", error);
      alert("댓글 수정에 실패했습니다.");
    }
  });

  // 취소 버튼 이벤트
  cancelBtn.addEventListener("click", () => {
    endCommentEdit(commentElement, originalContent, false);
  });
}

// 댓글 수정 모드 종료
function endCommentEdit(commentElement, content, isConfirm) {
  const textarea = commentElement.querySelector(".comment-edit-textarea");
  const actionButtons = commentElement.querySelector(".gap").parentElement;

  if (!textarea) return;

  // textarea를 다시 span으로 변경
  const commentBody = document.createElement("p");
  commentBody.className = "c-body";
  commentBody.textContent = content;
  textarea.replaceWith(commentBody);

  // 버튼들 복원
  const confirmBtn = actionButtons.querySelector(".btn.primary");
  const cancelBtn = actionButtons.querySelector("#cancelBtn");

  if (confirmBtn) confirmBtn.remove();
  if (cancelBtn) cancelBtn.remove();

  // 기존 버튼들 다시 표시 (저장된 참조 사용)
  const { editBtn, deleteBtn } = commentElement._originalButtons || {};
  if (editBtn) editBtn.removeAttribute("hidden");
  if (deleteBtn) deleteBtn.removeAttribute("hidden");

  // 참조 정리
  delete commentElement._originalButtons;
}

// 좋아요 기능 초기화
async function initLikeFeature(postId, initialLikeCount, initialIsLiked) {
  const likeBtn = document.getElementById("likeBtn");
  if (!likeBtn) return;

  let currentLikeCount = initialLikeCount;
  let liked = initialIsLiked || false;
  let currentUserId = null;

  // 현재 사용자 정보 조회
  try {
    const userResponse = await getCurrentUser();
    currentUserId = userResponse.data.userId;
  } catch (error) {
    console.error("사용자 정보 조회 실패:", error);
    return;
  }

  // 초기 좋아요 상태 설정
  updateLikeButtonState();

  // 좋아요 버튼 클릭 이벤트
  likeBtn.addEventListener("click", async () => {
    try {
      const response = await toggleLike(postId, currentUserId);

      liked = response.data.liked;
      currentLikeCount = response.data.likeCount;

      updateLikeButtonState();
    } catch (error) {
      console.error("좋아요 처리 실패:", error);
      alert("좋아요 처리에 실패했습니다.");
    }
  });

  function updateLikeButtonState() {
    const heartIcon = likeBtn.querySelector(".heart-icon");
    const numSpan = likeBtn.querySelector(".num");

    if (liked) {
      likeBtn.classList.add("liked");
      heartIcon.textContent = "❤️";
    } else {
      likeBtn.classList.remove("liked");
      heartIcon.textContent = "🤍";
    }

    numSpan.textContent = currentLikeCount;
  }
}
