import TableRowActions from '@/components/TableRowActions';
import { Text, Table, Badge } from '@mantine/core';


export default function TableRow({ item }) {
  return (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Text fz='sm' fw={500} c="orange">
          {item.name}
        </Text>
      </Table.Td>
      <Table.Td>
        <Text fz='sm'>{item.email}</Text>
        <Text fz='xs' c='dimmed'>
        </Text>
      </Table.Td>
      {/* Clients column removed */}

      {(can('edit client company') ||
        can('archive client company') ||
        can('restore client company')) && (
        <Table.Td>
          <TableRowActions
            item={item}
            editRoute='clients.companies.edit'
            editPermission='edit client company'
            archivePermission='archive client company'
            restorePermission='restore client company'
            archive={{
              route: 'clients.companies.destroy',
              title: 'Archive company',
              content: `Are you sure you want to archive this company?`,
              confirmLabel: 'Archive',
            }}
            restore={{
              route: 'clients.companies.restore',
              title: 'Restore company',
              content: `Are you sure you want to restore this company?`,
              confirmLabel: 'Restore',
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}
