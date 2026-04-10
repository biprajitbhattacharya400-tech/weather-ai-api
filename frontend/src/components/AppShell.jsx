import WeatherAtmosphere from './WeatherAtmosphere';

function AppShell({ condition, topBar, hero, centerPanel, desktopPanel, mobilePanel, footer }) {
  return (
    <main className="relative flex min-h-screen flex-col overflow-x-hidden text-inkPrimary pb-[env(safe-area-inset-bottom)]">
      <WeatherAtmosphere condition={condition} />

      <div className="relative z-10 mx-auto w-full max-w-[1440px] flex-1 px-5 pb-8 pt-20 md:px-10 md:pt-24 lg:grid lg:grid-cols-[minmax(0,0.98fr)_minmax(320px,0.8fr)_minmax(320px,0.72fr)] lg:gap-8 lg:px-14 lg:pb-24 xl:gap-10">
        <div className="relative z-30 mb-9 lg:col-span-3 lg:mb-1">{topBar}</div>

        <section className={`flex min-h-[68vh] justify-center pb-44 ${desktopPanel ? 'items-start lg:min-h-0 lg:justify-start lg:pb-0' : 'items-start pt-3 sm:pt-6 lg:col-span-3 lg:min-h-0 lg:justify-start lg:pt-12 lg:pb-0'}`}>
          {hero}
        </section>

        {centerPanel ? <section className="hidden lg:block lg:pt-6">{centerPanel}</section> : null}

        {desktopPanel ? <aside className="hidden lg:flex lg:items-stretch">{desktopPanel}</aside> : null}
      </div>

      {mobilePanel ? (
        <div className="relative z-20 mt-8 mb-6 px-4 lg:hidden">{mobilePanel}</div>
      ) : null}

      {footer ? <div className="relative z-30 mt-auto px-4 pb-[calc(0.9rem+env(safe-area-inset-bottom))] pt-2 text-center">{footer}</div> : null}
    </main>
  );
}

export default AppShell;
