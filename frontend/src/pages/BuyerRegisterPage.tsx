import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { locationsApi } from '../services/api';
import { District, State } from '../types';
import { AnimatedPrawnsBackground } from '../components/ui/AnimatedPrawnsBackground';
import {
  Building2,
  Lock,
  Mail,
  Phone,
  User,
  MapPin,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldAlert,
  Waves,
  CreditCard,
  FileCheck,
  FileText,
  UploadCloud,
  X,
  ShieldCheck,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export const BuyerRegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirm_password: '',
    business_name: '',
    contact_person: '',
    phone: '',
    whatsapp_number: '',
    sameAsPhone: true,
    business_type: 'WHOLESALER',
    state_id: '',
    district_id: '',
    town_market: '',
    business_address: '',
    aadhar_number: '',
    terms_agreed: false,
  });

  const [aadharFile, setAadharFile] = useState<File | null>(null);
  const [aadharPreview, setAadharPreview] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLocations = async () => {
      try {
        const [stRes, distRes] = await Promise.all([
          locationsApi.getStates(),
          locationsApi.getDistricts(),
        ]);
        setStates(stRes.data || []);
        setDistricts(distRes.data || []);
        if (stRes.data && stRes.data.length > 0) {
          setFormData((prev) => ({ ...prev, state_id: String(stRes.data[0].id) }));
        }
      } catch (err) {
        console.error('Failed to load states/districts:', err);
      }
    };
    loadLocations();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
        ...(name === 'sameAsPhone' && checked ? { whatsapp_number: prev.phone } : {}),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        ...(name === 'phone' && prev.sameAsPhone ? { whatsapp_number: value } : {}),
      }));
    }
  };

  const handleAadharNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setFormData((prev) => ({ ...prev, aadhar_number: formatted }));
  };

  const handleSelectedFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setError('Aadhaar file size must be less than 5MB.');
      return;
    }
    setError(null);
    setAadharFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setAadharPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setAadharPreview(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setAadharFile(null);
    setAadharPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!formData.business_name.trim()) {
      setError('Business / Company name is required.');
      return;
    }
    if (!formData.contact_person.trim()) {
      setError('Contact person name is required.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Phone number is required.');
      return;
    }
    if (!formData.district_id) {
      setError('Please select an Andhra Pradesh district.');
      return;
    }
    if (!formData.business_address.trim()) {
      setError('Business address is required.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (formData.password !== formData.confirm_password) {
      setError('Passwords do not match.');
      return;
    }
    if (!formData.terms_agreed) {
      setError('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    const cleanAadhar = formData.aadhar_number.replace(/\s+/g, '');
    if (!cleanAadhar) {
      setError('Aadhaar number is mandatory for buyer verification.');
      return;
    }
    if (cleanAadhar.length !== 12) {
      setError('Aadhaar number must be exactly 12 digits.');
      return;
    }
    if (!aadharFile) {
      setError('Please upload your Aadhaar card document (JPG, PNG, or PDF) for identity verification.');
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('email', formData.email.trim());
      fd.append('password', formData.password);
      fd.append('confirm_password', formData.confirm_password);
      fd.append('role', 'BUYER');
      fd.append('business_name', formData.business_name.trim());
      fd.append('contact_person', formData.contact_person.trim());
      fd.append('phone', formData.phone.trim());
      fd.append('whatsapp_number', formData.sameAsPhone ? formData.phone.trim() : formData.whatsapp_number.trim());
      fd.append('business_type', formData.business_type);
      if (formData.state_id) fd.append('state_id', String(formData.state_id));
      if (formData.district_id) fd.append('district_id', String(formData.district_id));
      if (formData.town_market) fd.append('town_market', formData.town_market.trim());
      if (formData.business_address) fd.append('business_address', formData.business_address.trim());
      if (cleanAadhar) fd.append('aadhar_number', cleanAadhar);
      if (aadharFile) fd.append('aadhar_card', aadharFile);
      fd.append('terms_agreed', 'true');

      await register(fd);
      navigate('/buyer/dashboard');
    } catch (err: any) {
      const respData = err.response?.data;
      if (typeof respData === 'object' && respData !== null) {
        const messages = Object.entries(respData)
          .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(' ') : val}`)
          .join(' | ');
        setError(messages || 'Registration failed.');
      } else {
        setError('Registration failed. Please check your network and input fields.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatedPrawnsBackground intensity="vibrant">
      <div className="flex-1 py-8 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        {/* Horizontal Wide Dashboard Container (max-w-6xl instead of max-w-2xl) */}
        <div className="max-w-6xl w-full backdrop-blur-2xl bg-slate-900/95 rounded-3xl border border-white/20 shadow-2xl shadow-sky-950/80 overflow-hidden relative z-20 text-white">
          
          {/* Sleek Horizontal Header Banner */}
          <div className="bg-gradient-to-r from-sky-950/80 via-slate-900 to-teal-950/80 p-5 sm:p-6 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-14 h-14 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-sky-400 via-teal-300 to-emerald-400 shadow-xl shadow-sky-500/30 shrink-0 hover:scale-105 transition-transform">
                <img
                  src="/logo.png"
                  alt="ANDHRA AQUA RATES Official Logo"
                  className="w-full h-full object-cover rounded-full bg-white"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                    Register Buyer Account
                  </h1>
                  <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-sky-500/20 text-sky-300 border border-sky-400/30">
                    ANDHRA AQUA RATES
                  </span>
                </div>
                <p className="text-xs text-sky-200/80 mt-0.5">
                  Procure directly from verified shrimp farmers across Andhra Pradesh and publish daily procurement prices.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2.5 shrink-0">
              <div className="px-3 py-1.5 rounded-xl bg-sky-950/70 border border-sky-500/30 text-[11px] text-sky-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>Free Registration • ₹499/mo to publish daily rates</span>
              </div>
              <Link
                to="/login"
                className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold border border-white/10 transition-colors whitespace-nowrap"
              >
                Sign In Instead →
              </Link>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-6">
            {error && (
              <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Mandatory indicator notice */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-white/5">
              <span>Please provide accurate details for verified seafood buyer accreditation</span>
              <span>
                Fields marked with <span className="text-red-400 font-bold text-xs">*</span> are mandatory
              </span>
            </div>

            {/* 2-COLUMN HORIZONTAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6 items-start">
              
              {/* ======================================================== */}
              {/* LEFT COLUMN: Business Profile & Location Details         */}
              {/* ======================================================== */}
              <div className="space-y-5">
                
                {/* 1. Business Profile Box */}
                <div className="bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-sky-400" />
                      1. Business Profile
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">Company Information</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Business / Company Name <span className="text-red-400 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Building2 className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          name="business_name"
                          placeholder="e.g. Godavari Aqua Traders & Exports"
                          value={formData.business_name}
                          onChange={handleChange}
                          className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Contact Person Name <span className="text-red-400 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          name="contact_person"
                          placeholder="Full Name"
                          value={formData.contact_person}
                          onChange={handleChange}
                          className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Business Type <span className="text-red-400 font-bold">*</span>
                      </label>
                      <select
                        name="business_type"
                        value={formData.business_type}
                        onChange={handleChange}
                        className="w-full text-xs rounded-xl border border-white/20 bg-slate-950 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        <option value="WHOLESALER">Wholesaler / Trader</option>
                        <option value="PROCESSOR">Processing Plant</option>
                        <option value="EXPORTER">Marine Exporter</option>
                        <option value="DISTRIBUTOR">Distributor</option>
                        <option value="COMMISSION_AGENT">Commission Agent</option>
                        <option value="OTHER">Other Buyer</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Mobile Phone (Calling) <span className="text-red-400 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          required
                          name="phone"
                          placeholder="+91 98480 12345"
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* WhatsApp Phone Option */}
                  <div className="pt-1">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-300 mb-2">
                      <input
                        type="checkbox"
                        name="sameAsPhone"
                        checked={formData.sameAsPhone}
                        onChange={handleChange}
                        className="rounded text-sky-500 focus:ring-sky-400"
                      />
                      <span>WhatsApp number is the same as calling mobile</span>
                    </label>

                    {!formData.sameAsPhone && (
                      <div className="relative mt-1">
                        <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-2.5" />
                        <input
                          type="tel"
                          name="whatsapp_number"
                          placeholder="WhatsApp Number (+91...)"
                          value={formData.whatsapp_number}
                          onChange={handleChange}
                          className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Location Details Box */}
                <div className="bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-sky-400" />
                      2. Location Details
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">Andhra Pradesh Mandi Center</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        District (Andhra Pradesh) <span className="text-red-400 font-bold">*</span>
                      </label>
                      <select
                        required
                        name="district_id"
                        value={formData.district_id}
                        onChange={handleChange}
                        className="w-full text-xs rounded-xl border border-white/20 bg-slate-950 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400"
                      >
                        <option value="">Select District</option>
                        {districts.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Town / Mandi Market</label>
                      <input
                        type="text"
                        name="town_market"
                        placeholder="e.g. Bhimavaram Main Mandi"
                        value={formData.town_market}
                        onChange={handleChange}
                        className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Business Address <span className="text-red-400 font-bold">*</span>
                      </label>
                      <textarea
                        required
                        name="business_address"
                        rows={2}
                        placeholder="Door No, Street, Landmark..."
                        value={formData.business_address}
                        onChange={handleChange}
                        className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white p-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

              </div>

              {/* ======================================================== */}
              {/* RIGHT COLUMN: Identity Verification & Account Security   */}
              {/* ======================================================== */}
              <div className="space-y-5">
                
                {/* 3. Identity Verification (Aadhaar KYC) Box */}
                <div className="bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-sky-400" />
                      3. Identity Verification (Aadhaar KYC)
                    </h3>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/30 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
                      Verified Buyer Badge
                    </span>
                  </div>

                  <div className="space-y-3">
                    {/* 12-Digit Aadhaar Number */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                        <span>
                          Aadhaar Number (12 Digits) <span className="text-red-400 font-bold">*</span>
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">Format: 1234 5678 9012</span>
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          required
                          name="aadhar_number"
                          placeholder="XXXX XXXX XXXX (12 Digits)"
                          value={formData.aadhar_number}
                          onChange={handleAadharNumberChange}
                          maxLength={14}
                          className="w-full text-xs font-mono tracking-widest rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    {/* Upload Aadhaar Card File Box */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Upload Aadhaar Card (Front / Full Document) <span className="text-red-400 font-bold">*</span>
                      </label>

                      {!aadharFile ? (
                        <div
                          onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                          onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                          onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onDrop={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDragActive(false);
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              handleSelectedFile(e.dataTransfer.files[0]);
                            }
                          }}
                          className={`relative border-2 border-dashed rounded-2xl p-4 text-center transition-all cursor-pointer group ${
                            dragActive
                              ? 'border-sky-400 bg-sky-950/60'
                              : 'border-white/20 hover:border-sky-400/80 bg-slate-950/50 hover:bg-slate-950/80'
                          }`}
                        >
                          <input
                            type="file"
                            id="aadhar_file_input"
                            accept="image/jpeg,image/png,image/webp,application/pdf"
                            onChange={handleFileInputChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="flex flex-col items-center justify-center pointer-events-none">
                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center mb-1.5 border border-sky-500/20 group-hover:scale-105 transition-transform">
                              <UploadCloud className="w-5 h-5" />
                            </div>
                            <div className="text-xs font-bold text-white group-hover:text-sky-300 transition-colors">
                              Click to browse or drag & drop your Aadhaar file <span className="text-red-400 font-bold">*</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              Supports JPG, PNG or PDF (Max size: 5MB)
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-2xl bg-slate-950/80 border border-teal-500/40 flex items-center justify-between gap-3 shadow-inner">
                          <div className="flex items-center gap-3 min-w-0">
                            {aadharPreview ? (
                              <img
                                src={aadharPreview}
                                alt="Aadhaar Preview"
                                className="w-11 h-11 rounded-xl object-cover border border-white/20 shrink-0 bg-slate-900"
                              />
                            ) : (
                              <div className="w-11 h-11 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30 flex items-center justify-center shrink-0">
                                <FileText className="w-5 h-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <FileCheck className="w-4 h-4 text-teal-400 shrink-0" />
                                <span className="text-xs font-bold text-white truncate">{aadharFile.name}</span>
                              </div>
                              <div className="text-[11px] text-slate-400 mt-0.5">
                                {(aadharFile.size / 1024).toFixed(1)} KB • Ready for verification
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={handleRemoveFile}
                            className="px-2.5 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 text-xs font-semibold border border-red-500/20 transition-colors flex items-center gap-1 shrink-0"
                          >
                            <X className="w-3.5 h-3.5" />
                            Remove
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Privacy & Trust Reassurance */}
                    <div className="p-2.5 rounded-xl bg-slate-950/60 border border-white/10 flex items-start gap-2 text-[11px] text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                      <span>
                        <strong>Confidential & Secure:</strong> Encrypted and used solely by the admin team to verify authentic buyers. Never displayed publicly to farmers.
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Account Credentials Box */}
                <div className="bg-slate-950/60 rounded-2xl p-4 sm:p-5 border border-white/10 space-y-3.5 shadow-sm">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10">
                    <h3 className="text-xs font-black uppercase tracking-wider text-sky-400 flex items-center gap-2">
                      <Lock className="w-4 h-4 text-sky-400" />
                      4. Account Credentials
                    </h3>
                    <span className="text-[10px] text-slate-400 font-medium">Login Security</span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">
                        Official Email Address <span className="text-red-400 font-bold">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          required
                          name="email"
                          placeholder="buyer@domain.com"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Password (min 8 chars) <span className="text-red-400 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleChange}
                            className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 mb-1">
                          Confirm Password <span className="text-red-400 font-bold">*</span>
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-sky-400 absolute left-3 top-2.5" />
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            required
                            minLength={8}
                            name="confirm_password"
                            placeholder="••••••••"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="w-full text-xs rounded-xl border border-white/20 bg-slate-950/80 text-white pl-9 pr-10 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

            {/* ======================================================== */}
            {/* BOTTOM FULL-WIDTH STRIP: Terms Agreement & Submission   */}
            {/* ======================================================== */}
            <div className="pt-4 border-t border-white/10 space-y-4">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  required
                  name="terms_agreed"
                  checked={formData.terms_agreed}
                  onChange={handleChange}
                  className="mt-0.5 rounded text-sky-500 focus:ring-sky-400"
                />
                <span>
                  I agree to the ANDHRA AQUA RATES Terms of Service, Privacy Policy, and certify that all business details and Aadhaar KYC documents provided are truthful and accurate.
                </span>
              </label>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
                <div className="text-xs text-slate-400 text-center sm:text-left">
                  Already have an account?{' '}
                  <Link to="/login" className="font-bold text-sky-400 hover:underline">
                    Sign In to Dashboard →
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-sky-400 via-teal-400 to-emerald-400 hover:brightness-110 text-slate-950 font-black rounded-xl text-sm shadow-xl shadow-sky-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? 'Creating Buyer Account...' : 'Complete Buyer Registration'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </AnimatedPrawnsBackground>
  );
};
