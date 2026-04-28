import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const emptySite = {
  id: "",
  dbId: "",
  name: "",
  customer: "",
  city: "",
  state: "",
  address: "",
  status: "Active",
  primaryContact: "",
  contactEmail: "",
  contactPhone: "",
  systemTypes: [],
  installedSystems: "",
  notes: "",
  salesforceUrl: "",
  zohoProjectsUrl: "",
  zohoDeskUrl: "",
  sharepointUrl: "",
  deployments: [],
  changeHistory: [],
};

const systemTypeOptions = ["IPTV", "Video Wall", "Aetria", "Broadcast TV Headend", "KLV / ISR", "Other"];
const statuses = ["Active", "Planning", "Inactive", "Completed", "At Risk"];
const changeTypes = ["Hardware", "Firmware", "Software", "Configuration", "Network", "License", "Other"];
const changeReasons = ["Upgrade", "Patch", "Replacement", "Troubleshooting", "Commissioning", "Customer Request", "Rollback", "Other"];

const css = `
* { box-sizing: border-box; }
body { margin: 0; }
.app { min-height: 100vh; background: #f8fafc; color: #0f172a; padding: 24px; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; }
.shell { max-width: 1380px; margin: 0 auto; display: grid; gap: 20px; }
.header { background: white; border-radius: 24px; padding: 22px; display: flex; justify-content: space-between; gap: 16px; align-items: center; box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06); }
.eyebrow { color: #1d4ed8; font-size: 14px; font-weight: 700; }
h1, h2, h3, p { margin-top: 0; }
h1 { margin-bottom: 4px; font-size: 34px; }
h2 { margin-bottom: 6px; }
h3 { margin-bottom: 14px; }
p { color: #64748b; }
button { border: 0; border-radius: 14px; background: #2563eb; color: white; font-weight: 700; padding: 10px 14px; cursor: pointer; }
button:disabled { opacity: .45; cursor: not-allowed; }
button.secondary { background: white; color: #334155; border: 1px solid #cbd5e1; }
button.ghost { background: transparent; color: #334155; border: 1px solid transparent; padding-left: 0; }
.button-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
.card { background: white; border-radius: 22px; padding: 18px; box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06); }
.stats { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 14px; }
.stat { background: white; border-radius: 20px; padding: 18px; box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06); }
.stat-value { font-size: 28px; font-weight: 800; }
.stat-label { color: #64748b; font-size: 14px; }
.toolbar { display: grid; grid-template-columns: 1.5fr 220px 240px auto; gap: 10px; align-items: center; }
input, textarea, select { width: 100%; border: 1px solid #cbd5e1; border-radius: 12px; padding: 10px 12px; font: inherit; outline: none; background: white; }
input:focus, textarea:focus, select:focus { border-color: #2563eb; box-shadow: 0 0 0 4px rgba(37, 99, 235, .12); }
.table-wrap { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
th, td { border-bottom: 1px solid #e2e8f0; padding: 13px 12px; text-align: left; font-size: 14px; vertical-align: middle; }
th { color: #475569; background: #f8fafc; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
.site-row { cursor: pointer; }
.site-row:hover { background: #eff6ff; }
.site-name { font-weight: 800; color: #0f172a; }
.muted { color: #64748b; font-size: 14px; }
.tag-row, .chip-row { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px; }
.tag, .chip { border-radius: 999px; padding: 6px 10px; font-size: 12px; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
.chip { background: white; font-size: 14px; }
.chip.selected { background: #dbeafe; color: #1d4ed8; border-color: #60a5fa; }
.status-pill { display: inline-flex; border-radius: 999px; padding: 5px 10px; font-size: 12px; font-weight: 800; border: 1px solid #cbd5e1; background: #f1f5f9; color: #334155; white-space: nowrap; }
.status-active { background: #dcfce7; color: #166534; border-color: #bbf7d0; }
.status-planning { background: #dbeafe; color: #1e40af; border-color: #bfdbfe; }
.status-completed { background: #f3e8ff; color: #6b21a8; border-color: #e9d5ff; }
.status-at-risk, .status-awaiting-sow { background: #ffedd5; color: #9a3412; border-color: #fed7aa; }
.detail-page { display: grid; gap: 18px; }
.detail-header { background: white; border-radius: 22px; padding: 22px; box-shadow: 0 1px 8px rgba(15, 23, 42, 0.06); display: flex; justify-content: space-between; gap: 18px; align-items: flex-start; }
.detail-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 18px; }
.info-row { margin-bottom: 12px; }
.info-label { color: #94a3b8; font-size: 12px; text-transform: uppercase; font-weight: 800; letter-spacing: .04em; }
.link-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.link-button { background: white; color: #334155; border: 1px solid #cbd5e1; }
.link-button.disabled { opacity: .5; }
.card-title-row { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin-bottom: 10px; }
.card-title-row h3 { margin-bottom: 0; }
.report-filters { display: grid; grid-template-columns: 1.5fr 220px 220px auto; gap: 10px; align-items: center; margin-bottom: 12px; }
.modal-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, .45); display: flex; align-items: center; justify-content: center; padding: 18px; z-index: 50; }
.modal { width: min(100%, 980px); max-height: 92vh; background: white; border-radius: 22px; overflow: hidden; box-shadow: 0 20px 60px rgba(15, 23, 42, .28); display: flex; flex-direction: column; }
.small-modal { width: min(100%, 880px); }
.modal-header, .modal-footer { padding: 18px 22px; display: flex; align-items: center; justify-content: space-between; gap: 12px; border-bottom: 1px solid #e2e8f0; flex-shrink: 0; }
.modal-footer { border-bottom: 0; border-top: 1px solid #e2e8f0; justify-content: flex-end; background: white; }
.modal-body { overflow: auto; padding: 22px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.wide { grid-column: 1 / -1; }
.two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.field { display: grid; gap: 6px; margin-bottom: 12px; color: #334155; font-size: 14px; font-weight: 700; }
.login-page { min-height: calc(100vh - 48px); display: grid; place-items: center; }
.login-card { width: min(100%, 440px); background: white; border-radius: 24px; padding: 28px; box-shadow: 0 1px 18px rgba(15, 23, 42, 0.12); }
.auth-message { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 14px; padding: 10px 12px; color: #334155; }
@media (max-width: 1000px) { .toolbar, .detail-grid, .form-grid, .two-col, .stats, .report-filters { grid-template-columns: 1fr; } .header, .detail-header, .card-title-row { flex-direction: column; align-items: stretch; } }
`;

