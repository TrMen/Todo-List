// Projects are a special form of filter,
// that does not exist as far as the renderer is concerned

import pubSub from './pubsub';

export function addProjectAdding(container) {
  container.classList.add('add-container');

  const addProjectPlus = document.createElement('span');
  addProjectPlus.classList.add('red-plus');
  addProjectPlus.textContent = '+';

  const addProjectInput = document.createElement('input');
  addProjectInput.type = 'input';
  addProjectInput.classList.add('add-input');
  addProjectInput.placeholder = 'Add project';

  addProjectPlus.addEventListener('click', () => {
    const projectTitle = addProjectInput.value;
    if (projectTitle) pubSub.emit('add project', projectTitle);
    addProjectInput.value = '';
  });
  addProjectInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const projectTitle = addProjectInput.value;
      if (projectTitle) pubSub.emit('add project', projectTitle);
      addProjectInput.value = '';
      return false; // Prevents bubbling
    }
    return true;
  });

  container.append(addProjectPlus, addProjectInput);
}

function addDeleteButton(container, project) {
  const projectWrapper = [...container.querySelectorAll('h2')]
    .find((elem) => elem.textContent === project.title)
    .parentNode;

  const deleteFilter = document.createElement('button');
  deleteFilter.type = 'button';
  deleteFilter.textContent = 'Delete';
  deleteFilter.classList.add('delete-task');
  deleteFilter.style.marginLeft = '0';
  deleteFilter.addEventListener('click', (event) => {
    pubSub.emit('delete project', project.title);
    event.stopPropagation();
  });

  projectWrapper.appendChild(deleteFilter);
}

export function addDeleteButtons(container, projects) {
  projects.forEach((project) => {
    addDeleteButton(container, project);
  });
}

function makeEditable(element, projectTitle) {
  element.addEventListener('dblclick', () => {
    element.setAttribute('contentEditable', 'true');
    element.setAttribute('data-old', element.textContent);
    element.focus();
  });

  element.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      element.setAttribute('contentEditable', 'false');
      if (element.textContent) pubSub.emit(`change project name of ${projectTitle}`, element.textContent);
      // eslint-disable-next-line no-param-reassign
      else element.textContent = element.dataset.old;
    }
  });

  element.addEventListener('focusout', () => {
    if (element.contentEditable === 'true') {
      element.setAttribute('contentEditable', 'false');
      if (element.textContent) pubSub.emit(`change project name of ${projectTitle}`, element.textContent);
      // eslint-disable-next-line no-param-reassign
      else element.textContent = element.dataset.old;
    }
  });
}

export function makeProjectsEditable(container, projects) {
  projects.forEach((project) => {
    const nameContainer = [...container.getElementsByTagName('*')]
      .find((element) => element.textContent === project.title);
    if (nameContainer) makeEditable(nameContainer, project.title);
  });
}
