function SectionCard({ eyebrow, title, aside, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-925/80 p-4">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
            {eyebrow}
          </div>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

function KeyFigure({ label, value, helper, tone = 'slate' }) {
  const tones = {
    slate: 'border-slate-800 bg-slate-950/70',
    cyan: 'border-cyan-900/70 bg-cyan-950/30',
    green: 'border-emerald-900/70 bg-emerald-950/30',
    red: 'border-rose-900/70 bg-rose-950/30',
  }

  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold text-slate-50">{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-400">{helper}</div> : null}
    </div>
  )
}

function DisclosureRow({ label, value, tooltip, emphasize = false, positive = false, formatCurrency }) {
  return (
    <details className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
        <span className={`min-w-0 text-sm ${emphasize ? 'font-medium text-slate-100' : 'text-slate-400'}`}>
          {label}
        </span>
        <span
          className={`shrink-0 text-sm font-semibold ${
            positive ? 'text-emerald-300' : emphasize ? 'text-slate-100' : 'text-slate-300'
          }`}
        >
          {formatCurrency(value)}
        </span>
      </summary>
      {tooltip ? <p className="mt-3 text-sm leading-6 text-slate-400">{tooltip}</p> : null}
    </details>
  )
}

function SummaryMetric({ label, value, helper, valueClassName = 'text-white' }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/50 px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className={`mt-1 text-sm font-semibold ${valueClassName}`}>{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-400">{helper}</div> : null}
    </div>
  )
}

