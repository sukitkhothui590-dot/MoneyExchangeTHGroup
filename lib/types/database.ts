export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          name: string;
          email: string;
          avatar_url: string | null;
          phone: string | null;
          role: "admin" | "customer";
          terms_accepted_at: string | null;
          notification_email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          avatar_url?: string | null;
          phone?: string | null;
          role?: "admin" | "customer";
          terms_accepted_at?: string | null;
          notification_email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          avatar_url?: string | null;
          phone?: string | null;
          role?: "admin" | "customer";
          terms_accepted_at?: string | null;
          notification_email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          thumbnail: string;
          article_type: "บทความ" | "ข่าว";
          status: "draft" | "published";
          author_id: string;
          meta_title: string | null;
          meta_description: string | null;
          image_alt_text: string | null;
          focus_keyword: string | null;
          // English translations
          title_en: string;
          excerpt_en: string;
          content_en: string;
          meta_title_en: string | null;
          meta_description_en: string | null;
          image_alt_text_en: string | null;
          // Chinese translations
          title_cn: string;
          excerpt_cn: string;
          content_cn: string;
          meta_title_cn: string | null;
          meta_description_cn: string | null;
          image_alt_text_cn: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          excerpt: string;
          content: string;
          thumbnail?: string;
          article_type?: "บทความ" | "ข่าว";
          status?: "draft" | "published";
          author_id: string;
          meta_title?: string | null;
          meta_description?: string | null;
          image_alt_text?: string | null;
          focus_keyword?: string | null;
          // English translations
          title_en?: string;
          excerpt_en?: string;
          content_en?: string;
          meta_title_en?: string | null;
          meta_description_en?: string | null;
          image_alt_text_en?: string | null;
          // Chinese translations
          title_cn?: string;
          excerpt_cn?: string;
          content_cn?: string;
          meta_title_cn?: string | null;
          meta_description_cn?: string | null;
          image_alt_text_cn?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          excerpt?: string;
          content?: string;
          thumbnail?: string;
          article_type?: "บทความ" | "ข่าว";
          status?: "draft" | "published";
          author_id?: string;
          meta_title?: string | null;
          meta_description?: string | null;
          image_alt_text?: string | null;
          focus_keyword?: string | null;
          // English translations
          title_en?: string;
          excerpt_en?: string;
          content_en?: string;
          meta_title_en?: string | null;
          meta_description_en?: string | null;
          image_alt_text_en?: string | null;
          // Chinese translations
          title_cn?: string;
          excerpt_cn?: string;
          content_cn?: string;
          meta_title_cn?: string | null;
          meta_description_cn?: string | null;
          image_alt_text_cn?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      currencies: {
        Row: {
          id: number;
          code: string;
          name: string;
          flag: string;
          buy_rate: number;
          sell_rate: number;
          buy_margin_percent: number;
          sell_margin_percent: number;
          last_updated: string;
          sort_order: number;
        };
        Insert: {
          id?: number;
          code: string;
          name: string;
          flag: string;
          buy_rate: number;
          sell_rate: number;
          buy_margin_percent?: number;
          sell_margin_percent?: number;
          last_updated?: string;
          sort_order?: number;
        };
        Update: {
          id?: number;
          code?: string;
          name?: string;
          flag?: string;
          buy_rate?: number;
          sell_rate?: number;
          buy_margin_percent?: number;
          sell_margin_percent?: number;
          last_updated?: string;
          sort_order?: number;
        };
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          status: "active" | "suspended" | "banned";
          join_date: string;
          wallet_balance: number;
          verified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          status?: "active" | "suspended" | "banned";
          join_date?: string;
          wallet_balance?: number;
          verified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          status?: "active" | "suspended" | "banned";
          join_date?: string;
          wallet_balance?: number;
          verified?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          member_id: string;
          member_name: string;
          currency_code: string;
          currency_flag: string;
          amount: number;
          rate: number;
          total_thb: number;
          pickup_method: "branch" | "wallet";
          branch_name: string | null;
          pickup_date: string | null;
          status:
            | "pending_payment"
            | "pending_review"
            | "approved"
            | "completed";
          slip_url: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          member_name: string;
          currency_code: string;
          currency_flag: string;
          amount: number;
          rate: number;
          total_thb: number;
          pickup_method: "branch" | "wallet";
          branch_name?: string | null;
          pickup_date?: string | null;
          status?:
            | "pending_payment"
            | "pending_review"
            | "approved"
            | "completed";
          slip_url?: string;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          member_name?: string;
          currency_code?: string;
          currency_flag?: string;
          amount?: number;
          rate?: number;
          total_thb?: number;
          pickup_method?: "branch" | "wallet";
          branch_name?: string | null;
          pickup_date?: string | null;
          status?:
            | "pending_payment"
            | "pending_review"
            | "approved"
            | "completed";
          slip_url?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      topup_requests: {
        Row: {
          id: string;
          member_id: string;
          member_name: string;
          amount: number;
          transfer_date: string;
          status: "pending" | "approved" | "rejected";
          slip_url: string;
          note: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          member_id: string;
          member_name: string;
          amount: number;
          transfer_date: string;
          status?: "pending" | "approved" | "rejected";
          slip_url?: string;
          note?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          member_id?: string;
          member_name?: string;
          amount?: number;
          transfer_date?: string;
          status?: "pending" | "approved" | "rejected";
          slip_url?: string;
          note?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      exchange_rate_cache: {
        Row: {
          id: number;
          base_currency: string;
          rates: Json;
          fetched_at: string;
        };
        Insert: {
          id?: number;
          base_currency?: string;
          rates: Json;
          fetched_at?: string;
        };
        Update: {
          id?: number;
          base_currency?: string;
          rates?: Json;
          fetched_at?: string;
        };
        Relationships: [];
      };
      contact_messages: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          company: string | null;
          message: string;
          read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          company?: string | null;
          message: string;
          read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          company?: string | null;
          message?: string;
          read?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      branches: {
        Row: {
          id: string;
          name: string;
          name_th: string;
          address: string;
          address_th: string;
          address_cn: string;
          hours: string;
          hours_th: string;
          hours_cn: string;
          status: "active" | "inactive";
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          name_th: string;
          address?: string;
          address_th?: string;
          address_cn?: string;
          hours?: string;
          hours_th?: string;
          hours_cn?: string;
          status?: "active" | "inactive";
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          name_th?: string;
          address?: string;
          address_th?: string;
          address_cn?: string;
          hours?: string;
          hours_th?: string;
          hours_cn?: string;
          status?: "active" | "inactive";
          created_at?: string;
        };
        Relationships: [];
      };
      branch_currency_margins: {
        Row: {
          id: number;
          branch_id: string;
          currency_code: string;
          buy_margin_percent: number;
          sell_margin_percent: number;
          updated_at: string;
        };
        Insert: {
          id?: number;
          branch_id: string;
          currency_code: string;
          buy_margin_percent?: number;
          sell_margin_percent?: number;
          updated_at?: string;
        };
        Update: {
          id?: number;
          branch_id?: string;
          currency_code?: string;
          buy_margin_percent?: number;
          sell_margin_percent?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Article = Database["public"]["Tables"]["articles"]["Row"];
export type Currency = Database["public"]["Tables"]["currencies"]["Row"];
export type Member = Database["public"]["Tables"]["members"]["Row"];
export type Booking = Database["public"]["Tables"]["bookings"]["Row"];
export type BookingStatus = Booking["status"];
export type TopupRequest =
  Database["public"]["Tables"]["topup_requests"]["Row"];
export type ExchangeRateCache =
  Database["public"]["Tables"]["exchange_rate_cache"]["Row"];
export type ContactMessage =
  Database["public"]["Tables"]["contact_messages"]["Row"];
export type Branch = Database["public"]["Tables"]["branches"]["Row"];
export type BranchCurrencyMargin =
  Database["public"]["Tables"]["branch_currency_margins"]["Row"];

// Branch margin with merged currency info (from GET /api/branches/[id]/margins)
export interface BranchMarginEntry {
  currency_code: string;
  currency_name: string;
  currency_flag: string;
  buy_margin_percent: number;
  sell_margin_percent: number;
  is_override: boolean;
  global_buy_margin: number;
  global_sell_margin: number;
  global_buy_rate: number;
  global_sell_rate: number;
}
