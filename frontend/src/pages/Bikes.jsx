import { Bike, Edit3, Plus, RotateCcw, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import EmptyState from "../components/EmptyState.jsx";
import Notice from "../components/Notice.jsx";

const blankBike = {
  brand: "",
  model: "",
  number: "",
  fuelType: "Petrol",
  notes: ""
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const Bikes = () => {
  const [bikes, setBikes] = useState([]);
  const [form, setForm] = useState(blankBike);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ tone: "", text: "" });

  const loadBikes = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/api/bikes");
      setBikes(data.bikes || []);
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBikes();
  }, []);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const resetForm = () => {
    setForm(blankBike);
    setEditingId(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice({ tone: "", text: "" });
    try {
      if (editingId) {
        const { data } = await api.put(`/bikes/${editingId}`, form);
        setNotice({ tone: "success", text: data.message });
      } else {
        const { data } = await api.post("/bikes", form);
        setNotice({ tone: "success", text: data.message });
      }
      resetForm();
      await loadBikes();
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const editBike = (bike) => {
    setEditingId(bike.id);
    setForm({
      brand: bike.brand,
      model: bike.model,
      number: bike.number,
      fuelType: bike.fuelType,
      notes: bike.notes || ""
    });
  };

  const deleteBike = async (bike) => {
    const ok = window.confirm(`Unlink ${bike.brand} ${bike.model}? Fuel entries for this bike will also be removed.`);
    if (!ok) return;

    try {
      const { data } = await api.delete(`/bikes/${bike.id}`);
      setNotice({ tone: "success", text: data.message });
      await loadBikes();
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-700">Garage</p>
        <h2 className="text-2xl font-bold text-slate-950">Bikes</h2>
      </div>

      <Notice tone={notice.tone || "info"}>{notice.text}</Notice>

      <section className="panel p-5">
        <h3 className="section-title">{editingId ? "Edit bike" : "Add bike"}</h3>
        <form onSubmit={submit} className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <label className="field-label">
            Brand
            <input className="field-input" value={form.brand} onChange={(e) => update("brand", e.target.value)} required />
          </label>
          <label className="field-label">
            Model
            <input className="field-input" value={form.model} onChange={(e) => update("model", e.target.value)} required />
          </label>
          <label className="field-label">
            Vehicle number
            <input className="field-input uppercase" value={form.number} onChange={(e) => update("number", e.target.value)} required />
          </label>
          <label className="field-label">
            Fuel type
            <select className="field-input" value={form.fuelType} onChange={(e) => update("fuelType", e.target.value)}>
              <option>Petrol</option>
              <option>Diesel</option>
              <option>CNG</option>
              <option>Electric</option>
              <option>Other</option>
            </select>
          </label>
          <label className="field-label md:col-span-2 xl:col-span-1">
            Notes
            <input className="field-input" value={form.notes} onChange={(e) => update("notes", e.target.value)} />
          </label>
          <div className="flex gap-3 md:col-span-2 xl:col-span-5">
            <button className="primary-btn" disabled={saving}>
              {editingId ? <Save size={18} /> : <Plus size={18} />}
              {saving ? "Saving..." : editingId ? "Save bike" : "Add bike"}
            </button>
            {editingId && (
              <button type="button" className="secondary-btn" onClick={resetForm}>
                <RotateCcw size={18} />
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {loading ? (
          <div className="panel p-5 text-sm font-semibold text-slate-500 md:col-span-2 xl:col-span-3">Loading bikes...</div>
        ) : bikes.length ? (
          bikes.map((bike) => (
            <article key={bike.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-lg bg-sky-50 text-sky-700">
                    <Bike size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-950">{bike.brand} {bike.model}</h3>
                    <p className="text-sm text-slate-500">{bike.number}</p>
                  </div>
                </div>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{bike.fuelType}</span>
              </div>

              {bike.notes && <p className="mt-4 text-sm text-slate-600">{bike.notes}</p>}

              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-lg bg-sky-50 p-3">
                  <p className="text-slate-500">Spent</p>
                  <p className="font-bold text-slate-950">{money.format(bike.totalSpent || 0)}</p>
                </div>
                <div className="rounded-lg bg-emerald-50 p-3">
                  <p className="text-slate-500">Mileage</p>
                  <p className="font-bold text-slate-950">{bike.averageMileage ? `${bike.averageMileage} km/L` : "--"}</p>
                </div>
              </div>

              <div className="mt-5 flex gap-2">
                <button className="icon-action" onClick={() => editBike(bike)} aria-label="Edit bike" title="Edit">
                  <Edit3 size={17} />
                </button>
                <button className="icon-action danger" onClick={() => deleteBike(bike)} aria-label="Unlink bike" title="Unlink">
                  <Trash2 size={17} />
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="md:col-span-2 xl:col-span-3">
            <EmptyState icon={Bike} title="No bikes yet" text="Add your first bike from the form above." />
          </div>
        )}
      </section>
    </div>
  );
};

export default Bikes;

