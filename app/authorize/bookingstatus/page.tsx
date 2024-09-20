"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { setBookingStatuses } from "@/app/store/bookingStatusSlice";
import BookingStatusCard from "./BookingStatusCard";
import Pagination from "../../Pagination";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";
import { useRouter } from "next/navigation";
import Link from "next/link";

const BookingStatusList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const router = useRouter();
  const { bookingStatuses, status, error } = useSelector(
    (state: RootState) => state.bookingStatuses
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const fetchBookingStatuses = async () => {
      try {
        const token = localStorage.getItem("token");

        const response = await fetch("/api/v1/bookingstatus", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) throw new Error("Failed to fetch booking statuses");
        const data = await response.json();

        dispatch(setBookingStatuses(data.data));
      } catch (err) {
        const errorMessage =
          (err as Error).message || "An unknown error occurred";
        new Toastify({
          text: `Error fetching data: ${errorMessage}`,
          backgroundColor: "#FF0000",
          className: "error-toast",
        }).showToast();
      }
    };

    fetchBookingStatuses();
  }, [dispatch]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "failed" && error) {
    new Toastify({
      text: `Error fetching data: ${error}`,
      backgroundColor: "#FF0000",
      className: "error-toast",
    }).showToast();
    return null;
  }

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof (typeof bookingStatuses)[0]) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
  };

  const filteredBookingStatuses = bookingStatuses
    .filter((status) =>
      status.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => (sortOrder === "asc" ? a.id - b.id : b.id - a.id));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookingStatuses = filteredBookingStatuses.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const onDelete = async (id: number) => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`/api/v1/bookingstatus/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Remove deleted status from state
      dispatch(
        setBookingStatuses(bookingStatuses.filter((status) => status.id !== id))
      );

      new Toastify({
        text: "Booking status deleted successfully!",
        duration: 3000,
        backgroundColor: "#4CAF50",
        stopOnFocus: true,
      }).showToast();
    } catch (err) {
      const errorMessage =
        (err as Error).message || "An unknown error occurred";
    }
  };

  return (
    <div className="container mx-auto px-4">
      <br />
      <br />
      <br />
      <br />
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border rounded"
        />
        <div className="flex space-x-2">
          <button
            onClick={() => router.push("/authorize/bookingstatus/new")}
            className="btn btn-primary"
          >
            Add Booking Status
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBookingStatuses.map((status) => (
          <BookingStatusCard
            key={status.id}
            bookingStatus={status}
            onDelete={onDelete}
          />
        ))}
      </div>
      <br />
      <br />
      <Link
        href={"/authorize/bookingstatus/new"}
        className="btn bg-blue-950 text-white py-2 px-4 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
      >
        Add Status
      </Link>
      <br />
      <br />
      <br />
      <br />

      <Pagination
        itemsPerPage={itemsPerPage}
        totalItems={filteredBookingStatuses.length}
        currentPage={currentPage}
        paginate={(pageNumber: number) => setCurrentPage(pageNumber)}
      />
    </div>
  );
};

export default BookingStatusList;
