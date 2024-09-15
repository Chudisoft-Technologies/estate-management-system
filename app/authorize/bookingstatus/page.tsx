"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import { setBookingStatuses } from "@/app/store/bookingStatusSlice"; // Correct import of named action creator
import BookingStatusCard from "./BookingStatusCard";
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import dynamic from "next/dynamic";
import jsPDF from "jspdf";
import "jspdf-autotable";
import Toastify from "toastify-js";
import "toastify-js/src/toastify.css";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Dynamically import CSVLink to avoid SSR issues
const CSVLink = dynamic(() => import("react-csv").then((mod) => mod.CSVLink), {
  ssr: false,
});

const BookingStatusList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { bookingStatuses, status, error } = useSelector(
    (state: RootState) => state.bookingStatuses
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [csvData, setCsvData] = useState<any[]>([]);
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

        // Update local state
        setCsvData(data.data);

        // Update Redux slice
        dispatch(setBookingStatuses(data.data)); // Correct usage of action creator
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
    return null; // Or a loading spinner
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
    // Sort logic based on column and order
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

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.autoTable({
      head: [["ID", "Status", "Active", "Created At", "Updated At"]],
      body: bookingStatuses.map((status) => [
        status.id,
        status.status,
        status.active ? "Yes" : "No",
        status.createdAt.toISOString(),
        status.updatedAt.toISOString(),
      ]),
    });
    doc.save("booking_statuses.pdf");
  };

  const exportToExcel = () => {
    const csvData = bookingStatuses.map((status) => ({
      ID: status.id,
      Status: status.status,
      Active: status.active ? "Yes" : "No",
      CreatedAt: status.createdAt.toISOString(),
      UpdatedAt: status.updatedAt.toISOString(),
    }));

    const csvRows = [
      Object.keys(csvData[0]).join(","), // headers
      ...csvData.map((row) => Object.values(row).join(",")), // rows
    ];

    const csvBlob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8;",
    });
    saveAs(csvBlob, "booking_statuses.csv");
  };

  const onEdit = (id: number) => {
    // Handle edit logic
  };

  const onDelete = (id: number) => {
    // Handle delete logic
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-2 border rounded"
        />
        <div className="flex space-x-2">
          {csvData.length > 0 && (
            <CSVLink
              data={csvData}
              filename={"booking_statuses.csv"}
              className="btn btn-primary"
            >
              Export to CSV
            </CSVLink>
          )}
          <button onClick={exportToPDF} className="btn btn-primary">
            Export to PDF
          </button>
          <button onClick={exportToExcel} className="btn btn-primary">
            Export to Excel
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentBookingStatuses.map((status) => (
          <BookingStatusCard
            key={status.id}
            bookingStatus={status}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
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
