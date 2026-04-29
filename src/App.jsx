import React, { useEffect, useMemo, useState } from "react";
import { supabase } from "./supabaseClient";

const pageSize = 20;
const systemTypeOptions = ["EZTV", "Avedia", "WallControl 10", "Aetria", "Aligo", "Other"];
const verticalOptions = ["", "Sports & Entertainment", "Education", "Corporate", "Government", "Public Safety", "Healthcare", "Hospitality", "Broadcast", "Other"];
const regionOptions = ["", "US", "EU", "APAC", "Other"];
const changeReasons = ["", "Upgrade", "Patch", "Replacement", "Troubleshooting", "Commissioning", "Customer Request", "Rollback", "Other"];

const emptySite = {
  id: "",
  dbId: "",
  name: "",
  customer: "",
  city: "",
  state: "",
  address: "",
  vertical: "",
  region: "",
  regionOther: "",
  primaryContact: "",
  contactEmail: "",
  contactPhone: "",
  systemTypes: [],
  systemOther: "",
  installedSystems: "",
  hardwareItems: [],
  notes: "",
  salesforceUrl: "",
  zohoProjectsUrl: "",
  zohoDeskUrl: "",
  sharepointUrl: "",
  deployments: [],
  changeHistory: [],
};

const css = `
*{box-sizing:border-box}
body{margin:0}
.app{min-height:100vh;background:#eef3f8;color:#0f172a;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif}
.layout{display:grid;grid-template-columns:236px minmax(0,1fr);min-height:100vh;background:linear-gradient(180deg,#eef3f8 0%,#f8fafc 45%,#f8fafc 100%)}
.sidebar{position:sticky;top:0;height:100vh;background:linear-gradient(180deg,#0b2c63 0%,#123a78 60%,#0b2c63 100%);color:white;padding:20px 14px;display:flex;flex-direction:column;gap:20px;box-shadow:8px 0 24px rgba(15,23,42,.12)}
.sidebar-logo{padding:4px 8px 18px;border-bottom:1px solid rgba(255,255,255,.16)}
.sidebar-logo img{height:42px;max-width:170px;object-fit:contain}
.nav-section{display:grid;gap:6px}
.nav-label{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:rgba(255,255,255,.55);padding:0 10px;margin:4px 0}
.nav-button{width:100%;background:transparent;color:rgba(255,255,255,.84);border:1px solid transparent;text-align:left;display:flex;align-items:center;gap:10px;padding:10px 11px;border-radius:12px;font-size:14px;font-weight:750;cursor:pointer;transition:.16s ease}
.nav-button:hover{background:rgba(255,255,255,.09);color:white;transform:translateX(1px)}
.nav-button.active{background:white;color:#123a78;box-shadow:0 8px 18px rgba(0,0,0,.16)}
.nav-dot{width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.8}
.sidebar-footer{margin-top:auto;padding:12px 0 0;border-top:1px solid rgba(255,255,255,.18)}
.main{min-width:0;overflow:hidden;padding:0 28px 32px}
.shell{max-width:1320px;margin:0 auto;display:grid;gap:18px}
.header{position:sticky;top:0;z-index:20;background:rgba(255,255,255,.94);backdrop-filter:blur(10px);border-radius:0 0 22px 22px;padding:16px 22px;display:grid;grid-template-columns:1fr auto;gap:16px;align-items:center;box-shadow:0 8px 24px rgba(15,23,42,.08);border-top:4px solid #123a78;border-left:1px solid rgba(226,232,240,.8);border-right:1px solid rgba(226,232,240,.8);border-bottom:1px solid rgba(226,232,240,.9)}
.header-title{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0}
.header-title .eyebrow{font-size:11px;opacity:.7}
.header-title h1{font-size:30px;margin:0;font-weight:950;letter-spacing:.07em;color:#0f2f67;line-height:1}
.header-subtitle{font-size:12px;color:#64748b;margin-top:4px}
.header-actions{display:flex;gap:9px;flex-wrap:wrap;justify-content:flex-end;align-items:center}
.header-actions button{padding:8px 13px;border-radius:11px;font-size:13px;transition:.16s ease}
.header-actions button:hover{transform:translateY(-1px);box-shadow:0 8px 18px rgba(15,23,42,.12)}
.header-actions .primary{background:#f97316;color:white}
h1,h2,h3,p{margin-top:0}
h1{margin-bottom:4px;font-size:32px;line-height:1.08;text-align:left}
h2{margin-bottom:6px}
h3{margin-bottom:14px;font-size:16px}
p{color:#64748b}
button{border:0;border-radius:13px;background:#2563eb;color:white;font-weight:800;padding:10px 14px;cursor:pointer}
button:disabled{opacity:.45;cursor:not-allowed}
button.secondary{background:white;color:#334155;border:1px solid #cbd5e1}
button.ghost{background:transparent;color:#334155;border:1px solid transparent;padding-left:0}
.card{background:rgba(255,255,255,.96);border:1px solid rgba(226,232,240,.95);border-radius:22px;padding:18px;box-shadow:0 8px 22px rgba(15,23,42,.06);max-width:100%;overflow:hidden}
.stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px}
.stat{background:linear-gradient(180deg,#fff 0%,#f8fafc 100%);border:1px solid #e2e8f0;border-radius:20px;padding:18px;box-shadow:0 8px 20px rgba(15,23,42,.06)}
.stat-value{font-size:30px;font-weight:900;letter-spacing:-.03em;color:#0f2f67}
.stat-label{color:#64748b;font-size:13px;font-weight:700}
.toolbar{display:grid;grid-template-columns:minmax(260px,1fr) 170px 170px 170px;gap:10px;align-items:center;margin-bottom:8px}.toolbar .muted{grid-column:1/-1;justify-self:end;font-size:13px;margin-right:2px}
input,textarea,select{width:100%;border:1px solid #cbd5e1;border-radius:12px;padding:10px 12px;font:inherit;outline:none;background:white;transition:.14s ease}
input:focus,textarea:focus,select:focus{border-color:#2563eb;box-shadow:0 0 0 4px rgba(37,99,235,.12)}
.table-wrap{overflow:auto;width:100%;border-radius:16px;border:1px solid #e2e8f0;max-width:100%;background:white}
table{width:max-content;min-width:1120px;border-collapse:separate;border-spacing:0;background:white}
th,td{border-bottom:1px solid #e2e8f0;padding:12px 12px;text-align:left;font-size:13px;vertical-align:middle;white-space:normal}
tbody tr:last-child td{border-bottom:0}
th{color:#475569;background:#f8fafc;font-size:12px;text-transform:uppercase;letter-spacing:.04em;white-space:nowrap;position:sticky;top:0;z-index:2}
.sortable-th{cursor:pointer;user-select:none}
.sortable-th:hover{background:#eef2ff}
.th-label{display:flex;align-items:center;gap:6px}
.sort-indicator{font-size:11px;color:#1d4ed8}
.th-filter{margin-top:8px;min-width:170px;max-width:190px}.th-filter select{font-size:12px;padding:6px 8px;border-radius:9px;text-transform:none}
.site-row{cursor:pointer;transition:.14s ease}.inline-input,.inline-select{font-size:13px;padding:7px 8px;border-radius:9px}.row-actions{display:flex;gap:6px;justify-content:center}.row-actions button{padding:7px 9px;border-radius:9px;font-size:12px}.edit-cell{min-width:110px}
.site-row:hover{background:#eff6ff}
.site-name{font-weight:900;color:#0f172a}.site-list-table th:nth-child(1),.site-list-table td:nth-child(1){position:sticky;left:0;z-index:3;background:white;min-width:190px;max-width:190px}.site-list-table th:nth-child(1){z-index:5;background:#f8fafc}.site-list-table th:nth-child(2),.site-list-table td:nth-child(2){position:sticky;left:190px;z-index:3;background:white;min-width:175px;max-width:175px;box-shadow:8px 0 12px -12px rgba(15,23,42,.45)}.site-list-table th:nth-child(2){z-index:5;background:#f8fafc}.site-list-table th:nth-child(3),.site-list-table td:nth-child(3){min-width:145px}.site-list-table th:nth-child(4),.site-list-table td:nth-child(4){min-width:130px}.site-list-table th:nth-child(5),.site-list-table td:nth-child(5){min-width:95px}.site-list-table th:nth-child(6),.site-list-table td:nth-child(6){min-width:230px}.site-list-table th:nth-child(7),.site-list-table td:nth-child(7){min-width:105px;text-align:center}.site-list-table th:nth-child(8),.site-list-table td:nth-child(8){min-width:105px;text-align:center}
.muted{color:#64748b;font-size:14px}
.tag-row,.chip-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:8px}
.tag,.chip{border-radius:999px;padding:5px 8px;font-size:12px;background:#f1f5f9;color:#475569;border:1px solid #e2e8f0;line-height:1.35}
.chip{background:white;font-size:14px}
.chip.selected{background:#dbeafe;color:#1d4ed8;border-color:#60a5fa}
.pagination{display:flex;justify-content:space-between;align-items:center;margin-top:14px;gap:12px}
.pager-buttons{display:flex;gap:8px}
.detail-page{display:grid;gap:18px}
.detail-header{background:white;border:1px solid #e2e8f0;border-radius:22px;padding:22px;box-shadow:0 8px 22px rgba(15,23,42,.06);display:flex;justify-content:space-between;gap:18px;align-items:flex-start;text-align:left}
.detail-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.info-row{margin-bottom:12px;text-align:left}
.info-label{color:#94a3b8;font-size:12px;text-transform:uppercase;font-weight:900;letter-spacing:.04em}
.card-title-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:10px;text-align:left}
.card-title-row h3{margin-bottom:0}
.report-filters{display:grid;grid-template-columns:minmax(220px,1.5fr) 220px auto;gap:10px;align-items:center;margin-bottom:12px}
.modal-backdrop{position:fixed;inset:0;background:rgba(15,23,42,.45);display:flex;align-items:center;justify-content:center;padding:18px;z-index:50}
.modal{width:min(100%,980px);max-height:92vh;background:white;border-radius:22px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,.28);display:flex;flex-direction:column}
.small-modal{width:min(100%,880px)}
.modal-header,.modal-footer{padding:18px 22px;display:flex;align-items:center;justify-content:space-between;gap:12px;border-bottom:1px solid #e2e8f0;flex-shrink:0}
.modal-footer{border-bottom:0;border-top:1px solid #e2e8f0;justify-content:flex-end;background:white}
.modal-body{overflow:auto;padding:22px}
.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}
.wide{grid-column:1/-1}
.two-col{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.field{display:grid;gap:6px;margin-bottom:12px;color:#334155;font-size:14px;font-weight:800;text-align:left}
.hardware-grid{display:grid;grid-template-columns:1.1fr 1fr 1fr auto;gap:10px;align-items:end}
.link-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.link-button{background:white;color:#334155;border:1px solid #cbd5e1}
.link-button.disabled{opacity:.5}
.login-page{min-height:100vh;display:grid;place-items:center;padding:24px}
.login-card{width:min(100%,440px);background:white;border-radius:24px;padding:28px;box-shadow:0 1px 18px rgba(15,23,42,.12)}
.login-card .logo-mark{height:42px;width:auto;max-width:180px;object-fit:contain}
.brand{display:flex;align-items:center;gap:18px}
.eyebrow{color:#123a78;font-size:13px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}
.auth-message{background:#f8fafc;border:1px solid #e2e8f0;border-radius:14px;padding:10px 12px;color:#334155}
@media(max-width:1000px){.layout{grid-template-columns:1fr}.sidebar{position:relative;height:auto}.main{padding:0 14px 18px}.toolbar,.detail-grid,.form-grid,.two-col,.stats,.report-filters,.hardware-grid{grid-template-columns:1fr}.header{grid-template-columns:1fr}.header-actions{justify-content:flex-start}.detail-header,.card-title-row{flex-direction:column;align-items:stretch}}


/* Detail header optical alignment */
.detail-header h1{margin:8px 0 4px 0;line-height:1.05;transform:translateX(2px)}
.detail-header p,.detail-header .muted{margin-left:2px}
.detail-header .tag-row{margin-left:0}
`;

