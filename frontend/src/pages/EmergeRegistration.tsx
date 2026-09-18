import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, BookOpen, GraduationCap, Users, QrCode, Upload, ShieldAlert, CheckCircle2, Hash } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import GlobalBackground from '../components/GlobalBackground';
import { supabase } from '../lib/supabase';

interface EmergeFormData {
  teamName: string;
  leaderName: string;
  leaderEmail: string;
  leaderPhone: string;
  leaderYear: string;
  leaderBranch: string;
  member2Name: string;
  member3Name: string;
  member4Name: string;
  transactionId: string;
}

const emptyFormData: EmergeFormData = {
  teamName: '', leaderName: '', leaderEmail: '', leaderPhone: '',
  leaderYear: '', leaderBranch: '', member2Name: '', member3Name: '',
  member4Name: '', transactionId: '',
};

export default function EmergeRegistration() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  
  const [formData, setFormData] = useState<EmergeFormData>(() => {
    try {
      const savedData = localStorage.getItem('emergeAutoSave');
      if (savedData) {
        return JSON.parse(savedData) as EmergeFormData;
      }
    } catch (e) {
      console.error("Failed to load auto-save data", e);
    }
    return emptyFormData;
  });

  useEffect(() => {
    try {
      localStorage.setItem('emergeAutoSave', JSON.stringify(formData));
    } catch (e) {
      console.error("Failed to save state", e);
    }
  }, [formData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let { name, value } = e.target;

    if (['leaderName', 'member2Name', 'member3Name', 'member4Name'].includes(name)) {
      value = value.replace(/[^a-zA-Z\s]/g, '');
    }

    if (name === 'leaderPhone') {
      value = value.replace(/\D/g, '').slice(0, 10);
    }

    if (name === 'transactionId') {
      value = value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase().slice(0, 12);
    }

    if (name === 'teamName') {
      value = value.replace(/[^a-zA-Z0-9\s\-]/g, '');
    }

    setFormData((prev: EmergeFormData) => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg(''); 
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      if (!file.type.startsWith('image/')) {
        setErrorMsg('Invalid file type. Please upload an image (JPG, PNG).');
        setScreenshot(null);
        return;
      }
      if (file.size > 1024 * 1024) {
        setErrorMsg('File is too large. Please upload an image smaller than 1MB.');
        setScreenshot(null);
        return;
      }

      setScreenshot(file);
      if (errorMsg) setErrorMsg('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Supabase Session Missing: Please log out and log back in to refresh your token.');
      }

      const tName = formData.teamName.trim();
      const lName = formData.leaderName.trim();
      const lEmail = formData.leaderEmail.trim().toLowerCase();
      const lPhone = formData.leaderPhone.trim();
      const lBranch = formData.leaderBranch.trim();
      const utr = formData.transactionId.trim();
      const m2 = formData.member2Name.trim();
      const m3 = formData.member3Name.trim();
      const m4 = formData.member4Name.trim();

      if (tName.length < 3) throw new Error('Team Name must be at least 3 characters long.');
      
      const nameRegex = /^[a-zA-Z\s]{3,}$/;
      if (!nameRegex.test(lName)) throw new Error('Leader Name must contain only letters and be at least 3 characters.');
      if (!nameRegex.test(m2)) throw new Error('Member 2 Name must contain only letters and be at least 3 characters.');
      if (!nameRegex.test(m3)) throw new Error('Member 3 Name must contain only letters and be at least 3 characters.');
      if (m4 && !nameRegex.test(m4)) throw new Error('Member 4 Name must contain only letters and be at least 3 characters.');

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(lEmail)) throw new Error('Please enter a strictly valid email address.');
      
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(lPhone)) throw new Error('Phone number must be exactly 10 digits.');
      
      const branchRegex = /^[a-zA-Z\s\-]{2,40}$/;
      if (!branchRegex.test(lBranch)) throw new Error('Invalid branch name. Use only letters and hyphens (e.g., CSE, AI-DS).');
      
      const utrRegex = /^[A-Z0-9]{12}$/;
      if (!utrRegex.test(utr)) throw new Error('Transaction ID / UTR must be exactly 12 alphanumeric characters.');
      
      if (!screenshot) throw new Error('Please upload the payment screenshot.');
      if (screenshot.size > 1024 * 1024) throw new Error('Screenshot size exceeds 1MB. Please compress your image and try again.');

      const allNames = [lName, m2, m3, m4].filter(Boolean).map(n => n.toLowerCase());
      if (new Set(allNames).size !== allNames.length) {
        throw new Error('All team members must have distinct names.');
      }

      const fileExt = screenshot.name.split('.').pop();
      const fileName = `${Date.now()}_${tName.replace(/\s+/g, '_')}_${lPhone}.${fileExt}`;
      
      const { data: publicUrlData } = supabase.storage
        .from('emerge_payments')
        .getPublicUrl(fileName);

      const { error: dbError } = await supabase
        .from('emerge_registrations')
        .insert([{
            user_id: user.id,
            team_name: tName,
            leader_name: lName,
            leader_email: lEmail,
            leader_phone: lPhone,
            leader_year: formData.leaderYear,
            leader_branch: lBranch,
            member_2_name: m2,
            member_3_name: m3,
            member_4_name: m4 || null,
            transaction_id: utr,
            screenshot_url: publicUrlData.publicUrl
        }]);

      if (dbError) {
        console.warn("TESTING MODE: Database error ignored so you can test the UI.", dbError);
      }

      const { error: uploadError } = await supabase.storage
        .from('emerge_payments')
        .upload(fileName, screenshot);

      if (uploadError) {
        await supabase.from('emerge_registrations').delete().eq('user_id', user.id).eq('team_name', tName);
        throw new Error(`Image upload failed: ${uploadError.message}. Registration cancelled.`);
      }

      localStorage.removeItem('emergeAutoSave');

      alert('You have successfully registered (Test Mode Active)');
      navigate('/initiatives'); 

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#030712] text-white selection:bg-purple-500/30">
      
      <GlobalBackground />
      <Navbar/>

      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <main className="relative z-10 pt-32 pb-20 px-6">
        <div className="max-w-3xl mx-auto">
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-purple-500/30 bg-purple-500/10 text-purple-300 text-sm font-semibold mb-4">
              <Users size={16} /> Team Registration
            </div>
            <h1 className="text-4xl md:text-5xl font-black font-poppins mb-4">
              Register for <span className="bg-gradient-to-r from-orange-400 to-purple-500 bg-clip-text text-transparent">Emerge</span>
            </h1>
            <p className="text-white/60">
              Pitch. Persuade. Prevail. Secure your team's spot below.
            </p>
          </motion.div>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            onSubmit={handleSubmit} 
            className="glass p-8 md:p-10 rounded-3xl border border-white/10 relative overflow-hidden"
          >
            
            <div className="mb-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                <Users className="text-purple-400" /> Team Identity
              </h2>
              <div className="space-y-2">
                <label className="text-sm text-white/70 ml-1">Team Name *</label>
                <div className="relative">
                  <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                  <input required type="text" name="teamName" value={formData.teamName} onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                    placeholder="Enter a unique team name"
                  />
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
                <User className="text-purple-400" /> Team Leader Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm text-white/70 ml-1">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input required type="text" name="leaderName" value={formData.leaderName} onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="Enter leader's name (Letters only)"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 ml-1">Email ID *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input required type="email" name="leaderEmail" value={formData.leaderEmail} onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="leader@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 ml-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input required type="tel" name="leaderPhone" value={formData.leaderPhone} onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="10-digit mobile number"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-white/70 ml-1">Year of Study *</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <select required name="leaderYear" value={formData.leaderYear} onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 appearance-none"
                    >
                      <option value="" className="bg-gray-900">Select Year</option>
                      <option value="1" className="bg-gray-900">1st Year</option>
                      <option value="2" className="bg-gray-900">2nd Year</option>
                      <option value="3" className="bg-gray-900">3rd Year</option>
                      <option value="4" className="bg-gray-900">4th Year</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm text-white/70 ml-1">Branch *</label>
                  <div className="relative">
                    <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                    <input required type="text" name="leaderBranch" value={formData.leaderBranch} onChange={handleChange}
                      className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all"
                      placeholder="e.g. CSE, CSM, ECE"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/10 pb-4 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Users className="text-purple-400" /> Team Members
                </h2>
                <span className="text-sm font-medium text-orange-400 mt-2 md:mt-0 bg-orange-400/10 px-3 py-1 rounded-lg border border-orange-400/20">
                  Note: Team size must be 3-4 members.
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-white/70 ml-1">Member 2 Name *</label>
                  <input required type="text" name="member2Name" value={formData.member2Name} onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    placeholder="Enter second member's name (Letters only)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70 ml-1">Member 3 Name *</label>
                  <input required type="text" name="member3Name" value={formData.member3Name} onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    placeholder="Enter third member's name (Letters only)"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-white/70 ml-1">Member 4 Name (Optional)</label>
                  <input type="text" name="member4Name" value={formData.member4Name} onChange={handleChange}
                    className="w-full bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50"
                    placeholder="Enter fourth member's name (Letters only)"
                  />
                </div>
              </div>
            </div>

            <div className="mb-10 bg-purple-900/10 rounded-2xl p-6 border border-purple-500/20">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <QrCode className="text-purple-400" /> Payment Registration
              </h2>
              
              <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center p-2 overflow-hidden border border-white/20">
                    <img src="/qrcode.jpg" alt="Payment QR Code" className="w-full h-full object-contain" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-white">Yeswanth Dasari</p>
                    <p className="text-xs text-purple-300/80 mt-1 select-all font-mono">
                      yeswanthdasari1412-1@oksbi
                    </p>
                  </div>
                </div>

                <div className="flex-1 space-y-4 w-full">
                  <p className="text-white/70 text-sm leading-relaxed">
                    Scan the QR code to pay the registration fee via any UPI app, or copy the UPI ID. 
                    Once paid, strictly enter the 12-digit UTR/Transaction ID and upload a screenshot below.
                  </p>
                  
                  <div className="space-y-2">
                    <label className="text-sm text-white/70 ml-1">12-Digit UPI Transaction ID (UTR) *</label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={18} />
                      <input required type="text" name="transactionId" value={formData.transactionId} onChange={handleChange}
                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all font-mono tracking-wider"
                        placeholder="e.g. 312345678901"
                      />
                    </div>
                  </div>

                  <div className="relative group cursor-pointer mt-4">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" accept="image/jpeg, image/png, image/webp" />
                    <div className={`bg-black/40 border border-dashed rounded-xl py-6 flex flex-col items-center justify-center transition-colors ${screenshot ? 'border-green-500/50' : 'border-white/20 group-hover:border-purple-500/50'}`}>
                      {screenshot ? (
                        <>
                          <CheckCircle2 className="text-green-400 mb-2" size={24} />
                          <span className="text-sm text-green-400 font-medium text-center px-4 truncate w-full">{screenshot.name}</span>
                        </>
                      ) : (
                        <>
                          <Upload className="text-white/40 mb-2 group-hover:text-purple-400 transition-colors" size={24} />
                          <span className="text-sm text-white/50 group-hover:text-white/80">Click to upload payment screenshot (Max 1MB)</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {errorMsg && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-start gap-3">
                <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={20} />
                <p className="text-red-200 text-sm leading-relaxed font-medium">{errorMsg}</p>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 mt-6 rounded-xl font-bold text-white transition-all duration-300 ${
              isSubmitting 
              ? 'bg-sky-500/50 cursor-not-allowed' 
              : 'bg-sky-500 hover:bg-sky-400 shadow-[0_0_20px_rgba(14,165,233,0.4)]'
               }`}
              >
              {isSubmitting ? 'Processing Registration...' : 'Complete Registration'}
            </button>
          </motion.form>
        </div>
      </main>
      <Footer />
    </div>
  );
}