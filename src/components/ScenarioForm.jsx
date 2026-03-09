import { useEffect, useState } from 'react'

const FORM_GROUPS = {
  essentials: ['scenarioName', 'surfaceSqm', 'horizonYears'],
  essentialsCharges: ['ownerMonthlyCharges', 'renterMonthlyCharges'],
  financing: [
    'downPayment',
    'loanDurationYears',
    'mortgageRate',
    'agencyFeePercent',
    'notaryFeePercent',
  ],
  advanced: [
    'yearlyPropertyTax',
    'yearlyMaintenanceBudget',
    'yearlyRentInflation',
    'yearlyPropertyGrowth',
    'opportunityReturn',
  ],
}

function formatInputValue(value) {
  return value === null || value === undefined ? '' : String(value)
}

function parseInputNumber(rawValue) {
  if (rawValue.trim() === '') {
    return null
  }

  const normalized = rawValue.replace(',', '.')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

function Field({ field, value, onChange }) {
  const commonProps =
    field.type === 'number'
      ? {
          inputMode: field.decimals ? 'decimal' : 'numeric',
          min: field.min,
          max: field.max,
          step: field.step,
        }
      : {}
  const [inputValue, setInputValue] = useState(() => formatInputValue(value))

  useEffect(() => {
    setInputValue(formatInputValue(value))
  }, [value])

  function commitNumericValue(rawValue) {
    const parsed = parseInputNumber(rawValue)
    const fallbackValue = field.min ?? 0
    const nextValue = parsed === null ? fallbackValue : Math.max(parsed, field.min ?? parsed)

    setInputValue(formatInputValue(nextValue))
    onChange(field.id, nextValue)
  }

  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-100">{field.label}</span>
        {field.unit ? <span className="text-xs text-slate-400">{field.unit}</span> : null}
      </div>
      <div className="rounded-lg border border-slate-800 bg-slate-950 px-3 py-2.5 transition focus-within:border-cyan-500 focus-within:ring-2 focus-within:ring-cyan-500/15">
        <input
          type={field.type === 'number' ? 'text' : field.type}
          value={field.type === 'number' ? inputValue : value}
          onChange={(event) => {
            if (field.type === 'number') {
              setInputValue(event.target.value)
              return
            }

            onChange(field.id, event.target.value)
          }}
          onBlur={(event) => {
            if (field.type === 'number') {
              commitNumericValue(event.target.value)
            }
          }}
          placeholder={field.placeholder}
          className="w-full bg-transparent text-base text-slate-100 outline-none placeholder:text-slate-500"
          {...commonProps}
        />
      </div>
      {field.helper ? <p className="text-xs leading-5 text-slate-400">{field.helper}</p> : null}
    </label>
  )
}

function FormCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-2xl border border-slate-800 bg-slate-925/80 p-4">
      <div className="mb-4">
        <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-lg font-semibold text-slate-50">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function MiniSummary({ label, value, helper }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-950/70 px-3 py-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-100">{value}</div>
      {helper ? <div className="mt-1 text-xs text-slate-400">{helper}</div> : null}
    </div>
  )
}