function makeEmptyHardware() {
  return { model: "", software: "", firmware: "" };
}

function makeEmptyChange() {
  return {
    date: new Date().toISOString().slice(0, 10),
    hardwareModel: "",
    newVersion: "",
    changedBy: "",
    reason: "",
    notes: "",
  };
}

function nextSiteId(sites) {
  const max = sites
    .map((site) => Number(String(site.id).replace("SITE-", "")))
    .filter(Boolean)
    .reduce((acc, value) => Math.max(acc, value), 1000);
  return `SITE-${max + 1}`;
}

function nextChangeId(sites) {
  const max = sites
    .flatMap((site) => site.changeHistory || [])
    .map((change) => Number(String(change.id).replace("CHG-", "")))
    .filter(Boolean)
    .reduce((acc, value) => Math.max(acc, value), 1000);
  return `CHG-${max + 1}`;
}

function rowsToCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const quote = String.fromCharCode(34);
  const newline = String.fromCharCode(10);
  const escapeCsvValue = (value) => quote + String(value ?? "").split(quote).join(quote + quote) + quote;
  return [headers.join(","), ...rows.map((row) => headers.map((header) => escapeCsvValue(row[header])).join(","))].join(newline);
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

function mapDbSiteToUi(site) {
  const hardware = Array.isArray(site.hardware_items) ? site.hardware_items : [];
  return {
    dbId: site.id,
    id: site.site_code || site.id,
    name: site.name || "",
    customer: site.customer || "",
    city: site.city || "",
    state: site.state || "",
    address: site.address || "",
    vertical: site.vertical || "",
    region: site.region || "",
    regionOther: site.region_other || "",
    primaryContact: site.primary_contact || "",
    contactEmail: site.contact_email || "",
    contactPhone: site.contact_phone || "",
    systemTypes: site.system_types || [],
    systemOther: site.system_other || "",
    installedSystems: site.installed_systems || "",
    hardwareItems: hardware.map((item) => ({
      model: item.model || "",
      software: item.software || "",
      firmware: item.firmware || "",
    })),
    notes: site.notes || "",
    salesforceUrl: site.salesforce_url || "",
    zohoProjectsUrl: site.zoho_projects_url || "",
    zohoDeskUrl: site.zoho_desk_url || "",
    sharepointUrl: site.sharepoint_url || "",
    deployments: (site.deployments || []).map((deployment) => ({
      dbId: deployment.id,
      id: deployment.deployment_code || deployment.id,
      name: deployment.name || "",
      status: deployment.status || "",
      owner: deployment.owner || "",
      projectUrl: deployment.project_url || "",
    })),
    changeHistory: (site.site_changes || []).map((change) => ({
      dbId: change.id,
      id: change.change_code || change.id,
      date: change.change_date || "",
      hardwareModel: change.hardware_model || change.product || "",
      newVersion: change.new_version || "",
      changedBy: change.changed_by || "",
      reason: change.reason || "",
      notes: change.notes || "",
    })),
  };
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
        {options.map((option) => (
          <option key={option} value={option}>{option || "None / Not set"}</option>
        ))}
      </select>
    </label>
  );
}