function makeEmptyChange() {
  return {
    date: new Date().toISOString().slice(0, 10),
    type: "Firmware",
    product: "",
    component: "",
    previousVersion: "",
    newVersion: "",
    changedBy: "",
    relatedDeployment: "",
    reason: "",
    notes: "",
  };
}

function nextSiteId(sites) {
  const max = sites.map((site) => Number(String(site.id).replace("SITE-", ""))).filter(Boolean).reduce((acc, value) => Math.max(acc, value), 1000);
  return `SITE-${max + 1}`;
}

function nextChangeId(sites) {
  const max = sites.flatMap((site) => site.changeHistory || []).map((change) => Number(String(change.id).replace("CHG-", ""))).filter(Boolean).reduce((acc, value) => Math.max(acc, value), 1000);
  return `CHG-${max + 1}`;
}

function classForStatus(status) {
  return String(status || "").toLowerCase().split(" ").join("-").split("/").join("");
}

function rowsToCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const quote = String.fromCharCode(34);
  const newline = String.fromCharCode(10);
  const escapeCsvValue = (value) => quote + String(value ?? "").split(quote).join(quote + quote) + quote;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","))].join(newline);
}

function runHelperTests() {
  const testSites = [{ id: "SITE-1002", changeHistory: [{ id: "CHG-1004" }] }];
  console.assert(nextSiteId(testSites) === "SITE-1003", "nextSiteId increments highest site id");
  console.assert(nextChangeId(testSites) === "CHG-1005", "nextChangeId increments highest change id");
  console.assert(rowsToCsv([{ name: "quoted value", count: 2 }]).split(String.fromCharCode(10)).length === 2, "rowsToCsv includes header and data rows");
}
runHelperTests();

