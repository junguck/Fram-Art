import { motion } from 'framer-motion';
import type React from 'react';
import { Ban, Eye, FileText, MessageSquare, TrendingUp, UserCheck, Users } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { api } from '../../services/api';

type AdminTab = 'overview' | 'users' | 'artists' | 'applications' | 'chat' | 'bans';

type CandidateUser = {
  _id: string;
  nom_utilisateur?: string;
  email?: string;
  url_avatar?: string | null;
  role?: string;
  est_banni?: boolean;
  est_actif?: boolean;
};

type ArtistItem = {
  _id: string;
  utilisateur_id?: {
    _id?: string;
    nom_utilisateur?: string;
    email?: string;
    url_avatar?: string | null;
  } | string;
  url_portfolio?: string;
  specialites?: string[];
  total_vues?: number;
  total_likes?: number;
  total_abonnes?: number;
  abonnement_payant_actif?: boolean;
  tarif_mensuel_euros?: number;
};

type ApplicationDoc = {
  _id: string;
  statut: string;
  url_portfolio?: string;
  utilisateur_id: string | CandidateUser;
  motivation?: string;
  pieces_jointes?: Array<{ nom: string; url: string; type: string }>;
};

type PostDoc = {
  _id: string;
  titre?: string;
  url_image?: string;
  nb_vues?: number;
  nb_likes?: number;
};

const ADMIN_ROLE = 'administrateur' as const;

const pendingStatuses: ApplicationDoc['statut'][] = ['en_attente', 'en_examen', 'resoumis'];

function getCandidateFromApplication(app: ApplicationDoc, users: CandidateUser[]): CandidateUser | null {
  const utilisateur = app.utilisateur_id;
  if (typeof utilisateur === 'string') {
    return users.find((u) => u._id === utilisateur) ?? null;
  }
  return utilisateur ?? null;
}

function getCandidateName(candidate: CandidateUser | null): string {
  return candidate?.nom_utilisateur ?? 'Candidat';
}

