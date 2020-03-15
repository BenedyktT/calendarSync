import "./config";
import express from "express";
import schedule from "node-schedule";
import calendarSync from "./calendarSync";
import wakeUp from "./wakeUp";
import apiAuth from "./apiAuth";

const PORT = process.env.PORT || 5000;
const app = express();
app.get("/", (req, res) => {
	return res.send("api working");
});
app.listen(PORT, () => {
	
	schedule.scheduleJob("00 */10 * * * *", async () => {
		console.log("done");
		await calendarSync();
	});
});
