import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react'
import ComparisonCards from './components/ComparisonCards.jsx'
import HeaderSummary from './components/HeaderSummary.jsx'
import ResultsSummary from './components/ResultsSummary.jsx'
import ScenarioForm from './components/ScenarioForm.jsx'
import ScenarioLibrary from './components/ScenarioLibrary.jsx'
import { assetUrl } from './baseUrl.js'

const STORAGE_KEY = 'simulateur-achat-scenarios'
const STORAGE_DB_NAME = 'simulateur-achat-db'
const STORAGE_STORE_NAME = 'app-state'
const STORAGE_RECORD_ID = 'saved-scenarios'
const TIMELINE_YEARS = 25
const QuestionnaireRoute = lazy(() => import('./components/QuestionnaireRoute.jsx'))
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

const FIELD_META = {
  scenarioName: {
    id: 'scenarioName',
    label: 'Nom du scénario',
    type: 'text',
    placeholder: 'Ex. Paris 15 - Base',
    helper: 'Permet de retrouver rapidement votre brouillon et vos variantes.',
  },
  surfaceSqm: {
    id: 'surfaceSqm',
    label: 'Surface',
    unit: 'm²',
    type: 'number',
    min: 1,
    step: 1,
    placeholder: '65',
  },
  horizonYears: {
    id: 'horizonYears',
    label: 'Horizon',
    unit: 'ans',
    type: 'number',
    min: 1,
    step: 1,
    placeholder: '10',
    helper: 'Point clé du verdict. Modifiez-le avant d’ajuster les hypothèses fines.',
  },
  purchasePrice: {
    id: 'purchasePrice',
    label: "Prix d'achat",
    unit: 'EUR',
    type: 'number',
    min: 0,
    step: 1000,
    placeholder: '715000',
  },
  monthlyRent: {
    id: 'monthlyRent',
    label: 'Loyer mensuel',
    unit: 'EUR/mois',
    type: 'number',
    min: 0,
    step: 50,
    placeholder: '1950',
  },
  purchasePricePerSqm: {
    id: 'purchasePricePerSqm',
    label: "Prix d'achat au m²",
    unit: 'EUR/m²',
    type: 'number',
    min: 0,
    step: 100,
    placeholder: '11000',
  },
  monthlyRentPerSqm: {
    id: 'monthlyRentPerSqm',
    label: 'Loyer au m²',
    unit: 'EUR/m²/mois',
    type: 'number',
    min: 0,
    step: 1,
    placeholder: '30',
  },
  downPayment: {
    id: 'downPayment',
    label: 'Apport',
    unit: 'EUR',
    type: 'number',
    min: 0,
    step: 1000,
    placeholder: '300000',
  },
  mortgageRate: {
    id: 'mortgageRate',
    label: 'Taux crédit',
    unit: '%',
    type: 'number',
    min: 0,
    step: 0.1,
    decimals: true,
    placeholder: '3.6',
  },
  loanDurationYears: {
    id: 'loanDurationYears',
    label: 'Durée du crédit',
    unit: 'ans',
    type: 'number',
    min: 1,
    step: 1,
    placeholder: '20',
  },
  agencyFeePercent: {
    id: 'agencyFeePercent',
    label: 'Frais d’agence',
    unit: '%',
    type: 'number',
    min: 0,
    step: 0.5,
    decimals: true,
    placeholder: '6',
  },
  notaryFeePercent: {
    id: 'notaryFeePercent',
    label: 'Frais de notaire',
    unit: '%',
    type: 'number',
    min: 0,
    step: 0.5,
    decimals: true,
    placeholder: '8',
  },
  ownerMonthlyCharges: {
    id: 'ownerMonthlyCharges',
    label: 'Charges propriétaire',
    unit: 'EUR/mois',
    type: 'number',
    min: 0,
    step: 10,
    placeholder: '330',
  },
  renterMonthlyCharges: {
    id: 'renterMonthlyCharges',
    label: 'Charges locataire',
    unit: 'EUR/mois',
    type: 'number',
    min: 0,
    step: 10,
    placeholder: '330',
  },
  yearlyPropertyTax: {
    id: 'yearlyPropertyTax',
    label: 'Taxe foncière',
    unit: 'EUR/an',
    type: 'number',
    min: 0,
    step: 100,
    placeholder: '2600',
  },
  yearlyMaintenanceBudget: {
    id: 'yearlyMaintenanceBudget',
    label: 'Entretien',
    unit: 'EUR/an',
    type: 'number',
    min: 0,
    step: 100,
    placeholder: '1200',
  },
  yearlyRentInflation: {
    id: 'yearlyRentInflation',
    label: 'Inflation loyers',
    unit: '%',
    type: 'number',
    min: 0,
    step: 0.1,
    decimals: true,
    placeholder: '2',
  },
  yearlyPropertyGrowth: {
    id: 'yearlyPropertyGrowth',
    label: 'Valorisation du bien',
    unit: '%',
    type: 'number',
    min: 0,
    step: 0.1,
    decimals: true,
    placeholder: '2',
  },
  opportunityReturn: {
    id: 'opportunityReturn',
    label: 'Rendement alternatif',
    unit: '%',
    type: 'number',
    min: 0,
    step: 0.1,
    decimals: true,
    placeholder: '5',
  },
}

