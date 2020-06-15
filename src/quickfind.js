// Simple quick find search box

import pubSub from './pubsub';

export default function addQuickFind(container) {
  container.classList.add('quick-find');

  const magnifyingGlass = document.createElement('img');
  magnifyingGlass.src = 'assets/mag.png';
  magnifyingGlass.alt = '';
  magnifyingGlass.classList.add('magnifying-glass');

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Quick find';
  searchInput.classList.add('search-input');

  magnifyingGlass.addEventListener('click', () => {
    const searchText = searchInput.value;
    if (searchText) pubSub.emit('execute quick find', searchText);
    magnifyingGlass.value = '';
  });

  searchInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      const searchText = searchInput.value;
      if (searchText) pubSub.emit('execute quick find', searchText);
      searchInput.value = '';
      return false; // Prevents bubbling
    }
    return true;
  });

  container.append(magnifyingGlass, searchInput);
}
