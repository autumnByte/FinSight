import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/stores/useStore';
import {
  LayoutDashboard, ArrowLeftRight, Lightbulb, ChevronLeft, ChevronRight,
  Moon, Sun, Shield, Eye,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { label: 'Transactions', icon: ArrowLeftRight, path: '/transactions' },
  { label: 'Insights', icon: Lightbulb, path: '/insights' },
];

export function AppSidebar() {
  const { ui, role, toggleSidebar, toggleTheme, setRole } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const collapsed = !ui.sidebarOpen;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', ui.theme === 'dark');
  }, [ui.theme]);

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {ui.sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}    
      </AnimatePresence>

      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 72 : 260 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        className={`
          h-screen flex flex-col
          bg-sidebar border-r border-sidebar-border
          ${collapsed ? 'items-center' : ''}
          transform transition-transform duration-300
          ${ui.sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
          z-50
        `}
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-sidebar-border px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm text-white bg-gradient-to-br from-blue-500 to-purple-600">
  FS
</div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                className="font-bold text-lg text-foreground whitespace-nowrap overflow-hidden"
              >
                FinSight
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map((navItem) => {
            const active = location.pathname === navItem.path;
            return (
              <motion.button
                key={navItem.path}
                onClick={() => navigate(navItem.path)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-200 group relative
                  ${active
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                  }
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                {active && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-primary"
                    transition={{ duration: 0.3 }}
                  />
                )}
                <navItem.icon size={20} className={active ? 'text-primary' : ''} />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="whitespace-nowrap"
                    >
                      {navItem.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </nav>

        {/* Bottom controls */}
        <div className={`p-3 border-t border-sidebar-border ${collapsed ? 'w-full flex flex-col items-center' : ''}`}>
          <div className={`flex ${collapsed ? 'flex-col items-center gap-1' : 'items-center gap-2'} mb-2`}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(role === 'admin' ? 'viewer' : 'admin')}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                ${role === 'admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                ${collapsed ? 'justify-center w-full' : 'flex-1'}
              `}
            >
              {role === 'admin' ? <Shield size={15} /> : <Eye size={15} />}
              {!collapsed && <span>{role === 'admin' ? 'Admin' : 'Viewer'}</span>}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium
                text-muted-foreground hover:bg-muted
                ${collapsed ? 'justify-center w-full' : ''}
              `}
            >
              {ui.theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
              {!collapsed && <span>{ui.theme === 'dark' ? 'Light' : 'Dark'}</span>}
            </motion.button>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className={`hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] w-full
              text-muted-foreground/60 hover:text-muted-foreground hover:bg-muted/50
              ${collapsed ? 'justify-center' : ''}
            `}
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            {!collapsed && <span>Collapse</span>}
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}