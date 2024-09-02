"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CountryDropdown, RegionDropdown } from "react-country-region-selector";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEnvelope,
  faLock,
  faUser,
  faPhone,
  faEye,
  faEyeSlash,
  faGlobe,
  faMapMarkerAlt,
  faAddressCard,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";

const AdminRegisterPage = () => {
  // Personal Details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");
  const [role, setRole] = useState(""); // New state for role

  // Address Details
  const [contactAddress, setContactAddress] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [country, setCountry] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  // Form state
  const [currentSection, setCurrentSection] = useState<"personal" | "address">(
    "personal"
  );
  const [error, setError] = useState("");
  const router = useRouter();

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setMapCenter({ lat, lng });
      setContactAddress(`${lat}, ${lng}`);
    }
  };

  const handlePasswordToggle = () => {
    setShowPassword(!showPassword);
  };

  const handlePersonalDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Perform validation if needed
    setCurrentSection("address");
  };

  const handleAddressDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const res = await fetch("/api/v1/admin/users", {
      // Use a different endpoint if necessary
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        fullname,
        username,
        phone,
        occupation,
        role, // Include role in the submission
        contactAddress,
        state,
        lga,
        country,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/admin/dashboard");
    } else {
      setError(data.error || "An error occurred");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 m-4 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Admin Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {currentSection === "personal" ? (
          <form onSubmit={handlePersonalDetailsSubmit}>
            {/* Other personal details form fields... */}
            <div className="mb-4 relative">
              <label htmlFor="role" className="block text-gray-700">
                Role
              </label>
              <select
                id="role"
                className="mt-1 p-2 border border-gray-300 rounded w-full"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
              >
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="manager">Manager</option>
                <option value="staff">Staff</option>
                {/* Add more roles as needed */}
              </select>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddressDetailsSubmit}>
            {/* Address details form fields... */}
            <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
              <GoogleMap
                center={mapCenter}
                zoom={15}
                mapContainerStyle={{ height: "400px", width: "100%" }}
                onClick={(e) => handleMarkerDragEnd(e)}
              >
                <Marker
                  position={mapCenter}
                  draggable
                  onDragEnd={handleMarkerDragEnd}
                />
              </GoogleMap>
            </LoadScript>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Submit
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminRegisterPage;
