import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	host: "email.stefna.is",
	port: 465,
	secure: true,
	auth: {
		user: `${process.env.EMAIL_LOGIN}`,
		pass: `${process.env.EMAIL_PASSWORD}`
	}
});

export default changes => {
	const text = (changes && changes.length) || "no";
	const html = `
	<p>Hey Friend,</p>
	
   <p>This email is send to let you know about update of our kitchen calendar</p>
   <p>Now this email will come just 1-2 times per day while the calendar is updating every 24 minutes
   <p>There were ${text} updates</p>
	${changes.length &&
		changes.map(
			e =>
				`<div><p>At ${e.date}:   from: ${e.from} rooms  to: ${e.to} rooms</p></div>`
		)}`;

	const template = {
		from: process.env.EMAIL_LOGIN,
		to: "hotellaki@hotellaki.is",
		subject: "Calendar Update",
		html
	};
	transporter.sendMail(template, (err, info) => {
		if (err) {
			res.status(500).json(err);
			return;
		}

		console.log(info);
	});
};
