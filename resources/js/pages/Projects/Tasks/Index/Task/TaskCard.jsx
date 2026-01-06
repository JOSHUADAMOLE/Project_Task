import { Label } from "@/components/Label";
import useTaskDrawerStore from "@/hooks/store/useTaskDrawerStore";
import { isOverdue } from "@/utils/task";
import { getInitials } from "@/utils/user";
import { Draggable } from "@hello-pangea/dnd";
import { Link } from "@inertiajs/react";
import { Avatar, Group, Text, Tooltip, rem, useComputedColorScheme } from "@mantine/core";
import TaskActions from "../TaskActions";
import classes from "./css/TaskCard.module.css";

export default function TaskCard({ task, index, authUser }) {
  const { openEditTask } = useTaskDrawerStore();
  const computedColorScheme = useComputedColorScheme();

  // Roles
  const roleNames = (authUser?.roles || []).map(r => r.name);
  const isAdmin = roleNames.includes("Admin");
  const isTeamLeader = roleNames.includes("Team Leader");

  // Permissions
  const authUserId = authUser?.id;

  const canEditTask =
    isAdmin || (isTeamLeader && task.created_by_user_id === authUserId);

  const canViewTask =
    isAdmin ||
    isTeamLeader ||
    task.assigned_to_user_id === authUserId ||
    task.created_by_user_id === authUserId;


  if (!canViewTask) return null; // Hide card if user can't view

  return (
    <Draggable draggableId={"task-" + task.id} index={index}>
      {(provided, snapshot) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`${classes.task} ${snapshot.isDragging && classes.itemDragging} ${
            task.completed_at !== null && classes.completed
          }`}
        >
          <div {...(canEditTask && provided.dragHandleProps)}>
            <Text
              className={classes.name}
              size="xs"
              fw={500}
              c={isOverdue(task) && task.completed_at === null ? "red.7" : ""}
              onClick={() => {
                if (canViewTask) openEditTask(task); // Only open drawer if user can view
              }}
            >
              #{task.number + ": " + task.name}
            </Text>

            <Group wrap="nowrap" justify="space-between">
              <Group wrap="wrap" style={{ rowGap: rem(3), columnGap: rem(12) }} mt={5}>
                {task.labels.map((label) => (
                  <Label
                    key={label.id}
                    name={label.name}
                    color={label.color}
                    size={9}
                    dot={false}
                  />
                ))}
              </Group>

              {task.assigned_to_user && (
                <Tooltip label={task.assigned_to_user.name} openDelay={1000} withArrow>
                  <Link
                    href={route("users.edit", task.assigned_to_user.id)}
                    style={{ textDecoration: "none" }}
                  >
                    <Avatar
                      src={task.assigned_to_user.avatar}
                      radius="xl"
                      size={20}
                      color={computedColorScheme === "light" ? "white" : "blue"}
                    >
                      {getInitials(task.assigned_to_user.name)}
                    </Avatar>
                  </Link>
                </Tooltip>
              )}

              {(canEditTask) && (
                <TaskActions task={task} className={classes.actions} />
              )}
            </Group>
          </div>
        </div>
      )}
    </Draggable>
  );
}
