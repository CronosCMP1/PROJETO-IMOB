import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Listing } from '../types';
import { Users, Building, TrendingUp, Tag, Key } from 'lucide-react';

interface DashboardProps {
  listings: Listing[];
}

const Dashboard: React.FC<DashboardProps> = ({ listings }) => {
  const stats = useMemo(() => {
    const total = listings.length;
    const owners = listings.filter(l => l.sellerType === 'OWNER').length;
    const brokers = listings.filter(l => l.sellerType === 'BROKER').length;
    
    // Separate Sale vs Rent metrics
    const salesListings = listings.filter(l => l.operationType === 'SALE');
    const rentListings = listings.filter(l => l.operationType === 'RENT');

    const avgSalePrice = salesListings.length > 0
      ? salesListings.reduce((acc, curr) => acc + curr.price, 0) / salesListings.length
      : 0;

    const avgRentPrice = rentListings.length > 0
      ? rentListings.reduce((acc, curr) => acc + curr.price, 0) / rentListings.length
      : 0;

    return { total, owners, brokers, avgSalePrice, avgRentPrice, salesCount: salesListings.length, rentCount: rentListings.length };
  }, [listings]);

  const platformData = useMemo(() => {
    const counts: Record<string, number> = {};
    listings.forEach(l => {
      counts[l.platform] = (counts[l.platform] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({ name: key, value: counts[key] }));
  }, [listings]);

  const ownerVsBrokerData = [
    { name: 'Direto c/ Proprietário', value: stats.owners },
    { name: 'Imobiliária/Corretor', value: stats.brokers },
  ];

  const COLORS = ['#10b981', '#64748b', '#6366f1', '#f43f5e'];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', notation: "compact" }).format(val);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Painel de Controle</h2>
        <p className="text-slate-500">Análise em tempo real de oportunidades de mercado</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Total Analisado</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Leads Proprietários</p>
              <h3 className="text-3xl font-bold text-emerald-600 mt-2">{stats.owners}</h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg">
              <Users size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Preço Médio (Venda)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">
                {stats.avgSalePrice > 0 ? formatCurrency(stats.avgSalePrice) : 'N/A'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{stats.salesCount} anúncios</p>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <Tag size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-medium">Preço Médio (Aluguel)</p>
              <h3 className="text-2xl font-bold text-slate-800 mt-2">
                 {stats.avgRentPrice > 0 ? formatCurrency(stats.avgRentPrice) : 'N/A'}
              </h3>
              <p className="text-xs text-slate-400 mt-1">{stats.rentCount} anúncios</p>
            </div>
            <div className="p-3 bg-sky-50 text-sky-600 rounded-lg">
              <Key size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {listings.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Distribuição Proprietário vs Corretor</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={ownerVsBrokerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {ownerVsBrokerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-6">Origem por Plataforma</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={platformData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip cursor={{fill: '#f1f5f9'}} />
                  <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
      
      {listings.length === 0 && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-xl p-12 text-center">
            <p className="text-slate-500">Nenhum dado disponível para visualização. Execute uma busca para ver análises.</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;