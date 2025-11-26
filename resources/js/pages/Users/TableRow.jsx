import React, { useEffect } from "react";
import { Avatar, Group, Table, Text, Badge, Flex } from "@mantine/core";
import { Link } from "@inertiajs/react";
import TableRowActions from "@/components/TableRowActions";
import RoleBadge from "@/components/RoleBadge";
import { getInitials } from "@/utils/user";

export default function TableRow({ item }) {
  useEffect(() => {
    console.log("User item:", item);
  }, [item]);

  const renderTeams = () => {
    if (!item.teams || item.teams.length === 0) return <Text size="sm" c="dimmed">No Team</Text>;

    return item.teams.map((team) => {
      // Ensure name is string
      const teamName = typeof team.name === "string" ? team.name : JSON.stringify(team.name);
      return (
        <Badge
          key={team.id}
          component={Link}
          href={route("teams.show", team.id)}
          variant="light"
          color="blue"
          mr={4}
          style={{ cursor: "pointer" }}
        >
          {teamName}
        </Badge>
      );
    });
  };

  const renderRoles = () => {
    if (!item.roles || item.roles.length === 0) return <Text size="sm" c="dimmed">No Role</Text>;

    return item.roles.map((role) => {
      const roleName = typeof role.name === "string" ? role.name : JSON.stringify(role.name);
      return <RoleBadge key={role.id} role={roleName} />;
    });
  };

  return (
    <Table.Tr key={item.id}>
      <Table.Td>
        <Group gap="sm">
          <Avatar src={item.avatar} size={40} radius={40} color="blue" alt={item.name}>
            {getInitials(item.name)}
          </Avatar>
          <div>
            <Text fz="sm" fw={500}>{item.name}</Text>
            <Text fz="xs" c="dimmed">{item.job_title}</Text>
          </div>
        </Group>
      </Table.Td>

      <Table.Td maw={200}>
        <Flex gap="sm" align="center" wrap="wrap">
          {renderRoles()}
        </Flex>
      </Table.Td>

      <Table.Td>
        <Text fz="sm">{item.email}</Text>
        <Text fz="xs" c="dimmed">Email</Text>
      </Table.Td>

      <Table.Td>
        <Flex gap="sm" align="center" wrap="wrap">
          {renderTeams()}
        </Flex>
      </Table.Td>

      {(can("edit user") || can("archive user") || can("restore user")) && (
        <Table.Td>
          <TableRowActions
            item={item}
            editRoute="users.edit"
            editPermission="edit user"
            archivePermission="archive user"
            restorePermission="restore user"
            archive={{
              route: "users.destroy",
              title: "Archive user",
              content: `Are you sure you want to archive this user? This action will prevent the user from logging in.`,
              confirmLabel: "Archive",
            }}
            restore={{
              route: "users.restore",
              title: "Restore user",
              content: `Are you sure you want to restore this user?`,
              confirmLabel: "Restore",
            }}
          />
        </Table.Td>
      )}
    </Table.Tr>
  );
}
