import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const FINAL = ["success", "failed", "cancelled"];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchStatus(reference) {
  try {
    const res = await fetch(`${API_URL}/api/payments/${reference}`);
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function pollStatus(reference, tries = 12) {
  for (let i = 0; i < tries; i++) {
    await sleep(5000);
    const data = await fetchStatus(reference);
    if (data && FINAL.includes(data.status)) return data;
  }
  return null;
}

export default function PaymentForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    provider: "MTN",
    amount: "",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "phone" ? value.replace(/\D/g, "") : value });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Le nom est obligatoire";
    if (!/^\d{9}$/.test(form.phone)) e.phone = "9 chiffres, sans l'indicatif (ex : 053948344)";
    if (!(Number(form.amount) > 0)) e.amount = "Montant invalide";
    return e;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    setResult(null);
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          phone: `242${form.phone}`,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data.errors) setErrors(data.errors);
        setResult({ type: "error", message: data.error || "Le paiement a échoué." });
        return;
      }

      let payment = data;
      if (!FINAL.includes(payment.status)) {
        setResult({
          type: "info",
          message: "Paiement en attente : confirmez sur votre téléphone...",
          reference: payment.reference,
        });
        payment = (await pollStatus(payment.reference)) || payment;
      } else if (payment.status !== "success") {
        payment = (await fetchStatus(payment.reference)) || payment;
      }

      if (!payment.reference) {
        setResult({ type: "error", message: "Réponse inattendue du serveur." });
        return;
      }
      navigate(`/resultat/${payment.reference}`, { state: { payment } });
    } catch {
      setResult({ type: "error", message: "Impossible de joindre le serveur." });
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <form
      className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 sm:p-5"
      onSubmit={handleSubmit}
      noValidate
    >
      <label htmlFor="name" className="block text-xs font-semibold text-slate-700 sm:text-sm">
        Nom
        <input
          id="name"
          name="name"
          autoComplete="name"
          value={form.name}
          onChange={handleChange}
          disabled={loading}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
          className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 disabled:bg-slate-100"
        />
        {errors.name && <small id="name-error" className="mt-1.5 block text-xs font-normal text-red-700">{errors.name}</small>}
      </label>

      <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 sm:text-sm">
        Téléphone
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel-national"
          inputMode="numeric"
          maxLength={9}
          placeholder="Ex. 05XXXXXXX"
          value={form.phone}
          onChange={handleChange}
          disabled={loading}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : "phone-hint"}
          className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 disabled:bg-slate-100"
        />
        {errors.phone ? (
          <small id="phone-error" className="mt-1 block text-xs font-normal text-red-700">{errors.phone}</small>
        ) : (
          <small id="phone-hint" className="mt-1 block text-[11px] font-normal text-slate-500">
            9 chiffres, sans l’indicatif 242
          </small>
        )}
      </label>

      <label htmlFor="amount" className="block text-xs font-semibold text-slate-700 sm:text-sm">
        Montant (XAF)
        <input
          id="amount"
          name="amount"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          placeholder="Ex. 100"
          value={form.amount}
          onChange={handleChange}
          disabled={loading}
          aria-invalid={Boolean(errors.amount)}
          aria-describedby={errors.amount ? "amount-error" : undefined}
          className="mt-1 block min-h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/15 disabled:bg-slate-100"
        />
        {errors.amount && <small id="amount-error" className="mt-1 block text-xs font-normal text-red-700">{errors.amount}</small>}
      </label>

      <fieldset className="min-w-0" disabled={loading}>
        <legend className="text-xs font-semibold text-slate-700 sm:text-sm">Opérateur</legend>
        <div className="mt-1 grid grid-cols-2 gap-2">
          {[
            { value: "MTN", name: "MTN MoMo", mark: "M", markStyle: "bg-yellow-300 text-slate-900" },
            { value: "AIRTEL", name: "Airtel Money", mark: "A", markStyle: "bg-red-600 text-white" },
          ].map((provider) => (
            <label key={provider.value} className="cursor-pointer">
              <input
                className="peer sr-only"
                type="radio"
                name="provider"
                value={provider.value}
                checked={form.provider === provider.value}
                onChange={handleChange}
              />
              <span className="flex min-h-11 items-center gap-2 rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-xs font-medium text-slate-700 transition peer-checked:border-emerald-700 peer-checked:bg-emerald-50 peer-checked:text-emerald-900 peer-focus-visible:ring-4 peer-focus-visible:ring-emerald-600/20 sm:px-3 sm:text-sm">
                <span className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${provider.markStyle}`} aria-hidden="true">
                  {provider.mark}
                </span>
                <span>{provider.name}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={loading}
        className="min-h-10 w-full rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading ? "Confirmez sur votre téléphone..." : "Payer"}
      </button>

      {result && (
        <p className={`rounded-lg px-4 py-3 text-sm leading-6 ${
          result.type === "success"
            ? "bg-green-100 text-green-800"
            : result.type === "error"
              ? "bg-red-100 text-red-800"
              : "bg-amber-100 text-amber-800"
        }`}>
          {result.message}
          {result.reference && <><br />Référence : {result.reference}</>}
        </p>
      )}
    </form>
  );
}