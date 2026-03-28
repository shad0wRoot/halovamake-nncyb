export default function (key: string): string {
   if (!process.env[key]) {
      console.error(
         `Env variable '${key}' was not found and is required, exitting...`
      );
      process.exit(1);
   }
   return process.env[key]!;
}