function getAvatarUrl(name: string, urlAvatar?: string | null): string {
  if (urlAvatar) return urlAvatar;
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=111827&color=ffffff`;
}

const AdminPage = () => {
  const { user } = useAuth();
  const { showToast } = useToast();


  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [users, setUsers] = useState<CandidateUser[]>([]);
  const [posts, setPosts] = useState<PostDoc[]>([]);
  const [applications, setApplications] = useState<ApplicationDoc[]>([]);
  const [artists, setArtists] = useState<ArtistItem[]>([]);
  const [artistQuery, setArtistQuery] = useState('');
  const [applicationQuery, setApplicationQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadAdminData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const [usersResponse, postsResponse, applicationsResponse, artistsResponse] = await Promise.all([
        api.getUsers(),
        api.getPosts(),
        api.getApplications(),
        api.getArtists(),
      ]);

      setUsers((usersResponse.users as CandidateUser[]) ?? []);
      setPosts((postsResponse.posts as PostDoc[]) ?? []);
      setApplications((applicationsResponse.applications as ApplicationDoc[]) ?? []);
      setArtists((artistsResponse.artists as ArtistItem[]) ?? []);
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible de charger le dashboard admin', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAdminData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const stats = useMemo(() => {
    const artistsList = artists;
    const banned = users.filter((item) => Boolean(item.est_banni));
    const pending = applications.filter((item) => pendingStatuses.includes(item.statut));
    const approved = applications.filter((item) => item.statut === 'approuve');
    const rejected = applications.filter((item) => item.statut === 'rejete');
    
    const totalViews = posts.reduce((sum, post) => sum + (post.nb_vues ?? 0), 0);
    const totalLikes = posts.reduce((sum, post) => sum + (post.nb_likes ?? 0), 0);
    const avgViewsPerPost = posts.length > 0 ? Math.round(totalViews / posts.length) : 0;
    const avgLikesPerPost = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
    
    const activePosts = posts.filter((p) => (p.nb_vues ?? 0) > 0).length;
    const engagementRate = totalViews > 0 ? Math.round((totalLikes / totalViews) * 100) : 0;
    
    const premiumArtists = artistsList.filter((a) => a.abonnement_payant_actif).length;
    const avgArtistViews = artistsList.length > 0 ? Math.round(artistsList.reduce((sum, a) => sum + (a.total_vues ?? 0), 0) / artistsList.length) : 0;
    const avgArtistLikes = artistsList.length > 0 ? Math.round(artistsList.reduce((sum, a) => sum + (a.total_likes ?? 0), 0) / artistsList.length) : 0;
    
    const approvalRate = approved.length + rejected.length > 0 
      ? Math.round((approved.length / (approved.length + rejected.length)) * 100) 
      : 0;
    
    const activeUsers = users.filter((u) => Boolean(u.est_actif)).length;
    const banRate = users.length > 0 ? Math.round((banned.length / users.length) * 100) : 0;

    return {
      artists: artistsList,
      banned,
      pending,
      approved,
      rejected,
      totalViews,
      totalLikes,
      avgViewsPerPost,
      avgLikesPerPost,
      activePosts,
      engagementRate,
      premiumArtists,
      avgArtistViews,
      avgArtistLikes,
      approvalRate,
      activeUsers,
      banRate,
    };
  }, [users, posts, applications, artists]);

  const handleProcessApplication = async (applicationId: string, approved: boolean, decisionMessage?: string) => {
    if (!user?._id) return;

    await api.processApplication(applicationId, approved, user._id, decisionMessage);
    showToast(approved ? 'Candidature approuvée.' : 'Candidature rejetée.', 'success');
    await loadAdminData();
  };

  const handleRevokeArtist = async (artistId: string) => {
    try {
      await api.revokeArtist(artistId);
      showToast('Statut artiste révoqué.', 'success');
      await loadAdminData();
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'Impossible de révoquer l’artiste', 'error');
    }
  };

  const filteredArtists = useMemo(() => {
    const query = artistQuery.trim().toLowerCase();
    if (!query) {
      return artists;
    }

    return artists.filter((artist) => {
      const userObj = typeof artist.utilisateur_id === 'object' ? artist.utilisateur_id : null;
      const name = userObj?.nom_utilisateur?.toLowerCase() || '';
      const email = userObj?.email?.toLowerCase() || '';
      const portfolio = (artist.url_portfolio || '').toLowerCase();
      const specialties = (artist.specialites || []).join(' ').toLowerCase();
      return name.includes(query) || email.includes(query) || portfolio.includes(query) || specialties.includes(query);
    });
  }, [artistQuery, artists]);

  const filteredApplications = useMemo(() => {
    const query = applicationQuery.trim().toLowerCase();
    if (!query) return applications;

    return applications.filter((application) => {
      const candidate = getCandidateFromApplication(application, users);
      const haystack = [
        candidate?.nom_utilisateur,
        candidate?.email,
        application.url_portfolio,
        application.motivation,
        application.statut,
      ].join(' ').toLowerCase();
      return haystack.includes(query);
    });
  }, [applicationQuery, applications, users]);

  if (user?.role !== ADMIN_ROLE) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <p>Accès refusé. Seuls les administrateurs peuvent accéder à cette page.</p>
      </div>
    );
  }

  const tabs: Array<{ id: AdminTab; label: string; icon: React.ComponentType<{ size?: number }> }> = [
    { id: 'overview', label: 'Stats', icon: TrendingUp },
    { id: 'users', label: 'Utilisateurs', icon: Users },
    { id: 'artists', label: 'Artistes', icon: UserCheck },
    { id: 'applications', label: 'Candidatures', icon: FileText },
    { id: 'chat', label: 'Messages', icon: MessageSquare },
    { id: 'bans', label: 'Modération', icon: Ban },
  ];

  return (
    <motion.div className="min-h-screen bg-zinc-950 text-mist-900 p-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col gap-2">
          <p className="text-sm font-bold uppercase tracking-[0.3em] text-red-400">FrameArt Studio</p>
          <h1 className="text-4xl font-black tracking-tight">Dashboard administrateur</h1>
          <p className="text-sm text-zinc-400">Vue globale des utilisateurs, artistes, œuvres et candidatures.</p>
        </div>

        <div className="mb-8 flex flex-wrap gap-2 border-b border-zinc-800 pb-3">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition ${
                activeTab === tab.id ? 'bg-white text-zinc-950' : 'bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
              }`}
            >
              <tab.icon size={17} />
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="p-10 text-center font-bold text-zinc-400">Chargement des statistiques...</div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverview
                users={users}
                posts={posts}
                totalViews={stats.totalViews}
                totalLikes={stats.totalLikes}
                avgViewsPerPost={stats.avgViewsPerPost}
                avgLikesPerPost={stats.avgLikesPerPost}
                activePosts={stats.activePosts}
                engagementRate={stats.engagementRate}
                artistsCount={stats.artists.length}
                premiumArtists={stats.premiumArtists}
                avgArtistViews={stats.avgArtistViews}
                avgArtistLikes={stats.avgArtistLikes}
                pendingCount={stats.pending.length}
                approvedCount={stats.approved.length}
                rejectedCount={stats.rejected.length}
                approvalRate={stats.approvalRate}
                activeUsers={stats.activeUsers}
                banRate={stats.banRate}
              />
            )}

            {activeTab === 'users' && <UsersTable users={users} />}

            {activeTab === 'artists' && (
              <ArtistsPanel
                artists={filteredArtists}
                query={artistQuery}
                onQueryChange={setArtistQuery}
                onRevokeArtist={handleRevokeArtist}
              />
            )}

            {activeTab === 'applications' && (
              <ApplicationsTable
                applications={filteredApplications}
                users={users}
                query={applicationQuery}
                onQueryChange={setApplicationQuery}
                onProcess={handleProcessApplication}
              />
            )}

            {activeTab === 'chat' && (
              <EmptyPanel title="Messages" text="Les tickets support et messages directs seront listés ici." />
            )}

            {activeTab === 'bans' && <UsersTable users={stats.banned} title="Comptes bannis" />}
          </>
        )}
      </div>
    </motion.div>
  );
};

