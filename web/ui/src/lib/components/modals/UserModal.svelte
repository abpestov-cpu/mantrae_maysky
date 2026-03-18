<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { type User } from '$lib/gen/mantrae/v1/user_pb';
	import PasswordInput from '../ui/password-input/password-input.svelte';
	import Separator from '../ui/separator/separator.svelte';
	import { user } from '$lib/api/users.svelte';
	import { _ } from 'svelte-i18n';

	interface Props {
		data?: User;
		open?: boolean;
	}
	let { data, open = $bindable(false) }: Props = $props();

	let password = $state('');
	let userData = $state({} as User);
	$effect(() => {
		if (data) userData = { ...data };
	});
	$effect(() => {
		if (!open) {
			userData = {} as User;
			password = '';
		}
	});

	const createMutation = user.create();
	const updateMutation = user.update();
	function onsubmit() {
		if (userData.id) {
			if (password) {
				updateMutation.mutate({ ...userData, password });
			} else {
				updateMutation.mutate({ ...userData });
			}
		} else {
			createMutation.mutate({ ...userData, password });
		}
		open = false;
	}
</script>

<Dialog.Root bind:open>
	<Dialog.Content class="no-scrollbar max-h-[95vh] w-100 overflow-y-auto">
		<Dialog.Header>
			<Dialog.Title>
				{userData?.id ? $_('common.edit') : $_('common.create')} {$_('nav.users')}
			</Dialog.Title>
			<Dialog.Description>{$_('userModal.description')}</Dialog.Description>
		</Dialog.Header>

		<form {onsubmit} class="space-y-6">
			<div class="space-y-4">
				<div class="space-y-2">
					<Label for="username" class="flex items-center gap-2 text-sm font-medium">{$_('userModal.username')}</Label>
					<Input
						id="username"
						bind:value={userData.username}
						placeholder={$_('userModal.usernamePlaceholder')}
						required
						class="transition-colors"
					/>
					<p class="text-xs text-muted-foreground">{$_('userModal.usernameHelp')}</p>
				</div>

				<div class="space-y-2">
					<Label for="email" class="flex items-center gap-2 text-sm font-medium">{$_('userModal.email')}</Label>
					<Input
						id="email"
						type="email"
						bind:value={userData.email}
						placeholder={$_('userModal.emailPlaceholder')}
						class="transition-colors"
					/>
					<p class="text-xs text-muted-foreground">
						{$_('userModal.emailHelp')}
					</p>
				</div>

				<div class="space-y-2">
					{#if userData.id}
						<Label for="password" class="text-sm font-normal text-muted-foreground">{$_('userModal.password')}</Label>
						<PasswordInput id="password" bind:value={password} />
						<p class="text-xs text-muted-foreground">
							{$_('userModal.passwordChangeHint')}
						</p>
					{:else}
						<Label for="password" class="text-sm font-normal text-muted-foreground">{$_('userModal.password')}</Label>
						<PasswordInput id="password" bind:value={password} required />
						<p class="text-xs text-muted-foreground">{$_('userModal.passwordHelp')}</p>
					{/if}
				</div>
			</div>

			<Separator />

			<Button type="submit" class="w-full">{userData.id ? $_('common.update') : $_('common.create')}</Button>
		</form>
	</Dialog.Content>
</Dialog.Root>
