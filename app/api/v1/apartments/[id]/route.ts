import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authenticate } from "../../auth/auth"; // Adjust the path as necessary

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  // Extract ID from params
  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const apartment = await prisma.apartment.findUnique({
      where: { id },
    });

    if (apartment) {
      return NextResponse.json(apartment);
    } else {
      return NextResponse.json(
        { message: "Apartment not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Error retrieving apartment";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const token = await authenticate(request);

  const id = parseInt(params.id);

  if (isNaN(id)) {
    return NextResponse.json({ message: "Invalid ID" }, { status: 400 });
  }

  try {
    const data = await request.json();
    const updatedApartment = await prisma.apartment.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedApartment);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error updating apartment";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
