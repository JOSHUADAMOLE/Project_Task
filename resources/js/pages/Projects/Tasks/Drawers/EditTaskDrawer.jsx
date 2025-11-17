import Dropzone from '@/components/Dropzone';
import RichTextEditor from '@/components/RichTextEditor';
import useTaskDrawerStore from '@/hooks/store/useTaskDrawerStore';
import useTasksStore from '@/hooks/store/useTasksStore';
import useWebSockets from '@/hooks/useWebSockets';
import { date } from '@/utils/datetime';
import { hasRoles } from '@/utils/user';
import { usePage } from '@inertiajs/react';
import {
  Breadcrumbs,
  Checkbox,
  Drawer,
  Group,
  MultiSelect,
  Select,
  Text,
  TextInput,
  rem,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import Comments from './Comments';
import LabelsDropdown from './LabelsDropdown';
import classes from './css/TaskDrawer.module.css';

export function EditTaskDrawer() {
  const editorRef = useRef(null);
  const { edit, openEditTask, closeEditTask } = useTaskDrawerStore();
  const { initTaskWebSocket } = useWebSockets();
  const { findTask, updateTaskProperty, complete, deleteAttachment, uploadAttachments } =
    useTasksStore();
  const {
    usersWithAccessToProject,
    taskGroups,
    labels,
    openedTask,
    auth: { user },
  } = usePage().props;

  useEffect(() => {
    if (openedTask) setTimeout(() => openEditTask(openedTask), 50);
  }, []);

  const task = findTask(edit.task.id);

  const [data, setData] = useState({
    group_id: '',
    assigned_to_user_id: '',
    name: '',
    description: '',
    due_on: '',
    labels: [],
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (edit.opened) {
      return initTaskWebSocket(task);
    }
  }, [edit.opened]);

  useEffect(() => {
    if (edit.opened && task) {
      setData({
        group_id: task?.group_id || '',
        assigned_to_user_id: task?.assigned_to_user_id || '',
        name: task?.name || '',
        description: task?.description || '',
        due_on: task?.due_on ? dayjs(task?.due_on).toDate() : '',
        subscribed_users: (task?.subscribed_users || []).map(i => i.id.toString()),
        labels: (task?.labels || []).map(i => i.id),
      });
      setTimeout(() => {
        editorRef.current?.setContent(task?.description || '');
      }, 300);
    }
  }, [edit.opened, task]);

  const validateField = (field, value) => {
    const requiredFields = ['name', 'group_id', 'assigned_to_user_id', 'due_on'];
    if (requiredFields.includes(field) && !value) {
      return `${field.replaceAll('_', ' ')} is required`;
    }
    return null;
  };

  const updateValue = (field, value) => {
    const error = validateField(field, value);
    setErrors({ ...errors, [field]: error });
    setData({ ...data, [field]: value });

    if (error) return; // stop if validation fails

    const dropdowns = ['labels', 'subscribed_users'];
    const onBlurInputs = ['name', 'description'];

    if (dropdowns.includes(field)) {
      const options = {
        labels: value.map(id => labels.find(i => i.id === id)),
        subscribed_users: value.map(id =>
          usersWithAccessToProject.find(i => i.id.toString() === id)
        ),
      };
      updateTaskProperty(task, field, value, options[field]);
    } else if (!onBlurInputs.includes(field)) {
      updateTaskProperty(task, field, value);
    }
  };

  const onBlurUpdate = property => {
    const error = validateField(property, data[property]);
    setErrors({ ...errors, [property]: error });
    if (!error) updateTaskProperty(task, property, data[property]);
  };

  return (
    <Drawer
      opened={edit.opened}
      onClose={closeEditTask}
      title={
        <Group ml={25} my="sm" wrap="nowrap">
          <Checkbox
            size="md"
            radius="xl"
            color="green"
            checked={task?.completed_at !== null}
            onChange={e => complete(task, e.currentTarget.checked)}
            className={can('complete task') ? classes.checkbox : classes.disabledCheckbox}
          />
          <Text
            fz={rem(27)}
            fw={600}
            lh={1.2}
            td={task?.completed_at !== null ? 'line-through' : null}
          >
            #{task?.number}: {data.name}
          </Text>
        </Group>
      }
      position="right"
      size={1000}
      overlayProps={{ backgroundOpacity: 0.55, blur: 3 }}
      transitionProps={{
        transition: 'slide-left',
        duration: 400,
        timingFunction: 'ease',
      }}
    >
      {task ? (
        <>
          <Breadcrumbs
            c="dark.3"
            ml={24}
            mb="xs"
            separator="I"
            separatorMargin="sm"
            styles={{ separator: { opacity: 0.3 } }}
          >
            <Text size="xs">{task.project.name}</Text>
            <Text size="xs">Task #{task.number}</Text>
            <Text size="xs">
              Created by {task.created_by_user.name} on {date(task.created_at)}
            </Text>
          </Breadcrumbs>

          <form className={classes.inner}>
            <div className={classes.content}>
              <TextInput
                label="Name"
                placeholder="Task name"
                required
                value={data.name}
                onChange={e => updateValue('name', e.target.value)}
                onBlur={() => onBlurUpdate('name')}
                error={errors.name}
                readOnly={!can('edit task')}
              />

              <RichTextEditor
                ref={editorRef}
                mt="xl"
                placeholder="Task description"
                content={data.description}
                height={260}
                onChange={content => updateValue('description', content)}
                onBlur={() => onBlurUpdate('description')}
                readOnly={!can('edit task')}
              />

              {can('edit task') && (
                <Dropzone
                  mt="xl"
                  selected={task.attachments}
                  onChange={files => uploadAttachments(task, files)}
                  remove={index => deleteAttachment(task, index)}
                />
              )}

              {can('view comments') && <Comments task={task} />}
            </div>
            
            <div className={classes.sidebar}>
              <Select
                label="Task group"
                placeholder="Select task group"
                required
                allowDeselect={false}
                value={data.group_id?.toString()}
                onChange={value => updateValue('group_id', value)}
                error={errors.group_id}
                data={taskGroups.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
              />

              <Select
                label="Assignee"
                placeholder="Select assignee"
                searchable
                required
                mt="md"
                value={data.assigned_to_user_id?.toString()}
                onChange={value => updateValue('assigned_to_user_id', value)}
                error={errors.assigned_to_user_id}
                data={usersWithAccessToProject.map(i => ({
                  value: i.id.toString(),
                  label: i.name,
                }))}
                readOnly={!can('edit task')}
              />
              <DateInput
                clearable={false}
                required
                valueFormat="DD MMM YYYY"
                minDate={new Date()}
                mt="md"
                label="Due date"
                placeholder="Pick task due date"
                value={data.due_on}
                onChange={value => updateValue('due_on', value)}
                error={errors.due_on}
                readOnly={!can('edit task')}
              />
              <MultiSelect
                label="Subscribers"
                placeholder="Select users to subscribe"
                mt="md"
                value={data.subscribed_users || []}
                onChange={value => updateValue('subscribed_users', value)}
                data={usersWithAccessToProject.map(user => ({
                  value: user.id?.toString() || '',
                  label: user.name || 'Unnamed User',
                }))}
                readOnly={!can('edit task')}
                searchable={false} // <-- disables search, placeholder disappears after selection
              />
            </div>
          </form>
        </>
      ) : null}
    </Drawer>
  );
}