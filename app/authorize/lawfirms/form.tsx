"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../../store";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding,
  faEnvelope,
  faPhone,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ROLES } from "@/constants/roles";

const LawFirmForm: React.FC = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [isClient, setIsClient] = useState(false);
  const [token, setToken] = useState<string | null>(null); // Store the token in local state

  const router = useRouter();
  const { isAuthenticated, user } = useSelector(
    (state: RootState) => state.auth
  );

  useEffect(() => {
    // Ensure code that depends on the client only runs in the browser
    setIsClient(true);

    // Get token from localStorage only on the client side
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    if (!isAuthenticated) {
      router.push("/authorize/login");
    } else if (user?.role !== ROLES.ADMIN && user?.role !== ROLES.MANAGER) {
      router.push("/unauthorized");
    }
  }, [isAuthenticated, user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !address) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await fetch("/api/v1/lawfirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // Use the token from state
        },
        body: JSON.stringify({ name, email, phone, address }),
      });

      if (!response.ok) {
        throw new Error("Failed to save law firm details");
      }

      router.push("/authorize/lawfirms");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove non-numeric characters
    const value = e.target.value.replace(/[^0-9]/g, "");
    setPhone(value);
  };

  if (!isClient) {
    return null; // Avoid rendering until client-side code can be executed
  }

  if (
    !isAuthenticated ||
    (user?.role !== ROLES.ADMIN && user?.role !== ROLES.MANAGER)
  ) {
    return null; // Or you could return a loading spinner
  }

  return (
    <div className="p-8 bg-white rounded shadow-md max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 ">Law Firm Form</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="mb-4 relative">
          <FontAwesomeIcon
            icon={faBuilding}
            className="absolute left-3 top-3 text-gray-400"
          />
          <input
            type="text"
            placeholder="Name"
            className="p-2 pl-10 w-full border border-gray-300 rounded text-black"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="mb-4 relative">
          <FontAwesomeIcon
            icon={faEnvelope}
            className="absolute left-3 top-3 text-gray-400"
          />
          <input
            type="email"
            placeholder="Email"
            className="p-2 pl-10 w-full border border-gray-300 rounded text-black"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4 relative">
          <FontAwesomeIcon
            icon={faPhone}
            className="absolute left-3 top-3 text-gray-400 "
          />
          <input
            type="text"
            placeholder="Phone"
            className="p-2 pl-10 w-full border border-gray-300 rounded text-black"
            value={phone}
            onChange={handlePhoneChange}
          />
        </div>
        <div className="mb-4 relative">
          <FontAwesomeIcon
            icon={faMapMarkerAlt}
            className="absolute left-3 top-3 text-gray-400"
          />
          <input
            type="text"
            placeholder="Address"
            className="p-2 pl-10 w-full border border-gray-300 rounded text-black"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Save
        </button>
      </form>
    </div>
  );
};

export default LawFirmForm;
