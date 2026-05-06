import * as z from "zod";

const registerSchema = z.object({
	fullname: z.string().min(3, { error: "Fullname must be atleast 3 characters long" }),
	email: z.email({error: "Not a valid email"}),
	password: z.string().min(8, {error: "Password should be atleast 8 characters long"}),
	role: z.enum(["candidate", "employer"], {error: "Role must be from Candidate or Employer"}),
});

export { registerSchema }