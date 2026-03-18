<script lang="ts">
	import { dns } from '$lib/api/dns.svelte';
	import DNSModal from '$lib/components/modals/DNSModal.svelte';
	import ColumnBadge from '$lib/components/tables/ColumnBadge.svelte';
	import ColumnCheck from '$lib/components/tables/ColumnCheck.svelte';
	import DataTable from '$lib/components/tables/DataTable.svelte';
	import TableActions from '$lib/components/tables/TableActions.svelte';
	import type { BulkAction } from '$lib/components/tables/types';
	import { renderComponent } from '$lib/components/ui/data-table';
	import { DNSProviderType, type DNSProvider } from '$lib/gen/mantrae/v1/dns_provider_pb';
	import { ConnectError } from '@connectrpc/connect';
	import { CircleCheck, CircleSlash, Globe, Pencil, Trash } from '@lucide/svelte';
	import type { ColumnDef } from '@tanstack/table-core';
	import { toast } from 'svelte-sonner';
	import { get } from 'svelte/store';
	import { _ } from 'svelte-i18n';

	let data = $state({} as DNSProvider);
	let open = $state(false);

	const dnsList = dns.list();
	const updateDNS = dns.update();
	const deleteDNS = dns.delete();

	const columns: ColumnDef<DNSProvider>[] = [
		{
			header: get(_)('dns.name'),
			accessorKey: 'name',
			enableSorting: true,
			enableHiding: false
		},
		{
			header: get(_)('dns.provider'),
			accessorKey: 'type',
			enableSorting: true,
			enableGlobalFilter: false,
			cell: ({ row }) => {
				let type = row.getValue('type') as
					| DNSProviderType.DNS_PROVIDER_TYPE_CLOUDFLARE
					| DNSProviderType.DNS_PROVIDER_TYPE_POWERDNS
					| DNSProviderType.DNS_PROVIDER_TYPE_TECHNITIUM
					| DNSProviderType.DNS_PROVIDER_TYPE_PIHOLE;
				let label = 'Unspecified';
				switch (type) {
					case DNSProviderType.DNS_PROVIDER_TYPE_CLOUDFLARE:
						label = 'Cloudflare';
						break;
					case DNSProviderType.DNS_PROVIDER_TYPE_POWERDNS:
						label = 'PowerDNS';
						break;
					case DNSProviderType.DNS_PROVIDER_TYPE_TECHNITIUM:
						label = 'Technitium';
						break;
					case DNSProviderType.DNS_PROVIDER_TYPE_PIHOLE:
						label = 'PiHole';
						break;
				}
				return renderComponent(ColumnBadge, {
					label: label,
					class: 'hover:cursor-pointer'
				});
			}
		},
		{
			header: get(_)('dns.ipAddress'),
			accessorKey: 'config.ip',
			id: 'ip',
			enableSorting: true,
			enableGlobalFilter: false,
			cell: ({ row }) => {
				if (row.original.config?.autoUpdate) {
					return renderComponent(ColumnBadge, {
						label: get(_)('dns.auto'),
						variant: 'secondary',
						class: 'hover:cursor-pointer'
					});
				} else {
					return renderComponent(ColumnBadge, {
						label: row.getValue('ip') as string,
						class: 'hover:cursor-pointer'
					});
				}
			}
		},
		{
			header: get(_)('dns.default'),
			accessorKey: 'isDefault',
			enableSorting: true,
			enableGlobalFilter: false,
			cell: ({ row }) => {
				return renderComponent(TableActions, {
					actions: [
						{
							type: 'button',
							label: row.original.isDefault ? get(_)('common.disable') : get(_)('common.enable'),
							icon: row.original.isDefault ? CircleCheck : CircleSlash,
							iconProps: {
								class: row.original.isDefault ? 'text-green-500 size-5' : 'text-red-500 size-5',
								size: 20
							},
							onClick: () =>
								updateDNS.mutate({ ...row.original, isDefault: !row.original.isDefault })
						}
					]
				});
			}
		},
		{
			header: get(_)('dns.proxied'),
			accessorKey: 'config.proxied',
			id: 'proxied',
			enableSorting: true,
			enableGlobalFilter: false,
			cell: ({ row }) => {
				let checked = row.getValue('proxied') as boolean;
				return renderComponent(ColumnCheck, { checked: checked });
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
							label: get(_)('dns.editProvider'),
							icon: Pencil,
							onClick: () => {
								data = row.original;
								open = true;
							}
						},
						{
							type: 'popover',
							label: get(_)('dns.deleteProvider'),
							icon: Trash,
							classProps: 'text-destructive',
							onClick: () => deleteDNS.mutate({ id: row.original.id }),
							popover: {
								title: get(_)('dns.deleteProvider') + '?',
								description: get(_)('common.permanentDelete', { values: { item: get(_)('dns.provider') } }),
								confirmLabel: get(_)('common.delete'),
								cancelLabel: get(_)('common.cancel')
							}
						}
					]
				});
			}
		}
	];

	const bulkActions: BulkAction<DNSProvider>[] = [
		{
			type: 'button',
			label: get(_)('common.delete'),
			icon: Trash,
			variant: 'destructive',
			onClick: bulkDelete
		}
	];

	async function bulkDelete(rows: DNSProvider[]) {
		const t = get(_);
		try {
			const confirmed = confirm(t('common.confirmDelete', { values: { count: rows.length, items: t('dns.title') } }));
			if (!confirmed) return;

			for (const row of rows) {
				deleteDNS.mutate({ id: row.id });
			}
			toast.success(`Successfully deleted ${rows.length} DNS Providers`);
		} catch (err) {
			const e = ConnectError.from(err);
			toast.error(t('common.failedAction', { values: { action: t('common.delete'), items: t('dns.title') } }), { description: e.message });
		}
	}
</script>

<svelte:head>
	<title>{$_('meta.dnsTitle')}</title>
	<meta name="description" content={$_('meta.dnsDesc')} />
</svelte:head>

<DNSModal bind:open {data} />

<div class="flex flex-col gap-2">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="flex items-center gap-3 text-3xl font-bold tracking-tight">
				<div class="rounded-lg bg-primary/10 p-2">
					<Globe class="h-6 w-6 text-primary" />
				</div>
				{$_('dns.title')}
			</h1>
			<p class="mt-1 text-muted-foreground">{$_('meta.dnsDesc')}</p>
		</div>
	</div>

	<DataTable
		data={dnsList.data}
		{columns}
		{bulkActions}
		createButton={{
			label: $_('dns.addProvider'),
			onClick: () => (open = true)
		}}
	/>
</div>
