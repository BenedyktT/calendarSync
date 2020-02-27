import { totp } from "otplib";
import atob from "atob";
import axios from "axios";
const secret = process.env.API_secret;

axios.defaults.baseURL = "https://api.roomercloud.net";
axios.defaults.headers.common["Promoir-Roomer-Hotel-ApplicationId"] = "HKLAKI";
axios.defaults.headers.common["Promoir-Roomer-Hotel-Identifier"] = "2b72a454";
totp.options = {
	digits: 8,
	algorithm: "sha256",
	encoding: "hex"
};

export default function() {
	const token = totp.generate(atob(secret));
	axios.defaults.headers.common["Promoir-Roomer-Hotel-Secret"] = token;
}
