import axios from "axios";
import moment from "moment";
export default async (req, res) => {
	const stayFrom = moment().format("YYYY-MM-DD");
	const stayTo = moment(stayFrom)
		.add(1, "day")
		.format("YYYY-MM-DD");

	const response = await axios.get(
		`services/bookingapi/reservations?stayFromDate=${stayFrom}&stayToDate=${stayTo}&includeOutOfOrder=false&includeInvoices=false&modifiedSince=${moment().format(
			"YYYY-MM-DDTHH:mm:ss"
		)}`
	);
	const test = response.data.reservations.reduce((acc, curr) => {
		return !curr.outOfOrder
			? [
					...acc,
					{
						adults: curr.rooms.reduce((acc, c) => (acc += c.adults), 0),
						rooms: curr.rooms.length,
						date: curr.rooms.reduce(
							(a, b) => (a = { dep: b.dateDeparture, arr: b.dateArrival }),
							{}
						)
					}
			  ]
			: acc;
	}, []);
	return res.json(test);
};
