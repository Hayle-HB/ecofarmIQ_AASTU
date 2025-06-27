import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  HiHome,
  HiBeaker,
  HiChartBar,
  HiCloud,
  HiDocumentReport,
  HiChevronLeft,
  HiChevronRight,
  HiMenu,
} from "react-icons/hi";
import { Search, Bell, User } from "lucide-react";

const menuItems = [
  {
    title: "Dashboard",
    icon: <HiHome className="w-6 h-6" />,
    path: "/dashboard",
  },
  {
    title: "Crop Recommendation",
    icon: <HiBeaker className="w-6 h-6" />,
    path: "/recommendation",
  },
  {
    title: "Plant Monitoring",
    icon: <HiChartBar className="w-6 h-6" />,
    path: "/monitoring",
  },
  {
    title: "Weather Analysis",
    icon: <HiCloud className="w-6 h-6" />,
    path: "/weather",
  },
  {
    title: "Reports",
    icon: <HiDocumentReport className="w-6 h-6" />,
    path: "/reports",
  },
];

const SideBar = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true); // desktop sidebar
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer
  const location = useLocation();

  // Responsive sidebar width
  const sidebarWidth = isOpen ? "w-60" : "w-20";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Top Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border-b border-gray-200 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto">
          <div className="h-16 flex items-center justify-between px-4">
            {/* Mobile sidebar toggle */}
            <button
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-slate-300"
              onClick={() => setMobileOpen(true)}
            >
              <HiMenu className="w-6 h-6" />
            </button>
            {/* Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="flex items-center w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-slate-700/50 transition-all duration-200">
                <Search className="w-5 h-5 text-gray-400 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="ml-3 w-full outline-none bg-transparent text-gray-700 dark:text-slate-200 placeholder-gray-400 dark:placeholder-slate-400"
                />
              </div>
            </div>
            {/* Logo (mobile) */}
            <div className="md:hidden flex-1 flex justify-center">
              <h1 className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                EcoFarmIQ
              </h1>
            </div>
            {/* Right Section */}
            <div className="flex items-center gap-4 ml-4">
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-slate-300 transition-colors">
                <Bell className="w-6 h-6" />
              </button>
              <button className="flex items-center p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 transition-colors">
                <div className="relative">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-slate-700 text-emerald-600 dark:text-emerald-400">
                    <User className="w-5 h-5" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 border-2 border-white dark:border-slate-800" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar for desktop */}
      <aside
        className={`hidden md:flex flex-col fixed top-0 left-0 h-screen border-r border-gray-200 dark:border-slate-700/50 bg-white dark:bg-slate-800 transition-all duration-300 z-500 ${sidebarWidth}`}
      >
        {/* Sidebar Toggle Button (always visible at the top) */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700/50">
          <h1
            className={`text-xl font-bold text-emerald-600 dark:text-emerald-400 transition-opacity duration-300 ${
              !isOpen && "opacity-0"
            }`}
          >
            EcoFarmIQ
          </h1>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
            style={{ marginLeft: isOpen ? 0 : "auto" }}
          >
            {isOpen ? (
              <HiChevronLeft className="w-5 h-5" />
            ) : (
              <HiChevronRight className="w-5 h-5" />
            )}
          </button>
        </div>
        {/* Navigation Menu */}
        <nav className="p-4 flex-1 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item, index) => (
              <li key={index}>
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                    location.pathname === item.path
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-emerald-400"
                  }`}
                >
                  <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                    {item.icon}
                  </span>
                  <span
                    className={`ml-3 whitespace-nowrap transition-all duration-300 ${
                      !isOpen ? "w-0 opacity-0" : "w-auto opacity-100"
                    }`}
                  >
                    {item.title}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Sidebar Drawer for mobile */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          {/* Drawer */}
          <aside className="relative w-60 h-full bg-white dark:bg-slate-800 border-r border-gray-200 dark:border-slate-700/50 flex flex-col z-50">
            {/* Sidebar Toggle Button (top of drawer) */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-slate-700/50">
              <h1 className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                EcoFarmIQ
              </h1>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700/50 text-gray-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                <HiChevronLeft className="w-5 h-5" />
              </button>
            </div>
            <nav className="p-4 flex-1 overflow-y-auto">
              <ul className="space-y-2">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      to={item.path}
                      className={`flex items-center p-3 rounded-lg transition-all duration-200 ${
                        location.pathname === item.path
                          ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                          : "text-gray-600 hover:bg-gray-50 hover:text-emerald-600 dark:text-slate-300 dark:hover:bg-slate-700/50 dark:hover:text-emerald-400"
                      }`}
                      onClick={() => setMobileOpen(false)}
                    >
                      <span className="flex-shrink-0 text-emerald-600 dark:text-emerald-400">
                        {item.icon}
                      </span>
                      <span className="ml-3 whitespace-nowrap">
                        {item.title}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`pt-16 transition-all duration-300 ease-in-out ${
          isOpen ? "md:ml-60" : "md:ml-20"
        } ml-0`}
      >
        {children}
      </main>
    </div>
  );
};

export default SideBar;
