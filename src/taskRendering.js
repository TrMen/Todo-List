// Renders a selection of tasks to a container in the DOM

import pubSub from './pubsub';

function createAddSubTask(task, container) {
  const addSubTaskDiv = document.createElement('div');
  addSubTaskDiv.classList.add('add-project-container');

  const redPlus = document.createElement('span');
  redPlus.classList.add('red-plus');
  redPlus.textContent = '+';
  redPlus.addEventListener('click', (event) => {
    const subTaskTitle = addSubTaskInput.value;
    if (subTaskTitle) pubSub.emit(`add sub task to ${task.title}`, task, subTaskTitle, container);
    addSubTaskInput.value = '';
    event.stopPropagation();
  });

  const addSubTaskInput = document.createElement('input');
  addSubTaskInput.type = 'text';
  addSubTaskInput.placeholder = 'Add sub task';
  addSubTaskInput.classList.add('add-input');
  addSubTaskInput.style.width = '100%';
  addSubTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const subTaskTitle = addSubTaskInput.value;
      if (subTaskTitle) pubSub.emit(`add sub task to ${task.title}`, task, subTaskTitle, container);
      addSubTaskInput.value = '';
      return false; // Prevents bubbling
    }
    return true;
  });
  addSubTaskInput.addEventListener('click', (event) => event.stopPropagation());

  addSubTaskDiv.append(redPlus, addSubTaskInput);

  return addSubTaskDiv;
}

function toggleSubTaskCompleted(subTask, task, container, event) {
  if (this.classList.contains('subtask-checkbox-completed')) {
    pubSub.emit(`uncomplete subtask ${subTask.title}`, task, container);
  } else {
    pubSub.emit(`complete subtask ${subTask.title}`, task, container);
  }
  event.stopPropagation();
}

function deleteSubTask(task, subTask, container, event) {
  pubSub.emit(`delete sub task of ${task.title}`, subTask, container);
  // this.remove();
  event.stopPropagation();
}

function createSubTasks(task, container) {
  const { subTasks } = task;
  const subTaskContainer = document.createElement('div');
  subTaskContainer.classList.add('subtask-container');
  subTaskContainer.classList.add('subtasks-hidden');

  subTasks.forEach((subTask) => {
    const subTaskDiv = document.createElement('div');
    subTaskDiv.classList.add('subtask');

    const subTaskCheckbox = document.createElement('div');
    subTaskCheckbox.classList.add('subtask-checkbox');
    if (subTask.completed) subTaskCheckbox.classList.add('subtask-checkbox-completed');
    subTaskCheckbox.addEventListener('click', toggleSubTaskCompleted.bind(subTaskCheckbox, subTask, task, container));

    const subTaskContent = document.createElement('p');
    subTaskContent.textContent = subTask.title;
    subTaskContent.classList.add('task-note-content');

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.classList.add('delete-task');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = 'auto';
    deleteButton.addEventListener('click', deleteSubTask.bind(subTaskDiv, task, subTask, container));

    subTaskDiv.append(subTaskCheckbox, subTaskContent, deleteButton);
    subTaskContainer.appendChild(subTaskDiv);
  });

  subTaskContainer.appendChild(createAddSubTask(task, container));

  return subTaskContainer;
}

function toggleTaskCompleted(task, event) {
  if (this.classList.contains('task-checkbox-completed')) {
    this.classList.remove('task-checkbox-completed');
    pubSub.emit(`task ${task.title} uncompleted`, task);
  } else {
    this.classList.add('task-checkbox-completed');
    pubSub.emit(`task ${task.title} completed`, task);
  }
  event.stopPropagation();
}

function toggleExpandTask() {
  const subtasks = this.querySelector('.subtask-container');
  if (subtasks.classList.contains('subtasks-hidden')) {
    subtasks.classList.remove('subtasks-hidden');
  } else {
    subtasks.classList.add('subtasks-hidden');
  }
}

function deleteTask(task, event) {
  pubSub.emit('delete task', task);
  event.stopPropagation();
}

