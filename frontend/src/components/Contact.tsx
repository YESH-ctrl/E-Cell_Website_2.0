import { useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Linkedin, Instagram, MessageSquare } from 'lucide-react';
import { staggerContainer, fadeInUp } from '../animations/variants';

const backendUrl = import.meta.env.VITE_BACKEND_URL?.replace(/\/$/, '');

const socials = [
  { icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/e-cell-bvrit-691906202/', color: '#0A66C2' },
  { icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/ecell_bvrit/', color: '#E1306C' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: 'Inquiry from Website', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (!backendUrl) {
        throw new Error('VITE_BACKEND_URL is not configured.');
      }

      const response = await fetch(
        `${backendUrl}/api/inquiries`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to send message');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="section-padding relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-sky-500/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#030712] to-[#060f1e]/40" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          ref={ref}
          variants={staggerContainer}
          initial="hidden"
          animate={inView ? 'visible' : 'hidden'}
          className="text-center mb-16"
        >
          <motion.div variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <MessageSquare size={14} /> Get in Touch
          </motion.div>
          <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl lg:text-6xl font-black font-poppins mb-6">
            <span className="text-white">Let's </span>
            <span className="gradient-text">Connect</span>
          </motion.h2>
          <motion.p variants={fadeInUp} className="text-lg text-white/50 max-w-2xl mx-auto">
            Have a question, collaboration idea, or just want to say hi? We'd love to hear from you.
          </motion.p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            {[
              { icon: Mail, label: 'Email Us', value: 'ecell@bvrit.ac.in', sub: 'We respond within 24 hours' },
              { icon: Phone, label: 'Call Us', value: '+91 79959 37536', sub: 'Mon – Fri, 10AM – 6PM' },
              { icon: MapPin, label: 'Find Us', value: 'B.V.Raju Institute of Technology', sub: 'Vishnupur, Narsapur, Medak District – 502313, Telangana' },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-5 group">
                <div className="w-12 h-12 rounded-xl glass border border-white/5 group-hover:border-sky-500/30 flex items-center justify-center flex-shrink-0 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(14,165,233,0.2)]">
                  <item.icon size={20} className="text-sky-400" />
                </div>
                <div>
                  <div className="text-xs text-white/30 uppercase tracking-wider mb-1">{item.label}</div>
                  <div className="text-white font-semibold">{item.value}</div>
                  <div className="text-white/40 text-sm mt-0.5">{item.sub}</div>
                </div>
              </div>
            ))}

            <div className="pt-4">
              <div className="text-xs text-white/30 uppercase tracking-wider mb-4">Follow Us</div>
              <div className="flex gap-3">
                {socials.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    className="w-11 h-11 glass rounded-xl border border-white/5 hover:border-sky-500/30 flex items-center justify-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(14,165,233,0.2)] group"
                  >
                    <s.icon size={18} className="text-white/50 group-hover:text-sky-400 transition-colors duration-300" />
                  </a>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          >
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="glass rounded-2xl p-6 md:p-10 text-center border border-sky-500/20"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500/20 to-sky-700/20 flex items-center justify-center mx-auto mb-6 animate-pulse-glow">
                  <Send size={32} className="text-sky-400" />
                </div>
                <h3 className="text-2xl font-bold text-white font-poppins mb-3">Message Sent!</h3>
                <p className="text-white/50">Thanks for reaching out. We'll get back to you within 24 hours.</p>
                <button
  onClick={() => {
    setSubmitted(false);
    setForm({
      name: '',
      email: '',
      subject: 'Inquiry from Website',
      message: '',
    });
  }}
  className="btn-secondary mt-6 text-sm px-6 py-2.5"
>
                  Send Another
                </button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 md:p-8 border border-white/5 space-y-5">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-white/40 mb-2 tracking-wide">Your Name</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 focus:bg-white/8 transition-all duration-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/40 mb-2 tracking-wide">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 transition-all duration-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/40 mb-2 tracking-wide">Message</label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    rows={5}
                    placeholder="What's on your mind?"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-sky-500/50 transition-all duration-300 text-sm resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
                      />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message <Send size={16} />
                    </>
                  )}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
