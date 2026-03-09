import { useMemo, useState } from 'react'

const QUESTION_STEPS = [
  {
    id: 'landing',
    eyebrow: 'Parcours guide',
    title: 'Préparez votre simulation en 2 minutes',
    description:
      "Ce questionnaire rassemble les informations essentielles une par une pour construire votre comparaison achat vs location sans passer par tous les réglages d'un coup.",
    cta: 'Commencer',
  },
  {
    id: 'scenarioName',
    eyebrow: 'Etape 1',
    title: 'Comment voulez-vous nommer cette simulation ?',
    description: 'Ce nom sera repris dans le simulateur pour retrouver facilement votre brouillon.',
  },
  {
    id: 'pricingMode',
    eyebrow: 'Etape 2',
    title: 'Comment souhaitez-vous saisir les prix ?',
    description: 'Choisissez le format qui correspond le mieux aux annonces que vous consultez.',
  },
  {
    id: 'surfaceSqm',
    eyebrow: 'Etape 3',
    title: 'Quelle surface souhaitez-vous comparer ?',
    description: 'La surface sert à convertir automatiquement les montants si vous utilisez un prix au m².',
  },
  {
    id: 'purchase',
    eyebrow: 'Etape 4',
    title: "Quel est le cout cote achat ?",
    description: "Renseignez le prix du bien et les charges proprietaire qui vont avec.",
  },
  {
    id: 'rent',
    eyebrow: 'Etape 5',
    title: 'Quel est le cout cote location ?',
    description: 'Renseignez le loyer vise ainsi que les charges locataire associees.',
  },
  {
    id: 'downPayment',
    eyebrow: 'Etape 6',
    title: 'Quel apport pouvez-vous mobiliser ?',
    description: "L'apport influence le montant emprunté et donc le coût du crédit.",
  },
  {
    id: 'financing',
    eyebrow: 'Etape 7',
    title: 'Quel financement anticipez-vous ?',
    description: 'Taux et duree de credit sont saisis ensemble pour estimer la mensualite.',
  },
  {
    id: 'opportunityReturn',
    eyebrow: 'Etape 8',
    title: 'Quel rendement alternatif retenir pour votre epargne ?',
    description: "C'est le rendement estime du capital que vous pourriez placer au lieu de l'immobiliser dans l'achat.",
  },
  {
    id: 'horizonYears',
    eyebrow: 'Etape 9',
    title: 'Combien de temps pensez-vous garder ce logement ?',
    description: "C'est l'hypothèse la plus importante pour arbitrer entre location et achat.",
  },
]

function ProgressDots({ currentIndex, total }) {
  return (
    <div className="flex items-center gap-2">
      {Array.from({ length: total }).map((_, index) => (
        <span
          key={index}
          className={`h-2 rounded-full transition-all ${
            index <= currentIndex ? 'w-8 bg-cyan-300' : 'w-2 bg-white/16'
          }`}
        />
      ))}
    </div>
  )
}

function formatDisplayNumber(value, decimals = 0) {
  if (value === null || value === undefined || value === '') {
    return ''
  }

  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  }).format(Number(value))
}

function formatNumericInput(rawValue, decimalsAllowed) {
  if (rawValue === null || rawValue === undefined) {
    return ''
  }

  const normalized = String(rawValue)
    .replace(/\s/g, '')
    .replace(/\u202f/g, '')
    .replace(',', '.')
    .replace(/[^\d.]/g, '')

  if (normalized === '') {
    return ''
  }

  if (!decimalsAllowed) {
    return formatDisplayNumber(Number(normalized.replace(/\./g, '')), 0)
  }

  const [integerPartRaw = '', ...rest] = normalized.split('.')
  const fractionalRaw = rest.join('')
  const hasTrailingDecimal = normalized.endsWith('.')
  const integerPart = integerPartRaw === '' ? 0 : Number(integerPartRaw)
  const formattedInteger = Number.isFinite(integerPart) ? formatDisplayNumber(integerPart, 0) : ''

  if (fractionalRaw || hasTrailingDecimal) {
    return `${formattedInteger},${fractionalRaw}`
  }

  return formattedInteger
}

