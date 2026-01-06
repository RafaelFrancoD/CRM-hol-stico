import React, { useState, useEffect } from 'react';
import { Patient, PatientStatus } from '../types';
import { X, Save, Calendar, Clock, MapPin, CreditCard, UserCheck, Baby } from 'lucide-react';
import { maskCPF, maskPhone, maskRG } from '../utils/masks';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Partial<Patient>) => void;
  patient?: Patient | null;
}

export const PatientModal: React.FC<PatientModalProps> = ({ isOpen, onClose, onSave, patient }) => {
  const [formData, setFormData] = useState<Partial<Patient>>({
    name: '',
    email: '',
    phone: '',
    status: PatientStatus.NEW,
    lgpdConsent: false,
    lastSessionDate: '',
    nextSessionDate: '',
    birthDate: '',
    cpf: '',
    rg: '',
    address: '',
    guardianName: '',
    guardianCpf: '',
    guardianRg: '',
    guardianBirthDate: ''
  });

  const [isMinor, setIsMinor] = useState(false);
  const [hasGuardian, setHasGuardian] = useState(false);

  useEffect(() => {
    if (patient) {
      setFormData(patient);
      if (patient.birthDate) checkAge(patient.birthDate);
      
      // Se já tiver nome de responsável salvo, abre a seção automaticamente
      if (patient.guardianName) {
          setHasGuardian(true);
      }
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        status: PatientStatus.NEW,
        lgpdConsent: false,
        lastSessionDate: '',
        nextSessionDate: '',
        birthDate: '',
        cpf: '',
        rg: '',
        address: '',
        guardianName: '',
        guardianCpf: '',
        guardianRg: '',
        guardianBirthDate: ''
      });
      setIsMinor(false);
      setHasGuardian(false);
    }
  }, [patient, isOpen]);

  const checkAge = (dateString: string) => {
    if (!dateString) {
      setIsMinor(false);
      return;
    }
    const today = new Date();
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    const minor = age < 18;
    setIsMinor(minor);
    
    // Se for menor, obriga a ter responsável
    if (minor) {
        setHasGuardian(true);
    }
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, birthDate: val });
    checkAge(val);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col">
        <div className="bg-emerald-600 p-4 flex justify-between items-center text-white shrink-0">
          <h2 className="font-bold text-lg font-serif">{patient ? 'Editar Paciente' : 'Novo Paciente'}</h2>
          <button onClick={onClose} className="hover:bg-emerald-700 p-1 rounded transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Seção 1: Dados Básicos e Contato */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome Completo</label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">WhatsApp</label>
              <input
                type="text"
                required
                placeholder="(00) 00000-0000"
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: maskPhone(e.target.value)})}
              />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Seção 2: Documentos e Endereço */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <CreditCard size={14} /> Documentação
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Nascimento</label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.birthDate || ''}
                  onChange={handleDateChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">CPF</label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.cpf || ''}
                  onChange={e => setFormData({...formData, cpf: maskCPF(e.target.value)})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">RG</label>
                <input
                  type="text"
                  placeholder="00.000.000-0"
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                  value={formData.rg || ''}
                  onChange={e => setFormData({...formData, rg: maskRG(e.target.value)})}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-2">
                <MapPin size={14} /> Endereço Completo
              </label>
              <textarea
                rows={2}
                placeholder="Rua, Número, Bairro, Cidade - Estado, CEP"
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                value={formData.address || ''}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          {/* Toggle para Responsável */}
          <div className="flex items-center gap-2">
             <input 
                type="checkbox" 
                id="hasGuardian"
                checked={hasGuardian}
                disabled={isMinor} // Se for menor, não pode desmarcar
                onChange={(e) => setHasGuardian(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
             />
             <label htmlFor="hasGuardian" className="text-sm font-medium text-slate-700 cursor-pointer select-none">
                 Adicionar dados do Responsável / Tutor {isMinor && <span className="text-amber-600 font-bold">(Obrigatório para menores)</span>}
             </label>
          </div>

          {/* Seção Condicional: Responsável (Menores de Idade ou Manual) */}
          {hasGuardian && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 animate-in fade-in slide-in-from-top-2">
              <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Baby size={16} /> Dados do Responsável Legal
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-amber-900 mb-1">Nome Completo do Responsável</label>
                <input
                  type="text"
                  required={isMinor}
                  className="w-full px-3 py-2 bg-white text-slate-900 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                  value={formData.guardianName || ''}
                  onChange={e => setFormData({...formData, guardianName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">Nascimento (Resp.)</label>
                  <input
                    type="date"
                    required={isMinor}
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    value={formData.guardianBirthDate || ''}
                    onChange={e => setFormData({...formData, guardianBirthDate: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">CPF (Resp.)</label>
                  <input
                    type="text"
                    required={isMinor}
                    placeholder="000.000.000-00"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    value={formData.guardianCpf || ''}
                    onChange={e => setFormData({...formData, guardianCpf: maskCPF(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-amber-900 mb-1">RG (Resp.)</label>
                  <input
                    type="text"
                    required={isMinor}
                    placeholder="00.000.000-0"
                    className="w-full px-3 py-2 bg-white text-slate-900 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none"
                    value={formData.guardianRg || ''}
                    onChange={e => setFormData({...formData, guardianRg: maskRG(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Seção 3: Controle Interno */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Status do Fluxo</label>
               <select
                className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value as PatientStatus})}
              >
                {Object.values(PatientStatus).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
             </div>
             
             <div className="flex flex-col justify-end">
                <div className="flex items-center gap-2 p-2 bg-white rounded border border-slate-200">
                  <input
                    type="checkbox"
                    id="lgpd"
                    className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                    checked={formData.lgpdConsent}
                    onChange={e => setFormData({...formData, lgpdConsent: e.target.checked})}
                  />
                  <label htmlFor="lgpd" className="text-sm text-slate-700 select-none cursor-pointer flex items-center gap-1">
                    <UserCheck size={14} /> Termo LGPD Assinado
                  </label>
                </div>
             </div>

             <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Clock size={12} /> Última Sessão
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-1.5 bg-white text-slate-700 border border-slate-300 rounded-md text-sm focus:border-emerald-500 outline-none"
                  value={formData.lastSessionDate || ''}
                  onChange={e => setFormData({...formData, lastSessionDate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1 flex items-center gap-1">
                  <Calendar size={12} /> Próxima Sessão
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-1.5 bg-white text-emerald-700 font-medium border border-emerald-200 rounded-md text-sm focus:border-emerald-500 outline-none"
                  value={formData.nextSessionDate || ''}
                  onChange={e => setFormData({...formData, nextSessionDate: e.target.value})}
                />
              </div>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-2 transition-colors shadow-lg shadow-emerald-500/20 font-medium"
            >
              <Save size={18} /> Salvar Paciente
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};