const validateEnv = (requiredVariables) => {
  const missingVariables = requiredVariables.filter(
    (variable) => !process.env[variable]
  );

  if (missingVariables.length > 0) {
    console.error("\nMissing required environment variables:");

    missingVariables.forEach((variable) => {
      console.error(`   - ${variable}`);
    });

    console.error("\nPlease check your environment configuration.\n");

    process.exit(1);
  }

  console.log("Environment variables validated successfully.");
};

export default validateEnv;