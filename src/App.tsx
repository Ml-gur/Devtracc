import React, {
  useState,
  useEffect,
  useCallback,
  lazy,
  Suspense,
} from "react";
import {
  supabaseConnectionManager,
  ConnectionStatus,
} from "./utils/supabase/connection-manager";
import { hasSupabaseConfig } from "./utils/supabase/client";
import {
  supabaseDatabaseManager,
  DatabaseAvailability,
} from "./utils/supabase/connection-manager";
import { initializeWarningSuppression } from "./utils/suppress-react-warnings";

import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Button } from "./components/ui/button";
import {
  DashboardLoader,
} from "./components/OptimizedLoader";
import {
  Wifi,
  Database,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

// Import ErrorBoundary directly (don't lazy load error boundaries)
import ErrorBoundary from "./components/ErrorBoundary";

// Lazy load heavy components for better initial load performance
const EnhancedDashboard = lazy(
  () => import("./components/EnhancedDashboard"),
);
const Homepage = lazy(() => import("./components/Homepage"));
const LoginPage = lazy(() => import("./components/LoginPageFixed"));
const RegistrationPage = lazy(
  () => import("./components/RegistrationPage"),
);
const EmailConfirmationPage = lazy(
  () => import("./components/EmailConfirmationPage"),
);


type Page =
  | "homepage"
  | "login"
  | "register"
  | "email-confirmation"
  | "dashboard";

// Environment check utility functions
const isProductionMode = (): boolean => {
  try {
    if (typeof window !== "undefined") {
      const hostname = window.location?.hostname;
      return (
        hostname !== "localhost" &&
        hostname !== "127.0.0.1" &&
        !hostname?.includes(".local")
      );
    }
    return false;
  } catch {
    return false;
  }
};

const isDevelopmentMode = (): boolean => {
  try {
    if (typeof window !== "undefined") {
      const hostname = window.location?.hostname;
      const port = window.location?.port;

      // Check for localhost
      if (hostname === "localhost" || hostname === "127.0.0.1")
        return true;

      // Check for common dev ports
      if (port === "5173" || port === "3000" || port === "8080")
        return true;
    }

    // Also check NODE_ENV if available
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

// Main App Content Component
const AppContent = React.memo(function AppContentComponent() {
  const { user, profile, loading: authLoading } = useAuth();
  const [currentPage, setCurrentPage] =
    useState<Page>("homepage");
  const [connectionStatus, setConnectionStatus] =
    useState<ConnectionStatus>(
      supabaseConnectionManager.getStatus(),
    );
  const [error, setError] = useState<string | null>(null);
  const [isConfigurationError, setIsConfigurationError] =
    useState(false);
  const [databaseAvailability, setDatabaseAvailability] =
    useState<DatabaseAvailability>("unknown");
  const [loading, setLoading] = useState(true);
  const [showWelcomeMessage, setShowWelcomeMessage] =
    useState(false);
  const [
    pendingConfirmationEmail,
    setPendingConfirmationEmail,
  ] = useState<string | null>(null);

  // Configuration check - app requires Supabase configuration
  const hasConfig = hasSupabaseConfig();

  // Define connection handlers at component level with stable references
  const handleConnectionChange = useCallback(
    (status: ConnectionStatus) => {
      setConnectionStatus((prevStatus) => {
        // Only update if status actually changed
        const statusChanged =
          prevStatus.online !== status.online ||
          prevStatus.supabaseReachable !==
            status.supabaseReachable ||
          prevStatus.databaseAvailable !==
            status.databaseAvailable;

        if (statusChanged) {
          // Clear errors if connection is restored
          if (status.online && status.supabaseReachable) {
            setError(null);
            setIsConfigurationError(false);
          }
          return status;
        }
        return prevStatus;
      });
    },
    [],
  );

  const handleDatabaseAvailabilityChange = useCallback(
    (availability: DatabaseAvailability) => {
      setDatabaseAvailability((prevAvailability) => {
        if (prevAvailability !== availability) {
          console.log(
            "📊 Database availability changed to:",
            availability,
          );
          // Clear error if connection is now available
          if (availability === "available") {
            setError(null);
          }
          return availability;
        }
        return prevAvailability;
      });
    },
    [],
  );

  // Connection retry handler
  const handleConnectionRetry = useCallback(async () => {
    console.log("🔄 Retrying connection...");
    setError(null);
    setIsConfigurationError(false);

    try {
      await supabaseConnectionManager.retryConnection();
      // Only call reset if the method exists
      if (supabaseDatabaseManager && typeof supabaseDatabaseManager.reset === 'function') {
        supabaseDatabaseManager.reset();
      }
    } catch (error: any) {
      console.error("❌ Connection retry failed:", error);
      setError(
        "Connection failed. DevTrack Africa requires an internet connection and database access to function.",
      );
    }
  }, []);

  const handleDismissWelcome = useCallback(() => {
    setShowWelcomeMessage(false);
  }, []);

  // Navigation handlers
  const onEnterPlatform = useCallback(
    () => setCurrentPage("login"),
    [],
  );
  const { signOut } = useAuth();

  const onBackToHomepage = useCallback(
    async () => {
      try {
        await signOut();
      } catch (error) {
        console.error("Logout failed:", error);
      }
      setCurrentPage("homepage");
    },
    [signOut],
  );
  const onLoginSuccess = useCallback(() => {
    console.log("🎉 Login successful, navigating to dashboard");
    setCurrentPage("dashboard");
  }, []);
  const onNeedConfirmation = useCallback((email: string) => {
    console.log("📧 Email confirmation needed for:", email);
    setPendingConfirmationEmail(email);
    setCurrentPage("email-confirmation");
  }, []);
  const onNavigateToRegister = useCallback(
    () => setCurrentPage("register"),
    [],
  );
  const onNavigateFromRegister = useCallback((page: string) => {
    if (page === "login") setCurrentPage("login");
    else if (page === "welcome") setCurrentPage("homepage");
  }, []);
  const onEmailConfirmationNavigate = useCallback(
    (page: string) => {
      console.log(
        "📧 Email confirmation page navigation to:",
        page,
      );
      if (page === "login") setCurrentPage("login");
      else if (page === "dashboard") {
        console.log("🎉 Email confirmed, going to dashboard");
        setCurrentPage("dashboard");
      } else if (page === "welcome") setCurrentPage("homepage");
      else if (page === "register") setCurrentPage("register");
      else if (page === "profile-setup") {
        console.log(
          "👤 Email confirmed, setting up profile (dashboard)",
        );
        setCurrentPage("dashboard");
      }
    },
    [],
  );

  // Setup connection listeners (only once on mount)
  useEffect(() => {
    try {
      supabaseConnectionManager.addListener(
        handleConnectionChange,
      );
      supabaseDatabaseManager.addListener(
        handleDatabaseAvailabilityChange,
      );

      return () => {
        try {
          supabaseConnectionManager.removeListener(
            handleConnectionChange,
          );
          supabaseDatabaseManager.removeListener(
            handleDatabaseAvailabilityChange,
          );
        } catch (error) {
          console.warn("Error removing connection listeners:", error);
        }
      };
    } catch (error) {
      console.error("Error setting up connection listeners:", error);
      setError("Failed to initialize connection monitoring.");
    }
  }, [handleConnectionChange, handleDatabaseAvailabilityChange]);

  // Configuration check and initialization
  useEffect(() => {
    try {
      // Check configuration - required for online-only app
      if (!hasConfig) {
        setIsConfigurationError(true);
        setError(
          "DevTrack Africa requires Supabase configuration to function. Please configure your database connection.",
        );
        return;
      }

      // Initialize the app - wait for auth to load
      if (!authLoading) {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during app initialization:", error);
      setError("Failed to initialize application. Please refresh the page.");
    }
  }, [authLoading, hasConfig]);

  // Welcome message for first-time users
  useEffect(() => {
    if (!loading && user && currentPage === "dashboard") {
      setShowWelcomeMessage(true);
    }
  }, [loading, user, currentPage]);

  // Database availability check - simplified for direct dashboard access
  useEffect(() => {
    // Only proceed if app is loaded and we have a connection
    if (loading || !connectionStatus.databaseAvailable) {
      return;
    }

    // Require config for online-only app
    if (!hasConfig) {
      return;
    }

    // Only check if we haven't checked yet or need to retry
    if (databaseAvailability === "unknown") {
      const timeoutId = setTimeout(async () => {
        console.log("🔍 Checking database availability...");
        try {
          const isAvailable = await supabaseDatabaseManager.isAvailable();
          if (isAvailable) {
            setDatabaseAvailability("available");
          } else {
            console.log("Database tables not found, but continuing to dashboard");
            setDatabaseAvailability("available"); // Allow access regardless
          }
        } catch (error) {
          console.error(
            "Database availability check failed:",
            error,
          );
          // Still allow access to dashboard even if check fails
          setDatabaseAvailability("available");
        }
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [loading, connectionStatus.databaseAvailable, hasConfig, databaseAvailability]);

  // Authentication Navigation Logic
  useEffect(() => {
    if (loading) return;

    try {
      console.log("🔍 Authentication navigation check:", {
        user: user ? "authenticated" : "not authenticated",
        emailConfirmed: user?.email_confirmed_at ? "confirmed" : "not confirmed",
        currentPage,
        userEmail: user?.email
      });

      // If user is authenticated and confirmed, redirect to dashboard
      if (
        user &&
        user.email_confirmed_at &&
        (currentPage === "login" ||
          currentPage === "register" ||
          currentPage === "email-confirmation" ||
          currentPage === "homepage")
      ) {
        console.log(
          "✅ User authenticated and confirmed, redirecting to dashboard",
        );
        setCurrentPage("dashboard");
        return;
      }

      // If user is authenticated but not confirmed
      if (
        user &&
        !user.email_confirmed_at &&
        currentPage !== "email-confirmation"
      ) {
        // Redirect to email confirmation from login, register, or homepage
        if (
          currentPage === "register" ||
          currentPage === "login" ||
          currentPage === "homepage" ||
          currentPage === "dashboard"
        ) {
          console.log(
            "⚠️ User authenticated but email not confirmed, redirecting to confirmation",
          );
          setPendingConfirmationEmail(user.email || "");
          setCurrentPage("email-confirmation");
          return;
        }
      }

      // If user is not authenticated and trying to access dashboard
      if (!user && currentPage === "dashboard") {
        console.log(
          "❌ User not authenticated, redirecting to login",
        );
        setCurrentPage("login");
        return;
      }
    } catch (error) {
      console.error("Error in authentication navigation logic:", error);
      // Don't set error state here to avoid navigation loops
    }
  }, [user, loading, currentPage]);

  // Show loading screen while initializing
  if (loading || authLoading) {
    return <DashboardLoader />;
  }

  // Show configuration error if Supabase not configured
  if (isConfigurationError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-red-200">
          <div className="text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <div className="font-semibold text-red-900 mb-2">
              Configuration Required
            </div>
            <p className="text-sm text-red-700 mb-4">
              DevTrack Africa requires Supabase configuration to function. Please configure your database connection to continue.
            </p>
            <Button
              onClick={handleConnectionRetry}
              variant="outline"
              className="w-full"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

// Show homepage
if (currentPage === "homepage") {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <Homepage onEnterPlatform={onEnterPlatform} />
    </Suspense>
  );
}

// Show login page
if (currentPage === "login") {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <LoginPage
        onBack={onBackToHomepage}
        onSuccess={onLoginSuccess}
        onNeedConfirmation={onNeedConfirmation}
        onNavigateToRegister={onNavigateToRegister}
      />
    </Suspense>
  );
}

// Show registration page
if (currentPage === "register") {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <RegistrationPage
        onNavigate={onNavigateFromRegister}
        onRegister={async (userData) => {
          // This prop is no longer used since RegistrationPage
          // uses the signUp method from AuthContext directly
          return { success: true };
        }}
      />
    </Suspense>
  );
}

// Show email confirmation page
if (currentPage === "email-confirmation") {
  return (
    <Suspense fallback={<DashboardLoader />}>
      <EmailConfirmationPage
        email={pendingConfirmationEmail || ""}
        onNavigate={onEmailConfirmationNavigate}
        onResendConfirmation={async (email) => {
          return {
            success: true,
            message: "Confirmation email sent",
          };
        }}
      />
    </Suspense>
  );
}

  // Show connection error if no internet or database connection
  if (!connectionStatus.online || !connectionStatus.supabaseReachable) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg border border-yellow-200">
          <div className="text-center">
            {!connectionStatus.online ? (
              <Wifi className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            ) : (
              <Database className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
            )}
            <div className="font-semibold text-yellow-900 mb-2">
              Connection Required
            </div>
            <p className="text-sm text-yellow-700 mb-4">
              {!connectionStatus.online
                ? "DevTrack Africa requires an internet connection to function. Please check your connection and try again."
                : "Cannot connect to database server. Please check your internet connection."}
            </p>
            <Button
              onClick={handleConnectionRetry}
              className="w-full"
            >
              Retry Connection
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Main Dashboard Content */}
      {currentPage === "dashboard" && user && (
        <ErrorBoundary>
          <Suspense fallback={<DashboardLoader />}>
            <EnhancedDashboard
              user={user}
              profile={profile}
              onLogout={onBackToHomepage}
              onNavigateToSetup={() => {
                console.log("Setup navigation removed - directing to dashboard");
              }}
              databaseConnected={
                connectionStatus.supabaseReachable
              }
            />
          </Suspense>
        </ErrorBoundary>
      )}
    </div>
  );
});

// Initialize warning suppression immediately when module loads
initializeWarningSuppression();

// Main App Component
function App() {

  return (
    <ErrorBoundary>
      <AuthProvider>
        <Suspense fallback={<DashboardLoader />}>
          <AppContent />
        </Suspense>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;