import { Bike, Fuel, Gauge, IndianRupee, ReceiptText } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import api, { getErrorMessage } from "../api/axios";
import EmptyState from "../components/EmptyState.jsx";
import Notice from "../components/Notice.jsx";
import StatCard from "../components/StatCard.jsx";

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0
});

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/fuel/stats/dashboard");
      setStats(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  if (loading) {
    return <div className="panel p-6 text-sm font-semibold text-slate-500">Loading dashboard...</div>;
  }

  const totals = stats?.totals || {};

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-semibold text-sky-700">Overview</p>
        <h2 className="text-2xl font-bold text-slate-950">Fuel dashboard</h2>
      </div>

      <Notice tone="error">{error}</Notice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Bike} label="Bikes" value={totals.bikeCount || 0} helper="Linked vehicles" accent="sky" />
        <StatCard icon={IndianRupee} label="Spent" value={money.format(totals.totalSpent || 0)} helper="All fuel entries" accent="emerald" />
        <StatCard icon={Fuel} label="Fuel" value={`${Number(totals.totalLiters || 0).toFixed(1)} L`} helper={`${totals.entryCount || 0} entries`} accent="amber" />
        <StatCard icon={Gauge} label="Mileage" value={totals.averageMileage ? `${totals.averageMileage} km/L` : "--"} helper="Average recorded mileage" accent="slate" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <section className="panel p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="section-title">Monthly spend</h3>
              <p className="section-subtitle">Last recorded months</p>
            </div>
            <ReceiptText className="text-sky-600" size={22} />
          </div>

          {stats?.monthly?.length ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.monthly} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                  <defs>
                    <linearGradient id="fuelSpend" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0284c7" stopOpacity={0.28} />
                      <stop offset="95%" stopColor="#0284c7" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} stroke="#64748b" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#64748b" />
                  <Tooltip formatter={(value) => money.format(value)} contentStyle={{ borderRadius: 8, borderColor: "#bae6fd" }} />
                  <Area type="monotone" dataKey="amount" stroke="#0284c7" fill="url(#fuelSpend)" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <EmptyState icon={ReceiptText} title="No chart data yet" text="Add fuel entries to see monthly spending." />
          )}
        </section>

        <section className="panel p-5">
          <h3 className="section-title">Recent entries</h3>
          <div className="mt-4 space-y-3">
            {stats?.recent?.length ? (
              stats.recent.map((entry) => (
                <div key={entry.id} className="rounded-lg border border-slate-200 bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{entry.bikeName}</p>
                      <p className="text-xs text-slate-500">{entry.bikeNumber}</p>
                    </div>
                    <p className="font-bold text-sky-700">{money.format(entry.amount)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                    <span className="mini-chip">{entry.liters} L</span>
                    <span className="mini-chip">{entry.odometer} km</span>
                    <span className="mini-chip">{entry.mileage ? `${entry.mileage} km/L` : "First fill"}</span>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState icon={Fuel} title="No fuel entries" text="Your latest fuel records will appear here." />
            )}
          </div>
        </section>
      </div>

      <section className="panel p-5">
        <h3 className="section-title">Bike summary</h3>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {stats?.bikeSummary?.length ? (
            stats.bikeSummary.map((bike) => (
              <div key={bike.id} className="rounded-lg border border-slate-200 bg-white p-4">
                <p className="font-bold text-slate-950">{bike.name}</p>
                <p className="text-sm text-slate-500">{bike.number}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-sky-50 p-3">
                    <p className="text-slate-500">Spent</p>
                    <p className="font-bold text-slate-950">{money.format(bike.totalSpent)}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-50 p-3">
                    <p className="text-slate-500">Mileage</p>
                    <p className="font-bold text-slate-950">{bike.averageMileage ? `${bike.averageMileage} km/L` : "--"}</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState icon={Bike} title="No bikes linked" text="Add your first bike to start tracking fuel." />
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;