function createEditForm(task) {
  const existingForm = document.getElementById('edit-form');
  if (existingForm) existingForm.remove();

  const editForm = document.createElement('div');
  editForm.id = 'edit-form';
  editForm.classList.add('edit-form');

  const editHeader = document.createElement('div');
  editHeader.classList.add('edit-header');
  editHeader.textContent = 'Edit Task:';

  const titleLabel = document.createElement('label');
  titleLabel.classList.add('edit-label');
  titleLabel.textContent = 'Title: ';
  const editTitle = document.createElement('input');
  editTitle.type = 'text';
  editTitle.classList.add('edit-input');
  editTitle.placeholder = 'Enter a new title...';
  titleLabel.appendChild(editTitle);

  const descriptionLabel = document.createElement('label');
  descriptionLabel.classList.add('edit-label');
  descriptionLabel.textContent = 'Description: ';
  const editDescription = document.createElement('input');
  editDescription.type = 'text';
  editDescription.classList.add('edit-input');
  editDescription.placeholder = 'Enter a new description...';
  descriptionLabel.appendChild(editDescription);

  const dateLabel = document.createElement('label');
  dateLabel.classList.add('edit-label');
  dateLabel.textContent = 'Due: ';
  const editDate = document.createElement('input');
  editDate.type = 'date';
  editDate.classList.add('edit-input');
  dateLabel.appendChild(editDate);

  const priorityLabel = document.createElement('label');
  priorityLabel.classList.add('edit-label');
  priorityLabel.textContent = 'Priority: ';
  const editPriority = document.createElement('input');
  editPriority.classList.add('edit-input');
  editPriority.value = task.priority;
  editPriority.type = 'number';
  editPriority.min = '0';
  editPriority.max = '10';
  priorityLabel.appendChild(editPriority);

  const buttons = document.createElement('div');
  buttons.classList.add('buttons');

  const cancelButton = document.createElement('button');
  cancelButton.type = 'button';
  cancelButton.textContent = 'CANCEL';
  cancelButton.classList.add('cancel-button');
  cancelButton.addEventListener('click', () => {
    editForm.remove();
  });

  const confirmButton = document.createElement('button');
  confirmButton.type = 'button';
  confirmButton.textContent = 'Confirm';
  confirmButton.classList.add('confirm-button');
  confirmButton.addEventListener('click', () => {
    pubSub.emit(`edit task ${task.title}`, task, editTitle.value, editDescription.value,
      editDate.value, editPriority.value);
    editForm.remove();
  });

  buttons.append(cancelButton, confirmButton);

  editForm.append(editHeader, titleLabel, descriptionLabel, dateLabel, priorityLabel, buttons);

  editForm.addEventListener('click', (event) => { event.stopPropagation(); });

  return editForm;
}

function editTask(task, event) {
  pubSub.emit();
  this.appendChild(createEditForm(task));
  event.stopPropagation();
}

function createTask(task) {
  const taskDiv = document.createElement('div');
  taskDiv.classList.add('task-container');
  taskDiv.addEventListener('click', toggleExpandTask.bind(taskDiv));

  const titleWrapper = document.createElement('div');
  titleWrapper.classList.add('title-wrapper');

  const taskCheckbox = document.createElement('div');
  taskCheckbox.classList.add('task-checkbox');
  if (task.completed) {
    taskCheckbox.classList.add('task-checkbox-completed');
  }
  taskCheckbox.addEventListener('click', toggleTaskCompleted.bind(taskCheckbox, task));

  const title = document.createElement('h3');
  title.classList.add('task-title');
  title.textContent = task.title;

  const informationWrapper = document.createElement('div');
  informationWrapper.classList.add('information-wrapper');

  const priority = document.createElement('div');
  priority.classList.add('task-priority');
  priority.style.color = `rgb(${25 * +task.priority}, ${255 - (25 * +task.priority)}, 0)`;
  priority.textContent = `Priority: ${task.priority}`;

  const dueDate = document.createElement('div');
  dueDate.classList.add('task-due-date');
  dueDate.textContent = `Due: ${task.dueDate}`;

  const editButton = document.createElement('button');
  editButton.type = 'button';
  editButton.classList.add('edit-task');
  editButton.textContent = 'Edit';
  editButton.addEventListener('click', editTask.bind(taskDiv, task));

  const deleteButton = document.createElement('button');
  deleteButton.type = 'button';
  deleteButton.classList.add('delete-task');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', deleteTask.bind(taskDiv, task));

  informationWrapper.append(dueDate, priority, editButton, deleteButton);

  const description = document.createElement('p');
  description.classList.add('task-description');
  description.textContent = task.description;

  titleWrapper.append(taskCheckbox, title, informationWrapper);

  taskDiv.append(titleWrapper, description, createSubTasks(task, taskDiv));
  return taskDiv;
}

