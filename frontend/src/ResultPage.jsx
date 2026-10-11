import { useEffect, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const VIEWS = {
  success: {
    title: "Paiement réussi",
    box: "bg-green-100 text-green-800",
    fallback: "Votre paiement a bien été effectué.",
  },
  failed: {
    title: "Paiement échoué",
    box: "bg-red-100 text-red-800",
    fallback: "Le paiement a échoué. Vérifiez votre solde et réessayez.",
  },
  cancelled: {
    title: "Paiement annulé",
    box: "bg-red-100 text-red-800",
    fallback: "Le paiement a été annulé.",
  },
  pending: {
    title: "Paiement en attente",
    box: "bg-amber-100 text-amber-800",
    fallback: "Le paiement est toujours en cours. Confirmez sur votre téléphone puis actualisez.",
  },
};

export default function ResultPage() {
  const { reference } = useParams();
  const location = useLocation();
  const [payment, setPayment] = useState(location.state?.payment ?? null);
  const [loading, setLoading] = useState(!location.state?.payment);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/payments/${reference}`);
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Transaction introuvable.");
      setPayment(data);
    } catch (e) {
      setError(e.message || "Impossible de joindre le serveur.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!payment) load();
  }, []);

  if (loading) {
    return <p className="p-6 text-center text-slate-600">Chargement du résultat...</p>;
  }

  if (error) {
    return (
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg">
        <p className="text-red-700">{error}</p>
        <Link to="/" className="inline-block rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800">
          Retour au paiement
        </Link>
      </div>
    );
  }

  const view = VIEWS[payment.status] || VIEWS.pending;

  return (
    <div className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-lg shadow-slate-900/5">
      <h1 className="text-xl font-bold text-slate-900">{view.title}</h1>

      <p className={`rounded-lg px-4 py-3 text-sm leading-6 ${view.box}`}>
        {payment.message || view.fallback}
      </p>

      <dl className="space-y-1 text-sm text-slate-600">
        <div>Référence : <span className="font-mono">{payment.reference}</span></div>
        <div>Montant : {payment.amount} {payment.currency || "XAF"}</div>
        <div>Opérateur : {payment.provider}</div>
      </dl>

      <div className="flex flex-col gap-3">
        {payment.status === "pending" && (
          <button
            onClick={load}
            className="min-h-11 rounded-lg border border-emerald-700 px-4 py-2.5 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
          >
            Actualiser le statut
          </button>
        )}
        <Link
          to="/"
          className="min-h-11 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          {payment.status === "success" ? "Nouveau paiement" : "Réessayer"}
        </Link>
      </div>
    </div>
  );
}