import useTaskGroupsStore from "@/hooks/store/useTaskGroupsStore";
import useTaskFiltersStore from "@/hooks/store/useTaskFiltersStore";
import { usePage } from "@inertiajs/react";

import {
  Menu,
  Button,
  Group,
  Text,
  ColorSwatch,
  ScrollArea,
  rem,
} from "@mantine/core";

export default function Filters() {
  // Get props from Inertia
  const { usersWithAccessToProject = [], labels = [] } = usePage().props;

  // Task groups from store
  const { groups = [] } = useTaskGroupsStore();

  // Filters from store
  const {
    filters,
    toggleArrayFilter,
    toggleObjectFilter,
    toggleValueFilter,
  } = useTaskFiltersStore();

  return (
    <Group gap={12}>
      {/* =======================
           TASK GROUPS DROPDOWN
         ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">
            Task Groups
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea.Autosize mah={250}>
            {(groups || []).map((g) => (
              <Menu.Item
                key={g.id}
                onClick={() => toggleArrayFilter("groups", g.id)}
              >
                <Group justify="space-between">
                  <Text>{g.name}</Text>
                  {filters.groups.includes(g.id) && <Text fw={700} c="blue">✓</Text>}
                </Group>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>

      {/* =======================
           ASSIGNEE DROPDOWN
         ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">
            Assignee
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea.Autosize mah={250}>
            {(usersWithAccessToProject || []).map((user) => (
              <Menu.Item
                key={user.id}
                onClick={() => toggleArrayFilter("assignees", user.id)}
              >
                <Group justify="space-between">
                  <Text>{user.name}</Text>
                  {filters.assignees.includes(user.id) && <Text fw={700} c="blue">✓</Text>}
                </Group>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>

      {/* =======================
           DUE DATE DROPDOWN
         ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">
            Due Date
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={() => toggleObjectFilter("due_date", "not_set")}
            rightSection={filters.due_date?.not_set ? "✓" : ""}
          >
            Not set
          </Menu.Item>
          <Menu.Item
            onClick={() => toggleObjectFilter("due_date", "overdue")}
            rightSection={filters.due_date?.overdue ? "✓" : ""}
          >
            Overdue
          </Menu.Item>
          <Menu.Item
            onClick={() => toggleObjectFilter("due_date", "today")}
            rightSection={filters.due_date?.today ? "✓" : ""}
          >
            Today
          </Menu.Item>
          <Menu.Item
            onClick={() => toggleObjectFilter("due_date", "week")}
            rightSection={filters.due_date?.week ? "✓" : ""}
          >
            This week
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* =======================
           STATUS DROPDOWN
         ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">
            Status
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <Menu.Item
            onClick={() => toggleValueFilter("status", "todo")}
            rightSection={filters.status === "todo" ? "✓" : ""}
          >
            Todo
          </Menu.Item>
          <Menu.Item
            onClick={() => toggleValueFilter("status", "in_progress")}
            rightSection={filters.status === "in_progress" ? "✓" : ""}
          >
            In Progress
          </Menu.Item>
          <Menu.Item
            onClick={() => toggleValueFilter("status", "completed")}
            rightSection={filters.status === "completed" ? "✓" : ""}
          >
            Completed
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      {/* =======================
           LABELS DROPDOWN
         ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">
            Labels
          </Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea.Autosize mah={250}>
            {(labels || []).map((label) => (
              <Menu.Item
                key={label.id}
                onClick={() => toggleArrayFilter("labels", label.id)}
              >
                <Group justify="space-between">
                  <Group gap={6}>
                    <ColorSwatch size={14} color={label.color} />
                    <Text>{label.name}</Text>
                  </Group>
                  {filters.labels.includes(label.id) && <Text fw={700} c="blue">✓</Text>}
                </Group>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
