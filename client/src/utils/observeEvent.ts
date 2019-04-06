import $ from 'cafy';
import api from './requestApi';
import { themeModule } from '../store';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

interface Event {
	type: string;
}

interface ThemeAddedEvent extends Event {
	type: 'add.theme';
	themeId: string;
}
function isThemeAddedEvent(e: Event): e is ThemeAddedEvent {
	return e.type == 'add.theme' && $.string.ok((e as ThemeAddedEvent).themeId);
}

interface ThemeUpdatedEvent extends Event {
	type: 'update.theme';
	themeId: string;
}
function isThemeUpdatedEvent(e: Event): e is ThemeUpdatedEvent {
	return e.type == 'update.theme' && $.string.ok((e as ThemeUpdatedEvent).themeId);
}

interface ThemeDeletedEvent extends Event {
	type: 'delete.theme';
	themeId: string;
}
function isThemeDeletedEvent(e: Event): e is ThemeDeletedEvent {
	return e.type == 'delete.theme' && $.string.ok((e as ThemeDeletedEvent).themeId);
}

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
			const partialEvents: Event[] = res.result.collection;
			partialEvents.reverse();
			events.push(...partialEvents);
			if (partialEvents.length < 10) {
				break;
			}
		}

		return events;
	}

	await fetchEvents();
	while (true) {
		await delay(5000);
		for (const event of await fetchEvents()) {
			if (isThemeAddedEvent(event)) {
				const res = await api('/theme/get', {
					themeId: event.themeId
				});
				if (res.result) {
					console.log('theme added:', res.result);
					themeModule.addThemeState({ theme: res.result });
				}
			}
			else if (isThemeUpdatedEvent(event)) {
				console.log('theme updated:', event.themeId);
			}
			else if (isThemeDeletedEvent(event)) {
				console.log('theme deleted:', event.themeId);
				themeModule.deleteThemeState({ themeId: event.themeId });
			}
			else {
				console.log('unknown event:', event);
			}
		}
	}
}
