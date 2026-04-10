import { useEffect, useMemo, useState } from 'react';
import WeatherAtmosphere from './WeatherAtmosphere';

function AppShell({ condition, topBar, hero, centerPanel, desktopPanel, mobilePanel, footer }) {
  const [scrollY, setScrollY] = useState(0);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [showCursorGlow, setShowCursorGlow] = useState(false);

  useEffect(() => {
    const updateCapability = () => {
      const pointerFine = window.matchMedia('(pointer:fine)').matches;
      setShowCursorGlow(pointerFine && window.innerWidth >= 1024);
    };

    updateCapability();
    window.addEventListener('resize', updateCapability);

    return () => window.removeEventListener('resize', updateCapability);
  }, []);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      if (frame) return;
      frame = requestAnimationFrame(() => {
        setScrollY(window.scrollY || 0);
        frame = 0;
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  const heroShift = useMemo(() => Math.max(-18, -scrollY * 0.04), [scrollY]);

  return (
    <main
      className="relative flex min-h-screen flex-col overflow-x-hidden text-inkPrimary pb-[env(safe-area-inset-bottom)]"
      onMouseMove={(event) => {
        if (!showCursorGlow) return;
        setCursor({ x: event.clientX, y: event.clientY });
      }}
    >
      <WeatherAtmosphere condition={condition} parallaxOffset={scrollY} />
      {showCursorGlow ? <div className="cursor-glow" style={{ left: cursor.x, top: cursor.y }} /> : null}

      <div className="relative z-10 mx-auto w-full max-w-[1440px] flex-1 px-5 pb-8 pt-20 md:px-10 md:pt-24 lg:grid lg:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.8fr)_minmax(320px,0.72fr)] lg:gap-8 lg:px-14 lg:pb-24 xl:gap-10">
        <div className="section-enter relative z-30 mb-9 lg:col-span-3 lg:mb-1">{topBar}</div>

        <section style={{ transform: `translateY(${heroShift}px)` }} className={`section-enter flex min-h-[68vh] justify-center pb-44 ${desktopPanel ? 'items-start lg:min-h-0 lg:justify-start lg:pb-0' : 'items-start pt-3 sm:pt-6 lg:col-span-3 lg:min-h-0 lg:justify-start lg:pt-12 lg:pb-0'}`}>
          {hero}
        </section>

        {centerPanel ? <section className="section-enter hidden lg:block lg:pt-6" style={{ animationDelay: '80ms' }}>{centerPanel}</section> : null}

        {desktopPanel ? <aside className="section-enter hidden lg:flex lg:items-stretch" style={{ animationDelay: '140ms' }}>{desktopPanel}</aside> : null}
      </div>

      {mobilePanel ? (
        <div className="section-enter relative z-20 mt-8 mb-6 px-4 lg:hidden" style={{ animationDelay: '120ms' }}>{mobilePanel}</div>
      ) : null}

      {footer ? <div className="section-enter relative z-30 mt-auto px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-2 text-center" style={{ animationDelay: '180ms' }}>{footer}</div> : null}
    </main>
  );
}

export default AppShell;
