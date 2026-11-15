'use client';

import { useParams } from 'next/navigation';
import EventEditor from '@/components/editor/EventEditor';

export default function NewEventPage() {
  const { slug } = useParams<{ slug: string }>();
  return <EventEditor mode={{ kind: 'new', slug }} />;
}
