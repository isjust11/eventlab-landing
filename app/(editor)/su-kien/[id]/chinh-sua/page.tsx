'use client';

import { useParams } from 'next/navigation';
import EventEditor from '@/components/editor/EventEditor';

export default function EditEventPage() {
  const { id } = useParams<{ id: string }>();
  return <EventEditor mode={{ kind: 'edit', id: decodeURIComponent(id) }} />;
}
