import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Initiatives from '../components/Initiatives';
import GlobalBackground from '../components/GlobalBackground';

export default function InitiativesPage() {
  const navigate = useNavigate();

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    setTimeout(() => {
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="relative min-h-screen">
      <GlobalBackground />
      <Navbar />
      
      <main className="pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Changed hideHeader to false so the component's animated header shows */}
          <Initiatives hideHeader={false} />

          {/* Call to Action */}
          <div className="max-w-4xl mx-auto px-6 mt-20">
            <div className="glass rounded-3xl p-10 md:p-16 text-center border border-white/5 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-sky-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <h2 className="text-3xl md:text-4xl font-black text-white font-poppins mb-6 relative z-10">
                Have an idea for a new initiative?
              </h2>
              <p className="text-white/50 text-lg mb-8 relative z-10">
                We're always looking for new ways to support our community. 
                Share your thoughts with us and let's build something together.
              </p>
              <button 
                onClick={handleContactClick}
                className="btn-primary inline-flex items-center gap-2 relative z-10"
              >
                Get in Touch
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}