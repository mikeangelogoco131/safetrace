"use client";

import { Users, Bell, Calendar, Activity } from 'lucide-react';

export default function DashboardCards({ contactsCount, alertsCount, lastAlert }) {
  const cardData = [
    {
      title: 'Total Contacts',
      value: contactsCount,
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      iconBg: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Total Alerts',
      value: alertsCount,
      icon: Bell,
      gradient: 'from-red-500 to-pink-500',
      bgGradient: 'from-red-50 to-pink-50',
      iconBg: 'bg-red-100 text-red-600'
    },
    {
      title: 'Last Alert Date',
      value: lastAlert || 'Never',
      icon: Calendar,
      gradient: 'from-amber-500 to-orange-500',
      bgGradient: 'from-amber-50 to-orange-50',
      iconBg: 'bg-amber-100 text-amber-600'
    },
    {
      title: 'Account Status',
      value: 'Active',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      iconBg: 'bg-green-100 text-green-600'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cardData.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`bg-gradient-to-br ${card.bgGradient} p-6 rounded-xl shadow-sm hover:shadow-lg border border-slate-200/40 transition duration-300 transform hover:scale-105 backdrop-blur-sm`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-2">{card.title}</p>
                <p className={`text-3xl font-bold bg-gradient-to-r ${card.gradient} bg-clip-text text-transparent`}>
                  {card.value}
                </p>
              </div>
              <div className={`p-3 rounded-xl ${card.iconBg} shadow-md`}>
                <Icon size={24} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
