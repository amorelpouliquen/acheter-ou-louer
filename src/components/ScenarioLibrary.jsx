export default function ScenarioLibrary({
  savedScenarios,
  selectedIds,
  pricingModes,
  onDelete,
  onLoad,
  onToggle,
  formatCurrency,
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
            Scenarios
          </div>
          <h2 className="mt-1 text-xl font-semibold text-white">Bibliotheque</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-400">
          {savedScenarios.length}
        </div>
      </div>

      <div className="space-y-3">
        {savedScenarios.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-950/30 px-4 py-5 text-sm text-slate-500">
            Aucun scenario sauvegarde pour le moment.
          </div>
        ) : null}

        {savedScenarios.map((entry) => {
          const isSelected = selectedIds.includes(entry.id)

          return (
            <article key={entry.id} className="rounded-[22px] border border-white/10 bg-slate-950/50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{entry.name}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">
                    {entry.inputs.pricingMode === pricingModes.sqm
                      ? `${formatCurrency(entry.inputs.purchasePricePerSqm)}/m2 · ${formatCurrency(entry.inputs.monthlyRentPerSqm)}/m2`
                      : `${formatCurrency(entry.inputs.purchasePrice)} · ${formatCurrency(entry.inputs.monthlyRent)}/mois`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="min-h-10 rounded-xl border border-white/10 px-3 text-xs text-slate-400 transition hover:bg-white/5"
                >
                  Supprimer
                </button>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onLoad(entry)}
                  className="min-h-11 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Charger ce scenario
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(entry.id)}
                  className={`min-h-11 rounded-2xl px-4 text-sm font-medium transition ${
                    isSelected
                      ? 'bg-cyan-400 text-slate-950'
                      : 'border border-white/10 bg-transparent text-slate-200 hover:bg-white/5'
                  }`}
                >
                  {isSelected ? 'Ajoute a la comparaison' : 'Ajouter a la comparaison'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
