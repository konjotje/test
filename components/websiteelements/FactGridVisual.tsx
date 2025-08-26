import React from 'react';

const formatCurrency = (n: number) => {
  return `€${n.toLocaleString('nl-NL', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const FactGridVisual: React.FC = () => {
  return (
    <div
      className="w-full sm:max-w-lg aspect-square transform transition-all duration-300 ease-in-out rounded-neumorphic-lg p-3 sm:p-4 bg-white/40 border border-light-shadow-light/20 shadow-xl"
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      <div className="h-full grid grid-cols-2 grid-rows-2 gap-3">
        {/* Card 1 */}
        <div className="flex flex-col items-center justify-center rounded-neumorphic-lg p-4 bg-light-surface/80 border border-light-shadow-light/50 shadow-lg text-center">
          <span className="material-symbols-rounded text-4xl sm:text-5xl lg:text-6xl mb-2 text-brand-accent">sports_score</span>
          <h3 className="text-sm sm:text-base font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-tight mb-1">Schuldenvrij</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">dec 2028</p>
        </div>

        {/* Card 2 */}
        <div className="flex flex-col items-center justify-center rounded-neumorphic-lg p-4 bg-light-surface/80 border border-light-shadow-light/50 shadow-lg text-center">
          <span className="material-symbols-rounded text-4xl sm:text-5xl lg:text-6xl mb-2 text-brand-accent">calendar_month</span>
          <h3 className="text-sm sm:text-base font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-tight mb-1">Aflossing augustus</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">{formatCurrency(691)}</p>
        </div>

        {/* Card 3 */}
        <div className="flex flex-col items-center justify-center rounded-neumorphic-lg p-4 bg-light-surface/80 border border-light-shadow-light/50 shadow-lg text-center">
          <span className="material-symbols-rounded text-4xl sm:text-5xl lg:text-6xl mb-2 text-brand-accent">trending_up</span>
          <h3 className="text-sm sm:text-base font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-tight mb-1">Spaarruimte</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">{formatCurrency(454)}</p>
        </div>

        {/* Card 4 */}
        <div className="flex flex-col items-center justify-center rounded-neumorphic-lg p-4 bg-light-surface/80 border border-light-shadow-light/50 shadow-lg text-center">
          <span className="material-symbols-rounded text-4xl sm:text-5xl lg:text-6xl mb-2 text-brand-accent">payments</span>
          <h3 className="text-sm sm:text-base font-medium text-light-text-secondary dark:text-dark-text-secondary tracking-tight mb-1">Totaal afgelost</h3>
          <p className="text-lg sm:text-xl lg:text-2xl font-bold text-light-text-primary dark:text-dark-text-primary mt-1">{formatCurrency(4160)}</p>
        </div>
      </div>
    </div>
  );
};

export default FactGridVisual;
