const GA_ID = import.meta.env.VITE_GA_ID;

export const initGoogleAnalytics = () => {
  if (!GA_ID || document.getElementById('ga-gtag-script')) {
    return;
  }

  const script1 = document.createElement('script');
  script1.id = 'ga-gtag-script';
  script1.async = true;
  script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script1);

  const script2 = document.createElement('script');
  script2.id = 'ga-gtag-inline';
  script2.innerHTML = `
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `;
  document.head.appendChild(script2);
};

export const trackEvent = (eventName, params = {}) => {
  if (!GA_ID || typeof window === 'undefined') {
    return;
  }

  window.gtag?.('event', eventName, params);
};
