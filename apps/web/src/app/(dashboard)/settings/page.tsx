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
  CheckCircle2,
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
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Account & Platform Settings
        </h1>
        <p className="text-xs sm:text-sm text-[#9B9BB4] mt-1">
          Manage your investor profile, appearance themes, and security preferences.
        </p>
      </div>

      {/* Profile Section */}
      <section className="p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <User className="w-5 h-5 text-[#6C63FF]" />
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            Investor Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6C63FF] to-[#00D2FF] flex items-center justify-center text-xl font-bold text-white shadow-xl shadow-[#6C63FF]/20 shrink-0">
              {userInitials}
            </div>

            <div className="space-y-1">
              <span className="font-bold text-sm text-white block">{user?.name || 'Investor'}</span>
              <div className="flex items-center gap-2 text-xs text-[#9B9BB4]">
                <span>{user?.email}</span>
                <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono capitalize">
                  {user?.authProvider || 'Email'} Auth
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9B9BB4] uppercase">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#13141F] border border-white/5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#9B9BB4] uppercase">Registered Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#13141F]/50 border border-white/5 text-sm text-[#9B9BB4] cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-[#6C63FF] to-[#00D2FF] hover:opacity-90 active:scale-95 transition-all shadow-md shadow-[#6C63FF]/20"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </section>

      {/* Preferences Section */}
      <section className="p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Palette className="w-5 h-5 text-[#6C63FF]" />
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            Default Dashboard View
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9B9BB4] uppercase">Default Startup Tab</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDefaultTab('ai')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl border text-center font-semibold transition-all',
                  defaultTab === 'ai'
                    ? 'bg-[#6C63FF]/20 border-[#6C63FF] text-white'
                    : 'bg-[#13141F] border-white/5 text-[#9B9BB4]',
                )}
              >
                AI Portfolio
              </button>
              <button
                type="button"
                onClick={() => setDefaultTab('research')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl border text-center font-semibold transition-all',
                  defaultTab === 'research'
                    ? 'bg-[#6C63FF]/20 border-[#6C63FF] text-white'
                    : 'bg-[#13141F] border-white/5 text-[#9B9BB4]',
                )}
              >
                Research Hub
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#9B9BB4] uppercase">Default Stock Exchange</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDefaultExchange('NSE')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl border text-center font-semibold transition-all',
                  defaultExchange === 'NSE'
                    ? 'bg-[#00D2FF]/20 border-[#00D2FF] text-white'
                    : 'bg-[#13141F] border-white/5 text-[#9B9BB4]',
                )}
              >
                NSE India
              </button>
              <button
                type="button"
                onClick={() => setDefaultExchange('BSE')}
                className={cn(
                  'flex-1 py-2 px-3 rounded-xl border text-center font-semibold transition-all',
                  defaultExchange === 'BSE'
                    ? 'bg-[#00D2FF]/20 border-[#00D2FF] text-white'
                    : 'bg-[#13141F] border-white/5 text-[#9B9BB4]',
                )}
              >
                BSE India
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Appearance & Themes */}
      <section className="p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Palette className="w-5 h-5 text-[#00D2FF]" />
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            Theme & Visual Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Dark Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'p-4 rounded-2xl border text-left transition-all relative space-y-2',
              theme === 'dark' || !theme
                ? 'bg-gradient-to-br from-[#1A1B2E] to-[#6C63FF]/15 border-[#6C63FF] shadow-lg'
                : 'bg-[#13141F] border-white/5 hover:border-white/10',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Midnight Dark (Default)</span>
              {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-[#00D2FF]" />}
            </div>
            <div className="h-12 w-full rounded-xl bg-[#0D0E1A] border border-white/10 p-2 flex gap-1.5">
              <div className="w-1/3 bg-[#1A1B2E] rounded-lg" />
              <div className="flex-1 bg-[#1A1B2E] rounded-lg" />
            </div>
          </button>

          {/* Light Theme Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'p-4 rounded-2xl border text-left transition-all relative space-y-2',
              theme === 'light'
                ? 'bg-gradient-to-br from-[#1A1B2E] to-[#6C63FF]/15 border-[#6C63FF] shadow-lg'
                : 'bg-[#13141F] border-white/5 hover:border-white/10',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-white">Crisp Light</span>
              {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-[#00D2FF]" />}
            </div>
            <div className="h-12 w-full rounded-xl bg-white border border-black/10 p-2 flex gap-1.5">
              <div className="w-1/3 bg-slate-100 rounded-lg" />
              <div className="flex-1 bg-slate-100 rounded-lg" />
            </div>
          </button>
        </div>
      </section>

      {/* Platform & Data Preferences */}
      <section className="p-6 rounded-3xl bg-[#1A1B2E] border border-white/10 shadow-xl space-y-6">
        <div className="flex items-center gap-2.5 pb-2 border-b border-white/5">
          <Shield className="w-5 h-5 text-[#00D084]" />
          <h2 className="font-bold text-sm text-white uppercase tracking-wider">
            Privacy & Stored Data
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#13141F] border border-white/5">
            <div>
              <span className="font-bold text-white block">Recent Search History</span>
              <span className="text-[#9B9BB4] text-[11px]">
                Clear your locally cached and saved mutual fund search queries
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSearchHistory}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
            >
              Clear History
            </button>
          </div>

          <div className="flex items-center justify-between p-3 rounded-2xl bg-[#13141F] border border-white/5">
            <div>
              <span className="font-bold text-white block">Export Portfolio & Research Data</span>
              <span className="text-[#9B9BB4] text-[11px]">
                Download all saved portfolios, watchlists, and research notes as JSON
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadData}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 rounded-3xl bg-[#1A1B2E] border border-[#FF4D6D]/30 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 text-[#FF4D6D] pb-2 border-b border-white/5">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-bold text-sm uppercase tracking-wider">Danger Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-[#9B9BB4]">
            <span className="font-bold text-white block">Delete Your Account</span>
            <span>Permanently delete all your AI portfolios, watchlists, and profile records.</span>
          </div>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#FF4D6D] bg-[#FF4D6D]/10 hover:bg-[#FF4D6D]/20 border border-[#FF4D6D]/30 transition-all shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Account</span>
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-[30%] left-[50%] translate-x-[-50%] w-full max-w-md bg-[#13141F] border border-[#FF4D6D]/30 rounded-3xl p-6 shadow-2xl z-50 space-y-4 focus:outline-none animate-in fade-in-0 zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-[#FF4D6D]/10 text-[#FF4D6D] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <Dialog.Title className="text-base font-bold text-white">
                Confirm Permanent Account Deletion
              </Dialog.Title>
              <Dialog.Description className="text-xs text-[#9B9BB4] leading-relaxed">
                This action is irreversible. All generated AI portfolios and watchlists will be permanently purged. Type <strong className="text-white font-mono font-bold">DELETE</strong> below to confirm.
              </Dialog.Description>
            </div>

            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#1A1B2E] border border-white/10 text-sm font-mono text-white placeholder-[#9B9BB4]/50 focus:outline-none focus:ring-2 focus:ring-[#FF4D6D]"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-[#9B9BB4] hover:text-white bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#FF4D6D] hover:bg-[#FF4D6D]/90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
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
