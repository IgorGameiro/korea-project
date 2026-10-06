import { StayEditor } from '@/features/admin/stays/stays-admin';

export const metadata = { title: 'Edit stay' };

export default async function EditStayPage({ params }: PageProps<'/[locale]/admin/stays/[id]'>) {
  return <StayEditor id={(await params).id} />;
}