function mapDbSiteToUi(site) {
  return {
    dbId: site.id,
    id: site.site_code || site.id,
    name: site.name || "",
    customer: site.customer || "",
    city: site.city || "",
    state: site.state || "",
    address: site.address || "",
    status: site.status || "Active",
    primaryContact: site.primary_contact || "",
    contactEmail: site.contact_email || "",
    contactPhone: site.contact_phone || "",
    systemTypes: site.system_types || [],
    installedSystems: site.installed_systems || "",
    notes: site.notes || "",
    salesforceUrl: site.salesforce_url || "",
    zohoProjectsUrl: site.zoho_projects_url || "",
    zohoDeskUrl: site.zoho_desk_url || "",
    sharepointUrl: site.sharepoint_url || "",
    deployments: (site.deployments || []).map((deployment) => ({
      dbId: deployment.id,
      id: deployment.deployment_code || deployment.id,
      name: deployment.name || "",
      status: deployment.status || "Active",
      owner: deployment.owner || "",
      projectUrl: deployment.project_url || "",
    })),
    changeHistory: (site.site_changes || []).map((change) => ({
      dbId: change.id,
      id: change.change_code || change.id,
      date: change.change_date || "",
      type: change.change_type || "",
      product: change.product || "",
      component: change.component || "",
      previousVersion: change.previous_version || "",
      newVersion: change.new_version || "",
      changedBy: change.changed_by || "",
      relatedDeployment: change.related_deployment || "",
      reason: change.reason || "",
      notes: change.notes || "",
    })),
  };
}

function StatusPill({ status }) {
  return <span className={`status-pill status-${classForStatus(status)}`}>{status}</span>;
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input type={type} value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function TextArea({ label, value, onChange }) {
  return (
    <label className="field">
      <span>{label}</span>
      <textarea rows={4} value={value || ""} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function SelectField({ label, value, onChange, options }) {
  return (
    <label className="field">
      <span>{label}</span>
      <select value={value || ""} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option} value={option}>{option || "None / Not set"}</option>)}
      </select>
    </label>
  );
}

