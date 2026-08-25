'use client';

import { useState, useTransition } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Building2,
  UserCheck,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  XCircle,
  AlertCircle,
  KeyRound,
  Mail,
  User,
  Trash2,
  Edit2,
  Lock,
} from 'lucide-react';
import {
  StaffAccount,
  StaffActionResult,
  createStaffAccountAction,
  updateStaffRoleAction,
  toggleStaffStatusAction,
  deleteStaffAccountAction,
} from '../../../../lib/staff/actions';
import { StaffRole } from '../../../../lib/types/database.types';

interface StaffManagerProps {
  initialStaff: StaffAccount[];
  currentUserRole: StaffRole;
  currentUserId: string;
  hotelName: string;
}

const ROLE_CONFIG: Record<
  StaffRole,
  { label: string; icon: any; badgeClass: string; desc: string }
> = {
  owner: {
    label: 'Owner',
    icon: Building2,
    badgeClass: 'bg-brand-forest/15 text-brand-forest border-brand-forest/20',
    desc: 'Full administrative access to all modules, billing, staff, and GST settings.',
  },
  manager: {
    label: 'Manager',
    icon: Shield,
    badgeClass: 'bg-status-blue/15 text-status-blue border-status-blue/20',
    desc: 'Operational management, bookings, rooms, billing, and reports.',
  },
  reception: {
    label: 'Reception',
    icon: UserCheck,
    badgeClass: 'bg-status-amber/15 text-status-amber border-status-amber/20',
    desc: 'Front-desk operations, check-ins, reservations, folios, and collections.',
  },
  housekeeping: {
    label: 'Housekeeping',
    icon: Sparkles,
    badgeClass: 'bg-status-orange/15 text-status-orange border-status-orange/20',
    desc: 'Live room chart view, cleaning status updates, and inventory loss logging.',
  },
};

