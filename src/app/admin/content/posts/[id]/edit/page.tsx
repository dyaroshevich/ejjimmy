'use client';

import { useParams } from 'next/navigation';
import PostEditor from '@/components/admin/content/PostEditor';

export default function EditPostPage() {
  const params = useParams();
  const id = params.id as string;
  return <PostEditor mode="edit" postId={id} />;
}
