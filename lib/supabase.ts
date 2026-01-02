
import { createClient } from '@supabase/supabase-js';

// These environment variables are usually managed in Vercel or a .env file
// For the MVP we keep them here, but for production use process.env
const supabaseUrl = 'https://adprsdrutkdmpvwtccht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcHJzZHJ1dGtkbXB2d3RjY2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODQ1ODEsImV4cCI6MjA4MjM2MDU4MX0.c7upNxwAmk4aw8thNUfDcZeg414TkEoSAMqi72ylLIM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
