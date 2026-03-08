import { useEffect, useMemo, useState } from 'react'

const STORAGE_KEY = 'simulateur-achat-scenarios'
const STORAGE_DB_NAME = 'simulateur-achat-db'
const STORAGE_STORE_NAME = 'app-state'
const STORAGE_RECORD_ID = 'saved-scenarios'
const TIMELINE_YEARS = 25
const PRICING_MODES = {
  total: 'total',
  sqm: 'sqm',
}

const DEFAULT_INPUTS = {
  scenarioName: 'Paris 15 - Base',
  horizonYears: 10,
  pricingMode: PRICING_MODES.total,
  surfaceSqm: 65,
  purchasePrice: 715000,
  monthlyRent: 1950,
  purchasePricePerSqm: 11000,
  monthlyRentPerSqm: 30,
  agencyFeePercent: 6,
  notaryFeePercent: 8,
  downPayment: 300000,
  mortgageRate: 3.6,
  loanDurationYears: 20,
  ownerMonthlyCharges: 330,
  renterMonthlyCharges: 330,
  yearlyPropertyTax: 2600,
  yearlyMaintenanceBudget: 1200,
  yearlyRentInflation: 2,
  yearlyPropertyGrowth: 2,
  opportunityReturn: 5,
}

const BASE_INPUT_GROUPS = [
  {
    title: 'Bien',
    fields: [
      ['scenarioName', 'Nom du scénario', 'text'],
      ['surfaceSqm', 'Surface (m²)', 'number'],
      ['horizonYears', 'Horizon (ans)', 'number'],
    ],
  },
  {
    title: 'Financement',
    fields: [
      ['downPayment', 'Apport', 'number'],
      ['mortgageRate', 'Taux crédit (%)', 'number'],
      ['loanDurationYears', 'Durée du crédit (ans)', 'number'],
      ['agencyFeePercent', 'Frais agence (%)', 'number'],
      ['notaryFeePercent', 'Frais notaire (%)', 'number'],
    ],
  },
  {
    title: 'Hypothèses',
    fields: [
      ['yearlyPropertyTax', 'Taxe foncière / an', 'number'],
      ['yearlyMaintenanceBudget', 'Entretien / an', 'number'],
      ['ownerMonthlyCharges', 'Charges proprio / mois', 'number'],
      ['renterMonthlyCharges', 'Charges locataire / mois', 'number'],
      ['yearlyRentInflation', 'Inflation loyers (%)', 'number'],
      ['yearlyPropertyGrowth', 'Valorisation du bien (%)', 'number'],
      ['opportunityReturn', 'Rendement alternatif (%)', 'number'],
    ],
  },
]

const PRICE_MODE_FIELDS = {
  [PRICING_MODES.total]: [
    ['purchasePrice', 'Prix d’achat', 'number'],
    ['monthlyRent', 'Loyer mensuel', 'number'],
  ],
  [PRICING_MODES.sqm]: [
      ['purchasePricePerSqm', 'Prix d’achat / m²', 'number'],
      ['monthlyRentPerSqm', 'Loyer / m² / mois', 'number'],
  ],
}

const EURO = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const NUMBER = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
})

function clampNumber(value) {
  if (value === '' || Number.isNaN(Number(value))) {
    return 0
  }

  return Number(value)
}

function formatCurrency(value) {
  return EURO.format(Math.round(value || 0))
}

function formatNumber(value) {
  return NUMBER.format(value || 0)
}

function normalizeInputs(rawInputs = {}) {
  const merged = { ...DEFAULT_INPUTS, ...rawInputs }
  const surfaceSqm = Math.max(Number(merged.surfaceSqm) || DEFAULT_INPUTS.surfaceSqm, 1)
  const pricingMode = merged.pricingMode === PRICING_MODES.sqm ? PRICING_MODES.sqm : PRICING_MODES.total

  const purchasePrice =
    Number(merged.purchasePrice) ||
    Number(merged.purchasePricePerSqm) * surfaceSqm ||
    DEFAULT_INPUTS.purchasePrice
  const monthlyRent =
    Number(merged.monthlyRent) ||
    Number(merged.monthlyRentPerSqm) * surfaceSqm ||
    DEFAULT_INPUTS.monthlyRent

  const purchasePricePerSqm =
    Number(merged.purchasePricePerSqm) || purchasePrice / surfaceSqm
  const monthlyRentPerSqm =
    Number(merged.monthlyRentPerSqm) || monthlyRent / surfaceSqm

  return {
    ...merged,
    pricingMode,
    surfaceSqm,
    purchasePrice,
    monthlyRent,
    purchasePricePerSqm,
    monthlyRentPerSqm,
  }
}

