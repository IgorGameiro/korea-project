import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Guia de Viagem da Coreia do Sul',
  description: 'Cidades, bairros, lugares e custos para planejar sua viagem à Coreia do Sul.',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
