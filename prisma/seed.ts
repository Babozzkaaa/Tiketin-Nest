// import { PrismaClient } from '@prisma/client';
// const prisma = new PrismaClient();

// async function main() {
//   // 1. STATIONS
//   const station1 = await prisma.station.create({
//     data: { name: 'Stasiun Gambir', code: 'GMR' },
//   });

//   const station2 = await prisma.station.create({
//     data: { name: 'Stasiun Yogyakarta', code: 'YK' },
//   });

//   // 2. TRAIN
//   const train = await prisma.train.create({
//     data: { name: 'Taksaka', code: 'TK123', type: 'Eksekutif' },
//   });

//   // 3. CARRIAGES
//   const carriage1 = await prisma.carriage.create({
//     data: { train_id: train.id, number: 1, type: 'Eksekutif' },
//   });

//   const carriage2 = await prisma.carriage.create({
//     data: { train_id: train.id, number: 2, type: 'Bisnis' },
//   });

//   // 4. SEATS (for carriage1 only)
//   const seats = Array.from({ length: 20 }).map((_, i) => ({
//     carriage_id: carriage1.id,
//     seat_number: `A${i + 1}`,
//   }));
//   await prisma.seat.createMany({ data: seats });

//   // 5. SCHEDULE
//   await prisma.schedule.create({
//     data: {
//       train_id: train.id,
//       departure_station_id: station1.id,
//       arrival_station_id: station2.id,
//       departure_time: new Date('2025-06-15T08:00:00Z'),
//       arrival_time: new Date('2025-06-15T13:30:00Z'),
//       price: 350000.0,
//     },
//   });
// }

// main()
//   .then(() => console.log('✅ Initial data seeding complete.'))
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => await prisma.$disconnect());
