<script lang="ts">
	import DataTable from '$lib/components/tables/DataTable.svelte';
	import TableActions from '$lib/components/tables/TableActions.svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import { Pencil, Trash, Users } from '@lucide/svelte';
	import UserModal from '$lib/components/modals/UserModal.svelte';
	import { renderComponent } from '$lib/components/ui/data-table';
	import { toast } from 'svelte-sonner';
	import type { User } from '$lib/gen/mantrae/v1/user_pb';
	import { ConnectError } from '@connectrpc/connect';
	import type { BulkAction } from '$lib/components/tables/types';
	import ColumnBadge from '$lib/components/tables/ColumnBadge.svelte';
	import { formatTs } from '$lib/utils';
	import { user } from '$lib/api/users.svelte';
	import { get } from 'svelte/store';
	import { _ } from 'svelte-i18n';

	let data = $state({} as User);
	let open = $state(false);

	const userList = user.list();
	const deleteUser = user.delete();

	const columns: ColumnDef<User>[] = [
		{
			header: get(_)('users.username'),
			accessorKey: 'username',
			enableSorting: true
		},
		{
			header: get(_)('users.email'),
			accessorKey: 'email',
			enableSorting: true,
			cell: ({ row }) => {
				return renderComponent(ColumnBadge, { label: row.original.email || 'None' });
			}
		},
		{
			header: get(_)('users.lastLogin'),
			accessorKey: 'lastLogin',
			enableSorting: true,
			enableGlobalFilter: false,
			cell: ({ row }) => {
				if (row.original.lastLogin === undefined) {
					return renderComponent(ColumnBadge, { label: 'Never' });
				}
				return formatTs(row.original.lastLogin, 'relative');
			}
		},
		{
			id: 'actions',
			enableHiding: false,
			enableGlobalFilter: false,
			cell: ({ row }) => {
				return renderComponent(TableActions, {
					actions: [
						{
							type: 'button',
							label: get(_)('users.editUser'),
							icon: Pencil,
							onClick: () => {
								data = row.original;
								open = true;
							}
						},
						{
							type: 'popover',
							label: get(_)('users.deleteUser'),
							icon: Trash,
							classProps: 'text-destructive',
							onClick: () => deleteUser.mutate({ id: row.original.id }),
							popover: {
								title: get(_)('users.deleteUser') + '?',
								description: get(_)('common.permanentDelete', { values: { item: get(_)('users.username') } }),
								confirmLabel: get(_)('common.delete'),
								cancelLabel: get(_)('common.cancel')
							}
						}
					]
				});
			}
		}
	];

	const bulkActions: BulkAction<User>[] = [
		{
			type: 'button',
			label: get(_)('common.delete'),
			icon: Trash,
			variant: 'destructive',
			onClick: bulkDelete
		}
	];

	async function bulkDelete(rows: User[]) {
		const t = get(_);
		try {
			const confirmed = confirm(t('common.confirmDelete', { values: { count: rows.length, items: t('nav.users') } }));
			if (!confirmed) return;

			for (const row of rows) {
				deleteUser.mutate({ id: row.id });
			}
			toast.success(`Successfully deleted ${rows.length} Users`);
		} catch (err) {
			const e = ConnectError.from(err);
			toast.error(t('common.failedAction', { values: { action: t('common.delete'), items: t('nav.users') } }), { description: e.message });
		}
	}
</script>

<svelte:head>
	<title>{$_('meta.usersTitle')}</title>
	<meta name="description" content={$_('meta.usersDesc')} />
</svelte:head>

<UserModal bind:open {data} />

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
				<div class="rounded-lg bg-primary/10 p-2">
					<Users class="h-6 w-6 text-primary" />
				</div>
				{$_('users.title')}
			</h1>
			<p class="mt-1 text-muted-foreground">{$_('meta.usersDesc')}</p>
		</div>
	</div>

	<DataTable
		data={userList.data}
		{columns}
		{bulkActions}
		createButton={{
			label: $_('users.addUser'),
			onClick: () => (open = true)
		}}
	/>
</div>
