import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';

import KanbanBoard from './KanbanBoard';
import { Task } from '../types/task';

// Mock child components to isolate the KanbanBoard
jest.mock('./AddTaskModal', () => (props: { onClose: () => void; onSubmit: (task: any) => void }) => (
  <div data-testid="add-task-modal">
    <button onClick={() => props.onSubmit({ title: 'New Mock Task', description: '', priority: 'medium' })}>
      Save Task
    </button>
    <button onClick={props.onClose}>Cancel</button>
  </div>
));

jest.mock('./TaskDetailModal', () => (props: { task: Task; onClose: () => void; onTaskDelete: (taskId: string) => void }) => (
  <div data-testid="task-detail-modal">
    <span>{props.task.title}</span>
    <button onClick={() => props.onTaskDelete(props.task.id)}>Delete Task</button>
    <button onClick={props.onClose}>Close</button>
  </div>
));

// Mock the timer storage utility
jest.mock('../utils/timer-storage', () => ({
  getActiveTimers: jest.fn(() => []),
  saveActiveTimer: jest.fn(),
  removeActiveTimer: jest.fn(),
}));

const mockTasks: Task[] = [
  { id: 'task-1', projectId: 'proj-1', title: 'Task in To Do', status: 'todo', priority: 'medium', position: 0, timeSpentMinutes: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'task-2', projectId: 'proj-1', title: 'Task in Progress', status: 'in_progress', priority: 'high', position: 0, timeSpentMinutes: 30, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
  { id: 'task-3', projectId: 'proj-1', title: 'Completed Task', status: 'completed', priority: 'low', position: 0, timeSpentMinutes: 60, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
];

describe('KanbanBoard Component', () => {
  const mockOnTaskUpdate = jest.fn();
  const mockOnTaskCreate = jest.fn();
  const mockOnTaskDelete = jest.fn();
  const mockOnTaskTimeUpdate = jest.fn();

  beforeEach(() => {
    // Clear mock history before each test
    jest.clearAllMocks();
  });

  test('renders tasks in their correct columns', () => {
    render(
      <KanbanBoard
        projectId="proj-1"
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
        onTaskDelete={mockOnTaskDelete}
        onTaskTimeUpdate={mockOnTaskTimeUpdate}
      />
    );

    // Find columns by their titles
    const todoColumn = screen.getByText('To Do').closest('div[data-rbd-droppable-id="todo"]');
    const inProgressColumn = screen.getByText('In Progress').closest('div[data-rbd-droppable-id="in_progress"]');
    const completedColumn = screen.getByText('Completed').closest('div[data-rbd-droppable-id="completed"]');

    // Check if tasks are rendered within the correct column
    expect(todoColumn).toHaveTextContent('Task in To Do');
    expect(inProgressColumn).toHaveTextContent('Task in Progress');
    expect(completedColumn).toHaveTextContent('Completed Task');

    // Ensure tasks are not in the wrong columns
    expect(todoColumn).not.toHaveTextContent('Task in Progress');
    expect(inProgressColumn).not.toHaveTextContent('Completed Task');
  });

  test('allows creating a new task', async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard
        projectId="proj-1"
        tasks={[]}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
        onTaskDelete={mockOnTaskDelete}
        onTaskTimeUpdate={mockOnTaskTimeUpdate}
      />
    );

    // Click the "Add new task" button
    const addTaskButton = screen.getByRole('button', { name: /add new task/i });
    await user.click(addTaskButton);

    // The mock AddTaskModal should be visible
    const modal = screen.getByTestId('add-task-modal');
    expect(modal).toBeInTheDocument();

    // Simulate saving the task from the modal
    const saveButton = screen.getByRole('button', { name: /save task/i });
    await user.click(saveButton);

    // Verify that the onTaskCreate prop was called with the correct data
    await waitFor(() => {
      expect(mockOnTaskCreate).toHaveBeenCalledTimes(1);
      expect(mockOnTaskCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Mock Task',
          projectId: 'proj-1',
          status: 'todo',
        })
      );
    });
  });

  test('allows deleting a task', async () => {
    const user = userEvent.setup();
    render(
      <KanbanBoard
        projectId="proj-1"
        tasks={mockTasks}
        onTaskUpdate={mockOnTaskUpdate}
        onTaskCreate={mockOnTaskCreate}
        onTaskDelete={mockOnTaskDelete}
        onTaskTimeUpdate={mockOnTaskTimeUpdate}
      />
    );

    // Click on a task card to open the detail modal
    const taskCard = screen.getByText('Task in To Do');
    await user.click(taskCard);

    // The mock TaskDetailModal should be visible
    const modal = screen.getByTestId('task-detail-modal');
    expect(modal).toBeInTheDocument();

    // Simulate deleting the task from the modal
    const deleteButton = within(modal).getByRole('button', { name: /delete task/i });
    await user.click(deleteButton);

    // Verify that the onTaskDelete prop was called with the correct task ID
    await waitFor(() => {
      expect(mockOnTaskDelete).toHaveBeenCalledTimes(1);
      expect(mockOnTaskDelete).toHaveBeenCalledWith('task-1');
    });
  });

  test('handles drag-and-drop to update task status', async () => {
    let onDragEnd: (result: DropResult) => void;

    // `react-beautiful-dnd` requires a DragDropContext. We can grab the onDragEnd
    // function from it to test the logic directly.
    render(
      <DragDropContext onDragEnd={(result) => onDragEnd(result)}>
        <KanbanBoard
          projectId="proj-1"
          tasks={mockTasks}
          onTaskUpdate={mockOnTaskUpdate}
          onTaskCreate={mockOnTaskCreate}
          onTaskDelete={mockOnTaskDelete}
          onTaskTimeUpdate={mockOnTaskTimeUpdate}
        />
      </DragDropContext>
    );

    // The onDragEnd function is passed from the KanbanBoard component.
    // We can find it by looking for the component that uses it.
    const kanbanBoardInstance = screen.getByTestId('kanban-board'); // Add data-testid to KanbanBoard main div
    onDragEnd = kanbanBoardInstance.props.onDragEnd;

    // Simulate dragging 'Task in To Do' to the 'In Progress' column
    const dragResult: DropResult = {
      draggableId: 'task-1',
      source: { droppableId: 'todo', index: 0 },
      destination: { droppableId: 'in_progress', index: 1 },
      reason: 'DROP',
    };

    // Call the onDragEnd handler
    onDragEnd(dragResult);

    // Verify that onTaskUpdate was called with the new status and position
    await waitFor(() => {
      expect(mockOnTaskUpdate).toHaveBeenCalledTimes(1);
      expect(mockOnTaskUpdate).toHaveBeenCalledWith('task-1', {
        status: 'in_progress',
        position: 1,
        startedAt: expect.any(String), // Check that startedAt is set
      });
    });
  });
});

function within(modal: HTMLElement) {
    throw new Error('Function not implemented.');
}