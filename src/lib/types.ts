export interface InfoItem {
  id: string;
  type: 'note' | 'password' | 'photo' | 'application';
  title: string;
  content: string;
  categories: string[];
  createdAt: string;
  imageUrl?: string;
  downloadUrl?: string;
}
