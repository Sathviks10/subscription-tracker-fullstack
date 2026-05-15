"use client";

import { useMemo, useState } from "react";
import {
  BarChart3,
  Bell,
  CalendarDays,
  CheckCircle2,
  CirclePause,
  IndianRupee,
  Layers3,
  Plus,
  RefreshCcw,
  Sparkles,
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

const demoSubscriptions = [
  {
    id: "demo-netflix",
    service: "Netflix",
    price: 649,
    category: "Entertainment",
    billingDate: "2026-05-15",
    status: "Active",
  },
  {
    id: "demo-spotify",
    service: "Spotify",
    price: 119,
    category: "Entertainment",
    billingDate: "2026-05-22",
    status: "Active",
  },
  {
    id: "demo-notion",
    service: "Notion",
    price: 820,
    category: "Productivity",
    billingDate: "2026-05-18",
    status: "Active",
  },
  {
    id: "demo-gym",
    service: "Cult Fit",
    price: 1499,
    category: "Fitness",
    billingDate: "2026-06-03",
    status: "Paused",
  },
  {
    id: "demo-drive",
    service: "Google One",
    price: 130,
    category: "Cloud",
    billingDate: "2026-05-12",
    status: "Active",
  },
  {
    id: "demo-phone",
    service: "Airtel Postpaid",
    price: 499,
    category: "Utilities",
    billingDate: "2026-05-28",
    status: "Active",
  },
];

const initialForm = {
  service: "",
  price: "",
  category: "",
  billingDate: "",
  status: "Active",
};

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function getDaysInMonth(year, monthIndex) {
  return new Date(year, monthIndex + 1, 0).getDate();
}

function getNextRenewal(billingDate) {
  const sourceDate = new Date(`${billingDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let year = today.getFullYear();
  let month = today.getMonth();
  const billingDay = sourceDate.getDate();
  let day = Math.min(billingDay, getDaysInMonth(year, month));
  let renewalDate = new Date(year, month, day);

  if (renewalDate < today) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    day = Math.min(billingDay, getDaysInMonth(year, month));
    renewalDate = new Date(year, month, day);
  }

  return renewalDate;
}

function getDaysUntilRenewal(billingDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const renewalDate = getNextRenewal(billingDate);
  const diff = renewalDate.getTime() - today.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getInitials(name) {
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
  const [subscriptions, setSubscriptions] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState("");

  const enrichedSubscriptions = useMemo(
    () =>
      subscriptions.map((subscription) => ({
        ...subscription,
        daysUntilRenewal: getDaysUntilRenewal(subscription.billingDate),
        nextRenewal: getNextRenewal(subscription.billingDate),
      })),
    [subscriptions]
  );

  const activeSubscriptions = enrichedSubscriptions.filter(
    (subscription) => subscription.status === "Active"
  );
  const pausedSubscriptions = enrichedSubscriptions.filter(
    (subscription) => subscription.status === "Paused"
  );
  const dueSoonSubscriptions = activeSubscriptions.filter(
    (subscription) => subscription.daysUntilRenewal <= 7
  );

  const totalMonthlySpend = activeSubscriptions.reduce(
    (sum, subscription) => sum + subscription.price,
    0
  );

  const categoryTotals = categories
    .map((category) => ({
      category,
      total: activeSubscriptions
        .filter((subscription) => subscription.category === category)
        .reduce((sum, subscription) => sum + subscription.price, 0),
    }))
    .filter((item) => item.total > 0);

  const highestCategoryTotal = Math.max(
    ...categoryTotals.map((item) => item.total),
    1
  );

  const categoryBreakdown = categoryTotals.map((item) => ({
    ...item,
    percentage: Math.round((item.total / highestCategoryTotal) * 100),
  }));

  const filteredSubscriptions = enrichedSubscriptions.filter((subscription) => {
    if (filter === "Active") return subscription.status === "Active";
    if (filter === "Paused") return subscription.status === "Paused";
    if (filter === "Due Soon") {
      return subscription.status === "Active" && subscription.daysUntilRenewal <= 7;
    }
    return true;
  });

  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: "" }));
  }

  function validateForm() {
    const nextErrors = {};

    if (!form.service.trim()) {
      nextErrors.service = "Tell us which service you want to track.";
    }

    if (!form.price || Number(form.price) <= 0) {
      nextErrors.price = "Enter a monthly price greater than 0.";
    }

    if (!form.category) {
      nextErrors.category = "Pick a category for this subscription.";
    }

    if (!form.billingDate) {
      nextErrors.billingDate = "Choose the next billing date.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function showToast(message) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2600);
  }

  function handleAddSubscription(event) {
    event.preventDefault();

    if (!validateForm()) return;

    const subscription = {
      id: crypto.randomUUID(),
      service: form.service.trim(),
      price: Number(form.price),
      category: form.category,
      billingDate: form.billingDate,
      status: form.status,
    };

    setSubscriptions((current) => [subscription, ...current]);
    setForm(initialForm);
    setErrors({});
    showToast(`${subscription.service} added to SubTrack.`);
  }

  function toggleSubscriptionStatus(id) {
    setSubscriptions((current) =>
      current.map((subscription) =>
        subscription.id === id
          ? {
              ...subscription,
              status: subscription.status === "Active" ? "Paused" : "Active",
            }
          : subscription
      )
    );
  }

  function deleteSubscription(id) {
    setSubscriptions((current) =>
      current.filter((subscription) => subscription.id !== id)
    );
  }

  function loadDemoData() {
    setSubscriptions(demoSubscriptions);
    setFilter("All");
    showToast("Demo subscriptions loaded.");
  }

  function clearAll() {
    setSubscriptions([]);
    setFilter("All");
    showToast("All subscriptions cleared.");
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-slate-950 p-6 text-white shadow-soft sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(45,212,191,0.35),transparent_30rem),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.22),transparent_25rem)]" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm font-medium text-teal-100">
                  <Sparkles className="h-4 w-4" />
                  Demo mode
                </span>
                <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-sm text-slate-200">
                  Subscriptions reset on refresh
                </span>
              </div>
              <h1 className="mt-8 text-5xl font-semibold tracking-tight sm:text-6xl">
                SubTrack
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-200">
                Know exactly where your money goes every month.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <button
                type="button"
                onClick={loadDemoData}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 shadow-glow transition hover:-translate-y-0.5 hover:bg-teal-50"
              >
                <RefreshCcw className="h-4 w-4" />
                Load Demo Data
              </button>
              <button
                type="button"
                onClick={clearAll}
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/15"
              >
                <Trash2 className="h-4 w-4" />
                Clear All
              </button>
            </div>
          </div>
        </header>

        {toast && (
          <div className="fixed right-5 top-5 z-50 flex items-center gap-3 rounded-2xl border border-teal-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-soft">
            <CheckCircle2 className="h-5 w-5 text-teal-600" />
            {toast}
          </div>
        )}

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardCard
            icon={IndianRupee}
            label="Total Monthly Spend"
            value={`${formatCurrency(totalMonthlySpend)}`}
            detail="Active subscriptions only"
            accent="bg-teal-100 text-teal-700"
          />
          <DashboardCard
            icon={WalletCards}
            label="Active Subscriptions"
            value={activeSubscriptions.length}
            detail="Currently billed services"
            accent="bg-indigo-100 text-indigo-700"
          />
          <DashboardCard
            icon={Bell}
            label="Due This Week"
            value={dueSoonSubscriptions.length}
            detail="Renewing in the next 7 days"
            accent="bg-amber-100 text-amber-700"
          />
          <DashboardCard
            icon={CirclePause}
            label="Paused Subscriptions"
            value={pausedSubscriptions.length}
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
                  value={form.service}
                  onChange={(event) => updateForm("service", event.target.value)}
                  placeholder="Netflix, Notion, Gym..."
                  className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                />
                {errors.service && <p className="mt-2 text-sm text-rose-600">{errors.service}</p>}
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
                  <span className="text-sm font-semibold text-slate-700">Billing date</span>
                  <input
                    type="date"
                    value={form.billingDate}
                    onChange={(event) => updateForm("billingDate", event.target.value)}
                    className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-950 outline-none transition focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                  />
                  {errors.billingDate && (
                    <p className="mt-2 text-sm text-rose-600">{errors.billingDate}</p>
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
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <Plus className="h-5 w-5" />
                Add Subscription
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
                {categoryBreakdown.map((item) => (
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
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed border-slate-300 bg-white/60 p-8 text-center">
                <Layers3 className="mx-auto h-10 w-10 text-slate-400" />
                <p className="mt-4 font-semibold text-slate-800">No active spend yet</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add a subscription or load demo data to see the breakdown.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mt-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Subscriptions
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Demo mode: subscriptions reset on refresh.
              </p>
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
                  subscription.status === "Active" && subscription.daysUntilRenewal <= 7;
                const paused = subscription.status === "Paused";

                return (
                  <article
                    key={subscription.id}
                    className="group rounded-3xl border border-slate-200 bg-white/86 p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white shadow-glow">
                          {getInitials(subscription.service)}
                        </div>
                        <div className="min-w-0">
                          <h3 className="truncate text-lg font-semibold text-slate-950">
                            {subscription.service}
                          </h3>
                          <span
                            className={`mt-1 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${
                              categoryStyles[subscription.category]
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
                          <span className="text-sm font-medium text-slate-500">/month</span>
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
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">
                        <Zap className="h-4 w-4 text-amber-500" />
                        {subscription.daysUntilRenewal === 0
                          ? "Renews today"
                          : `${subscription.daysUntilRenewal} days until renewal`}
                      </span>
                      {dueSoon && (
                        <span className="rounded-full bg-amber-100 px-3 py-1.5 text-sm font-bold text-amber-700">
                          Due soon
                        </span>
                      )}
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                      <button
                        type="button"
                        onClick={() => toggleSubscriptionStatus(subscription.id)}
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
                        onClick={() => deleteSubscription(subscription.id)}
                        aria-label={`Delete ${subscription.service}`}
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
                Add your first recurring payment or explore the interface with realistic Indian
                pricing using demo data.
              </p>
              <button
                type="button"
                onClick={loadDemoData}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-950 px-5 py-3 font-semibold text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-slate-800"
              >
                <RefreshCcw className="h-5 w-5" />
                Load Demo Data
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
