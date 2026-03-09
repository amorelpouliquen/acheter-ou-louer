export default function ScenarioLibrary({
  savedScenarios,
  selectedIds,
  pricingModes,
  latestShare,
  buildShareUrl,
  onDelete,
  onLoad,
  onToggle,
  formatCurrency,
}) {
  async function copyShareUrl(url) {
    if (!navigator.clipboard?.writeText) {
      return
    }

    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // Ignore clipboard failures and keep the raw link visible.
    }
  }

  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-925/80 p-4">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Scénarios
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">Bibliothèque</h2>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
          {savedScenarios.length}
        </div>
      </div>

      {latestShare ? (
        <div className="mb-4 rounded-xl border border-cyan-800/70 bg-cyan-950/30 p-3">
          <div className="text-sm font-semibold text-cyan-100">Lien de partage créé</div>
          <div className="mt-1 break-all text-xs leading-5 text-cyan-200/80">{latestShare.url}</div>
        </div>
      ) : null}

      <div className="grid gap-3 xl:grid-cols-2 2xl:grid-cols-3">
        {savedScenarios.length === 0 ? (
          <div className="xl:col-span-2 2xl:col-span-3 rounded-lg border border-dashed border-slate-800 bg-slate-950/50 px-4 py-5 text-sm text-slate-500">
            Aucun scénario sauvegardé pour le moment.
          </div>
        ) : null}

        {savedScenarios.map((entry) => {
          const isSelected = selectedIds.includes(entry.id)
          const shareUrl = buildShareUrl(entry)
          const isLatestShare = latestShare?.id === entry.id

          return (
            <article key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{entry.name}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">
                    {entry.inputs.pricingMode === pricingModes.sqm
                      ? `${formatCurrency(entry.inputs.purchasePricePerSqm)}/m² · ${formatCurrency(entry.inputs.monthlyRentPerSqm)}/m²`
                      : `${formatCurrency(entry.inputs.purchasePrice)} · ${formatCurrency(entry.inputs.monthlyRent)}/mois`}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(entry.id)}
                  className="cta-secondary min-h-10 rounded-md px-3 text-xs transition"
                >
                  Supprimer
                </button>
              </div>

              <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950/80 p-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-xs font-medium text-slate-300">
                    {isLatestShare ? 'Lien unique prêt à partager' : 'Lien de partage'}
                  </div>
                  <button
                    type="button"
                    onClick={() => copyShareUrl(shareUrl)}
                    className="cta-soft min-h-9 w-full rounded-md px-3 text-xs transition sm:w-auto"
                  >
                    Copier le lien
                  </button>
                </div>
                <a
                  href={shareUrl}
                  className="mt-2 block break-all text-xs leading-5 text-cyan-300 underline decoration-cyan-800 underline-offset-2"
                >
                  {shareUrl}
                </a>
              </div>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => onLoad(entry)}
                  className="cta-secondary min-h-11 rounded-lg px-4 text-sm font-medium transition"
                >
                  Charger ce scénario
                </button>
                <button
                  type="button"
                  onClick={() => onToggle(entry.id)}
                  className={`min-h-11 rounded-lg px-4 text-sm font-medium transition ${
                    isSelected ? 'cta-selected' : 'cta-secondary'
                  }`}
                >
                  {isSelected ? 'Ajouté à la comparaison' : 'Ajouter à la comparaison'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
