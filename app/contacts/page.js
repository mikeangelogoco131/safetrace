"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Pencil, Trash2, Plus, X, User, Phone, Mail } from 'lucide-react';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ id: null, contact_name: '', contact_phone: '', contact_email: '' });

  useEffect(() => {
    const fetchSessionAndContacts = async () => {
      // Use getUser() for a more reliable check from local storage vs getSession()
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        fetchContacts(user.id);
      } else {
        setLoading(false);
      }
    };
    fetchSessionAndContacts();
  }, []);

  const fetchContacts = async (uid) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', uid)
      .order('created_at', { ascending: false });
    
    if (!error && data) {
      setContacts(data);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!userId) {
      alert("You need to be logged in to add a contact.");
      return;
    }

    if (formData.id) {
      // Update existing contact
      const { error } = await supabase
        .from('emergency_contacts')
        .update({ contact_name: formData.contact_name, contact_phone: formData.contact_phone, contact_email: formData.contact_email })
        .eq('id', formData.id);
      
      if (!error) {
        fetchContacts(userId);
        resetForm();
      } else {
        alert(error.message);
      }
    } else {
      // Insert new contact
      const { error } = await supabase
        .from('emergency_contacts')
        .insert([{ user_id: userId, contact_name: formData.contact_name, contact_phone: formData.contact_phone, contact_email: formData.contact_email }]);
      
      if (!error) {
        fetchContacts(userId);
        resetForm();
      } else {
        alert(error.message);
      }
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id);
      
      if (!error) {
        fetchContacts(userId);
      } else {
        alert(error.message);
      }
    }
  };

  const editContact = (contact) => {
    setFormData({ id: contact.id, contact_name: contact.contact_name, contact_phone: contact.contact_phone, contact_email: contact.contact_email || '' });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({ id: null, contact_name: '', contact_phone: '', contact_email: '' });
    setShowForm(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Emergency Contacts</h1>
          <p className="text-slate-500">Manage the people who will be notified during an emergency.</p>
        </div>
        {!showForm && (
          <button 
            onClick={() => setShowForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            <span>Add Contact</span>
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">{formData.id ? 'Edit Contact' : 'Add New Contact'}</h2>
            <button onClick={resetForm} className="text-slate-400 hover:text-slate-600">
              <X size={24} />
            </button>
          </div>
          
          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Name</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="text" 
                    required 
                    value={formData.contact_name}
                    onChange={(e) => setFormData({...formData, contact_name: e.target.value})}
                    className="pl-10 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="Jane Doe"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="tel" 
                    required 
                    value={formData.contact_phone}
                    onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                    className="pl-10 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email <span className="text-slate-400 font-normal">(Optional)</span></label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-slate-400" />
                  </div>
                  <input 
                    type="email" 
                    value={formData.contact_email}
                    onChange={(e) => setFormData({...formData, contact_email: e.target.value})}
                    className="pl-10 w-full p-2 border border-slate-300 rounded-md focus:ring-blue-500 focus:border-blue-500" 
                    placeholder="jane@example.com"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button 
                type="button" 
                onClick={resetForm}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-md hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
              >
                {formData.id ? 'Update Contact' : 'Save Contact'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-500 min-h-[200px] flex items-center justify-center">Loading contacts...</div>
        ) : contacts.length > 0 ? (
          <table className="w-full text-left text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="py-4 px-6 font-semibold">Name</th>
                <th className="py-4 px-6 font-semibold">Phone Number</th>
                <th className="py-4 px-6 font-semibold">Email</th>
                <th className="py-4 px-6 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-slate-100 hover:bg-slate-50 transition last:border-0">
                  <td className="py-4 px-6 font-medium text-slate-900">{contact.contact_name}</td>
                  <td className="py-4 px-6">{contact.contact_phone}</td>
                  <td className="py-4 px-6 text-slate-500">{contact.contact_email || '-'}</td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end space-x-2">
                      <button 
                        onClick={() => editContact(contact)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-md transition"
                        title="Edit Contact"
                      >
                        <Pencil size={18} />
                      </button>
                      <button 
                        onClick={() => handleDelete(contact.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md transition"
                        title="Delete Contact"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 text-slate-400 mb-4">
              <User size={32} />
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-1">No contacts found</h3>
            <p className="text-slate-500 mb-4">Add your first emergency contact to get started.</p>
            {!showForm && (
              <button 
                onClick={() => setShowForm(true)}
                className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
              >
                + Add a Contact
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