function HardwareEditor({ items, onChange, suggestions = [] }) {
  const safeItems = items.length ? items : [makeEmptyHardware()];
  const update = (index, field, value) => {
    onChange(safeItems.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };
  const remove = (index) => onChange(safeItems.filter((_, i) => i !== index));

  return (
    <div className="wide">
      <h3>Hardware List</h3>
      <datalist id="hardware-model-suggestions">
        {suggestions.map((item) => <option key={item} value={item} />)}
      </datalist>
      {safeItems.map((item, index) => (
        <div className="hardware-grid" key={index}>
          <label className="field">
            <span>Hardware Model</span>
            <input list="hardware-model-suggestions" value={item.model || ""} onChange={(event) => update(index, "model", event.target.value)} />
          </label>
          <Field label="Software" value={item.software} onChange={(value) => update(index, "software", value)} />
          <Field label="Firmware" value={item.firmware} onChange={(value) => update(index, "firmware", value)} />
          <button type="button" className="secondary" onClick={() => remove(index)}>Remove</button>
        </div>
      ))}
      <button type="button" className="secondary" onClick={() => onChange([...safeItems, makeEmptyHardware()])}>+ Add Hardware</button>
    </div>
  );
}

function SiteForm({ initialSite, onCancel, onSave, hardwareSuggestions = [] }) {
  const [form, setForm] = useState({
    ...initialSite,
    systemTypes: initialSite.systemTypes || [],
    hardwareItems: initialSite.hardwareItems || [],
  });

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const canSave = Boolean(form.name.trim() && form.customer.trim() && form.city.trim() && form.state.trim());
  const toggleSystem = (type) => {
    setForm((current) => ({
      ...current,
      systemTypes: current.systemTypes.includes(type)
        ? current.systemTypes.filter((item) => item !== type)
        : [...current.systemTypes, type],
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
          <button className="secondary" onClick={onCancel}>Close</button>
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
              <SelectField label="Vertical" value={form.vertical} onChange={(value) => update("vertical", value)} options={verticalOptions} />
              <SelectField label="Region" value={form.region} onChange={(value) => update("region", value)} options={regionOptions} />
              {form.region === "Other" && <Field label="Specify Other Region" value={form.regionOther} onChange={(value) => update("regionOther", value)} />}
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
                  <button key={type} type="button" className={form.systemTypes.includes(type) ? "chip selected" : "chip"} onClick={() => toggleSystem(type)}>
                    {type}
                  </button>
                ))}
              </div>
              {form.systemTypes.includes("Other") && <Field label="Specify Other System" value={form.systemOther} onChange={(value) => update("systemOther", value)} />}
              <TextArea label="Installed System Summary" value={form.installedSystems} onChange={(value) => update("installedSystems", value)} />
            </section>
            <HardwareEditor items={form.hardwareItems} onChange={(value) => update("hardwareItems", value)} suggestions={hardwareSuggestions} />
            <section className="wide">
              <h3>External Links</h3>
              <div className="two-col">
                <Field label="Salesforce URL" value={form.salesforceUrl} onChange={(value) => update("salesforceUrl", value)} />
                <Field label="Zoho Projects URL" value={form.zohoProjectsUrl} onChange={(value) => update("zohoProjectsUrl", value)} />
                <Field label="Zoho Desk URL" value={form.zohoDeskUrl} onChange={(value) => update("zohoDeskUrl", value)} />
                <Field label="SharePoint URL" value={form.sharepointUrl} onChange={(value) => update("sharepointUrl", value)} />
              </div>
              <TextArea label="Notes" value={form.notes} onChange={(value) => update("notes", value)} />
            </section>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button disabled={!canSave} onClick={() => onSave(form)}>{form.id ? "Save Changes" : "Create Site"}</button>
        </div>
      </div>
    </div>
  );
}

function ChangeForm({ onCancel, onSave, hardwareItems }) {
  const [form, setForm] = useState(makeEmptyChange());
  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const hardwareOptions = ["", ...hardwareItems.map((item) => item.model).filter(Boolean)];
  const canSave = Boolean(form.date && form.hardwareModel && form.newVersion);

  return (
    <div className="modal-backdrop">
      <div className="modal small-modal">
        <div className="modal-header">
          <div><h2>Add Change</h2><p>Select the hardware and record the changed version/model.</p></div>
          <button className="secondary" onClick={onCancel}>Close</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <Field label="Date *" type="date" value={form.date} onChange={(value) => update("date", value)} />
            <SelectField label="Hardware *" value={form.hardwareModel} onChange={(value) => update("hardwareModel", value)} options={hardwareOptions} />
            <Field label="Changed Version / Model *" value={form.newVersion} onChange={(value) => update("newVersion", value)} />
            <Field label="Changed By" value={form.changedBy} onChange={(value) => update("changedBy", value)} />
            <SelectField label="Reason" value={form.reason} onChange={(value) => update("reason", value)} options={changeReasons} />
            <div className="wide"><TextArea label="Notes" value={form.notes} onChange={(value) => update("notes", value)} /></div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="secondary" onClick={onCancel}>Cancel</button>
          <button disabled={!canSave} onClick={() => onSave(form)}>Add Change</button>
        </div>
      </div>
    </div>
  );
}

function DetailCard({ title, children, action }) {
  return <section className="card"><div className="card-title-row"><h3>{title}</h3>{action}</div>{children}</section>;
}

function Info({ label, value }) {
  return <div className="info-row"><div className="info-label">{label}</div><div>{value || "Not set"}</div></div>;
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
        <div className="brand"><img className="logo-mark" src="/vitec-logo.png" alt="VITEC" /><div><div className="eyebrow">Site Registry</div><h1>Sign in</h1></div></div>
        <p>Use your test account to access the site registry.</p>
        <Field label="Email" value={email} onChange={setEmail} type="email" />
        <Field label="Password" value={password} onChange={setPassword} type="password" />
        {authMessage && <p className="auth-message">{authMessage}</p>}
        <button type="submit" disabled={authBusy || !email || !password}>Sign In</button>
      </form>
    </div>
  );
}

