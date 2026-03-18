import type { Component } from 'svelte';
import {
	Bot,
	EthernetPort,
	Gauge,
	Globe,
	Layers,
	Route,
	Settings,
	Truck,
	Users,
	type IconProps
} from '@lucide/svelte';

type IconComponent = Component<IconProps, Record<string, never>, ''>;

type Routes = {
	title: string;
	titleKey: string;
	url: string;
	icon: IconComponent;
	adminOnly?: boolean;
	subItems?: Routes[];
};

export const mainRoutes: Routes[] = [
	{ title: 'Dashboard', titleKey: 'nav.dashboard', url: '/', icon: Gauge },
	{ title: 'Router', titleKey: 'nav.routers', url: '/router/', icon: Route },
	{ title: 'Middlewares', titleKey: 'nav.middlewares', url: '/middlewares/', icon: Layers },
	{ title: 'Entry Points', titleKey: 'nav.entrypoints', url: '/entrypoints/', icon: EthernetPort },
	{ title: 'Server Transports', titleKey: 'nav.transports', url: '/transport/', icon: Truck }
];
export const adminRoutes: Routes[] = [
	{ title: 'Users', titleKey: 'nav.users', url: '/users/', icon: Users },
	{ title: 'Agents', titleKey: 'nav.agents', url: '/agents/', icon: Bot },
	{ title: 'DNS', titleKey: 'nav.dns', url: '/dns/', icon: Globe },
	{ title: 'Settings', titleKey: 'nav.settings', url: '/settings/', icon: Settings }
];
export const SiteRoutes = [...mainRoutes, ...adminRoutes];
