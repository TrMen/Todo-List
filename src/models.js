// Models for projects, tasks and subtasks

import pubSub from './pubsub';

const DEFAULT_ICONS = Array.from({ length: 11 }).map((entry, index) => `assets/icons/${index}.png`);

function randomIcon() {
  const randomChoice = Math.floor(Math.random() * DEFAULT_ICONS.length);
  return DEFAULT_ICONS[randomChoice];
}

export const SubTask = (title, completed = false) => {
  const subTask = {};

  subTask.title = title;
  subTask.completed = completed;

  subTask.complete = () => {
    subTask.completed = true;
  };
  subTask.uncomplete = () => {
    subTask.completed = false;
  };

  return subTask;
};

export const Task = (title, projectTitle, description = '', dueDate = '', priority = 0, subTasks = [], completed = false) => {
  const task = {};

  task.title = title;
  task.projectTitle = projectTitle;

  task.description = description;
  task.dueDate = dueDate;
  task.priority = priority;

  task.subTasks = subTasks;
  subTasks.forEach((subTask) => {
    pubSub.subscribe(`complete subtask ${subTask.title}`,
      (parentTask, container) => {
        if (task === parentTask) {
          subTask.complete();
          pubSub.emit('changed sub task structure', container, task);
        }
      });
    pubSub.subscribe(`uncomplete subtask ${subTask.title}`,
      (parentTask, container) => {
        if (task === parentTask) {
          subTask.uncomplete();
          pubSub.emit('changed sub task structure', container, task);
        }
      });
  });

  task.addSubTask = (subTaskTitle) => {
    const newSubTask = SubTask(subTaskTitle);
    pubSub.subscribe(`complete subtask ${newSubTask.title}`,
      (parentTask, container) => {
        if (task === parentTask) {
          newSubTask.complete();
          pubSub.emit('changed sub task structure', container, task);
        }
      });
    pubSub.subscribe(`uncomplete subtask ${newSubTask.title}`,
      (parentTask, container) => {
        if (task === parentTask) {
          newSubTask.uncomplete();
          pubSub.emit('changed sub task structure', container, task);
        }
      });
    task.subTasks.push(newSubTask);
  };

  task.completed = completed;

  pubSub.subscribe(`task ${task.title} uncompleted`, (uncompletedTask) => {
    if (task === uncompletedTask) {
      task.completed = false;
      pubSub.emit('changed task content');
    }
  });
  pubSub.subscribe(`task ${task.title} completed`, (completedTask) => {
    if (task === completedTask) {
      task.completed = true;
      pubSub.emit('changed task content');
    }
  });

  pubSub.subscribe(`add sub task to ${task.title}`, (containingTask, subTaskTitle, container) => {
    if (task === containingTask) {
      task.addSubTask(subTaskTitle);
      pubSub.emit('changed sub task structure', container, task);
    }
  });
  pubSub.subscribe(`delete sub task of ${task.title}`, (subTask, container) => {
    if (task.subTasks.includes(subTask)) {
      task.subTasks.splice(task.subTasks.indexOf(subTask), 1);
      pubSub.emit('changed sub task structure', container, task);
    }
  });

  pubSub.subscribe(`edit task ${task.title}`, (oldTask, newTitle, newDescription, newDate, newPriority) => {
    if (oldTask !== task) return;

    const correctedPriority = Math.max(0, Math.min(10, newPriority)) || task.priority;

    const newTask = Task(newTitle || task.title, task.projectTitle,
      newDescription || task.description, newDate
       || task.dueDate, correctedPriority, task.subTasks, task.completed);
    tasks[tasks.indexOf(task)] = newTask;
    pubSub.emit('edited task content');
  });
  return task;
};

function isProjectTitleUnique(projectTitle) {
  return !projects.map((project) => project.title).includes(projectTitle);
}
function renameTaskProjectTitles(oldTitle, newTitle) {
  tasks.forEach((task) => {
    // eslint-disable-next-line no-param-reassign
    if (task.projectTitle === oldTitle) task.projectTitle = newTitle;
  });
}

export const Project = (title, icon) => {
  const project = {};

  project.title = title;
  project.icon = icon || randomIcon();

  pubSub.subscribe(`change project name of ${project.title}`, (newTitle) => {
    const oldTitle = project.title;
    if (isProjectTitleUnique(newTitle)) {
      renameTaskProjectTitles(oldTitle, newTitle);
      project.title = newTitle;
    }
    pubSub.emit('changed project name', oldTitle, newTitle);
  });

  return project;
};

export const Filter = (title, callback, icon) => {
  const filter = {};

  filter.title = title;
  filter.callback = callback;
  filter.icon = icon || randomIcon();

  return filter;
};


(function initTaskHandling() {
  pubSub.subscribe('add task', (filterTitle, taskTitle, taskDescription, taskDueDate, taskPriority, subTasks) => {
    tasks.push(Task(taskTitle, filterTitle, taskDescription,
      taskDueDate, taskPriority, subTasks));
    pubSub.emit('changed task structure');
  });

  pubSub.subscribe('delete task', (task) => {
    const taskIndex = tasks.indexOf(task);
    if (taskIndex >= 0) {
      tasks.splice(taskIndex, 1);
      pubSub.emit('changed task structure');
    }
  });

  pubSub.subscribe('add project', (projectTitle = 'Todo', icon) => {
    if (projects.filter((project) => project.title === projectTitle).length === 0
    && filters.filter((filter) => filter.title === projectTitle).length === 0) {
      projects.push(Project(projectTitle, icon || randomIcon()));
      pubSub.emit('changed project structure');
    }
  });

  pubSub.subscribe('delete project', (projectTitle) => {
    const projectIndex = projects.findIndex((project) => project.title === projectTitle);
    if (projectIndex >= 0) {
      tasks.splice(0, tasks.length,
        ...tasks.filter((task) => task.projectTitle !== projectTitle));
      pubSub.emit('changed task structure');

      projects.splice(projectIndex, 1);
      pubSub.emit('changed project structure', projectTitle);
    }
  });
}());

let tasks = [];

let projects = [];

let filters = [];

export function getFilters() {
  return filters;
}

export function setFilters(newFilters) {
  filters = newFilters;
}

export function setProjects(newProjects) {
  projects = newProjects;
}

export function getProjects() {
  return projects;
}

export function getTasks() {
  return tasks;
}

export function setTasks(newTasks) {
  tasks = newTasks;
}
