function ComparisonCard({ entry, formatCurrency }) {
  const buyWins = entry.results.advantage > 0

  return (
    <article className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{entry.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {buyWins ? 'Avantage achat' : 'Avantage location'}
          </div>
        </div>
        <span
          className={`rounded-md px-2.5 py-1 text-xs font-medium ${
            buyWins ? 'border border-emerald-900/70 bg-emerald-950/30 text-emerald-300' : 'border border-rose-900/70 bg-rose-950/30 text-rose-300'
          }`}
        >
          {buyWins ? 'Acheter' : 'Louer'}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
          <span className="text-sm text-slate-400">Achat net</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(entry.results.ownerNetCost)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
          <span className="text-sm text-slate-400">Location nette</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(entry.results.rentNetCost)}</span>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
          <span className="text-sm text-slate-400">Écart</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(Math.abs(entry.results.advantage))}</span>
        </div>
      </div>
    </article>
  )
}

export default function ComparisonCards({ comparisonScenarios, formatCurrency, isMobile }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-925/80 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            Comparer
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">Brouillon et scénarios sauvegardés</h2>
        </div>
        <div className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
          Jusqu'à 4 scénarios
        </div>
      </div>

      {isMobile ? (
        <div className="grid gap-3">
          {comparisonScenarios.map((entry) => (
            <ComparisonCard key={entry.id} entry={entry} formatCurrency={formatCurrency} />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.14em] text-slate-500">
                <th className="px-3 py-3">Scénario</th>
                <th className="px-3 py-3">Achat net</th>
                <th className="px-3 py-3">Location nette</th>
                <th className="px-3 py-3">Écart</th>
                <th className="px-3 py-3">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {comparisonScenarios.map((entry) => {
                const buyWins = entry.results.advantage > 0

                return (
                  <tr key={entry.id} className="border-b border-slate-900 last:border-b-0">
                    <td className="px-3 py-3 text-slate-200">{entry.name}</td>
                    <td className="px-3 py-3 text-slate-300">{formatCurrency(entry.results.ownerNetCost)}</td>
                    <td className="px-3 py-3 text-slate-300">{formatCurrency(entry.results.rentNetCost)}</td>
                    <td className="px-3 py-3 text-slate-300">{formatCurrency(Math.abs(entry.results.advantage))}</td>
                    <td className={`px-3 py-3 font-semibold ${buyWins ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {buyWins ? 'Acheter' : 'Louer'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}
