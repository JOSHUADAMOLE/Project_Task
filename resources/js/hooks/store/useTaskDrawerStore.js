import { replaceUrlWithoutReload } from '@/utils/route';
import { produce } from 'immer';
import { create } from 'zustand';

const useTaskDrawerStore = create((set, get) => ({
  create: {
    opened: false,
    group_id: null,
  },
  edit: {
    opened: false,
    task: {}, // always store a safe object
  },

  // Open Create Task Drawer
  openCreateTask: (groupId = null) => {
    set(produce(state => {
      state.create.opened = true;
      state.create.group_id = groupId;
    }));
  },

  // Close Create Task Drawer
  closeCreateTask: () => {
    set(produce(state => {
      state.create.opened = false;
      state.create.group_id = null;
    }));
  },

  // Open Edit Task Drawer
  openEditTask: (task) => {
    if (!task) return;

    // Replace URL optionally
    replaceUrlWithoutReload(
      route('projects.tasks.open', [task.project_id, task.id])
    );

    set(produce(state => {
      state.edit.opened = true;
      // Always store a safe task object
      state.edit.task = {
        id: task.id || null,
        project_id: task.project_id || null,
        name: task.name || '',
        description: task.description || '',
        created_by_user_id: task.created_by_user_id || null,
        assigned_to_user_id: task.assigned_to_user_id || null,
        group_id: task.group_id || null,
        subscribed_users: task.subscribed_users || [],
        attachments: task.attachments || [],
        due_on: task.due_on || null,
        completed_at: task.completed_at || null,
        labels: task.labels || [],
        assigned_to_user: task.assigned_to_user || null,
        number: task.number || null,
      };
    }));
  },

  // Close Edit Task Drawer
  closeEditTask: () => {
    const task = get().edit.task;
    if (task?.project_id) {
      replaceUrlWithoutReload(route('projects.tasks', task.project_id));
    }

    set(produce(state => {
      state.edit.opened = false;
      state.edit.task = {}; // reset task safely
    }));
  },
}));

export default useTaskDrawerStore;