export default function ScenarioForm({
  inputs,
  scenario,
  pricingModes,
  fieldMeta,
  onInputChange,
  onPricingModeChange,
  onSave,
  onReset,
  onShowResults,
  formatCurrency,
  isMobile,
}) {
  const essentialFields = [
    FORM_GROUPS.essentials[0],
    FORM_GROUPS.essentials[1],
    ...(inputs.pricingMode === pricingModes.total
      ? ['purchasePrice', 'monthlyRent']
      : ['purchasePricePerSqm', 'monthlyRentPerSqm']),
    FORM_GROUPS.essentials[2],
    ...FORM_GROUPS.essentialsCharges,
  ].map((id) => fieldMeta[id])

  const financingFields = FORM_GROUPS.financing.map((id) => fieldMeta[id])
  const advancedFields = FORM_GROUPS.advanced.map((id) => fieldMeta[id])
  const desktopFieldGrid = isMobile
    ? 'grid gap-3 sm:grid-cols-2'
    : 'grid gap-3 md:grid-cols-2 xl:grid-cols-12'

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-2">
        <FormCard
          eyebrow="Paramètres"
          title="Parcours essentiel"
          description="Commencez avec les variables qui changent vraiment le verdict. Les hypothèses fines restent repliées par défaut."
        >
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-slate-100">Mode de prix</div>
              <div className="inline-flex rounded-lg border border-slate-700 bg-slate-950 p-1">
                <button
                  type="button"
                  onClick={() => onPricingModeChange(pricingModes.total)}
                  className={`min-h-11 rounded-md px-4 text-sm font-semibold transition ${
                    inputs.pricingMode === pricingModes.total
                      ? 'cta-selected'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  Prix complet
                </button>
                <button
                  type="button"
                  onClick={() => onPricingModeChange(pricingModes.sqm)}
                  className={`min-h-11 rounded-md px-4 text-sm font-semibold transition ${
                    inputs.pricingMode === pricingModes.sqm
                      ? 'cta-selected'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  Prix au m²
                </button>
              </div>
            </div>

            <div className={desktopFieldGrid}>
              {essentialFields.map((field, index) => {
                const spanClass = isMobile
                  ? ''
                  : index === 0
                    ? 'xl:col-span-6'
                    : index === 1
                      ? 'xl:col-span-3'
                      : index === 4
                        ? 'xl:col-span-3'
                        : 'xl:col-span-6'

                return (
                  <div key={field.id} className={spanClass}>
                    <Field field={field} value={inputs[field.id]} onChange={onInputChange} />
                  </div>
                )
              })}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <MiniSummary
                label="Verdict provisoire"
                value={scenario.advantage > 0 ? 'Acheter' : 'Louer'}
                helper={formatCurrency(Math.abs(scenario.advantage))}
              />
              <MiniSummary
                label="Mensualité crédit"
                value={formatCurrency(scenario.monthlyLoanPayment)}
                helper={`CRD ${formatCurrency(scenario.remainingBalance)}`}
              />
              <MiniSummary
                label="Loyer observé"
                value={formatCurrency(scenario.monthlyRent)}
                helper={`Horizon ${inputs.horizonYears} ans`}
              />
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={onShowResults}
                className="cta-primary min-h-11 rounded-lg px-4 text-sm font-semibold transition"
              >
                Voir les résultats
              </button>
              <button
                type="button"
                onClick={onReset}
                className="cta-soft min-h-11 rounded-lg px-4 text-sm font-medium transition"
              >
                Réinitialiser les valeurs
              </button>
              <button
                type="button"
                onClick={onSave}
                className="cta-secondary min-h-11 rounded-lg px-4 text-sm font-medium transition"
              >
                Sauvegarder ce scénario
              </button>
            </div>
          </div>
        </FormCard>

        <FormCard
          eyebrow="Financement"
          title="Crédit et frais"
          description="Crédit, frais et hypothèses avancées sont regroupés ici pour tenir dans deux blocs desktop."
        >
          <div className="space-y-4">
            <div className={desktopFieldGrid}>
              {financingFields.map((field) => (
                <div key={field.id} className={isMobile ? '' : 'xl:col-span-6'}>
                  <Field field={field} value={inputs[field.id]} onChange={onInputChange} />
                </div>
              ))}
            </div>

            <div className="border-t border-slate-800 pt-4">
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">
                Hypothèses avancées
              </div>
              <h3 className="mt-1 text-base font-semibold text-slate-50">
                Fiscalité, entretien et projections
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-400">
                Ajustez la fiscalité, l’entretien, l’inflation des loyers, la valorisation et le rendement alternatif.
              </p>
            </div>

            <div className={desktopFieldGrid}>
              {advancedFields.map((field) => (
                <div key={field.id} className={isMobile ? '' : 'xl:col-span-6'}>
                  <Field field={field} value={inputs[field.id]} onChange={onInputChange} />
                </div>
              ))}
            </div>
          </div>
        </FormCard>
      </div>
    </div>
  )
}
