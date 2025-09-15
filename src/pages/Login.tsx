// src/pages/Login.tsx
import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { loginAsync } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

function Login() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const auth = useAppSelector((state) => state.auth);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await dispatch(loginAsync({ username, password })).unwrap();
      const role =
        (result?.role as
          | "admin"
          | "datacollector"
          | "transcriber"
          | "validator"
          | undefined) ?? undefined;
      if (role) {
        navigate(`/dashboard/${role}`, { replace: true });
      } else {
        navigate("/login", { replace: true });
      }
    } catch (err: any) {
      console.error("Login error:", err.message);
      alert("Login failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-800">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-neutral-800 p-6 rounded-2xl shadow-lg border border-neutral-700"
      >
        <h2 className="text-2xl font-semibold text-center text-white mb-6">
          Login
        </h2>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-6 px-4 py-2 rounded-lg bg-neutral-900 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-500"
          required
        />

        <button
          type="submit"
          disabled={auth.status === "loading"}
          className=" w-full py-2 rounded-lg bg-white text-black font-medium hover:bg-neutral-200 transition disabled:opacity-50"
        >
          {auth.status === "loading" ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

export default Login;
