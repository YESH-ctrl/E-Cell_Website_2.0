import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { TrendingUp, Lightbulb, Globe, ChevronDown, Calendar, MapPin, Mic2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../animations/variants';
import { supabase } from '../lib/supabase';

const initiatives = [
  {
    icon: Globe,
    title: 'E-Summit',
    category: 'Flagship Event',
    color: 'from-sky-500/20 to-sky-900/20',
    accent: '#0ea5e9',
    badge: 'Flagship',
    tagline: 'The flagship event of E-Cell',
    description: 'The flagship event of E-Cell which is conducted every year with a lot of sub events and some panel discussions with some exciting people.',
    details: ['Annual Event', 'Multiple Sub-events', 'Panel Discussions', 'Exciting Speakers'],
    date: 'Annual',
    location: 'BVRIT Narsapur campus',
    image: '/initiatives/e_summit.jpg',
  },
  {
    icon: Mic2,
    title: 'Emerge',
    category: 'Pre-Summit Event',
    color: 'from-orange-500/30 to-red-950/40',
    accent: '#f0703a',
    badge: 'Coming Soon',
    tagline: 'Pitch. Persuade. Prevail.',
    description: 'This is the event which is conducted before E-Summit with around 2 sub-events, setting the stage for the main summit.',
    details: ['Pre-Summit Event', 'Sub-events TBA', 'Student Focused', 'Innovation Drive'],
    date: 'Pre-Summit',
    location: 'BVRIT Narsapur campus',
    image: '/initiatives/emerge.jpg',
  },
  {
    icon: Lightbulb,
    title: 'BEST',
    category: 'Ecosystem',
    color: 'from-violet-500/20 to-indigo-900/20',
    accent: '#8b5cf6',
    badge: 'Coming Soon',
    tagline: 'BVRITS Ecosystem for startups and Talent',
    description: 'BEST is a comprehensive ecosystem designed to nurture startups and talent within BVRIT, providing the resources and network needed for success.',
    details: ['Startup Support', 'Talent Discovery', 'Resource Hub', 'Networking'],
    date: 'Upcoming',
    location: 'BVRIT Narsapur campus',
    image: '/initiatives/best.jpg',
  },
];

export default function Initiatives({ hideHeader = false, limit }: { hideHeader?: boolean; limit?: number }) {
  const [expanded, setExpanded] = useState<number | null>(null);
  const [hasRegistered, setHasRegistered] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });
  const navigate = useNavigate();

  const displayInitiatives = limit ? initiatives.slice(0, limit) : initiatives;

  // --- REGISTRATION STATUS CHECK ---
  useEffect(() => {
    const checkRegistration = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          setIsChecking(false);
          return;
        }

        const { data, error } = await supabase
          .from('emerge_registrations')
          .select('user_id')
          .eq('user_id', user.id)
          .limit(1);
        
        if (error) {
          console.error("Database Error:", error.message);
        }

        if (data && data.length > 0) {
          /* [ DELETE THESE BRACKETS LATER TO LOCK THE BUTTON GREEN AGAIN ] 
          setHasRegistered(true);
          */
        }
      } catch (error) {
        console.error("Unexpected error:", error);
      } finally {
        setIsChecking(false);
      }
    };

    checkRegistration();
  }, []);

  return (
    <section id="initiatives" ref={ref} className={`${hideHeader ? 'pb-20' : 'section-padding'} relative overflow-hidden`}>
      {!hideHeader && (
        <>
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#030712] to-[#060f1e]/40" />
        </>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        {!hideHeader && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="text-center mb-16 pt-10"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold mb-6"
              animate={{
                borderColor: ['rgba(14,165,233,0.4)', 'rgba(255,110,45,0.7)', 'rgba(14,165,233,0.4)'],
                color: ['#38bdf8', '#ff6e2d', '#38bdf8'],
                backgroundColor: ['rgba(14,165,233,0.10)', 'rgba(255,110,45,0.15)', 'rgba(14,165,233,0.10)'],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            >
              <TrendingUp size={14} /> What We Do
            </motion.div>
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-black font-poppins mb-6 relative inline-block">
              <span className="text-white">Our </span>
              <motion.span
                className="bg-clip-text text-transparent inline-block"
                style={{
                  backgroundImage: 'linear-gradient(90deg, #38bdf8, #38bdf8, #ff6e2d, #ff9152, #38bdf8, #38bdf8)',
                  backgroundSize: '300% 100%',
                }}
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  filter: [
                    'drop-shadow(0 0 0px rgba(255,110,45,0))',
                    'drop-shadow(0 0 18px rgba(255,110,45,0.65))',
                    'drop-shadow(0 0 0px rgba(255,110,45,0))',
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                Initiatives
              </motion.span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto">
              Empowering innovation and entrepreneurship through hands-on experience and community.
            </motion.p>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayInitiatives.map((item, i) => {
            const isEmerge = item.title === 'Emerge';

            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                animate={(inView || hideHeader) ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: i * 0.1, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className={`relative rounded-2xl overflow-hidden transition-all duration-500 group cursor-pointer ${
                  isEmerge
                    ? 'bg-gradient-to-b from-[#1a0a05] via-[#2b0d05] to-[#0a0402] border border-orange-500/30'
                    : 'glass border border-white/5 hover:border-sky-500/30'
                }`}
                style={isEmerge ? { boxShadow: '0 0 0 1px rgba(240,112,58,0.15)' } : undefined}
                whileHover={isEmerge ? { scale: 1.02 } : undefined}
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                {isEmerge && (
                  <>
                    <motion.div
                      className="pointer-events-none absolute -inset-6 rounded-3xl blur-2xl z-0"
                      style={{
                        background: 'radial-gradient(circle at 50% 40%, rgba(240,112,58,0.45), rgba(120,20,10,0.25) 45%, transparent 70%)',
                      }}
                      animate={{ opacity: [0.5, 0.9, 0.5], scale: [1, 1.08, 1] }}
                      transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
                    />
                    <motion.div
                      className="pointer-events-none absolute inset-0 rounded-2xl z-0"
                      animate={{
                        boxShadow: [
                          '0 0 20px 0px rgba(240,112,58,0.15)',
                          '0 0 40px 4px rgba(240,112,58,0.35)',
                          '0 0 20px 0px rgba(240,112,58,0.15)',
                        ],
                      }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  </>
                )}

                <div className="relative z-10 h-48 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 ${
                      isEmerge ? 'opacity-40 mix-blend-luminosity' : ''
                    }`}
                    loading="lazy"
                  />
                  <div
                    className={`absolute inset-0 bg-gradient-to-t ${
                      isEmerge
                        ? 'from-[#1a0a05] via-[#1a0a05]/70 to-transparent'
                        : 'from-[#030712] via-[#030712]/60 to-transparent'
                    }`}
                  />

                  {isEmerge && (
                    <motion.div
                      className="absolute inset-0"
                      style={{
                        background: 'radial-gradient(circle at 70% 30%, rgba(45,212,191,0.25), transparent 40%), radial-gradient(circle at 30% 70%, rgba(240,112,58,0.3), transparent 45%)',
                      }}
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  )}

                  <div className="absolute top-4 left-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                        isEmerge
                          ? 'text-orange-100 bg-orange-600/30 border-orange-400/50'
                          : 'text-white bg-sky-500/30 border-sky-500/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  </div>
                  <div className="absolute top-4 right-4">
                    <motion.div
                      className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center border ${
                        isEmerge ? 'border-orange-400/40' : 'border-white/10'
                      }`}
                      animate={isEmerge ? { scale: [1, 1.12, 1] } : undefined}
                      transition={isEmerge ? { duration: 2, repeat: Infinity, ease: 'easeInOut' } : undefined}
                    >
                      <item.icon size={18} style={{ color: item.accent }} />
                    </motion.div>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div
                      className={`text-xs font-medium uppercase tracking-wider ${
                        isEmerge ? 'text-orange-200/70' : 'text-white/50'
                      }`}
                    >
                      {item.category}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h3
                      className={`text-xl font-bold font-poppins transition-colors duration-300 ${
                        isEmerge
                          ? 'bg-gradient-to-r from-orange-400 via-orange-300 to-red-400 bg-clip-text text-transparent'
                          : 'text-white group-hover:text-sky-400'
                      }`}
                    >
                      {item.title}
                    </h3>
                    <motion.div
                      animate={{ rotate: expanded === i ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown size={18} className={isEmerge ? 'text-orange-300/50' : 'text-white/30'} />
                    </motion.div>
                  </div>
                  <p className="text-sm italic mb-3" style={{ color: item.accent }}>{item.tagline}</p>
                  
                  {expanded !== i && (
                    <p className={`text-sm leading-relaxed line-clamp-2 ${isEmerge ? 'text-orange-50/60' : 'text-white/50'}`}>
                      {item.description}
                    </p>
                  )}

                  <AnimatePresence>
                    {expanded === i && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <div className={`pt-4 mt-4 border-t ${isEmerge ? 'border-orange-500/20' : 'border-white/5'}`}>
                          <p className={`text-sm mb-4 ${isEmerge ? 'text-orange-50/70' : 'text-white/60'}`}>
                            {item.description}
                          </p>
                          <div className="grid grid-cols-2 gap-2 mb-4">
                            {item.details.map((d) => (
                              <div
                                key={d}
                                className={`flex items-center gap-2 text-xs ${isEmerge ? 'text-orange-50/60' : 'text-white/50'}`}
                              >
                                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.accent }} />
                                {d}
                              </div>
                            ))}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className={`flex items-center gap-2 text-xs ${isEmerge ? 'text-orange-50/50' : 'text-white/40'}`}>
                              <Calendar size={12} style={{ color: item.accent }} />
                              {item.date}
                            </div>
                            <div className={`flex items-center gap-2 text-xs ${isEmerge ? 'text-orange-50/50' : 'text-white/40'}`}>
                              <MapPin size={12} style={{ color: item.accent }} />
                              {item.location}
                            </div>
                          </div>

                          {/* DYNAMIC REDIRECT BUTTON FOR EMERGE */}
                          {isEmerge && (
                            <div className="mt-6">
                              {isChecking ? (
                                <button 
                                  disabled 
                                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-white/5 text-white/50 border border-white/10 cursor-wait flex items-center justify-center text-sm"
                                >
                                  Checking Status...
                                </button>
                              ) : hasRegistered ? (
                                <button
                                  disabled
                                  className="w-full py-2.5 px-4 rounded-xl font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 cursor-not-allowed shadow-[0_0_15px_rgba(16,185,129,0.15)] flex items-center justify-center gap-2 text-sm"
                                >
                                  <CheckCircle2 size={16} /> You have successfully registered
                                </button>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    navigate('/emerge-registration'); 
                                  }}
                                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 to-purple-600 font-bold text-white text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(240,112,58,0.3)]"
                                >
                                  Register Now <ArrowRight size={16} />
                                </button>
                              )}
                            </div>
                          )}

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}