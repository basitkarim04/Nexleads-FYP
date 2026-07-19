import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

import nexLeadlogo from "../assets/Images/nexLeadLogo.png";
import Login from "../assets/Images/Login.png";
import starBg from "../assets/Images/star.png";
import { baseurl } from "../BaseUrl";
import { toast } from "react-toastify";


export default function AuthPages() {
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" }); // success or error

  // Form states
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [signupData, setSignupData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetData, setResetData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [resetToken, setResetToken] = useState("");
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [otp, setOtp] = useState("");

  const isLogin = mode === "login";
  const isSignup = mode === "signup";
  const isForgot = mode === "forgot";
  const isReset = mode === "reset";
  const isLoginLike = isLogin || isForgot;
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


  // Check URL for reset token on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    if (token) {
      setResetToken(token);
      setMode("reset");
      // setMessage({ text: "Enter your new password below.", type: "success" });
      toast.error("Enter your new password below.");
    }
  }, []);

  const showMessage = (text, type = "error") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/user/login`, loginData);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userData", JSON.stringify(res.data.user));
      toast.success("Login successful! Redirecting...", "success");
      // Redirect to dashboard after 1s
      setTimeout(() => {
        navigate(`${res.data.user.type === "Admin" ? "/admin-dashboard" : "/dashboard"}`); // Change to your protected route
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (signupData.password !== signupData.confirmPassword) {
      return toast.error("Passwords do not match", "error");
    }
    setLoading(true);
    try {
      const res = await axios.post(`${baseurl}/user/signup`, {
        name: signupData.name,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
      });
      const { data } = res;

      if (data.success) {
        setShowOtpPopup(true);
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    const res = await fetch(`${baseurl}/user/verify-email`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: signupData.email,
        otp,
      }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Account created successfully!", "success");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    }
  };


  const handleForgot = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${baseurl}/user/forgot-password`, { email: forgotEmail });
      showMessage("Password reset link sent to your email!", "success");
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Failed to send reset link",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (resetData.password !== resetData.confirmPassword) {
      return showMessage("Passwords do not match", "error");
    }
    setLoading(true);
    try {
      await axios.post(`${baseurl}/user/reset-password/${resetToken}`, {
        password: resetData.password,
        confirmPassword: resetData.confirmPassword,
      });
      showMessage("Password reset successful! Logging you in...", "success");
      setTimeout(() => {
        setMode("login");
        setResetToken("");
      }, 2000);
    } catch (err) {
      showMessage(
        err.response?.data?.message || "Invalid or expired token",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="h-screen w-full flex relative overflow-hidden"
      style={{
        background: isSignup
          ? `url(${starBg}) repeat center center, linear-gradient(90deg, #3671cc 0%, #021024 100%)`
          : `url(${starBg}) repeat center center, linear-gradient(270deg, #3671cc 0%, #021024 100%)`,
        backgroundSize: "auto, cover",
      }}
    >
      {/* LOGO */}
      <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-50">
        <Link to="/">
          <img src={nexLeadlogo} alt="Logo" className="w-[120px]" />
        </Link>
      </div>

      {/* Message Alert */}
      {message.text && (
        <div
          className={`absolute top-24 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg text-white font-medium z-50 shadow-lg ${message.type === "success" ? "bg-green-600" : "bg-red-600"
            }`}
        >
          {message.text}
        </div>
      )}

      {/* GRID */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2">
        {/* FORM SECTION */}
        <div
          className={`w-full p-8 sm:p-12 text-white flex items-center justify-center ${isLoginLike ? "order-1" : "order-2"
            }`}
        >
          <div className="w-full max-w-md">
            {/* LOGIN */}
            {isLogin && (
              <form onSubmit={handleLogin} className="space-y-6">
                <h2 className="text-3xl font-bold mb-8">Login</h2>

                <input
                  type="text"
                  placeholder="Username Or Email Address *"
                  className="auth-input"
                  value={loginData.email}
                  onChange={(e) =>
                    setLoginData({ ...loginData, email: e.target.value })
                  }
                  required
                />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password *"
                    className="auth-input pr-12"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>

                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-white" />
                  Remember me
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-[#0b1c33] py-3 rounded-full font-semibold disabled:opacity-70"
                >
                  {loading ? "Logging in..." : "LOG IN"}
                </button>

                <p className="text-center text-sm">
                  <button type="button" onClick={() => setMode("signup")}>
                    Sign up
                  </button>{" "}
                  |{" "}
                  <button type="button" onClick={() => setMode("forgot")}>
                    Lost your Password?
                  </button>
                </p>
              </form>
            )}

            {/* SIGNUP */}
            {isSignup && (
              <form onSubmit={handleSignup} className="space-y-5">
                <h2 className="text-3xl font-bold mb-6">Create Account</h2>

                <input
                  placeholder="Name *"
                  className="auth-input"
                  value={signupData.name}
                  onChange={(e) =>
                    setSignupData({ ...signupData, name: e.target.value })
                  }
                  required
                />
                <input
                  type="email"
                  placeholder="Email Address *"
                  className="auth-input"
                  value={signupData.email}
                  onChange={(e) =>
                    setSignupData({ ...signupData, email: e.target.value })
                  }
                  required
                />
                {/* <input
                  type="password"
                  placeholder="Password *"
                  className="auth-input"
                  value={signupData.password}
                  onChange={(e) =>
                    setSignupData({ ...signupData, password: e.target.value })
                  }
                  required
                />
                <input
                  type="password"
                  placeholder="Confirm Password *"
                  className="auth-input"
                  value={signupData.confirmPassword}
                  onChange={(e) =>
                    setSignupData({
                      ...signupData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                /> */}


                {/* Password Field */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password *"
                    className="auth-input pr-12"
                    value={signupData.password}
                    onChange={(e) =>
                      setSignupData({ ...signupData, password: e.target.value })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="relative mt-4">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password *"
                    className="auth-input pr-12"
                    value={signupData.confirmPassword}
                    onChange={(e) =>
                      setSignupData({
                        ...signupData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-8 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <i
                      className={
                        showConfirmPassword
                          ? "ri-eye-off-line"
                          : "ri-eye-line"
                      }
                    ></i>
                  </button>
                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-[#0b1c33] py-3 rounded-full font-semibold disabled:opacity-70"
                >
                  {loading ? "Creating Account..." : "Sign Up"}
                </button>

                <p className="text-center text-sm">
                  Already have an account?{" "}
                  <button type="button" onClick={() => setMode("login")}>
                    Log in
                  </button>
                </p>
              </form>
            )}

            {/* FORGOT PASSWORD */}
            {isForgot && (
              <form onSubmit={handleForgot} className="space-y-6">
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-sm mb-6 inline-block"
                >
                  ← Back to Login
                </button>

                <h2 className="text-3xl font-bold mb-4">Forgot Password</h2>
                <p className="text-white mb-6 text-sm">
                  Enter your email address and we’ll send you a reset link.
                </p>

                <input
                  type="email"
                  placeholder="Email Address *"
                  className="auth-input"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  required
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-[#0b1c33] py-3 rounded-full font-semibold disabled:opacity-70"
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>
              </form>
            )}

            {/* RESET PASSWORD */}
            {isReset && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("login");
                    setResetToken("");
                  }}
                  className="text-sm mb-6 inline-block"
                >
                  ← Back to Login
                </button>

                <h2 className="text-3xl font-bold mb-4">Reset Password</h2>
                <p className="text-white mb-6 text-sm">
                  Enter your new password below.
                </p>
                {/* New Password */}
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="New Password *"
                    className="auth-input pr-12"
                    value={resetData.password}
                    onChange={(e) =>
                      setResetData({ ...resetData, password: e.target.value })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <i className={showPassword ? "ri-eye-off-line" : "ri-eye-line"}></i>
                  </button>
                </div>

                {/* Confirm New Password */}
                <div className="relative mt-4">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm New Password *"
                    className="auth-input pr-12"
                    value={resetData.confirmPassword}
                    onChange={(e) =>
                      setResetData({
                        ...resetData,
                        confirmPassword: e.target.value,
                      })
                    }
                    required
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="absolute right-3 top-8 -translate-y-1/2 text-gray-500 hover:text-black"
                  >
                    <i
                      className={
                        showConfirmPassword
                          ? "ri-eye-off-line"
                          : "ri-eye-line"
                      }
                    ></i>
                  </button>
                </div>


                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white text-[#0b1c33] py-3 rounded-full font-semibold disabled:opacity-70"
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div
          className={`hidden lg:flex items-center justify-center h-screen ${isLoginLike ? "order-2" : "order-1"
            }`}
        >
          <img
            src={Login}
            alt="Auth Illustration"
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {showOtpPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">

            {/* Header */}
            <h2 className="text-2xl font-bold text-center text-gray-900">
              Verify Your Email
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Enter the 6-digit code sent to your email
            </p>

            {/* OTP Input */}
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(e.target.value.replace(/\D/g, ""))
              }
              placeholder="••••••"
              className="mt-6 w-full rounded-xl border border-gray-300 px-4 py-3 text-center text-xl tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
            />

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={otp.length !== 6 || loading}
              className="mt-5 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Verifying..." : "Verify Code"}
            </button>

          </div>
        </div>
      )}

    </div>
  );
}