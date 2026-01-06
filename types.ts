
export enum PatientStatus {
  NEW = 'Novos Contatos',
  ANAMNESIS = 'Anamnese',
  TREATMENT = 'Em Tratamento',
  MAINTENANCE = 'Manutenção',
  ARCHIVED = 'Arquivado'
}

export interface ClinicalNote {
  id: string;
  date: string;
  content: string;
}

export interface Patient {
  id:string;
  name: string;
  email: string;
  phone: string;
  status: PatientStatus;
  
  // Dados Pessoais Estendidos
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;

  // Dados do Responsável (para menores)
  guardianName?: string;
  guardianCpf?: string;
  guardianRg?: string;
  guardianBirthDate?: string;

  lastSessionDate?: string;
  nextSessionDate?: string;
  lgpdConsent: boolean;
  notes?: string;
  clinicalHistory: ClinicalNote[];
  createdAt: string;
}

export interface PaymentReceipt {
  name: string;
  type: string;
  filePath: string; // Alterado de 'data' para 'filePath'
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense' | 'receivable'; 
  date: string;
  status: 'paid' | 'pending';
  category: string;
  
  // Novos campos Financeiros
  patientId?: string;       // Vínculo com paciente para relatório
  patientName?: string;     // Cache do nome para facilidade
  invoiceEmitted?: boolean; // Nota Fiscal emitida?
  appointmentId?: string;   // Vínculo automático com a Agenda
  paymentReceipt?: PaymentReceipt; // Comprovante de pagamento
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  start: string; // ISO string (Data + Hora)
  end: string;   // ISO string
  notes?: string;
  
  // Novos campos de Agenda
  confirmed?: boolean; // Se o cliente confirmou via WhatsApp
  recurrenceId?: string; // ID para agrupar séries
  value?: number; // Valor acordado da sessão
}

export interface CRMDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  date: string;
  filePath: string; // Alterado de 'data' para 'filePath'
  data?: Blob; // Mantido para compatibilidade, mas não será mais usado
}

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
}

export enum View {
  DASHBOARD = 'DASHBOARD',
  PATIENTS = 'PATIENTS',
  KANBAN = 'KANBAN',
  CALENDAR = 'CALENDAR',
  FINANCIALS = 'FINANCIALS',
  AI_ASSISTANT = 'AI_ASSISTANT',
  MASS_MESSAGING = 'MASS_MESSAGING',
  TEMPLATES = 'TEMPLATES',
  LEAD_FINDER = 'LEAD_FINDER',
  DOCUMENTS = 'DOCUMENTS',
}