function buildLinePath(data, width, height, paddingX, paddingY, accessor, maxValue) {
  if (data.length === 0) {
    return ''
  }

  return data
    .map((point, index) => {
      const x = paddingX + (index / Math.max(data.length - 1, 1)) * (width - paddingX * 2)
      const y =
        height - paddingY - (accessor(point) / Math.max(maxValue, 1)) * (height - paddingY * 2)

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function TimelineChart({ points, crossoverYear, sensitivityTimeline, opportunityReturn, isMobile }) {
  const width = isMobile ? 320 : 760
  const height = isMobile ? 176 : 240
  const paddingX = isMobile ? 16 : 18
  const paddingY = isMobile ? 18 : 18
  const maxValue = Math.max(
    ...points.flatMap((point) => [point.ownerNetCost, point.rentNetCost]),
    ...(sensitivityTimeline?.plus?.points ?? []).map((point) => point.rentNetCost),
    ...(sensitivityTimeline?.minus?.points ?? []).map((point) => point.rentNetCost),
    1,
  )

  const ownerPath = buildLinePath(
    points,
    width,
    height,
    paddingX,
    paddingY,
    (point) => point.ownerNetCost,
    maxValue,
  )
  const rentPath = buildLinePath(
    points,
    width,
    height,
    paddingX,
    paddingY,
    (point) => point.rentNetCost,
    maxValue,
  )
  const rentPlusPath = sensitivityTimeline
    ? buildLinePath(
        sensitivityTimeline.plus.points,
        width,
        height,
        paddingX,
        paddingY,
        (point) => point.rentNetCost,
        maxValue,
      )
    : ''
  const rentMinusPath = sensitivityTimeline
    ? buildLinePath(
        sensitivityTimeline.minus.points,
        width,
        height,
        paddingX,
        paddingY,
        (point) => point.rentNetCost,
        maxValue,
      )
    : ''
  const crossoverPoint = crossoverYear ? points.find((point) => point.year === crossoverYear) : null
  const crossoverX = crossoverPoint
    ? paddingX + ((crossoverPoint.year - 1) / Math.max(points.length - 1, 1)) * (width - paddingX * 2)
    : null
  const crossoverY = crossoverPoint
    ? height - paddingY - (crossoverPoint.ownerNetCost / maxValue) * (height - paddingY * 2)
    : null
  const visibleLabels = isMobile
    ? [points[0], points[Math.floor(points.length / 2)], points[points.length - 1]].filter(Boolean)
    : points

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />
          Achat net
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />
          Location nette
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-rose-300" />
          Rendement alternatif +1 %
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full border border-amber-300" />
          Rendement alternatif -1 %
        </div>
        <div className="sm:ml-auto text-slate-500">
          {crossoverYear
            ? `Croisement estimé vers ${crossoverYear} ans • base ${opportunityReturn} %`
            : `Pas de croisement sur 25 ans • base ${opportunityReturn} %`}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className={`${isMobile ? 'h-44' : 'h-60'} w-full`}>
          {[0.33, 0.66, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - paddingY * 2)
            return (
              <line
                key={ratio}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="rgba(148,163,184,0.16)"
                strokeWidth="1"
              />
            )
          })}

          <path d={ownerPath} fill="none" stroke="#22d3ee" strokeWidth={isMobile ? '2.5' : '3'} />
          <path d={rentPath} fill="none" stroke="#fb7185" strokeWidth={isMobile ? '2.5' : '3'} />
          {rentPlusPath ? (
            <path
              d={rentPlusPath}
              fill="none"
              stroke="#fda4af"
              strokeWidth={isMobile ? '2' : '2.5'}
              strokeDasharray="6 6"
            />
          ) : null}
          {rentMinusPath ? (
            <path
              d={rentMinusPath}
              fill="none"
              stroke="#fcd34d"
              strokeWidth={isMobile ? '2' : '2.5'}
              strokeDasharray="6 6"
            />
          ) : null}

          {(!isMobile ? points : visibleLabels).map((point, index) => {
            const pointIndex = points.findIndex((entry) => entry.year === point.year)
            const x = paddingX + (pointIndex / Math.max(points.length - 1, 1)) * (width - paddingX * 2)
            const ownerY =
              height - paddingY - (point.ownerNetCost / maxValue) * (height - paddingY * 2)
            const rentY = height - paddingY - (point.rentNetCost / maxValue) * (height - paddingY * 2)

            return (
              <g key={`${point.year}-${index}`}>
                <circle cx={x} cy={ownerY} r={isMobile ? '3' : '2.5'} fill="#22d3ee" />
                <circle cx={x} cy={rentY} r={isMobile ? '3' : '2.5'} fill="#fb7185" />
              </g>
            )
          })}

          {crossoverX && crossoverY ? (
            <g>
              <line
                x1={crossoverX}
                x2={crossoverX}
                y1={paddingY}
                y2={height - paddingY}
                stroke="#facc15"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <circle cx={crossoverX} cy={crossoverY} r="4.5" fill="#facc15" />
            </g>
          ) : null}

          {visibleLabels.map((point) => {
            const pointIndex = points.findIndex((entry) => entry.year === point.year)
            const x = paddingX + (pointIndex / Math.max(points.length - 1, 1)) * (width - paddingX * 2)

            return (
              <text
                key={`label-${point.year}`}
                x={x}
                y={height - 2}
                textAnchor="middle"
                fill="rgba(148,163,184,0.72)"
                fontSize={isMobile ? '11' : '10'}
              >
                {point.year}
              </text>
            )
          })}
        </svg>
      </div>

      {isMobile ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <SummaryMetric label="Année 1" value={new Intl.NumberFormat('fr-FR').format(points[0]?.year || 1)} />
          <SummaryMetric
            label="Année médiane"
            value={new Intl.NumberFormat('fr-FR').format(points[Math.floor(points.length / 2)]?.year || 13)}
          />
          <SummaryMetric label="Année finale" value={new Intl.NumberFormat('fr-FR').format(points[points.length - 1]?.year || 25)} />
        </div>
      ) : null}
    </div>
  )
}

