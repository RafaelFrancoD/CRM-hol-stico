import React, { useState } from 'react';
import { Patient, PatientStatus } from '../types';
import { Search, Edit, Trash2, Phone, UserPlus, ChevronDown, ChevronUp, Calendar, Clock, FileText as NoteIcon } from 'lucide-react';
import { maskPhone } from '../utils/masks';

interface PatientListProps {
  patients: Patient[];
  onAdd: () => void;
  onEdit: (patient: Patient) => void;
  onDelete: (id: string) => void;
  isPrivacyMode: boolean;
}

export const PatientList: React.FC<PatientListProps> = ({ patients, onAdd, onEdit, onDelete, isPrivacyMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedPatientId, setExpandedPatientId] = useState<string | null>(null);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.email && p.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const maskData = (data: string) => isPrivacyMode ? '••••••' : data;

  const getStatusColor = (status: PatientStatus) => {
    switch(status) {
      case PatientStatus.TREATMENT: return 'bg-emerald-100 text-emerald-700';
      case PatientStatus.NEW: return 'bg-blue-100 text-blue-700';
      case PatientStatus.ANAMNESIS: return 'bg-violet-100 text-violet-700';
      case PatientStatus.MAINTENANCE: return 'bg-amber-100 text-amber-700';
      default: return 'bg-slate-100 text-slate-600';
    }
  };
  
  const handleToggleExpand = (id: string) => {
    setExpandedPatientId(expandedPatientId === id ? null : id);
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Pacientes</h2>
        <button onClick={onAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg hidden md:flex items-center gap-2">
          <UserPlus size={18} /> Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar por nome ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 font-medium text-slate-700">
              <tr>
                <th className="px-2 py-4 w-12 text-center"></th>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contato</th>
                <th className="px-6 py-4">LGPD</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map(patient => (
                <React.Fragment key={patient.id}>
                  <tr className="hover:bg-slate-50 transition-colors">
                     <td className="px-2 py-4 text-center">
                      <button 
                        onClick={() => handleToggleExpand(patient.id)} 
                        className="p-1.5 text-slate-400 hover:bg-slate-200 rounded-full transition-colors"
                        title="Ver detalhes rápidos"
                      >
                        {expandedPatientId === patient.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </button>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">{maskData(patient.name)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span>{maskData(maskPhone(patient.phone))}</span>
                        <span className="text-xs text-slate-400">{maskData(patient.email)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {patient.lgpdConsent ? 
                        <span className="text-green-600 text-xs">Assinado</span> : 
                        <span className="text-red-500 text-xs">Pendente</span>
                      }
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                         <a 
                          href={`https://wa.me/${patient.phone.replace(/\D/g,'')}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="WhatsApp"
                        >
                          <Phone size={16} />
                        </a>
                        <button onClick={() => onEdit(patient)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit size={16} />
                        </button>
                        <button onClick={() => onDelete(patient.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedPatientId === patient.id && (
                    <tr className="bg-slate-50/70">
                      <td colSpan={6} className="p-0">
                         <div className="p-4 m-2 bg-white rounded-lg border border-slate-200 shadow-inner">
                          <h4 className="font-bold text-sm mb-3 text-emerald-800">Detalhes Rápidos</h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                            <div>
                              <p className="font-semibold text-slate-500 flex items-center gap-1 mb-1"><Calendar size={12}/> Próxima Sessão</p>
                              <p className="text-slate-800 font-medium">{patient.nextSessionDate ? new Date(patient.nextSessionDate + 'T12:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'}) : 'Não agendada'}</p>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-500 flex items-center gap-1 mb-1"><Clock size={12}/> Última Sessão</p>
                              <p className="text-slate-800 font-medium">{patient.lastSessionDate ? new Date(patient.lastSessionDate + 'T12:00:00').toLocaleDateString('pt-BR', {day: '2-digit', month: 'long', year: 'numeric'}) : 'Nenhuma'}</p>
                            </div>
                            <div className="md:col-span-3">
                               <p className="font-semibold text-slate-500 flex items-center gap-1 mb-1"><NoteIcon size={12}/> Anotações Gerais</p>
                               <p className="text-slate-700 whitespace-pre-wrap text-sm p-2 bg-slate-50 rounded border border-slate-100">{patient.notes || 'Nenhuma anotação.'}</p>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden p-2 space-y-3">
          {filteredPatients.map(patient => (
            <div key={patient.id} className="bg-slate-50/50 rounded-lg p-4 border border-slate-100">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-800">{maskData(patient.name)}</h3>
                  <span className={`px-2 py-0.5 mt-1 inline-block rounded-full text-xs font-medium ${getStatusColor(patient.status)}`}>
                    {patient.status}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <a href={`https://wa.me/${patient.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="p-2 text-green-600 hover:bg-green-100 rounded-full"><Phone size={16} /></a>
                  <button onClick={() => onEdit(patient)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full"><Edit size={16} /></button>
                  <button onClick={() => onDelete(patient.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-full"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500 space-y-1">
                <p><strong>Contato:</strong> {maskData(maskPhone(patient.phone))}</p>
                <p><strong>Email:</strong> {maskData(patient.email)}</p>
                <p><strong>LGPD:</strong> {patient.lgpdConsent ? <span className="text-green-600">Assinado</span> : <span className="text-red-500">Pendente</span>}</p>
              </div>
            </div>
          ))}
        </div>

        {filteredPatients.length === 0 && (
            <div className="p-8 text-center text-slate-500">Nenhum paciente encontrado.</div>
        )}
      </div>

      {/* Mobile Floating Action Button */}
      <button onClick={onAdd} className="md:hidden fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform z-20">
        <UserPlus size={24} />
      </button>

    </div>
  );
};