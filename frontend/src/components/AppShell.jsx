import WeatherAtmosphere from './WeatherAtmosphere';

function AppShell({ condition, topBar, hero, desktopPanel, mobilePanel }) {
  return (
    <main className="relative min-h-screen overflow-hidden text-inkPrimary">
      <WeatherAtmosphere condition={condition} />

      <div className="relative z-10 mx-auto min-h-screen w-full max-w-[1440px] px-5 pb-8 pt-6 md:px-10 md:pt-8 lg:grid lg:grid-cols-[minmax(0,1.18fr)_minmax(360px,0.82fr)] lg:gap-12 lg:px-14 lg:pb-10">
        <div className="mb-9 lg:col-span-2 lg:mb-1">{topBar}</div>

        <section className="flex min-h-[68vh] items-center justify-center pb-36 lg:min-h-0 lg:justify-start lg:pb-0">
          {hero}
        </section>

        {desktopPanel ? <aside className="hidden lg:flex lg:items-stretch">{desktopPanel}</aside> : null}
      </div>

      {mobilePanel ? (
        <div className="fixed inset-x-0 bottom-0 z-20 px-4 pb-4 lg:hidden">{mobilePanel}</div>
      ) : null}
    </main>
  );
}

export default AppShell;
