// "use client"; // This is a client component 👈🏽
import Email from "./Email.client"
import { listInbox, ListInboxResponse } from '@email-app/email'
import dataConnect from "@/data-connect";

export default async function Home() {
	// Change the uid value to see emails from different users
	// Stay tuned for an update that will combine Data Connect with
	// Firebase Auth!
	// uids from the data seed: user_david, user_tyler, user_bleigh, user_jeanine
	const uid = "user_tyler"
	// This is the URL needed to configure the reverse proxy so that all requests
	// are sent through the Vite dev server and we can avoid CORS issues from the local
	// Data Connect emulator server. If this code is being executed on the
	// server we only need localhost.
	const host = process.env.WEB_HOST!
	const dc = dataConnect('localhost');
	let emails: ListInboxResponse['emails']  = [];
	try {
		const { data } = await listInbox(dc, { uid })
		emails = data.emails
	} catch(e) {
		console.error(e)
	}

	if(emails.length === 0) {
		emails.push({
			id: "fake-email-id",
			subject: "Run the Data Connect Emulator to get started",
			date: new Date().toLocaleDateString(),
			content: `
					<p class="mb-4">
						Run the Data Connect Emulator in Firebase Extension and seed the database with the example GQL files.
					</p>
					
					<p class="mb-4">
						To run the emulator, follow these steps:
					</p>

					<ol class="list-decimal ml-8 mb-4">
						<li>Click the Firebase Extension to the left.</li>
						<li>Click the Start Emulator button.</li>
						<li>Open the dataconnect folder and run the insert scripts in the following order: <code>User_insert.gql</code>, <code>Email_insert.gql</code>, <code>EmailMeta_insert.gql</code>, and <code>Recipient_insert.gql.</code></li>
					</ol>

					<p class="mb-4">
						Once the emulator is running, you should be able to see your emails in this app.
					</p>
			`,
			sender: {
					name: "Welcome!",
					email: "welcome@example.com",
					uid: "fdc-uid",
			},
			to: [
				{
					user: {
						name: "Data Connect",
						email: "data-connect@example.com",
						uid: "fdc-uid",
					},
				}
			],
		})
	}

	const firstEmail = emails.at(0)!;

	return (
		<Email 
			initialEmails={emails}
			firstEmail={firstEmail}
			uid={uid}
			host={host}
		 />
	);
}
