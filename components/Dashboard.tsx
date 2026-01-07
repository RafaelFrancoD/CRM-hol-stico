import React from 'react';
import { Patient, Transaction } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Users, DollarSign, Calendar, TrendingUp } from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  transactions: Transaction[];
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, transactions }) => {
  const activePatients = patients.filter(p => p.status === 'Em Tratamento').length;
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const chartData = [
    { name: 'Jan', income: 0, expense: 0 },
    { name: 'Fev', income: 0, expense: 0 },
    { name: 'Mar', income: 0, expense: 0 },
    { name: 'Abr', income: 0, expense: 0 },
    { name: 'Mai', income: 0, expense: 0 },
    { name: 'Jun', income: 0, expense: 0 },
    { name: 'Jul', income: 0, expense: 0 },
  ];

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl font-bold text-slate-800">Visão Geral</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Users className="text-blue-500" />} title="Pacientes Ativos" value={activePatients} color="bg-blue-50" />
        <StatCard icon={<DollarSign className="text-emerald-500" />} title="Receita Mensal" value={`R$ ${totalIncome.toFixed(2)}`} color="bg-emerald-50" />
        <StatCard icon={<TrendingUp className="text-purple-500" />} title="Lucro Líquido" value={`R$ ${netProfit.toFixed(2)}`} color="bg-purple-50" />
        <StatCard icon={<Calendar className="text-orange-500" />} title="Sessões Hoje" value="0" color="bg-orange-50" />
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-slate-100">
          <h3 className="text-lg font-semibold mb-4">Fluxo de Caixa</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={12} />
                <YAxis axisLine={false} tickLine={false} fontSize={12} />
                <Tooltip />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Receita" />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Despesa" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, title, value, color }: { icon: React.ReactNode, title: string, value: string | number, color: string }) => (
  <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-4">
    <div className={`p-3 rounded-full ${color}`}>{icon}</div>
    <div>
      <p className="text-slate-500 text-sm">{title}</p>
      <p className="text-xl md:text-2xl font-bold text-slate-800">{value}</p>
    </div>
  </div>
);