const EURO = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

const NUMBER = new Intl.NumberFormat('fr-FR', {
  maximumFractionDigits: 1,
})

function formatCurrency(value) {
  return EURO.format(Math.round(value || 0))
}

function formatNumber(value) {
  return NUMBER.format(value || 0)
}

function parseFiniteNumber(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeInputs(rawInputs = {}) {
  const merged = { ...DEFAULT_INPUTS, ...rawInputs }
  const surfaceSqm = Math.max(parseFiniteNumber(merged.surfaceSqm) ?? DEFAULT_INPUTS.surfaceSqm, 1)
  const pricingMode = merged.pricingMode === PRICING_MODES.sqm ? PRICING_MODES.sqm : PRICING_MODES.total
  const purchasePriceValue = parseFiniteNumber(merged.purchasePrice)
  const monthlyRentValue = parseFiniteNumber(merged.monthlyRent)
  const purchasePricePerSqmValue = parseFiniteNumber(merged.purchasePricePerSqm)
  const monthlyRentPerSqmValue = parseFiniteNumber(merged.monthlyRentPerSqm)

  const purchasePrice =
    purchasePriceValue ??
    (purchasePricePerSqmValue !== null ? purchasePricePerSqmValue * surfaceSqm : null) ??
    DEFAULT_INPUTS.purchasePrice
  const monthlyRent =
    monthlyRentValue ??
    (monthlyRentPerSqmValue !== null ? monthlyRentPerSqmValue * surfaceSqm : null) ??
    DEFAULT_INPUTS.monthlyRent

  const purchasePricePerSqm = purchasePricePerSqmValue ?? purchasePrice / surfaceSqm
  const monthlyRentPerSqm = monthlyRentPerSqmValue ?? monthlyRent / surfaceSqm

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
          id: entry.id,
          name: entry.name,
          createdAt: entry.createdAt,
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
                  id: entry.id,
                  name: entry.name,
                  createdAt: entry.createdAt,
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
  const serializedScenarios = scenarios.map((entry) => ({
    id: entry.id,
    name: entry.name,
    createdAt: entry.createdAt,
    inputs: normalizeInputs(entry.inputs),
  }))

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(serializedScenarios))
  } catch {
    // Keep IndexedDB as primary path when localStorage write fails.
  }

  return openStorageDb()
    .then((db) => {
      const transaction = db.transaction(STORAGE_STORE_NAME, 'readwrite')
      const store = transaction.objectStore(STORAGE_STORE_NAME)
      store.put({ id: STORAGE_RECORD_ID, value: serializedScenarios, updatedAt: Date.now() })

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
  const renterInvestmentValue = futureValue(
    effectiveDownPayment,
    normalizedInputs.opportunityReturn,
    normalizedInputs.horizonYears,
  )
  const renterInvestmentGain = renterInvestmentValue - effectiveDownPayment
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
    renterInvestedCapital: effectiveDownPayment,
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

function StickySummaryBar({ buyWins, scenario, inputs, formatCurrency, activeSection, onJump }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-[#020617]/95 px-3 py-3 backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-md items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <span>{buyWins ? 'Acheter' : 'Louer'}</span>
            <span className="h-1 w-1 rounded-full bg-slate-500" />
            <span>{inputs.horizonYears} ans</span>
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-100">{formatCurrency(Math.abs(scenario.advantage))}</div>
          <div className="text-xs text-slate-400">Mensualité {formatCurrency(scenario.monthlyLoanPayment)}</div>
        </div>
        <button
          type="button"
          onClick={() => onJump(activeSection === 'results' ? 'params' : 'results')}
          className="cta-primary min-h-11 rounded-lg px-4 text-sm font-semibold"
        >
          {activeSection === 'results' ? 'Modifier' : 'Résultats'}
        </button>
      </div>
    </div>
  )
}

function getCurrentRoute() {
  if (typeof window === 'undefined') {
    return '/'
  }

  return window.location.hash === '#/form' ? '/form' : '/'
}

function syncLegacyRoute() {
  if (typeof window === 'undefined') {
    return '/'
  }

  if (window.location.pathname === '/form') {
    window.history.replaceState({}, '', `${window.location.origin}${window.location.search}#/form`)
    return '/form'
  }

  return getCurrentRoute()
}

function SiteFooter() {
  return (
    <footer className="rounded-2xl border border-slate-800 bg-slate-900/95 px-4 py-4 shadow-[0_20px_60px_rgba(2,6,23,0.3)] sm:px-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <img
            src={assetUrl('favicon.svg')}
            alt="Logo Louer ou acheter"
            className="h-11 w-11 shrink-0 rounded-xl border border-slate-800 bg-slate-950 p-2"
          />
          <div>
            <p className="text-sm font-semibold text-slate-100">Louer ou acheter</p>
            <p className="mt-1 text-sm leading-6 text-slate-400">
              Simulateur achat vs location. Merci a Chicago Boy pour l'inspiration du projet.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <a
            href="https://github.com/amorelpouliquen/acheter-ou-louer"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-700 hover:text-cyan-200"
          >
            GitHub du projet
          </a>
          <a
            href="https://x.com/ChicagoBoyFR"
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-lg border border-slate-700 bg-slate-950 px-3 text-sm font-medium text-slate-200 transition hover:border-cyan-700 hover:text-cyan-200"
          >
            Inspiration: @ChicagoBoyFR
          </a>
        </div>
      </div>
    </footer>
  )
}

function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0b1120] px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-6xl rounded-3xl border border-slate-800 bg-slate-900/90 px-6 py-12 text-center shadow-[0_20px_60px_rgba(2,6,23,0.3)]">
        <div className="text-sm font-medium text-slate-300">Chargement du questionnaire...</div>
      </div>
    </div>
  )
}

