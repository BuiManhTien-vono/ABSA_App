import React, { useState } from 'react';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/auth';

export default function RegisterPage() {
  const { register, loading } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }
    try {
      await register({ email, password, fullName, phoneNumber: phone });
      navigate('/overview');
    } catch (err) {
      setError(err.message || 'Đăng ký thất bại, vui lòng thử lại.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans">
      {/* Header Bar */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#0B57D0] rounded-xl flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#1E293B] leading-tight">Feedback Classifier</h1>
            <p className="text-xs text-slate-400 font-medium">Phân loại phản hồi</p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-slate-600 hover:text-[#0B57D0] transition">Trang chủ</Link>
          <Link to="/about" className="text-sm font-medium text-slate-600 hover:text-[#0B57D0] transition">Giới thiệu</Link>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition">
            <span className="text-base">🌐</span> VI <span className="text-[10px] text-slate-400">▼</span>
          </button>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-6 md:p-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 max-w-5xl w-full grid md:grid-cols-2 overflow-hidden min-h-[580px]">
          
          {/* Left Side: Register Form */}
          <div className="p-8 lg:p-12 flex flex-col justify-center">
            <div className="mb-6">
              <h2 className="text-3xl font-extrabold text-[#0F172A] tracking-tight">Đăng ký khách hàng</h2>
              <p className="text-slate-400 mt-1 text-sm font-medium">Tạo tài khoản để gửi và theo dõi phản hồi</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Họ và tên</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <User className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="Nhập họ và tên"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00B4D8] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00B4D8] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Số điện thoại</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-11 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00B4D8] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Tạo mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00B4D8] transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Xác nhận mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-[#00B4D8] transition-all text-sm font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 font-medium">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#00A896] hover:bg-[#028090] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition duration-200 text-sm tracking-wide mt-3"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Tạo tài khoản'}
              </button>

              {/* Login Link */}
              <div className="text-center text-sm font-medium text-slate-500 mt-4">
                Đã có tài khoản?{' '}
                <Link to="/login" className="text-[#0B57D0] hover:underline font-bold">Đăng nhập</Link>
              </div>
            </form>
          </div>

          {/* Right Side: Design Showcase */}
          <div className="hidden md:flex bg-slate-50 p-8 lg:p-12 flex-col items-center justify-center relative overflow-hidden border-l border-slate-100">
            {/* Custom Background Leaves/Waves illustrations */}
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-200/20 rounded-full blur-2xl pointer-events-none"></div>
            
            {/* Title / Description */}
            <div className="text-center max-w-sm mb-8 relative z-10">
              <h3 className="text-[#0F172A] text-xl font-bold tracking-tight">Chia sẻ dễ dàng, chúng tôi lắng nghe</h3>
              <p className="text-slate-400 text-xs font-semibold mt-3 leading-relaxed">
                Chọn loại phản hồi phù hợp để chúng tôi xử lý nhanh chóng và chính xác.
              </p>
            </div>

            {/* Showcase feedback type cards */}
            <div className="w-full max-w-[280px] space-y-3.5 relative z-10">
              {/* Type Card 1: Khiếu nại */}
              <div className="bg-red-50/50 p-3 px-5 rounded-2xl border border-red-100 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition duration-200">
                <span className="w-10 h-10 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  ⚠️
                </span>
                <span className="font-extrabold text-red-700 text-sm tracking-wide">Khiếu nại</span>
              </div>

              {/* Type Card 2: Góp ý */}
              <div className="bg-amber-50/50 p-3 px-5 rounded-2xl border border-amber-100 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition duration-200">
                <span className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  💡
                </span>
                <span className="font-extrabold text-amber-700 text-sm tracking-wide">Góp ý</span>
              </div>

              {/* Type Card 3: Khen ngợi */}
              <div className="bg-emerald-50/50 p-3 px-5 rounded-2xl border border-emerald-100 flex items-center gap-4 shadow-sm hover:scale-[1.02] transition duration-200">
                <span className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  👍
                </span>
                <span className="font-extrabold text-emerald-700 text-sm tracking-wide">Khen ngợi</span>
              </div>
            </div>

            {/* Paper Airplane Art */}
            <div className="absolute right-4 top-1/4 opacity-10 animate-pulse">
              <svg className="w-20 h-20 text-[#00A896]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
