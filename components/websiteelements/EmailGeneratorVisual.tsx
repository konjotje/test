import React from 'react';

/**
 * Visual-only version of the Email Generator form.
 * This component is intended for the marketing/homepage to show the form UI
 * without wiring to real user data or backend. Values are prefilled to match
 * the example screenshot.
 */
const EmailGeneratorVisual: React.FC = () => {
  // Hardcoded values for the visual-only form
  const selectedCreditor = 'Incasso BV Jansen';
  const selectedPurpose = 'Een betalingsregeling voorstellen';
  const contextText = 'Betalen in 5 termijnen vanaf de 25ste van deze maand';

  return (
    <>
    {/* This div replaces the original <Card> component. */}
    <div
      className="w-full sm:max-w-lg transform transition-all duration-300 ease-in-out rounded-neumorphic-lg p-3 sm:p-4 bg-white/40 border border-light-shadow-light/20 shadow-xl"
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      {/* Header section */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-light-shadow-dark/30 flex-shrink-0">
        <h3 className="text-md sm:text-lg font-bold text-light-text-primary truncate pr-2">E-mail Genereren</h3>
        <button
          onClick={(e) => e.preventDefault()}
          className="p-1 sm:p-1.5 rounded-full text-light-text-secondary hover:bg-black/10 active:bg-black/20 transition-all"
          aria-label="Sluiten"
        >
          {/* XIcon now has the blue brand color class */}
          <span className="material-symbols-rounded text-brand-accent text-xl sm:text-2xl" aria-hidden="true">close</span>
        </button>
      </div>

      {/* Form section */}
      <div className="p-3 sm:p-4 md:p-6 overflow-y-auto font-light">
        <form className="space-y-4 font-light">
          
          {/* First Select component - STYLES UPDATED */}
          <div>
            <label className="block text-sm font-medium text-light-text-secondary mb-1.5 font-medium text-left">
              Over welke schuld gaat het?
            </label>
            <button
              type="button"
              className="w-full flex items-center justify-between text-left rounded-neumorphic-lg transition-all duration-300 ease-in-out font-light bg-light-surface/80 border border-light-shadow-light/50 shadow-lg hover:bg-light-surface/75 active:bg-light-surface/85 cursor-pointer"
            >
              <span className="py-2.5 text-sm font-light text-light-text-primary truncate px-3">{selectedCreditor}</span>
              {/* Chevron icon now has the blue brand color class */}
              <span className="material-symbols-rounded text-brand-accent text-xl mr-2.5" aria-hidden="true">expand_more</span>
            </button>
          </div>

          {/* Second Select component - STYLES UPDATED */}
          <div>
            <label className="block text-sm font-medium text-light-text-secondary mb-1.5 font-medium text-left">
              Wat is het doel van de e-mail?
            </label>
            <button
              type="button"
              className="w-full flex items-center justify-between text-left rounded-neumorphic-lg transition-all duration-300 ease-in-out font-light bg-light-surface/80 border border-light-shadow-light/50 shadow-lg hover:bg-light-surface/75 active:bg-light-surface/85 cursor-pointer"
            >
              <span className="py-2.5 text-sm font-light text-light-text-primary truncate px-3">{selectedPurpose}</span>
              {/* Chevron icon now has the blue brand color class */}
              <span className="material-symbols-rounded text-brand-accent text-xl mr-2.5" aria-hidden="true">expand_more</span>
            </button>
          </div>

          {/* TextArea component */}
          <div>
            <label className="block text-sm font-medium text-light-text-secondary mb-1.5 font-medium text-left">
              Extra context (optioneel)
            </label>
            <textarea
              className="block w-full px-3 py-2.5 bg-light-surface/70 rounded-neumorphic text-sm font-light text-light-text-primary placeholder-light-text-secondary border border-light-shadow-dark/20 focus:outline-none focus:ring-2 focus:ring-brand-accent transition-all duration-200 ease-in-out resize-none"
              placeholder="Geef hier extra details die belangrijk zijn voor de e-mail"
              rows={4}
              value={contextText}
              readOnly
            />
          </div>

          {/* Button components */}
          <div className="flex justify-end space-x-2 pt-2">
            <button type="button" className="font-medium rounded-neumorphic focus:outline-none transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed no-underline px-4 py-2 text-sm min-h-[40px] bg-light-surface/70 text-light-text-primary border border-light-shadow-light/30 shadow-lg hover:shadow-xl">
              Annuleren
            </button>
            <button type="button" className="font-medium rounded-neumorphic focus:outline-none transition-all duration-200 ease-in-out flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed no-underline px-4 py-2 text-sm min-h-[40px] bg-brand-accent text-white shadow-lg hover:shadow-xl">
              Genereer E-mail
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};

export default EmailGeneratorVisual;