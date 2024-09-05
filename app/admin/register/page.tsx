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
  faBriefcase,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { ROLES, Role } from "@/constants/roles"; // Importing the roles

const AdminRegisterPage = () => {
  // Personal Details
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [occupation, setOccupation] = useState("");

  // Address Details
  const [contactAddress, setContactAddress] = useState("");
  const [state, setState] = useState("");
  const [lga, setLga] = useState("");
  const [country, setCountry] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 0, lng: 0 });

  // Admin-specific: Role selection
  const [role, setRole] = useState<Role | "">(""); // Role state for admin

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

    // Compute the full name from the first, middle, and last names
    const fullName = `${firstName} ${middleName || ""} ${lastName}`.trim();

    const res = await fetch("/api/v1/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        firstName,
        middleName,
        lastName,
        fullName, // Include the computed full name
        username,
        phone,
        occupation,
        contactAddress,
        state,
        lga,
        country,
        role, // Include the selected role
      }),
    });

    const data = await res.json();

    if (res.ok) {
      router.push("/login");
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
            <div className="mb-4 relative">
              <label htmlFor="firstName" className="block text-gray-700">
                First Name
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="firstName"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="middleName" className="block text-gray-700">
                Middle Name
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="middleName"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="lastName" className="block text-gray-700">
                Last Name
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="lastName"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="username" className="block text-gray-700">
                Username
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faUser}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="username"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="email" className="block text-gray-700">
                Email
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="email"
                  id="email"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-gray-700">
                Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={handlePasswordToggle}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="phone" className="block text-gray-700">
                Phone
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faPhone}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="tel"
                  id="phone"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="occupation" className="block text-gray-700">
                Occupation
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faBriefcase}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="occupation"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded"
              >
                Next
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleAddressDetailsSubmit}>
            <div className="mb-4 relative">
              <label htmlFor="country" className="block text-gray-700">
                Country
              </label>
              <div className="relative">
                <div className="mt-1 p-2 border border-gray-300 rounded w-full">
                  <CountryDropdown
                    id="country"
                    value={country}
                    onChange={(val) => setCountry(val)}
                  />
                </div>
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="state" className="block text-gray-700">
                State
              </label>
              <div className="relative">
                <div className="mt-1 p-2 border border-gray-300 rounded w-full">
                  <RegionDropdown
                    id="state"
                    country={country}
                    value={state}
                    onChange={(val) => setState(val)}
                  />
                </div>
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="lga" className="block text-gray-700">
                LGA
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="lga"
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  value={lga}
                  onChange={(e) => setLga(e.target.value)}
                />
              </div>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="contactAddress" className="block text-gray-700">
                Contact Address
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="contactAddress"
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4 h-64">
              <LoadScript
                googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}
              >
                <GoogleMap
                  mapContainerStyle={{ height: "100%", width: "100%" }}
                  center={mapCenter}
                  zoom={10}
                  onClick={(e) => handleMarkerDragEnd(e)}
                >
                  <Marker
                    position={mapCenter}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
            <div className="mb-4 relative">
              <label htmlFor="role" className="block text-gray-700">
                Role
              </label>
              <div className="relative">
                <select
                  id="role"
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  value={role}
                  onChange={(e) => setRole(e.target.value as Role)}
                  required
                >
                  <option value="">Select a role</option>
                  {Object.keys(ROLES).map((key) => (
                    <option key={key} value={key}>
                      {ROLES[key as keyof typeof ROLES]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mb-4">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded"
              >
                Register
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AdminRegisterPage;
