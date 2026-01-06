import React, { useState } from 'react';
import { apiService } from '../services/apiService'; // Alterado
import { Target, Lightbulb, User, MessageCircle, Sparkles, Loader2 } from 'lucide-react';

export const LeadFinder: React.FC = () => {
  const [niche, setNiche] = useState('');
  const [strategy, setStrategy] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!niche) return;
    setLoading(true);
    setStrategy(null);
    try {
      const result = await apiService.getGeminiStrategy(niche);
      setStrategy(result);
    } catch (e) {
      console.error("Falha ao gerar estratégia de leads:", e);
      setStrategy({ error: "Não foi possível gerar a estratégia. Tente novamente." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Gerador de Estratégia de Leads</h2>
        <p className="text-slate-500">Use a IA para descobrir como atrair seu paciente ideal.</p>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex gap-4 items-center">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 mb-1">Qual seu nicho ou especialidade?</label>
          <input
            type="text"
            value={niche}
            onChange={e => setNiche(e.target.value)}
            className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Ex: Ansiedade para vestibulandos, Reiki para idosos, Tarot terapêutico..."
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={loading || !niche}
          className="mt-6 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
          Gerar Estratégia
        </button>
      </div>

      {strategy && !strategy.error && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
            <div className="flex items-center gap-3 mb-4">
              <User className="text-blue-600" />
              <h3 className="font-bold text-blue-900">Persona Ideal</h3>
            </div>
            <p className="text-blue-800 leading-relaxed">{strategy.persona}</p>
          </div>

          <div className="bg-red-50 p-6 rounded-xl border border-red-100">
             <div className="flex items-center gap-3 mb-4">
              <Target className="text-red-600" />
              <h3 className="font-bold text-red-900">Dores & Desejos</h3>
            </div>
            <ul className="space-y-2">
              {strategy.pains?.map((pain: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-red-800">
                  <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {pain}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-amber-50 p-6 rounded-xl border border-amber-100">
             <div className="flex items-center gap-3 mb-4">
              <Lightbulb className="text-amber-600" />
              <h3 className="font-bold text-amber-900">Ideias de Conteúdo</h3>
            </div>
             <ul className="space-y-2">
              {strategy.contentIdeas?.map((idea: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-amber-800">
                   <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                  {idea}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 p-6 rounded-xl border border-green-100">
             <div className="flex items-center gap-3 mb-4">
              <MessageCircle className="text-green-600" />
              <h3 className="font-bold text-green-900">Mensagem de Abordagem</h3>
            </div>
            <div className="bg-white/50 p-3 rounded-lg text-green-800 italic border border-green-200">
              "{strategy.outreachMessage}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};