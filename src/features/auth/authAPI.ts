// src/features/auth/authAPI.ts
export interface LoginResponse {
  access_token: string;
  token_type: "bearer";
  username: string;
  role: "admin" | "datacollector" | "transcriber" | "validator";
}

export async function loginUser(
  username: string,
  password: string
): Promise<LoginResponse> {
  const response = await fetch("http://localhost:8000/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ username, password }),
  });

  if (!response.ok) {
    throw new Error("Invalid credentials");
  }

  const data = await response.json();

  // Expect backend to return role
  if (!data.role) {
    throw new Error("Role not provided by server");
  }

  return {
    access_token: data.access_token,
    token_type: data.token_type,
    username,
    role: data.role,
  };
}
