
import { createClient } from 'https://esm.sh/@supabase/supabase-js@^2.45.0';

const supabaseUrl = 'https://adprsdrutkdmpvwtccht.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkcHJzZHJ1dGtkbXB2d3RjY2h0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3ODQ1ODEsImV4cCI6MjA4MjM2MDU4MX0.c7upNxwAmk4aw8thNUfDcZeg414TkEoSAMqi72ylLIM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
