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
import { useEffect } from 'react';
import classes from './css/TaskDrawer.module.css';

export function CreateTaskDrawer() {
  const { create, closeCreateTask } = useTaskDrawerStore();
  const { assignableUsers, subscribers, taskGroups, project } = usePage().props;

  // ✅ Safe mapping for assignable users
  const assignableUsersFromController = (assignableUsers || [])
    .filter(u => u && u.id && u.name)
    .map(u => ({
      value: u.id.toString(),
      label: u.name,
    }));

  // ✅ Safe mapping for subscribers
  const subscribersFromController = (subscribers || [])
    .filter(s => s && s.id && s.name)
    .map(s => ({
      value: s.id.toString(),
      label: s.name,
    }));

  const initial = {
    group_id: create.group_id ? create.group_id.toString() : '',
    subscribed_users: [],
    assigned_to_user_id: '', 
    name: '',
    description: '',
    due_on: null,
    attachments: [],
  };

  const [form, submit, updateValue] = useForm(
    'post',
    route('projects.tasks.store', [route().params.project]),
    { ...initial }
  );

  useEffect(() => {
    updateValue({ ...initial });
  }, [create.opened]);

  const closeDrawer = (force = false) => {
    if (
      force ||
      (JSON.stringify(form.data) === JSON.stringify(initial) && !form.processing)
    ) {
      closeCreateTask();
    } else {
      openConfirmModal({
        type: 'danger',
        title: 'Discard changes?',
        content: `All unsaved changes will be lost.`,
        confirmLabel: 'Discard',
        confirmProps: { color: 'red' },
        onConfirm: () => closeCreateTask(),
      });
    }
  };

  const removeAttachment = (index) => {
    const files = [...form.data.attachments];
    files.splice(index, 1);
    updateValue('attachments', files);
  };

  return (
    <Drawer
      opened={create.opened}
      onClose={closeDrawer}
      title={<Text fz={rem(28)} fw={600} ml={25} my="sm">Add New Task</Text>}
      position="right"
      size={1000}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{ transition: 'slide-left', duration: 400, timingFunction: 'ease' }}
    >
      <form
        onSubmit={(event) =>
          submit(event, { onSuccess: () => closeDrawer(true) })
        }
        className={classes.inner}
      >
        <div className={classes.content}>
          <TextInput
            label="Task Name"
            placeholder="Enter task name"
            required
            value={form.data.name}
            onChange={(e) => updateValue('name', e.target.value)}
            error={form.errors.name}
          />

          <RichTextEditor
            mt="xl"
            placeholder="Task description"
            height={200}
            value={form.data.description}
            onChange={(content) => updateValue('description', content)}
          />

          <Dropzone
            mt="md"
            selected={form.data.attachments}
            onChange={(files) => updateValue('attachments', files)}
            remove={removeAttachment}
          />

          {/* Subscribers: admins and clients */}
          <MultiSelect
            label="Subscribers"
            placeholder="Select subscribers"
            searchable
            mt="md"
            value={form.data.subscribed_users}
            onChange={(values) => updateValue('subscribed_users', values)}
            data={subscribersFromController} // ✅ use safe mapped data
          />

          {/* Task Group */}
          <Select
            label="Task Group"
            placeholder="Select task group"
            required
            mt="md"
            value={form.data.group_id}
            onChange={(value) => updateValue('group_id', value)}
            data={(taskGroups || []).filter(g => g && g.id && g.name).map(g => ({
              value: g.id.toString(),
              label: g.name,
            }))}
            error={form.errors.group_id}
          />

          {/* Assignees: team leader's members */}
          <Select
            label="Assignees"
            placeholder="Select assignee"
            searchable
            mt="md"
            value={form.data.assigned_to_user_id}
            onChange={(value) => updateValue('assigned_to_user_id', value)}
            data={assignableUsersFromController} // ✅ use safe mapped data
          />

          <DateInput
            clearable
            valueFormat="DD MMM YYYY"
            minDate={new Date()}
            mt="md"
            label="Due date"
            placeholder="Pick due date"
            value={form.data.due_on}
            onChange={(value) => updateValue('due_on', value)}
          />

          <Flex justify="space-between" mt="xl">
            <Button variant="transparent" w={100} disabled={form.processing} onClick={closeDrawer}>
              Cancel
            </Button>
            <Button type="submit" w={120} loading={form.processing}>
              Add Task
            </Button>
          </Flex>
        </div>
      </form>
    </Drawer>
  );
}
