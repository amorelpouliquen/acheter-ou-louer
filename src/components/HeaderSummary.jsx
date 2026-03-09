import { assetUrl } from '../baseUrl'

export default function HeaderSummary({ buyWins, activeSection, onSectionChange, isMobile }) {
  const sections = [
    { id: 'params', label: 'Paramètres' },
    { id: 'results', label: 'Résultats' },
    { id: 'compare', label: 'Comparer' },
    { id: 'library', label: 'Scénarios' },
  ]

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
      <header className="px-4 py-4 sm:px-5">
        <div className="flex items-start gap-4">
          <img
            src={assetUrl('favicon.svg')}
            alt="Logo Louer ou acheter"
            className="h-14 w-14 shrink-0 rounded-2xl border border-slate-800 bg-slate-950 p-2 shadow-[0_10px_30px_rgba(2,6,23,0.35)] sm:h-16 sm:w-16"
          />
          <div className="max-w-2xl">
            <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-300">
              Comparateur immobilier
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                Louer ou acheter
              </h1>
              <span
                className={`inline-flex min-h-9 items-center rounded-md border px-2.5 text-xs font-medium ${
                  buyWins
                    ? 'border-emerald-900/70 bg-emerald-950/30 text-emerald-300'
                    : 'border-rose-900/70 bg-rose-950/30 text-rose-300'
                }`}
              >
                Verdict {buyWins ? 'Acheter' : 'Louer'}
              </span>
            </div>
            <p className="mt-1 text-sm font-medium text-slate-300">Simulateur achat vs location</p>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-400">
              Comparez achat et location de résidence principale selon votre apport, votre crédit,
              les frais d'acquisition, les charges et votre horizon de détention.
            </p>
          </div>
        </div>
      </header>

      <div className="border-t border-slate-800 px-2 py-2 sm:px-4">
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
                className={`inline-flex min-h-10 shrink-0 items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                  selected
                    ? 'border-cyan-700 bg-slate-900 text-cyan-100'
                    : 'border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-900'
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
