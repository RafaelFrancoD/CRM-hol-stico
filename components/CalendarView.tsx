import React, { useState, useEffect } from 'react';
import { Appointment, Patient, Transaction } from '../types';
import { apiService, API_BASE_URL } from '../services/apiService'; // Alterado
import { ChevronLeft, ChevronRight, Plus, Clock, Calendar as CalendarIcon, X, Repeat, CheckCircle2, AlertCircle, Infinity as InfinityIcon, Hash, DollarSign, Trash2, Layers, UploadCloud } from 'lucide-react';

export const CalendarView: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showModal, setShowModal] = useState(false);
  
  const [editingRecurrenceId, setEditingRecurrenceId] = useState<string | undefined>(undefined);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newAppt, setNewAppt] = useState({
    id: '', 
    patientId: '',
    date: new Date().toISOString().split('T')[0],
    time: '',
    notes: '',
    value: 150,
    recurrence: 'none' as 'none' | 'daily' | 'weekly' | 'biweekly' | 'monthly',
    recurrenceEndMode: 'count' as 'count' | 'never',
    recurrenceCount: 4,
    confirmed: false
  });

  useEffect(() => {
    loadData();
  }, [currentDate]);

  const loadData = async () => {
    try {
      const [appts, pts] = await Promise.all([
        apiService.getItems<Appointment>('appointments'),
        apiService.getItems<Patient>('patients')
      ]);
      setAppointments(appts);
      setPatients(pts);
    } catch (error) {
      console.error("Falha ao carregar dados da agenda:", error);
    }
  };

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const padding = Array.from({ length: firstDay }, (_, i) => i);

  const changeMonth = (offset: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAppt.time || !newAppt.patientId) return;
    setIsUploading(true);

    const patient = patients.find(p => p.id === newAppt.patientId);
    if (!patient) {
      setIsUploading(false);
      return;
    }

    try {
      let receiptPath: string | undefined = undefined;
      if (receiptFile) {
        const uploadResult = await apiService.uploadFile(receiptFile);
        receiptPath = uploadResult.filePath;
      }

      if (newAppt.id) {
        const allTrans = await apiService.getItems<Transaction>('finance');
        const linkedTrans = allTrans.find(t => t.appointmentId === newAppt.id);
        if (linkedTrans) await apiService.deleteItem('finance', linkedTrans.id);
        await apiService.deleteItem('appointments', newAppt.id);
      }

      const createAppointmentPayload = (dateStr: string, timeStr: string, recurrenceGroup?: string) => {
          const start = new Date(`${dateStr}T${timeStr}`);
          const end = new Date(start.getTime() + 60 * 60 * 1000);
          return {
              patientId: patient.id,
              patientName: patient.name,
              start: start.toISOString(),
              end: end.toISOString(),
              notes: newAppt.notes,
              confirmed: newAppt.confirmed,
              value: Number(newAppt.value),
              recurrenceId: recurrenceGroup
          };
      };

      const recurrenceGroupId = newAppt.recurrence !== 'none' && !newAppt.id ? crypto.randomUUID() : undefined;
      let occurrences = 1;
      if (!newAppt.id && newAppt.recurrence !== 'none') {
        occurrences = newAppt.recurrenceEndMode === 'count' ? Math.max(1, newAppt.recurrenceCount) : 12;
      }

      let currentApptDate = new Date(`${newAppt.date}T12:00:00`);
      for (let i = 0; i < occurrences; i++) {
        const dateIso = currentApptDate.toISOString().split('T')[0];
        const groupToUse = newAppt.id ? editingRecurrenceId : recurrenceGroupId;
        const payload = createAppointmentPayload(dateIso, newAppt.time, groupToUse);
        
        const savedAppt = await apiService.createItem<Appointment>('appointments', payload);

        if (savedAppt.confirmed) {
          const transactionData: any = {
              appointmentId: savedAppt.id,
              description: `Sessão: ${savedAppt.patientName}`,
              amount: savedAppt.value || 0,
              category: 'Consulta',
              date: savedAppt.start,
              patientId: savedAppt.patientId,
              patientName: savedAppt.patientName,
              invoiceEmitted: false,
              type: receiptPath ? 'income' : 'receivable',
              status: receiptPath ? 'paid' : 'pending',
          };
          if (receiptPath && receiptFile) {
            transactionData.paymentReceipt = {
              name: receiptFile.name,
              type: receiptFile.type,
              filePath: receiptPath,
            };
          }
          await apiService.createItem('finance', transactionData);
        }

        if (newAppt.recurrence === 'daily') currentApptDate.setDate(currentApptDate.getDate() + 1);
        if (newAppt.recurrence === 'weekly') currentApptDate.setDate(currentApptDate.getDate() + 7);
        if (newAppt.recurrence === 'biweekly') currentApptDate.setDate(currentApptDate.getDate() + 14);
        if (newAppt.recurrence === 'monthly') currentApptDate.setMonth(currentApptDate.getMonth() + 1);
      }

      setShowModal(false);
      loadData();
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar agendamento:", error);
      alert("Não foi possível salvar o agendamento.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setNewAppt({ id: '', patientId: '', date: new Date().toISOString().split('T')[0], time: '', notes: '', value: 150, recurrence: 'none', recurrenceEndMode: 'count', recurrenceCount: 4, confirmed: false });
    setEditingRecurrenceId(undefined);
    setReceiptFile(null);
  };

  const openNewModal = (dateStr?: string) => {
      resetForm();
      if(dateStr) setNewAppt(prev => ({ ...prev, date: dateStr }));
      setShowModal(true);
  };

  const openEditModal = async (appt: Appointment) => {
      const d = new Date(appt.start);
      const dateStr = d.toISOString().split('T')[0];
      const timeStr = d.toTimeString().slice(0, 5);
      resetForm();
      setNewAppt({ id: appt.id, patientId: appt.patientId, date: dateStr, time: timeStr, notes: appt.notes || '', value: appt.value || 150, recurrence: 'none', recurrenceEndMode: 'count', recurrenceCount: 4, confirmed: appt.confirmed || false });
      setEditingRecurrenceId(appt.recurrenceId);
      setShowModal(true);
  };

  const handleDelete = async (mode: 'single' | 'sequence') => {
      if (!newAppt.id) return;
      if (confirm(mode === 'single' ? "Excluir apenas esta sessão?" : "Isso excluirá esta sessão e todas as futuras desta série. Confirmar?")) {
        try {
          const allTrans = await apiService.getItems<Transaction>('finance');
          if (mode === 'single') {
              const linkedTrans = allTrans.find(t => t.appointmentId === newAppt.id);
              if (linkedTrans) await apiService.deleteItem('finance', linkedTrans.id);
              await apiService.deleteItem('appointments', newAppt.id);
          } else {
              const currentAppt = appointments.find(a => a.id === newAppt.id);
              if (currentAppt && currentAppt.recurrenceId) {
                  const apptsToDelete = appointments.filter(a => a.recurrenceId === currentAppt.recurrenceId && new Date(a.start) >= new Date(currentAppt.start));
                  for (const a of apptsToDelete) {
                      const linkedTrans = allTrans.find(t => t.appointmentId === a.id);
                      if (linkedTrans) await apiService.deleteItem('finance', linkedTrans.id);
                      await apiService.deleteItem('appointments', a.id);
                  }
              } else {
                  const linkedTrans = allTrans.find(t => t.appointmentId === newAppt.id);
                  if (linkedTrans) await apiService.deleteItem('finance', linkedTrans.id);
                  await apiService.deleteItem('appointments', newAppt.id);
              }
          }
          setShowModal(false);
          loadData();
        } catch (error) {
          console.error("Erro ao deletar agendamento:", error);
          alert("Não foi possível deletar o agendamento.");
        }
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Arquivo muito grande! Máximo 5MB.");
        return;
      }
      setReceiptFile(file);
    }
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
        <div className="flex items-center gap-4">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 capitalize flex items-center gap-2">
            <CalendarIcon className="text-emerald-600" />
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h2>
          <div className="flex gap-1 bg-white border border-slate-200 rounded-lg p-1">
            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronLeft size={20} /></button>
            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-100 rounded text-slate-600"><ChevronRight size={20} /></button>
          </div>
        </div>
        <button onClick={() => openNewModal()} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg hidden md:flex items-center gap-2 shadow-sm"><Plus size={18} /> Novo Agendamento</button>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col overflow-hidden">
        <div className="grid grid-cols-7 border-b border-slate-200 text-center py-3 bg-slate-50 font-semibold text-slate-600 text-xs md:text-sm">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="grid grid-cols-7 flex-1 overflow-y-auto">
          {padding.map(i => <div key={`pad-${i}`} className="bg-slate-50/30 border-r border-b border-slate-100" />)}
          {days.map(day => {
             const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
             const dayAppts = appointments.filter(a => a.start.startsWith(dateString)).sort((a, b) => a.start.localeCompare(b.start));
             return (
              <div key={day} onClick={() => openNewModal(dateString)} className={`border-r border-b border-slate-100 p-1 md:p-2 min-h-[90px] md:min-h-[120px] transition-colors cursor-pointer group relative hover:bg-slate-50`}>
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-sm font-bold w-7 h-7 flex items-center justify-center rounded-full ${dateString === new Date().toISOString().split('T')[0] ? 'bg-slate-900 text-white' : 'text-slate-700'}`}>{day}</span>
                  {dayAppts.length > 0 && <span className="text-[10px] text-slate-400 font-medium hidden sm:block">{dayAppts.length} sessões</span>}
                </div>
                <div className="space-y-1">
                  {dayAppts.map(appt => {
                      const time = new Date(appt.start).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                      return (<div key={appt.id} onClick={async (e) => { e.stopPropagation(); await openEditModal(appt); }} className={`text-xs p-1.5 rounded border flex items-center justify-between gap-1 shadow-sm transition-all hover:scale-[1.02] ${appt.confirmed ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-white border-slate-200 text-slate-700'}`}>
                            <span className="truncate font-medium">{time} - {appt.patientName.split(' ')[0]}</span>
                            <div className={`p-0.5 rounded-full ${appt.confirmed ? 'text-emerald-600' : 'text-slate-300'}`} title={appt.confirmed ? "Confirmado" : "Não Confirmado"}><CheckCircle2 size={12} /></div>
                        </div>);
                  })}
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none"><Plus className="text-emerald-600 bg-white/80 rounded-full p-1 w-8 h-8 shadow-sm" /></div>
              </div>);
          })}
        </div>
      </div>

      <button onClick={() => openNewModal()} className="md:hidden fixed bottom-6 right-6 bg-emerald-600 text-white p-4 rounded-full shadow-lg hover:bg-emerald-700 active:scale-95 transition-transform z-20">
        <Plus size={24} />
      </button>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-900 p-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-bold text-lg flex items-center gap-2"><Clock size={20} /> {newAppt.id ? 'Editar Sessão' : 'Novo Agendamento'}</h3>
              <button onClick={() => setShowModal(false)} className="hover:bg-slate-700 p-1 rounded transition-colors"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Paciente</label>
                    <select required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={newAppt.patientId} onChange={e => setNewAppt({...newAppt, patientId: e.target.value})}><option value="">Selecione o paciente...</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">Data</label><div className="relative"><input type="date" required className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} /></div></div>
                      <div className="sm:col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">Horário</label><div className="relative"><Clock size={14} className="absolute left-2.5 top-3 text-slate-400 pointer-events-none" /><input type="time" required className="w-full pl-8 pr-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} /></div></div>
                      <div className="sm:col-span-1"><label className="block text-sm font-medium text-slate-700 mb-1">Valor Sessão</label><div className="relative"><input type="number" required min="0" className="w-full px-3 py-2 pl-8 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none" value={newAppt.value} onChange={e => setNewAppt({...newAppt, value: parseFloat(e.target.value)})} /><DollarSign className="absolute left-2.5 top-2.5 text-slate-400 pointer-events-none" size={14} /></div></div>
                  </div>
                  {!newAppt.id && (<div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">...</div>)}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50" onClick={() => setNewAppt({...newAppt, confirmed: !newAppt.confirmed})}><div className={`w-5 h-5 rounded border flex items-center justify-center ${newAppt.confirmed ? 'bg-emerald-500 border-emerald-500' : 'bg-white border-slate-300'}`}>{newAppt.confirmed && <CheckCircle2 size={14} className="text-white" />}</div><span className="text-sm text-slate-700">Paciente confirmou presença (gera cobrança)</span></div>
                    {newAppt.confirmed && (
                      <div className="bg-amber-50 p-4 rounded-lg border border-amber-200 animate-in fade-in">
                          <label className="block text-sm font-medium text-amber-900 mb-2 flex items-center gap-2"><UploadCloud size={16}/> Anexar Comprovante (Opcional)</label>
                          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200" />
                          {receiptFile && <p className="text-xs text-slate-500 mt-1">Novo: {receiptFile.name}</p>}
                      </div>
                    )}
                  </div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Notas (Opcional)</label><textarea className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none h-20 resize-none" value={newAppt.notes} onChange={e => setNewAppt({...newAppt, notes: e.target.value})} placeholder="Ex: Primeira consulta, trazer exames..."></textarea></div>
              </div>
              <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
                {newAppt.id ? (<div className="flex flex-col sm:flex-row gap-2"><button type="button" onClick={() => handleDelete('single')} className="text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"><Trash2 size={14} /> Excluir Esta</button><button type="button" onClick={() => handleDelete('sequence')} disabled={!editingRecurrenceId} title={!editingRecurrenceId ? "Apenas para sessões recorrentes" : "Excluir esta e todas as futuras sessões da série"} className="text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors border border-red-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-50 disabled:hover:text-red-600"><Layers size={14} /> Excluir Esta e Futuras</button></div>) : <div></div>}
                <div className="flex gap-3">
                    <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Cancelar</button>
                    <button type="submit" disabled={isUploading || !newAppt.time || !newAppt.patientId} className="px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium">{isUploading ? 'Salvando...' : 'Salvar'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};