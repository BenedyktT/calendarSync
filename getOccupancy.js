import axios from "axios";
import moment from "moment";
import convert from "xml-js";

const getOutofOrder = async startDate => {
	const stayFrom = moment(startDate)
		.subtract(1, "month")
		.format("YYYY-MM-DD");
	const stayTo = moment(stayFrom)
		.add(2, "month")
		.format("YYYY-MM-DD");
	try {
		const response = await axios.get(
			`services/bookingapi/reservations?stayFromDate=${startDate}&stayToDate=${stayTo}&includeOutOfOrder=true&includeInvoices=false&modifiedSince=${moment().format(
				"YYYY-MM-DDTHH:mm:ss"
			)}`
		);
		const result = response.data.reservations.map(e => ({
			rooms: e.rooms.length,
			startDate: e.rooms[0].dateArrival,
			endDate: e.rooms[0].dateDeparture,
			room: e.rooms[0].roomNumber
		}));
		return result;
	} catch (error) {
		console.error(error);
		return;
	}
};

export default async (req, res) => {
	try {
		const today = moment().format("YYYY-MM-DD");
		const monthFromToday = moment()
			.add(8, "month")
			.format("YYYY-MM-DD");
		const outOfOrder = await getOutofOrder(today);

		const response = await axios.get(
			`https://api.roomercloud.net/services/bookingapi/availability1?hotel=LAKI&channelCode=TRAVEL&channelManagerCode=OWN&arrivalDate=${today}&departureDate=${monthFromToday}`
		);
		const result = convert.xml2js(response.data, {
			compact: true,
			spaces: 4
		});
		const month = result.availability.inventory.inventoryItem.map(e => {
			const availabilityToOccupancy = (baseCode, availability) => {
				let occupancy = 0;
				if (baseCode === "SUP-S") occupancy = 1 - availability;
				if (baseCode === "DBL-S") occupancy = 39 - availability;
				if (baseCode === "ECO-S") occupancy = 24 - availability;

				return occupancy;
			};
			const baseCode = e._attributes.availabilityBaseCode;
			return {
				baseCode,
				description: e._attributes.description,
				inventoryCode: e._attributes.inventoryCode,
				availability: e.availabilityAndRates.day.map(x => ({
					date: x._attributes.date,
					availability: x._attributes.availability,
					rate: x._attributes.rate,
					occupancy: availabilityToOccupancy(
						baseCode,
						parseInt(x._attributes.availability)
					)
				}))
			};
		});
		let total = month
			.map(category =>
				category.availability.map(x => ({
					...x,
					baseCode: category.baseCode
				}))
			)
			.reduce((acc, curr) => [...acc, ...curr], [])
			.reduce((acc, curr) => {
				const x = acc.find(
					e => e.baseCode === curr.baseCode && e.date === curr.date
				);
				if (!x) {
					return [...acc, curr];
				}
				return acc;
			}, [])
			.reduce((acc, curr, i, arr) => {
				const x = arr.filter(e => e.date === curr.date);
				const y = acc.find(y => y.date === curr.date);
				if (!y) {
					return [
						...acc,
						x.reduce(
							(a, c) => {
								return {
									...a,
									date: c.date,
									rate: (a.rate =
										parseInt(a.rate) < parseInt(c.rate) && parseInt(a.rate) > 0
											? a.rate
											: c.rate),
									occupancy: c.occupancy + a.occupancy
								};
							},
							{ rate: 0, occupancy: 0 }
						)
					];
				} else return acc;
			}, [])
			.reduce((acc, curr) => {
				const findDate = outOfOrder.filter(e => {
					return (
						moment(curr.date).isSameOrAfter(e.startDate) &&
						moment(curr.date).isBefore(e.endDate)
					);
				});

				if (findDate.length) {
					const totalOccupancy = findDate.reduce(
						(acc, curr) => (acc += curr.rooms),
						0
					);
					return [
						...acc,
						{ ...curr, occupancy: curr.occupancy - totalOccupancy }
					];
				}

				return [...acc, curr];
			}, []);

		return total;
	} catch (error) {
		console.error(error);
		return error;
	}
};
