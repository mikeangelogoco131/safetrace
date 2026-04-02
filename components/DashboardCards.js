"use client";

import { Users, Bell, Calendar, Activity } from 'lucide-react';

export default function DashboardCards({ contactsCount, alertsCount, lastAlert }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-blue-100 text-blue-600">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Contacts</p>
          <p className="text-2xl font-semibold text-slate-900">{contactsCount}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-red-100 text-red-600">
          <Bell size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Total Alerts</p>
          <p className="text-2xl font-semibold text-slate-900">{alertsCount}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-amber-100 text-amber-600">
          <Calendar size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Last Alert Date</p>
          <p className="text-xl font-semibold text-slate-900">{lastAlert || "Never"}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 flex items-center space-x-4">
        <div className="p-3 rounded-full bg-green-100 text-green-600">
          <Activity size={24} />
        </div>
        <div>
          <p className="text-sm font-medium text-slate-500">Account Status</p>
          <p className="text-xl font-semibold text-slate-900">Active</p>
        </div>
      </div>
    </div>
  );
}
