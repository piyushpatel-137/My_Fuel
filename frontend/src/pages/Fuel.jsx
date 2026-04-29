import { CalendarDays, Fuel as FuelIcon, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import api, { getErrorMessage } from "../api/axios";
import EmptyState from "../components/EmptyState.jsx";
import Notice from "../components/Notice.jsx";

const todayForInput = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

const blankEntry = {
  liters: "",
  amount: "",
  odometer: "",
  filledAt: todayForInput()
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const Fuel = () => {
  const [bikes, setBikes] = useState([]);
  const [selectedBikeId, setSelectedBikeId] = useState("");
  const [entries, setEntries] = useState([]);
  const [form, setForm] = useState(blankEntry);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState({ tone: "", text: "" });

  const selectedBike = useMemo(
    () => bikes.find((bike) => String(bike.id) === String(selectedBikeId)),
    [bikes, selectedBikeId]
  );

  const loadBikes = async () => {
    const { data } = await api.get("/api/bikes");
    const nextBikes = data.bikes || [];
    setBikes(nextBikes);
    if (!selectedBikeId && nextBikes.length) {
      setSelectedBikeId(String(nextBikes[0].id));
    }
  };

  const loadEntries = async (bikeId) => {
    if (!bikeId) {
      setEntries([]);
      return;
    }
    const { data } = await api.get(`/api/fuel/bike/${bikeId}`);
    setEntries(data.entries || []);
  };

  useEffect(() => {
    const boot = async () => {
      setLoading(true);
      setNotice({ tone: "", text: "" });
      try {
        await loadBikes();
      } catch (err) {
        setNotice({ tone: "error", text: getErrorMessage(err) });
      } finally {
        setLoading(false);
      }
    };
    boot();
  }, []);

  useEffect(() => {
    const run = async () => {
      if (!selectedBikeId) return;
      try {
        await loadEntries(selectedBikeId);
      } catch (err) {
        setNotice({ tone: "error", text: getErrorMessage(err) });
      }
    };
    run();
  }, [selectedBikeId]);

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  const submit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setNotice({ tone: "", text: "" });
    try {
      const { data } = await api.post("/fuel", {
        bikeId: selectedBikeId,
        liters: form.liters,
        amount: form.amount,
        odometer: form.odometer,
        filledAt: form.filledAt
      });
      setNotice({ tone: "success", text: data.message });
      setForm(blankEntry);
      await loadEntries(selectedBikeId);
      await loadBikes();
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const deleteEntry = async (entry) => {
    const ok = window.confirm("Delete this fuel entry?");
    if (!ok) return;

    try {
      const { data } = await api.delete(`/fuel/${entry.id}`);
      setNotice({ tone: "success", text: data.message });
      await loadEntries(selectedBikeId);
      await loadBikes();
    } catch (err) {
      setNotice({ tone: "error", text: getErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-700">Refills</p>
        <h2 className="text-2xl font-bold text-slate-950">Fuel entries</h2>
      </div>

      <Notice tone={notice.tone || "info"}>{notice.text}</Notice>

      {loading ? (
        <div className="panel p-5 text-sm font-semibold text-slate-500">Loading fuel tracker...</div>
      ) : bikes.length ? (
        <>
          <section className="panel p-5">
            <div className="mb-4 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="field-label">
                Bike
                <select className="field-input" value={selectedBikeId} onChange={(e) => setSelectedBikeId(e.target.value)}>
                  {bikes.map((bike) => (
                    <option key={bike.id} value={bike.id}>
                      {bike.brand} {bike.model} - {bike.number}
                    </option>
                  ))}
                </select>
              </label>
              {selectedBike && (
                <div className="rounded-lg bg-sky-50 px-4 py-3 text-sm font-semibold text-slate-700">
                  {selectedBike.entryCount || 0} entries
                </div>
              )}
            </div>

            <form onSubmit={submit} className="grid gap-4 md:grid-cols-4">
              <label className="field-label">
                Liters
                <input className="field-input" type="number" min="0" step="0.01" value={form.liters} onChange={(e) => update("liters", e.target.value)} required />
              </label>
              <label className="field-label">
                Amount
                <input className="field-input" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update("amount", e.target.value)} required />
              </label>
              <label className="field-label">
                Odometer
                <input className="field-input" type="number" min="0" value={form.odometer} onChange={(e) => update("odometer", e.target.value)} required />
              </label>
              <label className="field-label">
                Filled at
                <input className="field-input" type="datetime-local" value={form.filledAt} onChange={(e) => update("filledAt", e.target.value)} required />
              </label>
              <button className="primary-btn md:col-span-4" disabled={saving}>
                <Plus size={18} />
                {saving ? "Adding..." : "Add fuel entry"}
              </button>
            </form>
          </section>

          <section className="panel overflow-hidden">
            <div className="border-b border-slate-200 p-5">
              <h3 className="section-title">History</h3>
            </div>

            {entries.length ? (
              <div className="divide-y divide-slate-200">
                {entries.map((entry) => (
                  <div key={entry.id} className="grid gap-4 p-5 md:grid-cols-[1fr_auto] md:items-center">
                    <div className="flex gap-4">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-sky-50 text-sky-700">
                        <FuelIcon size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-slate-950">{money.format(entry.amount)}</p>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-600">
                          <span className="mini-chip">{entry.liters} L</span>
                          <span className="mini-chip">{entry.odometer} km</span>
                          <span className="mini-chip">{entry.mileage ? `${entry.mileage} km/L` : "First fill"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 md:justify-end">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={16} />
                        {entry.filledAt ? new Date(entry.filledAt).toLocaleDateString("en-IN") : "--"}
                      </div>
                      <button className="icon-action danger" onClick={() => deleteEntry(entry)} aria-label="Delete fuel entry" title="Delete">
                        <Trash2 size={17} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5">
                <EmptyState icon={FuelIcon} title="No entries for this bike" text="Add the first refill record from the form above." />
              </div>
            )}
          </section>
        </>
      ) : (
        <EmptyState icon={FuelIcon} title="Add a bike first" text="Fuel tracking starts after a bike is linked." />
      )}
    </div>
  );
};

export default Fuel;
