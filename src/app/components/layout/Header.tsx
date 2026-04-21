import { LogOut, User, Bell } from "lucide-react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
      <h2 className="text-gray-800">{title}</h2>
      <div className="flex items-center gap-4">
        <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer" aria-label="Notifications">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="h-8 w-px bg-gray-200" />
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="leading-tight">
            <span className="text-gray-700 block" style={{ fontSize: "0.85rem" }}>
              {user?.name || "BHW Admin"}
            </span>
            <span className="text-gray-400 block" style={{ fontSize: "0.68rem" }}>
              {user?.role || "Admin"}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span style={{ fontSize: "0.8rem" }}>Logout</span>
        </button>
      </div>
    </header>
  );
}
