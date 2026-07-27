export interface Post {
  video_id: string
  account_name: string
  published_at_date: string
  video_url: string
  video_type: string
  title: string
  /** Video length in milliseconds. */
  video_length: number
  thumbnail_url: string
}

export interface PostStat {
  video_id: string
  data_date: string
  likes: number
  comments: number
  shares: number
  views: number
  /** Estimated watch time in minutes. */
  watchtime: number
}

/** A daily stat row joined with the post fields needed for filtering charts. */
export interface DailyStatRow extends PostStat {
  account_name: string
  video_type: string
  title: string
  published_at_date: string
}

/** A post joined with its aggregated lifetime stats. */
export interface VideoRow extends Post {
  likes: number
  comments: number
  shares: number
  views: number
  /** Total estimated watch time in minutes. */
  watchtime: number
  /** likes + comments + shares. */
  engagements: number
}
