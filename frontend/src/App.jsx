import PaymentForm from "./PaymentForm";
import ResultPage from "./ResultPage";
import { Link, Navigate, Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50">
      <nav className="fixed inset-x-0 top-0 z-10 h-14 border-b border-slate-200/70 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex h-14 w-full max-w-6xl items-center px-4">
          <Link to="/" className="text-base font-bold tracking-tight text-emerald-800">
            App_Paiement
          </Link>
        </div>
      </nav>

      <main className="fixed inset-x-0 bottom-12 top-14 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center px-4 py-3">
          <div className="mx-auto w-full max-w-md">
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <header className="mb-4 text-center">
                    <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                      Paiement mobile money
                    </h1>
                    <p className="mt-1 text-xs leading-5 text-slate-600 sm:text-sm">
                      Remplissez les informations pour effectuer votre paiement.
                    </p>
                  </header>
                  <PaymentForm />
                </>
              }
            />
            <Route path="/resultat/:reference" element={<ResultPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          </div>
        </div>
      </main>

      <footer className="fixed inset-x-0 bottom-0 z-10 flex h-12 items-center justify-center border-t border-slate-200/70 bg-white/60 px-4 text-center text-xs text-slate-500 backdrop-blur-sm">
        Paiements sécurisés avec
        <span className="ml-1 font-semibold text-slate-700">Openpay</span>
      </footer>
    </div>
  );
}