import type { LayoutServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: LayoutServerLoad = async ({ url, fetch }) => {
	const pathname = url.pathname;
	
	// Skip auth check for login and setup pages
	if (pathname === '/login' || pathname === '/setup') {
		return {};
	}

	// For other pages, we'll handle auth check client-side
	return {};
};
