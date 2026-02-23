import { useEffect, useState } from "react";
import axios from "axios";

interface IUser {
  UserId: number;
  Email: string;
}

function Welcome() {
  const [user, setUser] = useState<IUser | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get("http://localhost:5000/api/auth/welcome", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setUser(res.data.user);
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome</h1>
      {user && (
        <>
          <p>User ID: {user.UserId}</p>
          <p>Email: {user.Email}</p>
        </>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Welcome;