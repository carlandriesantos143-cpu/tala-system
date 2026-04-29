import { useState, useEffect, useRef } from "react";
import { LogOut, User, Bell, CheckCircle2, Inbox } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../utils/supabase/client";

interface HeaderProps {
  title: string;
  onNavigate: (page: string) => void;
}

export function Header({ title, onNavigate }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  // States para sa Profile
  const [adminName, setAdminName] = useState("BHW Admin");
  const [role, setRole] = useState("BHW Admin");

  // States para sa Notifications
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "System Ready",
      message: "TALA offline capabilities are fully synced and operational.",
      time: "Just now"
    }
  ]);
  const hasUnread = notifications.length > 0;
  const notifRef = useRef<HTMLDivElement>(null);

  // ─── FETCH PROFILE DATA ─────────────────────────────────────
  const fetchAdminProfile = async () => {
    if (!user?.id) return;
    try {
      const { data, error } = await supabase
        .from("bhw_users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      if (!error && data?.full_name) {
        setAdminName(data.full_name);
      }
    } catch (err) {
      console.error("Error fetching admin name:", err);
    }
  };

  useEffect(() => {
    fetchAdminProfile(); // Hugutin ang data sa unang load

    // Makikinig ang Header kapag nag-save ang Admin sa SettingsPage
    const handleProfileUpdate = () => {
      fetchAdminProfile();
    };
    window.addEventListener("profileUpdated", handleProfileUpdate);

    // Isara ang notification dropdown kapag nag-click sa labas
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup listeners
    return () => {
      window.removeEventListener("profileUpdated", handleProfileUpdate);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
  };

  const handleMarkAsRead = () => {
    setNotifications([]); // Buburahin ang laman ng notifications
  };

  const goToSettings = () => {
    onNavigate("settings"); // Dadalhin ang user sa settings page
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0 relative z-40">
      <h2 className="text-gray-800 font-bold" style={{ fontSize: "1.1rem" }}>
        {title}
      </h2>
      
      <div className="flex items-center gap-2">
        
        {/* ─── NOTIFICATIONS DROPDOWN ────────────────────────── */}
        <div className="relative mr-2" ref={notifRef}>
          <button 
            onClick={handleNotificationClick}
            className={`relative p-2 rounded-xl transition-all cursor-pointer ${
              showNotifications ? "bg-emerald-50 text-emerald-600" : "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            }`}
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasUnread && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-4 py-3 border-b border-gray-50 bg-gray-50 flex justify-between items-center">
                <span className="text-gray-800 font-semibold" style={{ fontSize: "0.85rem" }}>Notifications</span>
                {hasUnread && (
                  <button 
                    onClick={handleMarkAsRead}
                    className="text-emerald-600 hover:text-emerald-700 text-xs font-medium cursor-pointer transition-colors"
                  >
                    Mark all as read
                  </button>
                )}
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {hasUnread ? (
                  <div className="p-2 space-y-1">
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 bg-emerald-50/50 hover:bg-emerald-50 rounded-xl flex gap-3 transition-colors cursor-default">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-gray-800 font-medium" style={{ fontSize: "0.8rem" }}>{notif.title}</p>
                          <p className="text-gray-500 leading-snug mt-0.5" style={{ fontSize: "0.72rem" }}>
                            {notif.message}
                          </p>
                          <p className="text-emerald-600 font-medium mt-1.5" style={{ fontSize: "0.65rem" }}>{notif.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 flex flex-col items-center justify-center text-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                      <Inbox className="w-5 h-5 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium" style={{ fontSize: "0.85rem" }}>All caught up!</p>
                    <p className="text-gray-400 mt-0.5" style={{ fontSize: "0.75rem" }}>No new notifications</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="h-8 w-px bg-gray-200 mx-2" />
        
        {/* ─── ADMIN PROFILE INFO (CLICKABLE) ───────────────────────────── */}
        <button 
          onClick={goToSettings}
          title="Go to Settings"
          className="flex items-center gap-3 p-1.5 pr-3 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="leading-tight hidden sm:block">
            <span className="text-gray-800 font-bold block truncate max-w-[120px]" style={{ fontSize: "0.85rem" }}>
              {adminName}
            </span>
            <span className="text-emerald-600 font-medium block" style={{ fontSize: "0.68rem" }}>
              {role}
            </span>
          </div>
        </button>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="ml-2 flex items-center gap-2 px-3.5 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer font-medium"
          style={{ fontSize: "0.82rem" }}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}