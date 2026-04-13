import { useEffect, useMemo, useRef, useState } from 'react';
import WeatherAtmosphere from './WeatherAtmosphere';
import AmbientSoundControl from './AmbientSoundControl';

const resolveWeatherKey = (condition = '') => {
  const normalized = String(condition).toLowerCase();
  if (normalized.includes('thunder')) return 'rain';
  if (normalized.includes('rain') || normalized.includes('drizzle')) return 'rain';
  if (normalized.includes('cloud') || normalized.includes('mist') || normalized.includes('fog')) return 'clouds';
  if (normalized.includes('night')) return 'night';
  if (normalized.includes('clear') || normalized.includes('sun')) return 'clear';
  return 'default';
};

function AppShell({ condition, topBar, hero, centerPanel, desktopPanel, mobilePanel, footer, suppressLineEffects = false, viewKey = 'single' }) {
  const [scrollY, setScrollY] = useState(0);
  const [showCursorGlow, setShowCursorGlow] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const cursorGlowRef = useRef(null);
  const cursorFrameRef = useRef(0);
  const cursorPosRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const updateCapability = () => {
      const pointerFine = window.matchMedia('(pointer:fine)').matches;
      setShowCursorGlow(pointerFine && window.innerWidth >= 1024);
      setIsDesktop(window.innerWidth >= 1024);
    };

    updateCapability();
    window.addEventListener('resize', updateCapability);

    return () => window.removeEventListener('resize', updateCapability);
  }, []);

  useEffect(() => {
    if (!showCursorGlow && cursorGlowRef.current) {
      cursorGlowRef.current.style.opacity = '0';
    }
  }, [showCursorGlow]);

  useEffect(() => () => {
    if (cursorFrameRef.current) cancelAnimationFrame(cursorFrameRef.current);
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

  const heroShift = useMemo(() => (isDesktop ? Math.max(-18, -scrollY * 0.04) : 0), [scrollY, isDesktop]);
  const weatherKey = useMemo(() => resolveWeatherKey(condition), [condition]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll('.scroll-reveal'));
    if (nodes.length === 0) return undefined;

    const revealVisible = () => {
      nodes.forEach((node) => {
        const rect = node.getBoundingClientRect();
        if (rect.top <= window.innerHeight * 0.92) {
          node.classList.add('revealed');
        }
      });
    };

    revealVisible();

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -6% 0px' },
    );

    nodes.forEach((node) => {
      if (!node.classList.contains('revealed')) {
        observer.observe(node);
      }
    });

    return () => observer.disconnect();
  }, [condition, Boolean(centerPanel), Boolean(desktopPanel), Boolean(mobilePanel)]);

  return (
    <main
      className={`relative flex min-h-screen flex-col overflow-x-hidden text-inkPrimary pb-[env(safe-area-inset-bottom)] wx-${weatherKey}`}
      onMouseMove={(event) => {
        if (!showCursorGlow) return;

        cursorPosRef.current = { x: event.clientX, y: event.clientY };
        if (cursorFrameRef.current) return;

        cursorFrameRef.current = requestAnimationFrame(() => {
          cursorFrameRef.current = 0;
          if (!cursorGlowRef.current) return;

          const { x, y } = cursorPosRef.current;
          cursorGlowRef.current.style.opacity = '1';
          cursorGlowRef.current.style.transform = `translate3d(${x - 110}px, ${y - 110}px, 0)`;
        });
      }}
      onMouseLeave={() => {
        if (cursorGlowRef.current) cursorGlowRef.current.style.opacity = '0';
      }}
    >
      <WeatherAtmosphere condition={condition} parallaxOffset={scrollY} suppressLineEffects={suppressLineEffects} />
      {showCursorGlow ? <div ref={cursorGlowRef} className="cursor-glow" /> : null}

      <div key={viewKey} className="view-pane-transition relative z-10 mx-auto w-full max-w-[1440px] flex-1 px-5 pb-8 pt-20 md:px-10 md:pt-24 lg:grid lg:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.8fr)_minmax(320px,0.72fr)] lg:gap-8 lg:px-14 lg:pb-24 xl:gap-10">
        <div className="scroll-reveal revealed relative z-30 mb-5 lg:col-span-3 lg:mb-0">{topBar}</div>

        <section style={{ transform: `translateY(${heroShift}px)` }} className={`scroll-reveal revealed flex min-h-[68vh] justify-center pb-44 ${desktopPanel ? 'items-start lg:min-h-0 lg:justify-start lg:pb-0' : 'items-start pt-0 sm:pt-2 lg:col-span-3 lg:min-h-0 lg:justify-start lg:pt-3 lg:pb-0'}`}>
          {hero}
        </section>

        {centerPanel ? <section className="scroll-reveal hidden lg:block lg:pt-6" style={{ transitionDelay: '90ms' }}>{centerPanel}</section> : null}

        {desktopPanel ? <aside className="scroll-reveal hidden lg:flex lg:items-stretch" style={{ transitionDelay: '140ms' }}>{desktopPanel}</aside> : null}
      </div>

      {mobilePanel ? (
        <div className="scroll-reveal relative z-20 mt-8 mb-6 px-4 lg:hidden" style={{ transitionDelay: '120ms' }}>{mobilePanel}</div>
      ) : null}

      {footer ? <div className="scroll-reveal revealed relative z-30 mt-auto px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-2 text-center" style={{ transitionDelay: '180ms' }}>{footer}</div> : null}

      <AmbientSoundControl weatherKey={weatherKey} />
    </main>
  );
}

export default AppShell;
