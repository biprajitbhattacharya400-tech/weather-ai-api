import WeatherAtmosphere from './WeatherAtmosphere';

function AppShell({ condition, topBar, hero, centerPanel, desktopPanel, mobilePanel, footer }) {
  return (
    <main className="relative min-h-screen overflow-hidden text-inkPrimary">
      <WeatherAtmosphere condition={condition} />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[1440px] px-5 pb-24 pt-20 md:px-10 md:pt-24 lg:grid lg:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.8fr)_minmax(320px,0.72fr)] lg:gap-8 lg:px-14 lg:pb-24 xl:gap-10">
        <div className="relative z-30 mb-9 lg:col-span-3 lg:mb-1">{topBar}</div>

        <section className={`flex min-h-[68vh] justify-center pb-44 ${desktopPanel ? 'items-start lg:min-h-0 lg:justify-start lg:pb-0' : 'items-start pt-3 sm:pt-6 lg:col-span-3 lg:min-h-0 lg:justify-start lg:pt-12 lg:pb-0'}`}>
          {hero}
        </section>

        {centerPanel ? <section className="hidden lg:block lg:pt-6">{centerPanel}</section> : null}

        {desktopPanel ? <aside className="hidden lg:flex lg:items-stretch">{desktopPanel}</aside> : null}
      </div>

      {mobilePanel ? (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 lg:hidden">{mobilePanel}</div>
      ) : null}

      {footer ? <div className="pointer-events-none fixed inset-x-0 bottom-4 z-30 text-center">{footer}</div> : null}
    </main>
  );
}

export default AppShell;