function resolvePriceInputs(inputs) {
  if (inputs.pricingMode === PRICING_MODES.sqm) {
    return {
      purchasePrice: inputs.surfaceSqm * inputs.purchasePricePerSqm,
      monthlyRent: inputs.surfaceSqm * inputs.monthlyRentPerSqm,
    }
  }

  return {
    purchasePrice: inputs.purchasePrice,
    monthlyRent: inputs.monthlyRent,
  }
}

function readLocalBackup() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed)
      ? parsed.map((entry) => ({
          ...entry,
          inputs: normalizeInputs(entry.inputs),
        }))
      : []
  } catch {
    return []
  }
}

function openStorageDb() {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject(new Error('IndexedDB indisponible'))
      return
    }

    const request = window.indexedDB.open(STORAGE_DB_NAME, 1)

    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(STORAGE_STORE_NAME)) {
        db.createObjectStore(STORAGE_STORE_NAME, { keyPath: 'id' })
      }
    }

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

function readPersistedScenarios() {
  return new Promise((resolve) => {
    openStorageDb()
      .then((db) => {
        const transaction = db.transaction(STORAGE_STORE_NAME, 'readonly')
        const store = transaction.objectStore(STORAGE_STORE_NAME)
        const request = store.get(STORAGE_RECORD_ID)

        request.onsuccess = () => {
          db.close()
          const value = request.result?.value
          resolve(
            Array.isArray(value)
              ? value.map((entry) => ({
                  ...entry,
                  inputs: normalizeInputs(entry.inputs),
                }))
              : readLocalBackup(),
          )
        }
        request.onerror = () => {
          db.close()
          resolve(readLocalBackup())
        }
      })
      .catch(() => {
        resolve(readLocalBackup())
      })
  })
}

function persistScenarios(scenarios) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarios))
  } catch {
    // Keep IndexedDB as primary path when localStorage write fails.
  }

  return openStorageDb()
    .then((db) => {
      const transaction = db.transaction(STORAGE_STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORAGE_STORE_NAME)
      store.put({ id: STORAGE_RECORD_ID, value: scenarios, updatedAt: Date.now() })

      return new Promise((resolve, reject) => {
        transaction.oncomplete = () => {
          db.close()
          resolve()
        }
        transaction.onerror = () => {
          db.close()
          reject(transaction.error)
        }
      })
    })
    .catch(() => undefined)
}

function calculateLoanPayment(principal, yearlyRate, durationYears) {
  if (principal <= 0 || durationYears <= 0) {
    return 0
  }

  const monthlyRate = yearlyRate / 100 / 12
  const totalMonths = durationYears * 12

  if (monthlyRate === 0) {
    return principal / totalMonths
  }

  return (principal * monthlyRate) / (1 - (1 + monthlyRate) ** -totalMonths)
}

function amortizeLoan(principal, yearlyRate, durationYears, monthsObserved) {
  const payment = calculateLoanPayment(principal, yearlyRate, durationYears)
  const monthlyRate = yearlyRate / 100 / 12
  const totalMonths = durationYears * 12
  const observedMonths = Math.min(totalMonths, Math.max(monthsObserved, 0))

  let balance = principal
  let totalInterestPaid = 0
  let totalPrincipalPaid = 0

  for (let month = 0; month < observedMonths; month += 1) {
    const interest = monthlyRate === 0 ? 0 : balance * monthlyRate
    const principalPaid = Math.min(payment - interest, balance)
    balance = Math.max(balance - principalPaid, 0)
    totalInterestPaid += interest
    totalPrincipalPaid += principalPaid
  }

  return {
    payment,
    remainingBalance: balance,
    totalInterestPaid,
    totalPrincipalPaid,
  }
}

function futureValue(capital, yearlyRate, years) {
  if (capital <= 0 || yearlyRate <= 0 || years <= 0) {
    return capital
  }

  return capital * (1 + yearlyRate / 100) ** years
}

function sumGrowingMonthlyPayment(baseMonthly, yearlyGrowth, years) {
  let total = 0

  for (let year = 0; year < Math.max(years, 0); year += 1) {
    total += baseMonthly * 12 * (1 + yearlyGrowth / 100) ** year
  }

  return total
}

