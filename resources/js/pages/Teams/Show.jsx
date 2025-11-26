import React from "react";
import { usePage, Link } from "@inertiajs/react";
import { Card, Title, Avatar, Group, Text, Grid, Button } from "@mantine/core";
import Layout from "@/layouts/MainLayout";
import { getInitials } from "@/utils/user";

const TeamShow = () => {
  const { team, members } = usePage().props;
  const safeMembers = Array.isArray(members) ? members : [];

  const handleRemove = (userId, userName) => {
    if (confirm(`Are you sure you want to remove ${userName} from this team?`)) {
      fetch(route("teams.members.remove", { team: team.id, user: userId }), {
        method: "DELETE",
        headers: {
          "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
          "Accept": "application/json",
        },
      })
        .then((res) => {
          if (res.ok) window.location.reload();
        })
        .catch((err) => console.error(err));
    }
  };

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>{team.name} Members</Title>

        <Button
          radius="xl"
          component={Link}
          href={route("users.create", { team_id: team.id })}
        >
          Add Member
        </Button>
      </Group>

      <Grid>
        {safeMembers.length > 0 ? (
          safeMembers.map((user) => (
            <Grid.Col span={12} md={6} key={user.id}>
              <Card shadow="sm" radius="md" p="md" withBorder>
                <Group position="apart">
                  <Group>
                    <Avatar radius="xl" color="blue">
                      {getInitials(user.name)}
                    </Avatar>

                    <div>
                      <Text fw={500}>{user.name}</Text>
                      <Text size="sm" c="dimmed">
                        {user.email}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {user.roles && user.roles.length > 0
                          ? user.roles[0].name.charAt(0).toUpperCase() +
                            user.roles[0].name.slice(1)
                          : "No role"}
                      </Text>
                    </div>
                  </Group>

                  <Group spacing="xs">
                    <Button
                      size="xs"
                      radius="xl"
                      variant="light"
                      component={Link}
                      href={route("users.show", user.id)}
                    >
                      View
                    </Button>

                    <Button
                      size="xs"
                      color="red"
                      radius="xl"
                      variant="light"
                      onClick={() => handleRemove(user.id, user.name)}
                    >
                      Remove
                    </Button>
                  </Group>
                </Group>
              </Card>
            </Grid.Col>
          ))
        ) : (
          <Text>No members in this team yet.</Text>
        )}
      </Grid>
    </>
  );
};

TeamShow.layout = (page) => <Layout title="Team Members">{page}</Layout>;

export default TeamShow;
