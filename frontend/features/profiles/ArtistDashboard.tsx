import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import type { Artist } from '../../types/user';
import {
  Eye,
  Heart,
  Users,
  TrendingUp,
  MessageCircle,
  Save,
  Share2,
  BarChart3,
} from 'lucide-react';
import LoadingPage from '../../components/ui/LoadingPage';

interface StatCard {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: string;
  color: string;
}

const ArtistDashboard: React.FC = () => {
  const { user } = useAuth();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatCard[]>([]);
  const [chartData, setChartData] = useState<{ day: string; vues: number }[]>([
    { day: 'Lun', vues: 150 },
    { day: 'Mar', vues: 200 },
    { day: 'Mer', vues: 180 },
    { day: 'Jeu', vues: 220 },
    { day: 'Ven', vues: 280 },
    { day: 'Sam', vues: 350 },
    { day: 'Dim', vues: 310 },
  ]);

  useEffect(() => {
    loadArtistData();
  }, [user]);

  const loadArtistData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [artistResponse, statsResponse] = await Promise.all([
        api.getArtist(user._id),
        api.getArtistStats(user._id),
      ]);
      const artistData = artistResponse.data || {
        _id: user._id,
        utilisateur_id: user._id,
        url_portfolio: '',
        specialites: [],
        verifie_le: user.cree_le,
        total_vues: statsResponse.data?.total_vues || 0,
        total_likes: statsResponse.data?.total_likes || 0,
        total_favoris: 0,
        total_abonnes: statsResponse.data?.total_abonnes || 0,
        abonnement_payant_actif: false,
        tarif_mensuel_euros: null,
      };
      const dailyViewsRaw = statsResponse.data?.daily_views as Array<{ date?: string; views: number }> | undefined;
      const normalizedChart = dailyViewsRaw?.length
        ? dailyViewsRaw.map((item) => ({
            day: item.date
              ? new Date(item.date).toLocaleDateString('fr-FR', { weekday: 'short' })
              : 'Jour',
            vues: item.views,
          }))
        : [
            { day: 'Lun', vues: 150 },
            { day: 'Mar', vues: 200 },
            { day: 'Mer', vues: 180 },
            { day: 'Jeu', vues: 220 },
            { day: 'Ven', vues: 280 },
            { day: 'Sam', vues: 350 },
            { day: 'Dim', vues: 310 },
          ];
      setChartData(normalizedChart);
      setArtist(artistData);
      updateStats({
        ...artistData,
        total_vues: statsResponse.data?.total_vues ?? artistData.total_vues ?? 0,
        total_likes: statsResponse.data?.total_likes ?? artistData.total_likes ?? 0,
        total_abonnes: statsResponse.data?.total_abonnes ?? artistData.total_abonnes ?? 0,
      }, normalizedChart);
    } catch (error) {
      console.error('Error loading artist data:', error);
      updateStats({
        _id: user._id,
        utilisateur_id: user._id,
        url_portfolio: '',
        specialites: [],
        verifie_le: user.cree_le,
        total_vues: 0,
        total_likes: 0,
        total_favoris: 0,
        total_abonnes: user.compteurs?.abonnes || 0,
        abonnement_payant_actif: false,
        tarif_mensuel_euros: null,
      }, chartData);
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (artistData: Artist, dailyViews: { day: string; vues: number }[]) => {
    const lastDayViews = dailyViews.length ? dailyViews[dailyViews.length - 1].vues : Math.floor(artistData.total_vues / 10);
    const statCards: StatCard[] = [
      {
        label: 'Abonnés',
        value: artistData.total_abonnes,
        icon: <Users size={24} />,
        trend: '+5%',
        color: 'bg-blue-100 text-blue-600',
      },
      {
        label: 'Vues (24h)',
        value: lastDayViews,
        icon: <Eye size={24} />,
        trend: '+12%',
        color: 'bg-purple-100 text-purple-600',
      },
      {
        label: 'J\'aime',
        value: artistData.total_likes,
        icon: <Heart size={24} />,
        trend: '+8%',
        color: 'bg-red-100 text-red-600',
      },
      {
        label: 'Interactions',
        value: artistData.total_likes + (artistData.total_vues * 0.1), // Simulation
        icon: <MessageCircle size={24} />,
        trend: '+15%',
        color: 'bg-green-100 text-green-600',
      },
      {
        label: 'Total Vues',
        value: artistData.total_vues,
        icon: <Eye size={24} />,
        trend: '+3%',
        color: 'bg-cyan-100 text-cyan-600',
      },
      {
        label: 'Taux Engagement',
        value: `${artistData.total_vues > 0 ? Math.round((artistData.total_likes / artistData.total_vues) * 100) : 0}%`,
        icon: <TrendingUp size={24} />,
        trend: '+2%',
        color: 'bg-orange-100 text-orange-600',
      },
      {
        label: 'Œuvres Publiées',
        value: user?.compteurs?.oeuvres || 0,
        icon: <Save size={24} />,
        trend: '+1',
        color: 'bg-indigo-100 text-indigo-600',
      },
      {
        label: 'Partages',
        value: Math.floor(artistData.total_vues * 0.05), // Simulation
        icon: <Share2 size={24} />,
        trend: '+7%',
        color: 'bg-pink-100 text-pink-600',
      },
    ];
    setStats(statCards);
  };

  if (loading) return <LoadingPage />;

  const maxVues = chartData.length > 0 ? Math.max(...chartData.map((d) => d.vues)) : 1;

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-blue-950">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-4xl font-black uppercase italic">Dashboard Artiste</h1>
          <p className="text-gray-600 mt-2">Bienvenue, {user?.nom_utilisateur}</p>
        </div>

        {/* Grille des statistiques (2x4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg p-6 shadow-sm hover:shadow-md transition">
              <div className={`w-12 h-12 rounded-lg ${stat.color} flex items-center justify-center mb-4`}>
                {stat.icon}
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <div className="flex items-baseline justify-between">
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                {stat.trend && <span className="text-xs font-semibold text-green-600">{stat.trend}</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Graphique d'ascension des vues */}
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <div className="flex items-center gap-3 mb-6">
            <BarChart3 size={24} className="text-gray-900" />
            <h2 className="text-2xl font-bold">Courbe d'Ascension</h2>
          </div>

          <div className="overflow-x-auto">
            <div className="flex items-end justify-around h-64 gap-2 px-4">
              {chartData.map((data, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-1">
                  <div className="relative h-48 w-full flex items-end justify-center">
                    <div
                      className="bg-blue-600 rounded-t-lg transition-all hover:bg-blue-700 w-3/4"
                      style={{
                        height: `${(data.vues / maxVues) * 100}%`,
                      }}
                      title={`${data.vues} vues`}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-600">{data.day}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-gray-600">Moyenne</p>
                <p className="text-xl font-bold">
                  {Math.round(chartData.reduce((sum, d) => sum + d.vues, 0) / chartData.length)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-xl font-bold">
                  {chartData.reduce((sum, d) => sum + d.vues, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Pic</p>
                <p className="text-xl font-bold">{maxVues}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Informations supplémentaires */}
        {artist && (
          <div className="bg-white rounded-lg p-8 shadow-sm">
            <h3 className="text-xl font-bold mb-6">Informations Artiste</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-2">Portfolio</label>
                {artist.url_portfolio ? (
                  <a
                    href={artist.url_portfolio}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline break-all"
                  >
                    {artist.url_portfolio}
                  </a>
                ) : (
                  <p className="text-gray-500">Non défini</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">Spécialités</label>
                <div className="flex flex-wrap gap-2">
                  {artist.specialites?.map((spec, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtistDashboard;
