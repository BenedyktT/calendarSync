import { google } from "googleapis";
import { credentials } from "./credentials";
export default async () => {
	try {
		let jwtClient = new google.auth.JWT(
			credentials.client_email,
			null,
			credentials.private_key,
			["https://www.googleapis.com/auth/calendar"]
		);
		//authenticate request
		jwtClient.authorize(function(err, tokens) {
			if (err) {
				console.log(err);
				return;
			} else {
				console.log("Successfully connected!");
			}
		});
		google.options({
			params: {
				quotaUser: "info.hotellaki@gmail.com"
			}
		});
		let calendar = google.calendar({ version: "v3", auth: jwtClient });
		return calendar;
	} catch (error) {
		return error;
	}
};
