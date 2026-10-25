import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './views/DashboardView';
import { FarmsView } from './views/FarmsView';
import { CropCyclesView } from './views/CropCyclesView';
import { AssistantView } from './views/AssistantView';
import { DiseaseDoctorView } from './views/DiseaseDoctorView';
import { IrrigationSoilView } from './views/IrrigationSoilView';
import { WeatherView } from './views/WeatherView';
import { MarketView } from './views/MarketView';
import { SchemesView } from './views/SchemesView';
import { TasksView } from './views/TasksView';
import { ReportsView } from './views/ReportsView';
import { AdminView } from './views/AdminView';
import { ProfileView } from './views/ProfileView';
import { AuthLandingView } from './views/AuthLandingView';
import { OnboardingView } from './views/OnboardingView';
import { SupabaseHubView } from './views/SupabaseHubView';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { api } from './lib/api';
import {
  Farm,
  CropCycle,
  CropCatalogItem,
  Task,
  WeatherData,
  MarketPrice,
  GovernmentScheme,
  UserProfile,
  AuthUser,
} from './types';
import { Menu, X, Sprout } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);

  // Core Data States
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [cropCycles, setCropCycles] = useState<CropCycle[]>([]);
  const [cropCatalog, setCropCatalog] = useState<CropCatalogItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load app data
  const loadAppData = async () => {
    try {
      const [
        fetchedFarms,
        fetchedCycles,
        fetchedCrops,
        fetchedTasks,
        fetchedMarkets,
        fetchedSchemes,
        fetchedProfile,
      ] = await Promise.all([
        api.getFarms(),
        api.getCropCycles(),
        api.getCrops(),
        api.getTasks(),
        api.getMarketPrices(),
        api.getGovernmentSchemes(),
        api.getProfile(),
      ]);

      setFarms(fetchedFarms);
      const initialFarmId = fetchedFarms[0]?.id || '';
      setSelectedFarmId(initialFarmId);
      setCropCycles(fetchedCycles);
      setCropCatalog(fetchedCrops);
      setTasks(fetchedTasks);
      setMarketPrices(fetchedMarkets);
      setSchemes(fetchedSchemes);
      setProfile(fetchedProfile);

      if (initialFarmId) {
        const w = await api.getWeather(initialFarmId);
        setWeather(w);
      }
    } catch (err) {
      console.error('Error loading app data:', err);
    }
  };

  // Initial Auth Check
  useEffect(() => {
    let isMounted = true;
    async function checkAuth() {
      try {
        const me = await api.getMe();
        if (!isMounted) return;
        if (me?.user) {
          setCurrentUser(me.user);
          await loadAppData();
        }
      } catch (err) {
        console.error('Auth verification error:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();
    return () => {
      isMounted = false;
    };
  }, []);

  // Update weather when selected farm changes
  useEffect(() => {
    if (!selectedFarmId) return;
    let isMounted = true;
    api.getWeather(selectedFarmId).then((w) => {
      if (isMounted) setWeather(w);
    }).catch((err) => console.error(err));
    return () => {
      isMounted = false;
    };
  }, [selectedFarmId]);

  const weatherRef = React.useRef(weather);
  React.useEffect(() => {
    weatherRef.current = weather;
  }, [weather]);

  // Real-time telemetry pulse & periodic live refresh (every 25 seconds)
  useEffect(() => {
    if (!currentUser || !currentUser.has_completed_onboarding || !selectedFarmId) return;

    const intervalId = setInterval(async () => {
      try {
        // 1. Fetch latest real-time weather preserving any user-selected active coordinates/station
        const currentCoords = weatherRef.current?.coordinates;
        const currentLocation = weatherRef.current?.location;
        const latestWeather = await api.getWeather(
          selectedFarmId,
          currentCoords
            ? {
                lat: currentCoords.latitude,
                lng: currentCoords.longitude,
                location: currentLocation,
              }
            : undefined
        );
        setWeather(latestWeather);

        // 2. Refresh pending tasks count
        const latestTasks = await api.getTasks();
        setTasks(latestTasks);

        // 3. Keep farm sensor telemetry synchronized with live ambient conditions
        setFarms((prevFarms) =>
          prevFarms.map((farm) => {
            if (farm.id === selectedFarmId && latestWeather?.current) {
              return {
                ...farm,
                average_temperature: latestWeather.current.temperature_c,
                humidity: latestWeather.current.humidity_percent,
              };
            }
            return farm;
          })
        );
      } catch (err) {
        console.warn('[Real-time Telemetry Pulse] Background sync tick:', err);
      }
    }, 25000);

    return () => clearInterval(intervalId);
  }, [currentUser, selectedFarmId]);

  const currentFarm = farms.find((f) => f.id === selectedFarmId) || farms[0];
  const pendingTasksCount = tasks.filter((t) => t.status === 'pending').length;

  // Auth Handlers
  const handleLoginSuccess = async (user: AuthUser) => {
    setCurrentUser(user);
    if (user.has_completed_onboarding) {
      setIsLoading(true);
      await loadAppData();
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async (data: { user: AuthUser; farm: any; cropCycle: any }) => {
    setCurrentUser(data.user);
    setIsLoading(true);
    await loadAppData();
    if (data.farm?.id) {
      setSelectedFarmId(data.farm.id);
    }
    setActiveTab('dashboard');
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await api.logout();
    setCurrentUser(null);
    setActiveTab('dashboard');
  };

  // Farm Actions
  const handleAddFarm = async (farmData: Partial<Farm>) => {
    const newFarm = await api.createFarm(farmData);
    setFarms((prev) => [...prev, newFarm]);
    setSelectedFarmId(newFarm.id);
  };

  const handleUpdateFarm = async (id: string, farmData: Partial<Farm>) => {
    const updated = await api.updateFarm(id, farmData);
    setFarms((prev) => prev.map((f) => (f.id === id ? updated : f)));
  };

  const handleDeleteFarm = async (id: string) => {
    await api.deleteFarm(id);
    const remaining = farms.filter((f) => f.id !== id);
    setFarms(remaining);
    if (selectedFarmId === id && remaining.length > 0) {
      setSelectedFarmId(remaining[0].id);
    }
  };

  // Crop Cycle Actions
  const handleAddCropCycle = async (cycleData: Partial<CropCycle>) => {
    const newCycle = await api.createCropCycle(cycleData);
    setCropCycles((prev) => [...prev, newCycle]);
  };

  // Task Actions
  const handleAddTask = async (taskData: Partial<Task>) => {
    const newTask = await api.createTask(taskData);
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleToggleTask = async (taskId: string) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;
    const newStatus = target.status === 'completed' ? 'pending' : 'completed';
    const updated = await api.updateTask(taskId, { status: newStatus });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
  };

  const handleDeleteTask = async (taskId: string) => {
    await api.deleteTask(taskId);
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  // Profile Action
  const handleUpdateProfile = async (profileData: Partial<UserProfile>) => {
    const updated = await api.updateProfile(profileData);
    setProfile(updated);
  };

  // Quick Action Redirects
  const handleOpenQuickAction = (action: string) => {
    if (action === 'askAgent') setActiveTab('assistant');
    else if (action === 'uploadDisease') setActiveTab('disease');
    else if (action === 'addFarm') setActiveTab('farms');
    else if (action === 'addTask') setActiveTab('tasks');
    else if (action === 'addCropCycle') setActiveTab('crops');
  };

  // If farmer is not authenticated: Show Landing & Auth page!
  if (!currentUser) {
    return <AuthLandingView onLoginSuccess={handleLoginSuccess} />;
  }

  // If farmer is authenticated but has not completed onboarding: Show Onboarding wizard!
  if (!currentUser.has_completed_onboarding) {
    return (
      <OnboardingView
        user={currentUser}
        onOnboardingComplete={handleOnboardingComplete}
      />
    );
  }

  // Farmer is authenticated and onboarded: Show full dashboard!
  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        farms={farms}
        selectedFarmId={selectedFarmId}
        onSelectFarm={setSelectedFarmId}
        profile={profile}
        onOpenQuickAction={handleOpenQuickAction}
        pendingTasksCount={pendingTasksCount}
        onSignOut={handleSignOut}
        onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
        onOpenDatabaseHub={() => setActiveTab('database')}
        weather={weather}
        tasks={tasks}
        onNavigate={(tab) => setActiveTab(tab as any)}
      />

      {/* Mobile Menu Toggle Bar */}
      <div className="md:hidden bg-stone-900 border-b border-stone-800 px-4 py-2 flex items-center justify-between">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-stone-950 px-3 py-1.5 rounded-lg border border-stone-800 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          <span>{isMobileMenuOpen ? 'Close Menu' : 'Farming Modules'}</span>
        </button>
        <span className="text-xs text-stone-400 capitalize font-medium">
          Tab: <strong className="text-white">{activeTab}</strong>
        </span>
      </div>

      {/* Main Body */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop & Mobile Responsive Sidebar */}
        <div
          className={`${
            isMobileMenuOpen
              ? 'fixed inset-0 z-50 bg-stone-950/95 flex flex-col'
              : 'hidden md:flex'
          }`}
        >
          {isMobileMenuOpen && (
            <div className="p-4 border-b border-stone-800 flex items-center justify-between">
              <span className="font-bold text-sm text-white flex items-center gap-2">
                <Sprout className="w-4 h-4 text-emerald-400" />
                <span>AgriGenius Modules</span>
              </span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded bg-stone-800 text-stone-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}
          <Sidebar
            activeTab={activeTab}
            onTabChange={(tab) => {
              setActiveTab(tab);
              setIsMobileMenuOpen(false);
            }}
            pendingTasksCount={pendingTasksCount}
          />
        </div>

        {/* Dynamic Content Views */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center space-y-3">
              <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-stone-400 font-medium">
                Calibrating AgriGenius Autonomous Agent...
              </p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  currentFarm={currentFarm}
                  farms={farms}
                  cropCycles={cropCycles}
                  tasks={tasks}
                  weather={weather}
                  profile={profile}
                  onNavigate={setActiveTab}
                  onOpenQuickAction={handleOpenQuickAction}
                  onToggleTask={handleToggleTask}
                  onOpenVoiceAssistant={() => setIsVoiceModalOpen(true)}
                  onRefreshData={loadAppData}
                />
              )}

              {activeTab === 'farms' && (
                <FarmsView
                  farms={farms}
                  selectedFarmId={selectedFarmId}
                  onSelectFarm={setSelectedFarmId}
                  onAddFarm={handleAddFarm}
                  onUpdateFarm={handleUpdateFarm}
                  onDeleteFarm={handleDeleteFarm}
                />
              )}

              {activeTab === 'crops' && (
                <CropCyclesView
                  cropCycles={cropCycles}
                  farms={farms}
                  cropCatalog={cropCatalog}
                  selectedFarmId={selectedFarmId}
                  onAddCropCycle={handleAddCropCycle}
                />
              )}

              {activeTab === 'assistant' && (
                <AssistantView
                  currentFarm={currentFarm}
                  cropCycles={cropCycles}
                />
              )}

              {activeTab === 'disease' && (
                <DiseaseDoctorView
                  currentFarm={currentFarm}
                  cropCycles={cropCycles}
                />
              )}

              {activeTab === 'irrigation' && (
                <IrrigationSoilView
                  currentFarm={currentFarm}
                />
              )}

              {activeTab === 'weather' && (
                <WeatherView
                  currentFarm={currentFarm}
                  weather={weather}
                  onWeatherUpdate={setWeather}
                />
              )}

              {activeTab === 'market' && (
                <MarketView
                  marketPrices={marketPrices}
                />
              )}

              {activeTab === 'schemes' && (
                <SchemesView
                  schemes={schemes}
                />
              )}

              {activeTab === 'tasks' && (
                <TasksView
                  tasks={tasks}
                  farms={farms}
                  cropCycles={cropCycles}
                  selectedFarmId={selectedFarmId}
                  onAddTask={handleAddTask}
                  onToggleTask={handleToggleTask}
                  onDeleteTask={handleDeleteTask}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsView
                  currentFarm={currentFarm}
                />
              )}

              {activeTab === 'database' && (
                <SupabaseHubView />
              )}

              {activeTab === 'admin' && (
                <AdminView />
              )}

              {activeTab === 'profile' && (
                <ProfileView
                  profile={profile}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </>
          )}
        </main>
      </div>

      {/* Alexa-Style Voice Assistant Dialog */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        currentFarm={currentFarm}
        profile={profile}
        cropCycle={cropCycles.find((c) => c.farm_id === currentFarm?.id)}
        weather={weather}
        onTaskCreated={loadAppData}
      />
    </div>
  );
}
