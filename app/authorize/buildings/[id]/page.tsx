"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import axios from "axios";

const EditBuildingForm: React.FC = () => {
  const router = useRouter();
  const { id } = useParams(); // Gets the id from the URL parameters, if any

  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [numOfFloors, setNumOfFloors] = useState<string>("");
  const [lawFirmId, setLawFirmId] = useState<number | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [lawFirms, setLawFirms] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLawFirms = async () => {
      try {
        const res = await fetch("/api/v1/lawfirm", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setLawFirms(data.data);
      } catch {
        new Toastify({
          text: "Failed to load law firms",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    };

    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/v1/users", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
        });
        const data = await res.json();
        setUsers(data.data);
      } catch {
        new Toastify({
          text: "Failed to load users",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    };

    const fetchBuildingDetails = async () => {
      if (id) {
        try {
          const response = await axios.get(`/api/v1/buildings/${id}`);
          const data = response.data;
          setName(data.name);
          setAddress(data.address);
          setNumOfFloors(data.numOfFloors.toString());
          setLawFirmId(data.lawFirmId || null);
          setManagerId(data.managerId || null);
        } catch {
          new Toastify({
            text: "Failed to load building details",
            duration: 3000,
            gravity: "top",
            position: "right",
            backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
          }).showToast();
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLawFirms();
    fetchUsers();
    fetchBuildingDetails();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const buildingData = {
      name,
      address,
      numOfFloors: parseInt(numOfFloors, 10),
      lawFirmId,
      managerId,
    };

    try {
      await axios({
        method: id ? "put" : "post",
        url: id ? `/api/v1/buildings/${id}` : "/api/v1/buildings",
        data: buildingData,
      });
      new Toastify({
        text: id
          ? "Building updated successfully!"
          : "Building added successfully!",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
      }).showToast();
      router.push("/authorize/buildings");
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to save building");
      new Toastify({
        text: error.response?.data?.error || "Failed to save building",
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
        <h1 className="text-2xl font-bold mb-4">
          {id ? "Edit Building" : "Add Building"}
        </h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="name" className="block text-gray-700">
              Building Name
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
          <div className="mb-4">
            <label htmlFor="numOfFloors" className="block text-gray-700">
              Number of Floors
            </label>
            <input
              type="number"
              id="numOfFloors"
              value={numOfFloors}
              onChange={(e) => setNumOfFloors(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
              required
            />
          </div>
          <div className="mb-4">
            <label htmlFor="lawFirm" className="block text-gray-700">
              Law Firm
            </label>
            <select
              id="lawFirm"
              value={lawFirmId ?? ""}
              onChange={(e) => setLawFirmId(parseInt(e.target.value) || null)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select a Law Firm</option>
              {lawFirms.length > 0 ? (
                lawFirms.map((firm) => (
                  <option key={firm.id} value={firm.id}>
                    {firm.name}
                  </option>
                ))
              ) : (
                <option value="">No law firms available</option>
              )}
            </select>
          </div>
          <div className="mb-4">
            <label htmlFor="manager" className="block text-gray-700">
              Manager
            </label>
            <select
              id="manager"
              value={managerId ?? ""}
              onChange={(e) => setManagerId(e.target.value)}
              className="mt-1 p-2 border border-gray-300 rounded w-full"
            >
              <option value="">Select a Manager</option>
              {users.length > 0 ? (
                users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.fullName}
                  </option>
                ))
              ) : (
                <option value="">No managers available</option>
              )}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            {id ? "Update Building" : "Add Building"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditBuildingForm;