type AdminOverviewProps = {
  users: CandidateUser[];
  posts: PostDoc[];
  totalViews: number;
  totalLikes: number;
  avgViewsPerPost: number;
  avgLikesPerPost: number;
  activePosts: number;
  engagementRate: number;
  artistsCount: number;
  premiumArtists: number;
  avgArtistViews: number;
  avgArtistLikes: number;
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  approvalRate: number;
  activeUsers: number;
  banRate: number;
};

const AdminOverview: React.FC<AdminOverviewProps> = ({
  users,
  posts,
  totalViews,
  totalLikes,
  avgViewsPerPost,
  avgLikesPerPost,
  activePosts,
  engagementRate,
  artistsCount,
  premiumArtists,
  avgArtistViews,
  avgArtistLikes,
  pendingCount,
  approvedCount,
  rejectedCount,
  approvalRate,
  activeUsers,
  banRate,
}) => {
  const keyMetrics = [
    { label: 'Utilisateurs actifs', value: activeUsers, icon: Users, color: 'bg-blue-600' },
    { label: 'Artistes', value: artistsCount, icon: UserCheck, color: 'bg-emerald-600' },
    { label: 'Œuvres', value: posts.length, icon: Eye, color: 'bg-violet-600' },
    { label: 'Candidatures', value: pendingCount, icon: FileText, color: 'bg-amber-500' },
  ];

  const detailedStats = [
    { label: 'Vues totales', value: totalViews.toLocaleString(), detail: `${avgViewsPerPost} en moyenne par œuvre` },
    { label: 'Likes totaux', value: totalLikes.toLocaleString(), detail: `${avgLikesPerPost} en moyenne par œuvre` },
    { label: 'Engagement', value: `${engagementRate}%`, detail: `${activePosts}/${posts.length} œuvres actives` },
    { label: 'Artistes premium', value: premiumArtists, detail: `${artistsCount > 0 ? Math.round((premiumArtists / artistsCount) * 100) : 0}% des artistes` },
  ];

  const applicationStats = [
    { label: 'Approuvées', value: approvedCount, color: 'bg-emerald-500' },
    { label: 'En attente', value: pendingCount, color: 'bg-amber-500' },
    { label: 'Rejetées', value: rejectedCount, color: 'bg-red-500' },
  ];

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {keyMetrics.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-zinc-900 border border-zinc-800 p-5"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <div className={`mb-5 flex h-10 w-10 items-center justify-center ${stat.color}`}>
              <stat.icon size={21} />
            </div>
            <p className="text-4xl font-black">{stat.value}</p>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Detailed Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {detailedStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            className="bg-zinc-900 border border-zinc-800 p-4"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500 mb-2">{stat.label}</p>
            <p className="text-3xl font-black mb-1">{stat.value}</p>
            <p className="text-xs text-zinc-400">{stat.detail}</p>
          </motion.div>
        ))}
      </div>

      {/* Content & Users Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Stats */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="mb-6 text-xl font-black">Candidatures</h2>
          <div className="space-y-4">
            {applicationStats.map((stat) => (
              <div key={stat.label}>
                <div className="mb-2 flex justify-between text-sm font-bold">
                  <span>{stat.label}</span>
                  <span>{stat.value}</span>
                </div>
                <div className="h-3 bg-zinc-800">
                  <div
                    className={`h-full ${stat.color}`}
                    style={{ width: `${Math.max(6, ((stat.value / Math.max(approvedCount, pendingCount, rejectedCount, 1)) * 100))}%` }}
                  />
                </div>
              </div>
            ))}
            <div className="mt-4 p-3 bg-zinc-800 rounded text-sm">
              <p className="font-bold">Taux d'approbation</p>
              <p className="text-zinc-400">{approvalRate}% des candidatures approuvées</p>
            </div>
          </div>
        </div>

        {/* User Demographics */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="mb-6 text-xl font-black">Utilisateurs</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>Actifs</span>
                <span>{activeUsers}</span>
              </div>
              <div className="h-3 bg-zinc-800">
                <div
                  className="h-full bg-blue-500"
                  style={{ width: `${users.length > 0 ? Math.max(6, ((activeUsers / users.length) * 100)) : 0}%` }}
                />
              </div>
            </div>
            <div>
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>Bannis</span>
                <span>{users.filter((u) => u.est_banni).length}</span>
              </div>
              <div className="h-3 bg-zinc-800">
                <div
                  className="h-full bg-red-500"
                  style={{ width: `${Math.max(6, banRate)}%` }}
                />
              </div>
            </div>
            <div className="mt-4 p-3 bg-zinc-800 rounded text-sm">
              <p className="font-bold">Total utilisateurs</p>
              <p className="text-zinc-400">{users.length} utilisateurs inscrits</p>
            </div>
          </div>
        </div>

        {/* Artist Performance */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="mb-6 text-xl font-black">Performance artistes</h2>
          <div className="space-y-4 text-sm">
            <div>
              <p className="font-bold">Vues moyennes</p>
              <p className="text-2xl font-black">{avgArtistViews.toLocaleString()}</p>
              <p className="text-zinc-400">par artiste</p>
            </div>
            <div>
              <p className="font-bold">Likes moyens</p>
              <p className="text-2xl font-black">{avgArtistLikes.toLocaleString()}</p>
              <p className="text-zinc-400">par artiste</p>
            </div>
            <div className="mt-4 p-3 bg-zinc-800 rounded">
              <p className="font-bold">Abonnement premium</p>
              <p className="text-zinc-400">{premiumArtists}/{artistsCount} artistes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Posts */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="mb-6 text-xl font-black">Top 5 œuvres</h2>
          <div className="space-y-3">
            {posts
              .slice()
              .sort((a, b) => (b.nb_vues ?? 0) - (a.nb_vues ?? 0))
              .slice(0, 5)
              .map((post, idx) => (
                <div key={post._id} className="flex items-center gap-3">
                  <span className="text-sm font-black text-zinc-500">#{idx + 1}</span>
                  <img src={post.url_image || ''} alt={post.titre || 'œuvre'} className="h-12 w-12 object-cover rounded-md" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold">{post.titre || '—'}</p>
                    <p className="text-xs text-zinc-500">
                      {(post.nb_vues ?? 0).toLocaleString()} vues • {(post.nb_likes ?? 0).toLocaleString()} likes
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Engagement Trend */}
        <div className="bg-zinc-900 border border-zinc-800 p-6">
          <h2 className="mb-6 text-xl font-black">Ratio engagement</h2>
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex justify-between text-sm font-bold">
                <span>Taux engagement global</span>
                <span>{engagementRate}%</span>
              </div>
              <div className="h-4 bg-zinc-800 rounded">
                <div className="h-full bg-gradient-to-r from-pink-600 to-purple-600 rounded" style={{ width: `${engagementRate}%` }} />
              </div>
            </div>
            <div className="mt-6 space-y-2 text-sm text-zinc-400">
              <p>• {posts.length} œuvres au total</p>
              <p>• {activePosts} œuvres avec engagement</p>
              <p>• {Math.round(totalViews / (artistsCount || 1))} vues moyennes par artiste</p>
              <p>• {Math.round((totalLikes / Math.max(totalViews, 1)) * 100)}% ratio likes/vues</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

type UsersTableProps = {
  users: CandidateUser[];
  title?: string;
};

const UsersTable: React.FC<UsersTableProps> = ({ users, title = 'Tous les utilisateurs' }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800">
      <div className="border-b border-zinc-800 p-5">
        <h2 className="text-xl font-black">{title}</h2>
      </div>
      <div className="divide-y divide-zinc-800">
        {users.map((item) => {
          const name = item.nom_utilisateur ?? 'Utilisateur';
          const avatar = getAvatarUrl(name, item.url_avatar);
          return (
            <div key={item._id} className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4">
              <img src={avatar} alt={name} className="h-12 w-12 object-cover rounded-full" />
              <div>
                <p className="font-bold">{name}</p>
                <p className="text-sm text-zinc-500">{item.email || ''}</p>
              </div>
              <span
                className={`px-3 py-1 text-xs font-black uppercase ${
                  item.est_banni ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {item.est_banni ? 'Banni' : item.role || 'utilisateur'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

type ArtistsPanelProps = {
  artists: ArtistItem[];
  query: string;
  onQueryChange: (value: string) => void;
  onRevokeArtist: (artistId: string) => void;
};

const ArtistsPanel: React.FC<ArtistsPanelProps> = ({ artists, query, onQueryChange, onRevokeArtist }) => {
  return (
    <div className="space-y-4">
      <div className="bg-zinc-900 border border-zinc-800 p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-xl font-black">Artistes actifs</h2>
            <p className="text-sm text-zinc-400 mt-1">Rechercher par nom, email, portfolio ou spécialités.</p>
          </div>
          <div className="max-w-md">
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Rechercher un artiste"
              className="w-full rounded-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-white"
            />
          </div>
        </div>
      </div>

      {artists.length === 0 ? (
        <EmptyPanel title="Aucun artiste trouvé" text="Ajuste les filtres ou ajoute des candidats validés." />
      ) : (
        <div className="bg-zinc-900 border border-zinc-800 divide-y divide-zinc-800">
          {artists.map((artist) => {
            const userObj = typeof artist.utilisateur_id === 'object' ? artist.utilisateur_id : null;
            const name = userObj?.nom_utilisateur || 'Artiste';
            const email = userObj?.email || '—';
            const avatar = getAvatarUrl(name, userObj?.url_avatar);
            return (
              <div key={artist._id} className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[auto_1fr_auto] items-center">
                <div className="flex items-center gap-4">
                  <img src={avatar} alt={name} className="h-12 w-12 rounded-full object-cover" />
                  <div>
                    <p className="font-bold">{name}</p>
                    <p className="text-sm text-zinc-500">{email}</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-zinc-400">
                  <p>Portfolio: {artist.url_portfolio || '—'}</p>
                  <p>Spécialités: {(artist.specialites || []).join(', ') || 'Non renseignées'}</p>
                  <p>Vues: {artist.total_vues ?? 0} • Likes: {artist.total_likes ?? 0} • Abonnés: {artist.total_abonnes ?? 0}</p>
                </div>
                <div className="flex flex-col items-start gap-3 sm:items-end">
                  <button
                    type="button"
                    onClick={() => onRevokeArtist(artist._id)}
                    className="rounded-full bg-red-500 px-4 py-2 text-xs font-black uppercase text-zinc-950 hover:bg-red-600"
                  >
                    Révoquer
                  </button>
                  <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-400">
                    {artist.abonnement_payant_actif ? 'Premium actif' : 'Standard'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

type ApplicationsTableProps = {
  applications: ApplicationDoc[];
  users: CandidateUser[];
  query: string;
  onQueryChange: (value: string) => void;
  onProcess: (applicationId: string, approved: boolean, decisionMessage?: string) => Promise<void>;
};

const ApplicationsTable: React.FC<ApplicationsTableProps> = ({ applications, users, query, onQueryChange, onProcess }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800">
      <div className="border-b border-zinc-800 p-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-xl font-black">Candidatures artistes</h2>
          <p className="text-sm text-zinc-500">Recherche par nom, email, portfolio, statut ou motivation.</p>
        </div>
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Rechercher une candidature"
          className="w-full max-w-md rounded-full border border-zinc-700 bg-zinc-950 px-4 py-3 text-sm text-zinc-100 outline-none focus:border-white"
        />
      </div>

      <div className="divide-y divide-zinc-800">
        {applications.map((application) => {
          const candidate = getCandidateFromApplication(application, users);
          return (
            <AdminApplicationRow
              key={application._id}
              applicationId={application._id}
              candidateName={getCandidateName(candidate)}
              candidatePortfolio={application.url_portfolio}
              statut={application.statut}
              onProcess={onProcess}
            />
          );
        })}
      </div>
    </div>
  );
};

type AdminApplicationRowProps = {
  applicationId: string;
  candidateName: string;
  candidatePortfolio?: string;
  statut: string;
  onProcess: (applicationId: string, approved: boolean, decisionMessage?: string) => Promise<void>;
};

const AdminApplicationRow: React.FC<AdminApplicationRowProps> = ({
  applicationId,
  candidateName,
  candidatePortfolio,
  statut,
  onProcess,
}) => {
  const { showToast } = useToast();
  const [decisionMessage, setDecisionMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handle = async (approved: boolean) => {
    setIsProcessing(true);
    try {
      const message =
        decisionMessage.trim() ||
        (approved
          ? 'Votre candidature a été approuvée. Bienvenue parmi nous !'
          : 'Votre candidature a été rejetée. Vous pouvez soumettre une nouvelle demande.');

      await onProcess(applicationId, approved, message);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Erreur lors du traitement', 'error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-[1fr_auto]">
      <div className="min-w-0">
        <p className="font-bold truncate">{candidateName}</p>
        <p className="text-sm text-zinc-500 truncate">{candidatePortfolio || '—'}</p>

        <div className="mt-3 flex flex-wrap gap-2 items-center">
          <span className="bg-amber-500 px-3 py-1 text-xs font-black uppercase text-zinc-950">{statut}</span>
          <input
            value={decisionMessage}
            onChange={(e) => setDecisionMessage(e.target.value)}
            placeholder="Message optionnel (public) ..."
            className="bg-zinc-800 text-zinc-100 border border-zinc-700 px-3 py-2 rounded-md text-sm w-full sm:w-[320px]"
          />
        </div>
      </div>

      <div className="flex gap-2 items-start justify-start sm:justify-end">
        <button
          type="button"
          onClick={() => void handle(true)}
          disabled={isProcessing}
          className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black uppercase text-xs px-4 py-2 rounded-md transition disabled:opacity-60"
        >
          Approuver
        </button>
        <button
          type="button"
          onClick={() => void handle(false)}
          disabled={isProcessing}
          className="bg-red-500 hover:bg-red-600 text-zinc-950 font-black uppercase text-xs px-4 py-2 rounded-md transition disabled:opacity-60"
        >
          Rejeter
        </button>
      </div>
    </div>
  );
};

const EmptyPanel: React.FC<{ title: string; text: string }> = ({ title, text }) => (
  <div className="border border-zinc-800 bg-zinc-900 p-10 text-center">
    <h2 className="text-xl font-black">{title}</h2>
    <p className="mt-2 text-zinc-500">{text}</p>
  </div>
);

export default AdminPage;
