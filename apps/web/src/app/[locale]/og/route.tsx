import { isLocale } from '@korea-project/shared';
import { ImageResponse } from 'next/og';
import { getTranslations } from 'next-intl/server';
import { localeParams } from '@/lib/static-params';

// Default share image (1200×630) for pages without a photo of their own (home, plan, search);
// cities and places use their hero photo. A route handler rather than the `opengraph-image` file
// convention: that one builds its URL from the internal segment (/pt-BR/...), which is not a public
// address (public Portuguese URLs start with /pt). openGraphFor() links /og and /pt/og instead.

export const dynamic = 'force-static';
export const generateStaticParams = localeParams;

const size = { width: 1200, height: 630 };

export async function GET(_request: Request, { params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  const locale = isLocale(raw) ? raw : 'en';
  const t = await getTranslations({ locale, namespace: 'meta' });
  const home = await getTranslations({ locale, namespace: 'home' });
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: 72,
        background: 'linear-gradient(135deg, #0b1f3a 0%, #16335c 60%, #c9353a 140%)',
        color: 'white',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            background: '#e5484d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 40,
            fontWeight: 700,
          }}
        >
          K
        </div>
        <div style={{ fontSize: 36, fontWeight: 700 }}>{t('siteName')}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>{home('heroTitle')}</div>
        <div style={{ fontSize: 32, opacity: 0.85, maxWidth: 950 }}>{home('heroSubtitle')}</div>
      </div>
    </div>,
    size,
  );
}