function AppFrame({ page, setPage, signOut, setEditingSite, exportSites, children }) {
  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-logo"><img src="/vitec-logo.png" alt="VITEC" /></div>
        <div className="nav-section">
          <div className="nav-label">Workspace</div>
          <button className={page === "list" ? "nav-button active" : "nav-button"} onClick={() => setPage("list")}><span className="nav-dot"></span>Sites</button>
          <button className={page === "report" ? "nav-button active" : "nav-button"} onClick={() => setPage("report")}><span className="nav-dot"></span>Change History</button>
        </div>
        <div className="nav-section">
          <div className="nav-label">Quick Actions</div>
          <button className="nav-button" onClick={() => setEditingSite(emptySite)}><span className="nav-dot"></span>New Site</button>
          <button className="nav-button" onClick={exportSites}><span className="nav-dot"></span>Export Sites</button>
        </div>
        <div className="sidebar-footer"><button className="nav-button" onClick={signOut}><span className="nav-dot"></span>Sign Out</button></div>
      </aside>
      <main className="main"><div className="shell">{children}</div></main>
    </div>
  );
}

function SortHeader({ label, sortKey, toggleSort, sortMark, children }) {
  return (
    <th className="sortable-th" onClick={() => toggleSort(sortKey)}>
      <span className="th-label">{label} <span className="sort-indicator">{sortMark(sortKey)}</span></span>
      {children}
    </th>
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
  const [systemFilter, setSystemFilter] = useState("All");
  const [verticalFilter, setVerticalFilter] = useState("All");
  const [regionFilter, setRegionFilter] = useState("All");
  const [changeReasonFilter, setChangeReasonFilter] = useState("All");
  const [changeSearch, setChangeSearch] = useState("");
  const [editingSite, setEditingSite] = useState(null);
  const [addingChange, setAddingChange] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: "name", direction: "asc" });
  const [inlineEditingId, setInlineEditingId] = useState(null);
  const [inlineDraft, setInlineDraft] = useState({});

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
      if (newSession) loadSites();
      else {
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
    const { data, error } = await supabase
      .from("sites")
      .select("*, deployments(*), site_changes(*)")
      .order("created_at", { ascending: false });

    if (error) {
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

  const selectedSite = sites.find((site) => site.id === selectedId) || null;
  const hardwareSuggestions = useMemo(
    () => Array.from(new Set(sites.flatMap((site) => (site.hardwareItems || []).map((item) => item.model).filter(Boolean)))).sort(),
    [sites]
  );

  const allChanges = useMemo(
    () => sites.flatMap((site) => (site.changeHistory || []).map((change) => ({
      ...change,
      siteId: site.id,
      siteName: site.name,
      customer: site.customer,
      location: `${site.city}, ${site.state}`,
    }))),
    [sites]
  );

  const filteredSites = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sites.filter((site) => {
      const changeText = (site.changeHistory || []).map((change) => [change.hardwareModel, change.newVersion, change.notes].join(" ")).join(" ");
      const hardwareText = (site.hardwareItems || []).map((hardware) => [hardware.model, hardware.software, hardware.firmware].join(" ")).join(" ");
      const haystack = [site.name, site.customer, site.city, site.state, site.vertical, site.region, site.regionOther, site.primaryContact, site.installedSystems, hardwareText, changeText].join(" ").toLowerCase();
      return (!q || haystack.includes(q)) &&
        (systemFilter === "All" || site.systemTypes.includes(systemFilter)) &&
        (verticalFilter === "All" || site.vertical === verticalFilter) &&
        (regionFilter === "All" || site.region === regionFilter);
    });
  }, [sites, query, systemFilter, verticalFilter, regionFilter]);

  function sortValue(site, key) {
    if (key === "name") return site.name || "";
    if (key === "customer") return site.customer || "";
    if (key === "location") return `${site.city || ""}, ${site.state || ""}`;
    if (key === "vertical") return site.vertical || "";
    if (key === "region") return site.region === "Other" ? (site.regionOther || "Other") : (site.region || "");
    if (key === "system") return (site.systemTypes || []).join(", ");
    if (key === "hardware") return (site.hardwareItems || []).length;
    if (key === "changes") return (site.changeHistory || []).length;
    return "";
  }

  const sortedSites = useMemo(() => {
    const direction = sortConfig.direction === "asc" ? 1 : -1;
    return [...filteredSites].sort((a, b) => {
      const aValue = sortValue(a, sortConfig.key);
      const bValue = sortValue(b, sortConfig.key);
      if (typeof aValue === "number" && typeof bValue === "number") return (aValue - bValue) * direction;
      return String(aValue).localeCompare(String(bValue), undefined, { numeric: true, sensitivity: "base" }) * direction;
    });
  }, [filteredSites, sortConfig]);

  const toggleSort = (key) => {
    setSortConfig((current) => current.key === key ? { key, direction: current.direction === "asc" ? "desc" : "asc" } : { key, direction: "asc" });
  };

  const sortMark = (key) => sortConfig.key === key ? (sortConfig.direction === "asc" ? "▲" : "▼") : "↕";
  const totalPages = Math.max(1, Math.ceil(sortedSites.length / pageSize));
  const pagedSites = sortedSites.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  useEffect(() => {
    setCurrentPage(1);
  }, [query, systemFilter, verticalFilter, regionFilter]);

  const filteredChanges = useMemo(() => {
    const q = changeSearch.trim().toLowerCase();
    return allChanges
      .filter((change) => changeReasonFilter === "All" || change.reason === changeReasonFilter)
      .filter((change) => !q || [change.siteName, change.customer, change.hardwareModel, change.newVersion, change.changedBy, change.notes].join(" ").toLowerCase().includes(q))
      .sort((a, b) => String(b.date).localeCompare(String(a.date)));
  }, [allChanges, changeSearch, changeReasonFilter]);

  const siteChanges = useMemo(
    () => (selectedSite?.changeHistory || []).slice().sort((a, b) => String(b.date).localeCompare(String(a.date))),
    [selectedSite]
  );

  async function saveSite(site) {
    const sitePayload = {
      name: site.name,
      customer: site.customer,
      city: site.city,
      state: site.state,
      address: site.address || null,
      status: null,
      vertical: site.vertical || null,
      region: site.region || null,
      region_other: site.regionOther || null,
      primary_contact: site.primaryContact || null,
      contact_email: site.contactEmail || null,
      contact_phone: site.contactPhone || null,
      system_types: site.systemTypes || [],
      system_other: site.systemOther || null,
      installed_systems: site.installedSystems || null,
      hardware_items: (site.hardwareItems || []).filter((hardware) => hardware.model || hardware.software || hardware.firmware),
      notes: site.notes || null,
      salesforce_url: site.salesforceUrl || null,
      zoho_projects_url: site.zohoProjectsUrl || null,
      zoho_desk_url: site.zohoDeskUrl || null,
      sharepoint_url: site.sharepointUrl || null,
      updated_at: new Date().toISOString(),
    };

    if (site.dbId) {
      const { error } = await supabase.from("sites").update(sitePayload).eq("id", site.dbId);
      if (error) return alert(`Unable to save site: ${error.message}`);
      setSelectedId(site.id);
    } else {
      const nextCode = nextSiteId(sites);
      const { data, error } = await supabase
        .from("sites")
        .insert({ ...sitePayload, site_code: nextCode })
        .select("*, deployments(*), site_changes(*)")
        .single();
      if (error) return alert(`Unable to create site: ${error.message}`);
      setSelectedId(data.site_code);
    }

    setEditingSite(null);
    setPage("detail");
    await loadSites();
  }

  async function addChange(change) {
    if (!selectedSite?.dbId) return;
    const nextCode = nextChangeId(sites);
    const { error } = await supabase.from("site_changes").insert({
      site_id: selectedSite.dbId,
      change_code: nextCode,
      change_date: change.date,
      change_type: "Change",
      product: change.hardwareModel,
      hardware_model: change.hardwareModel,
      previous_version: null,
      new_version: change.newVersion,
      changed_by: change.changedBy || null,
      reason: change.reason || null,
      notes: change.notes || null,
    });
    if (error) return alert(`Unable to add change: ${error.message}`);
    setAddingChange(false);
    await loadSites();
  }

  function openSite(siteId) {
    setSelectedId(siteId);
    setPage("detail");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const counts = {
    total: sites.length,
    systems: sites.reduce((sum, site) => sum + site.systemTypes.length, 0),
    hardware: sites.reduce((sum, site) => sum + (site.hardwareItems || []).length, 0),
    changes: allChanges.length,
  };

  const siteReportRows = filteredSites.map((site) => ({
    siteId: site.id,
    siteName: site.name,
    customer: site.customer,
    city: site.city,
    state: site.state,
    vertical: site.vertical,
    region: site.region === "Other" ? (site.regionOther || "Other") : site.region,
    systemTypes: site.systemTypes.join("; "),
    hardwareCount: (site.hardwareItems || []).length,
    changeCount: (site.changeHistory || []).length,
    primaryContact: site.primaryContact,
  }));

  const changeReportRows = filteredChanges.map((change) => ({
    date: change.date,
    customer: change.customer,
    siteName: change.siteName,
    siteId: change.siteId,
    hardwareModel: change.hardwareModel,
    changedVersionOrModel: change.newVersion,
    changedBy: change.changedBy,
    reason: change.reason,
    notes: change.notes,
  }));


  function startInlineEdit(site) {
    setInlineEditingId(site.id);
    setInlineDraft({
      name: site.name || "",
      customer: site.customer || "",
      city: site.city || "",
      state: site.state || "",
      vertical: site.vertical || "",
      region: site.region || "",
    });
  }

  function updateInlineDraft(field, value) {
    setInlineDraft((current) => ({ ...current, [field]: value }));
  }

  function cancelInlineEdit() {
    setInlineEditingId(null);
    setInlineDraft({});
  }

  async function saveInlineEdit(site) {
    const updatedSite = {
      ...site,
      name: inlineDraft.name,
      customer: inlineDraft.customer,
      city: inlineDraft.city,
      state: inlineDraft.state,
      vertical: inlineDraft.vertical,
      region: inlineDraft.region,
    };
    await saveSite(updatedSite);
    setInlineEditingId(null);
    setInlineDraft({});
    setPage("list");
  }

  if (authLoading) {
    return <div className="app"><style>{css}</style><div className="shell"><section className="card"><p>Checking login...</p></section></div></div>;
  }

  if (!session) {
    return <div className="app"><style>{css}</style><LoginScreen /></div>;
  }

  return (
    <div className="app">
      <style>{css}</style>
      <AppFrame page={page} setPage={setPage} signOut={signOut} setEditingSite={setEditingSite} exportSites={() => exportRowsToCsv("site-registry-report.csv", siteReportRows)}>
        {loading && <section className="card"><p>Loading sites from Supabase...</p></section>}
        {loadError && <section className="card"><p>{loadError}</p></section>}

        {!loading && page === "list" && (
          <>
            <header className="header">
              <div className="header-title">
                <div className="eyebrow">Customer Success</div>
                <h1>SITE REGISTRY</h1>
                <div className="header-subtitle">Sites, systems, hardware, and change history</div>
              </div>
              <div className="header-actions">
                <button className="secondary" onClick={() => setPage("list")}>Sites</button>
                <button className="secondary" onClick={() => setPage("report")}>Change History</button>
                <button className="primary" onClick={() => setEditingSite(emptySite)}>+ New</button>
              </div>
            </header>

            <div className="stats">
              <div className="stat"><div className="stat-value">{counts.total}</div><div className="stat-label">Total Sites</div></div>
              <div className="stat"><div className="stat-value">{counts.systems}</div><div className="stat-label">Installed Systems</div></div>
              <div className="stat"><div className="stat-value">{counts.hardware}</div><div className="stat-label">Hardware Items</div></div>
              <div className="stat"><div className="stat-value">{counts.changes}</div><div className="stat-label">Tracked Changes</div></div>
            </div>

            <section className="card">
              <div className="toolbar">
                <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search sites, customers, systems, hardware, firmware..." />
                <select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)}>{["All", ...systemTypeOptions].map((type) => <option key={type}>{type}</option>)}</select>
                <select value={verticalFilter} onChange={(event) => setVerticalFilter(event.target.value)}>{["All", ...verticalOptions.filter(Boolean)].map((type) => <option key={type}>{type}</option>)}</select>
                <select value={regionFilter} onChange={(event) => setRegionFilter(event.target.value)}>{["All", ...regionOptions.filter(Boolean)].map((type) => <option key={type}>{type}</option>)}</select>
                <span className="muted">{filteredSites.length} result(s)</span>
              </div>

              <div className="table-wrap">
                <table className="site-list-table">
                  <thead>
                    <tr>
                      <SortHeader label="Site" sortKey="name" toggleSort={toggleSort} sortMark={sortMark} />
                      <SortHeader label="Customer" sortKey="customer" toggleSort={toggleSort} sortMark={sortMark} />
                      <SortHeader label="Location" sortKey="location" toggleSort={toggleSort} sortMark={sortMark} />
                      <SortHeader label="Vertical" sortKey="vertical" toggleSort={toggleSort} sortMark={sortMark} />
                      <SortHeader label="Region" sortKey="region" toggleSort={toggleSort} sortMark={sortMark} />
                      <SortHeader label="System Type" sortKey="system" toggleSort={toggleSort} sortMark={sortMark}>
                        <div className="th-filter" onClick={(event) => event.stopPropagation()}>
                          <select value={systemFilter} onChange={(event) => setSystemFilter(event.target.value)}>
                            <option>All</option>
                            {systemTypeOptions.map((type) => <option key={type}>{type}</option>)}
                          </select>
                        </div>
                      </SortHeader>
                      <SortHeader label="Hardware" sortKey="hardware" toggleSort={toggleSort} sortMark={sortMark} />
                      <SortHeader label="Changes" sortKey="changes" toggleSort={toggleSort} sortMark={sortMark} />
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedSites.map((site) => {
                      const isEditing = inlineEditingId === site.id;
                      return (
                        <tr key={site.id} className="site-row" onClick={() => !isEditing && openSite(site.id)}>
                          <td>
                            {isEditing ? (
                              <input className="inline-input" value={inlineDraft.name || ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateInlineDraft("name", event.target.value)} />
                            ) : (
                              <><div className="site-name">{site.name}</div><div className="muted">{site.id}</div></>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input className="inline-input" value={inlineDraft.customer || ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateInlineDraft("customer", event.target.value)} />
                            ) : site.customer}
                          </td>
                          <td>
                            {isEditing ? (
                              <div className="edit-cell" onClick={(event) => event.stopPropagation()}>
                                <input className="inline-input" value={inlineDraft.city || ""} placeholder="City" onChange={(event) => updateInlineDraft("city", event.target.value)} />
                                <input className="inline-input" value={inlineDraft.state || ""} placeholder="ST" onChange={(event) => updateInlineDraft("state", event.target.value.toUpperCase().slice(0, 2))} />
                              </div>
                            ) : `${site.city}, ${site.state}`}
                          </td>
                          <td>
                            {isEditing ? (
                              <select className="inline-select" value={inlineDraft.vertical || ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateInlineDraft("vertical", event.target.value)}>
                                {verticalOptions.map((option) => <option key={option} value={option}>{option || "None"}</option>)}
                              </select>
                            ) : (site.vertical || "-")}
                          </td>
                          <td>
                            {isEditing ? (
                              <select className="inline-select" value={inlineDraft.region || ""} onClick={(event) => event.stopPropagation()} onChange={(event) => updateInlineDraft("region", event.target.value)}>
                                {regionOptions.map((option) => <option key={option} value={option}>{option || "None"}</option>)}
                              </select>
                            ) : (site.region === "Other" ? (site.regionOther || "Other") : (site.region || "-"))}
                          </td>
                          <td><div className="tag-row">{site.systemTypes.map((type) => <span key={type} className="tag">{type === "Other" ? (site.systemOther || "Other") : type}</span>)}</div></td>
                          <td>{(site.hardwareItems || []).length}</td>
                          <td>{(site.changeHistory || []).length}</td>
                          <td onClick={(event) => event.stopPropagation()}>
                            {isEditing ? (
                              <div className="row-actions">
                                <button onClick={() => saveInlineEdit(site)}>Save</button>
                                <button className="secondary" onClick={cancelInlineEdit}>Cancel</button>
                              </div>
                            ) : (
                              <div className="row-actions">
                                <button className="secondary" onClick={() => startInlineEdit(site)}>Edit</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {!filteredSites.length && <p>No sites match the current filters.</p>}
              <div className="pagination">
                <span className="muted">Showing {sortedSites.length ? (currentPage - 1) * pageSize + 1 : 0}–{Math.min(currentPage * pageSize, sortedSites.length)} of {sortedSites.length}</span>
                <div className="pager-buttons">
                  <button className="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage((value) => Math.max(1, value - 1))}>Previous</button>
                  <button className="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage((value) => Math.min(totalPages, value + 1))}>Next</button>
                </div>
              </div>
            </section>
          </>
        )}

        {page === "report" && (
          <main className="detail-page">
            <section className="detail-header">
              <div>
                <button className="ghost" onClick={() => setPage("list")}>← Back to Sites</button>
                <h1>Change History Report</h1>
                <p>Filter across all sites to review hardware, firmware, software, and model changes.</p>
              </div>
              <div className="button-row">
                <button className="secondary" onClick={() => exportRowsToCsv("site-change-history-report.csv", changeReportRows)}>Export Change Report</button>
              </div>
            </section>
            <section className="card">
              <div className="report-filters">
                <input value={changeSearch} onChange={(event) => setChangeSearch(event.target.value)} placeholder="Search change history, hardware, version, site, customer..." />
                <select value={changeReasonFilter} onChange={(event) => setChangeReasonFilter(event.target.value)}>{["All", ...changeReasons.filter(Boolean)].map((reason) => <option key={reason}>{reason}</option>)}</select>
                <span className="muted">{filteredChanges.length} result(s)</span>
              </div>
              {filteredChanges.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Customer / Site</th><th>Hardware</th><th>Changed Version / Model</th><th>Reason</th><th>Changed By</th></tr></thead>
                    <tbody>
                      {filteredChanges.map((change) => (
                        <tr key={`${change.siteId}-${change.id}`}>
                          <td>{change.date}</td>
                          <td><strong>{change.customer}</strong><br /><span className="muted">{change.siteName} - {change.location}</span></td>
                          <td>{change.hardwareModel || "-"}</td>
                          <td>{change.newVersion || "-"}</td>
                          <td>{change.reason || "-"}</td>
                          <td>{change.changedBy || "-"}<br /><span className="muted">{change.notes}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No matching changes found.</p>}
            </section>
          </main>
        )}

        {page === "detail" && selectedSite && (
          <main className="detail-page">
            <section className="detail-header">
              <div>
                <button className="ghost" onClick={() => setPage("list")}>← Back to Sites</button>
                <div className="tag-row">
                  <span className="tag">{selectedSite.id}</span>
                  {selectedSite.region && <span className="tag">{selectedSite.region === "Other" ? (selectedSite.regionOther || "Other") : selectedSite.region}</span>}
                  {selectedSite.vertical && <span className="tag">{selectedSite.vertical}</span>}
                </div>
                <h1>{selectedSite.name}</h1>
                <p>{selectedSite.customer}</p>
                <div className="muted">{selectedSite.address ? `${selectedSite.address}, ` : ""}{selectedSite.city}, {selectedSite.state}</div>
              </div>
              <div className="button-row">
                <button className="secondary" onClick={() => setAddingChange(true)}>+ Add Change</button>
                <button onClick={() => setEditingSite(selectedSite)}>Edit Site</button>
              </div>
            </section>

            <div className="detail-grid">
              <DetailCard title="Contact">
                <Info label="Primary Contact" value={selectedSite.primaryContact} />
                <Info label="Email" value={selectedSite.contactEmail} />
                <Info label="Phone" value={selectedSite.contactPhone} />
              </DetailCard>
              <DetailCard title="Site Details">
                <Info label="Vertical" value={selectedSite.vertical} />
                <Info label="Region" value={selectedSite.region === "Other" ? (selectedSite.regionOther || "Other") : selectedSite.region} />
                <Info label="Location" value={`${selectedSite.city}, ${selectedSite.state}`} />
              </DetailCard>
            </div>

            <DetailCard title="Installed Systems">
              <div className="tag-row">
                {selectedSite.systemTypes.map((type) => (
                  <span key={type} className="tag">{type === "Other" ? (selectedSite.systemOther || "Other") : type}</span>
                ))}
              </div>
              <p>{selectedSite.installedSystems || "No installed system summary yet."}</p>
            </DetailCard>

            <DetailCard title="Hardware List">
              <div className="table-wrap">
                <table className="mini-table">
                  <thead><tr><th>Hardware Model</th><th>Software</th><th>Firmware</th></tr></thead>
                  <tbody>
                    {(selectedSite.hardwareItems || []).length ? selectedSite.hardwareItems.map((hardware, index) => (
                      <tr key={index}>
                        <td>{hardware.model || "-"}</td>
                        <td>{hardware.software || "-"}</td>
                        <td>{hardware.firmware || "-"}</td>
                      </tr>
                    )) : <tr><td colSpan="3">No hardware entered yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </DetailCard>

            <DetailCard title="Change History" action={<button className="secondary" onClick={() => setAddingChange(true)}>+ Add Change</button>}>
              {siteChanges.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Date</th><th>Hardware</th><th>Changed Version / Model</th><th>Reason</th><th>Changed By</th><th>Notes</th></tr></thead>
                    <tbody>
                      {siteChanges.map((change) => (
                        <tr key={change.id}>
                          <td>{change.date}</td>
                          <td>{change.hardwareModel || "-"}</td>
                          <td>{change.newVersion || "-"}</td>
                          <td>{change.reason || "-"}</td>
                          <td>{change.changedBy || "-"}</td>
                          <td>{change.notes || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No changes logged yet.</p>}
            </DetailCard>

            <DetailCard title="Related Deployments">
              {selectedSite.deployments.length ? (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Deployment</th><th>Owner</th><th>Status</th><th>Link</th></tr></thead>
                    <tbody>
                      {selectedSite.deployments.map((deployment) => (
                        <tr key={deployment.id}>
                          <td><strong>{deployment.name}</strong><br /><span className="muted">{deployment.id}</span></td>
                          <td>{deployment.owner}</td>
                          <td>{deployment.status || "-"}</td>
                          <td>{deployment.projectUrl ? "Open" : "Manual / pending"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : <p>No deployments linked yet. This can start manual and later sync from Zoho Projects.</p>}
            </DetailCard>

            <DetailCard title="Notes"><p>{selectedSite.notes || "No notes yet."}</p></DetailCard>

            <DetailCard title="External Links">
              <div className="link-grid">
                {[
                  ["Salesforce", selectedSite.salesforceUrl],
                  ["Zoho Projects", selectedSite.zohoProjectsUrl],
                  ["Zoho Desk", selectedSite.zohoDeskUrl],
                  ["SharePoint", selectedSite.sharepointUrl],
                ].map(([label, url]) => (
                  <button key={label} className={url ? "link-button" : "link-button disabled"} disabled={!url} onClick={() => url && window.open(url, "_blank")}>
                    {label}
                  </button>
                ))}
              </div>
            </DetailCard>
          </main>
        )}
      </AppFrame>

      {editingSite && <SiteForm initialSite={editingSite} onCancel={() => setEditingSite(null)} onSave={saveSite} hardwareSuggestions={hardwareSuggestions} />}
      {addingChange && selectedSite && <ChangeForm hardwareItems={selectedSite.hardwareItems || []} onCancel={() => setAddingChange(false)} onSave={addChange} />}
    </div>
  );
}
