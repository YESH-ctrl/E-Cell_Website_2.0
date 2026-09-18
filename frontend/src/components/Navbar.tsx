import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, LogOut, LayoutDashboard, ChevronDown, Lock, UserCircle } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// All sections — "locked" ones require auth
const NAV_LINKS = [
  { label: 'Home',        href: '/',            isPath: true  },
  { label: 'About',       href: '/about',       isPath: true  },
  { label: 'Initiatives', href: '/initiatives', isPath: true  },
  { label: 'Team',        href: '/team',        isPath: true  },
  { label: 'Gallery',     href: '/gallery',     isPath: true  },
];

export default function Navbar() {
  const { currentUser, userRole, logOut } = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const isHomePage = location.pathname === '/';

  const [scrolled,      setScrolled]      = useState(false);
  const [mobileOpen,    setMobileOpen]    = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [avatarOpen,    setAvatarOpen]    = useState(false);
  const [avatarImageFailed, setAvatarImageFailed] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  // ── Scroll tracking ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isHomePage) return;
    const onScroll = () => {
      setScrolled(window.scrollY > 50);
      const sections = ['home', 'about', 'initiatives', 'testimonials'];
      for (const id of [...sections].reverse()) {
        const el = document.getElementById(id);
        if (el && window.scrollY >= el.offsetTop - 100) {
          setActiveSection(id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHomePage]);

  // ── Close avatar dropdown on outside click ──────────────────────────────────
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  // Retry the image when the signed-in account or its photo changes.
  useEffect(() => {
    setAvatarImageFailed(false);
  }, [currentUser?.photoURL]);

  // ── Nav helpers ──────────────────────────────────────────────────────────────
  const scrollToSection = (href: string) => {
    if (!isHomePage) {
      navigate('/');
      setTimeout(() => {
        document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } else {
      document.getElementById(href.replace('#', ''))?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavClick = (link: typeof NAV_LINKS[0]) => {
    setMobileOpen(false);
    
    if (link.isPath) {
      navigate(link.href);
      window.scrollTo(0, 0);
    } else {
      scrollToSection(link.href);
    }
  };

  const handleSignOut = async () => {
    setAvatarOpen(false);
    await logOut();
    navigate('/');
  };

  // Dashboard link based on role
  const dashboardHref = userRole === 'ecell_member' ? '/ecell-dashboard' : '/student-dashboard';

  // Avatar initials
  const avatarLetter =
    currentUser?.displayName?.[0]?.toUpperCase() ??
    currentUser?.email?.[0]?.toUpperCase() ??
    '?';

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHomePage
            ? 'py-3 bg-[#030712]/90 backdrop-blur-xl border-b border-white/5'
            : 'py-5 bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => navigate('/')} className="flex items-center group">
            <img
              src="/E-Cell_Logo.png"
              alt="E-Cell Logo"
              className="h-14 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80"
              onError={(e) => {
                const t = e.currentTarget;
                t.style.display = 'none';
                const fb = t.nextElementSibling as HTMLElement | null;
                if (fb) fb.style.display = 'flex';
              }}
            />
            <span
              style={{ display: 'none' }}
              className="h-10 w-32 rounded-xl border-2 border-dashed border-sky-500/60 flex items-center justify-center text-sky-400/70 text-xs font-medium tracking-wide"
            >
              Your Logo Here
            </span>
          </button>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">

            {/* Nav links — locked ones show a lock icon if not signed in */}
            {NAV_LINKS.map((link) => {
              const isActive  = link.isPath 
                ? location.pathname === link.href 
                : isHomePage && activeSection === link.href.replace('#', '');

              return (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className={`relative flex items-center gap-1 text-sm font-medium transition-colors duration-300 group ${
                    isActive
                      ? 'text-sky-400'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-[1px] bg-sky-400 transition-all duration-300 ${
                      isActive ? 'w-full' : 'w-0 group-hover:w-full'
                    }`}
                  />
                </button>
              );
            })}

            {/* Sign In CTA — shows when logged out */}
            {!currentUser && (
              <Link
                to="/login"
                className="btn-primary text-sm px-5 py-2.5"
              >
                Sign In
              </Link>
            )}

            {/* Auth — avatar dropdown when signed in */}
            {currentUser ? (
              <div ref={avatarRef} className="relative">
                <button
                  onClick={() => setAvatarOpen(!avatarOpen)}
                  className="flex items-center gap-2 group"
                >
                  {currentUser.photoURL && !avatarImageFailed ? (
                    <img
                      src={currentUser.photoURL}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover border-2 border-sky-500/40 group-hover:border-sky-400 transition-colors"
                      onError={() => setAvatarImageFailed(true)}
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold border-2 border-sky-500/40 group-hover:border-sky-400 transition-colors">
                      {avatarLetter}
                    </div>
                  )}
                  <ChevronDown
                    size={14}
                    className={`text-white/50 transition-transform duration-300 ${avatarOpen ? 'rotate-180' : ''}`}
                  />
                </button>

                <AnimatePresence>
                  {avatarOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 top-12 w-56 backdrop-blur-xl bg-[#030712]/95 border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]"
                    >
                      {/* User info */}
                      <div className="px-4 py-3 border-b border-white/[0.06]">
                        <div className="flex items-center gap-2 mb-1">
                          <UserCircle size={14} className="text-white/30 shrink-0" />
                          <p className="text-white text-sm font-semibold truncate">
                            {currentUser.displayName ?? 'E-Cell Member'}
                          </p>
                        </div>
                        <p className="text-white/40 text-xs truncate pl-5">
                          {currentUser.email}
                        </p>
                        {userRole && (
                          <span className={`inline-flex items-center mt-2 ml-5 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                            userRole === 'ecell_member'
                              ? 'bg-violet-500/15 border-violet-500/25 text-violet-400'
                              : 'bg-sky-500/15 border-sky-500/25 text-sky-400'
                          }`}>
                            {userRole === 'ecell_member' ? '⚡ E-Cell Member' : '🎓 Student'}
                          </span>
                        )}
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          to={dashboardHref}
                          onClick={() => setAvatarOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-sky-400 hover:bg-sky-500/5 transition-colors"
                        >
                          <LayoutDashboard size={15} />
                          Dashboard
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-white/70 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                        >
                          <LogOut size={15} />
                          Sign Out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : null /* Sign In is already shown as the CTA above */}
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden text-white"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 bottom-0 z-40 bg-[#030712]/95 backdrop-blur-xl flex flex-col items-center justify-center gap-7"
          >
            {NAV_LINKS.map((link, i) => {
              const isActive = link.isPath 
                ? location.pathname === link.href 
                : isHomePage && activeSection === link.href.replace('#', '');

              return (
                <motion.button
                  key={link.label}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => handleNavClick(link)}
                  className={`flex items-center gap-2 text-2xl font-semibold transition-colors ${
                    isActive
                      ? 'text-sky-400'
                      : 'text-white/80 hover:text-sky-400'
                  }`}
                >
                  {link.label}
                </motion.button>
              );
            })}

            {/* Mobile Sign In */}
            {!currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary mt-2 inline-block text-center"
                >
                  Sign In
                </Link>
              </motion.div>
            )}

            {/* Mobile auth actions */}
            {currentUser && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-col items-center gap-3"
              >
                <Link
                  to={dashboardHref}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                >
                  <LayoutDashboard size={16} /> Dashboard
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex items-center gap-2 text-white/40 hover:text-red-400 transition-colors text-sm"
                >
                  <LogOut size={16} /> Sign Out
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