function createAddTask(filterTitle) {
  const addTaskDiv = document.createElement('div');
  addTaskDiv.classList.add('add-project-container');

  const redPlus = document.createElement('span');
  redPlus.classList.add('red-plus');
  redPlus.textContent = '+';
  redPlus.addEventListener('click', () => {
    const taskTitle = addTaskInput.value;
    if (taskTitle) pubSub.emit('add task', filterTitle, taskTitle);
    addTaskInput.value = '';
  });

  const addTaskInput = document.createElement('input');
  addTaskInput.type = 'text';
  addTaskInput.placeholder = 'Add task';
  addTaskInput.classList.add('add-input');
  addTaskInput.style.width = '100%';
  addTaskInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const taskTitle = addTaskInput.value;
      if (taskTitle) pubSub.emit('add task', filterTitle, taskTitle);
      addTaskInput.value = '';
      return false; // Prevents bubbling
    }
    return true;
  });

  addTaskDiv.append(redPlus, addTaskInput);

  return addTaskDiv;
}

let active = {
  tasks: [], title: 'No Title', container: null, filter: () => true,
};

export function getActiveDisplay() {
  return active;
}

function createSorting(sortedBy, category) {
  const button = document.createElement('button');
  button.type = 'button';
  button.classList.add('sort-button');
  if (category === sortedBy) button.classList.add('sorted-by');
  button.textContent = `Sort by ${category}`;
  button.addEventListener('click', () => pubSub.emit('sort by', category));

  return button;
}

export function renderTasksDisplay(container, title, tasks, filterCallback, sortedBy) {
  // eslint-disable-next-line no-param-reassign
  container.innerHTML = '';
  const relevantTasks = filterCallback ? tasks.filter(filterCallback) : tasks;

  active = {
    tasks, title, container, filter: filterCallback,
  };

  const topContainer = document.createElement('div');
  topContainer.classList.add('top-container');
  const displayTitle = document.createElement('h1');
  displayTitle.classList.add('display-title');
  displayTitle.textContent = title;
  topContainer.append(displayTitle, createSorting(sortedBy, 'Priority'), createSorting(sortedBy, 'Due Date'));
  container.appendChild(topContainer);

  relevantTasks.forEach((task) => {
    container.appendChild(createTask(task));
  });

  container.appendChild(createAddTask(title));
}

function sortBy(tasks, category) {
  let sortedTasks;
  if (category === 'Priority') {
    sortedTasks = [...tasks].sort((a, b) => b.priority - a.priority);
  } else if (category === 'Due Date') {
    sortedTasks = [...tasks].sort((a, b) => {
      if (!b.dueDate) return -1;
      if (!a.dueDate) return 1;
      return Date.parse(a.dueDate) - Date.parse(b.dueDate);
    });
  }
  return sortedTasks;
}

export function reRenderDisplay(newTasks, sortedBy) {
  // Re-renders the currently active display
  let tasks = newTasks || active.tasks;
  if (sortedBy) tasks = sortBy(tasks, sortedBy);
  renderTasksDisplay(active.container, active.title, tasks, active.filter, sortedBy);
}

export function reRenderSubTasks(taskContainer, task) {
  // eslint-disable-next-line no-param-reassign
  const subTaskContainer = taskContainer.querySelector('.subtask-container');
  subTaskContainer.remove();
  const newSubTaskContainer = createSubTasks(task, taskContainer);
  newSubTaskContainer.classList.remove('subtasks-hidden');
  taskContainer.appendChild(newSubTaskContainer);
}
