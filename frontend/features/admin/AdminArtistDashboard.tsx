import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

type CandidateUser = {
  _id: string;
  nom_utilisateur?: string;
  email?: string;
};

type PieceJointe = {
  nom: string;
  url: string;
  type: string;
};

type ApplicationDoc = {
  _id: string;
  statut: string;
  url_portfolio?: string;
  utilisateur_id: CandidateUser | (CandidateUser & Record<string, unknown>);
  pieces_jointes?: PieceJointe[];
  motivation?: string;
};

type AdminUser = CandidateUser & {
  role?: string;
  est_banni?: boolean;
};

export default function AdminArtistDashboard() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { applicationId } = useParams<{ applicationId: string }>();

  const [isLoading, setIsLoading] = useState(true);
  const [applications, setApplications] = useState<ApplicationDoc[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [decisionMessage, setDecisionMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const application = useMemo(
    () => applications.find((a) => a._id === applicationId) || null,
    [applications, applicationId]
  );

  const candidate = useMemo(() => {
    if (!application) return null;

    const utilisateurId = application.utilisateur_id;
    if (typeof utilisateurId === 'object' && utilisateurId && '_id' in utilisateurId) {
      return utilisateurId as CandidateUser;
    }

    return users.find((u) => u._id === utilisateurId) || null;
  }, [application, users]);

  useEffect(() => {
    if (!user || user.role !== 'administrateur') return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      try {
        const [usersResponse, applicationsResponse] = await Promise.all([api.getUsers(), api.getApplications()]);
        if (cancelled) return;
        setUsers((usersResponse.users as AdminUser[]) || []);
        setApplications((applicationsResponse.applications as ApplicationDoc[]) || []);
      } catch (e) {
        showToast(e instanceof Error ? e.message : 'Impossible de charger la candidature', 'error');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [showToast, user]);

  const handleProcess = async (approved: boolean) => {
    if (!user?._id || !applicationId) return;

    setIsProcessing(true);
    try {
      const message =
        decisionMessage.trim() ||
        (approved
          ? 'Votre candidature a été approuvee. Bienvenue parmi nous !'
          : 'Votre candidature a été rejetée. Vous pouvez soumettre une nouvelle demande.');

      await api.processApplication(applicationId, approved, user._id, message);
      showToast(approved ? 'Candidature approuvée.' : 'Candidature rejetée.', 'success');
      navigate('/admin');
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur lors du traitement', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user || user.role !== 'administrateur') {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Acces refuse. Seuls les administrateurs peuvent acceder à cette page.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        Chargement…
      </div>
    );
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6">
        <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl text-center">
          <h1 className="text-2xl font-black mb-2">Candidature introuvable</h1>
          <button className="mt-4 bg-white text-zinc-950 px-4 py-2 font-black rounded-md" onClick={() => navigate('/admin')}>
            Retour admin
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div className="min-h-screen bg-zinc-950 text-zinc-100 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-400">FrameArt Studio</p>
            <h1 className="text-4xl font-black tracking-tight">Dashboard artiste (candidature)</h1>
            <p className="text-sm text-zinc-400 mt-2">Validez la candidature : l’artiste n’existe qu’après approbation.</p>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => navigate('/admin')}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-md font-black hover:bg-zinc-800"
            >
              ← Retour
            </button>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700" />
                <div className="min-w-0">
                  <p className="text-xl font-black truncate">{candidate?.nom_utilisateur || 'Candidat'}</p>
                  <p className="text-sm text-zinc-400 truncate">{candidate?.email || ''}</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 items-center">
                <span className="bg-amber-500 px-3 py-1 text-xs font-black uppercase text-zinc-950 rounded-full">
                  {application.statut}
                </span>
                <span className="text-xs text-zinc-400">ID: {application._id.slice(-8)}</span>
              </div>
            </div>

            <div className="flex-1" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <p className="uppercase tracking-[0.25em] text-xs font-black text-zinc-400">Portfolio</p>
              {application.url_portfolio ? (
                <a
                  href={application.url_portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-flex underline underline-offset-4 text-blue-300 hover:text-blue-200"
                >
                  <FileText className="mr-2" size={16} />
                  Ouvrir lien
                </a>
              ) : (
                <p className="mt-2 text-sm text-zinc-400">—</p>
              )}
            </div>

            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
              <p className="uppercase tracking-[0.25em] text-xs font-black text-zinc-400">Motivation</p>
              <p className="mt-2 text-sm text-zinc-200 leading-relaxed">
                {application.motivation || '—'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
            <p className="uppercase tracking-[0.25em] text-xs font-black text-zinc-400">Pièces jointes</p>
            {application.pieces_jointes && application.pieces_jointes.length > 0 ? (
              <div className="mt-3 space-y-2">
                {application.pieces_jointes.map((p) => (
                  <a
                    key={`${p.type}-${p.url}`}
                    href={p.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block px-3 py-2 rounded-md bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition"
                  >
                    <div className="font-black">{p.nom}</div>
                    <div className="text-xs text-zinc-400">{p.type}</div>
                  </a>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-sm text-zinc-400">Aucune pièce.</p>
            )}
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
          <div>
            <p className="uppercase tracking-[0.25em] text-xs font-black text-zinc-400">Message de décision (public)</p>
            <input
              value={decisionMessage}
              onChange={(e) => setDecisionMessage(e.target.value)}
              placeholder="Optionnel : message envoyé au candidat…"
              className="mt-2 w-full bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 outline-none"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button
              type="button"
              onClick={() => handleProcess(true)}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black uppercase text-xs px-4 py-3 rounded-md transition disabled:opacity-60"
            >
              <CheckCircle size={16} />
              Approuver
            </button>

            <button
              type="button"
              onClick={() => handleProcess(false)}
              disabled={isProcessing}
              className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-zinc-950 font-black uppercase text-xs px-4 py-3 rounded-md transition disabled:opacity-60"
            >
              <XCircle size={16} />
              Rejeter
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
