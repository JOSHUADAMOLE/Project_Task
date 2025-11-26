import React from "react";
import { Card, Text, Group, Button } from "@mantine/core";
import { Link, router } from "@inertiajs/react";

const TeamCard = ({ team }) => {
  const handleDelete = () => {
    if (confirm(`Are you sure you want to delete team "${team.name}"?`)) {
      router.delete(route("teams.destroy", team.id), {
        onSuccess: () => console.log("Team deleted successfully"),
      });
    }
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between">
        <Text fw={600}>{team.name}</Text>

        <Group spacing="xs">
          {/* View Team Members */}
          <Button
            size="xs"
            radius="xl"
            component={Link}
            href={route("teams.show", team.id)}
          >
            View Members
          </Button>

          {/* Add Member */}
          <Button
            size="xs"
            radius="xl"
            color="green"
            component={Link}
            href={route("users.create", { team_id: team.id })} // preselect team
          >
            Add Member
          </Button>

          {/* Delete Team */}
          <Button
            size="xs"
            radius="xl"
            color="red"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </Group>
      </Group>
    </Card>
  );
};

export default TeamCard;
