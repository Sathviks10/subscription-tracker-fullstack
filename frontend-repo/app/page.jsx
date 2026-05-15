"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "../utils/api";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  CirclePause,
  IndianRupee,
  Layers3,
  LogOut,
  Plus,
  Trash2,
  WalletCards,
  Zap,
} from "lucide-react";

const categories = [
  "Entertainment",
  "Productivity",
  "Education",
  "Fitness",
  "Cloud",
  "Utilities",
  "Finance",
  "Other",
];

const filters = ["All", "Active", "Paused", "Due Soon"];

const categoryStyles = {
  Entertainment: "bg-rose-100 text-rose-700 border-rose-200",
  Productivity: "bg-indigo-100 text-indigo-700 border-indigo-200",
  Education: "bg-amber-100 text-amber-700 border-amber-200",
  Fitness: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Cloud: "bg-sky-100 text-sky-700 border-sky-200",
  Utilities: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Finance: "bg-lime-100 text-lime-700 border-lime-200",
  Other: "bg-slate-100 text-slate-700 border-slate-200",
};

const initialForm = {
  serviceName: "",
  price: "",
  category: "",
  renewalDate: "",
  status: "Active",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function getDaysUntilRenewal(renewalDateString) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewalDate = new Date(renewalDateString);
  renewalDate.setHours(0, 0, 0, 0);
  
  if (renewalDate < today) return -1; // Overdue or already renewed

  const diff = renewalDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getInitials(name) {
  if (!name) return "??";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function DashboardCard({ icon: Icon, label, value, detail, accent }) {
  return (
    <div className="glass-panel rounded-3xl p-5 transition duration-300 hover:-translate-y-1 hover:shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-4 text-sm text-slate-500">{detail}</p>
    </div>
  );
}

export default function Home() {
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const [subscriptions, setSubscriptions] = useState([]);
  const [stats, setStats] = useState(null);
  
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Authentication Check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
    } else {
      setUserName(localStorage.getItem("userName") || "User");
      fetchData();
    }
  }, [router]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, statsRes] = await Promise.all([
        api.get("/subscriptions"),
        api.get("/dashboard/stats")
      ]);
      setSubscriptions(subsRes.data.data);
      setStats(statsRes.data.data);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      }
      showToast("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    router.push("/login");
  };

  const enrichedSubscriptions = useMemo(() => {
    return subscriptions.map((subscription) => ({
      ...subscription,
      daysUntilRenewal: getDaysUntilRenewal(subscription.renewalDate),
      nextRenewal: new Date(subscription.renewalDate),
    }));
  }, [subscriptions]);

  const filteredSubscriptions = enrichedSubscriptions.filter((subscription) => {
    if (filter === "Active") return subscription.status === "Active";
    if (filter === "Paused") return subscription.status === "Paused";
    if (filter === "Due Soon") {
      return subscription.status === "Active" && subscription.daysUntilRenewal <= 7 && subscription.daysUntilRenewal >= 0;
    }
    return true;
  });

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validateForm() {
    const nextErrors = {};
    if (!form.serviceName.trim()) nextErrors.serviceName = "Tell us which service you want to track.";
    if (!form.price || Number(form.price) <= 0) nextErrors.price = "Enter a monthly price greater than 0.";
    if (!form.category) nextErrors.category = "Pick a category for this subscription.";
    if (!form.renewalDate) nextErrors.renewalDate = "Choose the next billing date.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  async function handleAddSubscription(event) {
    event.preventDefault();
    if (!validateForm()) return;
    setSubmitting(true);

    try {
      const payload = {
        serviceName: form.serviceName.trim(),
        price: Number(form.price),
        category: form.category,
        renewalDate: form.renewalDate,
        status: form.status,
      };

      await api.post("/subscriptions", payload);
      setForm(initialForm);
      setErrors({});
      showToast(`${payload.serviceName} added!`);
      fetchData(); // Refresh data
    } catch (error) {
      showToast(error.response?.data?.message || "Failed to add subscription");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleSubscriptionStatus(subscription) {
    try {
      const newStatus = subscription.status === "Active" ? "Paused" : "Active";
      await api.put(`/subscriptions/${subscription._id}`, { status: newStatus });
      fetchData();
    } catch (error) {
      showToast("Failed to update status");
    }
  }

  async function deleteSubscription(id, name) {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await api.delete(`/subscriptions/${id}`);
      showToast(`${name} deleted`);
      fetchData();
    } catch (error) {
      showToast("Failed to delete subscription");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-teal-600"></div>
      </div>
    );
  }

  // Dashboard calculations fallback
  const totalMonthlySpend = stats?.totalMonthlySpend || 0;
  const activeCount = stats?.activeCount || 0;
  const pausedCount = stats?.pausedCount || 0;
  const dueSoonCount = stats?.upcomingRenewalsCount || 0;
  
  const categoryBreakdown = stats?.categoryBreakdown || [];
  const highestCategoryTotal = categoryBreakdown.length > 0 ? categoryBreakdown[0].total : 1;

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-soft sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(45,212,191,0.25),transparent_30rem),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.15),transparent_25rem)]" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-teal-100">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-teal-500"></span>
                  </span>
                  Live Connection
                </span>
                <span className="text-sm font-medium text-slate-400">
                  Welcome back, <span className="text-white">{userName}</span>
                </span>
              </div>
              <h1 className="mt-6 text-5xl font-semibold tracking-tight sm:text-6xl">
                SubTrack
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-300">
                Know exactly where your money goes every month.
              </p>
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-rose-500/20 hover:text-rose-200"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </header>

        {toast && (
          <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-soft animate-in slide-in-from-top-2 fade-in duration-300">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            {toast}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            icon={IndianRupee}
            label="Total Monthly Spend"
            value={formatCurrency(totalMonthlySpend)}
            detail="Active subscriptions only"
            accent="bg-teal-100 text-teal-700"
          />
          <DashboardCard
            icon={WalletCards}
            label="Active Subscriptions"
            value={activeCount}
            detail="Currently billed services"
            accent="bg-indigo-100 text-indigo-700"
          />
          <DashboardCard
            icon={Bell}
            label="Due This Week"
            value={dueSoonCount}
            detail="Renewing in the next 7 days"
            accent="bg-amber-100 text-amber-700"
          />
          <DashboardCard
            icon={CirclePause}
            label="Paused Subscriptions"
            value={pausedCount}
            detail="Kept aside from monthly spend"
            accent="bg-rose-100 text-rose-700"
          />
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
          <form onSubmit={handleAddSubscription} className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Add Subscription
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Quick entry for anything recurring.
                </p>
              </div>
              <div className="rounded-2xl bg-slate-950 p-3 text-white">
                <Plus className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 grid gap-4">
              <label className="block">
                <span className="text-sm font-semibold text-slate-700">Service name</span>
                <input
                  value={form.serviceName}
                  onChange={(event) => updateForm("serviceName", event.target.value)}
                  placeholder="Netflix, Notion, Gym..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
                {errors.serviceName && <p className="mt-2 text-sm text-rose-600">{errors.serviceName}</p>}
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Monthly price</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={form.price}
                    onChange={(event) =>
                      updateForm("price", event.target.value.replace(/[^\d.]/g, ""))
                    }
                    placeholder="199"
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  />
                  {errors.price && <p className="mt-2 text-sm text-rose-600">{errors.price}</p>}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Next Billing Date</span>
                  <input
                    type="date"
                    value={form.renewalDate}
                    onChange={(event) => updateForm("renewalDate", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  />
                  {errors.renewalDate && (
                    <p className="mt-2 text-sm text-rose-600">{errors.renewalDate}</p>
                  )}
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Category</span>
                  <select
                    value={form.category}
                    onChange={(event) => updateForm("category", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="">Choose category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-2 text-sm text-rose-600">{errors.category}</p>
                  )}
                </label>

                <label className="block">
                  <span className="text-sm font-semibold text-slate-700">Status</span>
                  <select
                    value={form.status}
                    onChange={(event) => updateForm("status", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  >
                    <option value="Active">Active</option>
                    <option value="Paused">Paused</option>
                  </select>
                </label>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800 disabled:opacity-70"
              >
                <Plus className="h-5 w-5" />
                {submitting ? "Adding..." : "Add Subscription"}
              </button>
            </div>
          </form>

          <div className="glass-panel rounded-[2rem] p-5 sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                  Category Breakdown
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Active monthly spend by category.
                </p>
              </div>
              <div className="rounded-2xl bg-teal-100 p-3 text-teal-700">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            {categoryBreakdown.length > 0 ? (
              <div className="mt-7 space-y-5">
                {categoryBreakdown.map((item) => {
                  const percentage = Math.round((item.total / highestCategoryTotal) * 100);
                  return (
                    <div key={item.category}>
                      <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-700">{item.category}</span>
                        <span className="font-semibold text-slate-950">
                          {formatCurrency(item.total)}
                        </span>
                      </div>
                      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-teal-500 via-cyan-500 to-indigo-500 transition-all duration-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                <Layers3 className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-4 font-semibold text-slate-800">No active spend yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add an active subscription to see the breakdown.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Your Subscriptions
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white/70 p-1 shadow-sm">
              {filters.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setFilter(item)}
                  className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                    filter === item
                      ? "bg-slate-950 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {filteredSubscriptions.length > 0 ? (
            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredSubscriptions.map((subscription) => {
                const dueSoon =
                  subscription.status === "Active" && subscription.daysUntilRenewal <= 7 && subscription.daysUntilRenewal >= 0;
                const paused = subscription.status === "Paused";

                return (
                  <article
                    key={subscription._id}
                    className="group rounded-3xl border border-slate-200 bg-white/86 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-glow">
                          {getInitials(subscription.serviceName)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-slate-950">
                            {subscription.serviceName}
                          </h3>
                          <span
                            className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              categoryStyles[subscription.category] || categoryStyles.Other
                            }`}
                          >
                            {subscription.category}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          paused
                            ? "bg-rose-100 text-rose-700"
                            : "bg-teal-100 text-teal-700"
                        }`}
                      >
                        {subscription.status}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-3">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Monthly
                        </p>
                        <p className="mt-2 text-xl font-semibold text-slate-950">
                          {formatCurrency(subscription.price)}
                          <span className="text-sm font-medium text-slate-500">/mo</span>
                        </p>
                      </div>
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Renewal
                        </p>
                        <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-950">
                          <CalendarDays className="h-4 w-4 text-slate-500" />
                          {subscription.nextRenewal.toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      {subscription.status === "Active" && subscription.daysUntilRenewal >= 0 && (
                        <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                          <Zap className="h-4 w-4 text-amber-500" />
                          {subscription.daysUntilRenewal === 0
                            ? "Renews today"
                            : `${subscription.daysUntilRenewal} days until renewal`}
                        </span>
                      )}
                      {dueSoon && (
                        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
                          Due soon
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSubscriptionStatus(subscription)}
                        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition hover:-translate-y-0.5 ${
                          paused
                            ? "bg-teal-600 text-white hover:bg-teal-700"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                        }`}
                      >
                        <CirclePause className="h-4 w-4" />
                        {paused ? "Resume" : "Pause"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteSubscription(subscription._id, subscription.serviceName)}
                        aria-label={`Delete ${subscription.serviceName}`}
                        className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-5 rounded-[2rem] border border-dashed border-slate-300 bg-white/72 p-10 text-center shadow-sm">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-950 text-white shadow-glow">
                <WalletCards className="h-7 w-7" />
              </div>
              <h3 className="mt-5 text-2xl font-semibold tracking-tight text-slate-950">
                Your subscription board is clear
              </h3>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
                Add your first recurring payment to start tracking your expenses across all services.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
