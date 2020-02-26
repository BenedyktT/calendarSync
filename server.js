import "./config";
import express from "express";
import schedule from "node-schedule";
import calendarSync from "./calendarSync";
import wakeUp from "./wakeUp";

const PORT = process.env.PORT || 5000;
const app = express();
app.get("/", (req, res) => {
	res.send("Api working");
});
app.listen(PORT, () => {
	wakeUp({
		url: "http://sync-kitchen.herokuapp.com/", // url string
		interval: 60000 * 25 // interval in milliseconds (1 minute in this example)
	}).start();
	schedule.scheduleJob("* */6 * * *", async () => {
		console.log("done");
		await calendarSync();
	});
});