export default function StaffManager({
  initialStaff,
  currentUserRole,
  currentUserId,
  hotelName,
}: StaffManagerProps) {
  const [staffList, setStaffList] = useState<StaffAccount[]>(initialStaff);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffAccount | null>(null);
  const [roleChangeModalOpen, setRoleChangeModalOpen] = useState(false);
  const [newRole, setNewRole] = useState<StaffRole>('reception');
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  // Form states for Add Staff modal
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<StaffRole>('reception');
  const [addError, setAddError] = useState<string | null>(null);

  const isOwner = currentUserRole === 'owner';

  // Stats
  const totalCount = staffList.length;
  const activeCount = staffList.filter((s) => s.is_active).length;
  const ownerCount = staffList.filter((s) => s.role === 'owner').length;
  const managerCount = staffList.filter((s) => s.role === 'manager').length;
  const frontDeskCount = staffList.filter((s) => s.role === 'reception').length;
  const housekeepingCount = staffList.filter((s) => s.role === 'housekeeping').length;

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    const formData = new FormData();
    formData.append('full_name', fullName);
    formData.append('email', email);
    formData.append('password', password);
    formData.append('role', role);

    startTransition(async () => {
      const res = await createStaffAccountAction(null, formData);
      if (res.success && res.staff) {
        setStaffList((prev) => [...prev, res.staff!]);
        setIsAddModalOpen(false);
        setFullName('');
        setEmail('');
        setPassword('');
        setRole('reception');
        setStatusMessage({ type: 'success', text: res.message || 'Staff member added successfully.' });
      } else {
        setAddError(res.error || 'Failed to add staff member.');
      }
    });
  };

  const handleToggleStatus = (staff: StaffAccount) => {
    if (staff.id === currentUserId) {
      alert('You cannot deactivate your own active session.');
      return;
    }

    const nextState = !staff.is_active;
    const confirmMsg = nextState
      ? `Activate access for ${staff.full_name}?`
      : `Deactivate ${staff.full_name}? They will not be able to log in.`;

    if (!window.confirm(confirmMsg)) return;

    startTransition(async () => {
      const res = await toggleStaffStatusAction(staff.id, nextState);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === staff.id ? { ...s, is_active: nextState } : s))
        );
        setStatusMessage({ type: 'success', text: res.message || 'Status updated.' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to update status.' });
      }
    });
  };

  const handleRoleChangeSubmit = () => {
    if (!selectedStaff) return;

    startTransition(async () => {
      const res = await updateStaffRoleAction(selectedStaff.id, newRole);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((s) => (s.id === selectedStaff.id ? { ...s, role: newRole } : s))
        );
        setRoleChangeModalOpen(false);
        setSelectedStaff(null);
        setStatusMessage({ type: 'success', text: res.message || 'Role updated successfully.' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to update role.' });
      }
    });
  };

  const handleDeleteStaff = (staff: StaffAccount) => {
    if (staff.id === currentUserId) {
      alert('You cannot remove your own active account.');
      return;
    }

    if (!window.confirm(`Permanently remove staff account "${staff.full_name}" (${staff.email})?`)) {
      return;
    }

    startTransition(async () => {
      const res = await deleteStaffAccountAction(staff.id);
      if (res.success) {
        setStaffList((prev) => prev.filter((s) => s.id !== staff.id));
        setStatusMessage({ type: 'success', text: res.message || 'Staff member removed.' });
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to delete staff member.' });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {statusMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm ${
            statusMessage.type === 'success'
              ? 'bg-status-green/10 border-status-green/20 text-status-green'
              : 'bg-action-danger/10 border-action-danger/20 text-action-danger'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-xs hover:underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header action toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-border-subtle shadow-2xs">
        <div>
          <h2 className="text-h2 font-serif text-brand-forest">{hotelName} Staff Roster</h2>
          <p className="text-body text-ink-muted text-xs sm:text-sm mt-0.5">
            Manage user authorization, operational roles, and team credentials scoped to this property
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setAddError(null);
            setIsAddModalOpen(true);
          }}
          className="pms-btn-primary flex items-center justify-center gap-2 cursor-pointer text-xs font-semibold py-2.5 px-4 rounded-xl"
        >
          <UserPlus className="w-4 h-4" />
          <span>+ Add Staff Member</span>
        </button>
      </div>

      {/* Role Counts Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-ink-muted font-bold block">
            Total Staff
          </span>
          <span className="text-2xl font-serif font-bold text-ink mt-1 block">
            {totalCount} <span className="text-xs font-sans text-status-green font-semibold">({activeCount} Active)</span>
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-status-blue font-bold block">
            Management
          </span>
          <span className="text-2xl font-serif font-bold text-ink mt-1 block">
            {ownerCount + managerCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-status-amber font-bold block">
            Front Desk
          </span>
          <span className="text-2xl font-serif font-bold text-ink mt-1 block">
            {frontDeskCount}
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-border-subtle shadow-2xs">
          <span className="text-[11px] uppercase tracking-wider text-status-orange font-bold block">
            Housekeeping
          </span>
          <span className="text-2xl font-serif font-bold text-ink mt-1 block">
            {housekeepingCount}
          </span>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-white rounded-2xl border border-border-subtle shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-border-subtle flex items-center justify-between">
          <h3 className="font-serif font-bold text-ink text-sm">Active Staff Members ({staffList.length})</h3>
          <span className="text-xs text-ink-muted">Tenant ID: {staffList[0]?.hotel_id?.slice(0, 8)}...</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-brand-sand/40 border-b border-border-subtle text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              <tr>
                <th className="py-3.5 px-4">Staff Member</th>
                <th className="py-3.5 px-4">Role Assignment</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Created Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {staffList.map((staff) => {
                const config = ROLE_CONFIG[staff.role] || ROLE_CONFIG.reception;
                const RoleIcon = config.icon;
                const isSelf = staff.id === currentUserId;

                return (
                  <tr key={staff.id} className="hover:bg-brand-sand/20 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-forest/10 text-brand-forest flex items-center justify-center font-bold text-xs shrink-0">
                          {staff.full_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-ink flex items-center gap-2">
                            <span>{staff.full_name}</span>
                            {isSelf && (
                              <span className="text-[10px] bg-brand-forest text-white px-1.5 py-0.2 rounded font-bold">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-ink-muted font-mono">{staff.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.badgeClass}`}
                        >
                          <RoleIcon className="w-3.5 h-3.5" />
                          <span>{config.label}</span>
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          staff.is_active
                            ? 'bg-status-green/15 text-status-green'
                            : 'bg-action-danger/15 text-action-danger'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.is_active ? 'bg-status-green' : 'bg-action-danger'}`} />
                        <span>{staff.is_active ? 'Active' : 'Deactivated'}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-xs text-ink-muted">
                      {staff.created_at ? new Date(staff.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Initial Seed'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {staff.role === 'owner' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-ink-muted font-medium px-2 py-0.5 rounded-md bg-brand-sand">
                            <Lock className="w-3 h-3 text-brand-forest" />
                            <span>Primary Owner</span>
                          </span>
                        ) : (
                          <>
                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedStaff(staff);
                                  setNewRole(staff.role);
                                  setRoleChangeModalOpen(true);
                                }}
                                className="p-1.5 hover:bg-brand-sand rounded-lg text-ink-muted hover:text-brand-forest transition-colors cursor-pointer"
                                title="Change Operational Role"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(staff)}
                              className={`p-1.5 hover:bg-brand-sand rounded-lg transition-colors cursor-pointer ${
                                staff.is_active ? 'text-action-danger hover:text-action-danger-dark' : 'text-status-green'
                              }`}
                              title={staff.is_active ? 'Deactivate Staff' : 'Activate Staff'}
                            >
                              {staff.is_active ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
                            </button>

                            {isOwner && (
                              <button
                                type="button"
                                onClick={() => handleDeleteStaff(staff)}
                                className="p-1.5 hover:bg-action-danger/10 text-ink-muted hover:text-action-danger rounded-lg transition-colors cursor-pointer"
                                title="Remove Staff Account"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border-subtle">
            <div className="flex items-center justify-between pb-3 border-b border-border-subtle">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-brand-forest text-white rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-ink text-base">Add Staff Member</h3>
                  <p className="text-caption text-ink-muted text-xs">Directly bound to {hotelName}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-ink-muted hover:text-ink text-sm p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {addError && (
              <div className="mt-4 p-3 bg-action-danger/10 border border-action-danger/20 rounded-lg text-xs text-action-danger flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleAddStaff} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-9 pr-3 py-2 bg-brand-sand/40 border border-border-subtle rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Work Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ramesh@hotelgreeneryview.com"
                    className="w-full pl-9 pr-3 py-2 bg-brand-sand/40 border border-border-subtle rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Password * (minimum 6 characters)</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-brand-sand/40 border border-border-subtle rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1">Role Assignment *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as StaffRole)}
                  className="w-full px-3 py-2 bg-brand-sand/40 border border-border-subtle rounded-lg text-sm text-ink focus:outline-none focus:ring-2 focus:ring-brand-forest"
                >
                  <option value="manager">Manager (Operations, Bookings & Reports)</option>
                  <option value="reception">Reception (Front Desk, Bookings & Billing)</option>
                  <option value="housekeeping">Housekeeping (Room Chart & Status Only)</option>
                </select>
                <p className="text-[11px] text-ink-muted mt-1">{ROLE_CONFIG[role]?.desc}</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-ink-muted hover:text-ink rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="pms-btn-primary text-xs font-semibold py-2 px-4 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  {isPending ? 'Creating Account...' : 'Add Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Change Modal */}
      {roleChangeModalOpen && selectedStaff && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-border-subtle">
            <h3 className="font-serif font-bold text-ink text-base">Modify Role Assignment</h3>
            <p className="text-xs text-ink-muted mt-1">
              Select operational role for <strong>{selectedStaff.full_name}</strong>
            </p>

            <div className="mt-4 space-y-2">
              {(['manager', 'reception', 'housekeeping'] as StaffRole[]).map((r) => {
                const conf = ROLE_CONFIG[r];
                const Icon = conf.icon;
                const isSelected = newRole === r;

                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setNewRole(r)}
                    className={`w-full text-left p-3 rounded-xl border flex items-start gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-brand-forest bg-brand-sand/50 shadow-2xs'
                        : 'border-border-subtle hover:bg-brand-sand/20'
                    }`}
                  >
                    <div className="p-1.5 rounded-lg bg-white border border-border-subtle mt-0.5">
                      <Icon className="w-4 h-4 text-brand-forest" />
                    </div>
                    <div>
                      <span className="font-semibold text-xs text-ink block">{conf.label}</span>
                      <span className="text-[11px] text-ink-muted line-clamp-1">{conf.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRoleChangeModalOpen(false)}
                className="px-3 py-1.5 text-xs text-ink-muted hover:text-ink cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleRoleChangeSubmit}
                className="pms-btn-primary text-xs font-semibold py-1.5 px-4 rounded-lg cursor-pointer"
              >
                {isPending ? 'Updating...' : 'Save Role'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

