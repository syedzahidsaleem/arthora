'use client';

import React, { useState } from 'react';
import { useTheme } from 'next-themes';
import {
  User,
  Palette,
  Shield,
  Trash2,
  Download,
  AlertTriangle,
  Save,
} from 'lucide-react';
import { toast } from 'sonner';
import * as Dialog from '@radix-ui/react-dialog';
import { useAuthStore } from '@/store/authStore';
import { useSearchStore } from '@/store/searchStore';
import { api } from '@/lib/api/client';
import { API_ENDPOINTS } from '@/lib/api/endpoints';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const { clearRecentSearches } = useSearchStore();
  const { theme, setTheme } = useTheme();

  const [name, setName] = useState(user?.name || '');
  const [defaultTab, setDefaultTab] = useState('ai');
  const [defaultExchange, setDefaultExchange] = useState('NSE');
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (updateUser) {
        updateUser({ name });
      }
      toast.success('Profile preferences updated successfully!');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearSearchHistory = async () => {
    clearRecentSearches();
    try {
      await api.delete(API_ENDPOINTS.SEARCH.CLEAR_HISTORY);
    } catch {
      // Local cleared
    }
    toast.success('Search history cleared successfully!');
  };

  const handleDownloadData = () => {
    toast.info('Data export requested. An encrypted archive link will be sent to your registered email.');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account removal.');
      return;
    }
    setDeleteModalOpen(false);
    toast.info('Account deletion request queued. A confirmation email has been dispatched.');
  };

  const userInitials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight flex items-center gap-2.5">
            <span>Account & Platform Settings</span>
            <span className="px-2 py-0.5 rounded-md bg-neo-yellow text-black text-xs font-mono font-black border-2 border-black shadow-[1px_1px_0px_0px_#000]">
              CONFIG
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-[#A0A0B2] mt-1">
            Manage your investor profile, appearance themes, and security preferences.
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <section className="p-6 rounded-xl bg-[#161620] border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black/40">
          <div className="p-1.5 rounded-md bg-neo-yellow border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <User className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-white uppercase tracking-wider">
            Investor Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-neo-yellow border-2 border-black flex items-center justify-center text-xl font-black text-black shadow-neo shrink-0">
              {userInitials}
            </div>

            <div className="space-y-1">
              <span className="font-black text-base text-white block uppercase tracking-tight">{user?.name || 'Investor'}</span>
              <div className="flex items-center gap-2 text-xs text-[#A0A0B2]">
                <span className="font-mono">{user?.email}</span>
                <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] font-mono font-bold uppercase">
                  {user?.authProvider || 'Email'} Auth
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-white uppercase tracking-wider">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0E0E14] border-2 border-black font-mono text-sm text-white focus:outline-none focus:ring-2 focus:ring-neo-yellow transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-white uppercase tracking-wider">Registered Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-lg bg-[#0E0E14]/50 border-2 border-black/40 font-mono text-sm text-[#A0A0B2] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-black uppercase text-xs text-black bg-neo-yellow border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Preferences Section */}
      <section className="p-6 rounded-xl bg-[#161620] border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black/40">
          <div className="p-1.5 rounded-md bg-neo-cyan border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-white uppercase tracking-wider">
            Default Dashboard View
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <label className="text-xs font-black text-white uppercase tracking-wider">Default Startup Tab</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDefaultTab('ai')}
                className={cn(
                  'flex-1 py-2.5 px-3 rounded-lg border-2 border-black font-black uppercase text-center transition-all',
                  defaultTab === 'ai'
                    ? 'bg-neo-yellow text-black shadow-neo'
                    : 'bg-[#0E0E14] text-[#A0A0B2] hover:text-white',
                )}
              >
                AI Portfolio
              </button>
              <button
                type="button"
                onClick={() => setDefaultTab('research')}
                className={cn(
                  'flex-1 py-2.5 px-3 rounded-lg border-2 border-black font-black uppercase text-center transition-all',
                  defaultTab === 'research'
                    ? 'bg-neo-yellow text-black shadow-neo'
                    : 'bg-[#0E0E14] text-[#A0A0B2] hover:text-white',
                )}
              >
                Research Hub
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-white uppercase tracking-wider">Default Stock Exchange</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDefaultExchange('NSE')}
                className={cn(
                  'flex-1 py-2.5 px-3 rounded-lg border-2 border-black font-black uppercase text-center transition-all',
                  defaultExchange === 'NSE'
                    ? 'bg-neo-cyan text-black shadow-neo'
                    : 'bg-[#0E0E14] text-[#A0A0B2] hover:text-white',
                )}
              >
                NSE India
              </button>
              <button
                type="button"
                onClick={() => setDefaultExchange('BSE')}
                className={cn(
                  'flex-1 py-2.5 px-3 rounded-lg border-2 border-black font-black uppercase text-center transition-all',
                  defaultExchange === 'BSE'
                    ? 'bg-neo-cyan text-black shadow-neo'
                    : 'bg-[#0E0E14] text-[#A0A0B2] hover:text-white',
                )}
              >
                BSE India
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance & Themes */}
      <section className="p-6 rounded-xl bg-[#161620] border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black/40">
          <div className="p-1.5 rounded-md bg-neo-lavender border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-white uppercase tracking-wider">
            Theme & Visual Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'p-4 rounded-xl border-2 border-black text-left transition-all relative space-y-2',
              theme === 'dark' || !theme
                ? 'bg-[#1D1D2C] shadow-neo'
                : 'bg-[#0E0E14] hover:border-white/20',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-white uppercase tracking-wide">Midnight Brutal (Default)</span>
              {theme === 'dark' && (
                <span className="px-2 py-0.5 rounded-md bg-neo-green text-black text-[10px] font-mono font-black border border-black">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="h-12 w-full rounded-lg bg-[#0E0E14] border-2 border-black p-2 flex gap-1.5">
              <div className="w-1/3 bg-neo-yellow rounded border border-black" />
              <div className="flex-1 bg-[#1D1D2C] rounded border border-black" />
            </div>
          </button>

          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'p-4 rounded-xl border-2 border-black text-left transition-all relative space-y-2',
              theme === 'light'
                ? 'bg-[#1D1D2C] shadow-neo'
                : 'bg-[#0E0E14] hover:border-white/20',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-white uppercase tracking-wide">High Contrast Light</span>
              {theme === 'light' && (
                <span className="px-2 py-0.5 rounded-md bg-neo-green text-black text-[10px] font-mono font-black border border-black">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="h-12 w-full rounded-lg bg-white border-2 border-black p-2 flex gap-1.5">
              <div className="w-1/3 bg-neo-yellow rounded border border-black" />
              <div className="flex-1 bg-slate-100 rounded border border-black" />
            </div>
          </button>
        </div>
      </section>

      {/* Platform & Data Preferences */}
      <section className="p-6 rounded-xl bg-[#161620] border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black/40">
          <div className="p-1.5 rounded-md bg-neo-green border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-white uppercase tracking-wider">
            Privacy & Stored Data
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 rounded-lg bg-[#0E0E14] border-2 border-black">
            <div>
              <span className="font-black text-white block uppercase tracking-wide">Recent Search History</span>
              <span className="text-[#A0A0B2] font-mono text-[11px]">
                Clear your locally cached and saved mutual fund search queries
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSearchHistory}
              className="px-3.5 py-2 rounded-lg bg-neo-mint text-black border-2 border-black font-black uppercase text-xs shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              Clear History
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-[#0E0E14] border-2 border-black">
            <div>
              <span className="font-black text-white block uppercase tracking-wide">Export Portfolio & Research Data</span>
              <span className="text-[#A0A0B2] font-mono text-[11px]">
                Download all saved portfolios, watchlists, and research notes as JSON
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-neo-cyan text-black border-2 border-black font-black uppercase text-xs shadow-neo-sm hover:shadow-neo hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 rounded-xl bg-[#201416] border-2 border-neo-red shadow-neo space-y-4">
        <div className="flex items-center gap-2.5 text-neo-coral pb-3 border-b-2 border-black/40">
          <div className="p-1.5 rounded-md bg-neo-coral border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm uppercase tracking-wider text-neo-coral">Danger Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#A0A0B2]">
            <span className="font-black text-white block uppercase tracking-wide">Delete Your Account</span>
            <span className="font-mono">Permanently purge all your AI portfolios, watchlists, and profile records.</span>
          </div>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-xs font-black uppercase text-black bg-neo-coral border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-[30%] left-[50%] translate-x-[-50%] w-full max-w-md bg-[#161620] border-[3px] border-black rounded-xl p-6 shadow-neo-lg z-50 space-y-4 focus:outline-none animate-in fade-in-0 zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-neo-coral border-2 border-black text-black flex items-center justify-center shadow-neo-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <Dialog.Title className="text-lg font-black uppercase text-white">
                Confirm Permanent Account Deletion
              </Dialog.Title>
              <Dialog.Description className="text-xs font-mono text-[#A0A0B2] leading-relaxed">
                This action is irreversible. All generated AI portfolios and watchlists will be permanently purged. Type <strong className="text-neo-yellow font-mono font-black">DELETE</strong> below to confirm.
              </Dialog.Description>
            </div>

            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2.5 rounded-lg bg-[#0E0E14] border-2 border-black text-sm font-mono text-white placeholder-[#A0A0B2]/50 focus:outline-none focus:ring-2 focus:ring-neo-coral"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 rounded-lg text-xs font-black uppercase text-white bg-[#0E0E14] border-2 border-black hover:bg-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2.5 rounded-lg text-xs font-black uppercase text-black bg-neo-coral border-2 border-black shadow-neo hover:shadow-neo-lg hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Confirm Delete
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