function computeScenario(inputs) {
  const normalizedInputs = normalizeInputs(inputs)
  const { purchasePrice, monthlyRent } = resolvePriceInputs(normalizedInputs)
  const acquisitionFees =
    purchasePrice * ((normalizedInputs.agencyFeePercent + normalizedInputs.notaryFeePercent) / 100)
  const totalAcquisitionCost = purchasePrice + acquisitionFees
  const effectiveDownPayment = Math.min(normalizedInputs.downPayment, totalAcquisitionCost)
  const loanPrincipal = Math.max(totalAcquisitionCost - effectiveDownPayment, 0)
  const monthsObserved = normalizedInputs.horizonYears * 12

  const amortization = amortizeLoan(
    loanPrincipal,
    normalizedInputs.mortgageRate,
    normalizedInputs.loanDurationYears,
    monthsObserved,
  )

  const ownerChargesTotal =
    normalizedInputs.ownerMonthlyCharges * 12 * normalizedInputs.horizonYears +
    normalizedInputs.yearlyPropertyTax * normalizedInputs.horizonYears +
    normalizedInputs.yearlyMaintenanceBudget * normalizedInputs.horizonYears

  const investedCapitalGain =
    futureValue(effectiveDownPayment, normalizedInputs.opportunityReturn, normalizedInputs.horizonYears) -
    effectiveDownPayment
  const propertyValue =
    purchasePrice * (1 + normalizedInputs.yearlyPropertyGrowth / 100) ** normalizedInputs.horizonYears
  const equityRecovered = propertyValue - amortization.remainingBalance
  const ownerGrossCost =
    acquisitionFees +
    ownerChargesTotal +
    amortization.totalInterestPaid +
    investedCapitalGain
  const ownerNetCost = ownerGrossCost + effectiveDownPayment - equityRecovered

  const totalRentPaid = sumGrowingMonthlyPayment(
    monthlyRent,
    normalizedInputs.yearlyRentInflation,
    normalizedInputs.horizonYears,
  )
  const renterChargesTotal = normalizedInputs.renterMonthlyCharges * 12 * normalizedInputs.horizonYears
  const renterInvestedCapital = effectiveDownPayment
  const renterInvestmentValue = futureValue(
    renterInvestedCapital,
    normalizedInputs.opportunityReturn,
    normalizedInputs.horizonYears,
  )
  const renterInvestmentGain = renterInvestmentValue - renterInvestedCapital
  const rentGrossCost = totalRentPaid + renterChargesTotal
  const rentNetCost = rentGrossCost - renterInvestmentGain

  return {
    purchasePrice,
    acquisitionFees,
    totalAcquisitionCost,
    loanPrincipal,
    monthlyLoanPayment: amortization.payment,
    remainingBalance: amortization.remainingBalance,
    interestPaid: amortization.totalInterestPaid,
    principalPaid: amortization.totalPrincipalPaid,
    ownerChargesTotal,
    investedCapitalGain,
    propertyValue,
    equityRecovered,
    ownerNetCost,
    monthlyRent,
    totalRentPaid,
    renterChargesTotal,
    renterInvestedCapital,
    renterInvestmentGain,
    rentNetCost,
    advantage: rentNetCost - ownerNetCost,
  }
}

function computeTimeline(inputs) {
  const points = []

  for (let year = 1; year <= TIMELINE_YEARS; year += 1) {
    const snapshot = computeScenario({ ...inputs, horizonYears: year })
    points.push({
      year,
      ownerNetCost: snapshot.ownerNetCost,
      rentNetCost: snapshot.rentNetCost,
      advantage: snapshot.advantage,
    })
  }

  let crossoverYear = null

  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]

    if (
      (previous.advantage <= 0 && current.advantage >= 0) ||
      (previous.advantage >= 0 && current.advantage <= 0)
    ) {
      crossoverYear = current.year
      break
    }
  }

  return { points, crossoverYear }
}

function InputField({ id, label, type, value, onChange }) {
  return (
    <label className="space-y-1.5">
      <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(id, type === 'number' ? clampNumber(event.target.value) : event.target.value)
        }
        className="w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/15"
      />
    </label>
  )
}

function InputGroup({ title, fields, inputs, onChange }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-slate-500">
        {title}
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5 2xl:grid-cols-7">
        {fields.map(([id, label, type]) => (
          <InputField
            key={id}
            id={id}
            label={label}
            type={type}
            value={inputs[id]}
            onChange={onChange}
          />
        ))}
      </div>
    </div>
  )
}

function KeyFigure({ label, value, helper, tone = 'slate' }) {
  const toneClass = {
    slate: 'border-slate-800 bg-slate-950/70',
    cyan: 'border-cyan-900/70 bg-cyan-950/30',
    green: 'border-emerald-900/70 bg-emerald-950/30',
    red: 'border-rose-900/70 bg-rose-950/30',
  }

  return (
    <div className={`rounded-xl border p-4 ${toneClass[tone]}`}>
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1.5 text-2xl font-semibold text-slate-50">{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-400">{helper}</div> : null}
    </div>
  )
}

