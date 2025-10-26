import React, { useState } from 'react';
import { TruckIcon, PackageIcon, MapPinIcon, DollarSignIcon, UsersIcon, ArrowUpIcon, ArrowDownIcon, CheckCircleIcon, AlertCircleIcon, ClockIcon, BarChart2Icon, CalendarIcon, RefreshCcwIcon, FilterIcon, TrendingUpIcon, TrendingDownIcon, MoreHorizontalIcon } from 'lucide-react';
import { motion } from 'framer-motion';
interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
  period?: string;
}
const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color,
  change,
  period
}) => {
  return <motion.div className="card bg-base-100 shadow-lg p-6 border-b-4 border-primary hover:shadow-xl transition-shadow" whileHover={{
    y: -5
  }} transition={{
    duration: 0.2
  }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-base-content/60 font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-base-content">{value}</h3>
          {change && <div className="flex items-center mt-2">
              {change.type === 'increase' ? <span className="flex items-center text-success text-xs">
                  <ArrowUpIcon size={14} className="mr-1" />
                  {change.value}
                </span> : <span className="flex items-center text-error text-xs">
                  <ArrowDownIcon size={14} className="mr-1" />
                  {change.value}
                </span>}
              {period && <span className="text-base-content/60 text-xs ml-1">vs {period}</span>}
            </div>}
        </div>
        <div className={`p-3 rounded-lg ${color} text-primary-content`}>{icon}</div>
      </div>
    </motion.div>;
};
export const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('today');
  const [dateRange, setDateRange] = useState('7days');
  return <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-base-content mb-2">
            Tableau de bord
          </h1>
          <p className="text-base-content/70">
            Bienvenue sur le tableau de bord administrateur de ColisSelect
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <div className="tabs tabs-boxed">
            <button className={`tab ${activeTab === 'today' ? 'tab-active' : ''}`} onClick={() => setActiveTab('today')}>
              Aujourd'hui
            </button>
            <button className={`tab ${activeTab === 'week' ? 'tab-active' : ''}`} onClick={() => setActiveTab('week')}>
              Cette semaine
            </button>
            <button className={`tab ${activeTab === 'month' ? 'tab-active' : ''}`} onClick={() => setActiveTab('month')}>
              Ce mois
            </button>
          </div>
          <button className="btn btn-ghost btn-sm">
            <RefreshCcwIcon size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Expéditions" value="1,248" icon={<TruckIcon size={24} />} color="bg-amber-500" change={{
        value: '12%',
        type: 'increase'
      }} period="dernier mois" />
        <StatCard title="Colis Actifs" value="356" icon={<PackageIcon size={24} />} color="bg-indigo-500" change={{
        value: '5%',
        type: 'increase'
      }} period="dernier mois" />
        <StatCard title="Destinations" value="124" icon={<MapPinIcon size={24} />} color="bg-green-500" change={{
        value: '3%',
        type: 'increase'
      }} period="dernier mois" />
        <StatCard title="Chiffre d'Affaires" value="€56,789" icon={<DollarSignIcon size={24} />} color="bg-purple-500" change={{
        value: '8%',
        type: 'increase'
      }} period="dernier mois" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div className="card bg-base-100 shadow-lg lg:col-span-2 overflow-hidden" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3
      }}>
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="card-title">
                  Statistiques d'expédition
                </h2>
                <p className="text-base-content/60">
                  Vue d'ensemble des tendances d'expédition
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <select className="select select-bordered select-sm" value={dateRange} onChange={e => setDateRange(e.target.value)}>
                  <option value="7days">7 derniers jours</option>
                  <option value="30days">30 derniers jours</option>
                  <option value="90days">90 derniers jours</option>
                  <option value="year">Cette année</option>
                </select>
                <button className="btn btn-ghost btn-sm">
                  <FilterIcon size={16} />
                </button>
              </div>
            </div>
            <div className="flex justify-between mb-6">
              <div>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-base-content">1,248</h3>
                  <span className="ml-2 badge badge-success badge-sm">
                    <TrendingUpIcon size={12} className="mr-1" />
                    12%
                  </span>
                </div>
                <p className="text-sm text-base-content/60">Expéditions totales</p>
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-base-content">€56,789</h3>
                  <span className="ml-2 badge badge-success badge-sm">
                    <TrendingUpIcon size={12} className="mr-1" />
                    8%
                  </span>
                </div>
                <p className="text-sm text-base-content/60">Revenus</p>
              </div>
              <div>
                <div className="flex items-center">
                  <h3 className="text-2xl font-bold text-base-content">€45.5</h3>
                  <span className="ml-2 badge badge-error badge-sm">
                    <TrendingDownIcon size={12} className="mr-1" />
                    3%
                  </span>
                </div>
                <p className="text-sm text-base-content/60">Valeur moyenne</p>
              </div>
            </div>
            <div className="w-full h-64 bg-base-200 rounded-lg flex items-center justify-center">
              <img src="https://miro.medium.com/v2/resize:fit:1400/1*D9JYQtEj9-uN2XPzMJzJOw.png" alt="Chart" className="max-w-full max-h-full object-contain" />
            </div>
          </div>
        </motion.div>

        <motion.div className="card bg-base-100 shadow-lg overflow-hidden" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.1
      }}>
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
                Statuts des colis
              </h2>
              <button className="btn btn-ghost btn-sm">
                <MoreHorizontalIcon size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-warning mr-2"></div>
                    <span className="text-sm text-base-content">En attente</span>
                  </div>
                  <span className="text-sm font-semibold text-base-content">125</span>
                </div>
                <progress className="progress progress-warning" value="25" max="100"></progress>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-info mr-2"></div>
                    <span className="text-sm text-base-content">En transit</span>
                  </div>
                  <span className="text-sm font-semibold text-base-content">356</span>
                </div>
                <progress className="progress progress-info" value="45" max="100"></progress>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-success mr-2"></div>
                    <span className="text-sm text-base-content">Livrés</span>
                  </div>
                  <span className="text-sm font-semibold text-base-content">721</span>
                </div>
                <progress className="progress progress-success" value="60" max="100"></progress>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-error mr-2"></div>
                    <span className="text-sm text-base-content">Problèmes</span>
                  </div>
                  <span className="text-sm font-semibold text-base-content">46</span>
                </div>
                <progress className="progress progress-error" value="10" max="100"></progress>
              </div>
              <div className="text-center">
                <button className="link link-primary">
                  Voir les détails
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="card bg-base-100 shadow-lg overflow-hidden" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.2
      }}>
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
                Expéditions récentes
              </h2>
              <button className="link link-primary">
                Voir tout
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Tracking #</th>
                    <th>Origine</th>
                    <th>Destination</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                <tr>
                  <td>
                    <div className="flex items-center">
                      <PackageIcon size={16} className="mr-2 text-primary" />
                      <span className="font-medium">CS-12345678</span>
                    </div>
                  </td>
                  <td>Paris, FR</td>
                  <td>Lyon, FR</td>
                  <td>
                    <div className="badge badge-info badge-sm">
                      <ClockIcon size={12} className="mr-1" />
                      En Transit
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center">
                      <PackageIcon size={16} className="mr-2 text-primary" />
                      <span className="font-medium">CS-23456789</span>
                    </div>
                  </td>
                  <td>Marseille, FR</td>
                  <td>Nice, FR</td>
                  <td>
                    <div className="badge badge-success badge-sm">
                      <CheckCircleIcon size={12} className="mr-1" />
                      Livré
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center">
                      <PackageIcon size={16} className="mr-2 text-primary" />
                      <span className="font-medium">CS-34567890</span>
                    </div>
                  </td>
                  <td>Toulouse, FR</td>
                  <td>Bordeaux, FR</td>
                  <td>
                    <div className="badge badge-warning badge-sm">
                      <ClockIcon size={12} className="mr-1" />
                      En attente
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center">
                      <PackageIcon size={16} className="mr-2 text-primary" />
                      <span className="font-medium">CS-45678901</span>
                    </div>
                  </td>
                  <td>Lille, FR</td>
                  <td>Strasbourg, FR</td>
                  <td>
                    <div className="badge badge-error badge-sm">
                      <AlertCircleIcon size={12} className="mr-1" />
                      Retardé
                    </div>
                  </td>
                </tr>
                <tr>
                  <td>
                    <div className="flex items-center">
                      <PackageIcon size={16} className="mr-2 text-primary" />
                      <span className="font-medium">CS-56789012</span>
                    </div>
                  </td>
                  <td>Nantes, FR</td>
                  <td>Rennes, FR</td>
                  <td>
                    <div className="badge badge-secondary badge-sm">
                      <TruckIcon size={12} className="mr-1" />
                      Ramassé
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
</div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div className="card bg-base-100 shadow-lg overflow-hidden" initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.3,
        delay: 0.3
      }}>
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title">
                Activité récente
              </h2>
              <button className="link link-primary">
                Voir tout
              </button>
            </div>
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="avatar mr-3">
                  <div className="w-10 rounded-full bg-info/10">
                    <UsersIcon size={18} className="text-info" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <p className="text-base-content font-medium">
                      Nouvel utilisateur enregistré
                    </p>
                    <div className="badge badge-neutral badge-xs ml-2">
                      Utilisateur
                    </div>
                  </div>
                  <p className="text-base-content/70 text-sm mb-1">
                    Marie Laurent a créé un compte client
                  </p>
                  <p className="text-base-content/50 text-xs">Il y a 2 heures</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="avatar mr-3">
                  <div className="w-10 rounded-full bg-success/10">
                    <PackageIcon size={18} className="text-success" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <p className="text-base-content font-medium">
                      Mise à jour du colis
                    </p>
                    <div className="badge badge-neutral badge-xs ml-2">
                      Expédition
                    </div>
                  </div>
                  <p className="text-base-content/70 text-sm mb-1">
                    Le colis <span className="font-medium">CS-12345678</span> a
                    été mis à jour vers "En Transit"
                  </p>
                  <p className="text-base-content/50 text-xs">Il y a 4 heures</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="avatar mr-3">
                  <div className="w-10 rounded-full bg-warning/10">
                    <DollarSignIcon size={18} className="text-warning" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <p className="text-base-content font-medium">
                      Nouveau tarif d'expédition
                    </p>
                    <div className="badge badge-neutral badge-xs ml-2">
                      Tarification
                    </div>
                  </div>
                  <p className="text-base-content/70 text-sm mb-1">
                    Nouveau tarif ajouté pour "Express Air"
                  </p>
                  <p className="text-base-content/50 text-xs">Hier à 15:30</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="avatar mr-3">
                  <div className="w-10 rounded-full bg-secondary/10">
                    <MapPinIcon size={18} className="text-secondary" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <p className="text-base-content font-medium">
                      Emplacements ajoutés
                    </p>
                    <div className="badge badge-neutral badge-xs ml-2">
                      Zones
                    </div>
                  </div>
                  <p className="text-base-content/70 text-sm mb-1">
                    5 nouveaux emplacements ajoutés à la zone "Europe Centrale"
                  </p>
                  <p className="text-base-content/50 text-xs">Hier à 11:15</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="avatar mr-3">
                  <div className="w-10 rounded-full bg-error/10">
                    <AlertCircleIcon size={18} className="text-error" />
                  </div>
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <p className="text-base-content font-medium">
                      Alerte de retard
                    </p>
                    <div className="badge badge-neutral badge-xs ml-2">
                      Problème
                    </div>
                  </div>
                  <p className="text-base-content/70 text-sm mb-1">
                    L'expédition{' '}
                    <span className="font-medium">CS-45678901</span> marquée
                    comme "Retardée"
                  </p>
                  <p className="text-base-content/50 text-xs">Il y a 2 jours</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>;
  };