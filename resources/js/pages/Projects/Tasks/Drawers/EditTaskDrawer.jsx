import { openConfirmModal } from '@/components/ConfirmModal';
import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useForm from '@/hooks/useForm';
import { usePage } from '@inertiajs/react';
import { 
  Button, 
  Drawer, 
  Flex, 
  MultiSelect, 
  Select,
  Text, 
  TextInput, 
  rem 
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { useEffect, useState } from 'react';
import classes from './css/TaskDrawer.module.css';

export function EditTaskDrawer() {
  const { edit, closeEditTask } = useTaskDrawerStore();
  const { assignableUsers, subscribers, taskGroups, project, authUser } = usePage().props;

  const task = edit.task;
  if (!task) return null;

  // Get roles
  const roleNames = (authUser?.roles || []).map(r => r.name);
  const isAdmin = roleNames.includes("Admin");
  const isTeamLeader = roleNames.includes("Team Leader");

  // Task creator id (fallback if createdByUser is missing)
  const taskCreatorId = task.createdByUser?.id ?? task.created_by_user_id;

  // Check if user can edit
  const canEditTask = isAdmin || (isTeamLeader && taskCreatorId === authUser.id);

  // Debug logs
  console.log('Auth user:', authUser);
  console.log('Roles:', roleNames);
  console.log('Task created by:', taskCreatorId ?? 'No creator assigned');
  console.log('Can edit task:', canEditTask);


  // --- Map users safely ---
  const assignableUsersFromController = (assignableUsers || [])
    .filter(u => u && u.id)
    .map(u => ({ value: u.id.toString(), label: u.name || 'No name' }));

  const subscribersFromController = (subscribers || [])
    .filter(s => s && s.id)
    .map(s => ({ value: s.id.toString(), label: s.name || 'No name' }));

  // --- Form initial values ---
  const initial = {
    group_id: task?.group_id?.toString() || '',
    subscribed_users: (task?.subscribed_users || []).map(u => u.id?.toString()).filter(Boolean),
    assigned_to_user_id: task?.assigned_to_user_id?.toString() || '',
    name: task?.name || '',
    description: task?.description || '',
    due_on: task?.due_on ? new Date(task.due_on) : null,
    attachments: task?.attachments || [],
  };

  const updateRoute = canEditTask ? route('projects.tasks.update', [project.id, task.id]) : null;
  const [form, submit, updateValue] = useForm('put', updateRoute, { ...initial });
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (edit.opened && task) {
      updateValue({ ...initial });
    }
  }, [edit.opened, task]);

  // --- Drawer close with unsaved changes check ---
  const closeDrawer = (force = false) => {
    if (force || (JSON.stringify(form.data) === JSON.stringify(initial) && !form.processing)) {
      closeEditTask();
    } else {
      openConfirmModal({
        type: 'danger',
        title: 'Discard changes?',
        content: `All unsaved changes will be lost.`,
        confirmLabel: 'Discard',
        confirmProps: { color: 'red' },
        onConfirm: () => closeEditTask(),
      });
    }
  };

  const removeAttachment = (index) => {
    const files = [...form.data.attachments];
    files.splice(index, 1);
    updateValue('attachments', files);
  };

  const submitComment = () => {
    if (!comment.trim()) return;
    window.Inertia.post(route('tasks.comments.store', task.id), { content: comment }, {
      onSuccess: () => setComment(''),
    });
  };

  return (
    <Drawer
      opened={edit.opened}
      onClose={closeDrawer}
      title={<Text fz={rem(28)} fw={600} ml={25} my="sm">Edit Task</Text>}
      position="right"
      size={1000}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{ transition: 'slide-left', duration: 400, timingFunction: 'ease' }}
    >
      <form
        onSubmit={(event) => {
          if (!updateRoute) return;
          submit(event, {
            transform: (data) => ({ ...data, due_on: data.due_on ? data.due_on.toISOString() : null }),
            onSuccess: () => closeDrawer(true),
          });
        }}
        className={classes.inner}
      >
        <div className={classes.content}>
          {/* Task Name */}
          <TextInput
            label="Task Name"
            placeholder="Enter task name"
            required
            value={form.data.name}
            onChange={(e) => updateValue('name', e.target.value)}
            error={form.errors.name}
            disabled={!canEditTask}
          />

          {/* Task Description */}
          <RichTextEditor
            mt="xl"
            placeholder="Task description"
            height={200}
            value={form.data.description}
            onChange={(content) => updateValue('description', content)}
            readOnly={!canEditTask}
          />

          {/* Attachments */}
          <Dropzone
            mt="md"
            selected={form.data.attachments}
            onChange={(files) => updateValue('attachments', files)}
            remove={removeAttachment}
            disabled={!canEditTask}
          />

          {/* Subscribers */}
          <MultiSelect
            label="Subscribers"
            placeholder="Select subscribers"
            searchable
            mt="md"
            value={form.data.subscribed_users}
            onChange={(values) => updateValue('subscribed_users', values)}
            data={subscribersFromController}
            disabled={!canEditTask}
          />

          {/* Task Group */}
          <Select
            label="Task Group"
            placeholder="Select task group"
            required
            mt="md"
            value={form.data.group_id}
            onChange={(value) => updateValue('group_id', value)}
            data={(taskGroups || []).map(g => ({ value: g.id.toString(), label: g.name }))}
            error={form.errors.group_id}
            disabled={!canEditTask}
          />

          {/* Assignee */}
          <Select
            label="Assignees"
            placeholder="Select assignee"
            searchable
            mt="md"
            value={form.data.assigned_to_user_id}
            onChange={(value) => updateValue('assigned_to_user_id', value)}
            data={assignableUsersFromController}
            disabled={!canEditTask}
          />

          {/* Due date */}
          <DateInput
            clearable
            valueFormat="DD MMM YYYY"
            minDate={new Date()}
            mt="md"
            label="Due date"
            placeholder="Pick due date"
            value={form.data.due_on}
            onChange={(value) => updateValue('due_on', value)}
            disabled={!canEditTask}
          />

          {/* Comment for members */}
          {!canEditTask && (
            <>
              <RichTextEditor
                mt="xl"
                placeholder="Add a comment for progress or updates"
                height={150}
                value={comment}
                onChange={setComment}
              />
              <Button mt="md" w={120} onClick={submitComment}>
                Add Comment
              </Button>
            </>
          )}

          <Flex justify="space-between" mt="xl">
            <Button variant="transparent" w={100} disabled={form.processing} onClick={closeDrawer}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              w={120} 
              loading={form.processing} 
              disabled={!updateRoute}
            >
              Save Changes
            </Button>
          </Flex>
        </div>
      </form>
    </Drawer>
  );
}
