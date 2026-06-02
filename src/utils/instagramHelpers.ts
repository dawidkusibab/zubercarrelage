import type { FeedPost } from '../types/instagram';

// ---------------------------------------------------------------------------
// Shared Instagram feed helpers
// ---------------------------------------------------------------------------

export const getImageUrl = (post: FeedPost): string => {
  if (post.sizes?.medium?.mediaUrl) return post.sizes.medium.mediaUrl;
  if (post.sizes?.large?.mediaUrl) return post.sizes.large.mediaUrl;
  if (post.sizes?.small?.mediaUrl) return post.sizes.small.mediaUrl;
  return post.mediaType === 'VIDEO' && post.thumbnailUrl
    ? post.thumbnailUrl
    : (post.mediaUrl ?? '');
};

export const getCaption = (caption: string, maxLen = 80): string =>
  caption ? caption.slice(0, maxLen) + (caption.length > maxLen ? '…' : '') : '';