function InfoTooltip({ content, label }) {
  if (!content) {
    return null
  }

  return (
    <span className="group relative inline-flex shrink-0 align-middle">
      <button
        type="button"
        aria-label={label}
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-700 text-[10px] font-semibold text-slate-400 transition hover:border-cyan-400 hover:text-cyan-300 focus:border-cyan-400 focus:text-cyan-300 focus:outline-none"
      >
        i
      </button>
      <span className="pointer-events-none absolute left-0 top-full z-10 mt-2 hidden w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-left text-xs normal-case tracking-normal text-slate-200 shadow-lg group-hover:block group-focus-within:block">
        {content}
      </span>
    </span>
  )
}

function BreakdownRow({ label, value, tooltip, emphasize = false, positive = false }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-slate-900 py-2 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`text-sm ${emphasize ? 'font-medium text-slate-100' : 'text-slate-400'}`}>
          {label}
        </span>
        <InfoTooltip content={tooltip} label={`Explication pour ${label}`} />
      </div>
      <span
        className={`text-sm font-medium ${
          positive ? 'text-emerald-300' : emphasize ? 'text-slate-100' : 'text-slate-300'
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  )
}

function SummaryMetric({ label, value, tooltip, valueClassName = 'text-slate-100' }) {
  return (
    <div>
      <div className="flex items-center gap-2 text-xs text-slate-500">
        <span>{label}</span>
        <InfoTooltip content={tooltip} label={`Explication pour ${label}`} />
      </div>
      <div className={`mt-1 text-sm font-medium ${valueClassName}`}>{value}</div>
    </div>
  )
}

function SectionCard({ eyebrow, title, aside, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-925/80 p-4">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">{eyebrow}</div>
          <h2 className="mt-1 text-lg font-semibold text-slate-50">{title}</h2>
        </div>
        {aside}
      </div>
      {children}
    </section>
  )
}

function buildLinePath(data, width, height, paddingX, paddingY, accessor, maxValue) {
  if (data.length === 0) {
    return ''
  }

  return data
    .map((point, index) => {
      const x =
        paddingX + (index / Math.max(data.length - 1, 1)) * (width - paddingX * 2)
      const y =
        height -
        paddingY -
        (accessor(point) / Math.max(maxValue, 1)) * (height - paddingY * 2)

      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`
    })
    .join(' ')
}

