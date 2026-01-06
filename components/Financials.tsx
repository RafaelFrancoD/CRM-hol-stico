import React, { useState, useEffect } from 'react';
import { Transaction, Patient, PaymentReceipt } from '../types';
import { apiService, API_BASE_URL } from '../services/apiService'; // Alterado
import { Plus, ArrowUpCircle, ArrowDownCircle, Trash2, CheckCircle, Search, FileText, Send, X, Clock, Edit, CheckCircle2, Download, UploadCloud } from 'lucide-react';

export const Financials: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  
  // Form State
  const [desc, setDesc] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'income' | 'expense' | 'receivable'>('income');
  const [category, setCategory] = useState('Consulta');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  // Filter State
  const [filterName, setFilterName] = useState('');
  const [filterMonth, setFilterMonth] = useState(new Date().toISOString().slice(0, 7));
  
  // Modal State
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportPatientId, setReportPatientId] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [t, p] = await Promise.all([
        apiService.getItems<Transaction>('finance'),
        apiService.getItems<Patient>('patients')
      ]);
      setTransactions(t.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setPatients(p);
    } catch (error) {
      console.error("Falha ao carregar dados financeiros:", error);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !desc) return;
    const patient = patients.find(p => p.id === selectedPatientId);
    const newTransactionData = {
      description: desc,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toISOString(),
      status: type === 'receivable' ? 'pending' : 'paid',
      patientId: selectedPatientId || undefined,
      patientName: patient?.name || undefined,
      invoiceEmitted: false
    };
    await apiService.createItem('finance', newTransactionData);
    setDesc('');
    setAmount('');
    setSelectedPatientId('');
    setType('income');
    setCategory('Consulta');
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Deletar transação?')) {
      await apiService.deleteItem('finance', id);
      loadData();
    }
  };

  const toggleInvoice = async (t: Transaction) => {
      const updated = { ...t, invoiceEmitted: !t.invoiceEmitted };
      await apiService.updateItem('finance', t.id, updated);
      loadData();
  };

  const sendInvoice = (t: Transaction) => {
      const p = patients.find(pat => pat.id === t.patientId);
      if(!p) {
          alert("Esta transação não está vinculada a um paciente cadastrado.");
          return;
      }
      const msg = `Olá ${p.name}, segue a nota fiscal referente à ${t.description}.`;
      const link = `https://wa.me/${p.phone.replace(/\D/g, '')}?text=${encodeURIComponent(msg)}`;
      window.open(link, '_blank');
  };
  
  const handleOpenEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setReceiptFile(null); // Limpa o arquivo ao abrir
    setShowEditModal(true);
  };

  const handleUpdateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTransaction) return;
    setIsUploading(true);

    try {
      let updatedTransaction = { ...editingTransaction };

      // Se um novo arquivo de recibo foi selecionado
      if (receiptFile) {
        const uploadResult = await apiService.uploadFile(receiptFile);
        updatedTransaction.paymentReceipt = {
          name: receiptFile.name,
          type: receiptFile.type,
          filePath: uploadResult.filePath,
        };
        // Ao anexar comprovante, a transação vira uma receita paga
        updatedTransaction.type = 'income';
        updatedTransaction.status = 'paid';
      }

      const patient = patients.find(p => p.id === updatedTransaction.patientId);
      updatedTransaction.patientName = patient?.name || undefined;
      updatedTransaction.amount = Number(updatedTransaction.amount);

      await apiService.updateItem('finance', editingTransaction.id, updatedTransaction);
      
      setShowEditModal(false);
      setEditingTransaction(null);
      loadData();
    } catch (error) {
      console.error("Falha ao atualizar transação:", error);
      alert("Não foi possível atualizar a transação.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmPayment = (transaction: Transaction) => {
    if (transaction.type !== 'receivable') return;
    handleOpenEditModal(transaction);
  };

  const handleDownloadReceipt = (receipt: PaymentReceipt) => {
    const url = `${API_BASE_URL}${receipt.filePath}`;
    window.open(url, '_blank');
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

  const filteredTransactions = transactions.filter(t => {
      const matchesName = filterName === '' || 
          t.description.toLowerCase().includes(filterName.toLowerCase()) || 
          (t.patientName && t.patientName.toLowerCase().includes(filterName.toLowerCase()));
      const matchesMonth = t.date.startsWith(filterMonth);
      return matchesName && matchesMonth;
  });

  const balance = filteredTransactions.reduce((acc, t) => {
      if (t.type === 'income') return acc + t.amount;
      if (t.type === 'expense') return acc - t.amount;
      return acc;
  }, 0);

  const totalReceivable = filteredTransactions
      .filter(t => t.type === 'receivable')
      .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Controle Financeiro</h2>
        <div className="flex flex-wrap gap-4 items-center justify-center md:justify-end">
            <button onClick={() => setShowReportModal(true)} className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 font-medium px-4 py-2 border border-slate-200 rounded-lg hover:bg-emerald-50 bg-white shadow-sm"><FileText size={18} /> Relatório por Cliente</button>
            <div className="flex gap-2">
                {totalReceivable > 0 && (<div className="flex flex-col px-4 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700"><span className="text-xs font-medium uppercase opacity-70">A Receber</span><span className="font-bold text-lg">R$ {totalReceivable.toFixed(2)}</span></div>)}
                <div className={`flex flex-col px-4 py-1 rounded-lg border ${balance >= 0 ? 'bg-emerald-100 border-emerald-200 text-emerald-700' : 'bg-red-100 border-red-200 text-red-700'}`}><span className="text-xs font-medium uppercase opacity-70">Saldo (Caixa)</span><span className="font-bold text-lg">R$ {balance.toFixed(2)}</span></div>
            </div>
        </div>
      </div>
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="font-semibold mb-4 text-slate-700">Nova Transação Manual</h3>
        <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 items-end">
          <div className="w-full md:w-48">
             <label className="block text-xs font-medium text-slate-500 mb-1">Vincular Paciente (Opcional)</label>
             <select className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500" value={selectedPatientId} onChange={e => setSelectedPatientId(e.target.value)}><option value="">-- Avulso --</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
          </div>
          <div className="flex-1 w-full"><label className="block text-xs font-medium text-slate-500 mb-1">Descrição</label><input type="text" value={desc} onChange={e => setDesc(e.target.value)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="Ex: Sessão Terapia" required /></div>
          <div className="w-full md:w-32"><label className="block text-xs font-medium text-slate-500 mb-1">Valor (R$)</label><input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" placeholder="0.00" required /></div>
          <div className="w-full md:w-32"><label className="block text-xs font-medium text-slate-500 mb-1">Tipo</label><select value={type} onChange={e => setType(e.target.value as any)} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"><option value="income">Receita</option><option value="expense">Despesa</option><option value="receivable">Valor a receber</option></select></div>
          <button type="submit" className="w-full md:w-auto px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-md transition-colors font-medium"><Plus size={18} /> Adicionar</button>
        </form>
      </div>
      <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={18} /><input type="text" placeholder="Filtrar por nome do cliente ou descrição..." className="w-full pl-10 pr-4 py-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" value={filterName} onChange={e => setFilterName(e.target.value)} /></div>
          <div><input type="month" className="w-full sm:w-auto px-3 py-2 bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500 text-slate-700" value={filterMonth} onChange={e => setFilterMonth(e.target.value)} /></div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-600 text-sm"><tr><th className="px-6 py-3">Data</th><th className="px-6 py-3">Descrição / Paciente</th><th className="px-6 py-3">Categoria</th><th className="px-6 py-3">Valor</th><th className="px-6 py-3 text-center">Nota Fiscal</th><th className="px-6 py-3 text-center">Comprovante</th><th className="px-6 py-3 text-right">Ações</th></tr></thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(t => (
                <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-3 text-sm text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3 font-medium text-slate-800">{t.description}{t.patientName && <span className="block text-xs text-slate-400 font-normal">{t.patientName}</span>}</td>
                  <td className="px-6 py-3 text-sm text-slate-500">{t.category}</td>
                  <td className="px-6 py-3 font-medium">
                    <div className={`flex items-center gap-1 ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                      {t.type === 'income' && <ArrowUpCircle size={14} />}{t.type === 'expense' && <ArrowDownCircle size={14} />}{t.type === 'receivable' && <Clock size={14} />} R$ {t.amount.toFixed(2)}
                      {t.type === 'receivable' && (<button onClick={() => handleConfirmPayment(t)} className="ml-2 text-slate-400 hover:text-emerald-500 transition-colors" title="Confirmar Recebimento"><CheckCircle2 size={16} /></button>)}
                    </div>
                  </td>
                  <td className="px-6 py-3 text-center">{t.type === 'income' && (<div className="flex items-center justify-center gap-2"><input type="checkbox" checked={t.invoiceEmitted || false} onChange={() => toggleInvoice(t)} className="w-4 h-4 text-emerald-600 rounded cursor-pointer" title="Marcar como emitida" />{t.patientId && (<button onClick={() => sendInvoice(t)} className="text-slate-400 hover:text-green-600" title="Enviar via WhatsApp"><Send size={14} /></button>)}</div>)}{t.type === 'receivable' && <span className="text-xs text-blue-400 bg-blue-50 px-2 py-1 rounded">Pendente</span>}</td>
                  <td className="px-6 py-3 text-center">{t.paymentReceipt ? (<button onClick={() => handleDownloadReceipt(t.paymentReceipt!)} className="text-emerald-600 hover:text-emerald-800" title={`Baixar ${t.paymentReceipt.name}`}><Download size={16} /></button>) : (<span className="text-slate-300">-</span>)}</td>
                  <td className="px-6 py-3 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => handleOpenEditModal(t)} className="text-slate-400 hover:text-blue-500" title="Editar"><Edit size={16} /></button><button onClick={() => handleDelete(t.id)} className="text-slate-400 hover:text-red-500" title="Excluir"><Trash2 size={16} /></button></div></td>
                </tr>))}
            </tbody>
          </table>
        </div>
      </div>
      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm" onClick={() => setShowReportModal(false)}>
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl p-6 animate-in fade-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-800">Relatório por Cliente</h3>
              <button onClick={() => setShowReportModal(false)} className="text-slate-400 hover:text-slate-600">
                <X size={24} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Selecione o Cliente</label>
                <select
                  className="w-full px-4 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"
                  value={reportPatientId}
                  onChange={(e) => setReportPatientId(e.target.value)}
                >
                  <option value="">-- Selecione um paciente --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              {reportPatientId && (
                <div className="mt-6 border-t pt-4">
                  <h4 className="font-semibold text-slate-700 mb-4">Transações do Cliente</h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {transactions
                      .filter(t => t.patientId === reportPatientId)
                      .map(t => (
                        <div key={t.id} className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                          <div>
                            <p className="font-medium text-slate-800">{t.description}</p>
                            <p className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</p>
                          </div>
                          <div className={`font-bold ${t.type === 'income' ? 'text-emerald-600' : t.type === 'expense' ? 'text-red-500' : 'text-blue-500'}`}>
                            R$ {t.amount.toFixed(2)}
                          </div>
                        </div>
                      ))}
                    {transactions.filter(t => t.patientId === reportPatientId).length === 0 && (
                      <p className="text-center text-slate-400 py-8">Nenhuma transação encontrada para este cliente.</p>
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-700">Total:</span>
                      <span className="font-bold text-xl text-emerald-600">
                        R$ {transactions
                          .filter(t => t.patientId === reportPatientId && t.type === 'income')
                          .reduce((acc, t) => acc + t.amount, 0)
                          .toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-6 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditModal && editingTransaction && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex justify-between items-center mb-6"><h3 className="text-xl font-bold text-slate-800">Editar Transação</h3><button onClick={() => setShowEditModal(false)}><X className="text-slate-400 hover:text-slate-600" /></button></div>
                <form onSubmit={handleUpdateTransaction}><div className="space-y-4">
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label><input type="text" value={editingTransaction.description} onChange={e => setEditingTransaction({ ...editingTransaction, description: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" required /></div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label><input type="number" step="0.01" value={editingTransaction.amount} onChange={e => setEditingTransaction({ ...editingTransaction, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" required /></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Data</label><input type="date" value={editingTransaction.date.split('T')[0]} onChange={e => setEditingTransaction({ ...editingTransaction, date: new Date(e.target.value + 'T12:00:00').toISOString() })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" required /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Tipo</label><select value={editingTransaction.type} onChange={e => setEditingTransaction({ ...editingTransaction, type: e.target.value as any, status: e.target.value === 'receivable' ? 'pending' : 'paid' })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500"><option value="income">Receita</option><option value="expense">Despesa</option><option value="receivable">Valor a receber</option></select></div>
                            <div><label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label><input type="text" value={editingTransaction.category} onChange={e => setEditingTransaction({ ...editingTransaction, category: e.target.value })} className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-500" required /></div>
                        </div>
                        <div><label className="block text-sm font-medium text-slate-700 mb-1">Vincular Paciente (Opcional)</label><select className="w-full px-3 py-2 bg-white text-slate-900 border border-slate-300 rounded-lg outline-none text-sm focus:ring-2 focus:ring-emerald-500" value={editingTransaction.patientId || ''} onChange={e => setEditingTransaction({ ...editingTransaction, patientId: e.target.value || undefined })}><option value="">-- Avulso --</option>{patients.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
                        
                        {/* Campo de Upload de Comprovante */}
                        <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                          <label className="block text-sm font-medium text-amber-900 mb-2 flex items-center gap-2"><UploadCloud size={16}/> Anexar Comprovante</label>
                          {editingTransaction.paymentReceipt && !receiptFile ? (
                              <div className="flex items-center justify-between bg-white p-2 rounded-md border border-amber-200 text-sm">
                                <p className="text-slate-700 truncate">{editingTransaction.paymentReceipt.name}</p>
                                <button type="button" onClick={() => setEditingTransaction({...editingTransaction, paymentReceipt: undefined})} className="text-red-500 hover:text-red-700 text-xs font-bold">Remover</button>
                              </div>
                          ) : (
                            <>
                              <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-100 file:text-amber-700 hover:file:bg-amber-200"/>
                              {receiptFile && <p className="text-xs text-slate-500 mt-1">Novo: {receiptFile.name}</p>}
                            </>
                          )}
                        </div>

                    </div><div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancelar</button><button type="submit" disabled={isUploading} className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50">{isUploading ? 'Salvando...' : 'Salvar Alterações'}</button></div></form>
            </div>
        </div>)}
    </div>
  );
};