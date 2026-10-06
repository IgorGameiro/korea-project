import { PlaceEditor } from '@/features/admin/places/places-admin';

export const metadata = { title: 'Edit place' };

export default async function EditPlacePage({ params }: PageProps<'/[locale]/admin/places/[id]'>) {
  return <PlaceEditor id={(await params).id} />;
}
