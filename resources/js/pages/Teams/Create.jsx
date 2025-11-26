import React, { useState } from "react";
import { router } from "@inertiajs/react";
import { TextInput, Button, Group, Card } from "@mantine/core";
import Layout from "@/layouts/MainLayout";

const CreateTeam = () => {
  const [name, setName] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    router.post(route("teams.store"), { name });
  };

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <form onSubmit={handleSubmit}>
        <TextInput
          label="Team Name"
          placeholder="Enter team name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Group mt="lg">
          <Button type="submit" radius="xl">
            Create Team
          </Button>
        </Group>
      </form>
    </Card>
  );
};

// WRAP IN NAVBAR LAYOUT
CreateTeam.layout = (page) => <Layout title="Create Team">{page}</Layout>;

export default CreateTeam;
