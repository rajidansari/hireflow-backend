import crypto from "crypto";

function generateOtp() {
	const otp = crypto.randomInt(100000, 999999);

	return otp;
}

export { generateOtp }