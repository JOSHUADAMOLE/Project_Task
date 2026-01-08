import createTaskAttachmentsSlice from '@/hooks/store/tasks/TaskAttachmentsSlice';
import createTaskCommentsSlice from '@/hooks/store/tasks/TaskCommentsSlice';
import createTaskTimeLogsSlice from '@/hooks/store/tasks/TaskTimeLogsSlice';
import createTaskWebSocketUpdatesSlice from '@/hooks/store/tasks/TaskWebSocketUpdatesSlice';
import { move, reorder } from '@/utils/reorder';
import axios from 'axios';
import { produce } from "immer";
import { create } from 'zustand';

const useTasksStore = create((set, get) => ({
  ...createTaskAttachmentsSlice(set, get),
  ...createTaskTimeLogsSlice(set, get),
  ...createTaskCommentsSlice(set, get),
  ...createTaskWebSocketUpdatesSlice(set, get),

  tasks: {},
  setTasks: (tasks) => set(() => ({ tasks: { ...tasks } })),

  // ========================
  // COMMENTS FOR TASKS
  // ========================
  comments: [],
  setComments: (comments) => set({ comments }),

  /**
   * Fetch comments safely
   */
  fetchComments: async (task, callback = () => {}) => {
    if (!task?.id) {
      callback();
      return;
    }

    try {
      const res = await axios.get(
        route("projects.tasks.comments", [task.project_id, task.id])
      );

      const commentsArray = Array.isArray(res.data?.comments)
        ? res.data.comments
        : Array.isArray(res.data)
        ? res.data
        : [];

      set({ comments: commentsArray });
    } catch (e) {
      // Ignore harmless empty responses
      if (e.response?.status !== 204) {
        console.error("Fetch comments error:", e);
        alert("Failed to fetch comments");
      }
    } finally {
      callback();
    }
  },

  /**
   * Save comment then refetch
   */
  saveComment: async (task, content, callback = () => {}) => {
    if (!task?.id || !content.trim()) return;

    try {
      await axios.post(
        route("projects.tasks.comments.store", [task.project_id, task.id]),
        { content }
      );

      // IMPORTANT: fetch after save finishes
      await get().fetchComments(task);
      callback();
    } catch (e) {
      console.error("Save comment error:", e);
      alert("Failed to save comment");
    }
  },

  // ========================
  // TASK OPERATIONS (UNCHANGED)
  // ========================
  addTask: (task) => {
    return set(produce(state => {
      const index = state.tasks[task.group_id].findIndex((i) => i.id === task.id);
      if (index === -1) {
        state.tasks[task.group_id].push(task);
      }
    }));
  },

  findTask: (id) => {
    for (const groupId in get().tasks) {
      const task = get().tasks[groupId].find((i) => i.id === id);
      if (task) return task;
    }
    return null;
  },

  updateTaskProperty: async (task, property, value, options = null) => {
    try {
      await axios.put(
        route("projects.tasks.update", [task.project_id, task.id]),
        { [property]: value },
        { progress: false }
      );

      return set(produce(state => {
        const index = state.tasks[task.group_id].findIndex((i) => i.id === task.id);

        if (property === 'group_id' && task.group_id !== value) {
          const result = move(state.tasks, task.group_id, value, index, 0);
          state.tasks[task.group_id] = result[task.group_id];
          state.tasks[value] = result[value];
          state.tasks[value][0][property] = value;
        } else {
          state.tasks[task.group_id][index][property] = options || value;
        }
      }));
    } catch (e) {
      console.error(e);
      alert("Failed to save task property change");
    }
  },

  complete: (task, checked) => {
    const newState = checked ? true : null;
    const index = get().tasks[task.group_id].findIndex((i) => i.id === task.id);

    axios.post(route("projects.tasks.complete", [task.project_id, task.id]), { completed: checked })
      .catch(() => alert("Failed to save task completed action"));

    return set(produce(state => {
      state.tasks[task.group_id][index].completed_at = newState;
    }));
  },

  reorderTask: (source, destination) => {
    const sourceGroupId = +source.droppableId.split("-")[1];
    const result = reorder(get().tasks[sourceGroupId], source.index, destination.index);

    axios.post(route("projects.tasks.reorder", [route().params.project]), {
      ids: result.map((i) => i.id),
      group_id: sourceGroupId,
      from_index: source.index,
      to_index: destination.index,
    }, { progress: false }).catch(() =>
      alert("Failed to save task reorder action")
    );

    return set(produce(state => {
      state.tasks[sourceGroupId] = result;
    }));
  },

  moveTask: (source, destination) => {
    const sourceGroupId = +source.droppableId.split("-")[1];
    const destinationGroupId = +destination.droppableId.split("-")[1];

    const result = move(get().tasks, sourceGroupId, destinationGroupId, source.index, destination.index);

    axios.post(route("projects.tasks.move", [route().params.project]), {
      ids: result[destinationGroupId].map((i) => i.id),
      from_group_id: sourceGroupId,
      to_group_id: destinationGroupId,
      from_index: source.index,
      to_index: destination.index,
    }, { progress: false }).catch(() =>
      alert("Failed to save task move action")
    );

    return set(produce(state => {
      state.tasks[sourceGroupId] = result[sourceGroupId];
      state.tasks[destinationGroupId] = result[destinationGroupId];
    }));
  },
}));

export default useTasksStore;