function SimulatorPage({
  inputs,
  setInputs,
  formatCurrency,
  formatNumber,
  normalizeInputs,
  onOpenQuestionnaire,
}) {
  const [savedScenarios, setSavedScenarios] = useState(() => readLocalBackup())
  const [selectedIds, setSelectedIds] = useState([])
  const [isStorageReady, setIsStorageReady] = useState(false)
  const [isMobileViewport, setIsMobileViewport] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false,
  )
  const [activeSection, setActiveSection] = useState('params')
  const paramsRef = useRef(null)
  const resultsRef = useRef(null)
  const compareRef = useRef(null)
  const libraryRef = useRef(null)

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

  useEffect(() => {
    const onResize = () => {
      setIsMobileViewport(window.innerWidth < 1024)
    }

    onResize()
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
    }
  }, [])

  const scenario = useMemo(() => computeScenario(inputs), [inputs])
  const timeline = useMemo(() => computeTimeline(inputs), [inputs])

  const comparisonScenarios = useMemo(() => {
    const selected = savedScenarios.filter((item) => selectedIds.includes(item.id))
    return [
      {
        id: 'draft',
        name: `${inputs.scenarioName} (brouillon)`,
        inputs,
        results: scenario,
      },
      ...selected.map((entry) => ({
        ...entry,
        results: computeScenario(entry.inputs),
      })),
    ].slice(0, 4)
  }, [inputs, savedScenarios, scenario, selectedIds])

  const buyWins = scenario.advantage > 0
  const purchaseTooltips = {
    purchasePrice:
      "Prix de départ du logement. Ce n'est pas une dépense perdue à 100 % si vous revendez.",
    acquisitionFees:
      "Principalement notaire et agence. C'est une sortie de cash immédiate, généralement non récupérable.",
    interestPaid: `Part des mensualités versée à la banque sur ${inputs.horizonYears} ans observés.`,
    ownerChargesTotal:
      "Charges de copropriété, taxe foncière et entretien cumulés sur la période choisie.",
    investedCapitalGain: `Ce que l'apport aurait pu produire à ${formatNumber(inputs.opportunityReturn)} % par an s'il restait investi.`,
    remainingBalance:
      "Somme restant à rembourser à la banque à la fin de la période observée.",
    ownerNetCost: `Coût net achat sur ${inputs.horizonYears} ans après prise en compte du patrimoine récupéré, estimé ici à ${formatCurrency(scenario.equityRecovered)}.`,
  }
  const rentalTooltips = {
    totalRentPaid: `Total des loyers versés sur ${inputs.horizonYears} ans avec inflation des loyers.`,
    renterChargesTotal: 'Total des charges supportées en tant que locataire sur la période.',
    renterInvestmentGain: `Gain cumulé du capital laissé placé à ${formatNumber(inputs.opportunityReturn)} % par an.`,
    rentNetCost: "Loyers et charges, moins le rendement du capital que vous n'avez pas immobilisé dans l'achat.",
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
    }

    setSavedScenarios((current) => [entry, ...current])
    setSelectedIds((current) => [entry.id, ...current].slice(0, 3))
    setActiveSection('library')
  }

  function loadScenario(entry) {
    setInputs(normalizeInputs(entry.inputs))
    setActiveSection('params')
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

  function jumpToSection(section) {
    setActiveSection(section)
    const refMap = {
      params: paramsRef,
      results: resultsRef,
      compare: compareRef,
      library: libraryRef,
    }

    refMap[section]?.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const visibleSections = isMobileViewport
    ? {
        params: activeSection === 'params',
        results: activeSection === 'results',
        compare: activeSection === 'compare',
        library: activeSection === 'library',
      }
    : {
        params: true,
        results: true,
        compare: true,
        library: true,
      }

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <div className="mx-auto flex w-full max-w-[1580px] flex-col gap-4 px-3 py-3 pb-24 sm:px-4 sm:py-4 xl:px-5 lg:pb-8">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onOpenQuestionnaire}
            className="cta-secondary inline-flex min-h-10 items-center rounded-lg px-4 text-sm font-medium transition"
          >
            Questionnaire guidé
          </button>
        </div>

        <HeaderSummary
          buyWins={buyWins}
          activeSection={activeSection}
          onSectionChange={jumpToSection}
          isMobile={isMobileViewport}
        />

        <div className="grid gap-4">
          <main className="space-y-4">
            {visibleSections.params ? (
              <section ref={paramsRef}>
                <ScenarioForm
                  inputs={inputs}
                  scenario={scenario}
                  pricingModes={PRICING_MODES}
                  fieldMeta={FIELD_META}
                  onInputChange={updateInput}
                  onPricingModeChange={updatePricingMode}
                  onSave={saveScenario}
                  onReset={() => setInputs(normalizeInputs(DEFAULT_INPUTS))}
                  onShowResults={() => jumpToSection('results')}
                  formatCurrency={formatCurrency}
                  isMobile={isMobileViewport}
                />
              </section>
            ) : null}

            {visibleSections.results ? (
              <section ref={resultsRef}>
                <ResultsSummary
                  scenario={scenario}
                  inputs={inputs}
                  buyWins={buyWins}
                  purchaseTooltips={purchaseTooltips}
                  rentalTooltips={rentalTooltips}
                  timeline={timeline}
                  formatCurrency={formatCurrency}
                  isMobile={isMobileViewport}
                />
              </section>
            ) : null}

            {visibleSections.compare ? (
              <section ref={compareRef}>
                <ComparisonCards
                  comparisonScenarios={comparisonScenarios}
                  formatCurrency={formatCurrency}
                  isMobile={isMobileViewport}
                />
              </section>
            ) : null}

            {visibleSections.library ? (
              <section ref={libraryRef}>
                <ScenarioLibrary
                  savedScenarios={savedScenarios}
                  selectedIds={selectedIds}
                  pricingModes={PRICING_MODES}
                  onDelete={deleteScenario}
                  onLoad={loadScenario}
                  onToggle={toggleComparison}
                  formatCurrency={formatCurrency}
                />
              </section>
            ) : null}
          </main>
        </div>

        <SiteFooter />
      </div>

      {isMobileViewport ? (
        <StickySummaryBar
          buyWins={buyWins}
          scenario={scenario}
          inputs={inputs}
          formatCurrency={formatCurrency}
          activeSection={activeSection}
          onJump={jumpToSection}
        />
      ) : null}
    </div>
  )
}

