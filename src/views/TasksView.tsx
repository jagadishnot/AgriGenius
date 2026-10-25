import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Task, Farm, CropCycle, TaskPriority, TaskCategory } from '../types';

interface TasksViewProps {
  tasks: Task[];
  farms: Farm[];
  cropCycles: CropCycle[];
  selectedFarmId: string;
  onAddTask: (task: Partial<Task>) => Promise<void>;
  onToggleTask: (taskId: string) => Promise<void>;
  onDeleteTask: (taskId: string) => Promise<void>;
}

export const TasksView: React.FC<TasksViewProps> = ({
  tasks,
  farms,
  cropCycles,
  selectedFarmId,
  onAddTask,
  onToggleTask,
  onDeleteTask,
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    farm_id: selectedFarmId || (farms[0]?.id ?? ''),
    title: '',
    description: '',
    category: 'scouting' as TaskCategory,
    due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    priority: 'medium' as TaskPriority,
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'pending') return t.status === 'pending';
    if (filterStatus === 'completed') return t.status === 'completed';
    return true;
  });

  const handleOpenModal = () => {
    setFormData({
      farm_id: selectedFarmId || (farms[0]?.id ?? ''),
      title: '',
      description: '',
      category: 'scouting',
      due_date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
      priority: 'medium',
    });
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.farm_id || !formData.due_date) {
      setFormError('Please enter a task title, select a farm, and set a due date.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    try {
      await onAddTask(formData);
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-emerald-400" />
            <span>Field Tasks & Reminders Manager</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            Persisted operational schedule for scouting, fertigation cycles, nozzle cleanups, and soil sampling.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Field Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
        {(['all', 'pending', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer ${
              filterStatus === tab
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'text-stone-400 hover:text-white hover:bg-stone-800'
            }`}
          >
            {tab} Tasks ({tasks.filter((t) => tab === 'all' ? true : t.status === tab).length})
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 bg-stone-900 border border-stone-800 rounded-2xl p-6">
            <CheckCircle2 className="w-10 h-10 text-stone-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-300">No tasks in this view</p>
            <p className="text-xs text-stone-500 mt-1">You are all caught up on scheduled field tasks.</p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const farm = farms.find((f) => f.id === task.farm_id);
            const isDone = task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`bg-stone-900 border rounded-2xl p-4 transition-all flex items-start gap-4 ${
                  isDone
                    ? 'border-stone-800/60 bg-stone-950/40 opacity-70'
                    : 'border-stone-800 hover:border-emerald-700/80'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isDone}
                  onChange={() => onToggleTask(task.id)}
                  className="mt-1 w-5 h-5 accent-emerald-500 rounded cursor-pointer shrink-0"
                />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                    <h3 className={`text-base font-bold truncate ${isDone ? 'line-through text-stone-400' : 'text-white'}`}>
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        task.priority === 'urgent' || task.priority === 'high'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : task.priority === 'medium'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-stone-800 text-stone-300'
                      }`}>
                        {task.priority} Priority
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-stone-950 border border-stone-800 text-stone-400">
                        {task.category}
                      </span>
                    </div>
                  </div>

                  {task.description && (
                    <p className="text-xs text-stone-400 leading-relaxed mb-2">
                      {task.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 border-t border-stone-800/60">
                    <span>
                      Farm: <strong className="text-stone-300">{farm?.farm_name || 'Shivaji Hills'}</strong>
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-stone-400" />
                        <span>Due: {task.due_date}</span>
                      </span>
                      <button
                        onClick={() => onDeleteTask(task.id)}
                        className="text-stone-500 hover:text-rose-400 cursor-pointer transition-colors"
                        title="Delete task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-lg w-full p-6 text-white shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-400" />
                <span>Create Field Task</span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-stone-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Clean Sand Filters & Check Lateral Pressure"
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Target Farm *</label>
                <select
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                >
                  {farms.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.farm_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="scouting">Crop Scouting / Pest Inspection</option>
                    <option value="irrigation">Irrigation & Drip Operation</option>
                    <option value="fertilizer">Fertigation & Manure</option>
                    <option value="pesticide">Bio-pesticide / IPM Spray</option>
                    <option value="harvesting">Harvesting Preparation</option>
                    <option value="soil_test">Soil / Water Lab Sampling</option>
                    <option value="general">General Maintenance</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-300 mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="urgent">Urgent Action Required</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-300 mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Specific dosage, row numbers, or instructions..."
                  className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
