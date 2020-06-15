// Renders displays for filters and projects.
// Projects are just filters, so there is no special handling for them

import pubsub from './pubsub';

function renderFilter(filter, tasks) {
  const taskCount = tasks.filter(filter.callback).length;

  const filterWrapper = document.createElement('div');
  filterWrapper.classList.add('filter-wrapper');
  filterWrapper.addEventListener('click', () => {
    pubsub.emit('clicked filter', filter);
  });

  const icon = document.createElement('img');
  icon.src = filter.icon;
  icon.classList.add('filter-icon');

  const name = document.createElement('h2');
  name.classList.add('filter-name');
  name.textContent = filter.title;

  const tasksNumber = document.createElement('div');
  tasksNumber.classList.add('filter-task-number');
  tasksNumber.textContent = taskCount;

  filterWrapper.append(icon, name, tasksNumber);

  return filterWrapper;
}

export default function renderFilterDisplay(container, filters, tasks) {
  // eslint-disable-next-line no-param-reassign
  container.innerHTML = '';

  filters.forEach((filter) => {
    container.appendChild(renderFilter(filter, tasks));
  });
}
