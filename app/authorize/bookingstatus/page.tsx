"use client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBookingStatuses } from "../../store/bookingStatusSlice"; // Ensure you have this slice
import { AppDispatch, RootState } from "../../store";
import BookingStatusCard from "./BookingStatusCard"; // Ensure you have this component
import Pagination from "../../Pagination";
import { saveAs } from "file-saver";
import { CSVLink } from "react-csv";
import jsPDF from "jspdf";
import "jspdf-autotable";

declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

const BookingStatusList: React.FC = () => {
  const dispatch: AppDispatch = useDispatch();
  const { bookingStatuses, status, error } = useSelector(
    (state: RootState) => state.bookingStatuses
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    dispatch(fetchBookingStatuses());
  }, [dispatch]);

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

  const handleSort = (column: keyof (typeof bookingStatuses)[0]) => {
    const order = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(order);
    // Sort logic based on column and order
  };

  const filteredBookingStatuses = bookingStatuses
    .filter(
      (status) => status.status.toLowerCase().includes(searchTerm.toLowerCase()) // Use status.status for filtering
    )
    .sort(
      (a, b) =>
        sortOrder === "asc"
          ? a.id - b.id // Numeric comparison for ascending order
          : b.id - a.id // Numeric comparison for descending order
    );

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
          <CSVLink
            data={bookingStatuses}
            filename={"booking_statuses.csv"}
            className="btn btn-primary"
          >
            Export to CSV
          </CSVLink>
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