export default function ResultsSummary({
  scenario,
  inputs,
  buyWins,
  purchaseTooltips,
  rentalTooltips,
  timeline,
  sensitivityTimeline,
  formatCurrency,
  isMobile,
}) {
  return (
    <div className="space-y-4">
      <section className="grid gap-3 lg:grid-cols-4 2xl:grid-cols-4">
        <KeyFigure
          label="Verdict"
          value={buyWins ? 'Acheter' : 'Louer'}
          helper={`${formatCurrency(Math.abs(scenario.advantage))} d'écart estimé`}
          tone={buyWins ? 'green' : 'red'}
        />
        <KeyFigure
          label="Coût net achat"
          value={formatCurrency(scenario.ownerNetCost)}
          helper={`Patrimoine ${formatCurrency(scenario.propertyValue)}`}
          tone="cyan"
        />
        <KeyFigure
          label="Coût net location"
          value={formatCurrency(scenario.rentNetCost)}
          helper={`Capital place ${formatCurrency(scenario.renterInvestmentGain)}`}
        />
        <KeyFigure
          label="Mensualité crédit"
          value={formatCurrency(scenario.monthlyLoanPayment)}
          helper={`${inputs.horizonYears} ans observes`}
        />
      </section>

      <section className="grid gap-4 2xl:grid-cols-2">
        <SectionCard
          eyebrow="Achat"
          title="Lecture rapide du coût"
          aside={
            <div className="rounded-md border border-emerald-900/70 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-300">
              Valeur finale {formatCurrency(scenario.propertyValue)}
            </div>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
            <div className="space-y-2">
              <DisclosureRow
                label="Prix du bien"
                value={scenario.purchasePrice}
                tooltip={purchaseTooltips.purchasePrice}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Frais d'acquisition"
                value={scenario.acquisitionFees}
                tooltip={purchaseTooltips.acquisitionFees}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Intérêts payés"
                value={scenario.interestPaid}
                tooltip={purchaseTooltips.interestPaid}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Charges et entretien"
                value={scenario.ownerChargesTotal}
                tooltip={purchaseTooltips.ownerChargesTotal}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Coût d’opportunité"
                value={scenario.investedCapitalGain}
                tooltip={purchaseTooltips.investedCapitalGain}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Capital restant dû"
                value={scenario.remainingBalance}
                tooltip={purchaseTooltips.remainingBalance}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Coût net achat"
                value={scenario.ownerNetCost}
                tooltip={purchaseTooltips.ownerNetCost}
                emphasize
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="grid gap-2">
              <SummaryMetric
                label="Apport mobilisé"
                value={formatCurrency(Math.min(inputs.downPayment, scenario.totalAcquisitionCost))}
              />
              <SummaryMetric label="Montant emprunté" value={formatCurrency(scenario.loanPrincipal)} />
              <SummaryMetric label="Principal remboursé" value={formatCurrency(scenario.principalPaid)} />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          eyebrow="Location"
          title="Lecture rapide du coût"
          aside={
            <div className="rounded-md border border-cyan-900/70 bg-cyan-950/30 px-2.5 py-1 text-xs text-cyan-300">
              Loyer initial {formatCurrency(scenario.monthlyRent)}
            </div>
          }
        >
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.9fr)]">
            <div className="space-y-2">
              <DisclosureRow
                label="Loyers versés"
                value={scenario.totalRentPaid}
                tooltip={rentalTooltips.totalRentPaid}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Charges locataire"
                value={scenario.renterChargesTotal}
                tooltip={rentalTooltips.renterChargesTotal}
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Gain du capital investi"
                value={scenario.renterInvestmentGain}
                tooltip={rentalTooltips.renterInvestmentGain}
                positive
                formatCurrency={formatCurrency}
              />
              <DisclosureRow
                label="Coût net location"
                value={scenario.rentNetCost}
                tooltip={rentalTooltips.rentNetCost}
                emphasize
                formatCurrency={formatCurrency}
              />
            </div>

            <div className="grid gap-2">
              <SummaryMetric label="Capital placé" value={formatCurrency(scenario.renterInvestedCapital)} />
              <SummaryMetric
                label="Rendement cumulé"
                value={formatCurrency(scenario.renterInvestmentGain)}
                valueClassName="text-emerald-300"
              />
              <SummaryMetric label="Charges totales" value={formatCurrency(scenario.renterChargesTotal)} />
            </div>
          </div>
        </SectionCard>
      </section>

      <SectionCard
        eyebrow="Evolution"
          title="Courbe de coût net"
        aside={
          <div className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
            1 à 25 ans
          </div>
        }
      >
        <TimelineChart
          points={timeline.points}
          crossoverYear={timeline.crossoverYear}
          sensitivityTimeline={sensitivityTimeline}
          opportunityReturn={inputs.opportunityReturn}
          isMobile={isMobile}
        />
      </SectionCard>
    </div>
  )
}
