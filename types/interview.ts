export interface Interview {
  id: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled' | 'pending';
  type: 'technical' | 'behavioral' | 'cultural-fit' | 'screening';
  candidate_id: string;
  jd_interviews_id: string;
  link: string;
  candidate: {
    name: string;
    email: string;
    position: string;
    id: string;
  };
  scheduledTime: Date;
  duration: number; // in minutes
  created_at: string;
  updated_at: string;
}