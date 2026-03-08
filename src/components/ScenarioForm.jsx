const FORM_GROUPS = {
  essentials: ['scenarioName', 'surfaceSqm', 'horizonYears'],
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
    'ownerMonthlyCharges',
    'renterMonthlyCharges',
    'yearlyRentInflation',
    'yearlyPropertyGrowth',
    'opportunityReturn',
  ],
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

  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-slate-100">{field.label}</span>
        {field.unit ? <span className="text-xs text-slate-400">{field.unit}</span> : null}
      </div>
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-3 py-3 transition focus-within:border-cyan-400/60 focus-within:ring-2 focus-within:ring-cyan-400/20">
        <input
          type={field.type}
          value={value}
          onChange={(event) =>
            onChange(field.id, field.type === 'number' ? Number(event.target.value || 0) : event.target.value)
          }
          placeholder={field.placeholder}
          className="w-full bg-transparent text-base text-white outline-none placeholder:text-slate-500"
          {...commonProps}
        />
      </div>
      {field.helper ? <p className="text-xs leading-5 text-slate-400">{field.helper}</p> : null}
    </label>
  )
}

function FormCard({ eyebrow, title, description, children }) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-6 text-slate-400">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function MiniSummary({ label, value, helper }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/60 px-3 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-white">{value}</div>
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
  ].map((id) => fieldMeta[id])

  const financingFields = FORM_GROUPS.financing.map((id) => fieldMeta[id])
  const advancedFields = FORM_GROUPS.advanced.map((id) => fieldMeta[id])

  return (
    <div className="space-y-4">
      <FormCard
        eyebrow="Parametres"
        title="Parcours essentiel"
        description="Commencez avec les variables qui changent vraiment le verdict. Les hypotheses fines restent repliees par defaut."
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="text-sm font-medium text-slate-100">Mode de prix</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onPricingModeChange(pricingModes.total)}
                className={`min-h-12 rounded-2xl border px-4 text-sm font-medium transition ${
                  inputs.pricingMode === pricingModes.total
                    ? 'border-cyan-300/50 bg-cyan-400 text-slate-950'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                Prix complet
              </button>
              <button
                type="button"
                onClick={() => onPricingModeChange(pricingModes.sqm)}
                className={`min-h-12 rounded-2xl border px-4 text-sm font-medium transition ${
                  inputs.pricingMode === pricingModes.sqm
                    ? 'border-cyan-300/50 bg-cyan-400 text-slate-950'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
              >
                Prix au m2
              </button>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {essentialFields.map((field) => (
              <Field key={field.id} field={field} value={inputs[field.id]} onChange={onInputChange} />
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <MiniSummary
              label="Verdict provisoire"
              value={scenario.advantage > 0 ? 'Acheter' : 'Louer'}
              helper={formatCurrency(Math.abs(scenario.advantage))}
            />
            <MiniSummary
              label="Mensualite credit"
              value={formatCurrency(scenario.monthlyLoanPayment)}
              helper={`CRD ${formatCurrency(scenario.remainingBalance)}`}
            />
            <MiniSummary
              label="Loyer observe"
              value={formatCurrency(scenario.monthlyRent)}
              helper={`Horizon ${inputs.horizonYears} ans`}
            />
          </div>

          <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto]">
            <button
              type="button"
              onClick={onShowResults}
              className="min-h-12 rounded-2xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Voir le resultat
            </button>
            <button
              type="button"
              onClick={onSave}
              className="min-h-12 rounded-2xl border border-white/10 bg-white/5 px-4 text-sm font-medium text-white transition hover:bg-white/10"
            >
              Sauvegarder ce scenario
            </button>
          </div>

          <details className="rounded-2xl border border-white/10 bg-slate-950/40">
            <summary className="flex min-h-12 cursor-pointer items-center justify-between px-4 text-sm font-medium text-slate-200">
              Actions secondaires
              <span className="text-xs text-slate-400">Reset et retour rapide</span>
            </summary>
            <div className="border-t border-white/10 px-4 py-4">
              <button
                type="button"
                onClick={onReset}
                className="min-h-11 rounded-2xl border border-white/10 bg-transparent px-4 text-sm text-slate-300 transition hover:bg-white/5"
              >
                Reinitialiser les valeurs
              </button>
            </div>
          </details>
        </div>
      </FormCard>

      <FormCard
        eyebrow="Financement"
        title="Credit et frais"
        description="Bloc court pour les variables de financement. Sur mobile, chaque champ reste a 16 px pour eviter le zoom."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {financingFields.map((field) => (
            <Field key={field.id} field={field} value={inputs[field.id]} onChange={onInputChange} />
          ))}
        </div>
      </FormCard>

      <details
        className={`rounded-[24px] border border-white/10 bg-white/[0.03] ${isMobile ? '' : 'open'}`}
        open={!isMobile}
      >
        <summary className="flex min-h-14 cursor-pointer items-center justify-between px-4 py-4 sm:px-5">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/70">
              Hypotheses avancees
            </div>
            <div className="mt-1 text-lg font-semibold text-white">
              Charges, inflation et rendement alternatif
            </div>
          </div>
          <span className="text-xs text-slate-400">Optionnel</span>
        </summary>
        <div className="border-t border-white/10 px-4 py-4 sm:px-5">
          <div className="mb-4 rounded-2xl border border-dashed border-white/10 bg-slate-950/30 px-4 py-3 text-sm leading-6 text-slate-400">
            Ces champs affinent la simulation. Laissez les valeurs par defaut si vous cherchez un verdict
            rapide.
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {advancedFields.map((field) => (
              <Field key={field.id} field={field} value={inputs[field.id]} onChange={onInputChange} />
            ))}
          </div>
        </div>
      </details>
    </div>
  )
}
