import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService'; // Alterado
import { Sparkles, Copy, Send, MessageCircle, User, Phone, AlignLeft } from 'lucide-react';
import { Patient } from '../types';
import { maskPhone } from '../utils/masks';

interface AIAssistantProps {
  patients: Patient[];
}

const MESSAGE_TYPES = [
  { id: 'agendamento', label: 'Agendamento Humanizado' },
  { id: 'agradecimento', label: 'Agradecimento Pós-Sessão' },
  { id: 'explicar', label: 'Explicar Tratamento' },
  { id: 'followup', label: 'Acompanhamento (Follow-up)' },
  { id: 'aniversario', label: 'Feliz Aniversário' },
];

export const AIAssistant: React.FC<AIAssistantProps> = ({ patients }) => {
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [messageType, setMessageType] = useState('agendamento');
  const [context, setContext] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [loading, setLoading] = useState(false);

  // Auto-fill fields when a patient is selected from dropdown
  useEffect(() => {
    if (selectedPatientId) {
      const p = patients.find(pat => pat.id === selectedPatientId);
      if (p) {
        setManualName(p.name);
        setManualPhone(p.phone);
      }
    } else {
      setManualName('');
      setManualPhone('');
    }
  }, [selectedPatientId, patients]);

  const handleGenerate = async () => {
    if (!manualName || !context) {
        alert("Por favor, preencha o nome do paciente e o contexto.");
        return;
    }
    setLoading(true);
    try {
      const result = await apiService.generateGeminiText({
        messageType,
        context,
        patientName: manualName,
        tone: 'empático' // O tom pode ser um estado no futuro
      });
      setGeneratedText(result.text);
    } catch (error) {
      console.error("Falha ao gerar texto com IA:", error);
      setGeneratedText("Desculpe, não foi possível gerar o texto. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const getWhatsAppLink = () => {
    const cleanPhone = manualPhone.replace(/\D/g, '');
    if (!cleanPhone) return '#';
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(generatedText)}`;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-800 mb-2 flex items-center gap-3">
          <div className="bg-purple-100 p-2 rounded-lg">
             <Sparkles className="text-purple-600 w-6 h-6" />
          </div>
          Assistente de Mensagens
        </h2>
        <p className="text-slate-500 text-lg">
          Crie textos humanizados e empáticos para seus pacientes em segundos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Formulário de Criação */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          
          {/* Seletor de Paciente (Opcional) */}
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide mb-1">Buscar Paciente Cadastrado</label>
            <select 
              className="w-full p-2 bg-white text-slate-700 border border-slate-200 rounded-md text-sm outline-none focus:border-purple-500"
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
            >
              <option value="">-- Selecione ou digite abaixo --</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <MessageCircle size={18} className="text-purple-600" /> Tipo de Mensagem
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {MESSAGE_TYPES.map(type => (
                <button
                  key={type.id}
                  onClick={() => setMessageType(type.id)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-all border ${
                    messageType === type.id 
                      ? 'bg-purple-50 border-purple-200 text-purple-700 font-medium shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:border-purple-300'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <User size={18} className="text-purple-600" /> Nome do Paciente
              </label>
              <input 
                type="text"
                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="Ex: Ana"
                value={manualName}
                onChange={(e) => setManualName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
                <Phone size={18} className="text-purple-600" /> WhatsApp
              </label>
              <input 
                type="text"
                className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                placeholder="(00) 00000-0000"
                value={manualPhone}
                onChange={(e) => setManualPhone(maskPhone(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
              <AlignLeft size={18} className="text-purple-600" /> Detalhes / Contexto
            </label>
            <textarea 
              className="w-full p-4 bg-white text-slate-900 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px] resize-none transition-all"
              placeholder='Ex: "Confirmar terça às 14h", "Sugerir novos horários" ou "Perguntar como está após a sessão de Reiki"'
              value={context}
              onChange={(e) => setContext(e.target.value)}
            ></textarea>
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading || !manualName || !context}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white py-3 rounded-xl font-medium transition-all transform active:scale-95 disabled:opacity-50 disabled:transform-none flex justify-center items-center gap-2 shadow-lg shadow-purple-900/10"
          >
            {loading ? (
              <span className="flex items-center gap-2">Criando mágica... <Sparkles size={18} className="animate-pulse" /></span>
            ) : (
              <>
                <Sparkles size={18} className="text-purple-400" /> Gerar Mensagem
              </>
            )}
          </button>
        </div>

        {/* Resultado */}
        <div className="flex flex-col h-full">
           <div className="bg-slate-100 p-1 rounded-t-2xl border-x border-t border-slate-200 flex items-center gap-2 px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
              <span className="text-xs text-slate-500 ml-2 font-medium">Pré-visualização</span>
           </div>
           <div className="bg-white border-x border-b border-slate-200 rounded-b-2xl p-6 flex-1 flex flex-col shadow-sm relative overflow-hidden">
              {generatedText ? (
                <>
                  <div className="flex-1 overflow-y-auto mb-6">
                    <div className="bg-emerald-50 p-4 rounded-xl rounded-tl-none border border-emerald-100 text-slate-700 leading-relaxed whitespace-pre-wrap">
                      {generatedText}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-right">Gerado por IA • Verifique antes de enviar</p>
                  </div>
                  
                  <div className="flex gap-3 mt-auto">
                    <button 
                      onClick={() => navigator.clipboard.writeText(generatedText)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 text-slate-600 font-medium transition-colors"
                    >
                      <Copy size={18} /> Copiar
                    </button>
                    <a 
                      href={getWhatsAppLink()}
                      target="_blank"
                      rel="noreferrer"
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-white transition-colors shadow-lg shadow-green-500/20 ${!manualPhone ? 'bg-slate-300 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600'}`}
                      onClick={(e) => !manualPhone && e.preventDefault()}
                    >
                      <Send size={18} /> Enviar WhatsApp
                    </a>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center opacity-60">
                  <MessageCircle size={48} className="mb-4 text-slate-300" />
                  <p className="text-sm max-w-xs">Preencha os dados ao lado e clique em "Gerar" para ver a mágica acontecer.</p>
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};