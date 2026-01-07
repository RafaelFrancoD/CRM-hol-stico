import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { LayoutDashboard, Users, Kanban as KanbanIcon, Calendar, DollarSign, Bot, MessageSquare, Target, FileText, Menu, Eye, EyeOff, LogOut, ShieldCheck, ClipboardList, X } from 'lucide-react';
import { View, Patient, Transaction, PatientStatus, Appointment } from './types';
import { apiService } from './services/apiService'; // Alterado
import { Login } from './components/Login';

// Lazy loading dos componentes para melhor performance
const Dashboard = lazy(() => import('./components/Dashboard').then(m => ({ default: m.Dashboard })));
const PatientList = lazy(() => import('./components/PatientList').then(m => ({ default: m.PatientList })));
const PatientModal = lazy(() => import('./components/PatientModal').then(m => ({ default: m.PatientModal })));
const Kanban = lazy(() => import('./components/Kanban').then(m => ({ default: m.Kanban })));
const AIAssistant = lazy(() => import('./components/AIAssistant').then(m => ({ default: m.AIAssistant })));
const CalendarView = lazy(() => import('./components/CalendarView').then(m => ({ default: m.CalendarView })));
const Financials = lazy(() => import('./components/Financials').then(m => ({ default: m.Financials })));
const LeadFinder = lazy(() => import('./components/LeadFinder').then(m => ({ default: m.LeadFinder })));
const DocumentManager = lazy(() => import('./components/DocumentManager').then(m => ({ default: m.DocumentManager })));
const MassMessaging = lazy(() => import('./components/MassMessaging').then(m => ({ default: m.MassMessaging })));
const TemplateManager = lazy(() => import('./components/TemplateManager').then(m => ({ default: m.TemplateManager })));

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [isPrivacyMode, setIsPrivacyMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  const [isLoading, setIsLoading] = useState(true);
  
  // Data State
  const [patients, setPatients] = useState<Patient[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [p, t] = await Promise.all([
        apiService.getItems<Patient>('patients'),
        apiService.getItems<Transaction>('finance')
      ]);
      setPatients(p);
      setTransactions(t);
    } catch (e) {
      console.error("Falha ao carregar dados da API", e);
      // Se falhar (ex: token expirado), desloga o usuário
      handleLogout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) setIsSidebarOpen(false);
      else setIsSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verifica se o cookie de sessão é válido no backend
        await apiService.getCurrentUser();
        setIsAuthenticated(true);
        await loadData();
      } catch (error) {
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, [loadData]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    loadData();
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setIsAuthenticated(false);
      setPatients([]);
      setTransactions([]);
    }
  };

  const updatePatientStatus = async (id: string, status: PatientStatus) => {
    try {
      const patient = patients.find(p => p.id === id);
      if (patient) {
        await apiService.updateItem('patients', id, { status });
        await loadData();
      }
    } catch (error) {
      console.error("Falha ao atualizar status do paciente:", error);
      alert("Não foi possível atualizar o status. Verifique o console para detalhes.");
    }
  };

  const deletePatient = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este paciente? Esta ação é IRREVERSÍVEL e removerá também todos os agendamentos e transações financeiras vinculados a ele.')) {
      try {
        setIsLoading(true);
        // A lógica de cascata agora chama a API para cada item
        const allAppointments = await apiService.getItems<Appointment>('appointments');
        const allTransactions = await apiService.getItems<Transaction>('finance');
  
        const appointmentsToDelete = allAppointments.filter(a => a.patientId === id);
        const transactionsToDelete = allTransactions.filter(t => t.patientId === id);
  
        const deletePromises = [];
        for (const appt of appointmentsToDelete) {
          deletePromises.push(apiService.deleteItem('appointments', appt.id));
        }
        for (const trans of transactionsToDelete) {
          deletePromises.push(apiService.deleteItem('finance', trans.id));
        }
        deletePromises.push(apiService.deleteItem('patients', id));
  
        await Promise.all(deletePromises);
        await loadData();
      } catch (error) {
        console.error("Falha ao excluir paciente e seus dados:", error);
        alert("Não foi possível excluir o paciente. Verifique o console para mais detalhes.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenModal = (patient?: Patient) => {
    setEditingPatient(patient || null);
    setIsModalOpen(true);
  };

  const handleSavePatient = async (patientData: Partial<Patient>) => {
    try {
      if (editingPatient) {
        await apiService.updateItem('patients', editingPatient.id, patientData);
      } else {
        await apiService.createItem('patients', patientData);
      }
      await loadData();
    } catch (error) {
      console.error("Falha ao salvar paciente:", error);
      alert("Não foi possível salvar os dados do paciente. Verifique o console para detalhes.");
    }
  };

  const handleSetView = (view: View) => {
    setCurrentView(view);
    if (window.innerWidth <= 768) {
      setIsSidebarOpen(false);
    }
  };

  if (isLoading) {
    return <div className="flex h-screen w-full items-center justify-center text-slate-500">Carregando CRM...</div>;
  }
  
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const menuItems = [
    { id: View.DASHBOARD, label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { id: View.PATIENTS, label: 'Pacientes', icon: <Users size={20} /> },
    { id: View.KANBAN, label: 'Fluxo (Kanban)', icon: <KanbanIcon size={20} /> },
    { id: View.CALENDAR, label: 'Agenda', icon: <Calendar size={20} /> },
    { id: View.FINANCIALS, label: 'Financeiro', icon: <DollarSign size={20} /> },
    { id: View.AI_ASSISTANT, label: 'Assistente IA', icon: <Bot size={20} /> },
    { id: View.MASS_MESSAGING, label: 'Mensagens', icon: <MessageSquare size={20} /> },
    { id: View.TEMPLATES, label: 'Modelos de Mensagem', icon: <ClipboardList size={20} /> },
    { id: View.LEAD_FINDER, label: 'Marketing', icon: <Target size={20} /> },
    { id: View.DOCUMENTS, label: 'Documentos', icon: <FileText size={20} /> },
  ];

  const renderContent = () => {
    if (isLoading && !patients.length) {
      return <div className="p-6 text-center">Carregando dados...</div>;
    }
    return (
      <Suspense fallback={<div className="p-6 text-center flex items-center justify-center min-h-[400px]"><div className="animate-pulse text-slate-600">Carregando...</div></div>}>
        {(() => {
          switch (currentView) {
            case View.DASHBOARD: return <Dashboard patients={patients} transactions={transactions} />;
            case View.PATIENTS: return <PatientList patients={patients} onAdd={() => handleOpenModal()} onEdit={(p) => handleOpenModal(p)} onDelete={deletePatient} isPrivacyMode={isPrivacyMode} />;
            case View.KANBAN: return <Kanban patients={patients} onUpdateStatus={updatePatientStatus} />;
            case View.AI_ASSISTANT: return <AIAssistant patients={patients} />;
            case View.CALENDAR: return <CalendarView />;
            case View.FINANCIALS: return <Financials />;
            case View.LEAD_FINDER: return <LeadFinder />;
            case View.DOCUMENTS: return <DocumentManager />;
            case View.MASS_MESSAGING: return <MassMessaging />;
            case View.TEMPLATES: return <TemplateManager />;
            default: return <Dashboard patients={patients} transactions={transactions} />;
          }
        })()}
      </Suspense>
    );
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-20 md:hidden"></div>}
      {/* Sidebar */}
      <aside className={`fixed md:relative inset-y-0 left-0 z-30 bg-white border-r border-slate-200 transition-all duration-300 flex flex-col ${isSidebarOpen ? 'w-64 translate-x-0' : '-translate-x-full w-64 md:translate-x-0 md:w-20'}`}>
        <div className="p-4 flex items-center justify-between border-b border-slate-100 h-16">
          {isSidebarOpen && <span className="font-bold text-emerald-700 truncate">Terapia Holística</span>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            {isSidebarOpen ? <X size={20} className="md:hidden" /> : <Menu size={20}/> }
            <Menu size={20} className="hidden md:block" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => handleSetView(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                currentView === item.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={currentView === item.id ? 'text-emerald-600' : 'text-slate-400'}>{item.icon}</span>
              {isSidebarOpen && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
           {isSidebarOpen && (
             <div className="flex items-center gap-2 text-[10px] text-emerald-600 bg-emerald-50 p-2 rounded mb-2">
               <ShieldCheck size={12} /> Conexão segura com o servidor
             </div>
           )}
           <button 
             onClick={() => setIsPrivacyMode(!isPrivacyMode)}
             className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-slate-600 hover:bg-slate-50`}
             title={isPrivacyMode ? "Desativar Modo Privacidade" : "Ativar Modo Privacidade"}
           >
             {isPrivacyMode ? <EyeOff size={20} className="text-purple-500" /> : <Eye size={20} />}
             {isSidebarOpen && <span className="text-sm">Privacidade</span>}
           </button>
           <button 
             onClick={handleLogout}
             className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-red-600 hover:bg-red-50"
           >
             <LogOut size={20} />
             {isSidebarOpen && <span className="text-sm">Sair</span>}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className={`flex-1 transition-all duration-300 md:ml-0`}>
        <header className="bg-white h-16 border-b border-slate-200 flex items-center justify-between px-4 md:px-6 sticky top-0 z-10 shadow-sm">
           <div className="flex items-center gap-2">
             <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 md:hidden">
                <Menu size={20} />
             </button>
             <h1 className="text-lg font-semibold text-slate-800">
               {menuItems.find(i => i.id === currentView)?.label}
             </h1>
           </div>
           <div className="flex items-center gap-4">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-medium text-slate-700">Dra. Mirelli Silva</p>
                <p className="text-xs text-slate-400">Terapeuta Holística</p>
              </div>
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 font-bold shrink-0">MS</div>
           </div>
        </header>
        <div className="p-0 md:p-2">
          {renderContent()}
        </div>
      </main>

      {/* Modals */}
      {isModalOpen && (
        <Suspense fallback={null}>
          <PatientModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSavePatient}
            patient={editingPatient}
          />
        </Suspense>
      )}
    </div>
  );
};

export default App;