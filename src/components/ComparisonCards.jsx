function ComparisonCard({ entry, formatCurrency }) {
  const buyWins = entry.results.advantage > 0

  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{entry.name}</div>
          <div className="mt-1 text-xs text-slate-500">
            {buyWins ? 'Avantage achat' : 'Avantage location'}
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${
            buyWins ? 'bg-emerald-400/15 text-emerald-200' : 'bg-rose-400/15 text-rose-200'
          }`}
        >
          {buyWins ? 'Acheter' : 'Louer'}
        </span>
      </div>

      <div className="mt-4 grid gap-2">
        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-3">
          <span className="text-sm text-slate-400">Achat net</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(entry.results.ownerNetCost)}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-3">
          <span className="text-sm text-slate-400">Location nette</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(entry.results.rentNetCost)}</span>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-slate-950/35 px-3 py-3">
          <span className="text-sm text-slate-400">Ecart</span>
          <span className="text-sm font-semibold text-white">{formatCurrency(Math.abs(entry.results.advantage))}</span>
        </div>
      </div>
    </article>
  )
}

export default function ComparisonCards({ comparisonScenarios, formatCurrency, isMobile }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
            Comparer
          </div>
          <h2 className="mt-1 text-xl font-semibold text-white">Brouillon et scenarios sauvegardes</h2>
        </div>
        <div className="rounded-full border border-white/10 bg-slate-950/70 px-3 py-1.5 text-xs text-slate-400">
          Jusqu'a 4 scenarios
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
              <tr className="border-b border-white/10 text-left text-[11px] uppercase tracking-[0.16em] text-slate-500">
                <th className="px-3 py-3">Scenario</th>
                <th className="px-3 py-3">Achat net</th>
                <th className="px-3 py-3">Location nette</th>
                <th className="px-3 py-3">Ecart</th>
                <th className="px-3 py-3">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {comparisonScenarios.map((entry) => {
                const buyWins = entry.results.advantage > 0

                return (
                  <tr key={entry.id} className="border-b border-white/6 last:border-b-0">
                    <td className="px-3 py-3 text-white">{entry.name}</td>
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
