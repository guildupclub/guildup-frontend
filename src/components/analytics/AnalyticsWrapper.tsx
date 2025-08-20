import Script from 'next/script';
import { GTM_CONFIG } from '@/config/gtm';

export default function AnalyticsWrapper() {
  const primaryGa4Id = GTM_CONFIG.GA4_ID;
  const additionalGa4Ids = (process.env.NEXT_PUBLIC_GA4_ADDITIONAL_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
  const ga4LoaderId = primaryGa4Id;

  const ga4InitScript = `
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          ${[primaryGa4Id, ...additionalGa4Ids]
            .filter(Boolean)
            .map((id) => `gtag('config', '${id}');`)
            .join('\n          ')}
        `;
  return (
    <>
      {/* Google Tag Manager */}
      <Script
        id="gtm"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${GTM_CONFIG.GTM_ID}');
          `,
        }}
      />
      {/* Google Analytics 4 */}
      {ga4LoaderId ? (
        <>
          <Script
            id="ga4-loader"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga4LoaderId}`}
            strategy="afterInteractive"
          />
          <Script id="ga4" strategy="afterInteractive">
            {ga4InitScript}
          </Script>
        </>
      ) : null}

      {/* Facebook Pixel */}
      <Script id="fb-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push
          (arguments)}; if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!
          0;n.version='2.0';n.queue=[];t=b.createElement(e);
          t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,
          'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${GTM_CONFIG.FB_PIXEL_ID}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* Microsoft Clarity */}
      <Script
        id="ms-clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(c,l,a,r,i,t,y){
              c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
              t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
              y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${GTM_CONFIG.CLARITY_ID}");
          `,
        }}
      />

      {/* Noscript fallbacks */}
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_CONFIG.GTM_ID}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${GTM_CONFIG.FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
