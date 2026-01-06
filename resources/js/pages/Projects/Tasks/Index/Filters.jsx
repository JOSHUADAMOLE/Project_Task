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
} from "@mantine/core";

export default function Filters() {
  const {
    usersWithAccessToProject = [],
    labels = [],
    authUser,
  } = usePage().props;

  const isAdmin = authUser?.roles?.some((r) => r.name === "Admin");

  const { groups = [] } = useTaskGroupsStore();

  const {
    filters,
    toggleArrayFilter,
    toggleObjectFilter,
    toggleValueFilter,
  } = useTaskFiltersStore();

  return (
    <Group gap={12}>
      {/* =======================
          TASK GROUPS
      ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">Task Groups</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea.Autosize mah={250}>
            {groups.map((g) => (
              <Menu.Item
                key={g.id}
                onClick={() => toggleArrayFilter("groups", g.id)}
              >
                <Group justify="space-between">
                  <Text>{g.name}</Text>
                  {filters.groups.includes(g.id) && <Text fw={700}>✓</Text>}
                </Group>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>

      {/* =======================
          ASSIGNEE (FIXED)
      ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">Assignee</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea.Autosize mah={250}>
            {/* 🔥 UNASSIGNED TASKS */}
            <Menu.Item
              onClick={() => toggleArrayFilter("assignees", null)}
            >
              <Group justify="space-between">
                <Text>Unassigned</Text>
                {filters.assignees.includes(null) && <Text fw={700}>✓</Text>}
              </Group>
            </Menu.Item>

            {/* USERS */}
            {usersWithAccessToProject.map((user) => (
              <Menu.Item
                key={user.id}
                onClick={() => toggleArrayFilter("assignees", user.id)}
              >
                <Group justify="space-between">
                  <Text>{user.name}</Text>
                  {filters.assignees.includes(user.id) && <Text fw={700}>✓</Text>}
                </Group>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>

      {/* =======================
          DUE DATE
      ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">Due Date</Button>
        </Menu.Target>

        <Menu.Dropdown>
          {["not_set", "overdue", "today", "week"].map((key) => (
            <Menu.Item
              key={key}
              onClick={() => toggleObjectFilter("due_date", key)}
              rightSection={filters.due_date?.[key] ? "✓" : ""}
            >
              {key.replace("_", " ").toUpperCase()}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      {/* =======================
          STATUS
      ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">Status</Button>
        </Menu.Target>

        <Menu.Dropdown>
          {["todo", "in_progress", "completed"].map((status) => (
            <Menu.Item
              key={status}
              onClick={() => toggleValueFilter("status", status)}
              rightSection={filters.status === status ? "✓" : ""}
            >
              {status.replace("_", " ").toUpperCase()}
            </Menu.Item>
          ))}
        </Menu.Dropdown>
      </Menu>

      {/* =======================
          LABELS
      ======================= */}
      <Menu width={220} position="bottom-start">
        <Menu.Target>
          <Button variant="light" size="sm">Labels</Button>
        </Menu.Target>

        <Menu.Dropdown>
          <ScrollArea.Autosize mah={250}>
            {labels.map((label) => (
              <Menu.Item
                key={label.id}
                onClick={() => toggleArrayFilter("labels", label.id)}
              >
                <Group justify="space-between">
                  <Group gap={6}>
                    <ColorSwatch size={14} color={label.color} />
                    <Text>{label.name}</Text>
                  </Group>
                  {filters.labels.includes(label.id) && <Text fw={700}>✓</Text>}
                </Group>
              </Menu.Item>
            ))}
          </ScrollArea.Autosize>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