function SiteForm({ initialSite, onCancel, onSave }) {
  const [form, setForm] = useState({ ...initialSite, systemTypes: initialSite.systemTypes || [], deployments: initialSite.deployments || [], changeHistory: initialSite.changeHistory || [] });
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const canSave = Boolean(form.name.trim() && form.customer.trim() && form.city.trim() && form.state.trim());

  const toggleSystem = (type) => {
    setForm((current) => ({
      ...current,
      systemTypes: current.systemTypes.includes(type) ? current.systemTypes.filter((item) => item !== type) : [...current.systemTypes, type],
    }));
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-header">
          <div>
            <h2>{form.id ? "Edit Site" : "Create Site"}</h2>
            <p>Required fields: site name, customer, city, and state.</p>
          </div>
          <button className="icon-button" onClick={onCancel} aria-label="Close site form">×</button>
        </div>

        <div className="modal-body">
          <div className="form-grid">
            <section>
              <h3>Site Details</h3>
              <Field label="Site Name *" value={form.name} onChange={(value) => update("name", value)} />
              <Field label="Customer *" value={form.customer} onChange={(value) => update("customer", value)} />
              <div className="two-col">
                <Field label="City *" value={form.city} onChange={(value) => update("city", value)} />
                <Field label="State *" value={form.state} onChange={(value) => update("state", value.toUpperCase().slice(0, 2))} />
              </div>
              <Field label="Address" value={form.address} onChange={(value) => update("address", value)} />
              <SelectField label="Status" value={form.status} onChange={(value) => update("status", value)} options={statuses} />
            </section>

            <section>
              <h3>Contact</h3>
              <Field label="Primary Contact" value={form.primaryContact} onChange={(value) => update("primaryContact", value)} />
              <Field label="Email" value={form.contactEmail} onChange={(value) => update("contactEmail", value)} />
              <Field label="Phone" value={form.contactPhone} onChange={(value) => update("contactPhone", value)} />
            </section>

            <section className="wide">
              <h3>Installed Systems</h3>
              <div className="chip-row">
                {systemTypeOptions.map((type) => (
                  <button key={type} type="button" className={form.systemTypes.includes(type) ? "chip selected" : "chip"} onClick={() => toggleSystem(type)}>{type}</button>
                ))}
              </div>
              <TextArea label="Installed System Summary" value={form.installedSystems} onChange={(value) => update("installedSystems", value)} />
              <TextArea label="Notes" value={form.notes} onChange={(value) => update("notes", value)} />
            </section>

            <section className="wide">
              <h3>External Links / Future Integration Fields</h3>
              <div className="two-col">
                <Field label="Salesforce URL" value={form.salesforceUrl} onChange={(value) => update("salesforceUrl", value)} />
                <Field label="Zoho Projects URL" value={form.zohoProjectsUrl} onChange={(value) => update("zohoProjectsUrl", value)} />
                <Field label="Zoho Desk URL" value={form.zohoDeskUrl} onChange={(value) => update("zohoDeskUrl", value)} />
                <Field label="SharePoint / Documentation URL" value={form.sharepointUrl} onChange={(value) => update("sharepointUrl", value)} />
              </div>
            </section>
          </div>
        </div>

        <div className="modal-footer">
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button className="primary-save" disabled={!canSave} onClick={() => onSave(form)}>{form.id ? "Save Changes" : "Create Site"}</button>
        </div>
      </div>
    </div>
  );
}

function ChangeForm({ onCancel, onSave, siteDeployments }) {
  const [form, setForm] = useState(makeEmptyChange());
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const canSave = Boolean(form.date && form.type && form.product.trim());

  return (
    <div className="modal-backdrop">
      <div className="modal small-modal">
        <div className="modal-header">
          <div>
            <h2>Add Hardware / Firmware / Software Change</h2>
            <p>Track what changed, when it changed, and why.</p>
          </div>
          <button className="icon-button" onClick={onCancel} aria-label="Close change form">×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <Field label="Date *" type="date" value={form.date} onChange={(value) => update("date", value)} />
            <SelectField label="Change Type *" value={form.type} onChange={(value) => update("type", value)} options={changeTypes} />
            <Field label="Product / Platform *" value={form.product} onChange={(value) => update("product", value)} />
            <Field label="Component / Device" value={form.component} onChange={(value) => update("component", value)} />
            <Field label="Previous Version / Model" value={form.previousVersion} onChange={(value) => update("previousVersion", value)} />
            <Field label="New Version / Model" value={form.newVersion} onChange={(value) => update("newVersion", value)} />
            <Field label="Changed By" value={form.changedBy} onChange={(value) => update("changedBy", value)} />
            <SelectField label="Reason" value={form.reason} onChange={(value) => update("reason", value)} options={["", ...changeReasons]} />
            <label className="field">
              <span>Related Deployment</span>
              <select value={form.relatedDeployment} onChange={(event) => update("relatedDeployment", event.target.value)}>
                <option value="">None / Not linked</option>
                {siteDeployments.map((deployment) => <option key={deployment.id} value={deployment.id}>{deployment.id} - {deployment.name}</option>)}
              </select>
            </label>
            <div />
            <div className="wide"><TextArea label="Notes" value={form.notes} onChange={(value) => update("notes", value)} /></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button className="primary-save" disabled={!canSave} onClick={() => onSave(form)}>Add Change</button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, children, action }) {
  return (
    <section className="card detail-card">
      <div className="card-title-row"><h3>{title}</h3>{action}</div>
      {children}
    </section>
  );
}

