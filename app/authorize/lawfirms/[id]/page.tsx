"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import axios from "axios";

const EditLawFirm: React.FC = () => {
  const router = useRouter();
  const { id } = useParams(); // Gets the id from the URL parameters, if any

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const fetchLawFirmDetails = async () => {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);

      try {
        const response = await axios.get(`/api/v1/lawfirm/${id}`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });
        const data = response.data;
        setName(data.name);
        setEmail(data.email);
        setPhone(data.phone);
        setAddress(data.address);
      } catch {
        new Toastify({
          text: "Failed to load law firm details",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      } finally {
        setLoading(false);
      }
    };

    fetchLawFirmDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !address) {
      setError("Please fill in all fields");
      return;
    }

    const lawFirmData = {
      name,
      email,
      phone,
      address,
    };

    try {
      await axios.put(`/api/v1/lawfirm/${id}`, lawFirmData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      new Toastify({
        text: "Law firm details updated successfully!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      }).showToast();

      router.push("/authorize/lawfirms");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to update law firm");
      new Toastify({
        text: error.response?.data?.error || "Failed to update law firm",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Edit Law Firm</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="phone" className="block text-gray-700">
              Phone
            </label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="address" className="block text-gray-700">
              Address
            </label>
            <input
              type="text"
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
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
    </div>
  );
};

export default EditLawFirm;
