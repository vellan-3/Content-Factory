import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Post = {
  id: string;
  content: string;
  format: string;
  likes: number;
  replies: number;
  impressions: number;
  worked_status: 'banger' | 'good' | 'mid' | 'flop';
  notes?: string;
  created_at: string;
};

export type Meme = {
  id: string;
  url: string;
  public_id: string;
  category: 'winning' | 'unbothered' | 'chaos' | 'disappointment' | 'thinking' | 'hype' | 'other';
  label: string;
  created_at: string;
};

export type Identity = {
  id: string;
  voice: string[];
  persona: string;
  niche: string[];
  rules: string[];
  updated_at: string;
};