function parseInputNumber(rawValue) {
  if (rawValue.trim() === '') {
    return null
  }

  const normalized = rawValue.replace(/\s/g, '').replace(/\u202f/g, '').replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function NumberField({ label, helper, unit, value, onChange, step = 1, min = 0 }) {
  const [draftValue, setDraftValue] = useState(null)
  const displayValue = draftValue ?? formatDisplayNumber(value, step < 1 ? 1 : 0)

  function commitValue(rawValue) {
    const parsed = parseInputNumber(rawValue)
    const nextValue = parsed === null ? null : Math.max(parsed, min)

    setDraftValue(null)
    onChange(nextValue)
  }

  function adjustValue(direction) {
    const currentValue = parseInputNumber(displayValue)
    const fallbackValue = Number.isFinite(Number(value)) ? Number(value) : min
    const baseValue = currentValue ?? fallbackValue
    const nextValue = Math.max(baseValue + step * direction, min)
    setDraftValue(null)
    onChange(nextValue)
  }

  const showStepper = step < 1

  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-100">{label}</span>
      </div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 transition focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/15">
        <div className="flex items-center gap-2">
          <input
            type="text"
            inputMode={step < 1 ? 'decimal' : 'numeric'}
            min={min}
            step={step}
            value={displayValue}
            onChange={(event) => {
              const formatted = formatNumericInput(event.target.value, step < 1)
              setDraftValue(formatted)
              onChange(parseInputNumber(formatted))
            }}
            onBlur={(event) => {
              commitValue(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'ArrowUp') {
                event.preventDefault()
                adjustValue(1)
              }

              if (event.key === 'ArrowDown') {
                event.preventDefault()
                adjustValue(-1)
              }
            }}
            className="w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
          />
          {unit ? (
            <span className="shrink-0 whitespace-nowrap text-xs font-medium text-slate-400">{unit}</span>
          ) : null}
          {showStepper ? (
            <div className="flex shrink-0 items-center gap-1">
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => adjustValue(-1)}
                className="cta-soft inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold"
                aria-label={`Diminuer ${label}`}
              >
                -
              </button>
              <button
                type="button"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => adjustValue(1)}
                className="cta-soft inline-flex h-10 w-10 items-center justify-center rounded-full text-base font-semibold"
                aria-label={`Augmenter ${label}`}
              >
                +
              </button>
            </div>
          ) : null}
        </div>
      </div>
      {helper ? <p className="text-sm leading-6 text-slate-400">{helper}</p> : null}
    </label>
  )
}

function TextField({ label, helper, value, onChange }) {
  return (
    <label className="space-y-2">
      <div className="text-sm font-medium text-slate-100">{label}</div>
      <div className="rounded-3xl border border-white/10 bg-slate-950/70 px-4 py-4 transition focus-within:border-cyan-300/70 focus-within:ring-2 focus-within:ring-cyan-300/15">
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full bg-transparent text-lg text-white outline-none placeholder:text-slate-500"
          placeholder="Ex. Paris 11 - projet"
        />
      </div>
      {helper ? <p className="text-sm leading-6 text-slate-400">{helper}</p> : null}
    </label>
  )
}

