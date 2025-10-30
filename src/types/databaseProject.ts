export interface Project {
  id: string;
  creator_id: string;
  title: string;
  description?: string;
  category?: string;
  status?: string;
  tech_stack?: string[];
  start_date?: string;
  end_date?: string;
  github_url?: string;
  live_url?: string;
  images?: string[];
  likes?: number;
  is_public?: boolean;
  progress_percentage?: number;
  created_at?: string;
  updated_at?: string;
}
