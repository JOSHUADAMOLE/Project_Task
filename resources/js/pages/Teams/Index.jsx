import React from "react";
import { usePage, Link } from "@inertiajs/react";
import { Grid, Title, Button, Group } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import TeamCard from "@/components/TeamCard";
import Layout from "@/layouts/MainLayout";

const TeamsIndex = () => {
  const { teams } = usePage().props;

  return (
    <>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Teams</Title>

        <Button
          leftSection={<IconPlus size={14} />}
          radius="xl"
          component={Link}
          href={route("teams.create")}
        >
          Create Team
        </Button>
      </Group>

      <Grid>
        {teams.length > 0 ? (
          teams.map((team) => (
            <Grid.Col key={team.id} xs={12} sm={6} md={4}>
              <TeamCard team={team} />
            </Grid.Col>
          ))
        ) : (
          <p>No teams found.</p>
        )}
      </Grid>
    </>
  );
};

// WRAP IN NAVBAR LAYOUT
TeamsIndex.layout = (page) => <Layout title="Teams">{page}</Layout>;

export default TeamsIndex;