function TimelineChart({ points, crossoverYear }) {
  const width = 760
  const height = 240
  const paddingX = 18
  const paddingY = 18
  const maxValue = Math.max(
    ...points.flatMap((point) => [point.ownerNetCost, point.rentNetCost]),
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

  const crossoverPoint = crossoverYear
    ? points.find((point) => point.year === crossoverYear)
    : null
  const crossoverX = crossoverPoint
    ? paddingX +
      ((crossoverPoint.year - 1) / Math.max(points.length - 1, 1)) * (width - paddingX * 2)
    : null
  const crossoverY = crossoverPoint
    ? height -
      paddingY -
      (crossoverPoint.ownerNetCost / maxValue) * (height - paddingY * 2)
    : null

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-cyan-400" />
          Achat net
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-rose-400" />
          Location nette
        </div>
        <div className="ml-auto text-slate-500">
          {crossoverYear ? `Croisement vers l’année ${crossoverYear}` : 'Pas de croisement sur l’horizon.'}
        </div>
      </div>

      <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full">
          {[0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = height - paddingY - ratio * (height - paddingY * 2)
            return (
              <line
                key={ratio}
                x1={paddingX}
                x2={width - paddingX}
                y1={y}
                y2={y}
                stroke="rgba(148,163,184,0.14)"
                strokeWidth="1"
              />
            )
          })}

          {points.map((point, index) => {
            const x =
              paddingX + (index / Math.max(points.length - 1, 1)) * (width - paddingX * 2)

            return (
              <line
                key={point.year}
                x1={x}
                x2={x}
                y1={paddingY}
                y2={height - paddingY}
                stroke="rgba(15,23,42,0.35)"
                strokeWidth="1"
              />
            )
          })}

          <path d={ownerPath} fill="none" stroke="#22d3ee" strokeWidth="3" strokeLinejoin="round" />
          <path d={rentPath} fill="none" stroke="#fb7185" strokeWidth="3" strokeLinejoin="round" />

          {points.map((point, index) => {
            const x =
              paddingX + (index / Math.max(points.length - 1, 1)) * (width - paddingX * 2)
            const ownerY =
              height - paddingY - (point.ownerNetCost / maxValue) * (height - paddingY * 2)
            const rentY =
              height - paddingY - (point.rentNetCost / maxValue) * (height - paddingY * 2)

            return (
              <g key={`dots-${point.year}`}>
                <circle cx={x} cy={ownerY} r="2.5" fill="#22d3ee" />
                <circle cx={x} cy={rentY} r="2.5" fill="#fb7185" />
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
                stroke="#eab308"
                strokeWidth="1.5"
                strokeDasharray="4 5"
              />
              <circle cx={crossoverX} cy={crossoverY} r="4.5" fill="#eab308" />
            </g>
          ) : null}

          {points.map((point, index) => {
            const x =
              paddingX + (index / Math.max(points.length - 1, 1)) * (width - paddingX * 2)

            return (
              <text
                key={`label-${point.year}`}
                x={x}
                y={height - 2}
                textAnchor="middle"
                fill="rgba(148,163,184,0.7)"
                fontSize="10"
              >
                {point.year}
              </text>
            )
          })}
        </svg>
      </div>
    </div>
  )
}

function App() {
  const [inputs, setInputs] = useState(() => normalizeInputs(DEFAULT_INPUTS))
  const [savedScenarios, setSavedScenarios] = useState(() => readLocalBackup())
  const [selectedIds, setSelectedIds] = useState([])
  const [isStorageReady, setIsStorageReady] = useState(false)

  useEffect(() => {
    let active = true

    readPersistedScenarios().then((scenarios) => {
      if (active) {
        setSavedScenarios(scenarios)
        setIsStorageReady(true)
      }
    })

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    if (!isStorageReady) {
      return
    }

    persistScenarios(savedScenarios)
  }, [isStorageReady, savedScenarios])

  const scenario = useMemo(() => computeScenario(inputs), [inputs])

  const comparisonScenarios = useMemo(() => {
    const selected = savedScenarios.filter((item) => selectedIds.includes(item.id))
    return [
      {
        id: 'draft',
        name: `${inputs.scenarioName} (brouillon)`,
        inputs,
        results: scenario,
      },
      ...selected,
    ].slice(0, 4)
  }, [inputs, savedScenarios, scenario, selectedIds])
  const timeline = useMemo(() => computeTimeline(inputs), [inputs])
  const inputGroups = useMemo(
    () =>
      BASE_INPUT_GROUPS.map((group) =>
        group.title === 'Bien'
          ? {
              ...group,
              fields: [
                group.fields[0],
                group.fields[1],
                ...PRICE_MODE_FIELDS[inputs.pricingMode],
                group.fields[2],
              ],
            }
          : group,
      ),
    [inputs.pricingMode],
  )

  const buyWins = scenario.advantage > 0
  const purchaseTooltips = {
    purchasePrice:
      "Le prix affiche la valeur du logement au départ. Ce n’est pas une dépense perdue à 100 % : si vous revendez, vous récupérerez une partie de cette valeur.",
    acquisitionFees:
      "Ce sont les frais payés au moment de l’achat, surtout notaire et agence. En pratique, cet argent sort tout de suite et n’est en général pas récupéré plus tard.",
    interestPaid: `C’est la part des mensualités versée à la banque pour rémunérer le crédit sur ${inputs.horizonYears} ans observés. Contrairement au capital remboursé, cette somme ne vous appartient plus.`,
    ownerChargesTotal:
      "C’est tout ce que coûte le fait de posséder le bien au quotidien : charges de copropriété, taxe foncière et budget d’entretien.",
    investedCapitalGain: `C’est ce que votre apport aurait pu vous rapporter s’il était placé ailleurs à ${formatNumber(inputs.opportunityReturn)} % par an. On le compte comme un coût car cet argent n’a pas pu travailler pendant l’achat.`,
    remainingBalance:
      "C’est la somme qu’il reste à rembourser à la banque à la fin de la période choisie. Si vous revendez avant la fin du crédit, cette somme doit être réglée avec le prix de vente.",
    ownerNetCost: `C’est ce que l’achat vous coûte vraiment sur ${inputs.horizonYears} ans. Le simulateur additionne les frais, intérêts, charges et coût d’opportunité, puis retire le patrimoine net récupéré à la fin, ici ${formatCurrency(scenario.equityRecovered)}.`,
    downPayment:
      "C’est l’argent sorti de votre poche au départ pour acheter. En pratique, c’est votre épargne immobilisée dans le projet.",
    loanPrincipal:
      "C’est la somme réellement prêtée par la banque après prise en compte de l’apport.",
    principalPaid:
      "C’est la partie du crédit déjà remboursée qui fait baisser votre dette. Ce n’est pas un frais bancaire : cela augmente votre part de propriété dans le bien.",
  }
  const rentalTooltips = {
    totalRentPaid: `C’est le total des loyers payés sur ${inputs.horizonYears} ans, en tenant compte de l’inflation des loyers définie dans les paramètres.`,
    renterChargesTotal:
      "C’est le total des charges supportées en tant que locataire sur toute la période.",
    renterInvestmentGain: `Comme vous n’achetez pas, votre apport peut rester placé. Ici, c’est le gain cumulé estimé sur ce capital à ${formatNumber(inputs.opportunityReturn)} % par an.`,
    rentNetCost:
      "C’est ce que la location vous coûte vraiment : loyers + charges, moins le gain produit par le capital que vous avez pu laisser placé.",
    renterInvestedCapital:
      "C’est le capital que le locataire garde disponible et peut placer au lieu de le mobiliser dans l’achat.",
  }

  function updateInput(key, value) {
    setInputs((current) => normalizeInputs({ ...current, [key]: value }))
  }

  function updatePricingMode(mode) {
    setInputs((current) => normalizeInputs({ ...current, pricingMode: mode }))
  }

  function saveScenario() {
    const entry = {
      id: crypto.randomUUID(),
      name: inputs.scenarioName.trim() || `Scénario ${savedScenarios.length + 1}`,
      createdAt: new Date().toISOString(),
      inputs,
      results: scenario,
    }

    setSavedScenarios((current) => [entry, ...current])
    setSelectedIds((current) => [entry.id, ...current].slice(0, 3))
  }

  function loadScenario(entry) {
    setInputs(normalizeInputs(entry.inputs))
  }

  function deleteScenario(id) {
    setSavedScenarios((current) => current.filter((item) => item.id !== id))
    setSelectedIds((current) => current.filter((item) => item !== id))
  }

  function toggleComparison(id) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [id, ...current].slice(0, 3),
    )
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <div className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 shadow-[0_20px_60px_rgba(2,6,23,0.45)]">
          <header className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-cyan-400">
                Comparateur immobilier
              </div>
              <h1 className="mt-1 text-xl font-semibold text-slate-50">
                Louer ou acheter : simulateur
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Comparez achat et location de résidence principale selon votre apport, votre crédit, les frais d’acquisition, les charges et votre horizon de détention.
              </p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Surface</div>
                <div className="mt-1 text-sm font-medium">{formatNumber(inputs.surfaceSqm)} m2</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Acquisition</div>
                <div className="mt-1 text-sm font-medium">{formatCurrency(scenario.totalAcquisitionCost)}</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2">
                <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Horizon</div>
                <div className="mt-1 text-sm font-medium">{inputs.horizonYears} ans</div>
              </div>
            </div>
          </header>

          <div className="space-y-4 p-4">
            <SectionCard
              eyebrow="Paramètres"
              title="Hypothèses de calcul"
              aside={
                <div className="flex flex-wrap gap-2">
                  <div className="inline-flex rounded-lg border border-slate-700 bg-slate-950 p-1">
                    <button
                      type="button"
                      onClick={() => updatePricingMode(PRICING_MODES.total)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        inputs.pricingMode === PRICING_MODES.total
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      Prix complet
                    </button>
                    <button
                      type="button"
                      onClick={() => updatePricingMode(PRICING_MODES.sqm)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
                        inputs.pricingMode === PRICING_MODES.sqm
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-300 hover:bg-slate-900'
                      }`}
                    >
                      Prix au m²
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={saveScenario}
                    className="rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-400"
                  >
                    Sauvegarder
                  </button>
                  <button
                    type="button"
                    onClick={() => setInputs(normalizeInputs(DEFAULT_INPUTS))}
                    className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-900"
                  >
                    Réinitialiser
                  </button>
                </div>
              }
            >
              <div className="space-y-3">
                {inputGroups.map((group) => (
                  <InputGroup
                    key={group.title}
                    title={group.title}
                    fields={group.fields}
                    inputs={inputs}
                    onChange={updateInput}
                  />
                ))}
              </div>
            </SectionCard>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
              <main className="space-y-4" aria-label="Résultats du simulateur">
                <section className="grid gap-3 lg:grid-cols-4">
                  <KeyFigure
                    label="Verdict"
                    value={buyWins ? 'Acheter' : 'Louer'}
                    helper={
                      buyWins
                        ? `${formatCurrency(scenario.advantage)} de gain relatif`
                        : `${formatCurrency(Math.abs(scenario.advantage))} de gain relatif`
                    }
                    tone={buyWins ? 'green' : 'red'}
                  />
                  <KeyFigure
                    label="Coût net achat"
                    value={formatCurrency(scenario.ownerNetCost)}
                    helper={`Bien valorisé : ${formatCurrency(scenario.propertyValue)}`}
                    tone="cyan"
                  />
                  <KeyFigure
                    label="Coût net location"
                    value={formatCurrency(scenario.rentNetCost)}
                    helper={`Gain sur capital placé : ${formatCurrency(scenario.renterInvestmentGain)}`}
                  />
                  <KeyFigure
                    label="Mensualité du crédit"
                    value={formatCurrency(scenario.monthlyLoanPayment)}
                    helper={`CRD ${formatCurrency(scenario.remainingBalance)}`}
                  />
                </section>

              <section className="grid gap-4 2xl:grid-cols-2">
                <SectionCard
                  eyebrow="Achat"
                  title="Structure du coût"
                  aside={
                    <div className="rounded-md border border-emerald-900/70 bg-emerald-950/30 px-2.5 py-1 text-xs text-emerald-300">
                      Patrimoine final : {formatCurrency(scenario.propertyValue)}
                    </div>
                  }
                >
                  <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
                    <div>
                      <BreakdownRow
                        label="Prix du bien"
                        value={scenario.purchasePrice}
                        tooltip={purchaseTooltips.purchasePrice}
                      />
                      <BreakdownRow
                        label="Frais d’acquisition"
                        value={scenario.acquisitionFees}
                        tooltip={purchaseTooltips.acquisitionFees}
                      />
                      <BreakdownRow
                        label="Intérêts payés"
                        value={scenario.interestPaid}
                        tooltip={purchaseTooltips.interestPaid}
                      />
                      <BreakdownRow
                        label="Charges + taxe + entretien"
                        value={scenario.ownerChargesTotal}
                        tooltip={purchaseTooltips.ownerChargesTotal}
                      />
                      <BreakdownRow
                        label="Coût d’opportunité de l’apport"
                        value={scenario.investedCapitalGain}
                        tooltip={purchaseTooltips.investedCapitalGain}
                      />
                      <BreakdownRow
                        label="Capital restant dû"
                        value={scenario.remainingBalance}
                        tooltip={purchaseTooltips.remainingBalance}
                      />
                      <BreakdownRow
                        label="Coût net achat"
                        value={scenario.ownerNetCost}
                        tooltip={purchaseTooltips.ownerNetCost}
                        emphasize
                      />
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Résumé</div>
                      <div className="mt-3 space-y-3">
                        <SummaryMetric
                          label="Apport mobilisé"
                          value={formatCurrency(Math.min(inputs.downPayment, scenario.totalAcquisitionCost))}
                          tooltip={purchaseTooltips.downPayment}
                        />
                        <SummaryMetric
                          label="Montant emprunté"
                          value={formatCurrency(scenario.loanPrincipal)}
                          tooltip={purchaseTooltips.loanPrincipal}
                        />
                        <SummaryMetric
                          label="Principal remboursé"
                          value={formatCurrency(scenario.principalPaid)}
                          tooltip={purchaseTooltips.principalPaid}
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>

                <SectionCard
                  eyebrow="Location"
                  title="Structure du coût"
                  aside={
                    <div className="rounded-md border border-cyan-900/70 bg-cyan-950/30 px-2.5 py-1 text-xs text-cyan-300">
                      Loyer initial {formatCurrency(scenario.monthlyRent)}
                    </div>
                  }
                >
                  <div className="grid gap-4 xl:grid-cols-[1fr_220px]">
                    <div>
                      <BreakdownRow
                        label="Loyers versés"
                        value={scenario.totalRentPaid}
                        tooltip={rentalTooltips.totalRentPaid}
                      />
                      <BreakdownRow
                        label="Charges locataire"
                        value={scenario.renterChargesTotal}
                        tooltip={rentalTooltips.renterChargesTotal}
                      />
                      <BreakdownRow
                        label="Gain du capital investi"
                        value={scenario.renterInvestmentGain}
                        tooltip={rentalTooltips.renterInvestmentGain}
                        positive
                      />
                      <BreakdownRow
                        label="Coût net location"
                        value={scenario.rentNetCost}
                        tooltip={rentalTooltips.rentNetCost}
                        emphasize
                      />
                    </div>
                    <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">Résumé</div>
                      <div className="mt-3 space-y-3">
                        <SummaryMetric
                          label="Capital placé"
                          value={formatCurrency(scenario.renterInvestedCapital)}
                          tooltip={rentalTooltips.renterInvestedCapital}
                        />
                        <SummaryMetric
                          label="Rendement cumulé"
                          value={formatCurrency(scenario.renterInvestmentGain)}
                          tooltip={rentalTooltips.renterInvestmentGain}
                          valueClassName="text-emerald-300"
                        />
                        <SummaryMetric
                          label="Charges totales"
                          value={formatCurrency(scenario.renterChargesTotal)}
                          tooltip={rentalTooltips.renterChargesTotal}
                        />
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </section>

              <SectionCard
                eyebrow="Comparatif"
                title="Brouillon courant et scénarios sauvegardés"
                aside={
                  <div className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                    Max. 4 colonnes
                  </div>
                }
              >
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-left text-[11px] uppercase tracking-[0.14em] text-slate-500">
                        <th className="px-3 py-2">Scénario</th>
                        <th className="px-3 py-2">Achat net</th>
                        <th className="px-3 py-2">Location nette</th>
                        <th className="px-3 py-2">Écart</th>
                        <th className="px-3 py-2">Verdict</th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonScenarios.map((entry) => {
                        const entryBuyWins = entry.results.advantage > 0

                        return (
                          <tr key={entry.id} className="border-b border-slate-900 last:border-b-0">
                            <td className="px-3 py-3 text-slate-200">{entry.name}</td>
                            <td className="px-3 py-3 text-slate-300">{formatCurrency(entry.results.ownerNetCost)}</td>
                            <td className="px-3 py-3 text-slate-300">{formatCurrency(entry.results.rentNetCost)}</td>
                            <td className="px-3 py-3 text-slate-300">{formatCurrency(Math.abs(entry.results.advantage))}</td>
                            <td className={`px-3 py-3 font-medium ${entryBuyWins ? 'text-emerald-300' : 'text-rose-300'}`}>
                              {entryBuyWins ? 'Acheter' : 'Louer'}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </SectionCard>

              <section className="grid gap-4">
                <SectionCard
                  eyebrow="Évolution"
                  title="Courbes de coût net dans le temps"
                  aside={
                    <div className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                      De 1 à {TIMELINE_YEARS} ans
                    </div>
                  }
                >
                  <TimelineChart
                    points={timeline.points}
                    crossoverYear={timeline.crossoverYear}
                  />
                </SectionCard>
              </section>

              </main>

              <aside>
                <SectionCard
                  eyebrow="Scénarios"
                  title="Bibliothèque"
                  aside={
                    <div className="rounded-md border border-slate-800 bg-slate-950 px-2.5 py-1 text-xs text-slate-400">
                      {savedScenarios.length}
                    </div>
                  }
                >
                  <div className="space-y-2">
                    {savedScenarios.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-slate-800 px-3 py-4 text-sm text-slate-500">
                        Aucun scénario sauvegardé.
                      </div>
                    ) : null}

                    {savedScenarios.map((entry) => {
                      const isSelected = selectedIds.includes(entry.id)

                      return (
                        <article key={entry.id} className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <div className="truncate text-sm font-medium text-slate-100">{entry.name}</div>
                              <div className="mt-1 text-xs text-slate-500">
                                {entry.inputs.pricingMode === PRICING_MODES.sqm
                                  ? `${formatCurrency(entry.inputs.purchasePricePerSqm)}/m² · ${formatCurrency(entry.inputs.monthlyRentPerSqm)}/m²`
                                  : `${formatCurrency(entry.inputs.purchasePrice)} · ${formatCurrency(entry.inputs.monthlyRent)}/mois`}
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => deleteScenario(entry.id)}
                              className="rounded-md border border-slate-700 px-2 py-1 text-xs text-slate-400 hover:bg-slate-900"
                            >
                              Suppr.
                            </button>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              onClick={() => loadScenario(entry)}
                              className="rounded-md border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 hover:bg-slate-900"
                            >
                              Charger
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleComparison(entry.id)}
                              className={`rounded-md px-2.5 py-1.5 text-xs font-medium ${
                                isSelected
                                  ? 'bg-cyan-500 text-slate-950'
                                  : 'border border-slate-700 text-slate-300 hover:bg-slate-900'
                              }`}
                            >
                              {isSelected ? 'Comparé' : 'Ajouter'}
                            </button>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </SectionCard>
              </aside>
            </div>

            <footer className="flex flex-col gap-2 border-t border-slate-800 pt-4 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Merci a Chicago Boy{' '}
                <a
                  href="https://x.com/ChicagoBoyFR"
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-300 transition hover:text-cyan-200"
                >
                  @ChicagoBoyFR
                </a>{' '}
                pour l'inspiration.
              </p>
              <a
                href="https://github.com/amorelpouliquen/acheter-ou-louer"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-slate-200 transition hover:text-cyan-300"
              >
                Voir le repo GitHub
              </a>
            </footer>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
