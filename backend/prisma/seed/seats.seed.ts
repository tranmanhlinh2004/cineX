import { prisma } from "./client";

const rowNames = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function getSeatTypeName(rowIndex: number, totalRows: number) {
  if (rowIndex === totalRows - 1) {
    return "COUPLE";
  }

  if (rowIndex >= Math.floor(totalRows * 0.6)) {
    return "VIP";
  }

  return "NORMAL";
}

export async function seedSeats() {
  const seatTypes = await prisma.seatType.findMany();
  const seatTypeByName = new Map(seatTypes.map((seatType) => [seatType.name, seatType.id]));

  for (const requiredType of ["NORMAL", "VIP", "COUPLE"]) {
    if (!seatTypeByName.has(requiredType)) {
      throw new Error(`Seat type ${requiredType} does not exist`);
    }
  }

  const rooms = await prisma.room.findMany({
    where: {
      status: "ACTIVE",
    },
    orderBy: [{ cinemaId: "asc" }, { name: "asc" }],
  });

  let seededSeats = 0;

  for (const room of rooms) {
    for (let rowIndex = 0; rowIndex < room.totalRows; rowIndex += 1) {
      const rowName = rowNames[rowIndex];

      if (!rowName) {
        throw new Error(`Room ${room.name} has too many rows for seed labels`);
      }

      const seatTypeName = getSeatTypeName(rowIndex, room.totalRows);
      const seatTypeId = seatTypeByName.get(seatTypeName);

      if (!seatTypeId) {
        throw new Error(`Seat type ${seatTypeName} does not exist`);
      }

      for (let number = 1; number <= room.totalColumns; number += 1) {
        const seatCode = `${rowName}${number}`;

        await prisma.seat.upsert({
          where: {
            roomId_seatCode: {
              roomId: room.id,
              seatCode,
            },
          },
          update: {
            seatTypeId,
            rowName,
            seatNumber: number,
            status: "ACTIVE",
          },
          create: {
            roomId: room.id,
            seatTypeId,
            seatCode,
            rowName,
            seatNumber: number,
            status: "ACTIVE",
          },
        });

        seededSeats += 1;
      }
    }
  }

  console.log(`Seed seats thanh cong (${seededSeats} ghe)`);
}
