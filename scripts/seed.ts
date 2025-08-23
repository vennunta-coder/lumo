#!/usr/bin/env ts-node
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const password = '$2a$10$Y/2k2W8oP7YxY8m1a9o7UeQq7L0uF6V0Q5xK3z8kZ2zYF7v6mO6tC'; // hash "password"
  const user = await prisma.user.upsert({ where: { username: 'demo' }, update: {}, create: { username: 'demo', password } });
  await prisma.video.createMany({ data: [
    { url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', caption: 'Hello world', userId: user.id },
    { url: 'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4', caption: 'Segundo clip', userId: user.id }
  ]});
  console.log('Seed concluído');
}
main().finally(()=>prisma.$disconnect());
