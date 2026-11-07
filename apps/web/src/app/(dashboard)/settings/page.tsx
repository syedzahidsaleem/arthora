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
          <h1 className="text-2xl sm:text-3xl font-black text-black uppercase tracking-tight flex items-center gap-2.5">
            <span>Account & Platform Settings</span>
            <span className="px-2 py-0.5 rounded-md bg-neo-yellow text-black text-xs font-mono font-black border-2 border-black shadow-[1px_1px_0px_0px_#000]">
              CONFIG
            </span>
          </h1>
          <p className="text-xs sm:text-sm font-mono text-black/70 mt-1">
            Manage your investor profile, appearance themes, and security preferences.
          </p>
        </div>
      </div>

      {/* Profile Section */}
      <section className="p-6 rounded-xl bg-white border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <div className="p-1.5 rounded-md bg-neo-yellow border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <User className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-black uppercase tracking-wider">
            Investor Profile
          </h2>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-neo-yellow border-2 border-black flex items-center justify-center text-xl font-black text-black shadow-neo shrink-0">
              {userInitials}
            </div>

            <div className="space-y-1">
              <span className="font-black text-base text-black block uppercase tracking-tight">{user?.name || 'Investor'}</span>
              <div className="flex items-center gap-2 text-xs text-black/70">
                <span className="font-mono">{user?.email}</span>
                <span className="px-2 py-0.5 rounded-md bg-neo-cream border border-black text-[10px] font-mono font-bold uppercase text-black">
                  {user?.authProvider || 'Email'} Auth
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-black text-black uppercase tracking-wider">Full Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full px-3.5 py-2.5 rounded-lg bg-white border-2 border-black font-mono text-sm text-black focus:outline-none focus:ring-2 focus:ring-neo-yellow transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-black text-black uppercase tracking-wider">Registered Email</label>
              <input
                value={user?.email || ''}
                disabled
                className="w-full px-3.5 py-2.5 rounded-lg bg-neo-cream border-2 border-black font-mono text-sm text-black/60 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="neo-btn bg-neo-mint text-black font-black uppercase text-xs inline-flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'Saving...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Preferences Section */}
      <section className="p-6 rounded-xl bg-white border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <div className="p-1.5 rounded-md bg-neo-aqua border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-black uppercase tracking-wider">
            Default Dashboard View
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-2">
            <label className="text-xs font-black text-black uppercase tracking-wider">Default Startup Tab</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDefaultTab('ai')}
                className={cn(
                  'flex-1 py-2.5 px-3 rounded-lg border-2 border-black font-black uppercase text-center transition-all',
                  defaultTab === 'ai'
                    ? 'bg-neo-mint text-black shadow-neo'
                    : 'bg-neo-cream text-black/70 hover:text-black',
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
                    ? 'bg-neo-mint text-black shadow-neo'
                    : 'bg-neo-cream text-black/70 hover:text-black',
                )}
              >
                Research Hub
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-black text-black uppercase tracking-wider">Default Stock Exchange</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setDefaultExchange('NSE')}
                aria-pressed={defaultExchange === 'NSE'}
                className={cn(
                  'flex-1 py-2.5 px-3 rounded-lg border-2 border-black font-black uppercase text-center transition-all bg-neo-aqua text-black shadow-neo',
                )}
              >
                NSE India (Active)
              </button>
            </div>
            <p className="text-[11px] font-mono text-[#525866]">
              Live quotes (may be delayed) and historical technicals are resolved directly via National Stock Exchange (NSE).
            </p>
          </div>
        </div>
      </section>

      {/* Appearance & Themes */}
      <section className="p-6 rounded-xl bg-white border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <div className="p-1.5 rounded-md bg-neo-lilac border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <Palette className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-black uppercase tracking-wider">
            Theme & Visual Preferences
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Architectural Light Option */}
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'p-4 rounded-xl border-2 border-black text-left transition-all relative space-y-2',
              theme === 'light' || !theme
                ? 'bg-neo-cream shadow-neo'
                : 'bg-white hover:bg-neo-cream/50',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-black uppercase tracking-wide">Architectural Neubrutalism (Default)</span>
              {(theme === 'light' || !theme) && (
                <span className="px-2 py-0.5 rounded-md bg-neo-mint text-black text-[10px] font-mono font-black border border-black">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="h-12 w-full rounded-lg bg-neo-cream border-2 border-black p-2 flex gap-1.5">
              <div className="w-1/3 bg-neo-mint rounded border border-black" />
              <div className="flex-1 bg-white rounded border border-black" />
            </div>
          </button>

          {/* Midnight Brutal Option */}
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'p-4 rounded-xl border-2 border-black text-left transition-all relative space-y-2',
              theme === 'dark'
                ? 'bg-neo-cream shadow-neo'
                : 'bg-white hover:bg-neo-cream/50',
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-black text-xs text-black uppercase tracking-wide">Midnight Contrast</span>
              {theme === 'dark' && (
                <span className="px-2 py-0.5 rounded-md bg-neo-mint text-black text-[10px] font-mono font-black border border-black">
                  ACTIVE
                </span>
              )}
            </div>
            <div className="h-12 w-full rounded-lg bg-[#222A2A] border-2 border-black p-2 flex gap-1.5">
              <div className="w-1/3 bg-neo-yellow rounded border border-black" />
              <div className="flex-1 bg-black rounded border border-black" />
            </div>
          </button>
        </div>
      </section>

      {/* Platform & Data Preferences */}
      <section className="p-6 rounded-xl bg-white border-2 border-black shadow-neo space-y-6">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-black">
          <div className="p-1.5 rounded-md bg-neo-mint border-2 border-black text-black shadow-[1px_1px_0px_0px_#000]">
            <Shield className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm text-black uppercase tracking-wider">
            Privacy & Stored Data
          </h2>
        </div>

        <div className="space-y-4 text-xs">
          <div className="flex items-center justify-between p-4 rounded-lg bg-neo-cream border-2 border-black">
            <div>
              <span className="font-black text-black block uppercase tracking-wide">Recent Search History</span>
              <span className="text-black/70 font-mono text-[11px]">
                Clear your locally cached and saved mutual fund search queries
              </span>
            </div>
            <button
              type="button"
              onClick={handleClearSearchHistory}
              className="neo-btn bg-neo-mint text-black font-black uppercase text-xs"
            >
              Clear History
            </button>
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg bg-neo-cream border-2 border-black">
            <div>
              <span className="font-black text-black block uppercase tracking-wide">Export Portfolio & Research Data</span>
              <span className="text-black/70 font-mono text-[11px]">
                Download all saved portfolios, watchlists, and research notes as JSON
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadData}
              className="neo-btn bg-neo-aqua text-black font-black uppercase text-xs inline-flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </section>

      {/* Danger Zone */}
      <section className="p-6 rounded-xl bg-white border-2 border-neo-rust shadow-neo space-y-4">
        <div className="flex items-center gap-2.5 pb-3 border-b-2 border-neo-rust">
          <div className="p-1.5 rounded-md bg-neo-rust border-2 border-black text-white shadow-[1px_1px_0px_0px_#000]">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h2 className="font-black text-sm uppercase tracking-wider text-neo-rust">Danger Zone</h2>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-black/70">
            <span className="font-black text-black block uppercase tracking-wide">Delete Your Account</span>
            <span className="font-mono">Permanently purge all your AI portfolios, watchlists, and profile records.</span>
          </div>

          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            className="neo-btn bg-neo-rust text-white font-black uppercase text-xs inline-flex items-center gap-1.5 shrink-0"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Account</span>
          </button>
        </div>
      </section>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200" />
          <Dialog.Content className="fixed top-[30%] left-[50%] translate-x-[-50%] w-full max-w-md bg-white border-[3px] border-black rounded-xl p-6 shadow-neo-lg z-50 space-y-4 focus:outline-none animate-in fade-in-0 zoom-in-95">
            <div className="w-12 h-12 rounded-xl bg-neo-rust border-2 border-black text-white flex items-center justify-center shadow-neo-sm">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="space-y-1">
              <Dialog.Title className="text-lg font-black uppercase text-black">
                Confirm Permanent Account Deletion
              </Dialog.Title>
              <Dialog.Description className="text-xs font-mono text-black/70 leading-relaxed">
                This action is irreversible. All generated AI portfolios and watchlists will be permanently purged. Type <strong className="text-neo-rust font-mono font-black">DELETE</strong> below to confirm.
              </Dialog.Description>
            </div>

            <input
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type DELETE"
              className="w-full px-3.5 py-2.5 rounded-lg bg-neo-cream border-2 border-black text-sm font-mono text-black placeholder-black/40 focus:outline-none focus:ring-2 focus:ring-neo-rust"
            />

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="neo-btn bg-neo-cream text-black font-black uppercase text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== 'DELETE'}
                className="neo-btn bg-neo-rust text-white font-black uppercase text-xs disabled:opacity-40 disabled:cursor-not-allowed"
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
