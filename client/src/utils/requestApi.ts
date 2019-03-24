export default async function requestApi(endpoint: string, params: any) {
	let fetched: Response;
	try {
		fetched = await fetch(`${endpoint}`, {
			method: 'POST',
			body: JSON.stringify(params),
			headers: { 'Content-Type': 'application/json' }
		});
	}
	catch (err) {
		throw new NetworkError('network error is occurred', err);
	}

	let res: any;
	try {
		res = await fetched.json();
	}
	catch (err) {
		throw new ApiResponseError('failed to parse json of response');
	}

	if (res.result || res.error) {
		return res;
	}

	throw new ApiResponseError('unknown response');
}

export class NetworkError extends Error {
	innerError: Error | undefined;

	constructor()
	constructor(message: string)
	constructor(message: string, innerError: Error)
	constructor(message?: string, innerError?: Error) {
		super(message);
		innerError = innerError;
	}
}

export class ApiResponseError extends Error {
	innerError: Error | undefined;

	constructor()
	constructor(message: string)
	constructor(message: string, innerError: Error)
	constructor(message?: string, innerError?: Error) {
		super(message);
		innerError = innerError;
	}
}
