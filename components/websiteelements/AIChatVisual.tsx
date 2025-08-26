import React from 'react';
import { schuldenmaatjeAvatarPath } from '@/utils/ai/prompts';

const AIChatVisual: React.FC = () => {
  return (
    <div
      className="w-full sm:max-w-lg h-[800px] transform transition-all duration-300 ease-in-out rounded-3xl p-6 bg-white/40 border border-white/20 shadow-2xl"
      style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <img src={schuldenmaatjeAvatarPath} alt="Schuldhulpje Avatar" className="w-12 h-12 rounded-full shadow-lg object-contain bg-white/90 p-0.5" />
        <h3 className="text-lg font-medium text-gray-800">Schuldhulpje AI</h3>
      </div>

      {/* Message area with more height */}
      <div className="h-[550px] mb-6">
        <div className="inline-block max-w-[85%] rounded-2xl bg-white/90 px-6 py-4 shadow-lg">
          <p className="text-gray-600">
            Hallo! Ik ben Schuldhulpje, jouw digitale hulp bij je geldzaken. Samen zorgen we voor helder inzicht en een stevig financieel plan. Stel gerust je vragen!
          </p>
        </div>
      </div>

      {/* Action buttons 2x2 */}
      <div className="mb-6">
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/90 text-gray-700 shadow-md">
            <span className="material-symbols-rounded text-blue-600">attach_file</span>
            Importeer
          </button>
          <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/90 text-gray-700 shadow-md">
            <span className="material-symbols-rounded text-blue-600">email</span>
            Genereer
          </button>
          <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/90 text-gray-700 shadow-md">
            <span className="material-symbols-rounded text-blue-600">insights</span>
            Analyse
          </button>
          <button className="flex items-center justify-center gap-2 p-4 rounded-2xl bg-white/90 text-gray-700 shadow-md">
            <span className="material-symbols-rounded text-blue-600">print</span>
            Overzicht
          </button>
        </div>
      </div>

      {/* Input area */}
      <div className="relative flex items-center gap-3">
        <input
          type="text"
          placeholder="Typ je bericht..."
          className="w-full p-4 rounded-2xl bg-white/90 text-gray-700 placeholder-gray-500 shadow-md"
          readOnly
        />
        <button className="p-3 rounded-full bg-white/90 shadow-md">
          <span className="material-symbols-rounded text-blue-600">mic</span>
        </button>
        <button className="p-3 rounded-full bg-blue-600 text-white shadow-md">
          <span className="material-symbols-rounded">arrow_upward</span>
        </button>
      </div>
    </div>
  );
};

export default AIChatVisual;
