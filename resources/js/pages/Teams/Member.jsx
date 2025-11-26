import React from "react";
import Layout from "@/layouts/MainLayout";
import Pagination from "@/components/Pagination";
import TableHead from "@/components/TableHead";
import TableRowEmpty from "@/components/TableRowEmpty";
import TableRow from "@/pages/Users/TableRow"; // reuse existing TableRow
import { usePage } from "@inertiajs/react";
import { Grid, Group, Table, Title } from "@mantine/core";

export default function Members() {
  const { team, items } = usePage().props;

  const columns = [
    { label: "User", column: "name" },
    { label: "Role", sortable: true, column: "roles" },
    { label: "Email", column: "email" },
    { label: "Actions", sortable: false },
  ];

  const rows = items.data.length ? (
    items.data.map((item) => <TableRow item={item} key={item.id} />)
  ) : (
    <TableRowEmpty colSpan={columns.length} />
  );

  return (
    <>
      <Grid justify="space-between" align="center" mb="md">
        <Grid.Col>
          <Title order={2}>Team Members: {team.name}</Title>
        </Grid.Col>
      </Grid>

      <Table.ScrollContainer miw={800} my="lg">
        <Table verticalSpacing="sm">
          <TableHead columns={columns} />
          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <Pagination current={items.meta.current_page} pages={items.meta.last_page} />
    </>
  );
}

Members.layout = (page) => <Layout title="Team Members">{page}</Layout>;
