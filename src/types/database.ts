export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          creator_id: string
          status: string
          category: string
          tech_stack: string[] | null
          start_date: string | null
          end_date: string | null
          github_url: string | null
          live_url: string | null
          images: string[] | null
          is_public: boolean | null
          progress_percentage: number | null
          likes: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          creator_id: string
          status: string
          category: string
          tech_stack?: string[] | null
          start_date?: string | null
          end_date?: string | null
          github_url?: string | null
          live_url?: string | null
          images?: string[] | null
          is_public?: boolean | null
          progress_percentage?: number | null
          likes?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          creator_id?: string
          status?: string
          category?: string
          tech_stack?: string[] | null
          start_date?: string | null
          end_date?: string | null
          github_url?: string | null
          live_url?: string | null
          images?: string[] | null
          is_public?: boolean | null
          progress_percentage?: number | null
          likes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string
          title: string | null
          country: string | null
          phone: string | null
          tech_stack: string[] | null
          bio: string | null
          profile_image_url: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name: string
          title?: string | null
          country?: string | null
          phone?: string | null
          tech_stack?: string[] | null
          bio?: string | null
          profile_image_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string
          title?: string | null
          country?: string | null
          phone?: string | null
          tech_stack?: string[] | null
          bio?: string | null
          profile_image_url?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string | null
          status: string
          priority: string
          project_id: string
          assigned_to: string | null
          due_date: string | null
          estimated_hours: number | null
          actual_hours: number | null
          tags: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description?: string | null
          status: string
          priority: string
          project_id: string
          assigned_to?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          project_id?: string
          assigned_to?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          actual_hours?: number | null
          tags?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      posts: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          author_id: string
          project_id: string | null
          likes: number | null
          tags: string[] | null
          is_public: boolean | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          content: string
          author_id: string
          project_id?: string | null
          likes?: number | null
          tags?: string[] | null
          is_public?: boolean | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          content?: string
          author_id?: string
          project_id?: string | null
          likes?: number | null
          tags?: string[] | null
          is_public?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      comments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          content: string
          author_id: string
          project_id: string | null
          post_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          content: string
          author_id: string
          project_id?: string | null
          post_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          content?: string
          author_id?: string
          project_id?: string | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          }
        ]
      }
      likes: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          project_id: string | null
          post_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          project_id?: string | null
          post_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          project_id?: string | null
          post_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Project = Database['public']['Tables']['projects']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Task = Database['public']['Tables']['tasks']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
