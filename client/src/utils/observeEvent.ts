import api from './requestApi';

interface Event {
	type: string;
}

interface ThemeDeletedEvent extends Event {
	type: 'delete.theme';
	themeId: string;
}

const isThemeDeletedEvent = (e: Event): e is ThemeDeletedEvent => e.type == 'delete.theme';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export default async function observeEvent() {
	let newerCursor: string | null = null;
	async function fetchEvents() {
		const events: Event[] = [];
		while (true) {
			const res = await api('/event/list', {
				newerCursor: newerCursor
			});
			if (res.error) {
				throw new Error(res.error.reason);
			}
			newerCursor = res.result.newerCursor;
			const partalEvents: Event[] = res.result.collection;
			partalEvents.reverse();
			events.push(...partalEvents);
			if (partalEvents.length < 10) {
				break;
			}
		}

		return events;
	}

	await fetchEvents();
	while (1) {
		await delay(5000);
		for (const event of await fetchEvents()) {
			if (isThemeDeletedEvent(event)) {
				console.log('theme deleted:', event.themeId);
			}
			else {
				console.log('unknown event:', event);
			}
		}
	}
}
