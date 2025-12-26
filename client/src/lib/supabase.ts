import { createClient } from '@supabase/supabase-js';

export const projectId = 'liftusgljobyismswnjk';
export const publicAnonKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpZnR1c2dsam9ieWlzbXN3bmprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MjYwMDIsImV4cCI6MjA4MjMwMjAwMn0.AX7ZHc07ru5OSCDz2ArpoBwdvywe7sHG2Ng-ZC2D5qc';

export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey,
);
