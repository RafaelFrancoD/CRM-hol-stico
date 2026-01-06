import React, { useState, useEffect } from 'react';
import { Patient, PatientStatus, MessageTemplate } from '../types';
import { apiService } from '../services/apiService'; // Alterado
import { Send, Filter, CheckSquare, Square, ClipboardList } from 'lucide-react';

export const MassMessaging: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<PatientStatus | 'ALL'>('ALL');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  
  const [messageTemplate, setMessageTemplate] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [p, t] = await Promise.all([
          apiService.getItems<Patient>('patients'),
          apiService.getItems<MessageTemplate>('message_templates')
        ]);
        setPatients(p);
        setTemplates(t);
        if (t.length > 0) {
          setSelectedTemplateId(t[0].id);
          setMessageTemplate(t[0].content);
        }
      } catch (error) {
        console.error("Falha ao carregar dados para mensagens em massa:", error);
      }
    };
    loadAllData();
  }, []);

  const filteredPatients = patients.filter(p => selectedStatus === 'ALL' || p.status === selectedStatus);

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPatients.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPatients.map(p => p.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };
  
  const handleTemplateChange = (id: string) => {
    setSelectedTemplateId(id);
    const selected = templates.find(t => t.id === id);
    setMessageTemplate(selected ? selected.content : '');
  };

  const generateLink = (patient: Patient) => {
    const msg = messageTemplate
      .replace(/{nome}/g, patient.name)
      .replace(/{primeiro_nome}/g, patient.name.split(' ')[0])
      .replace(/{data_proxima_sessao}/g, patient.nextSessionDate ? new Date(patient.nextSessionDate + 'T12:00:00').toLocaleDateString('pt-BR') : 'data não definida');
      
    return `https://wa.me/${patient.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="p-4 md:p-6 h-auto md:h-[calc(100vh-4rem)] flex flex-col md:flex-row gap-6">
      {/* Configuration Panel */}
      <div className="w-full md:w-1/3 bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col h-full">
        <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <Send className="text-emerald-600" /> Central de Disparos
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <ClipboardList size={16} /> Selecionar Modelo de Mensagem
          </label>
          <select 
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={selectedTemplateId}
            onChange={e => handleTemplateChange(e.target.value)}
          >
            {templates.length === 0 && <option disabled>Crie um modelo primeiro</option>}
            {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center gap-2">
            <Filter size={16} /> Filtrar Destinatários
          </label>
          <select 
            className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
            value={selectedStatus}
            onChange={e => {
              setSelectedStatus(e.target.value as any);
              setSelectedIds(new Set());
            }}
          >
            <option value="ALL">Todos os Pacientes</option>
            {Object.values(PatientStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        <div className="flex-1 flex flex-col min-h-[150px]">
          <label className="block text-sm font-medium text-slate-700 mb-2">Pré-visualização da Mensagem</label>
          <p className="text-xs text-slate-500 mb-2">Variáveis como <span className="font-mono bg-slate-100 px-1 rounded">{'{nome}'}</span> serão substituídas.</p>
          <textarea
            readOnly
            className="w-full flex-1 p-3 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg resize-none font-sans text-sm leading-relaxed"
            value={messageTemplate}
          ></textarea>
        </div>
      </div>

      {/* Patient List Panel */}
      <div className="w-full md:w-2/3 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-[500px] md:h-full overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
             <button onClick={toggleSelectAll} className="text-slate-600 hover:text-emerald-600">
               {selectedIds.size > 0 && selectedIds.size === filteredPatients.length ? <CheckSquare /> : <Square />}
             </button>
             <span className="font-medium text-slate-700">{selectedIds.size} selecionados para envio</span>
          </div>
          <div className="text-sm text-slate-500">
            Total na lista: {filteredPatients.length}
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredPatients.map(p => (
            <div key={p.id} className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${selectedIds.has(p.id) ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-3">
                <button onClick={() => toggleSelect(p.id)} className={`text-slate-400 ${selectedIds.has(p.id) ? 'text-emerald-600' : ''}`}>
                  {selectedIds.has(p.id) ? <CheckSquare size={20} /> : <Square size={20} />}
                </button>
                <div>
                  <p className="font-medium text-slate-800">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.status} • {p.phone}</p>
                </div>
              </div>
              
              {selectedIds.has(p.id) && (
                <div className="flex items-center gap-2">
                    <a 
                    href={generateLink(p)}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg text-sm hover:bg-emerald-700 flex items-center gap-1 shadow-sm font-medium"
                    >
                    <Send size={14} /> Enviar
                    </a>
                </div>
              )}
            </div>
          ))}
          {filteredPatients.length === 0 && <div className="p-8 text-center text-slate-400">Nenhum paciente neste filtro.</div>}
        </div>
      </div>
    </div>
  );
};