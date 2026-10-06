import { CityEditor } from '@/features/admin/cities/city-editor';

export const metadata = { title: 'Edit city' };

export default async function EditCityPage({ params }: PageProps<'/[locale]/admin/cities/[id]'>) {
  return <CityEditor id={(await params).id} />;
}
