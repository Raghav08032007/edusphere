'use client';

import React, { useState } from 'react';
import { StudyTask, Priority, TaskStatus } from '../types';

interface TaskPlannerProps {
  tasks: StudyTask[];
  onAddTask: (task: Omit<StudyTask, 'id'>) => void;
  onToggleStatus: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (task: StudyTask) => void;
  onEarnXP?: (xp: number) => void;
}

export const TaskPlanner: React.FC<TaskPlannerProps> = ({
  tasks,
  onAddTask,
  onToggleStatus,
  onDeleteTask,
  onUpdateTask,
  onEarnXP,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('All');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New task form state
  const [newTitle, setNewTitle] = useState('');
  const [newSubject, setNewSubject] = useState('Machine Learning');
  const [newDueDate, setNewDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [newMinutes, setNewMinutes] = useState(45);
  const [newPriority, setNewPriority] = useState<Priority>('high');
  const [newNotes, setNewNotes] = useState('');

  // Extract unique subjects
  const subjects = ['All', ...Array.from(new Set(tasks.map((t) => t.subject)))];

  const subjectColors: Record<string, string> = {
    'Machine Learning': '#ff6200',
    'Distributed Systems': '#0284c7',
    'Neuroscience': '#059669',
    'Linear Algebra': '#d97706',
    'Algorithms': '#7c3aed',
    'General': '#475569',
  };

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.notes && t.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesSubject = selectedSubject === 'All' || t.subject === selectedSubject;
    const matchesPriority = selectedPriority === 'All' || t.priority === selectedPriority;
    const matchesStatus =
      selectedStatus === 'All' ||
      (selectedStatus === 'todo' && t.status === 'todo') ||
      (selectedStatus === 'in-progress' && t.status === 'in-progress') ||
      (selectedStatus === 'completed' && t.status === 'completed');

    return matchesSearch && matchesSubject && matchesPriority && matchesStatus;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onAddTask({
      title: newTitle.trim(),
      subject: newSubject,
      subjectColor: subjectColors[newSubject] || '#ff6200',
      dueDate: newDueDate,
      estimatedMinutes: Number(newMinutes),
      priority: newPriority,
      status: 'todo',
      notes: newNotes.trim() || undefined,
    });

    setNewTitle('');
    setNewNotes('');
    setIsModalOpen(false);
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'high':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
            High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
            Medium Priority
          </span>
        );
      case 'low':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-600 border border-slate-200">
            Low Priority
          </span>
        );
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Stats */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-700 text-xs font-black mb-2">
            <span>📋 Study Plan Pipeline</span>
          </div>
          <h2 className="font-heading text-2xl sm:text-3xl font-black tracking-tight text-slate-900 flex items-center gap-2">
            <span>Task Planner &amp; Academic Pipeline</span>
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            Organize coursework, laboratory derivations, and MVSAT practice sprints to maintain your study streak.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full md:w-auto">
          {/* Progress Widget */}
          <div className="flex-1 md:w-56 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
            <div className="flex justify-between text-xs font-bold mb-1.5">
              <span className="text-slate-600">Completion Velocity</span>
              <span className="text-orange-600 font-mono-code font-black">
                {completedCount}/{tasks.length} ({progressPercent}%)
              </span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Add Task Button */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <span>+</span>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-col md:flex-row items-center gap-3 shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1 w-full">
          <svg
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search tasks, formulas, topics..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500 transition-colors"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Subject Filter */}
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            {subjects.map((s) => (
              <option key={s} value={s}>
                {s === 'All' ? 'All Subjects' : s}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            <option value="All">All Priorities</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 focus:outline-none focus:border-orange-500"
          >
            <option value="All">All Statuses</option>
            <option value="todo">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Task List Grid */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs">
            <span className="text-4xl">🔍</span>
            <h3 className="font-heading text-lg font-black text-slate-800 mt-3">
              No matching tasks found
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Adjust your search filters or create a new study objective above.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const isDone = task.status === 'completed';
            const isInProgress = task.status === 'in-progress';

            return (
              <div
                key={task.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-xs ${
                  isDone ? 'opacity-70 bg-slate-50/70' : 'hover:border-orange-300'
                }`}
              >
                {/* Left: Checkbox & Info */}
                <div className="flex items-start sm:items-center gap-3.5 flex-1">
                  {/* Status Toggle Checkbox */}
                  <button
                    onClick={() => {
                      onToggleStatus(task.id);
                      if (!isDone && onEarnXP) onEarnXP(25);
                    }}
                    className={`mt-1 sm:mt-0 w-6 h-6 rounded-xl border flex items-center justify-center transition-all ${
                      isDone
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-xs'
                        : isInProgress
                        ? 'bg-orange-50 border-orange-500 text-orange-600'
                        : 'border-slate-300 hover:border-orange-500 bg-white'
                    }`}
                    title={isDone ? 'Mark as incomplete' : 'Mark as completed (+25 XP)'}
                  >
                    {isDone ? (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : isInProgress ? (
                      <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    ) : null}
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="text-sm sm:text-base font-black transition-all font-heading"
                        style={{
                          textDecoration: isDone ? 'line-through' : 'none',
                          color: isDone ? '#94a3b8' : '#0f172a',
                        }}
                      >
                        {task.title}
                      </span>
                      {getPriorityBadge(task.priority)}
                      {task.assignedByStaff && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Faculty Assigned
                        </span>
                      )}
                    </div>

                    {task.notes && (
                      <p className="text-xs text-slate-500 max-w-2xl line-clamp-2">
                        {task.notes}
                      </p>
                    )}

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
                      {/* Subject Tag */}
                      <span
                        className="flex items-center gap-1 font-bold"
                        style={{ color: task.subjectColor }}
                      >
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{ backgroundColor: task.subjectColor }}
                        />
                        {task.subject}
                      </span>

                      {/* Due Date */}
                      <span className="flex items-center gap-1 text-slate-500">
                        📅 Due: {task.dueDate}
                      </span>

                      {/* Estimated Time */}
                      <span className="flex items-center gap-1 text-slate-500">
                        ⏱️ {task.estimatedMinutes} mins
                      </span>

                      {/* Status indicator */}
                      <span
                        className={`capitalize px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          task.status === 'completed'
                            ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                            : task.status === 'in-progress'
                            ? 'text-orange-700 bg-orange-50 border border-orange-200'
                            : 'text-slate-600 bg-slate-100 border border-slate-200'
                        }`}
                      >
                        {task.status === 'completed'
                          ? 'Completed'
                          : task.status === 'in-progress'
                          ? 'In Progress'
                          : 'To Do'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => {
                      const nextStatus: TaskStatus =
                        task.status === 'todo'
                          ? 'in-progress'
                          : task.status === 'in-progress'
                          ? 'completed'
                          : 'todo';
                      onUpdateTask({ ...task, status: nextStatus });
                      if (nextStatus === 'completed' && onEarnXP) onEarnXP(25);
                    }}
                    className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 transition-colors"
                    title="Advance Status"
                  >
                    Advance Status →
                  </button>

                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Delete Task"
                    aria-label="Delete Task"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-heading text-lg font-black text-slate-900 flex items-center gap-2">
                <span>✨</span>
                <span>Create Study Objective</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Derive Attention Mechanism Softmax Gradients"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Subject Area
                  </label>
                  <select
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 font-bold"
                  >
                    <option value="Machine Learning">Machine Learning</option>
                    <option value="Distributed Systems">Distributed Systems</option>
                    <option value="Neuroscience">Neuroscience</option>
                    <option value="Linear Algebra">Linear Algebra</option>
                    <option value="Algorithms">Algorithms</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as Priority)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500 font-bold"
                  >
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    required
                    value={newDueDate}
                    onChange={(e) => setNewDueDate(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estimated Minutes
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="300"
                    value={newMinutes}
                    onChange={(e) => setNewMinutes(Number(e.target.value))}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:bg-white focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Notes &amp; Formulas (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="Key theorems, textbook chapters, or reference formulas..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#ff6200] hover:bg-[#ea580c] text-white text-xs font-black shadow-md shadow-orange-500/20"
                >
                  Add to Pipeline →
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