function ChoiceCard({ title, description, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-3xl border p-4 text-left transition ${
        selected
          ? 'cta-selected'
          : 'cta-soft'
      }`}
    >
      <div className={selected ? 'text-base font-semibold text-white' : 'text-base font-semibold text-slate-100'}>
        {title}
      </div>
      <div className={`mt-1 text-sm leading-6 ${selected ? 'text-slate-300' : 'text-slate-400'}`}>
        {description}
      </div>
    </button>
  )
}

function buildStepContent(step, draft, pricingModes, updateInput) {
  switch (step.id) {
    case 'scenarioName':
      return (
        <TextField
          label="Nom du scénario"
          helper="Vous pourrez ensuite le sauvegarder ou le dupliquer dans le simulateur."
          value={draft.scenarioName}
          onChange={(value) => updateInput('scenarioName', value)}
        />
      )

    case 'pricingMode':
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <ChoiceCard
            title="Prix complet"
            description="Vous connaissez deja le prix total d'achat et le loyer mensuel."
            selected={draft.pricingMode === pricingModes.total}
            onClick={() => updateInput('pricingMode', pricingModes.total)}
          />
          <ChoiceCard
            title="Prix au m²"
            description="Vous comparez surtout des annonces avec un prix au mètre carré."
            selected={draft.pricingMode === pricingModes.sqm}
            onClick={() => updateInput('pricingMode', pricingModes.sqm)}
          />
        </div>
      )

    case 'surfaceSqm':
      return (
        <NumberField
          label="Surface"
          helper="Exemple : 65 m²"
          unit="m²"
          value={draft.surfaceSqm}
          onChange={(value) => updateInput('surfaceSqm', value)}
          min={1}
        />
      )

    case 'purchase':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {draft.pricingMode === pricingModes.total ? (
            <NumberField
              label="Prix d'achat"
              helper="Le montant total affiche dans les annonces ou retenu pour votre offre."
              unit="EUR"
              value={draft.purchasePrice}
              onChange={(value) => updateInput('purchasePrice', value)}
              step={1000}
            />
          ) : (
            <NumberField
              label="Prix d'achat au m²"
              helper="Le simulateur recalculera automatiquement le prix total à partir de la surface."
              unit="EUR/m²"
              value={draft.purchasePricePerSqm}
              onChange={(value) => updateInput('purchasePricePerSqm', value)}
              step={100}
            />
          )}
          <NumberField
            label="Charges proprietaire"
            helper="Charges de copropriete supportees en tant que proprietaire."
            unit="EUR/mois"
            value={draft.ownerMonthlyCharges}
            onChange={(value) => updateInput('ownerMonthlyCharges', value)}
            step={10}
          />
          <NumberField
            label="Taxe fonciere"
            helper="Montant annuel estime."
            unit="EUR/an"
            value={draft.yearlyPropertyTax}
            onChange={(value) => updateInput('yearlyPropertyTax', value)}
            step={100}
          />
          <NumberField
            label="Entretien"
            helper="Budget annuel pour petits travaux et maintenance."
            unit="EUR/an"
            value={draft.yearlyMaintenanceBudget}
            onChange={(value) => updateInput('yearlyMaintenanceBudget', value)}
            step={100}
          />
        </div>
      )

    case 'rent':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {draft.pricingMode === pricingModes.total ? (
            <NumberField
              label="Loyer mensuel"
              helper="Hors ou avec charges selon votre façon de raisonner, mais gardez la même logique partout."
              unit="EUR/mois"
              value={draft.monthlyRent}
              onChange={(value) => updateInput('monthlyRent', value)}
              step={50}
            />
          ) : (
            <NumberField
              label="Loyer au m²"
              helper="Le loyer mensuel équivalent sera reconstitué automatiquement."
              unit="EUR/m²/mois"
              value={draft.monthlyRentPerSqm}
              onChange={(value) => updateInput('monthlyRentPerSqm', value)}
              step={1}
            />
          )}
          <NumberField
            label="Charges locataire"
            helper="Part des charges supportees en location."
            unit="EUR/mois"
            value={draft.renterMonthlyCharges}
            onChange={(value) => updateInput('renterMonthlyCharges', value)}
            step={10}
          />
        </div>
      )

    case 'downPayment':
      return (
        <NumberField
          label="Apport"
          helper="Incluez uniquement le capital que vous êtes prêt à immobiliser dans ce projet."
          unit="EUR"
          value={draft.downPayment}
          onChange={(value) => updateInput('downPayment', value)}
          step={1000}
        />
      )

    case 'financing':
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <NumberField
            label="Taux du crédit"
            helper="Exemple: 3,6 pour 3,6 %."
            unit="%"
            value={draft.mortgageRate}
            onChange={(value) => updateInput('mortgageRate', value)}
            step={0.1}
          />
          <NumberField
            label="Durée du crédit"
            helper="Exemple: 20 ans"
            unit="ans"
            value={draft.loanDurationYears}
            onChange={(value) => updateInput('loanDurationYears', value)}
          />
        </div>
      )

    case 'opportunityReturn':
      return (
        <NumberField
          label="Rendement alternatif"
          helper="Exemple: 5 pour simuler un placement net annualise a 5 %."
          unit="%"
          value={draft.opportunityReturn}
          onChange={(value) => updateInput('opportunityReturn', value)}
          step={0.1}
        />
      )

    case 'horizonYears':
      return (
        <NumberField
          label="Horizon de detention"
          helper="C'est la duree pendant laquelle vous pensez rester avant de revendre ou de partir."
          unit="ans"
          value={draft.horizonYears}
          onChange={(value) => updateInput('horizonYears', value)}
        />
      )

    default:
      return null
  }
}

export default function QuestionnaireRoute({
  inputs,
  pricingModes,
  normalizeInputs,
  onComplete,
  onExit,
  formatCurrency,
  formatNumber,
}) {
  const [stepIndex, setStepIndex] = useState(0)
  const [draft, setDraft] = useState(() => normalizeInputs(inputs))
  const currentStep = QUESTION_STEPS[stepIndex]
  const questionCount = QUESTION_STEPS.length - 1
  const currentQuestionIndex = Math.max(stepIndex - 1, 0)

  const derivedValues = useMemo(() => normalizeInputs(draft), [draft, normalizeInputs])

  function updateInput(key, value) {
    setDraft((current) => normalizeInputs({ ...current, [key]: value }))
  }

  function goNext() {
    if (stepIndex === QUESTION_STEPS.length - 1) {
      onComplete(derivedValues)
      return
    }

    setStepIndex((current) => Math.min(current + 1, QUESTION_STEPS.length - 1))
  }

  function goBack() {
    setStepIndex((current) => Math.max(current - 1, 0))
  }

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-4 sm:px-6 sm:py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onExit}
            className="cta-soft inline-flex min-h-11 items-center rounded-full px-4 text-sm font-medium transition"
          >
            Retour au simulateur
          </button>
          {stepIndex > 0 ? <ProgressDots currentIndex={currentQuestionIndex} total={questionCount} /> : null}
        </div>

        <div className="grid flex-1 gap-4 lg:grid-cols-[minmax(0,1.1fr)_360px]">
          <section className="rounded-[32px] border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(165,243,252,0.12),transparent_34%),linear-gradient(180deg,rgba(15,23,42,0.96),rgba(15,23,42,0.88))] p-6 shadow-[0_28px_80px_rgba(2,6,23,0.45)] sm:p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.24em] text-cyan-200">
              {currentStep.eyebrow}
            </div>
            <h1 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              {currentStep.title}
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              {currentStep.description}
            </p>

            <div className="mt-8">
              {currentStep.id === 'landing' ? (
                <div className="space-y-6">
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                        Objectif
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Construire une simulation lisible avec uniquement les variables qui changent vraiment la decision.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                        Duree
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Parcours pense pour etre rempli en moins de 2 minutes, sans reglages techniques au depart.
                      </p>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
                      <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200/70">
                        Arrivee
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        A la fin, vous arrivez directement sur le simulateur complet avec vos choix deja appliques.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={goNext}
                    className="cta-primary inline-flex min-h-14 items-center rounded-3xl px-6 text-base font-semibold transition"
                  >
                    {currentStep.cta}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="max-w-xl">{buildStepContent(currentStep, draft, pricingModes, updateInput)}</div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      onClick={goBack}
                      className="cta-soft inline-flex min-h-12 items-center justify-center rounded-3xl px-5 text-sm font-medium transition"
                    >
                      Retour
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      className="cta-primary inline-flex min-h-12 items-center justify-center rounded-3xl px-5 text-sm font-semibold transition"
                    >
                      {stepIndex === QUESTION_STEPS.length - 1
                        ? 'Voir ma simulation'
                        : 'Continuer'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          <aside className="rounded-[32px] border border-white/10 bg-white/[0.04] p-5 sm:p-6">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-200/70">
              Resume live
            </div>
            <div className="mt-2 text-xl font-semibold text-white">{derivedValues.scenarioName}</div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Surface
                </div>
                <div className="mt-1 text-base font-semibold text-white">
                  {formatNumber(derivedValues.surfaceSqm)} m2
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Achat estime
                </div>
                <div className="mt-1 text-base font-semibold text-white">
                  {formatCurrency(derivedValues.purchasePrice)}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Loyer estime
                </div>
                <div className="mt-1 text-base font-semibold text-white">
                  {formatCurrency(derivedValues.monthlyRent)}
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Horizon
                </div>
                <div className="mt-1 text-base font-semibold text-white">{derivedValues.horizonYears} ans</div>
              </div>
            </div>

            <p className="mt-5 text-sm leading-6 text-slate-400">
              Les hypotheses avancees du simulateur restent disponibles ensuite si vous voulez affiner les frais, les charges ou le rendement alternatif.
            </p>
          </aside>
        </div>
      </div>
    </div>
  )
}
