// ---------------------------------------------------------------------------
// Shared Instagram feed types
// ---------------------------------------------------------------------------

export interface FeedPostSize {
  mediaUrl: string;
  height: number;
  width: number;
}

export interface FeedPost {
  id: string;
  mediaUrl?: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  caption: string;
  timestamp: string;
  permalink: string;
  thumbnailUrl?: string;
  sizes: {
    small: FeedPostSize;
    medium: FeedPostSize;
    large: FeedPostSize;
  };
}
