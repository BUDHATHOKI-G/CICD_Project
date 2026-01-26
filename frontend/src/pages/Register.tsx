import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await api.post("/api/auth/register", {
        Username: username,
        Email: email,
        PasswordHash: password,
        Phone: phone,
      });
      console.log(res.data);

      setSuccess("Registration successful! You can now login.");
      setUsername("");
      setEmail("");
      setPassword("");
      setPhone("");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-100 to-blue-200">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-2">
          Create Account
        </h1>
        <p className="text-center text-gray-500 mb-6">Sign up to get started</p>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 text-green-700 p-3 rounded mb-4 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose an UserName"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email Address"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Mobile Number"
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-green-500 outline-none"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition font-medium"
          >
            {loading ? "Registering..." : "Sign Up"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link to="/" className="text-green-600 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
