import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/overview');
    } catch (err) {
      setError(err.message || 'Đăng nhập thất bại, vui lòng thử lại.');
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
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-100 border border-slate-100 max-w-5xl w-full grid md:grid-cols-2 overflow-hidden min-h-[560px]">
          
          {/* Left Side: Login Form */}
          <div className="p-8 lg:p-14 flex flex-col justify-center">
            <div className="mb-8">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-[#0F172A] tracking-tight">Đăng nhập khách hàng</h2>
              <p className="text-slate-400 mt-2 text-sm lg:text-base font-medium">Theo dõi và gửi phản hồi dễ dàng</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Email</label>
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
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0B57D0] transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Mật khẩu</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-[#0B57D0] transition-all text-sm font-medium"
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

              {/* Remember & Forgot Password */}
              <div className="flex items-center justify-between text-xs sm:text-sm font-medium pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4.5 h-4.5 text-[#0B57D0] border-slate-200 rounded focus:ring-[#0B57D0]/20"
                  />
                  Ghi nhớ tôi
                </label>
                <Link to="/forgot" className="text-[#0B57D0] hover:underline font-semibold">Quên mật khẩu?</Link>
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
                className="w-full py-3.5 bg-[#0B57D0] hover:bg-[#08429E] disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transition duration-200 text-sm tracking-wide mt-2"
              >
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              {/* Signup Link */}
              <div className="text-center text-sm font-medium text-slate-500 mt-6">
                Chưa có tài khoản?{' '}
                <Link to="/register" className="text-[#0B57D0] hover:underline font-bold">Đăng ký</Link>
              </div>
            </form>
          </div>

          {/* Right Side: Showcase Panel */}
          <div className="hidden md:flex bg-slate-50 p-8 lg:p-12 flex-col items-center justify-center relative overflow-hidden border-l border-slate-100">
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
              <svg width="100%" height="100%">
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="1" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Content Title */}
            <div className="text-center max-w-sm mb-10 relative z-10">
              <h3 className="text-[#0B57D0] text-xl font-bold tracking-tight">Ý kiến của bạn tạo nên trải nghiệm tốt hơn</h3>
              <p className="text-slate-400 text-xs font-semibold mt-3 leading-relaxed">
                Chúng tôi phân loại và xử lý phản hồi để mang đến dịch vụ tốt nhất.
              </p>
            </div>

            {/* Sentiment Analyst UI Mockup */}
            <div className="w-full max-w-[340px] space-y-4 relative z-10">
              {/* User Review Mock Card 1 */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100/50 flex gap-3 animate-fade-in relative left-4">
                <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-700 flex-shrink-0">
                  👩
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-2/3 bg-slate-100 rounded"></div>
                  <div className="h-2 w-full bg-slate-100 rounded"></div>
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                </div>
                {/* Connector Badge */}
                <div className="absolute -left-20 top-4 px-2.5 py-1 bg-red-50 text-red-600 text-[10px] font-bold rounded-full border border-red-100 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Tiêu cực
                </div>
              </div>

              {/* User Review Mock Card 2 */}
              <div className="bg-white p-4 rounded-2xl shadow-md border border-slate-100/50 flex gap-3 animate-fade-in relative -left-4">
                <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-sm font-bold text-emerald-700 flex-shrink-0">
                  🧑
                </div>
                <div className="flex-1 space-y-2">
                  <div className="h-2 w-1/2 bg-slate-100 rounded"></div>
                  <div className="h-2 w-5/6 bg-slate-100 rounded"></div>
                  <div className="flex text-amber-400 text-xs">★★★★★</div>
                </div>
                {/* Connector Badge */}
                <div className="absolute -right-20 top-4 px-2.5 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-100 flex items-center gap-1 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Tích cực
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
