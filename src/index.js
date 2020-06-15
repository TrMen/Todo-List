// A simple client-side only todo list
// Perhaps this will be extended later for usage with some cloud storage API

import {
  renderTasksDisplay, reRenderDisplay, reRenderSubTasks, getActiveDisplay,
} from './taskRendering';
import {
  getTasks, setTasks, getProjects, setProjects, getFilters,
  setFilters, Filter, Task, SubTask, Project,
} from './models';
import pubSub from './pubsub';
import renderFilterDisplay from './filterRendering';
import { addDeleteButtons, addProjectAdding, makeProjectsEditable } from './projectHandling';
import addQuickFind from './quickfind';
import * as Storage from './storage';
import { DEFAULT_FILTERS, DEFAULT_PROJECTS, DEFAULT_TASKS } from './defaults';

const projectDisplay = document.getElementById('project-display');
const pseudoProjectSelection = document.getElementById('pseudo-project-selection');
const projectSelection = document.getElementById('project-selection');
const addProjectContainer = document.getElementById('add-project-container');
const quickFindContainer = document.getElementById('quick-find');

function renderSelection() {
  const projectFilters = getProjects().map(
    (project) => Filter(project.title,
      (task) => task.projectTitle === project.title, project.icon),
  );
  renderFilterDisplay(pseudoProjectSelection, getFilters(), getTasks());

  renderFilterDisplay(projectSelection, projectFilters, getTasks());
  makeProjectsEditable(projectSelection, getProjects());
  addDeleteButtons(projectSelection, getProjects());
}

function initRenderingHandling() {
  pubSub.subscribe('clicked filter', (filter) => {
    renderTasksDisplay(projectDisplay, filter.title, getTasks(), filter.callback);
  });

  pubSub.subscribe('changed task structure', () => {
    Storage.store('tasks', getTasks());
    renderSelection();
    reRenderDisplay(getTasks());
  });

  pubSub.subscribe('changed sub task structure', (container, task) => {
    Storage.store('tasks', getTasks());
    reRenderSubTasks(container, task);
    renderSelection();
  });

  pubSub.subscribe('changed project name', (oldTitle, newTitle) => {
    Storage.store('projects', getProjects());
    Storage.store('tasks', getTasks());
    if (oldTitle === getActiveDisplay().title) {
      renderTasksDisplay(projectDisplay, newTitle,
        getTasks(), (task) => task.projectTitle === newTitle);
    }
    renderSelection();
  });

  pubSub.subscribe('changed task content', () => Storage.store('tasks', getTasks()));

  pubSub.subscribe('edited task content', () => {
    Storage.store('tasks', getTasks());
    renderSelection();
    reRenderDisplay(getTasks());
  });

  pubSub.subscribe('changed project structure', (projectTitle) => {
    if (getActiveDisplay().title === projectTitle) {
      renderTasksDisplay(projectDisplay, getFilters()[0].title, getTasks(), getFilters()[0].filter);
    }
    Storage.store('projects', getProjects());
    renderSelection(projectTitle);
  });

  pubSub.subscribe('execute quick find', (text) => {
    const callback = (task) => task.title.includes(text);
    const count = getTasks().filter(callback).length;
    renderTasksDisplay(projectDisplay, `Search: '${text}' ${count} Hits`, getTasks(), callback);
  });

  pubSub.subscribe('sort by', (category) => {
    reRenderDisplay(null, category);
  });
}

function constructTasks(tasks) {
  // Make tasks with proper references from JSON data
  return tasks.map((t) => {
    const subTasks = t.subTasks.map((s) => SubTask(s.title, s.completed));
    return Task(t.title, t.projectTitle, t.description,
      t.dueDate, t.priority, subTasks, t.completed);
  });
}

function constructProjects(projects) {
  return projects.map((p) => Project(p.title, p.icon));
}

// Initial Render

setProjects(constructProjects(Storage.load('projects') || DEFAULT_PROJECTS));
setTasks(constructTasks(Storage.load('tasks') || DEFAULT_TASKS));
setFilters(DEFAULT_FILTERS);

initRenderingHandling();

addQuickFind(quickFindContainer);

renderSelection();

addProjectAdding(addProjectContainer);

renderTasksDisplay(projectDisplay, getFilters()[0].title, getTasks(), getFilters()[0].callback);
