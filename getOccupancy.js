import axios from "axios";
import moment from "moment";
import convert from "xml-js";

export default async (req, res) => {
	try {
		const today = moment().format("YYYY-MM-DD");
		const monthFromToday = moment()
			.add(8, "month")
			.format("YYYY-MM-DD");
		const response = await axios.get(
			`https://api.roomercloud.net/services/bookingapi/availability1?hotel=LAKI&channelCode=BDC&channelManagerCode=OWN&arrivalDate=${today}&departureDate=${monthFromToday}`
		);
		const result = convert.xml2js(response.data, {
			compact: true,
			spaces: 4
		});
		const month = result.availability.inventory.inventoryItem.map(e => {
			const availabilityToOccupancy = (baseCode, availability) => {
				let occupancy = 0;
				if (baseCode.includes("DSUP")) occupancy = 20 - availability;
				if (baseCode.includes("QUE")) occupancy = 9 - availability;
				if (baseCode.includes("TWDB")) occupancy = 27 - availability;
				if (baseCode.includes("SUI")) occupancy = 1 - availability;
				if (baseCode.includes("DBL")) occupancy = 39 - availability;
				if (baseCode.includes("ECO")) occupancy = 24 - availability;

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
			}, []);
		return total;
	} catch (error) {
		return null;
	}
};
