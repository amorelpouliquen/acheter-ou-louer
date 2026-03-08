function TopMetric({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
        {label}
      </div>
      <div className="mt-1 text-base font-semibold text-white">{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-300">{helper}</div> : null}
    </div>
  )
}

export default function HeaderSummary({
  inputs,
  scenario,
  buyWins,
  formatCurrency,
  formatNumber,
  activeSection,
  onSectionChange,
  isMobile,
}) {
  const sections = [
    { id: 'params', label: 'Parametres' },
    { id: 'results', label: 'Resultat' },
    { id: 'compare', label: 'Comparer' },
    { id: 'library', label: 'Scenarios' },
  ]

  return (
    <div className="rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_42%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))] shadow-[0_28px_80px_rgba(2,6,23,0.45)]">
      <header className="px-4 py-4 sm:px-6 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-300">
              Comparateur immobilier
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                Louer ou acheter
              </h1>
              <span
                className={`inline-flex min-h-10 items-center rounded-full border px-3 text-sm font-medium ${
                  buyWins
                    ? 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200'
                    : 'border-rose-400/30 bg-rose-400/15 text-rose-200'
                }`}
              >
                Verdict: {buyWins ? 'Acheter' : 'Louer'}
              </span>
            </div>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
              Evaluez rapidement votre arbitrage residentiel avec un parcours mobile plus court,
              centre sur l’essentiel puis sur le detail.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:min-w-[420px]">
            <TopMetric
              label="Surface"
              value={`${formatNumber(inputs.surfaceSqm)} m2`}
              helper="Format saisi"
            />
            <TopMetric
              label="Cout achat"
              value={formatCurrency(scenario.ownerNetCost)}
              helper={`Horizon ${inputs.horizonYears} ans`}
            />
            <TopMetric
              label="Ecart"
              value={formatCurrency(Math.abs(scenario.advantage))}
              helper={buyWins ? 'Avantage achat' : 'Avantage location'}
            />
          </div>
        </div>
      </header>

      <div className="border-t border-white/10 px-2 py-2 sm:px-4">
        <nav
          className={`flex gap-2 overflow-x-auto px-2 pb-1 ${isMobile ? 'sticky top-0 z-30' : ''}`}
          aria-label="Navigation du simulateur"
        >
          {sections.map((section) => {
            const selected = activeSection === section.id

            return (
              <button
                key={section.id}
                type="button"
                onClick={() => onSectionChange(section.id)}
                className={`inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition ${
                  selected
                    ? 'border-cyan-300/50 bg-cyan-400 text-slate-950'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:border-cyan-300/35 hover:bg-white/10'
                }`}
                aria-pressed={selected}
              >
                {section.label}
              </button>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
