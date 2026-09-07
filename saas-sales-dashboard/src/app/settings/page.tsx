'use client';

import React, { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { 
  Building2, Users, Save, ShieldAlert, Sparkles, UserPlus, 
  Trash2, Mail, Check, AlertCircle, Loader2, Key, History, Database
} from 'lucide-react';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // Redirect if unauthenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'teammates' | 'data' | 'logs'>('profile');
  const [loading, setLoading] = useState(true);

  // Settings State
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [company, setCompany] = useState<any>(null);
  const [teammates, setTeammates] = useState<any[]>([]);
  const [uploads, setUploads] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);

  // User Profile Form
  const [profileName, setProfileName] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Workspace Settings Form
  const [companyName, setCompanyName] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [themeColor, setThemeColor] = useState('#6366f1');
  const [fiscalYearStart, setFiscalYearStart] = useState(1);
  const [logoUrl, setLogoUrl] = useState('');
  const [googleMapsKey, setGoogleMapsKey] = useState('');

  // Invite Member Form
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'admin' | 'analyst' | 'viewer'>('viewer');
  const [inviteName, setInviteName] = useState('');

  // UI Status Banners
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');

      setCurrentUser(data.user);
      setCompany(data.company);
      setTeammates(data.teammates);
      setUploads(data.uploads);
      setAuditLogs(data.auditLogs || []);

      // Populate forms
      setProfileName(data.user.name || '');
      setCompanyName(data.company.name || '');
      const settings = data.company.settings || {};
      setCurrency(settings.currency || 'INR');
      setThemeColor(settings.theme_color || '#6366f1');
      setFiscalYearStart(settings.fiscal_year_start || 1);
      setLogoUrl(settings.logo_url || '');
      setGoogleMapsKey(settings.google_maps_api_key || '');
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred loading settings.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') {
      fetchSettings();
    }
  }, [status]);

  const isAdmin = currentUser?.role === 'admin';

  // Save personal profile settings
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (newPassword && newPassword !== confirmPassword) {
      setErrorMessage('New passwords do not match.');
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: profileName,
          currentPassword: newPassword ? currentPassword : undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save settings.');

      setSuccessMessage('Account profile updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      await fetchSettings();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Save Workspace profile configurations
  const handleSaveWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setActionLoading(true);

    try {
      const res = await fetch('/api/settings/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: companyName,
          settings: {
            currency,
            theme_color: themeColor,
            fiscal_year_start: fiscalYearStart,
            logo_url: logoUrl,
            google_maps_api_key: googleMapsKey,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save configurations.');

      setSuccessMessage('Workspace settings updated successfully!');
      await fetchSettings();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Invite / Add Teammate
  const handleInviteTeammate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setActionLoading(true);

    try {
      const res = await fetch('/api/settings/teammates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: inviteEmail,
          role: inviteRole,
          name: inviteName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to invite team member.');

      setSuccessMessage(`Teammate added! Default login password: teammate123`);
      setInviteEmail('');
      setInviteName('');
      setInviteRole('viewer');
      await fetchSettings();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Teammate
  const handleDeleteTeammate = async (teammateId: string, teammateEmail: string) => {
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to remove ${teammateEmail} from this workspace?`)) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setActionLoading(true);

    try {
      const res = await fetch(`/api/settings/teammates?id=${teammateId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete teammate.');

      setSuccessMessage('Teammate removed successfully.');
      await fetchSettings();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Delete Data Upload cascade
  const handleDeleteUpload = async (uploadId: string, filename: string) => {
    if (!isAdmin) return;
    if (!confirm(`⚠️ WARNING: Deleting "${filename}" will permanently remove all of its associated sales records from the dashboard. This action CANNOT be undone. Proceed?`)) return;

    setErrorMessage(null);
    setSuccessMessage(null);
    setActionLoading(true);

    try {
      const res = await fetch(`/api/settings/uploads?id=${uploadId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete data upload.');

      setSuccessMessage(data.message || 'Upload records cleared successfully.');
      await fetchSettings();
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-slate-950 flex text-slate-100">
        <Navigation />
        <div className="flex-1 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-sm text-slate-400">Loading system settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100">
      <Navigation />

      <main className="flex-1 p-10 overflow-y-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold mb-1">
            <Sparkles className="w-4 h-4" /> System Hub
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your personal profile, company metadata, team roster, and datasets.
          </p>
        </header>

        {/* Action Status Banners */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-start gap-3 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Operation Failed</span>
              <p className="opacity-90 mt-0.5">{errorMessage}</p>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-3 text-sm">
            <Check className="w-5 h-5" />
            <p className="font-semibold">{successMessage}</p>
          </div>
        )}

        {/* Tab Buttons */}
        <div className="flex border-b border-slate-900 mb-8 gap-4 text-sm font-medium">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-3 border-b-2 transition ${activeTab === 'profile' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            Personal Profile
          </button>
          {isAdmin ? (
            <>
              <button
                onClick={() => setActiveTab('workspace')}
                className={`pb-3 border-b-2 transition ${activeTab === 'workspace' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Workspace Profile
              </button>
              <button
                onClick={() => setActiveTab('teammates')}
                className={`pb-3 border-b-2 transition ${activeTab === 'teammates' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Manage Roster
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`pb-3 border-b-2 transition ${activeTab === 'data' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                Upload History
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`pb-3 border-b-2 transition ${activeTab === 'logs' ? 'border-indigo-500 text-white' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
              >
                System Logs
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 pb-3 text-slate-600 text-xs">
              <ShieldAlert className="w-3.5 h-3.5" /> Company tabs hidden (Admin Only)
            </div>
          )}
        </div>

        {/* Tab 1: Profile Settings */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Key className="w-5 h-5 text-indigo-400" /> Account Security Details
            </h2>
            <p className="text-slate-400 text-sm">
              Keep your profile up to date and manage your sign-in password.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Email Address (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || ''}
                  className="w-full bg-slate-950/50 border border-slate-900 rounded-xl px-4 py-2.5 text-sm text-slate-500 cursor-not-allowed"
                />
              </div>

              <div className="pt-4 border-t border-slate-850 space-y-4">
                <h3 className="text-sm font-semibold text-white">Change Credentials Password</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">Current Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-400">New Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="space-y-1 max-w-sm">
                  <label className="text-xs font-semibold text-slate-400">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 transition"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Save Changes
              </button>
            </form>
          </div>
        )}

        {/* Tab 2: Workspace Settings (Admin Only) */}
        {activeTab === 'workspace' && isAdmin && (
          <div className="max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" /> Workspace Settings
            </h2>
            <p className="text-slate-400 text-sm">
              Configure parameters that dictate localization values and formatting across the dashboard.
            </p>

            <form onSubmit={handleSaveWorkspace} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Company / Workspace Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Currency Localization</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="GBP">GBP (£)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-400">Fiscal Year Start Month</label>
                  <select
                    value={fiscalYearStart}
                    onChange={(e) => setFiscalYearStart(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value={1}>January</option>
                    <option value={4}>April</option>
                    <option value={7}>July</option>
                    <option value={10}>October</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Corporate Branding Logo URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Google Maps API Key (Optional)</label>
                <input
                  type="password"
                  placeholder="Enter AIzaSy... key to render real maps"
                  value={googleMapsKey}
                  onChange={(e) => setGoogleMapsKey(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="space-y-1 max-w-sm">
                <label className="text-xs font-semibold text-slate-400">Theme Primary Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="w-10 h-10 border-0 bg-transparent cursor-pointer rounded-xl"
                  />
                  <input
                    type="text"
                    value={themeColor}
                    onChange={(e) => setThemeColor(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2 transition"
              >
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Update Configurations
              </button>
            </form>
          </div>
        )}

        {/* Tab 3: Teammates Manager (Admin Only) */}
        {activeTab === 'teammates' && isAdmin && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Add Teammate Form */}
            <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-6 h-fit space-y-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-400" /> Invite Member
              </h3>
              <p className="text-slate-400 text-xs leading-normal">
                Add team profiles. Invited colleagues can sign in immediately using their email and default password: <strong>teammate123</strong>
              </p>

              <form onSubmit={handleInviteTeammate} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Teammate Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="teammate@company.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Workspace Role</label>
                  <select
                    value={inviteRole}
                    onChange={(e: any) => setInviteRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="viewer">Viewer (Read Only)</option>
                    <option value="analyst">Analyst (Upload + Filters)</option>
                    <option value="admin">Admin (Full Control)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg py-2 font-semibold text-xs transition mt-2 flex items-center justify-center gap-1.5"
                >
                  {actionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-3.5 h-3.5" />}
                  Add Teammate
                </button>
              </form>
            </div>

            {/* Teammates List */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-indigo-400" /> Active Roster ({teammates.length})
              </h3>
              
              <div className="divide-y divide-slate-850">
                {teammates.map((member) => (
                  <div key={member._id} className="py-4 flex justify-between items-center text-sm">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{member.name || 'Unnamed Team Member'}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${member.role === 'admin' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : member.role === 'analyst' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-800'}`}>
                          {member.role}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Mail className="w-3.5 h-3.5" /> {member.email}
                      </p>
                    </div>

                    {member._id !== currentUser.id && (
                      <button
                        type="button"
                        onClick={() => handleDeleteTeammate(member._id, member.email)}
                        className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/5 rounded-lg transition"
                        title="Remove member"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Upload History & Deletion (Admin Only) */}
        {activeTab === 'data' && isAdmin && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-400" /> Data Ingestion History
                </h2>
                <p className="text-slate-400 text-sm mt-1">
                  Trace uploaded CSVs and clear outdated rows to import fresh datasets.
                </p>
              </div>
              <button 
                onClick={() => router.push('/upload')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Database className="w-3.5 h-3.5" /> Upload CSV
              </button>
            </div>

            {uploads.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/30 flex flex-col items-center">
                <Database className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-sm font-semibold text-slate-400">No datasets uploaded yet</span>
                <p className="text-xs text-slate-500 mt-1">Import a transactional sales CSV to populate dashboard reports.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Filename</th>
                      <th className="py-3 px-4">Imported At</th>
                      <th className="py-3 px-4 text-center">Row Count</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {uploads.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-950/20 text-xs transition">
                        <td className="py-3 px-4 font-semibold text-white">{log.filename}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(log.uploadedAt).toLocaleDateString('en-IN', {
                            day: '2-digit', month: 'short', year: 'numeric',
                            hour: '2-digit', minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4 text-center text-white">{log.rowCount.toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            type="button"
                            onClick={() => handleDeleteUpload(log._id, log.filename)}
                            className="text-slate-500 hover:text-red-400 p-2 hover:bg-red-500/5 rounded-lg transition inline-flex"
                            title="Delete upload and sales records"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 5: Audit Logs (Admin Only) */}
        {activeTab === 'logs' && isAdmin && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 space-y-6 animate-fadeIn">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" /> System Audit Logs
              </h2>
              <p className="text-slate-400 text-sm mt-1">
                Real-time tracking of security operations and data ingestions inside your company workspace.
              </p>
            </div>

            {auditLogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-slate-950/30 flex flex-col items-center">
                <History className="w-8 h-8 text-slate-600 mb-2" />
                <span className="text-sm font-semibold text-slate-400">No system events logged yet</span>
                <p className="text-xs text-slate-500 mt-1">Audit events will be logged as users upload or clear datasets.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-850 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Event Action</th>
                      <th className="py-3 px-4">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850">
                    {auditLogs.map((log) => (
                      <tr key={log._id} className="hover:bg-slate-950/20 text-xs transition">
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(log.createdAt).toLocaleString('en-IN')}
                        </td>
                        <td className="py-3 px-4 text-white">
                          <span className="font-semibold">{log.userId?.name || 'System Auto'}</span>
                          <span className="text-[10px] text-slate-400 block">{log.userId?.email || 'automated@salesiq.app'}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${log.action.includes('DELETE') || log.action.includes('REMOVE') ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-300 font-mono text-[10px]">
                          {JSON.stringify(log.details)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