function Info({ label, value }) {
  return <div className="info-row"><div className="info-label">{label}</div><div>{value}</div></div>;
}

function exportRowsToCsv(filename, rows) {
  const csv = rowsToCsv(rows);
  if (!csv) return;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [authBusy, setAuthBusy] = useState(false);

  const signIn = async (event) => {
    event.preventDefault();
    setAuthBusy(true);
    setAuthMessage("");

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) setAuthMessage(error.message);
    setAuthBusy(false);
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={signIn}>
        <div className="eyebrow">Customer Success Site Registry</div>
        <h1>Sign in</h1>
        <p>Use your test account to access the site registry.</p>
        <label className="field"><span>Email</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
        <label className="field"><span>Password</span><input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>
        {authMessage && <p className="auth-message">{authMessage}</p>}
        <div className="button-row"><button type="submit" disabled={authBusy || !email || !password}>Sign In</button></div>
      </form>
    </div>
  );
}

export default function SiteRegistryMVP() {
  const [session, setSession] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [page, setPage] = useState("list");
  const [selectedId, setSelectedId] = useState(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [systemFilter, setSystemFilter] = useState("All");
  const [changeTypeFilter, setChangeTypeFilter] = useState("All");
  const [changeReasonFilter, setChangeReasonFilter] = useState("All");
  const [changeSearch, setChangeSearch] = useState("");
  const [editingSite, setEditingSite] = useState(null);
  const [addingChange, setAddingChange] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setAuthLoading(false);
      if (data.session) loadSites();
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession) {
        loadSites();
      } else {
        setSites([]);
        setPage("list");
        setSelectedId(null);
      }
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  async function loadSites() {
    setLoading(true);
    setLoadError("");
    const { data, error } = await supabase.from("sites").select("*, deployments(*), site_changes(*)").order("created_at", { ascending: false });
    if (error) {
      console.error("Error loading sites:", error);
      setLoadError(error.message || "Unable to load sites.");
      setSites([]);
      setLoading(false);
      return;
    }
    setSites((data || []).map(mapDbSiteToUi));
    setLoading(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const filteredSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((site) => {
      const changeText = (site.changeHistory || []).map((change) => [change.product, change.component, change.previousVersion, change.newVersion, change.notes].join(" ")).join(" ");
      const haystack = [site.name, site.customer, site.city, site.state, site.primaryContact, site.installedSystems, changeText].join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      const matchesStatus = statusFilter === "All" || site.status === statusFilter;
      const matchesSystem = systemFilter === "All" || site.systemTypes.includes(systemFilter);
      return matchesQuery && matchesStatus && matchesSystem;
    });
  }, [sites, query, statusFilter, systemFilter]);

  const selectedSite = sites.find((site) => site.id === selectedId) || null;

  const allChanges = useMemo(() => sites.flatMap((site) => (site.changeHistory || []).map((change) => ({ ...change, siteId: site.id, siteName: site.name, customer: site.customer, location: `${site.city}, ${site.state}` }))), [sites]);

  const filteredChanges = useMemo(() => {
    const q = changeSearch.trim().toLowerCase();
    return allChanges
      .filter((change) => changeTypeFilter === "All" || change.type === changeTypeFilter)
      .filter((change) => changeReasonFilter === "All" || change.reason === changeReasonFilter)
      .filter((change) => {
        const haystack = [change.siteName, change.customer, change.product, change.component, change.previousVersion, change.newVersion, change.changedBy, change.notes].join(" ").toLowerCase();
        return !q || haystack.includes(q);
      })
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [allChanges, changeSearch, changeTypeFilter, changeReasonFilter]);

  const siteChanges = useMemo(() => (selectedSite?.changeHistory || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))), [selectedSite]);

  const saveSite = async (site) => {
    const sitePayload = {
      name: site.name,
      customer: site.customer,
      city: site.city,
      state: site.state,
      address: site.address || null,
      status: site.status || "Active",
      primary_contact: site.primaryContact || null,
      contact_email: site.contactEmail || null,
      contact_phone: site.contactPhone || null,
      system_types: site.systemTypes || [],
      installed_systems: site.installedSystems || null,
      notes: site.notes || null,
      salesforce_url: site.salesforceUrl || null,
      zoho_projects_url: site.zohoProjectsUrl || null,
      zoho_desk_url: site.zohoDeskUrl || null,
      sharepoint_url: site.sharepointUrl || null,
      updated_at: new Date().toISOString(),
    };

    if (site.dbId) {
      const { error } = await supabase.from("sites").update(sitePayload).eq("id", site.dbId);
      if (error) {
        alert(`Unable to save site: ${error.message}`);
        return;
      }
      setSelectedId(site.id);
    } else {
      const nextCode = nextSiteId(sites);
      const { data, error } = await supabase.from("sites").insert({ ...sitePayload, site_code: nextCode }).select("*, deployments(*), site_changes(*)").single();
      if (error) {
        alert(`Unable to create site: ${error.message}`);
        return;
      }
      setSelectedId(data.site_code);
    }

    setEditingSite(null);
    setPage("detail");
    await loadSites();
  };

  const addChange = async (change) => {
    if (!selectedSite?.dbId) return;
    const nextCode = nextChangeId(sites);
    const { error } = await supabase.from("site_changes").insert({
      site_id: selectedSite.dbId,
      change_code: nextCode,
      change_date: change.date,
      change_type: change.type,
      product: change.product,
      component: change.component || null,
      previous_version: change.previousVersion || null,
      new_version: change.newVersion || null,
      changed_by: change.changedBy || null,
      related_deployment: change.relatedDeployment || null,
      reason: change.reason || null,
      notes: change.notes || null,
    });
    if (error) {
      alert(`Unable to add change: ${error.message}`);
      return;
    }
    setAddingChange(false);
    await loadSites();
  };

  const openSite = (siteId) => {
    setSelectedId(siteId);
    setPage("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const counts = {
    total: sites.length,
    active: sites.filter((site) => site.status === "Active").length,
    projects: sites.reduce((sum, site) => sum + site.deployments.length, 0),
    changes: allChanges.length,
  };

  const siteReportRows = filteredSites.map((site) => ({ siteId: site.id, siteName: site.name, customer: site.customer, city: site.city, state: site.state, status: site.status, systemTypes: site.systemTypes.join("; "), deploymentCount: site.deployments.length, changeCount: (site.changeHistory || []).length, primaryContact: site.primaryContact }));
  const changeReportRows = filteredChanges.map((change) => ({ date: change.date, customer: change.customer, siteName: change.siteName, siteId: change.siteId, type: change.type, reason: change.reason, product: change.product, component: change.component, previousVersion: change.previousVersion, newVersion: change.newVersion, changedBy: change.changedBy, relatedDeployment: change.relatedDeployment, notes: change.notes }));

  if (authLoading) {
    return <div className="app"><style>{css}</style><div className="shell"><section className="card"><p>Checking login...</p></section></div></div>;
  }

  if (!session) {
    return <div className="app"><style>{css}</style><LoginScreen /></div>;
  }

  return (
    <div className="app">
      <style>{css}</style>
      <div className="shell">
        {loading && <section className="card"><p>Loading sites from Supabase...</p></section>}
        {loadError && <section className="card"><p>{loadError}</p></section>}
        {!loading && page === "list" && (
          <>
            <header className="header">
              <div><div className="eyebrow">Customer Success Site Registry</div><h1>Sites</h1><p>Clean site list with searchable installed-system and change-history tracking.</p></div>
              <div className="button-row"><button className="secondary" onClick={() => exportRowsToCsv("site-registry-report.csv", siteReportRows)}>Export Site Report</button><button onClick={() => setEditingSite(emptySite)}>+ New Site</button><button className="secondary" onClick={signOut}>Sign Out</button></div>
            </header>

            <div className="stats">
              <div className="stat"><div className="stat-value">{counts.total}</div><div className="stat-label">Total Sites</div></div>
              <div className="stat"><div className="stat-value">{counts.active}</div><div className="stat-label">Active Sites</div></div>
              <div className="stat"><div className="stat-value">{counts.projects}</div><div className="stat-label">Linked Deployments</div></div>
              <div className="stat"><div className="stat-value">{counts.changes}</div><div className="stat-label">Tracked Changes</div></div>
            </div>

            <section className="card">
              <div className="toolbar"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sites, customers, systems, versions, firmware..." /><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>{["All", ...statuses].map((status) => <option key={status}>{status}</option>)}</select><select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)}>{["All", ...systemTypeOptions].map((type) => <option key={type}>{type}</option>)}</select><span className="muted">{filteredSites.length} result(s)</span></div>
              <div className="table-wrap"><table><thead><tr><th>Site</th><th>Customer</th><th>Location</th><th>Status</th><th>System Type</th><th>Deployments</th><th>Changes</th></tr></thead><tbody>{filteredSites.map((site) => <tr key={site.id} className="site-row" onClick={() => openSite(site.id)}><td><div className="site-name">{site.name}</div><div className="muted">{site.id}</div></td><td>{site.customer}</td><td>{site.city}, {site.state}</td><td><StatusPill status={site.status} /></td><td><div className="tag-row">{site.systemTypes.map((type) => <span key={type} className="tag">{type}</span>)}</div></td><td>{site.deployments.length}</td><td>{(site.changeHistory || []).length}</td></tr>)}</tbody></table></div>
              {!filteredSites.length && <p>No sites match the current filters.</p>}
            </section>

            <section className="card">
              <div className="card-title-row"><div><h3>Change History Report</h3><p>Filter across all sites to review hardware, firmware, software, configuration, and network changes.</p></div><button className="secondary" onClick={() => exportRowsToCsv("site-change-history-report.csv", changeReportRows)}>Export Change Report</button></div>
              <div className="report-filters"><input value={changeSearch} onChange={(event) => setChangeSearch(event.target.value)} placeholder="Search change history, product, version, site, customer..." /><select value={changeTypeFilter} onChange={(event) => setChangeTypeFilter(event.target.value)}>{["All", ...changeTypes].map((type) => <option key={type}>{type}</option>)}</select><select value={changeReasonFilter} onChange={(event) => setChangeReasonFilter(event.target.value)}>{["All", ...changeReasons].map((reason) => <option key={reason}>{reason}</option>)}</select><span className="muted">{filteredChanges.length} result(s)</span></div>
              {filteredChanges.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Customer / Site</th><th>Type</th><th>Product</th><th>Version / Model Change</th><th>Reason</th></tr></thead><tbody>{filteredChanges.map((change) => <tr key={`${change.siteId}-${change.id}`}><td>{change.date}</td><td><strong>{change.customer}</strong><br /><span className="muted">{change.siteName} - {change.location}</span></td><td>{change.type}</td><td><strong>{change.product}</strong><br /><span className="muted">{change.component || "-"}</span></td><td>{change.previousVersion || "-"} to <strong>{change.newVersion || "-"}</strong></td><td>{change.reason || "-"}<br /><span className="muted">{change.changedBy || "-"}</span></td></tr>)}</tbody></table></div> : <p>No matching changes found.</p>}
            </section>
          </>
        )}

        {page === "detail" && selectedSite && (
          <main className="detail-page">
            <section className="detail-header"><div><button className="ghost" onClick={() => setPage("list")}>← Back to Sites</button><div className="tag-row"><StatusPill status={selectedSite.status} /><span className="muted">{selectedSite.id}</span></div><h1>{selectedSite.name}</h1><p>{selectedSite.customer}</p><div className="muted">{selectedSite.address ? `${selectedSite.address}, ` : ""}{selectedSite.city}, {selectedSite.state}</div></div><div className="button-row"><button className="secondary" onClick={() => setAddingChange(true)}>+ Add Change</button><button onClick={() => setEditingSite(selectedSite)}>Edit Site</button><button className="secondary" onClick={signOut}>Sign Out</button></div></section>
            <div className="detail-grid"><DetailCard title="Contact"><Info label="Primary Contact" value={selectedSite.primaryContact || "Not set"} /><Info label="Email" value={selectedSite.contactEmail || "Not set"} /><Info label="Phone" value={selectedSite.contactPhone || "Not set"} /></DetailCard><DetailCard title="External Links"><div className="link-grid">{[["Salesforce", selectedSite.salesforceUrl], ["Zoho Projects", selectedSite.zohoProjectsUrl], ["Zoho Desk", selectedSite.zohoDeskUrl], ["SharePoint", selectedSite.sharepointUrl]].map(([label, url]) => <button key={label} className={url ? "link-button" : "link-button disabled"} disabled={!url} onClick={() => url && window.open(url, "_blank")}>{label}</button>)}</div></DetailCard></div>
            <DetailCard title="Installed Systems"><div className="tag-row">{selectedSite.systemTypes.map((type) => <span key={type} className="tag">{type}</span>)}</div><p>{selectedSite.installedSystems || "No installed system summary yet."}</p></DetailCard>
            <DetailCard title="Hardware / Firmware / Software Change History" action={<button className="secondary" onClick={() => setAddingChange(true)}>+ Add Change</button>}>{siteChanges.length ? <div className="table-wrap"><table><thead><tr><th>Date</th><th>Type</th><th>Product / Component</th><th>Version / Model Change</th><th>Reason</th><th>Changed By</th></tr></thead><tbody>{siteChanges.map((change) => <tr key={change.id}><td><strong>{change.date}</strong><br /><span className="muted">{change.id}</span></td><td>{change.type}</td><td><strong>{change.product}</strong><br /><span className="muted">{change.component || "-"}</span></td><td>{change.previousVersion || "-"} to <strong>{change.newVersion || "-"}</strong><br /><span className="muted">{change.relatedDeployment || "No deployment linked"}</span></td><td>{change.reason || "-"}</td><td>{change.changedBy || "-"}<br /><span className="muted">{change.notes}</span></td></tr>)}</tbody></table></div> : <p>No hardware, firmware, or software changes logged yet.</p>}</DetailCard>
            <DetailCard title="Related Deployments">{selectedSite.deployments.length ? <div className="table-wrap"><table><thead><tr><th>Deployment</th><th>Owner</th><th>Status</th><th>Link</th></tr></thead><tbody>{selectedSite.deployments.map((deployment) => <tr key={deployment.id}><td><strong>{deployment.name}</strong><br /><span className="muted">{deployment.id}</span></td><td>{deployment.owner}</td><td><StatusPill status={deployment.status} /></td><td>{deployment.projectUrl ? "Open" : "Manual / pending"}</td></tr>)}</tbody></table></div> : <p>No deployments linked yet. This can start manual and later sync from Zoho Projects.</p>}</DetailCard>
            <DetailCard title="Notes"><p>{selectedSite.notes || "No notes yet."}</p></DetailCard>
          </main>
        )}
      </div>
      {editingSite && <SiteForm initialSite={editingSite} onCancel={() => setEditingSite(null)} onSave={saveSite} />}
      {addingChange && selectedSite && <ChangeForm siteDeployments={selectedSite.deployments} onCancel={() => setAddingChange(false)} onSave={addChange} />}
    </div>
  );
}
