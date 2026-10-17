import React, { useState } from "react";
import { UserPlus, Save, ShieldCheck, UserRoundX } from "lucide-react";
import { createStaffLogin } from "../firebase/client";
import { STAFF_ROLE_LABELS, STAFF_ROLES, StaffMember, StaffPermissions } from "../firebase/data";

const emptyRoles = (): StaffPermissions => Object.fromEntries(STAFF_ROLES.map((role) => [role, false])) as StaffPermissions;

export function StaffManager({ members, onSave }: {
  members: StaffMember[];
  onSave: (member: StaffMember) => Promise<void>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [roles, setRoles] = useState<StaffPermissions>(emptyRoles);
  const [creating, setCreating] = useState(false);
  const [savingUid, setSavingUid] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!STAFF_ROLES.some((role) => roles[role])) {
      setError("اختر صلاحية واحدة على الأقل للموظف قبل إنشاء الحساب.");
      return;
    }
    setCreating(true); setError(""); setSuccess("");
    try {
      const uid = await createStaffLogin(email, password);
      await onSave({ uid, name, email, active: true, roles });
      setName(""); setEmail(""); setPassword(""); setRoles(emptyRoles());
      setSuccess("تم إنشاء حساب الموظف. احتفظ ببيانات الدخول وأرسلها له بنفسك.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "تعذر إنشاء حساب الموظف.");
    } finally { setCreating(false); }
  };

  const update = async (member: StaffMember, changes: Partial<StaffMember>) => {
    setSavingUid(member.uid); setError(""); setSuccess("");
    try { await onSave({ ...member, ...changes }); setSuccess("تم حفظ صلاحيات الموظف."); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "تعذر حفظ التغييرات."); }
    finally { setSavingUid(""); }
  };

  return <section className="space-y-5">
    <header><div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-emerald-800"/><h2 className="text-xl font-black">إدارة الموظفين والصلاحيات</h2></div><p className="mt-1 text-sm text-stone-500">أنشئ حسابًا لكل موظف وحدد الصفحات التي يمكنه إدارتها.</p></header>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
    {success && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{success}</p>}
    <form onSubmit={create} className="grid gap-3 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-5">
      <h3 className="sm:col-span-2 font-black">إضافة موظف جديد</h3>
      <label className="text-xs font-bold text-stone-600">اسم الموظف<input required value={name} onChange={(event) => setName(event.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label>
      <label className="text-xs font-bold text-stone-600">البريد الإلكتروني<input required type="email" dir="ltr" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label>
      <label className="text-xs font-bold text-stone-600">كلمة مرور مؤقتة (6 أحرف على الأقل)<input required minLength={6} type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm" /></label>
      <div className="flex flex-wrap gap-x-4 gap-y-2 sm:col-span-2">{STAFF_ROLES.map((role) => <label key={role} className="flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={roles[role]} onChange={(event) => setRoles((current) => ({ ...current, [role]: event.target.checked }))}/>{STAFF_ROLE_LABELS[role]}</label>)}</div>
      <button disabled={creating} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-black text-white disabled:opacity-50 sm:col-span-2"><UserPlus className="h-4 w-4"/>{creating ? "جارٍ إنشاء الحساب…" : "إنشاء حساب الموظف"}</button>
    </form>
    <div className="space-y-3">{members.length === 0 ? <p className="rounded-2xl border border-dashed border-stone-300 p-6 text-center text-sm text-stone-500">لا يوجد موظفون مضافون حتى الآن.</p> : members.map((member) => <article key={member.uid} className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-black">{member.name}</h3><p dir="ltr" className="mt-1 text-right text-xs text-stone-500">{member.email}</p></div><button disabled={savingUid === member.uid} onClick={() => void update(member, { active: !member.active })} className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold ${member.active ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-700"}`}>{member.active ? <><ShieldCheck className="h-4 w-4"/>الحساب مفعّل · إيقاف</> : <><UserRoundX className="h-4 w-4"/>الحساب موقوف · تفعيل</>}</button></div>
      <div className="mt-4 grid gap-2 border-t border-stone-100 pt-4 sm:grid-cols-2 lg:grid-cols-4">{STAFF_ROLES.map((role) => <label key={role} className="flex items-center gap-2 rounded-lg bg-stone-50 px-3 py-2 text-xs font-semibold"><input type="checkbox" disabled={savingUid === member.uid} checked={member.roles?.[role] === true} onChange={(event) => void update(member, { roles: { ...emptyRoles(), ...member.roles, [role]: event.target.checked } })}/>{STAFF_ROLE_LABELS[role]}</label>)}</div>
      {savingUid === member.uid && <p className="mt-2 text-xs text-stone-500">جارٍ الحفظ… <Save className="inline h-3 w-3"/></p>}
    </article>)}</div>
  </section>;
}
