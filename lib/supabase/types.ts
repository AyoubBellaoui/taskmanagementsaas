export type Priority = "none" | "low" | "medium" | "high";
export type Recurrence = "none" | "daily" | "weekly" | "monthly";
export type PlanTier = "free" | "pro";
export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "paused"
  | "canceled";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      subscriptions: {
        Row: {
          user_id: string;
          plan: PlanTier;
          status: SubscriptionStatus;
          paddle_customer_id: string | null;
          paddle_subscription_id: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]> & {
          user_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["subscriptions"]["Row"]>;
      };
      lists: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          icon: string | null;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["lists"]["Row"]> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["lists"]["Row"]>;
      };
      tasks: {
        Row: {
          id: string;
          user_id: string;
          list_id: string;
          parent_task_id: string | null;
          title: string;
          notes: string | null;
          due_date: string | null;
          priority: Priority;
          recurrence: Recurrence;
          completed: boolean;
          completed_at: string | null;
          position: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tasks"]["Row"]> & {
          user_id: string;
          list_id: string;
          title: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Row"]>;
      };
      tags: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["tags"]["Row"]> & {
          user_id: string;
          name: string;
        };
        Update: Partial<Database["public"]["Tables"]["tags"]["Row"]>;
      };
      task_tags: {
        Row: { task_id: string; tag_id: string };
        Insert: { task_id: string; tag_id: string };
        Update: Partial<{ task_id: string; tag_id: string }>;
      };
    };
  };
}
