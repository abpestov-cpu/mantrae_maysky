<script lang="ts">
	import { locale } from 'svelte-i18n';
	import { Languages } from '@lucide/svelte';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';

	const languages = [
		{ code: 'en', label: 'English' },
		{ code: 'ru', label: 'Русский' }
	];
</script>

<DropdownMenu.Root>
	<DropdownMenu.Trigger>
		<button class="inline-flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent">
			<Languages class="h-4 w-4" />
			<span class="text-xs">{languages.find((l) => l.code === $locale)?.label ?? 'English'}</span>
		</button>
	</DropdownMenu.Trigger>
	<DropdownMenu.Content align="end">
		{#each languages as lang (lang.code)}
			<DropdownMenu.Item
				onSelect={() => locale.set(lang.code)}
				class={$locale === lang.code ? 'bg-accent' : ''}
			>
				{lang.label}
			</DropdownMenu.Item>
		{/each}
	</DropdownMenu.Content>
</DropdownMenu.Root>
