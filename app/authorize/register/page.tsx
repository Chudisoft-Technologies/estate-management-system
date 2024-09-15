"use client";
import React, { useEffect, useState } from "react";
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
  faMapMarkerAlt,
  faBriefcase,
} from "@fortawesome/free-solid-svg-icons";
import { ROLES, Role } from "../../../constants/roles";
import { useSelector } from "react-redux";
import { RootState } from "../../store/index";
import Toastify from "toastify-js"; // Import Toastify
import "toastify-js/src/toastify.css"; // Import Toastify CSS

const RegisterPage = () => {
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

  // Form state
  const [currentSection, setCurrentSection] = useState<"personal" | "address">(
    "personal"
  );
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | "">(""); // Manage selected role
  const router = useRouter();

  // Fetch token and user roles from auth slice
  const auth = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      const userRole = auth.user.role as Role;
      setIsAdmin(userRole === ROLES.ADMIN);
      setRoles(Object.values(ROLES)); // Get all roles
      setSelectedRole(userRole);
    } else {
      router.push("/authorize/login");
    }
  }, [auth, router]);

  const fetchWithToken = async (url: string, options: RequestInit) => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers: { [key: string]: string } = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    try {
      const res = await fetch(url, {
        ...options,
        headers: {
          ...headers,
          ...(options.headers || {}),
        },
      });
      return await res.json();
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      throw error;
    }
  };

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
    setCurrentSection("address");
  };

  const handleAddressDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const fullName = `${firstName} ${middleName || ""} ${lastName}`.trim();

    try {
      const data = await fetchWithToken("/api/v1/users", {
        method: "POST",
        body: JSON.stringify({
          email,
          password,
          firstName,
          middleName,
          lastName,
          fullName,
          username,
          phone,
          occupation,
          contactAddress,
          state,
          lga,
          country,
          role: isAdmin ? selectedRole : undefined, // Add role if admin
        }),
      });

      // Check if the response is successful based on your API's response structure
      if (data.success) {
        new Toastify({
          text: "Registration successful!",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #00b09b, #96c93d)",
        }).showToast();
        router.push("/login");
      } else {
        // If API returned a 201 status but response body indicates failure
        setError(data.error || "An error occurred");
        new Toastify({
          text: data.error || "An error occurred",
          duration: 3000,
          gravity: "top",
          position: "right",
          backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
        }).showToast();
      }
    } catch (error) {
      // Catch unexpected errors
      console.error("An unexpected error occurred:", error);
      setError("An unexpected error occurred");
      new Toastify({
        text: "An unexpected error occurred",
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: "linear-gradient(to right, #ff5f6d, #ffc371)",
      }).showToast();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md p-8 m-4 bg-gray-100 text-gray-700 shadow-md rounded-lg">
        <h1 className="text-2xl font-bold mb-4">Register</h1>
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
              <label htmlFor="middleName" className="block text-gray-700">
                Middle Name (optional)
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
                  icon={showPassword ? faEyeSlash : faEye}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                  onClick={handlePasswordToggle}
                />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="mt-1 p-2 pr-10 border border-gray-300 rounded w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
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
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Next
            </button>
          </form>
        ) : (
          <form onSubmit={handleAddressDetailsSubmit}>
            <div className="mb-4 relative">
              <label htmlFor="contactAddress" className="block text-gray-700">
                Contact Address
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  id="contactAddress"
                  className="mt-1 p-2 pl-10 border border-gray-300 rounded w-full"
                  value={contactAddress}
                  onChange={(e) => setContactAddress(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="mb-4">
              <label htmlFor="country" className="block text-gray-700">
                Country
              </label>
              <CountryDropdown
                value={country}
                onChange={(val) => setCountry(val)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="state" className="block text-gray-700">
                State
              </label>
              <RegionDropdown
                country={country}
                value={state}
                onChange={(val) => setState(val)}
              />
            </div>
            <div className="mb-4">
              <label htmlFor="lga" className="block text-gray-700">
                LGA
              </label>
              <input
                type="text"
                id="lga"
                className="mt-1 p-2 border border-gray-300 rounded w-full"
                value={lga}
                onChange={(e) => setLga(e.target.value)}
              />
            </div>
            <div className="mb-4">
              <LoadScript googleMapsApiKey="YOUR_GOOGLE_MAPS_API_KEY">
                <GoogleMap
                  mapContainerStyle={{ height: "300px", width: "100%" }}
                  center={mapCenter}
                  zoom={10}
                  onClick={handleMarkerDragEnd}
                >
                  <Marker
                    position={mapCenter}
                    draggable
                    onDragEnd={handleMarkerDragEnd}
                  />
                </GoogleMap>
              </LoadScript>
            </div>
            {isAdmin && (
              <div className="mb-4">
                <label htmlFor="role" className="block text-gray-700">
                  Role
                </label>
                <select
                  id="role"
                  className="mt-1 p-2 border border-gray-300 rounded w-full"
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value as Role)}
                >
                  <option value="">Select Role</option>
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              className="w-full py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Register
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RegisterPage;
