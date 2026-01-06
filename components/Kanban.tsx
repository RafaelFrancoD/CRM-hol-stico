import React from 'react';
import { Patient, PatientStatus } from '../types';
import { MoreHorizontal, GripVertical, User, FileSearch, Sparkles, CheckCircle2 } from 'lucide-react';

interface KanbanProps {
  patients: Patient[];
  onUpdateStatus: (id: string, newStatus: PatientStatus) => void;
}

const COLUMNS = [
  { 
    id: PatientStatus.NEW, 
    title: 'Novos Contatos', 
    icon: <User size={18} />,
    color: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-700'
  },
  { 
    id: PatientStatus.ANAMNESIS, 
    title: 'Anamnese', 
    icon: <FileSearch size={18} />,
    color: 'from-violet-500 to-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    text: 'text-violet-700'
  },
  { 
    id: PatientStatus.TREATMENT, 
    title: 'Em Tratamento', 
    icon: <Sparkles size={18} />,
    color: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-700'
  },
  { 
    id: PatientStatus.MAINTENANCE, 
    title: 'Manutenção', 
    icon: <CheckCircle2 size={18} />,
    color: 'from-amber-500 to-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    text: 'text-amber-700'
  },
];

export const Kanban: React.FC<KanbanProps> = ({ patients, onUpdateStatus }) => {
  const handleDragStart = (e: React.DragEvent, patientId: string) => {
    e.dataTransfer.setData('patientId', patientId);
    e.currentTarget.classList.add('opacity-50');
  };

  const handleDragEnd = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('opacity-50');
  };

  const handleDrop = (e: React.DragEvent, status: PatientStatus) => {
    e.preventDefault();
    const patientId = e.dataTransfer.getData('patientId');
    if (patientId) {
      onUpdateStatus(patientId, status);
    }
  };

  const handleDragOver = (e: React.DragEvent) => e.preventDefault();

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col bg-slate-50/50">
      <div className="mb-6 flex flex-col shrink-0">
        <h2 className="text-2xl md:text-3xl font-serif font-bold text-slate-800 bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
          Fluxo de Pacientes
        </h2>
        <p className="text-slate-500 text-xs md:text-sm font-medium tracking-wide uppercase opacity-80 mt-1">
          Arraste e solte para organizar o fluxo
        </p>
      </div>

      <div className="flex-1 flex gap-4 md:gap-6 min-w-full overflow-x-auto pb-4 custom-scrollbar scroll-snap-type-x-mandatory">
        {COLUMNS.map(col => (
          <div 
            key={col.id} 
            className={`w-[85vw] md:w-80 flex-shrink-0 rounded-2xl flex flex-col h-full transition-colors duration-300 ${col.bg} border ${col.border} shadow-sm scroll-snap-align-start`}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            {/* Column Header */}
            <div className={`p-4 rounded-t-2xl bg-white/60 backdrop-blur border-b ${col.border}`}>
              <div className="flex items-center justify-between mb-2">
                <div className={`flex items-center gap-2 font-bold ${col.text}`}>
                  {col.icon}
                  {col.title}
                </div>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full bg-white shadow-sm ${col.text}`}>
                  {patients.filter(p => p.status === col.id).length}
                </span>
              </div>
              <div className={`h-1 w-full rounded-full bg-gradient-to-r ${col.color} opacity-80`}></div>
            </div>

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
              {patients.filter(p => p.status === col.id).map(patient => (
                <div
                  key={patient.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, patient.id)}
                  onDragEnd={handleDragEnd}
                  className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 cursor-grab active:cursor-grabbing hover:shadow-lg hover:-translate-y-1 transition-all duration-200 group relative"
                >
                  <div className="absolute left-0 top-4 bottom-4 w-1 bg-gradient-to-b rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 from-slate-300 to-slate-100"></div>
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-100 p-1.5 rounded-lg text-slate-400 group-hover:text-slate-600 transition-colors">
                        <GripVertical size={14} />
                      </div>
                      <span className="font-semibold text-slate-800">{patient.name}</span>
                    </div>
                  </div>
                  
                  <div className="pl-8">
                    <div className="text-xs text-slate-500 bg-slate-50 inline-block px-2 py-1 rounded border border-slate-100 mb-2">
                      {patient.phone}
                    </div>
                    {patient.nextSessionDate && (
                      <p className="text-[10px] text-emerald-600 font-medium mt-1">
                        Próx: {new Date(patient.nextSessionDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>

                  {/* Quick Action Overlay (Mobile/Accessibility friendly fallback) */}
                  <div className="mt-3 pt-3 border-t border-slate-50 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="text-slate-400 hover:text-slate-600">
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};