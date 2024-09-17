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
    const building = await prisma.building.findUnique({
      where: { id },
    });

    if (building) {
      return NextResponse.json(building);
    } else {
      return NextResponse.json(
        { message: "Building not found" },
        { status: 404 }
      );
    }
  } catch (error) {
    const errorMessage =
      (error as Error).message || "Error retrieving building";
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
    const updatedBuilding = await prisma.building.update({
      where: { id },
      data,
    });

    return NextResponse.json(updatedBuilding);
  } catch (error) {
    const errorMessage = (error as Error).message || "Error updating building";
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
