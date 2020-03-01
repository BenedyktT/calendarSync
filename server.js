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
	wakeUp({
		url: "http://blooming-tundra-68800.herokuapp.com/", // url string
		interval: 60000 * 25,
		startNap: [21, 30, 21, 12], // the time to start nap in UTC, as [h, m, s, ms] (05:00 UTC in this example)
		endNap: [9, 23, 59, 999] // interval in milliseconds (1 minute in this example)
	}).start();
	schedule.scheduleJob("0 */1 * * *", async () => {
		console.log("done");
		await calendarSync();
	});
});
