import "./config";
import express from "express";
import schedule from "node-schedule";
import calendarSync from "./calendarSync";

const PORT = process.env.PORT || 5000;
const app = express();
app.get("/", calendarSync);
app.listen(PORT, () => {
	schedule.scheduleJob("24 * * * *", async () => {
		console.log("done");
		await calendarSync();
	});
});
