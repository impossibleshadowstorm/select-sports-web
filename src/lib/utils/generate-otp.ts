// import { randomBytes } from "jose";

// export function generateOTP(): string {
//   // Generate 4 bytes of random data using jose's randomBytes
//   const randomData = randomBytes(4);
  
//   // Convert random bytes to an unsigned 32-bit integer
//   const randomNumber = (randomData[0] << 24) | (randomData[1] << 16) | (randomData[2] << 8) | randomData[3];

//   // Generate a 6-digit OTP
//   return ((Math.abs(randomNumber) % 900000) + 100000).toString();
// }


export function generateOTP(): string {
  // return "909090"
  const array = new Uint32Array(1);
  crypto.getRandomValues(array);
  return ((array[0] % 900000) + 100000).toString(); // Generates a 6-digit OTP
}
