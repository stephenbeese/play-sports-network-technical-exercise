export interface Post {
  video_id: string
  account_name: string
  published_at_date: string
  video_url: string
  video_type: string
  title: string
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
  watchtime: number
}

export interface DailyStatRow extends PostStat {
  account_name: string
  video_type: string
  title: string
  published_at_date: string
}

export interface VideoRow extends Post {
  likes: number
  comments: number
  shares: number
  views: number
  watchtime: number
  engagements: number
}
