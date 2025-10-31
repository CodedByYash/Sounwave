import prisma from '@repo/db';

export const roomCodeGenerator = async (length: number): Promise<string> => {
  const string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = string.length;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += string.charAt(Math.floor(Math.random() * charactersLength));
  }

  const finalResult = await uniqnessChecker(result);
  return finalResult ? result : roomCodeGenerator(6);
};

const uniqnessChecker = async (roomCode: string): Promise<boolean> => {
  const existingRoom = await prisma.room.findFirst({
    where: { code: roomCode },
  });
  return !existingRoom;
};