function App() {
  const [route, setRoute] = useState(() => syncLegacyRoute())
  const [inputs, setInputs] = useState(() => normalizeInputs(DEFAULT_INPUTS))

  useEffect(() => {
    const syncRoute = () => {
      setRoute(syncLegacyRoute())
    }

    syncRoute()
    window.addEventListener('popstate', syncRoute)
    window.addEventListener('hashchange', syncRoute)

    return () => {
      window.removeEventListener('popstate', syncRoute)
      window.removeEventListener('hashchange', syncRoute)
    }
  }, [])

  function navigate(nextRoute) {
    const target = nextRoute === '/form' ? '#/form' : '#/'
    window.history.pushState({}, '', target)
    setRoute(nextRoute === '/form' ? '/form' : '/')
  }

  function handleQuestionnaireComplete(nextInputs) {
    setInputs(normalizeInputs(nextInputs))
    navigate('/')
  }

  if (route === '/form') {
    return (
      <Suspense fallback={<RouteFallback />}>
        <QuestionnaireRoute
          inputs={inputs}
          pricingModes={PRICING_MODES}
          normalizeInputs={normalizeInputs}
          onComplete={handleQuestionnaireComplete}
          onExit={() => navigate('/')}
          formatCurrency={formatCurrency}
          formatNumber={formatNumber}
        />
      </Suspense>
    )
  }

  return (
    <SimulatorPage
      inputs={inputs}
      setInputs={setInputs}
      formatCurrency={formatCurrency}
      formatNumber={formatNumber}
      normalizeInputs={normalizeInputs}
      onOpenQuestionnaire={() => navigate('/form')}
    />
  )
}

export default App
